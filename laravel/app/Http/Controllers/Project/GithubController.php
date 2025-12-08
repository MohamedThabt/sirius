<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\GithubToken;
use App\Models\Project;
use App\Models\ProjectRepository;
use App\Services\Github\GithubClient;
use App\Services\Github\RepoBootstrapService;
use App\Services\Documentation\ProjectSpecsExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Traits\StructuredLogger;
use Throwable;

class GithubController extends Controller
{
    use StructuredLogger;

    /**
     * Ensure user has GitHub authentication.
     *
     * Checks if the user has a valid GitHub token.
     *
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function ensureAuth(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $token = auth()->user()->githubToken;

            if (!$token || $token->isExpired()) {
                // Store the project ID in session to return after OAuth
                session(['github_oauth_return_project' => $project->id]);

                return response()->json([
                    'authenticated' => false,
                    'redirect_url' => route('github.redirect')
                ]);
            }

            return response()->json([
                'authenticated' => true,
                'username' => $token->username,
                'avatar' => $token->avatar,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'ensureAuth', 'project_id' => $project->id]);
            return response()->json(['error' => 'An error occurred while checking GitHub authentication.'], 500);
        }
    }

    /**
     * Redirect to GitHub OAuth.
     *
     * Initiates the GitHub OAuth flow with required scopes.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect()
    {
        try {
            return Socialite::driver('github')
                ->scopes(['repo', 'delete_repo', 'read:org'])
                ->redirect();
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'redirect']);
            return back()->with('error', 'Failed to initiate GitHub authentication.');
        }
    }

    /**
     * Handle GitHub OAuth callback.
     *
     * Processes the callback from GitHub, stores the token, and redirects back to the project.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback(Request $request)
    {
        try {
            \Log::info('GitHub callback started', [
                'has_code' => $request->has('code'),
                'has_state' => $request->has('state'),
                'user_authenticated' => auth()->check(),
                'user_id' => auth()->id(),
            ]);

            $githubUser = Socialite::driver('github')->user();

            \Log::info('GitHub user retrieved', [
                'github_id' => $githubUser->id,
                'github_nickname' => $githubUser->nickname,
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

            \Log::info('GitHub token saved', ['token_id' => $token->id]);

            // Redirect back to the project if stored in session
            $projectId = session()->get('github_oauth_return_project');

            \Log::info('Session check', [
                'project_id_in_session' => $projectId,
                'all_session_keys' => array_keys(session()->all()),
            ]);

            if ($projectId) {
                session()->forget('github_oauth_return_project');
                $project = Project::find($projectId);

                if ($project && $project->user_id === auth()->id()) {
                    return redirect("/projects/{$project->id}")
                        ->with('success', 'GitHub connected successfully!');
                }
            }

            return redirect()->route('projects.index')
                ->with('success', 'GitHub connected successfully!');
        } catch (Throwable $e) {
            \Log::error('GitHub callback FAILED', [
                'error_class' => get_class($e),
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
            ]);
            $this->logException($e, ['action' => 'callback']);
            return redirect()->route('projects.index')
                ->with('error', 'Failed to connect GitHub. Please try again.');
        }
    }

    /**
     * List available repositories (user + organizations).
     *
     * Fetches repositories from the user's GitHub account and organizations.
     *
     * @param Project $project
     * @return \Illuminate\Http\JsonResponse
     */
    public function listRepos(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $token = auth()->user()->githubToken;

            if (!$token || $token->isExpired()) {
                return response()->json(['error' => 'GitHub authentication required'], 401);
            }

            $client = new GithubClient($token);
            $user = $client->getUser();
            $userRepos = $client->listUserRepos();
            $orgs = $client->getOrgs();

            $orgRepos = [];
            foreach ($orgs as $org) {
                $repos = $client->listOrgRepos($org['login']);
                $orgRepos[$org['login']] = [
                    'org' => $org,
                    'repos' => $repos,
                ];
            }

            return response()->json([
                'user' => [
                    'login' => $user['login'] ?? $token->username,
                    'avatar' => $user['avatar_url'] ?? $token->avatar,
                ],
                'userRepos' => $userRepos,
                'organizations' => $orgRepos,
            ]);
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'listRepos', 'project_id' => $project->id]);
            return response()->json(['error' => 'Failed to fetch repositories'], 500);
        }
    }

    /**
     * Create a new repository on GitHub.
     *
     * Creates a new repo via GitHub API and links it to the project.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createRepo(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'visibility' => 'required|in:public,private',
            'owner_type' => 'required|in:user,org',
            'owner_login' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to perform this action.');
            }

            $token = auth()->user()->githubToken;

            if (!$token || $token->isExpired()) {
                return back()->with('error', 'GitHub authentication required. Please connect your account.');
            }

            $client = new GithubClient($token);
            $isPrivate = $validated['visibility'] === 'private';

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

            if (!$repo) {
                $errorMessage = $client->getLastErrorMessage() ?? 'Failed to create repository on GitHub.';
                return back()->with('error', $errorMessage);
            }

            $repository = ProjectRepository::updateOrCreate(
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

            // Push initial specs to the new repository
            $specsExportService = app(ProjectSpecsExportService::class);
            $bootstrapService = new RepoBootstrapService($client, $repository, $specsExportService);
            $pushSuccess = $bootstrapService->pushInitialCommit();

            if ($pushSuccess) {
                return back()->with('success', 'Repository created and specs pushed successfully.');
            } else {
                return back()->with('warning', 'Repository created but failed to push specs. You can sync manually.');
            }
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'createRepo', 'project_id' => $project->id]);
            return back()->with('error', 'An error occurred while creating the repository.');
        }
    }

    /**
     * Link an existing repository to the project.
     *
     * Verifies the repository exists and links it to the project in the database.
     *
     * @param Request $request
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function linkExistingRepo(Request $request, Project $project)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:200',
        ]);

        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to perform this action.');
            }

            $token = auth()->user()->githubToken;

            if (!$token || $token->isExpired()) {
                return back()->with('error', 'GitHub authentication required. Please connect your account.');
            }

            $client = new GithubClient($token);
            $repo = $client->getRepo($validated['full_name']);

            if (!$repo) {
                return back()->with('error', 'Repository not found on GitHub.');
            }

            $ownerLogin = $repo['owner']['login'];
            $ownerType = $repo['owner']['type'] === 'Organization' ? 'org' : 'user';

            ProjectRepository::updateOrCreate(
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

            return back()->with('success', 'Repository linked successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'linkExistingRepo', 'project_id' => $project->id]);
            return back()->with('error', 'An error occurred while linking the repository.');
        }
    }

    /**
     * Push initial commit to the repository.
     *
     * Bootstraps the repository with initial project files.
     *
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function pushInitial(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to perform this action.');
            }

            $repository = $project->repository;

            if (!$repository) {
                return back()->with('error', 'No repository linked to this project.');
            }

            $token = auth()->user()->githubToken;

            if (!$token || $token->isExpired()) {
                return back()->with('error', 'GitHub authentication required.');
            }

            $client = new GithubClient($token);
            $specsExportService = app(ProjectSpecsExportService::class);
            $bootstrapService = new RepoBootstrapService($client, $repository, $specsExportService);

            $success = $bootstrapService->pushInitialCommit();

            if ($success) {
                return back()->with('success', 'Files have been successfully uploaded to the repository.');
            } else {
                return back()->with('error', 'Failed to push files to the repository.');
            }
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'pushInitial', 'project_id' => $project->id]);
            return back()->with('error', 'An error occurred while pushing files.');
        }
    }

    /**
     * Unlink the GitHub repository from the project.
     *
     * Removes the repository link from the database but DOES NOT delete the repository from GitHub.
     *
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function deleteRepo(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to perform this action.');
            }

            $repository = $project->repository;

            if (!$repository) {
                return back()->with('error', 'No repository linked to this project.');
            }

            // Only delete from database, do NOT delete from GitHub
            $repository->delete();

            return back()->with('success', 'Repository unlinked successfully.');
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'deleteRepo', 'project_id' => $project->id]);
            return back()->with('error', 'An error occurred while unlinking the repository.');
        }
    }

    /**
     * Sync repository specs folder with latest project documentation.
     *
     * Generates project specifications and syncs them to the GitHub repository.
     *
     * @param Project $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function syncRepo(Project $project)
    {
        try {
            if ($project->user_id !== auth()->id()) {
                return back()->with('error', 'You are not authorized to perform this action.');
            }

            $repository = $project->repository;

            if (!$repository) {
                return back()->with('error', 'No repository linked to this project.');
            }

            $token = auth()->user()->githubToken;

            if (!$token || $token->isExpired()) {
                return back()->with('error', 'GitHub authentication required.');
            }

            $client = new GithubClient($token);
            $specsExportService = app(ProjectSpecsExportService::class);

            $specFiles = $specsExportService->build($project);

            if (empty($specFiles)) {
                return back()->with('error', 'No specifications available to sync.');
            }

            $isEmpty = $client->isRepoEmpty($repository->full_name);

            if ($isEmpty) {
                $bootstrapService = new RepoBootstrapService($client, $repository, $specsExportService);
                $success = $bootstrapService->pushInitialCommit();

                if ($success) {
                    return back()->with('success', 'Specifications synced successfully (bootstrapped).');
                } else {
                    return back()->with('error', 'Failed to sync specifications to empty repository.');
                }
            }

            $branch = $repository->default_branch ?? 'main';
            $success = $client->commitFiles(
                $repository->full_name,
                $branch,
                'docs(specs): update project specifications',
                $specFiles
            );

            if ($success) {
                return back()->with('success', 'Specifications synced successfully.');
            } else {
                return back()->with('error', 'Failed to sync specifications to repository.');
            }
        } catch (Throwable $e) {
            $this->logException($e, ['action' => 'syncRepo', 'project_id' => $project->id]);
            return back()->with('error', 'An error occurred while syncing the repository.');
        }
    }
}
