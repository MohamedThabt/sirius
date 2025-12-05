<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectOverviewVersion;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectWithFeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Note: Features are now created through modules.
     * This seeder creates a sample project with PRD, technical details, C4, and ERD.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => '1@1.com'],
            [
                'name' => 'Moahmed',
                'password' => bcrypt('password'),
            ]
        );

        $project = Project::firstOrCreate(
            [
                'user_id' => $user->id,
                'name' => 'E-Commerce Platform',
            ],
            [
                'brief' => 'A modern e-commerce platform with advanced features',
                'status' => 'in_progress',
            ]
        );

        $baseOverview = ProjectOverviewVersion::firstOrCreate(
            [
                'project_id' => $project->id,
                'is_base_version' => true,
            ],
            [
                'overview' => 'This project aims to create a comprehensive e-commerce solution that includes user management, product catalog, shopping cart, payment processing, order management, and admin dashboard. The platform will support multiple vendors, various payment gateways, and provide analytics for business insights.',
                'version_number' => 1,
            ]
        );

        $prd = <<<'PRD'
Product Requirements Document (PRD)
Project: E-Commerce Platform
Prepared by: Moahmed
Date: 2025-11-06

Revision History
Version

Date

Summary

Author

1

2025-11-06

Initial draft

Moahmed

## 1. Why?
The E-Commerce Platform addresses the growing need for a comprehensive, scalable online marketplace that supports multiple vendors, provides seamless shopping experiences, and delivers powerful business intelligence. The platform solves the problem of fragmented e-commerce solutions by offering an all-in-one solution that enables businesses to manage products, process orders, handle payments, and gain actionable insights from a single unified system.

The core value proposition is to empower businesses of all sizes to establish and grow their online presence while providing customers with a modern, secure, and intuitive shopping experience. By supporting multiple vendors and payment gateways, the platform creates a marketplace ecosystem that benefits both sellers and buyers.

## 2. Goals & Success Metrics
Business goals:

1. Achieve $1M in gross merchandise value (GMV) within the first 6 months of launch
2. Onboard 500+ active vendors within the first year
3. Maintain a customer retention rate of 60%+ through superior user experience and service quality

Success metrics / KPIs:

- Daily Active Users (DAU): Target 10,000+ daily active users
- Net Promoter Score (NPS): Achieve NPS of 50+ indicating strong customer satisfaction
- Conversion Rate: Maintain checkout conversion rate of 3%+ (industry average is 2-3%)
- Average Order Value (AOV): Target $75+ per transaction
- Cart Abandonment Rate: Keep below 60% through optimized checkout flow
- Payment Success Rate: Maintain 95%+ successful payment processing
- Vendor Satisfaction: Achieve 4.5/5 average vendor rating

## 3. Scope
In-Scope:

- User authentication and authorization (registration, login, password reset, role-based access)
- Product catalog management with categories, variants, and inventory tracking
- Advanced product search and filtering capabilities
- Shopping cart with persistent storage across sessions
- Multi-step checkout process supporting guest and registered users
- Multiple payment gateway integration (credit card, PayPal, bank transfer)
- Order management and tracking system
- Email notifications for order status updates
- Admin dashboard with business intelligence and analytics
- Vendor management portal
- Basic reporting and data export functionality

Out-of-Scope:

- Mobile native applications (web-first approach, responsive design)
- Advanced AI/ML recommendations (Phase 2 consideration)
- Multi-language and multi-currency support (Phase 2)
- Advanced inventory forecasting
- Live chat or customer support chat integration
- Social media integration and social commerce features
- Subscription or recurring payment models
- Advanced loyalty program beyond basic discounts

## 4. User Personas & Journeys
Persona 1: Online Shopper (Sarah)

Goal: Find and purchase products quickly and securely with confidence in product quality and delivery.

Journey (Happy Path):

1. Sarah visits the platform and browses product categories
2. She uses search filters to find a specific product (e.g., "wireless headphones under $100")
3. Views product details, reviews, and variant options (color, size)
4. Adds product to cart and continues shopping
5. Reviews cart, applies discount code if available
6. Proceeds to checkout as guest (enters email and shipping address)
7. Selects payment method (credit card) and completes purchase
8. Receives order confirmation email with tracking information
9. Tracks order status through email updates
10. Receives product and confirms delivery

Persona 2: Vendor (Mike)

Goal: Manage product catalog, process orders efficiently, and grow sales through the platform.

Journey (Happy Path):

1. Mike registers as a vendor and completes profile setup
2. Adds first product with images, description, variants, and inventory
3. Organizes products into categories for easy management
4. Receives first order notification via email
5. Views order details in vendor dashboard
6. Updates order status and adds shipping information
7. Generates shipping label and marks order as shipped
8. Tracks sales performance through analytics dashboard
9. Reviews customer feedback and adjusts product listings
10. Expands product catalog based on sales insights

## 5. Constraints & Assumptions
Constraints:

- Must comply with PCI DSS standards for payment security
- System must handle 10,000+ concurrent users without performance degradation
- Transaction processing must complete within 3 seconds
- Platform must maintain 99.9% uptime
- All user data must comply with GDPR and data privacy regulations
- Payment gateway API rate limits must be respected
- Mobile responsiveness required (no native apps in Phase 1)

Assumptions:

- Users have access to email for account verification and notifications
- Payment gateways will be available and operational
- Vendors will provide accurate product information and inventory data
- Shipping carriers will provide reliable tracking information
- Users are comfortable with online payment transactions
- Internet connectivity is stable for both users and vendors

## 6. Risks & Mitigations
Risk: Payment gateway failures causing transaction failures and revenue loss

Mitigation: Implement multiple payment gateway providers with automatic failover. Monitor gateway health and alert on failures. Maintain manual payment processing option for critical transactions.

Risk: High cart abandonment rate leading to lost sales

Mitigation: Implement cart persistence, guest checkout option, and abandoned cart email reminders. Optimize checkout flow to minimize steps and friction. Provide clear shipping and return policy information.

Risk: Inventory synchronization issues causing overselling

Mitigation: Implement real-time inventory tracking with database locks during checkout. Set up low inventory alerts for vendors. Provide manual inventory adjustment tools for vendors.

Risk: Security breaches compromising user data and payment information

Mitigation: Implement industry-standard encryption, regular security audits, and compliance with PCI DSS. Use secure authentication methods (JWT, OAuth2). Regular penetration testing and security monitoring.

Risk: Scalability issues as user base grows

Mitigation: Design architecture with horizontal scaling in mind. Implement caching strategies (Redis). Use CDN for static assets. Database optimization and read replicas for high-traffic queries.

## 7. Release Plan & Rollout Strategy
Phase 1: Foundation (Months 1-2)
- User authentication and authorization
- Basic product catalog management
- Simple shopping cart and checkout
- Single payment gateway integration
- Basic order management
- Limited to internal testing and beta users

Phase 2: Core Features (Months 3-4)
- Advanced product search and filtering
- Multiple payment gateway support
- Enhanced order tracking and notifications
- Vendor management portal
- Admin dashboard with basic analytics
- Soft launch with limited vendor base

Phase 3: Scale & Optimize (Months 5-6)
- Performance optimization
- Advanced analytics and reporting
- Enhanced vendor tools
- Customer feedback and review system
- Public launch
- Marketing and vendor acquisition

Phase 4: Growth (Months 7+)
- Advanced features based on user feedback
- Mobile app consideration
- International expansion features
- AI-powered recommendations
- Advanced marketing tools

## 8. Dependencies
Internal:

- Development team availability and expertise in required technologies
- Design team for UI/UX implementation
- QA team for testing and quality assurance
- DevOps team for infrastructure setup and deployment
- Product management for feature prioritization and stakeholder communication

External:

- Payment gateway APIs (Stripe, PayPal, bank transfer providers)
- Email service provider for transactional emails (SendGrid, AWS SES)
- Shipping carrier APIs for tracking integration
- Cloud infrastructure provider (AWS, Azure, or GCP)
- CDN provider for content delivery
- Security and compliance certifications (PCI DSS)
PRD;

        $technicalDetails = <<<'TECH'
Platform Targets:
- Web Application (Desktop & Mobile Responsive)
- Progressive Web App (PWA) capabilities
- Target Browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile Web: iOS Safari, Chrome Mobile

Frontend Technology:
- Framework: React 18+ with TypeScript
- State Management: Redux Toolkit / Zustand
- Routing: React Router v6
- UI Library: Tailwind CSS + shadcn/ui components
- Forms: React Hook Form with Zod validation
- API Client: Axios with React Query for caching
- Build Tool: Vite
- Testing: Jest + React Testing Library

Backend Technology:
- Framework: Laravel 11 (PHP 8.2+)
- API: RESTful API with Laravel Sanctum for authentication
- Queue System: Laravel Queues with Redis
- Cache: Redis for session and cache management
- File Storage: Laravel Storage with S3 driver
- Email: Laravel Mail with SendGrid/AWS SES
- Real-time: Laravel Echo with Pusher/Socket.io

Database Technology:
- Primary Database: PostgreSQL 15+
- Cache Layer: Redis 7+
- Search Engine: Elasticsearch (optional for advanced search)
- Database Migrations: Laravel Migrations
- ORM: Eloquent ORM
- Backup: Automated daily backups to S3

AI Usage:
- Product Recommendations: Collaborative filtering algorithms
- Search Enhancement: Elasticsearch with custom scoring
- Fraud Detection: Machine learning models for transaction analysis
- Chatbot: OpenAI GPT-4 API for customer support
- Image Recognition: AWS Rekognition for product image tagging
- Price Optimization: Dynamic pricing algorithms

External Services:
- Payment Gateways: Stripe, PayPal, Square
- Shipping APIs: USPS, FedEx, UPS tracking integration
- Email Service: SendGrid / AWS SES
- SMS Notifications: Twilio
- Cloud Storage: AWS S3
- CDN: CloudFlare
- Monitoring: Sentry for error tracking, DataDog for APM
- Analytics: Google Analytics, Mixpanel
- OAuth Providers: Google, Facebook, GitHub
TECH;

        $c4Diagram = <<<'C4'
{
  "title": "E-Commerce Platform - System Context",
  "description": "High-level system context diagram showing the e-commerce platform and its external interactions",
  "type": "system-context",
  "version": "1.0.0",
  "metadata": {
    "author": "DevMind",
    "created": "2025-11-07",
    "updated": "2025-11-07",
    "tags": ["e-commerce", "multi-vendor", "system-context"]
  },
  "elements": [
    {
      "id": "customer",
      "type": "person",
      "name": "Customer",
      "description": "A person who browses and purchases products from the platform",
      "isExternal": true,
      "position": { "x": 350, "y": 50 }
    },
    {
      "id": "vendor",
      "type": "person",
      "name": "Vendor",
      "description": "A business that sells products through the platform",
      "isExternal": true,
      "position": { "x": 650, "y": 50 }
    },
    {
      "id": "admin",
      "type": "person",
      "name": "Administrator",
      "description": "Platform administrator who manages the system",
      "isExternal": true,
      "position": { "x": 950, "y": 50 }
    },
    {
      "id": "ecommerce-platform",
      "type": "software-system",
      "name": "E-Commerce Platform",
      "description": "Multi-vendor e-commerce platform with product catalog, shopping cart, payment processing, and analytics",
      "technology": "Laravel + React",
      "isExternal": false,
      "position": { "x": 650, "y": 350 }
    },
    {
      "id": "payment-gateway",
      "type": "software-system",
      "name": "Payment Gateway",
      "description": "External payment processing services (Stripe, PayPal, Square)",
      "technology": "REST API",
      "isExternal": true,
      "position": { "x": 250, "y": 650 }
    },
    {
      "id": "email-service",
      "type": "software-system",
      "name": "Email Service",
      "description": "Email delivery service for transactional emails",
      "technology": "SendGrid / AWS SES",
      "isExternal": true,
      "position": { "x": 550, "y": 650 }
    },
    {
      "id": "shipping-api",
      "type": "software-system",
      "name": "Shipping APIs",
      "description": "Shipping carrier APIs for tracking and label generation",
      "technology": "USPS, FedEx, UPS APIs",
      "isExternal": true,
      "position": { "x": 850, "y": 650 }
    },
    {
      "id": "analytics",
      "type": "software-system",
      "name": "Analytics Service",
      "description": "Business intelligence and analytics tracking",
      "technology": "Google Analytics, Mixpanel",
      "isExternal": true,
      "position": { "x": 1150, "y": 650 }
    }
  ],
  "relationships": [
    {
      "id": "rel-1",
      "from": "customer",
      "to": "ecommerce-platform",
      "label": "Browses products, manages cart, places orders",
      "technology": "HTTPS"
    },
    {
      "id": "rel-2",
      "from": "vendor",
      "to": "ecommerce-platform",
      "label": "Manages products, views orders, updates inventory",
      "technology": "HTTPS"
    },
    {
      "id": "rel-3",
      "from": "admin",
      "to": "ecommerce-platform",
      "label": "Manages users, vendors, system settings, views analytics",
      "technology": "HTTPS"
    },
    {
      "id": "rel-4",
      "from": "ecommerce-platform",
      "to": "payment-gateway",
      "label": "Processes payments, handles refunds",
      "technology": "REST API / Webhooks"
    },
    {
      "id": "rel-5",
      "from": "ecommerce-platform",
      "to": "email-service",
      "label": "Sends order confirmations, notifications, marketing emails",
      "technology": "SMTP / REST API"
    },
    {
      "id": "rel-6",
      "from": "ecommerce-platform",
      "to": "shipping-api",
      "label": "Gets shipping rates, creates labels, tracks shipments",
      "technology": "REST API"
    },
    {
      "id": "rel-7",
      "from": "ecommerce-platform",
      "to": "analytics",
      "label": "Tracks user behavior, conversion events, sales metrics",
      "technology": "JavaScript SDK / REST API"
    },
    {
      "id": "rel-8",
      "from": "email-service",
      "to": "customer",
      "label": "Delivers order updates and promotional emails",
      "technology": "Email"
    },
    {
      "id": "rel-9",
      "from": "email-service",
      "to": "vendor",
      "label": "Sends order notifications and platform updates",
      "technology": "Email"
    }
  ],
  "layout": {
    "type": "hierarchical",
    "direction": "TB"
  }
}
C4;

        $erdDiagram = <<<'ERD'
erDiagram
    users ||--o{ orders : "places"
    users ||--o{ carts : "has"
    users ||--|| vendors : "is"
    users }o--|| roles : "has"
    vendors ||--o{ products : "owns"
    categories ||--o{ products : "contains"
    categories ||--o{ categories : "has subcategories"
    products ||--o{ product_variants : "has"
    products ||--o{ product_images : "has"
    products ||--o{ cart_items : "in cart"
    products ||--o{ order_items : "ordered"
    product_variants ||--o{ cart_items : "selected"
    product_variants ||--o{ order_items : "ordered"
    carts ||--o{ cart_items : "contains"
    orders ||--o{ order_items : "contains"
    orders ||--|| shipping_addresses : "ships to"
    orders ||--o{ payments : "paid by"
    orders ||--o{ order_statuses : "has status history"
    orders ||--o{ shipments : "has"

    users {
        int id "PK"
        varchar email "UK, NOT NULL"
        varchar password_hash "NOT NULL"
        varchar first_name "NOT NULL"
        varchar last_name "NOT NULL"
        int role_id "FK, NOT NULL, REFERENCES roles(id)"
        varchar status "DEFAULT 'active', CHECK IN ('active', 'inactive', 'suspended')"
        timestamp created_at "NOT NULL"
    }

    roles {
        int id "PK"
        varchar name "UK, NOT NULL"
        text description "NULLABLE"
    }

    vendors {
        int id "PK"
        int user_id "FK, UK, NOT NULL, REFERENCES users(id) ON DELETE CASCADE"
        varchar business_name "NOT NULL"
        varchar status "DEFAULT 'pending', CHECK IN ('pending', 'active', 'suspended')"
        decimal commission_rate "NOT NULL, DEFAULT 0.10, CHECK >= 0 AND <= 1"
    }

    categories {
        int id "PK"
        int parent_id "FK, NULLABLE, REFERENCES categories(id) ON DELETE CASCADE"
        varchar name "NOT NULL"
        varchar slug "UK, NOT NULL"
        boolean is_active "DEFAULT true"
    }

    products {
        int id "PK"
        int vendor_id "FK, NOT NULL, REFERENCES vendors(id) ON DELETE CASCADE"
        int category_id "FK, NOT NULL, REFERENCES categories(id) ON DELETE RESTRICT"
        varchar name "NOT NULL"
        varchar slug "UK, NOT NULL"
        decimal base_price "NOT NULL, CHECK > 0"
        varchar status "DEFAULT 'draft', CHECK IN ('draft', 'active', 'inactive', 'out_of_stock')"
        boolean is_featured "DEFAULT false"
    }

    product_variants {
        int id "PK"
        int product_id "FK, NOT NULL, REFERENCES products(id) ON DELETE CASCADE"
        varchar sku "UK, NOT NULL"
        varchar name "NOT NULL"
        decimal price_adjustment "DEFAULT 0.00"
        int stock_quantity "NOT NULL, DEFAULT 0, CHECK >= 0"
    }

    product_images {
        int id "PK"
        int product_id "FK, NOT NULL, REFERENCES products(id) ON DELETE CASCADE"
        varchar image_url "NOT NULL"
        boolean is_primary "DEFAULT false"
    }

    carts {
        int id "PK"
        int user_id "FK, NULLABLE, REFERENCES users(id) ON DELETE CASCADE"
        varchar session_id "NULLABLE, INDEX"
        timestamp expires_at "NOT NULL"
    }

    cart_items {
        int id "PK"
        int cart_id "FK, NOT NULL, REFERENCES carts(id) ON DELETE CASCADE"
        int product_id "FK, NOT NULL, REFERENCES products(id) ON DELETE CASCADE"
        int variant_id "FK, NULLABLE, REFERENCES product_variants(id) ON DELETE CASCADE"
        int quantity "NOT NULL, CHECK > 0"
        decimal price "NOT NULL, CHECK > 0"
    }

    orders {
        int id "PK"
        int user_id "FK, NOT NULL, REFERENCES users(id) ON DELETE RESTRICT"
        varchar order_number "UK, NOT NULL"
        varchar status "DEFAULT 'pending', CHECK IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')"
        decimal total_amount "NOT NULL, CHECK >= 0"
        varchar payment_status "DEFAULT 'pending', CHECK IN ('pending', 'paid', 'failed', 'refunded')"
    }

    order_items {
        int id "PK"
        int order_id "FK, NOT NULL, REFERENCES orders(id) ON DELETE CASCADE"
        int product_id "FK, NOT NULL, REFERENCES products(id) ON DELETE RESTRICT"
        int variant_id "FK, NULLABLE, REFERENCES product_variants(id) ON DELETE RESTRICT"
        int vendor_id "FK, NOT NULL, REFERENCES vendors(id) ON DELETE RESTRICT"
        int quantity "NOT NULL, CHECK > 0"
        decimal unit_price "NOT NULL, CHECK > 0"
    }

    shipping_addresses {
        int id "PK"
        int order_id "FK, UK, NOT NULL, REFERENCES orders(id) ON DELETE CASCADE"
        varchar first_name "NOT NULL"
        varchar last_name "NOT NULL"
        varchar address_line1 "NOT NULL"
        varchar city "NOT NULL"
        varchar postal_code "NOT NULL"
        varchar country "NOT NULL"
    }

    payments {
        int id "PK"
        int order_id "FK, NOT NULL, REFERENCES orders(id) ON DELETE CASCADE"
        varchar payment_gateway "NOT NULL"
        varchar transaction_id "UK, NOT NULL"
        decimal amount "NOT NULL, CHECK > 0"
        varchar status "DEFAULT 'pending', CHECK IN ('pending', 'completed', 'failed', 'refunded')"
    }

    order_statuses {
        int id "PK"
        int order_id "FK, NOT NULL, REFERENCES orders(id) ON DELETE CASCADE"
        varchar status "NOT NULL"
        int created_by "FK, NOT NULL, REFERENCES users(id) ON DELETE RESTRICT"
        timestamp created_at "NOT NULL"
    }

    shipments {
        int id "PK"
        int order_id "FK, NOT NULL, REFERENCES orders(id) ON DELETE CASCADE"
        varchar carrier "NOT NULL"
        varchar tracking_number "UK, NOT NULL"
        varchar status "DEFAULT 'pending', CHECK IN ('pending', 'in_transit', 'delivered', 'failed')"
    }
ERD;

        $project->update([
            'prd' => $prd,
            'technical_details' => $technicalDetails,
            'c4' => $c4Diagram,
            'erd' => $erdDiagram,
        ]);
    }
}
