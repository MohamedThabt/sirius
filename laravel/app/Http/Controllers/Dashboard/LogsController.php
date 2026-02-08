<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Traits\StructuredLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class LogsController extends Controller
{
    use StructuredLogger;

    /**
     * FastAPI base URL for log endpoints.
     */
    private function getBaseUrl(): string
    {
        return config('app.fastapi_base_url', 'http://127.0.0.1:8005');
    }

    /**
     * Display the logs dashboard page with paginated logs.
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the logs page
     */
    public function index(Request $request): Response
    {
        try {
            // Get log stats
            $stats = $this->fetchLogStats();

            // Get paginated logs
            $logsData = $this->fetchLogs($request);

            return Inertia::render('dashboard/fastApiLogs/index', [
                'stats' => $stats,
                'logs' => $logsData,
                'filters' => $request->only(['log_type', 'level', 'search', 'page', 'per_page']),
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.index']);

            return Inertia::render('dashboard/fastApiLogs/index', [
                'stats' => null,
                'logs' => null,
                'filters' => $request->only(['log_type', 'level', 'search', 'page', 'per_page']),
                'error' => 'Failed to load log data.',
            ]);
        }
    }

    /**
     * Display a specific log entry.
     *
     * @param Request $request
     * @param string $logType
     * @param int $lineNumber
     * @return Response
     */
    public function show(Request $request, string $logType, int $lineNumber): Response
    {
        try {
            if (!in_array($logType, ['app', 'error'])) {
                abort(404, 'Invalid log type.');
            }

            // Fetch the specific log entry
            $logEntry = $this->fetchLogByLine($logType, $lineNumber);

            if (!$logEntry) {
                abort(404, 'Log entry not found.');
            }

            return Inertia::render('dashboard/fastApiLogs/show', [
                'log' => $logEntry,
                'log_type' => $logType,
                'filters' => $request->only(['log_type', 'level', 'search', 'page']),
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.show', 'log_type' => $logType, 'line_number' => $lineNumber]);

            abort(500, 'Failed to load log entry.');
        }
    }

    /**
     * Clear logs and redirect back with status.
     *
     * @param Request $request
     * @return RedirectResponse Redirect back with success or error message
     */
    public function clearLogs(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'log_type' => 'sometimes|nullable|string|in:app,error',
            ]);

            $queryParams = [];
            if (!empty($validated['log_type'])) {
                $queryParams['log_type'] = $validated['log_type'];
            }

            $response = Http::fastapi()->timeout(10)
                ->delete($this->getBaseUrl() . '/v1/logs/clear', $queryParams);

            if ($response->successful()) {
                $this->logInfo('Logs cleared successfully', [
                    'log_type' => $validated['log_type'] ?? 'all',
                ]);

                return back()->with('success', 'Logs cleared successfully.');
            }

            $this->logWarning('Failed to clear logs via FastAPI', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return back()->with('error', 'Failed to clear logs.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.clearLogs']);

            return back()->with('error', 'Failed to clear logs: ' . $e->getMessage());
        }
    }

    /**
     * Download log file.
     *
     * @param string $logType
     * @return \Illuminate\Http\Response|RedirectResponse
     */
    public function downloadLog(string $logType): \Illuminate\Http\Response|RedirectResponse
    {
        try {
            if (!in_array($logType, ['app', 'error'])) {
                return back()->with('error', 'Invalid log type.');
            }

            $response = Http::fastapi()->timeout(30)
                ->get($this->getBaseUrl() . '/v1/logs/download/' . $logType);

            if ($response->successful()) {
                $filename = "{$logType}_log_" . now()->format('Ymd_His') . '.log';

                return response($response->body(), 200, [
                    'Content-Type' => 'text/plain',
                    'Content-Disposition' => "attachment; filename={$filename}",
                ]);
            }

            return back()->with('error', 'Failed to download log file.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.downloadLog', 'log_type' => $logType]);

            return back()->with('error', 'Failed to download log file: ' . $e->getMessage());
        }
    }

    /**
     * Fetch logs from FastAPI.
     *
     * @param Request $request
     * @return array|null
     */
    private function fetchLogs(Request $request): ?array
    {
        try {
            $queryParams = [
                'log_type' => $request->input('log_type', 'app'),
                'page' => $request->input('page', 1),
                'per_page' => $request->input('per_page', 50),
            ];

            if ($request->filled('level')) {
                $queryParams['level'] = $request->input('level');
            }

            if ($request->filled('search')) {
                $queryParams['search'] = $request->input('search');
            }

            $response = Http::fastapi()->timeout(10)
                ->get($this->getBaseUrl() . '/v1/logs', $queryParams);

            if ($response->successful()) {
                return $response->json();
            }

            $this->logWarning('Failed to fetch logs from FastAPI', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'fetchLogs']);
            return null;
        }
    }

    /**
     * Fetch log statistics from FastAPI.
     *
     * @return array|null
     */
    private function fetchLogStats(): ?array
    {
        try {
            $response = Http::fastapi()->timeout(10)
                ->get($this->getBaseUrl() . '/v1/logs/stats');

            if ($response->successful()) {
                return $response->json();
            }

            $this->logWarning('Failed to fetch log stats from FastAPI', [
                'status' => $response->status(),
            ]);

            return null;
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'fetchLogStats']);
            return null;
        }
    }

    /**
     * Fetch a specific log entry by line number from FastAPI.
     *
     * @param string $logType
     * @param int $lineNumber
     * @return array|null
     */
    private function fetchLogByLine(string $logType, int $lineNumber): ?array
    {
        try {
            // Fetch logs with search for the specific line number
            $response = Http::fastapi()->timeout(10)
                ->get($this->getBaseUrl() . '/v1/logs', [
                    'log_type' => $logType,
                    'page' => 1,
                    'per_page' => 100, // Get enough entries around the target
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $entries = $data['entries'] ?? [];
                
                // Find the entry with the matching line number
                foreach ($entries as $entry) {
                    if (isset($entry['line_number']) && $entry['line_number'] == $lineNumber) {
                        return $entry;
                    }
                }
            }

            $this->logWarning('Failed to fetch log entry from FastAPI', [
                'status' => $response->status(),
                'log_type' => $logType,
                'line_number' => $lineNumber,
            ]);

            return null;
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'fetchLogByLine', 'log_type' => $logType, 'line_number' => $lineNumber]);
            return null;
        }
    }
}
