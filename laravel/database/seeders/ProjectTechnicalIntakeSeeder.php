<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectTechnicalIntake;
use Illuminate\Database\Seeder;

class ProjectTechnicalIntakeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first project (E-Commerce Platform)
        $project = Project::where('name', 'E-Commerce Platform')->first();

        if (!$project) {
            $this->command->warn('No project found. Please run ProjectWithFeaturesSeeder first.');
            return;
        }

        // Create technical intake for the E-Commerce Platform project
        ProjectTechnicalIntake::updateOrCreate(
            ['project_id' => $project->id],
            [
                'platform_targets' => <<<'PLATFORM'
- Web Application (Desktop & Mobile Responsive)
- Progressive Web App (PWA) capabilities
- Target Browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile Web: iOS Safari, Chrome Mobile
PLATFORM,
                'frontend_tech' => <<<'FRONTEND'
- Framework: React 18+ with TypeScript
- State Management: Redux Toolkit / Zustand
- Routing: React Router v6
- UI Library: Tailwind CSS + shadcn/ui components
- Forms: React Hook Form with Zod validation
- API Client: Axios with React Query for caching
- Build Tool: Vite
- Testing: Jest + React Testing Library
FRONTEND,
                'backend_tech' => <<<'BACKEND'
- Framework: Laravel 11 (PHP 8.2+)
- API: RESTful API with Laravel Sanctum for authentication
- Queue System: Laravel Queues with Redis
- Cache: Redis for session and cache management
- File Storage: Laravel Storage with S3 driver
- Email: Laravel Mail with SendGrid/AWS SES
- Real-time: Laravel Echo with Pusher/Socket.io
BACKEND,
                'database_tech' => <<<'DATABASE'
- Primary Database: PostgreSQL 15+
- Cache Layer: Redis 7+
- Search Engine: Elasticsearch (optional for advanced search)
- Database Migrations: Laravel Migrations
- ORM: Eloquent ORM
- Backup: Automated daily backups to S3
DATABASE,
                'ai_usage' => <<<'AI'
- Product Recommendations: Collaborative filtering algorithms
- Search Enhancement: Elasticsearch with custom scoring
- Fraud Detection: Machine learning models for transaction analysis
- Chatbot: OpenAI GPT-4 API for customer support
- Image Recognition: AWS Rekognition for product image tagging
- Price Optimization: Dynamic pricing algorithms
AI,
                'external_services' => <<<'SERVICES'
- Payment Gateways: Stripe, PayPal, Square
- Shipping APIs: USPS, FedEx, UPS tracking integration
- Email Service: SendGrid / AWS SES
- SMS Notifications: Twilio
- Cloud Storage: AWS S3
- CDN: CloudFlare
- Monitoring: Sentry for error tracking, DataDog for APM
- Analytics: Google Analytics, Mixpanel
- OAuth Providers: Google, Facebook, GitHub
SERVICES,
            ]
        );

        $this->command->info('ProjectTechnicalIntake seeded successfully for: ' . $project->name);
    }
}
