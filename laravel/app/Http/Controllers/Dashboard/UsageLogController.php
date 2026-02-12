<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\UsageLog;
use App\Traits\StructuredLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UsageLogController extends Controller
{
    use StructuredLogger;

    /**
     * Display a paginated list of usage logs with optional filtering.
     *
     * Supports filtering by:
     * - search: Filter by user name or email
     * - action_type: Filter by specific action type
     * - model: Filter by AI model used
     * - date_from: Filter from a specific date
     * - date_to: Filter to a specific date
     * - user_id: Filter by specific user
     *
     * @param Request $request The incoming HTTP request
     * @return Response Inertia response rendering the usage logs index page
     */
    public function index(Request $request)
    {
        try {
            $query = UsageLog::with('user:id,name,email');

            // Search filter (user name or email)
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Action type filter
            if ($request->filled('action_type')) {
                $query->where('action_type', $request->action_type);
            }

            // AI Model filter
            if ($request->filled('model')) {
                $query->where('model', $request->model);
            }

            // Date from filter
            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            // Date to filter
            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // User ID filter (for linking from user show page)
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            $perPage = in_array((int) $request->input('per_page'), [10, 25, 50, 100]) ? (int) $request->input('per_page') : 10;

            $logs = $query->latest('created_at')->paginate($perPage)->withQueryString();

            // Get distinct action types for filter dropdown
            $actionTypes = UsageLog::distinct()
                ->whereNotNull('action_type')
                ->pluck('action_type')
                ->sort()
                ->values()
                ->map(fn($type) => [
                    'value' => $type,
                    'label' => $this->formatActionType($type),
                ])
                ->toArray();

            // Get distinct AI models for filter dropdown
            $models = UsageLog::distinct()
                ->whereNotNull('model')
                ->where('model', '!=', '')
                ->pluck('model')
                ->sort()
                ->values()
                ->map(fn($model) => [
                    'value' => $model,
                    'label' => $model,
                ])
                ->toArray();

            // Summary stats
            $summary = [
                'total_logs' => UsageLog::count(),
                'total_credits' => UsageLog::where('credits_used', '>', 0)->sum('credits_used'),
                'total_tokens' => UsageLog::sum('input_tokens') + UsageLog::sum('output_tokens'),
                'total_cost' => number_format(UsageLog::sum('cost'), 4),
                'today_credits' => UsageLog::whereDate('created_at', today())->sum('credits_used'),
                'this_week_credits' => UsageLog::where('created_at', '>=', now()->startOfWeek())->sum('credits_used'),
                'this_month_credits' => UsageLog::where('created_at', '>=', now()->startOfMonth())->sum('credits_used'),
            ];

            return Inertia::render('dashboard/usage-logs/index', [
                'logs' => $logs,
                'filters' => $request->only(['search', 'action_type', 'model', 'date_from', 'date_to', 'user_id', 'per_page']),
                'actionTypes' => $actionTypes,
                'models' => $models,
                'summary' => $summary,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'index']);
            return back()->with('error', 'Failed to load usage logs. Please try again.');
        }
    }

    /**
     * Display detailed information about a specific usage log.
     *
     * @param UsageLog $usageLog The usage log to display
     * @return Response Inertia response rendering the usage log show page
     */
    public function show(UsageLog $usageLog)
    {
        try {
            $usageLog->load('user:id,name,email,avatar');

            return Inertia::render('dashboard/usage-logs/show', [
                'log' => $usageLog,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'show', 'usage_log_id' => $usageLog->id]);
            return back()->with('error', 'Failed to load usage log details. Please try again.');
        }
    }

    /**
     * Format an action type string to a human-readable label.
     *
     * @param string $actionType The action type to format
     * @return string The formatted label
     */
    private function formatActionType(string $actionType): string
    {
        return ucwords(str_replace('_', ' ', $actionType));
    }
}
