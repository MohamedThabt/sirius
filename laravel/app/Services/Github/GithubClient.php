<?php

namespace App\Services\Github;

use App\Models\GithubToken;
use App\Support\AppLogger;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GithubClient
{
    protected GithubToken $token;

    protected string $baseUrl = 'https://api.github.com';

    protected ?array $lastError = null;

    public function __construct(GithubToken $token)
    {
        $this->token = $token;
    }

    /**
     * Get the last API error response
     */
    public function getLastError(): ?array
    {
        return $this->lastError;
    }

    /**
     * Get a user-friendly error message from the last error
     */
    public function getLastErrorMessage(): ?string
    {
        if (! $this->lastError) {
            return null;
        }

        // Check for GitHub API error format
        if (isset($this->lastError['message'])) {
            $message = $this->lastError['message'];

            // Add field-specific errors if available
            if (isset($this->lastError['errors']) && is_array($this->lastError['errors'])) {
                $fieldErrors = [];
                foreach ($this->lastError['errors'] as $error) {
                    if (isset($error['message'])) {
                        $fieldErrors[] = $error['message'];
                    }
                }

                if (! empty($fieldErrors)) {
                    $message .= ' ('.implode(', ', $fieldErrors).')';
                }
            }

            return $message;
        }

        return 'An unknown error occurred';
    }

    /**
     * Get the authenticated user's information.
     */
    public function getUser(): ?array
    {
        $response = $this->request('GET', '/user');

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Get the organizations the authenticated user belongs to.
     */
    public function getOrgs(): array
    {
        $response = $this->request('GET', '/user/orgs');

        return $response->successful() ? $response->json() : [];
    }

    /**
     * List repositories for the authenticated user.
     */
    public function listUserRepos(int $perPage = 100): array
    {
        $repos = [];
        $page = 1;

        do {
            $response = $this->request('GET', '/user/repos', [
                'per_page' => $perPage,
                'page' => $page,
                'sort' => 'updated',
            ]);

            if (! $response->successful()) {
                break;
            }

            $data = $response->json();
            $repos = array_merge($repos, $data);
            $page++;
        } while (count($data) === $perPage);

        return $repos;
    }

    /**
     * List repositories for an organization.
     */
    public function listOrgRepos(string $org, int $perPage = 100): array
    {
        $repos = [];
        $page = 1;

        do {
            $response = $this->request('GET', "/orgs/{$org}/repos", [
                'per_page' => $perPage,
                'page' => $page,
                'sort' => 'updated',
            ]);

            if (! $response->successful()) {
                break;
            }

            $data = $response->json();
            $repos = array_merge($repos, $data);
            $page++;
        } while (count($data) === $perPage);

        return $repos;
    }

    /**
     * Create a repository for the authenticated user.
     */
    public function createUserRepo(string $name, bool $isPrivate = true, ?string $description = null): ?array
    {
        $response = $this->request('POST', '/user/repos', [
            'name' => $name,
            'private' => $isPrivate,
            'description' => $description,
            'auto_init' => false,
        ]);

        if (! $response->successful()) {
            $this->lastError = $response->json();

            Log::error('GitHub API: Failed to create user repository', [
                'repo_name' => $name,
                'status_code' => $response->status(),
                'error_response' => $this->lastError,
                'error_body' => $response->body(),
            ]);

            return null;
        }

        $this->lastError = null;

        return $response->json();
    }

    /**
     * Create a repository for an organization.
     */
    public function createOrgRepo(string $org, string $name, bool $isPrivate = true, ?string $description = null): ?array
    {
        $response = $this->request('POST', "/orgs/{$org}/repos", [
            'name' => $name,
            'private' => $isPrivate,
            'description' => $description,
            'auto_init' => false,
        ]);

        if (! $response->successful()) {
            $this->lastError = $response->json();

            Log::error('GitHub API: Failed to create organization repository', [
                'org' => $org,
                'repo_name' => $name,
                'status_code' => $response->status(),
                'error_response' => $this->lastError,
                'error_body' => $response->body(),
            ]);

            return null;
        }

        $this->lastError = null;

        return $response->json();
    }

    /**
     * Get a repository by full name (owner/repo).
     */
    public function getRepo(string $fullName): ?array
    {
        $response = $this->request('GET', "/repos/{$fullName}");

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Check if a repository is empty (has no commits).
     */
    public function isRepoEmpty(string $fullName): bool
    {
        $response = $this->request('GET', "/repos/{$fullName}/commits", [
            'per_page' => 1,
        ]);

        // 409 means the repo is empty
        return $response->status() === 409;
    }

    /**
     * Get the default branch of a repository.
     */
    public function getDefaultBranch(string $fullName): ?string
    {
        $repo = $this->getRepo($fullName);

        return $repo['default_branch'] ?? null;
    }

    /**
     * Create a blob (file content) in a repository.
     */
    public function createBlob(string $fullName, string $content, string $encoding = 'base64'): ?array
    {
        $response = $this->request('POST', "/repos/{$fullName}/git/blobs", [
            'content' => $content,
            'encoding' => $encoding,
        ]);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Create a file in an empty repository using the Contents API.
     *
     * @param  string  $fullName  Repository full name (owner/repo)
     * @param  string  $path  File path in the repository
     * @param  string  $content  File content (will be base64 encoded)
     * @param  string  $message  Commit message
     * @param  string|null  $branch  Branch to create the file in (defaults to repository's default branch)
     * @return array|null API response or null on failure
     */
    public function createFileInEmptyRepo(string $fullName, string $path, string $content, string $message, ?string $branch = null): ?array
    {
        $data = [
            'message' => $message,
            'content' => base64_encode($content),
        ];

        if ($branch) {
            $data['branch'] = $branch;
        }

        $response = $this->request('PUT', "/repos/{$fullName}/contents/{$path}", $data);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Create a tree in a repository.
     */
    public function createTree(string $fullName, array $tree, ?string $baseTree = null): ?array
    {
        $data = ['tree' => $tree];
        if ($baseTree) {
            $data['base_tree'] = $baseTree;
        }

        $response = $this->request('POST', "/repos/{$fullName}/git/trees", $data);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Create a commit in a repository.
     */
    public function createCommit(string $fullName, string $message, string $tree, array $parents = []): ?array
    {
        $response = $this->request('POST', "/repos/{$fullName}/git/commits", [
            'message' => $message,
            'tree' => $tree,
            'parents' => $parents,
        ]);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Update a reference (branch) in a repository.
     */
    public function updateReference(string $fullName, string $ref, string $sha, bool $force = false): ?array
    {
        $response = $this->request('PATCH', "/repos/{$fullName}/git/refs/{$ref}", [
            'sha' => $sha,
            'force' => $force,
        ]);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Create a reference (branch) in a repository.
     */
    public function createReference(string $fullName, string $ref, string $sha): ?array
    {
        $response = $this->request('POST', "/repos/{$fullName}/git/refs", [
            'ref' => $ref,
            'sha' => $sha,
        ]);

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Get a reference (branch) in a repository.
     */
    public function getReference(string $fullName, string $ref): ?array
    {
        $response = $this->request('GET', "/repos/{$fullName}/git/refs/{$ref}");

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Get a commit by SHA.
     */
    public function getCommit(string $fullName, string $sha): ?array
    {
        $response = $this->request('GET', "/repos/{$fullName}/git/commits/{$sha}");

        return $response->successful() ? $response->json() : null;
    }

    /**
     * Commit multiple files to a branch in a single commit.
     *
     * @param  string  $fullName  Repository full name (owner/repo)
     * @param  string  $branch  Branch name (e.g., 'main')
     * @param  string  $message  Commit message
     * @param  array  $files  Array of ['path' => string, 'content' => string]
     * @return bool Success status
     */
    public function commitFiles(string $fullName, string $branch, string $message, array $files): bool
    {
        try {
            // Get the reference for the branch
            $ref = $this->getReference($fullName, "heads/{$branch}");
            if (! $ref) {
                Log::error('Failed to get branch reference', [
                    'repo' => $fullName,
                    'branch' => $branch,
                ]);

                return false;
            }

            $headSha = $ref['object']['sha'];

            // Get the commit to retrieve the tree SHA
            $commit = $this->getCommit($fullName, $headSha);
            if (! $commit) {
                Log::error('Failed to get head commit', [
                    'repo' => $fullName,
                    'head_sha' => $headSha,
                ]);

                return false;
            }

            $baseTreeSha = $commit['tree']['sha'];

            // Build tree entries for all files
            $tree = [];
            foreach ($files as $file) {
                $tree[] = [
                    'path' => $file['path'],
                    'mode' => '100644',
                    'type' => 'blob',
                    'content' => $file['content'],
                ];
            }

            // Create the tree
            $newTree = $this->createTree($fullName, $tree, $baseTreeSha);
            if (! $newTree) {
                Log::error('Failed to create tree', [
                    'repo' => $fullName,
                    'base_tree' => $baseTreeSha,
                ]);

                return false;
            }

            // Create the commit
            $newCommit = $this->createCommit($fullName, $message, $newTree['sha'], [$headSha]);
            if (! $newCommit) {
                Log::error('Failed to create commit', [
                    'repo' => $fullName,
                    'tree_sha' => $newTree['sha'],
                ]);

                return false;
            }

            // Update the branch reference
            $updateResult = $this->updateReference($fullName, "heads/{$branch}", $newCommit['sha']);
            if (! $updateResult) {
                Log::error('Failed to update branch reference', [
                    'repo' => $fullName,
                    'branch' => $branch,
                    'commit_sha' => $newCommit['sha'],
                ]);

                return false;
            }

            Log::info('Successfully committed files', [
                'repo' => $fullName,
                'branch' => $branch,
                'commit_sha' => $newCommit['sha'],
                'file_count' => count($files),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Exception during commitFiles', [
                'repo' => $fullName,
                'branch' => $branch,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Delete a repository.
     *
     * @param  string  $fullName  Repository full name (owner/repo)
     * @return bool Success status
     */
    public function deleteRepo(string $fullName): bool
    {
        try {
            Log::info('Attempting to delete repository', [
                'repo' => $fullName,
            ]);

            $response = $this->request('DELETE', "/repos/{$fullName}");

            if ($response->status() === 204) {
                Log::info('Repository deleted successfully', [
                    'repo' => $fullName,
                ]);

                return true;
            }

            Log::error('Failed to delete repository', [
                'repo' => $fullName,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $errorData = $response->json();
            $this->lastError = is_array($errorData) ? array_merge($errorData, ['status' => $response->status()]) : ['status' => $response->status()];

            return false;
        } catch (\Exception $e) {
            Log::error('Exception during repository deletion', [
                'repo' => $fullName,
                'error' => $e->getMessage(),
            ]);

            $this->lastError = [
                'message' => $e->getMessage(),
                'status' => 500,
            ];

            return false;
        }
    }

    /**
     * Make an authenticated HTTP request to GitHub API.
     */
    protected function request(string $method, string $endpoint, array $data = []): \Illuminate\Http\Client\Response
    {
        $url = $this->baseUrl.$endpoint;

        AppLogger::api('github', "{$method} {$endpoint}", [
            'method' => $method,
            'endpoint' => $endpoint,
        ]);

        $request = Http::withHeaders([
            'Authorization' => "Bearer {$this->token->access_token}",
            'Accept' => 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version' => '2022-11-28',
        ])->timeout(30);

        try {
            $startTime = microtime(true);

            if ($method === 'GET') {
                $response = $request->get($url, $data);
            } elseif ($method === 'POST') {
                $response = $request->post($url, $data);
            } elseif ($method === 'PUT') {
                $response = $request->put($url, $data);
            } elseif ($method === 'PATCH') {
                $response = $request->patch($url, $data);
            } elseif ($method === 'DELETE') {
                $response = $request->delete($url, $data);
            } else {
                $response = $request->get($url);
            }

            $durationMs = (int) round((microtime(true) - $startTime) * 1000);

            if (! $response->successful()) {
                AppLogger::apiFailure('github', "{$method} {$endpoint}", $response->status(), $response->body(), [
                    'duration_ms' => $durationMs,
                ]);
            }

            return $response;
        } catch (\Exception $e) {
            AppLogger::apiFailure('github', "{$method} {$endpoint}", 0, $e->getMessage(), [
                'exception_type' => get_class($e),
            ]);

            throw $e;
        }
    }
}
