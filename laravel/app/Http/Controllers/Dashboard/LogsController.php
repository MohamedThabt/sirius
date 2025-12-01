<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Traits\StructuredLogger;
use Illuminate\Http\JsonResponse;
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
     * Display the logs dashboard page.
     *
     * @return Response Inertia response rendering the logs page
     */
    public function index(): Response
    {
        try {
            // Get initial log stats
            $stats = $this->fetchLogStats();

            return Inertia::render('dashboard/logs/index', [
                'initialStats' => $stats,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.index']);

            return Inertia::render('dashboard/logs/index', [
                'initialStats' => null,
                'error' => 'Failed to load log statistics.',
            ]);
        }
    }

    /**
     * Get paginated logs via API.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getLogs(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'log_type' => 'sometimes|string|in:app,error',
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:100',
                'level' => 'sometimes|nullable|string|in:DEBUG,INFO,WARNING,ERROR,CRITICAL',
                'search' => 'sometimes|nullable|string|max:255',
            ]);

            $queryParams = [
                'log_type' => $validated['log_type'] ?? 'app',
                'page' => $validated['page'] ?? 1,
                'per_page' => $validated['per_page'] ?? 50,
            ];

            if (!empty($validated['level'])) {
                $queryParams['level'] = $validated['level'];
            }

            if (!empty($validated['search'])) {
                $queryParams['search'] = $validated['search'];
            }

            $response = Http::timeout(10)
                ->get($this->getBaseUrl() . '/v1/logs', $queryParams);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            $this->logWarning('Failed to fetch logs from FastAPI', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'error' => 'Failed to fetch logs from FastAPI service',
                'status' => $response->status(),
            ], 500);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.getLogs']);

            return response()->json([
                'error' => 'Failed to fetch logs',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get log statistics.
     *
     * @return JsonResponse
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = $this->fetchLogStats();

            if ($stats) {
                return response()->json($stats);
            }

            return response()->json([
                'error' => 'Failed to fetch log statistics',
            ], 500);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.getStats']);

            return response()->json([
                'error' => 'Failed to fetch log statistics',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear logs.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearLogs(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'log_type' => 'sometimes|nullable|string|in:app,error',
            ]);

            $queryParams = [];
            if (!empty($validated['log_type'])) {
                $queryParams['log_type'] = $validated['log_type'];
            }

            $response = Http::timeout(10)
                ->delete($this->getBaseUrl() . '/v1/logs/clear', $queryParams);

            if ($response->successful()) {
                $this->logInfo('Logs cleared successfully', [
                    'log_type' => $validated['log_type'] ?? 'all',
                ]);

                return response()->json($response->json());
            }

            $this->logWarning('Failed to clear logs via FastAPI', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return response()->json([
                'error' => 'Failed to clear logs',
                'status' => $response->status(),
            ], 500);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.clearLogs']);

            return response()->json([
                'error' => 'Failed to clear logs',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download log file.
     *
     * @param string $logType
     * @return \Illuminate\Http\Response|JsonResponse
     */
    public function downloadLog(string $logType)
    {
        try {
            if (!in_array($logType, ['app', 'error'])) {
                return response()->json([
                    'error' => 'Invalid log type',
                ], 400);
            }

            $response = Http::timeout(30)
                ->get($this->getBaseUrl() . '/v1/logs/download/' . $logType);

            if ($response->successful()) {
                $filename = "{$logType}_log_" . now()->format('Ymd_His') . '.log';

                return response($response->body(), 200, [
                    'Content-Type' => 'text/plain',
                    'Content-Disposition' => "attachment; filename={$filename}",
                ]);
            }

            return response()->json([
                'error' => 'Failed to download log file',
                'status' => $response->status(),
            ], 500);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'logs.downloadLog', 'log_type' => $logType]);

            return response()->json([
                'error' => 'Failed to download log file',
                'message' => $e->getMessage(),
            ], 500);
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
            $response = Http::timeout(10)
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
}
