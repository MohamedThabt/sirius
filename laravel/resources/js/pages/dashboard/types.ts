export interface FastApiHealth {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    timestamp: string;
    service?: string;
    version?: string;
    error?: string;
    system?: {
        cpu_percent: number;
        memory_percent: number;
        memory_used_gb: number;
        memory_total_gb: number;
        disk_percent: number;
        disk_used_gb: number;
        disk_total_gb: number;
    };
    checks?: {
        api: boolean;
        cpu_ok: boolean;
        memory_ok: boolean;
        disk_ok: boolean;
    };
}

export interface Stats {
    // User metrics
    total_users: number;
    users_with_projects: number;
    users_this_month: number;
    users_this_week: number;

    // Project metrics
    total_projects: number;
    projects_by_status: Record<string, number>;
    projects_this_month: number;
    projects_with_prd: number;
    projects_with_erd: number;
    projects_with_c4: number;

    // Module metrics
    total_modules: number;
    modules_by_status: Record<string, number>;
    modules_with_erd: number;
    modules_with_synced_erd: number;
    modules_this_month: number;

    // Feature metrics
    total_features: number;
    features_by_status: Record<string, number>;
    features_by_priority: Record<string, number>;

    // Admin metrics
    total_admins: number;
    super_admins: number;
    regular_admins: number;

    // Beta metrics
    beta_pending: number;
    beta_approved: number;
    beta_denied: number;
    beta_total: number;

    // GitHub integration
    users_with_github: number;
    projects_with_repo: number;

    // Issue metrics
    total_issues: number;
    issues_by_status: Record<string, number>;
    issues_by_severity: Record<string, number>;
    issues_this_month: number;
    issues_this_week: number;
    open_issues: number;
    blocker_issues: number;

    // Feedback metrics
    total_feedback: number;
    feedback_by_status: Record<string, number>;
    feedback_by_type: Record<string, number>;
    feedback_this_month: number;
    feedback_this_week: number;
    new_feedback: number;

    // Usage metrics
    total_usage_logs: number;
    total_credits_used: number;
    total_tokens_used: number;
    total_cost: number;
    usage_today: number;
    usage_this_week: number;
    usage_this_month: number;
    usage_by_action_type: Array<{
        action_type: string;
        count: number;
        credits: number;
    }>;
    usage_by_model: Array<{
        model: string;
        count: number;
        credits: number;
    }>;
    recent_usage_logs: Array<{
        id: number;
        user_id: number;
        action_type: string;
        model: string | null;
        credits_used: number;
        created_at: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;

    // FastAPI Health Status
    fastapi_health: FastApiHealth;

    // Recent activity
    recent_users: Array<{
        id: number;
        name: string;
        email: string;
        avatar?: string;
        created_at: string;
    }>;
    recent_projects: Array<{
        id: number;
        name: string;
        user_id: number;
        status: string;
        created_at: string;
        updated_at: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    recent_admins: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_by?: number;
        created_at: string;
        creator?: {
            id: number;
            name: string;
        };
    }>;
    recent_beta_invitations: Array<{
        id: number;
        name: string;
        email: string;
        status: string;
        invited_by?: number;
        created_at: string;
        invited_by_admin?: {
            id: number;
            name: string;
        };
    }>;
    recent_issues: Array<{
        id: number;
        title: string;
        status: string;
        severity: string;
        user_id: number;
        created_at: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
    recent_feedback: Array<{
        id: number;
        type: string;
        message: string;
        status: string;
        user_id: number;
        created_at: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
}

export interface DashboardProps {
    stats: Stats;
}
