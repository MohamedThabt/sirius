<?php

namespace App\Services\Github;

use App\Models\Project;
use App\Models\ProjectRepository;
use App\Services\Documentation\ProjectSpecsExportService;
use App\Support\AppLogger;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class RepoBootstrapService
{
    protected GithubClient $client;

    protected ProjectRepository $repository;

    protected Project $project;

    protected ProjectSpecsExportService $specsExportService;

    public function __construct(
        GithubClient $client,
        ProjectRepository $repository,
        ProjectSpecsExportService $specsExportService
    ) {
        $this->client = $client;
        $this->repository = $repository;
        $this->project = $repository->project;
        $this->specsExportService = $specsExportService;
    }

    /**
     * Push initial commit with project files to the repository.
     */
    public function pushInitialCommit(): bool
    {
        AppLogger::business('github.bootstrap.started', [
            'project_id' => $this->project->id,
            'project_name' => $this->project->name,
            'repo_full_name' => $this->repository->full_name,
            'repo_id' => $this->repository->id,
            'default_branch' => $this->repository->default_branch,
        ]);

        try {
            // Check if repo is empty
            Log::info('Checking if repository is empty', [
                'repo_full_name' => $this->repository->full_name,
            ]);

            $isRepoEmpty = $this->client->isRepoEmpty($this->repository->full_name);

            if (! $isRepoEmpty) {
                Log::info('Repository is not empty, will push specs', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                ]);

                return $this->pushSpecsCommit();
            }

            Log::info('Repository is empty, proceeding with bootstrap', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
            ]);

            // For empty repositories, push specs as initial commit
            return $this->pushFilesToEmptyRepo();
        } catch (\Exception $e) {
            AppLogger::error('Bootstrap process failed with exception', $e, [
                'project_id' => $this->project->id,
                'project_name' => $this->project->name,
                'repo_full_name' => $this->repository->full_name,
            ]);

            return false;
        }
    }

    /**
     * Push files to an empty repository using Contents API.
     */
    protected function pushFilesToEmptyRepo(): bool
    {
        try {
            // Generate specs files
            $specFiles = $this->specsExportService->build($this->project);

            if (empty($specFiles)) {
                Log::warning('No specs files to push for empty repository', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                ]);

                return false;
            }

            Log::info('Using Contents API for empty repository', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'files_count' => count($specFiles),
                'file_paths' => array_column($specFiles, 'path'),
            ]);

            // For empty repositories, we need to create the first file to initialize the repo
            // Then we can use commitFiles for the remaining files
            $firstFile = $specFiles[0];
            $remainingFiles = array_slice($specFiles, 1);

            $commitMessage = "Initial commit: {$this->project->name}";

            Log::info('Creating initial file in empty repository', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'file_path' => $firstFile['path'],
                'commit_message' => $commitMessage,
            ]);

            $result = $this->client->createFileInEmptyRepo(
                $this->repository->full_name,
                $firstFile['path'],
                $firstFile['content'],
                $commitMessage
            );

            if (! $result) {
                Log::error('Failed to create initial file in empty repository', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                    'file_path' => $firstFile['path'],
                ]);

                return false;
            }

            Log::info('Initial file created successfully in empty repository', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'file_path' => $firstFile['path'],
                'commit_sha' => $result['commit']['sha'] ?? 'unknown',
            ]);

            // If there are remaining files, commit them
            if (! empty($remainingFiles)) {
                // Wait a moment for GitHub to process the initial commit
                Log::info('Waiting for GitHub to process initial commit', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                    'wait_seconds' => 2,
                ]);

                sleep(2);

                $branch = $this->repository->default_branch ?? 'main';

                Log::info('Committing remaining specs files', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                    'branch' => $branch,
                    'files_count' => count($remainingFiles),
                ]);

                $success = $this->client->commitFiles(
                    $this->repository->full_name,
                    $branch,
                    'docs(specs): add project specs (PRD, modules, features)',
                    $remainingFiles
                );

                if (! $success) {
                    Log::warning('Failed to commit remaining specs files', [
                        'project_id' => $this->project->id,
                        'repo_full_name' => $this->repository->full_name,
                        'branch' => $branch,
                    ]);
                }

                return $success;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Exception during pushFilesToEmptyRepo', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Push specs commit with project documentation files.
     */
    protected function pushSpecsCommit(): bool
    {
        try {
            Log::info('Starting specs commit generation', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
            ]);

            // Generate specs files
            $specFiles = $this->specsExportService->build($this->project);

            if (empty($specFiles)) {
                Log::info('No specs files to push', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                ]);

                return true;
            }

            Log::info('Specs files generated successfully', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'files_count' => count($specFiles),
                'file_paths' => array_column($specFiles, 'path'),
            ]);

            $branch = $this->repository->default_branch ?? 'main';

            Log::info('Attempting to commit specs files', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'branch' => $branch,
                'files_count' => count($specFiles),
            ]);

            $success = $this->client->commitFiles(
                $this->repository->full_name,
                $branch,
                'docs(specs): add project specs (PRD, modules, features)',
                $specFiles
            );

            if ($success) {
                Log::info('Specs commit pushed successfully', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                    'branch' => $branch,
                    'files_count' => count($specFiles),
                ]);
            } else {
                Log::warning('Failed to push specs commit', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                    'branch' => $branch,
                ]);
            }

            return $success;
        } catch (\Exception $e) {
            Log::error('Exception during specs commit push', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString(),
            ]);

            // Don't fail the whole bootstrap process if specs fail
            return true;
        }
    }

}
