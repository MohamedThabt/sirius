<?php

namespace Tests\Feature;

use App\Models\GithubToken;
use App\Models\Project;
use App\Models\ProjectRepository;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GithubIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->project = Project::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Project',
        ]);
    }

    public function test_user_can_access_github_connect_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('projects.github.connect', $this->project));

        // Should redirect to OAuth if no token
        $response->assertRedirect(route('github.redirect'));
    }

    public function test_user_with_valid_token_sees_authenticated_response(): void
    {
        // Create a GitHub token for the user
        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'avatar' => 'https://avatar.url',
            'token_type' => 'bearer',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('projects.github.connect', $this->project));

        $response->assertOk();
        $response->assertJsonStructure([
            'authenticated',
            'username',
            'avatar',
        ]);
    }

    public function test_user_cannot_access_other_users_project(): void
    {
        $otherUser = User::factory()->create();
        $otherProject = Project::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user)
            ->get(route('projects.github.connect', $otherProject));

        $response->assertForbidden();
    }

    public function test_github_oauth_redirect_works(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('github.redirect'));

        $response->assertRedirect();
        $this->assertStringContainsString('github.com', $response->headers->get('Location'));
    }

    public function test_list_repos_requires_authentication(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('projects.github.repos', $this->project));

        $response->assertStatus(401);
        $response->assertJson(['error' => 'GitHub authentication required']);
    }

    public function test_list_repos_returns_data_with_valid_token(): void
    {
        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'avatar' => 'https://avatar.url',
            'token_type' => 'bearer',
        ]);

        // Mock GitHub API responses
        Http::fake([
            'https://api.github.com/user' => Http::response([
                'login' => 'testuser',
                'avatar_url' => 'https://avatar.url',
            ], 200),
            'https://api.github.com/user/repos*' => Http::response([], 200),
            'https://api.github.com/user/orgs*' => Http::response([], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('projects.github.repos', $this->project));

        $response->assertOk();
        $response->assertJsonStructure([
            'user' => ['login', 'avatar'],
            'userRepos',
            'organizations',
        ]);
    }

    public function test_create_repo_validates_required_fields(): void
    {
        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'token_type' => 'bearer',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('projects.github.repos.create', $this->project), []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'visibility', 'owner_type', 'owner_login']);
    }

    public function test_create_repo_stores_repository_data(): void
    {
        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'token_type' => 'bearer',
        ]);

        // Mock GitHub API
        Http::fake([
            'https://api.github.com/user/repos' => Http::response([
                'id' => 123456,
                'name' => 'test-repo',
                'full_name' => 'testuser/test-repo',
                'default_branch' => 'main',
                'html_url' => 'https://github.com/testuser/test-repo',
                'ssh_url' => 'git@github.com:testuser/test-repo.git',
                'private' => true,
            ], 201),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('projects.github.repos.create', $this->project), [
                'name' => 'test-repo',
                'visibility' => 'private',
                'owner_type' => 'user',
                'owner_login' => 'testuser',
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'repository',
            'message',
        ]);

        $this->assertDatabaseHas('project_repositories', [
            'project_id' => $this->project->id,
            'name' => 'test-repo',
            'full_name' => 'testuser/test-repo',
        ]);
    }

    public function test_link_existing_repo_stores_repository_data(): void
    {
        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'token_type' => 'bearer',
        ]);

        // Mock GitHub API
        Http::fake([
            'https://api.github.com/repos/testuser/existing-repo' => Http::response([
                'id' => 123456,
                'name' => 'existing-repo',
                'full_name' => 'testuser/existing-repo',
                'owner' => [
                    'login' => 'testuser',
                    'type' => 'User',
                ],
                'default_branch' => 'main',
                'html_url' => 'https://github.com/testuser/existing-repo',
                'ssh_url' => 'git@github.com:testuser/existing-repo.git',
                'private' => false,
            ], 200),
            'https://api.github.com/repos/testuser/existing-repo/commits*' => Http::response([], 200),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('projects.github.link', $this->project), [
                'full_name' => 'testuser/existing-repo',
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'repository',
            'is_empty',
            'message',
        ]);

        $this->assertDatabaseHas('project_repositories', [
            'project_id' => $this->project->id,
            'name' => 'existing-repo',
            'full_name' => 'testuser/existing-repo',
        ]);
    }

    public function test_push_initial_processes_request(): void
    {
        Http::fake([
            // Mock the empty repo check - return 409 to indicate empty repo
            'api.github.com/repos/testuser/test-repo/commits' => Http::response(['message' => 'Git Repository is empty.'], 409),
            // Mock file creation using Contents API for empty repositories
            'api.github.com/repos/testuser/test-repo/contents/README.md' => Http::response([
                'content' => [
                    'name' => 'README.md',
                    'path' => 'README.md',
                    'sha' => 'file123',
                    'size' => 100,
                    'url' => 'https://api.github.com/repos/testuser/test-repo/contents/README.md',
                    'html_url' => 'https://github.com/testuser/test-repo/blob/main/README.md',
                    'git_url' => 'https://api.github.com/repos/testuser/test-repo/git/blobs/file123',
                    'download_url' => 'https://raw.githubusercontent.com/testuser/test-repo/main/README.md',
                    'type' => 'file',
                ],
                'commit' => [
                    'sha' => 'commit123',
                    'url' => 'https://api.github.com/repos/testuser/test-repo/git/commits/commit123',
                    'html_url' => 'https://github.com/testuser/test-repo/commit/commit123',
                    'message' => 'Initial commit: test',
                ],
            ]),
        ]);

        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'token_type' => 'bearer',
        ]);

        ProjectRepository::create([
            'project_id' => $this->project->id,
            'provider' => 'github',
            'name' => 'test-repo',
            'full_name' => 'testuser/test-repo',
            'owner_login' => 'testuser',
            'owner_type' => 'user',
            'visibility' => 'private',
            'default_branch' => 'main',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('projects.github.push-initial', $this->project));

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'message' => 'Files have been successfully uploaded to the repository.',
        ]);
    }

    public function test_push_initial_fails_without_repository(): void
    {
        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'token_type' => 'bearer',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('projects.github.push-initial', $this->project));

        $response->assertStatus(404);
        $response->assertJson([
            'error' => 'No repository linked to this project',
        ]);
    }

    public function test_expired_token_prevents_operations(): void
    {
        GithubToken::create([
            'user_id' => $this->user->id,
            'access_token' => 'test_token',
            'provider_user_id' => '12345',
            'username' => 'testuser',
            'token_type' => 'bearer',
            'expires_at' => now()->subDay(), // Expired
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('projects.github.connect', $this->project));

        $response->assertRedirect(route('github.redirect'));
    }
}
