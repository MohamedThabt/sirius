<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\GithubToken;
use App\Models\Project;
use App\Models\ProjectRepository;
use App\Services\Github\GithubClient;
use App\Services\Github\RepoBootstrapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GithubController extends Controller
{
    /**
     * Ensure user has GitHub authentication.
     * If not authenticated or token expired, redirect to OAuth.
     */
    public function ensureAuth(Project $project): JsonResponse|RedirectResponse
    {
        Log::info('GitHub auth check initiated', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'project_name' => $project->name,
        ]);

        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            Log::warning('GitHub auth check failed - unauthorized', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_owner_id' => $project->user_id,
            ]);
            abort(403);
        }

        $token = auth()->user()->githubToken;

        if (! $token || $token->isExpired()) {
            Log::info('GitHub token missing or expired, redirecting to OAuth', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'has_token' => ! is_null($token),
                'is_expired' => $token ? $token->isExpired() : null,
                'expires_at' => $token?->expires_at,
            ]);

            // Store the project ID in session to return after OAuth
            session(['github_oauth_return_project' => $project->id]);

            return redirect()->route('github.redirect');
        }

        Log::info('GitHub auth check successful', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'github_username' => $token->username,
        ]);

        return response()->json([
            'authenticated' => true,
            'username' => $token->username,
            'avatar' => $token->avatar,
        ]);
    }

    /**
     * Redirect to GitHub OAuth.
     */
    public function redirect(): RedirectResponse
    {
        Log::info('Initiating GitHub OAuth redirect', [
            'user_id' => auth()->id(),
            'scopes' => ['repo', 'delete_repo', 'read:org'],
            'redirect_uri' => config('services.github.redirect'),
        ]);

        return Socialite::driver('github')
            ->scopes(['repo', 'delete_repo', 'read:org'])
            ->redirect();
    }

    /**
     * Handle GitHub OAuth callback.
     */
    public function callback(Request $request): RedirectResponse
    {
        Log::info('GitHub OAuth callback received', [
            'user_id' => auth()->id(),
            'has_code' => $request->has('code'),
            'has_state' => $request->has('state'),
            'has_error' => $request->has('error'),
            'error' => $request->get('error'),
            'error_description' => $request->get('error_description'),
        ]);

        try {
            $githubUser = Socialite::driver('github')->user();

            Log::info('GitHub user data retrieved', [
                'user_id' => auth()->id(),
                'github_id' => $githubUser->id,
                'github_username' => $githubUser->nickname,
                'approved_scopes' => $githubUser->approvedScopes ?? [],
                'has_token' => ! empty($githubUser->token),
                'has_refresh_token' => ! empty($githubUser->refreshToken),
                'expires_in' => $githubUser->expiresIn ?? null,
            ]);

            $token = GithubToken::updateOrCreate(
                ['user_id' => auth()->id()],
                [
                    'access_token' => $githubUser->token,
                    'refresh_token' => $githubUser->refreshToken ?? null,
                    'token_type' => 'bearer',
                    'scope' => implode(',', $githubUser->approvedScopes ?? ['repo', 'delete_repo', 'read:org']),
                    'provider_user_id' => (string) $githubUser->id,
                    'username' => $githubUser->nickname,
                    'avatar' => $githubUser->avatar,
                    'expires_at' => isset($githubUser->expiresIn) ? now()->addSeconds($githubUser->expiresIn) : null,
                ]
            );

            Log::info('GitHub token stored successfully', [
                'user_id' => auth()->id(),
                'github_username' => $githubUser->nickname,
                'token_id' => $token->id,
                'scopes' => $token->scope,
                'expires_at' => $token->expires_at,
            ]);

            // Redirect back to the project if stored in session
            $projectId = session()->get('github_oauth_return_project');

            if ($projectId) {
                session()->forget('github_oauth_return_project');
                $project = Project::find($projectId);

                if ($project && $project->user_id === auth()->id()) {
                    Log::info('Redirecting to project after GitHub OAuth', [
                        'user_id' => auth()->id(),
                        'project_id' => $project->id,
                    ]);

                    return redirect("/projects/{$project->id}")
                        ->with('success', 'GitHub connected successfully!');
                }

                Log::warning('Project not found or unauthorized after GitHub OAuth', [
                    'user_id' => auth()->id(),
                    'project_id' => $projectId,
                    'project_exists' => ! is_null($project),
                    'project_owner_id' => $project?->user_id,
                ]);
            }

            Log::info('Redirecting to projects index after GitHub OAuth', [
                'user_id' => auth()->id(),
            ]);

            return redirect()->route('projects.index')
                ->with('success', 'GitHub connected successfully!');
        } catch (\Exception $e) {
            Log::error('GitHub OAuth callback failed', [
                'user_id' => auth()->id(),
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
                'request_data' => [
                    'code' => $request->get('code') ? 'present' : 'missing',
                    'state' => $request->get('state') ? 'present' : 'missing',
                    'error' => $request->get('error'),
                ],
            ]);

            return redirect()->route('projects.index')
                ->with('error', 'Failed to connect GitHub. Please try again.');
        }
    }

    /**
     * List available repositories (user + organizations).
     */
    public function listRepos(Project $project): JsonResponse
    {
        Log::info('Listing GitHub repositories', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
        ]);

        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            Log::warning('Unauthorized attempt to list repositories', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_owner_id' => $project->user_id,
            ]);
            abort(403);
        }

        $token = auth()->user()->githubToken;

        if (! $token || $token->isExpired()) {
            Log::warning('GitHub token missing or expired for repo listing', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'has_token' => ! is_null($token),
                'is_expired' => $token ? $token->isExpired() : null,
            ]);

            return response()->json([
                'error' => 'GitHub authentication required',
            ], 401);
        }

        try {
            $client = new GithubClient($token);

            Log::info('Fetching GitHub user info', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
            ]);

            // Get user info
            $user = $client->getUser();

            Log::info('Fetching user repositories', [
                'user_id' => auth()->id(),
                'github_username' => $user['login'] ?? $token->username,
            ]);

            // Get user repositories
            $userRepos = $client->listUserRepos();

            Log::info('Fetching organizations', [
                'user_id' => auth()->id(),
            ]);

            // Get organizations
            $orgs = $client->getOrgs();

            Log::info('Organizations retrieved', [
                'user_id' => auth()->id(),
                'org_count' => count($orgs),
                'org_names' => array_column($orgs, 'login'),
            ]);

            // Get org repositories
            $orgRepos = [];
            foreach ($orgs as $org) {
                Log::info('Fetching repositories for organization', [
                    'user_id' => auth()->id(),
                    'org_login' => $org['login'],
                ]);

                $repos = $client->listOrgRepos($org['login']);
                $orgRepos[$org['login']] = [
                    'org' => $org,
                    'repos' => $repos,
                ];

                Log::info('Organization repositories retrieved', [
                    'user_id' => auth()->id(),
                    'org_login' => $org['login'],
                    'repo_count' => count($repos),
                ]);
            }

            Log::info('GitHub repositories listed successfully', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'user_repos_count' => count($userRepos),
                'organizations_count' => count($orgRepos),
                'total_org_repos' => array_sum(array_map(fn ($org) => count($org['repos']), $orgRepos)),
            ]);

            return response()->json([
                'user' => [
                    'login' => $user['login'] ?? $token->username,
                    'avatar' => $user['avatar_url'] ?? $token->avatar,
                ],
                'userRepos' => $userRepos,
                'organizations' => $orgRepos,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to list GitHub repositories', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to fetch repositories',
            ], 500);
        }
    }

    /**
     * Create a new repository on GitHub.
     */
    public function createRepo(Request $request, Project $project): JsonResponse
    {
        Log::info('Creating GitHub repository', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'request_data' => $request->only(['name', 'visibility', 'owner_type', 'owner_login']),
        ]);

        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            Log::warning('Unauthorized attempt to create repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_owner_id' => $project->user_id,
            ]);
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'visibility' => 'required|in:public,private',
            'owner_type' => 'required|in:user,org',
            'owner_login' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $token = auth()->user()->githubToken;

        if (! $token || $token->isExpired()) {
            Log::warning('GitHub token missing or expired for repo creation', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'has_token' => ! is_null($token),
                'is_expired' => $token ? $token->isExpired() : null,
            ]);

            return response()->json([
                'error' => 'GitHub authentication required',
            ], 401);
        }

        try {
            $client = new GithubClient($token);

            // Create repository
            $isPrivate = $validated['visibility'] === 'private';

            Log::info('Calling GitHub API to create repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_name' => $validated['name'],
                'owner_type' => $validated['owner_type'],
                'owner_login' => $validated['owner_login'],
                'is_private' => $isPrivate,
            ]);

            if ($validated['owner_type'] === 'user') {
                $repo = $client->createUserRepo(
                    $validated['name'],
                    $isPrivate,
                    $validated['description'] ?? "Repository for {$project->name}"
                );
            } else {
                $repo = $client->createOrgRepo(
                    $validated['owner_login'],
                    $validated['name'],
                    $isPrivate,
                    $validated['description'] ?? "Repository for {$project->name}"
                );
            }

            if (! $repo) {
                $errorMessage = $client->getLastErrorMessage() ?? 'Failed to create repository';
                $errorDetails = $client->getLastError();

                Log::error('GitHub API returned null for repository creation', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_name' => $validated['name'],
                    'owner_login' => $validated['owner_login'],
                    'github_error' => $errorMessage,
                    'github_error_details' => $errorDetails,
                ]);

                return response()->json([
                    'error' => $errorMessage,
                    'details' => $errorDetails,
                ], $errorDetails['status'] ?? 500);
            }

            Log::info('GitHub repository created via API', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_id' => $repo['id'],
                'repo_full_name' => $repo['full_name'],
                'repo_url' => $repo['html_url'],
            ]);

            // Store repository information
            $projectRepo = ProjectRepository::updateOrCreate(
                ['project_id' => $project->id],
                [
                    'provider' => 'github',
                    'repo_id' => (string) $repo['id'],
                    'name' => $repo['name'],
                    'full_name' => $repo['full_name'],
                    'owner_login' => $validated['owner_login'],
                    'owner_type' => $validated['owner_type'],
                    'default_branch' => $repo['default_branch'] ?? 'main',
                    'html_url' => $repo['html_url'],
                    'ssh_url' => $repo['ssh_url'],
                    'visibility' => $validated['visibility'],
                ]
            );

            Log::info('GitHub repository created and linked successfully', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_repo_id' => $projectRepo->id,
                'repo_full_name' => $repo['full_name'],
                'default_branch' => $projectRepo->default_branch,
            ]);

            return response()->json([
                'success' => true,
                'repository' => $projectRepo,
                'message' => 'Repository created successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create GitHub repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_name' => $validated['name'] ?? null,
                'owner_login' => $validated['owner_login'] ?? null,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to create repository: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Link an existing repository to the project.
     */
    public function linkExistingRepo(Request $request, Project $project): JsonResponse
    {
        Log::info('Linking existing GitHub repository', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'repo_full_name' => $request->get('full_name'),
        ]);

        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            Log::warning('Unauthorized attempt to link repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_owner_id' => $project->user_id,
            ]);
            abort(403);
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:200',
        ]);

        $token = auth()->user()->githubToken;

        if (! $token || $token->isExpired()) {
            Log::warning('GitHub token missing or expired for repo linking', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'has_token' => ! is_null($token),
                'is_expired' => $token ? $token->isExpired() : null,
            ]);

            return response()->json([
                'error' => 'GitHub authentication required',
            ], 401);
        }

        try {
            $client = new GithubClient($token);

            Log::info('Fetching repository information from GitHub', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $validated['full_name'],
            ]);

            // Get repository information
            $repo = $client->getRepo($validated['full_name']);

            if (! $repo) {
                Log::warning('GitHub repository not found or not accessible', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $validated['full_name'],
                ]);

                return response()->json([
                    'error' => 'Repository not found',
                ], 404);
            }

            // Extract owner info
            $ownerLogin = $repo['owner']['login'];
            $ownerType = $repo['owner']['type'] === 'Organization' ? 'org' : 'user';

            Log::info('Repository retrieved from GitHub', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_id' => $repo['id'],
                'repo_full_name' => $repo['full_name'],
                'owner_login' => $ownerLogin,
                'owner_type' => $ownerType,
                'is_private' => $repo['private'] ?? false,
                'default_branch' => $repo['default_branch'] ?? 'main',
            ]);

            // Store repository information
            $projectRepo = ProjectRepository::updateOrCreate(
                ['project_id' => $project->id],
                [
                    'provider' => 'github',
                    'repo_id' => (string) $repo['id'],
                    'name' => $repo['name'],
                    'full_name' => $repo['full_name'],
                    'owner_login' => $ownerLogin,
                    'owner_type' => $ownerType,
                    'default_branch' => $repo['default_branch'] ?? 'main',
                    'html_url' => $repo['html_url'],
                    'ssh_url' => $repo['ssh_url'],
                    'visibility' => $repo['private'] ? 'private' : 'public',
                ]
            );

            Log::info('Checking if repository is empty', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $validated['full_name'],
            ]);

            // Check if repo is empty and can be bootstrapped
            $isEmpty = $client->isRepoEmpty($validated['full_name']);

            Log::info('GitHub repository linked successfully', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_repo_id' => $projectRepo->id,
                'repo_full_name' => $repo['full_name'],
                'is_empty' => $isEmpty,
            ]);

            return response()->json([
                'success' => true,
                'repository' => $projectRepo,
                'is_empty' => $isEmpty,
                'message' => 'Repository linked successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to link GitHub repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $validated['full_name'] ?? null,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to link repository: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Push initial commit to the repository.
     */
    public function pushInitial(Project $project): JsonResponse
    {
        Log::info('Initiating push to GitHub repository', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'project_name' => $project->name,
        ]);

        // Ensure user owns the project
        if ($project->user_id !== auth()->id()) {
            Log::warning('Unauthorized attempt to push to repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_owner_id' => $project->user_id,
            ]);
            abort(403);
        }

        $repository = $project->repository;

        if (! $repository) {
            Log::warning('No repository linked for push attempt', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
            ]);

            return response()->json([
                'error' => 'No repository linked to this project',
            ], 404);
        }

        $token = auth()->user()->githubToken;

        if (! $token || $token->isExpired()) {
            Log::warning('GitHub token missing or expired for push', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
                'has_token' => ! is_null($token),
                'is_expired' => $token ? $token->isExpired() : null,
            ]);

            return response()->json([
                'error' => 'GitHub authentication required',
            ], 401);
        }

        try {
            $client = new GithubClient($token);
            $bootstrapService = new RepoBootstrapService($client, $repository);

            Log::info('Starting bootstrap process', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
                'repo_id' => $repository->id,
                'default_branch' => $repository->default_branch,
            ]);

            $success = $bootstrapService->pushInitialCommit();

            if ($success) {
                Log::info('Bootstrap completed successfully', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Files have been successfully uploaded to the repository.',
                ]);
            } else {
                Log::warning('Bootstrap process returned false', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                ]);

                return response()->json([
                    'error' => 'Failed to push files to the repository.',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to bootstrap repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name ?? null,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to push files: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a GitHub repository.
     */
    public function deleteRepo(Project $project): RedirectResponse
    {
        Log::info('Attempting to delete GitHub repository', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'project_name' => $project->name,
        ]);

        if ($project->user_id !== auth()->id()) {
            Log::warning('Unauthorized attempt to delete repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_owner_id' => $project->user_id,
            ]);
            abort(403);
        }

        $repository = $project->repository;

        if (! $repository) {
            Log::warning('No repository linked for deletion attempt', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
            ]);

            return back()->withErrors([
                'error' => 'No repository linked to this project',
            ]);
        }

        $token = auth()->user()->githubToken;

        if (! $token || $token->isExpired()) {
            Log::warning('GitHub token missing or expired for repository deletion', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
                'has_token' => ! is_null($token),
                'is_expired' => $token ? $token->isExpired() : null,
            ]);

            return back()->withErrors([
                'error' => 'GitHub authentication required',
            ]);
        }

        try {
            $client = new GithubClient($token);

            Log::info('Calling GitHub API to delete repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
                'repo_id' => $repository->id,
            ]);

            $success = $client->deleteRepo($repository->full_name);

            if ($success) {
                Log::info('Repository deleted from GitHub, removing database record', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                    'repo_id' => $repository->id,
                ]);

                $repository->delete();

                Log::info('Repository deleted successfully', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                ]);

                return back()->with([
                    'success' => true,
                    'message' => 'Repository deleted successfully',
                ]);
            } else {
                $errorMessage = $client->getLastErrorMessage() ?? 'Failed to delete repository from GitHub';
                $errorDetails = $client->getLastError();

                // Check if it's a permission issue
                if (isset($errorDetails['status']) && $errorDetails['status'] === 403) {
                    $errorMessage = 'Insufficient permissions to delete repository. Please reconnect your GitHub account with delete_repo permission.';
                }

                Log::error('Failed to delete repository from GitHub', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                    'error' => $errorMessage,
                    'error_details' => $errorDetails,
                ]);

                return back()->withErrors([
                    'error' => $errorMessage,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception during repository deletion', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name ?? null,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to delete repository: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Sync repository specs folder with latest project documentation.
     */
    public function syncRepo(Project $project): RedirectResponse
    {
        Log::info('Attempting to sync repository specs', [
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'project_name' => $project->name,
        ]);

        if ($project->user_id !== auth()->id()) {
            Log::warning('Unauthorized attempt to sync repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'project_owner_id' => $project->user_id,
            ]);
            abort(403);
        }

        $repository = $project->repository;

        if (! $repository) {
            Log::warning('No repository linked for sync attempt', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
            ]);

            return back()->withErrors([
                'error' => 'No repository linked to this project',
            ]);
        }

        $token = auth()->user()->githubToken;

        if (! $token || $token->isExpired()) {
            Log::warning('GitHub token missing or expired for repository sync', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
                'has_token' => ! is_null($token),
                'is_expired' => $token ? $token->isExpired() : null,
            ]);

            return back()->withErrors([
                'error' => 'GitHub authentication required',
            ]);
        }

        try {
            $client = new GithubClient($token);
            $specsExportService = app(\App\Services\Documentation\ProjectSpecsExportService::class);

            Log::info('Generating specs files for sync', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
            ]);

            $specFiles = $specsExportService->build($project);

            if (empty($specFiles)) {
                Log::warning('No specs files to sync', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                ]);

                return back()->withErrors([
                    'error' => 'No specifications available to sync',
                ]);
            }

            Log::info('Checking if repository is empty', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
            ]);

            $isEmpty = $client->isRepoEmpty($repository->full_name);

            if ($isEmpty) {
                Log::info('Repository is empty, using bootstrap service', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                ]);

                $bootstrapService = new RepoBootstrapService($client, $repository, $specsExportService);
                $success = $bootstrapService->pushInitialCommit();

                if ($success) {
                    Log::info('Repository specs bootstrapped successfully', [
                        'user_id' => auth()->id(),
                        'project_id' => $project->id,
                        'repo_full_name' => $repository->full_name,
                        'files_count' => count($specFiles),
                    ]);

                    return back()->with([
                        'success' => true,
                        'message' => 'Specifications synced successfully',
                        'files_count' => count($specFiles),
                    ]);
                } else {
                    Log::error('Failed to bootstrap repository specs', [
                        'user_id' => auth()->id(),
                        'project_id' => $project->id,
                        'repo_full_name' => $repository->full_name,
                    ]);

                    return back()->withErrors([
                        'error' => 'Failed to sync specifications to empty repository',
                    ]);
                }
            }

            Log::info('Pushing specs files to repository', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name,
                'files_count' => count($specFiles),
            ]);

            $branch = $repository->default_branch ?? 'main';
            $success = $client->commitFiles(
                $repository->full_name,
                $branch,
                'docs(specs): update project specifications',
                $specFiles
            );

            if ($success) {
                Log::info('Repository specs synced successfully', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                    'files_count' => count($specFiles),
                ]);

                return back()->with([
                    'success' => true,
                    'message' => 'Specifications synced successfully',
                    'files_count' => count($specFiles),
                ]);
            } else {
                Log::error('Failed to sync repository specs', [
                    'user_id' => auth()->id(),
                    'project_id' => $project->id,
                    'repo_full_name' => $repository->full_name,
                ]);

                return back()->withErrors([
                    'error' => 'Failed to sync specifications to repository',
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception during repository sync', [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'repo_full_name' => $repository->full_name ?? null,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to sync repository: '.$e->getMessage(),
            ]);
        }
    }
}
