<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class LaravelLogsController extends Controller
{
    use StructuredLogger;

    /**
     * Get the path to the Laravel logs directory.
     */
    private function getLogsPath(): string
    {
        return storage_path('logs');
    }

    /**
     * Display the logs dashboard page with paginated logs.
     */
    public function index(Request $request): Response
    {
        try {
            $stats = $this->getLogStats();
            $logsData = $this->fetchLogs($request);

            return Inertia::render('dashboard/laravelLogs/index', [
                'stats' => $stats,
                'logs' => $logsData,
                'filters' => $request->only(['log_file', 'level', 'search', 'page', 'per_page']),
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'laravel-logs.index']);

            return Inertia::render('dashboard/laravelLogs/index', [
                'stats' => null,
                'logs' => null,
                'filters' => $request->only(['log_file', 'level', 'search', 'page', 'per_page']),
                'error' => 'Failed to load log data: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Clear logs and redirect back with status.
     */
    public function clearLogs(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'log_file' => 'sometimes|nullable|string',
        ]);

        try {

            $logsPath = $this->getLogsPath();
            $logFile = $validated['log_file'] ?? null;

            if ($logFile) {
                // Clear specific log file
                $filePath = $logsPath . '/' . basename($logFile);
                if (File::exists($filePath) && str_ends_with($filePath, '.log')) {
                    File::put($filePath, '');
                    $this->logInfo('Laravel log file cleared', ['log_file' => $logFile]);
                    return back()->with('success', "Log file '{$logFile}' cleared successfully.");
                }
                return back()->with('error', 'Log file not found.');
            }

            // Clear all log files
            $files = File::glob($logsPath . '/*.log');
            foreach ($files as $file) {
                File::put($file, '');
            }

            $this->logInfo('All Laravel log files cleared');
            return back()->with('success', 'All log files cleared successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'laravel-logs.clearLogs']);
            return back()->with('error', 'Failed to clear logs: ' . $e->getMessage());
        }
    }

    /**
     * Download log file.
     */
    public function downloadLog(string $logFile): \Symfony\Component\HttpFoundation\BinaryFileResponse|RedirectResponse
    {
        try {
            $filePath = $this->getLogsPath() . '/' . basename($logFile);

            if (!File::exists($filePath) || !str_ends_with($filePath, '.log')) {
                return back()->with('error', 'Log file not found.');
            }

            $filename = basename($logFile, '.log') . '_' . now()->format('Ymd_His') . '.log';

            return response()->download($filePath, $filename, [
                'Content-Type' => 'text/plain',
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'laravel-logs.downloadLog', 'log_file' => $logFile]);
            return back()->with('error', 'Failed to download log file: ' . $e->getMessage());
        }
    }

    /**
     * Get statistics for all log files.
     */
    private function getLogStats(): array
    {
        $logsPath = $this->getLogsPath();
        $files = File::glob($logsPath . '/*.log');

        $logFiles = [];
        $totalSize = 0;
        $totalEntries = 0;
        $totalErrors = 0;
        $totalWarnings = 0;
        $totalCritical = 0;

        foreach ($files as $filePath) {
            $fileName = basename($filePath);
            $size = File::size($filePath);
            $totalSize += $size;

            $content = File::get($filePath);
            $lines = explode("\n", $content);
            $lineCount = count(array_filter($lines, fn($line) => trim($line) !== ''));
            $totalEntries += $lineCount;

            // Count log levels based on file type
            $isJsonLog = str_starts_with($fileName, 'laravel-json');
            $levelCounts = $isJsonLog ? $this->countJsonLogLevels($content) : $this->countLogLevels($content);
            $totalErrors += $levelCounts['ERROR'] ?? 0;
            $totalWarnings += $levelCounts['WARNING'] ?? 0;
            $totalCritical += $levelCounts['CRITICAL'] ?? 0;

            $logFiles[] = [
                'name' => $fileName,
                'category' => $this->categorizeLogFile($fileName),
                'size_bytes' => $size,
                'size_human' => $this->formatBytes($size),
                'line_count' => $lineCount,
                'last_modified' => File::lastModified($filePath),
                'level_counts' => $levelCounts,
            ];
        }

        usort($logFiles, fn ($a, $b) => $b['last_modified'] <=> $a['last_modified']);

        return [
            'log_files' => $logFiles,
            'summary' => [
                'total_log_files' => count($logFiles),
                'total_size_bytes' => $totalSize,
                'total_size_human' => $this->formatBytes($totalSize),
                'total_entries' => $totalEntries,
                'total_errors' => $totalErrors,
                'total_warnings' => $totalWarnings,
                'total_critical' => $totalCritical,
            ],
        ];
    }

    /**
     * Fetch and parse logs from a specific file.
     */
    private function fetchLogs(Request $request): ?array
    {
        try {
            $logsPath = $this->getLogsPath();
            $logFile = $request->input('log_file', 'laravel.log');
            $page = (int) $request->input('page', 1);
            $perPage = (int) $request->input('per_page', 50);
            $levelFilter = $request->input('level');
            $search = $request->input('search');

            $filePath = $logsPath . '/' . basename($logFile);

            if (!File::exists($filePath)) {
                return [
                    'log_file' => $logFile,
                    'entries' => [],
                    'meta' => [
                        'current_page' => 1,
                        'per_page' => $perPage,
                        'total_entries' => 0,
                        'total_pages' => 0,
                        'has_next' => false,
                        'has_previous' => false,
                    ],
                ];
            }

            $content = File::get($filePath);
            
            // Detect if this is a JSON log file and use appropriate parser
            $isJsonLog = str_starts_with(basename($logFile), 'laravel-json');
            $entries = $isJsonLog ? $this->parseJsonLogEntries($content) : $this->parseLogEntries($content);

            // Filter by level
            if ($levelFilter) {
                $entries = array_filter($entries, fn($entry) => 
                    strtoupper($entry['level']) === strtoupper($levelFilter)
                );
            }

            // Filter by search
            if ($search) {
                $searchLower = strtolower($search);
                $entries = array_filter($entries, fn($entry) => 
                    str_contains(strtolower($entry['message']), $searchLower) ||
                    str_contains(strtolower($entry['context'] ?? ''), $searchLower)
                );
            }

            // Re-index array after filtering
            $entries = array_values($entries);

            // Reverse to show newest first
            $entries = array_reverse($entries);

            // Pagination
            $totalEntries = count($entries);
            $totalPages = (int) ceil($totalEntries / $perPage);
            $offset = ($page - 1) * $perPage;
            $paginatedEntries = array_slice($entries, $offset, $perPage);

            return [
                'log_file' => $logFile,
                'entries' => $paginatedEntries,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total_entries' => $totalEntries,
                    'total_pages' => $totalPages,
                    'has_next' => $page < $totalPages,
                    'has_previous' => $page > 1,
                ],
            ];
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'fetchLogs']);
            return null;
        }
    }

    /**
     * Parse Laravel log file content into structured entries.
     * Supports both standard Laravel format and JSON format (laravel-json.log).
     */
    private function parseLogEntries(string $content): array
    {
        $entries = [];
        $lines = explode("\n", $content);
        $currentEntry = null;
        $lineNumber = 0;

        // Laravel log format: [YYYY-MM-DD HH:MM:SS] environment.LEVEL: message
        $pattern = '/^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s+(\w+)\.(\w+):\s+(.*)$/';

        foreach ($lines as $line) {
            $lineNumber++;
            $line = trim($line);

            if (empty($line)) {
                continue;
            }

            if (preg_match($pattern, $line, $matches)) {
                // Save previous entry
                if ($currentEntry !== null) {
                    $entries[] = $currentEntry;
                }

                // Start new entry
                $currentEntry = [
                    'timestamp' => $matches[1],
                    'environment' => $matches[2],
                    'level' => strtoupper($matches[3]),
                    'message' => $matches[4],
                    'context' => '',
                    'line_number' => $lineNumber,
                ];
            } elseif ($currentEntry !== null) {
                // Append to current entry's context (stack trace, etc.)
                $currentEntry['context'] .= ($currentEntry['context'] ? "\n" : '') . $line;
            }
        }

        // Don't forget the last entry
        if ($currentEntry !== null) {
            $entries[] = $currentEntry;
        }

        return $entries;
    }

    /**
     * Parse JSON log file content (one JSON object per line).
     */
    private function parseJsonLogEntries(string $content): array
    {
        $entries = [];
        $lines = explode("\n", $content);
        $lineNumber = 0;

        foreach ($lines as $line) {
            $lineNumber++;
            $line = trim($line);

            if (empty($line)) {
                continue;
            }

            try {
                $decoded = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
                
                // Extract standard fields from JSON log
                $timestamp = $decoded['datetime'] ?? $decoded['timestamp'] ?? date('Y-m-d H:i:s');
                $level = strtoupper($decoded['level_name'] ?? $decoded['level'] ?? 'INFO');
                $message = $decoded['message'] ?? '';
                $environment = $decoded['context']['environment'] ?? config('app.env', 'production');
                
                // Remove standard fields from context to avoid duplication
                unset($decoded['datetime'], $decoded['timestamp'], $decoded['level_name'], $decoded['level'], $decoded['message'], $decoded['channel']);
                
                // Format remaining JSON as context
                $contextJson = json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                
                $entries[] = [
                    'timestamp' => $timestamp,
                    'environment' => $environment,
                    'level' => $level,
                    'message' => $message,
                    'context' => $contextJson,
                    'line_number' => $lineNumber,
                    'is_json' => true, // Flag to help UI render differently if needed
                ];
            } catch (\JsonException $e) {
                // If line is not valid JSON, treat as a regular line
                $entries[] = [
                    'timestamp' => date('Y-m-d H:i:s'),
                    'environment' => 'unknown',
                    'level' => 'UNKNOWN',
                    'message' => $line,
                    'context' => '',
                    'line_number' => $lineNumber,
                ];
            }
        }

        return $entries;
    }

    private function categorizeLogFile(string $fileName): string
    {
        return match (true) {
            str_starts_with($fileName, 'security') => 'Security',
            str_starts_with($fileName, 'laravel-json') => 'JSON',
            str_starts_with($fileName, 'laravel') => 'Application',
            default => 'Other',
        };
    }

    /**
     * Count log levels in content.
     */
    private function countLogLevels(string $content): array
    {
        $levels = [
            'DEBUG' => 0,
            'INFO' => 0,
            'NOTICE' => 0,
            'WARNING' => 0,
            'ERROR' => 0,
            'CRITICAL' => 0,
            'ALERT' => 0,
            'EMERGENCY' => 0,
        ];

        foreach ($levels as $level => $count) {
            $levels[$level] = preg_match_all('/\.\s*' . $level . ':/i', $content);
        }

        return $levels;
    }

    /**
     * Count log levels in JSON log content.
     */
    private function countJsonLogLevels(string $content): array
    {
        $levels = [
            'DEBUG' => 0,
            'INFO' => 0,
            'NOTICE' => 0,
            'WARNING' => 0,
            'ERROR' => 0,
            'CRITICAL' => 0,
            'ALERT' => 0,
            'EMERGENCY' => 0,
        ];

        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }

            try {
                $decoded = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
                $level = strtoupper($decoded['level_name'] ?? $decoded['level'] ?? '');
                if (isset($levels[$level])) {
                    $levels[$level]++;
                }
            } catch (\JsonException $e) {
                // Skip invalid JSON lines
            }
        }

        return $levels;
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
