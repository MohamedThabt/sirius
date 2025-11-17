<?php

namespace App\Services\Github;

use App\Models\Project;
use App\Models\ProjectRepository;
use App\Services\Documentation\ProjectSpecsExportService;
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
        Log::info('Starting bootstrap process', [
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
                Log::info('Repository is not empty, will only push specs', [
                    'project_id' => $this->project->id,
                    'repo_full_name' => $this->repository->full_name,
                ]);

                // Even if repo is not empty, push specs commit
                return $this->pushSpecsCommit();
            }

            Log::info('Repository is empty, proceeding with bootstrap', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
            ]);

            // Get list of files to push
            $files = $this->getProjectFiles();

            if (empty($files)) {
                Log::warning('No files to push for bootstrap', [
                    'project_id' => $this->project->id,
                    'project_name' => $this->project->name,
                    'repo_full_name' => $this->repository->full_name,
                ]);

                return false;
            }

            Log::info('Project files prepared for push', [
                'project_id' => $this->project->id,
                'files_count' => count($files),
                'file_paths' => array_column($files, 'path'),
            ]);

            // For empty repositories, use Contents API to create the initial commit
            return $this->pushFilesToEmptyRepo($files);
        } catch (\Exception $e) {
            Log::error('Bootstrap process failed with exception', [
                'project_id' => $this->project->id,
                'project_name' => $this->project->name,
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
     * Get list of project files to push.
     */
    protected function getProjectFiles(): array
    {
        $files = [];

        // Generate README.md only
        $files[] = [
            'path' => 'README.md',
            'content' => $this->generateReadme(),
        ];

        return $files;
    }

    /**
     * Push files to an empty repository using Contents API.
     */
    protected function pushFilesToEmptyRepo(array $files): bool
    {
        try {
        Log::info('Using Contents API for empty repository', [
            'project_id' => $this->project->id,
            'repo_full_name' => $this->repository->full_name,
            'files_count' => count($files),
        ]);

        // For empty repositories, we can only create one file at a time
        // We'll create the first file (usually README.md) which will initialize the repository
        $firstFile = $files[0];

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

            // Wait a moment for GitHub to process the initial commit
            Log::info('Waiting for GitHub to process initial commit', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
                'wait_seconds' => 2,
            ]);

            sleep(2);

            Log::info('Proceeding to push specs commit', [
                'project_id' => $this->project->id,
                'repo_full_name' => $this->repository->full_name,
            ]);

            // After creating README, push specs commit
            return $this->pushSpecsCommit();
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
                'docs(specs): add project specs (PRD, ERD, features)',
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

    /**
     * Generate README.md content
     */
    protected function generateReadme(): string
    {
        $content = "# {$this->project->name}\n\n";

        if (! empty($this->project->brief)) {
            $content .= "## Overview\n\n";
            $content .= $this->project->brief."\n\n";
        }

        if (! empty($this->project->prd)) {
            $content .= "## Product Requirements\n\n";
            $content .= $this->project->prd."\n\n";
        }

        if (! empty($this->project->technical_details)) {
            $content .= "## Technical Details\n\n";
            $content .= $this->project->technical_details."\n\n";
        }

        // Add features if they exist
        $features = $this->project->features()->get();
        if ($features->isNotEmpty()) {
            $content .= "## Features\n\n";
            foreach ($features as $index => $feature) {
                $content .= ($index + 1).". **{$feature->title}**";
                if (! empty($feature->status)) {
                    $content .= ' - *'.ucfirst($feature->status).'*';
                }
                $content .= "\n";
            }
            $content .= "\n";
        }

        $content .= "## Project Status\n\n";
        $content .= 'Status: **'.ucfirst($this->project->status ?? 'active')."**\n\n";

        $content .= "---\n\n";
        $content .= "*This repository was initialized by DevMind*\n";

        return $content;
    }
}
