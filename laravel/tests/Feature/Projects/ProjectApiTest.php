<?php

namespace Tests\Feature\Projects;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature tests for Project API endpoints
 * Tests the full flow from HTTP request to database
 */
class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->project = Project::factory()->for($this->user)->create();
    }

    /**
     * @test
     */
    public function user_can_list_their_projects(): void
    {
        // Create additional projects
        Project::factory(2)->for($this->user)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/projects');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'status',
                    'created_at',
                ]
            ],
            'meta' => [
                'total',
                'per_page',
                'current_page',
            ]
        ]);
    }

    /**
     * @test
     */
    public function user_cannot_see_other_users_projects(): void
    {
        $otherUser = User::factory()->create();
        Project::factory(2)->for($otherUser)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/projects');

        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $this->project->id);
    }

    /**
     * @test
     */
    public function user_can_create_a_project(): void
    {
        $payload = [
            'name' => 'E-Commerce Platform',
            'description' => 'A modern e-commerce solution',
            'tech_stack' => 'Laravel, React, PostgreSQL',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/projects', $payload);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'slug',
                'description',
                'tech_stack',
                'status',
                'user_id',
                'created_at',
            ]
        ]);

        $this->assertDatabaseHas('projects', [
            'name' => 'E-Commerce Platform',
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);
    }

    /**
     * @test
     */
    public function project_creation_requires_authentication(): void
    {
        $response = $this->postJson('/api/projects', [
            'name' => 'Test Project',
            'description' => 'Description',
        ]);

        $response->assertStatus(401);
    }

    /**
     * @test
     */
    public function project_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/projects', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'description', 'tech_stack']);
    }

    /**
     * @test
     */
    public function project_name_must_be_unique_per_user(): void
    {
        $projectName = 'Duplicate Name';
        Project::factory()->for($this->user)->create(['name' => $projectName]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/projects', [
                'name' => $projectName,
                'description' => 'Different description',
                'tech_stack' => 'React',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('name');
    }

    /**
     * @test
     */
    public function user_can_view_their_project_details(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/projects/{$this->project->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $this->project->id);
        $response->assertJsonPath('data.name', $this->project->name);
    }

    /**
     * @test
     */
    public function user_cannot_view_other_users_project(): void
    {
        $otherUser = User::factory()->create();
        $otherProject = Project::factory()->for($otherUser)->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/projects/{$otherProject->id}");

        $response->assertStatus(403);
    }

    /**
     * @test
     */
    public function user_can_update_their_project(): void
    {
        $updateData = [
            'name' => 'Updated Project Name',
            'description' => 'Updated description',
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/projects/{$this->project->id}", $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'id' => $this->project->id,
            'name' => 'Updated Project Name',
        ]);
    }

    /**
     * @test
     */
    public function user_cannot_update_other_users_project(): void
    {
        $otherUser = User::factory()->create();
        $otherProject = Project::factory()->for($otherUser)->create();

        $response = $this->actingAs($this->user)
            ->putJson("/api/projects/{$otherProject->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertStatus(403);
        $this->assertDatabaseHas('projects', [
            'id' => $otherProject->id,
            'name' => $otherProject->name, // Unchanged
        ]);
    }

    /**
     * @test
     */
    public function user_can_delete_their_project(): void
    {
        $projectId = $this->project->id;

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/projects/{$projectId}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('projects', ['id' => $projectId]);
    }

    /**
     * @test
     */
    public function deleting_project_cascade_deletes_related_data(): void
    {
        // Add modules and features
        $module = $this->project->modules()->create([
            'name' => 'Auth Module',
            'description' => 'User authentication',
        ]);

        $module->features()->create([
            'name' => 'Login',
            'description' => 'User login',
        ]);

        $projectId = $this->project->id;
        $moduleId = $module->id;

        // Delete project
        $this->actingAs($this->user)
            ->deleteJson("/api/projects/{$projectId}");

        $this->assertDatabaseMissing('projects', ['id' => $projectId]);
        $this->assertDatabaseMissing('modules', ['id' => $moduleId]);
    }

    /**
     * @test
     */
    public function user_can_search_projects(): void
    {
        Project::factory()
            ->for($this->user)
            ->create(['name' => 'Search Target Project']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/projects?search=Search%20Target');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.name', 'Search Target Project');
    }

    /**
     * @test
     */
    public function projects_can_be_filtered_by_status(): void
    {
        $activeProject = Project::factory()
            ->for($this->user)
            ->create(['status' => 'active']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/projects?status=active');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.status', 'active');
    }
}
