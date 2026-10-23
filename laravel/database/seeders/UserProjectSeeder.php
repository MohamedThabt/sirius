<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\ProjectOverviewVersion;
use App\Models\Module;
use App\Models\Feature;
use Illuminate\Database\Seeder;

class UserProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Find the specific user
        $user = User::where('email', 'mohamedthabetthabet36@gmail.com')->first();

        if (!$user) {
            $this->command->error("User mohamedthabetthabet36@gmail.com not found!");
            return;
        }

        // 2. Create the Project
        $project = Project::firstOrCreate(
            [
                'user_id' => $user->id,
                'name' => 'Sirius Platform Development',
            ],
            [
                'brief' => 'A comprehensive AI-driven platform for automating software development tasks, tracking issues, and managing documentation integrations.',
                'status' => 'in_progress',
            ]
        );

        // 3. Add a Project Overview
        ProjectOverviewVersion::firstOrCreate(
            [
                'project_id' => $project->id,
                'is_base_version' => true,
            ],
            [
                'version_number' => 1,
                'overview' => 'The Sirius Platform orchestrates sub-agents to draft specs, design databases, and write modular applications, effectively speeding up the application lifecycle from ideation to deployment.',
            ]
        );

        // 4. Create a Component/Module
        $module = Module::firstOrCreate(
            [
                'project_id' => $project->id,
                'name' => 'Brief & Knowledge Base Intake',
            ],
            [
                'description' => 'Allow developers to upload specs, repositories, and documents to assemble an AI knowledge base.',
                'status' => 'planned',
                'order_of_implementation' => 1,
            ]
        );

        // 5. Create associated Features
        Feature::firstOrCreate(
            [
                'module_id' => $module->id,
                'name' => 'Multi-modal File Upload',
            ],
            [
                'summary' => 'Allow users to attach PDFs, Text files, and markdown files to the chat context.',
                'description' => 'Store files securely and process document extractions efficiently using PyMuPDF and queues.',
                'status' => 'todo',
                'priority' => 'high',
                'order_of_implementation' => 1,
            ]
        );

        Feature::firstOrCreate(
            [
                'module_id' => $module->id,
                'name' => 'Canvas Entity Extractor',
            ],
            [
                'summary' => 'Generate actionable Canvas Nodes directly from the Knowledge Base.',
                'description' => 'Leverage the LLM to populate and structure the database schemas and ERD based on domain insights.',
                'status' => 'todo',
                'priority' => 'medium',
                'order_of_implementation' => 2,
            ]
        );

        $this->command->info("Seeded project and entities for {$user->email}");
    }
}
