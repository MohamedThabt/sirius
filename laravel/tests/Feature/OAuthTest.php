<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class OAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        config([
            'services.github' => [
                'client_id' => 'test_github_id',
                'client_secret' => 'test_github_secret',
                'redirect' => 'http://localhost:8000/auth/github/callback',
            ],
            'services.google' => [
                'client_id' => 'test_google_id',
                'client_secret' => 'test_google_secret',
                'redirect' => 'http://localhost:8000/auth/google/callback',
            ],
        ]);
    }

    public function test_github_oauth_redirect(): void
    {
        // Act: Try to access GitHub OAuth redirect
        $response = $this->get('/auth/github');

        // Assert: Should redirect to GitHub
        $response->assertStatus(302);
        $this->assertStringContainsString('github.com', $response->headers->get('Location'));
    }

    public function test_google_oauth_redirect(): void
    {
        // Act: Try to access Google OAuth redirect
        $response = $this->get('/auth/google');

        // Assert: Should redirect to Google
        $response->assertStatus(302);
        $this->assertStringContainsString('accounts.google.com', $response->headers->get('Location'));
    }

    public function test_invalid_oauth_provider_returns_404(): void
    {
        // Act: Try to access invalid OAuth provider
        $response = $this->get('/auth/facebook');

        // Assert: Should return 404
        $response->assertStatus(404);
    }

    public function test_github_oauth_callback_creates_new_user(): void
    {
        // Arrange: Mock GitHub OAuth user
        $githubUser = $this->mockSocialiteUser([
            'id' => '12345',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'avatar' => 'https://github.com/avatar.jpg',
        ]);

        Socialite::shouldReceive('driver->user')
            ->with('github')
            ->once()
            ->andReturn($githubUser);

        // Act: Call GitHub OAuth callback
        $response = $this->get('/auth/github/callback');

        // Assert: Should create user and redirect to projects
        $response->assertRedirect('/projects');
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'provider' => 'github',
            'provider_id' => '12345',
            'avatar' => 'https://github.com/avatar.jpg',
        ]);

        $user = User::where('email', 'john@example.com')->first();
        expect($user->password)->toBeNull();
        expect($user->email_verified_at)->not()->toBeNull();
    }

    public function test_google_oauth_callback_creates_new_user(): void
    {
        // Arrange: Mock Google OAuth user
        $googleUser = $this->mockSocialiteUser([
            'id' => '67890',
            'name' => 'Jane Smith',
            'email' => 'jane@gmail.com',
            'avatar' => 'https://lh3.googleusercontent.com/avatar.jpg',
        ]);

        Socialite::shouldReceive('driver->user')
            ->with('google')
            ->once()
            ->andReturn($googleUser);

        // Act: Call Google OAuth callback
        $response = $this->get('/auth/google/callback');

        // Assert: Should create user and redirect to projects
        $response->assertRedirect('/projects');
        $this->assertDatabaseHas('users', [
            'email' => 'jane@gmail.com',
            'name' => 'Jane Smith',
            'provider' => 'google',
            'provider_id' => '67890',
            'avatar' => 'https://lh3.googleusercontent.com/avatar.jpg',
        ]);
    }

    public function test_oauth_callback_merges_existing_user_by_email(): void
    {
        // Arrange: Create existing user with regular registration
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com',
            'name' => 'Existing User',
            'password' => bcrypt('password123'),
        ]);

        // Mock GitHub OAuth user with same email
        $githubUser = $this->mockSocialiteUser([
            'id' => '99999',
            'name' => 'GitHub Name',
            'email' => 'existing@example.com',
            'avatar' => 'https://github.com/newavatar.jpg',
        ]);

        Socialite::shouldReceive('driver->user')
            ->with('github')
            ->once()
            ->andReturn($githubUser);

        // Act: Call GitHub OAuth callback
        $response = $this->get('/auth/github/callback');

        // Assert: Should merge OAuth data with existing user
        $response->assertRedirect('/projects');
        $this->assertDatabaseHas('users', [
            'id' => $existingUser->id,
            'email' => 'existing@example.com',
            'provider' => 'github',
            'provider_id' => '99999',
            'avatar' => 'https://github.com/newavatar.jpg',
        ]);

        // Should still have password from original registration
        $updatedUser = User::find($existingUser->id);
        expect($updatedUser->password)->not()->toBeNull();
        expect($updatedUser->email_verified_at)->not()->toBeNull();
    }

    public function test_oauth_callback_finds_existing_user_by_provider_id(): void
    {
        // Arrange: Create existing OAuth user
        $existingUser = User::factory()->create([
            'email' => 'oauth@example.com',
            'name' => 'OAuth User',
            'provider' => 'github',
            'provider_id' => '12345',
            'avatar' => 'https://old-avatar.jpg',
        ]);

        // Mock GitHub OAuth user with same provider_id
        $githubUser = $this->mockSocialiteUser([
            'id' => '12345',
            'name' => 'Updated Name',
            'email' => 'oauth@example.com',
            'avatar' => 'https://new-avatar.jpg',
        ]);

        Socialite::shouldReceive('driver->user')
            ->with('github')
            ->once()
            ->andReturn($githubUser);

        // Act: Call GitHub OAuth callback
        $response = $this->get('/auth/github/callback');

        // Assert: Should update existing user data
        $response->assertRedirect('/projects');
        $this->assertDatabaseHas('users', [
            'id' => $existingUser->id,
            'email' => 'oauth@example.com',
            'provider' => 'github',
            'provider_id' => '12345',
            'avatar' => 'https://new-avatar.jpg',
        ]);

        // Should only have one user in database
        expect(User::count())->toBe(1);
    }

    public function test_oauth_callback_handles_socialite_errors(): void
    {
        // Arrange: Mock Socialite to throw exception
        Socialite::shouldReceive('driver->user')
            ->with('github')
            ->once()
            ->andThrow(new \Exception('OAuth error'));

        // Act: Call GitHub OAuth callback
        $response = $this->get('/auth/github/callback');

        // Assert: Should redirect to login with error
        $response->assertRedirect('/login');
        $response->assertSessionHasErrors(['oauth']);
    }

    private function mockSocialiteUser(array $userData): SocialiteUser
    {
        $user = Mockery::mock(SocialiteUser::class);
        $user->shouldReceive('getId')->andReturn($userData['id']);
        $user->shouldReceive('getName')->andReturn($userData['name']);
        $user->shouldReceive('getNickname')->andReturn($userData['name']);
        $user->shouldReceive('getEmail')->andReturn($userData['email']);
        $user->shouldReceive('getAvatar')->andReturn($userData['avatar']);

        return $user;
    }
}