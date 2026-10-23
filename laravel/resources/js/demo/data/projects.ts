import type { Project } from '@/types';
import type { FeatureItem, FeaturePriority, FeatureStatus, ModuleItem, ModuleStatus } from '@/types/modules';
import {
    authErd,
    catalogErd,
    checkoutErd,
    ecommerceBrief,
    ecommerceC4,
    ecommerceErd,
    ecommerceOverviewV1,
    ecommerceOverviewV2,
    ecommercePrd,
    guestCheckoutSequence,
    guestCheckoutWireframe,
    loginSequence,
    loginWireframe,
    ordersErd,
    paymentsErd,
    searchSequence,
    searchWireframe,
} from './ecommerce-content';

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export const demoUser = {
    id: 1,
    name: 'Demo User',
    email: 'demo@sirius.dev',
    avatar: undefined,
    email_verified_at: '2025-10-01T09:00:00.000000Z',
    created_at: '2025-10-01T09:00:00.000000Z',
    updated_at: '2025-10-01T09:00:00.000000Z',
    plan: { id: 2, name: 'Pro', slug: 'pro', monthly_price: 19, monthly_credits: 500 },
};

export const teammates = [
    { id: 2, name: 'Sara Ahmed', email: 'sara@sirius.dev', avatar: undefined, role: 'admin' as const, joined_at: '2025-10-04T10:15:00.000000Z' },
    { id: 3, name: 'Omar Hassan', email: 'omar@sirius.dev', avatar: undefined, role: 'developer' as const, joined_at: '2025-10-06T13:40:00.000000Z' },
    { id: 4, name: 'Lina Mostafa', email: 'lina@sirius.dev', avatar: undefined, role: 'viewer' as const, joined_at: '2025-10-12T08:05:00.000000Z' },
];

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

const STATUS_PROGRESS: Record<FeatureStatus, number> = { draft: 10, todo: 25, in_progress: 55, review: 85, done: 100 };

interface FeatureSpec {
    id: number;
    name: string;
    summary: string;
    priority: FeaturePriority;
    status: FeatureStatus;
    description: string;
    criteria: string[];
    flow: string[];
    metrics: string[];
    datamodel?: string;
    sequence_diagram?: string;
    wireframe?: string;
}

const bullets = (items: string[]) => items.map((item) => `- ${item}`).join('\n');
const steps = (items: string[]) => items.map((item, index) => `${index + 1}. ${item}`).join('\n');

function feature(spec: FeatureSpec, order: number, module: { id: number; name: string }): FeatureItem {
    return {
        id: spec.id,
        name: spec.name,
        summary: spec.summary,
        priority: spec.priority,
        status: spec.status,
        order_of_implementation: order,
        progress: STATUS_PROGRESS[spec.status],
        description: spec.description,
        acceptance_criteria: bullets(spec.criteria),
        user_flows: steps(spec.flow),
        metrics: bullets(spec.metrics),
        datamodel: spec.datamodel ?? null,
        sequence_diagram: spec.sequence_diagram ?? null,
        wireframe: spec.wireframe ?? null,
        module,
    };
}

interface ModuleSpec {
    id: number;
    name: string;
    description: string;
    status: ModuleStatus;
    metrics: string[];
    erd?: string;
    features: FeatureSpec[];
}

function module(spec: ModuleSpec, order: number): ModuleItem {
    const features = spec.features.map((f, index) => feature(f, index + 1, { id: spec.id, name: spec.name }));
    const progress = features.length ? Math.round(features.reduce((sum, f) => sum + (f.progress ?? 0), 0) / features.length) : 0;
    return {
        id: spec.id,
        name: spec.name,
        description: spec.description,
        metrics: bullets(spec.metrics),
        erd: spec.erd ?? null,
        erd_is_synced: Boolean(spec.erd),
        status: spec.status,
        order_of_implementation: order,
        progress,
        features,
    };
}

export interface TechnicalIntake {
    id: number;
    project_id: number;
    platform_targets: string | null;
    frontend_tech: string | null;
    backend_tech: string | null;
    database_tech: string | null;
    ai_usage: string | null;
    external_services: string | null;
    created_at: string;
    updated_at: string;
}

export interface OverviewVersionSpec {
    overview: string;
    user_prompt: string | null;
    created_at: string;
}

export interface DemoProject {
    project: Project;
    modules: ModuleItem[];
    overviewVersions: OverviewVersionSpec[];
    prd: string | null;
    technicalIntake: TechnicalIntake | null;
    memberIds: number[];
}

// ---------------------------------------------------------------------------
// Project 1 — fully generated, every page has content
// ---------------------------------------------------------------------------

const ecommerceModuleSpecs: ModuleSpec[] = [
    {
        id: 11,
        name: 'Authentication & Accounts',
        description: 'Registration, login, password recovery and role-based access for shoppers, vendors and administrators.',
        status: 'completed',
        metrics: ['Sign-up completion rate above 70%', 'Login p95 latency under 300ms', 'Zero plaintext credentials stored'],
        erd: authErd,
        features: [
            {
                id: 101,
                name: 'Email Registration & Login',
                summary: 'Shoppers and vendors create an account with email and password and sign in securely.',
                priority: 'critical',
                status: 'done',
                description:
                    'Provide email/password registration with email verification, secure session-based login and a "remember me" option. Vendors choose their account type during sign-up so they land in the vendor portal after verification.',
                criteria: [
                    'User can register with first name, last name, email and password',
                    'Passwords are hashed with bcrypt and must be at least 8 characters',
                    'A verification email is sent and unverified users are prompted to verify',
                    'Invalid credentials show a generic error without revealing which field is wrong',
                    'Five failed attempts within a minute are throttled',
                ],
                flow: [
                    'Open the sign-up page',
                    'Fill in name, email and password',
                    'Choose Shopper or Vendor',
                    'Verify email from the inbox link',
                    'Sign in and land on the dashboard',
                ],
                metrics: ['Registration conversion rate', 'Email verification rate within 24h', 'Failed login ratio'],
                datamodel: authErd,
                sequence_diagram: loginSequence,
                wireframe: loginWireframe,
            },
            {
                id: 102,
                name: 'Password Reset',
                summary: 'Users recover access through a time-limited, single-use reset link.',
                priority: 'high',
                status: 'done',
                description: 'Users request a reset link by email. Tokens are hashed, expire after 60 minutes and are invalidated after first use.',
                criteria: ['Reset link expires after 60 minutes', 'Token can be used only once', 'All sessions are revoked after a successful reset'],
                flow: ['Click "Forgot password"', 'Enter email address', 'Open the reset link', 'Choose a new password', 'Sign in again'],
                metrics: ['Reset completion rate', 'Support tickets about account access'],
            },
            {
                id: 103,
                name: 'Role-Based Access Control',
                summary: 'Permissions differ for shoppers, vendors and administrators.',
                priority: 'high',
                status: 'review',
                description: 'Every route and API action is guarded by a role policy. Admins can promote users to vendors after approval.',
                criteria: [
                    'Vendors cannot access other vendors’ products or orders',
                    'Admin-only screens return 403 for other roles',
                    'Role changes take effect on the next request',
                ],
                flow: [
                    'Admin opens the user list',
                    'Selects a pending vendor',
                    'Approves the vendor role',
                    'Vendor gains access to the vendor portal',
                ],
                metrics: ['Unauthorized access attempts blocked', 'Average vendor approval time'],
            },
        ],
    },
    {
        id: 12,
        name: 'Product Catalog',
        description: 'Vendors publish products with variants, images and inventory; shoppers browse categories and search the catalog.',
        status: 'completed',
        metrics: ['Search results in under 500ms', 'Zero-result searches below 5%', 'Catalog supports 100k+ products'],
        erd: catalogErd,
        features: [
            {
                id: 104,
                name: 'Product Management',
                summary: 'Vendors create and edit products with variants, pricing, images and stock.',
                priority: 'critical',
                status: 'done',
                description:
                    'A product editor for vendors with variants (size, colour), per-variant SKU and stock, multiple images and draft/active states.',
                criteria: [
                    'Vendor can add up to 10 images per product',
                    'Each variant has a unique SKU',
                    'Products with zero stock are shown as out of stock',
                    'Draft products are hidden from shoppers',
                ],
                flow: [
                    'Open "Add product"',
                    'Enter name, description and base price',
                    'Add variants with SKU and stock',
                    'Upload images',
                    'Publish the product',
                ],
                metrics: ['Average time to publish a product', 'Products per active vendor'],
            },
            {
                id: 105,
                name: 'Category Tree',
                summary: 'Nested categories that organise the catalog for browsing.',
                priority: 'medium',
                status: 'done',
                description: 'Admins manage a nested category tree; each product belongs to exactly one leaf category.',
                criteria: ['Categories can be nested up to three levels', 'Slugs are unique', 'Inactive categories are hidden from navigation'],
                flow: ['Admin opens category settings', 'Adds a sub-category', 'Vendors assign products to it', 'Shoppers browse the new category'],
                metrics: ['Category page bounce rate'],
            },
            {
                id: 106,
                name: 'Product Search & Filters',
                summary: 'Full-text search with price, category, rating and availability filters.',
                priority: 'high',
                status: 'in_progress',
                description:
                    'Shoppers search by keyword and narrow results with faceted filters. Results are cached for 60 seconds and ranked by relevance, rating and sales.',
                criteria: [
                    'Results return in under 500ms at p95',
                    'Filters show result counts',
                    'Empty searches suggest popular categories',
                    'Filter state is kept in the URL so results are shareable',
                ],
                flow: [
                    'Type a query in the search bar',
                    'Pick price and rating filters',
                    'Sort by relevance or price',
                    'Open a product from the results',
                ],
                metrics: ['Search-to-cart conversion', 'Zero-result search rate', 'p95 search latency'],
                datamodel: catalogErd,
                sequence_diagram: searchSequence,
                wireframe: searchWireframe,
            },
        ],
    },
    {
        id: 13,
        name: 'Cart & Checkout',
        description: 'A persistent cart and a short, guest-friendly checkout with discount codes.',
        status: 'in_progress',
        metrics: ['Checkout conversion above 3%', 'Cart abandonment below 60%', 'Checkout completes in 3 steps or fewer'],
        erd: checkoutErd,
        features: [
            {
                id: 107,
                name: 'Persistent Cart',
                summary: 'The cart survives page reloads, devices and sign-in.',
                priority: 'high',
                status: 'done',
                description:
                    'Guest carts are stored by session and merged into the user cart on sign-in. Prices are re-validated whenever the cart is opened.',
                criteria: [
                    'Guest cart merges into account cart on login',
                    'Price changes are highlighted in the cart',
                    'Carts expire after 30 days of inactivity',
                ],
                flow: ['Add an item as a guest', 'Sign in', 'See the merged cart', 'Adjust quantities'],
                metrics: ['Cart recovery rate after login'],
            },
            {
                id: 108,
                name: 'Guest Checkout',
                summary: 'Shoppers can buy without creating an account.',
                priority: 'critical',
                status: 'in_progress',
                description:
                    'A three-step checkout (details → payment → confirmation) that only asks for an email and shipping address. Stock is reserved when payment starts and released if it fails.',
                criteria: [
                    'Checkout can be completed without an account',
                    'Stock is reserved for 10 minutes during payment',
                    'A confirmation email with the order number is sent',
                    'Guests are offered account creation after purchase',
                ],
                flow: [
                    'Open the cart and click Checkout',
                    'Enter email and shipping address',
                    'Choose a payment method and pay',
                    'See the confirmation page and email',
                ],
                metrics: ['Guest checkout share of orders', 'Checkout drop-off per step', 'Payment success rate'],
                datamodel: checkoutErd,
                sequence_diagram: guestCheckoutSequence,
                wireframe: guestCheckoutWireframe,
            },
            {
                id: 109,
                name: 'Discount Codes',
                summary: 'Percentage discount codes with expiry dates.',
                priority: 'medium',
                status: 'todo',
                description: 'Admins create percentage codes with an expiry date and usage limit; shoppers apply one code per order.',
                criteria: ['Only one code per order', 'Expired codes show a clear error', 'Discount is shown as a separate line in the summary'],
                flow: ['Enter a code at checkout', 'See the updated total', 'Complete the order'],
                metrics: ['Orders using a code', 'Average discount per order'],
            },
        ],
    },
    {
        id: 14,
        name: 'Payments',
        description: 'Card, PayPal and bank-transfer payments through multiple gateways, with webhooks and refunds.',
        status: 'in_progress',
        metrics: ['Payment success rate above 95%', 'PCI DSS SAQ-A compliance', 'Refunds processed within 24 hours'],
        erd: paymentsErd,
        features: [
            {
                id: 110,
                name: 'Payment Gateway Integration',
                summary: 'Stripe and PayPal payments with automatic failover.',
                priority: 'critical',
                status: 'in_progress',
                description:
                    'Payments are created as intents, confirmed client-side and finalised through signed webhooks. If the primary gateway is down, checkout falls back to the secondary one.',
                criteria: [
                    'Card data never touches our servers',
                    'Webhooks are signature-verified and idempotent',
                    'Failed payments keep the cart intact',
                ],
                flow: [
                    'Choose a payment method',
                    'Confirm payment in the gateway widget',
                    'Receive confirmation via webhook',
                    'Order status becomes Paid',
                ],
                metrics: ['Gateway success rate', 'Failover events per week'],
            },
            {
                id: 111,
                name: 'Refunds',
                summary: 'Full and partial refunds initiated by vendors or admins.',
                priority: 'medium',
                status: 'draft',
                description: 'Vendors request refunds for their order items; admins approve and the refund is sent through the original gateway.',
                criteria: [
                    'Partial refunds cannot exceed the paid amount',
                    'Shopper receives a refund email',
                    'Refund status is visible on the order',
                ],
                flow: ['Vendor opens an order', 'Requests a refund with a reason', 'Admin approves', 'Shopper is refunded'],
                metrics: ['Refund rate', 'Average refund processing time'],
            },
        ],
    },
    {
        id: 15,
        name: 'Order Management',
        description: 'Order lifecycle, status history, shipment tracking and notifications for shoppers and vendors.',
        status: 'planned',
        metrics: ['Order status emails delivered within 1 minute', '"Where is my order?" tickets down 40%'],
        erd: ordersErd,
        features: [
            {
                id: 112,
                name: 'Order Tracking',
                summary: 'Shoppers follow each order from payment to delivery.',
                priority: 'high',
                status: 'todo',
                description: 'An order timeline built from status history and carrier tracking events.',
                criteria: ['Timeline shows every status change with a timestamp', 'Carrier tracking number links to the carrier site'],
                flow: ['Open "My orders"', 'Select an order', 'Follow the shipment timeline'],
                metrics: ['Tracking page visits per order'],
            },
            {
                id: 113,
                name: 'Order Notifications',
                summary: 'Email updates when an order is paid, shipped or delivered.',
                priority: 'medium',
                status: 'draft',
                description: 'Transactional emails triggered by order status changes, queued and retried on failure.',
                criteria: ['Emails are sent for paid, shipped and delivered', 'Failed sends are retried 3 times'],
                flow: ['Order status changes', 'Email is queued', 'Shopper receives the update'],
                metrics: ['Email delivery rate', 'Open rate'],
            },
        ],
    },
    {
        id: 16,
        name: 'Vendor Portal',
        description: 'Onboarding, order fulfilment and sales analytics for vendors.',
        status: 'planned',
        metrics: ['Vendor onboarding under 15 minutes', 'Vendor satisfaction 4.5/5'],
        features: [
            {
                id: 114,
                name: 'Vendor Onboarding',
                summary: 'A guided setup for business details, payouts and the first product.',
                priority: 'high',
                status: 'todo',
                description:
                    'A step-by-step wizard that collects business information and payout details, then walks the vendor through publishing their first product.',
                criteria: ['Progress is saved between steps', 'Admins are notified when a vendor completes onboarding'],
                flow: ['Register as a vendor', 'Enter business details', 'Connect payouts', 'Publish the first product'],
                metrics: ['Onboarding completion rate', 'Time to first product'],
            },
            {
                id: 115,
                name: 'Sales Analytics Dashboard',
                summary: 'Revenue, orders and top products for each vendor.',
                priority: 'low',
                status: 'draft',
                description: 'Charts for revenue, order volume and best-selling products with a date-range picker and CSV export.',
                criteria: ['Data is at most 15 minutes old', 'Export downloads a CSV of the selected range'],
                flow: ['Open the dashboard', 'Pick a date range', 'Review charts', 'Export CSV'],
                metrics: ['Weekly active vendors on the dashboard'],
            },
        ],
    },
];

const ecommerceModules = ecommerceModuleSpecs.map((spec, index) => module(spec, index + 1));

const ecommerce: DemoProject = {
    project: {
        id: 1,
        name: 'E-Commerce Platform',
        brief: ecommerceBrief,
        overview: ecommerceOverviewV2,
        non_functional_requirements: '99.9% uptime, 10k concurrent users, PCI DSS and GDPR compliance.',
        technical_details:
            'React + TypeScript frontend, Laravel 11 API, PostgreSQL with Redis caching, queue workers for email and webhooks, deployed on AWS behind Cloudflare.',
        status: 'in_progress',
        c4: ecommerceC4,
        erd: ecommerceErd,
        prd_is_synced: true,
        brainstorming_scene: null,
        overview_chat: [
            {
                id: 'm1',
                type: 'message',
                role: 'user',
                content: 'Add a high-level flow diagram and a table of non-functional requirements.',
                version_id: null,
                intent: null,
                created_at: '2025-11-05T10:02:00.000Z',
            },
            {
                id: 'm2',
                type: 'version',
                role: 'agent',
                content:
                    'Added a Mermaid flowchart of the purchase flow and an NFR table covering availability, performance, security and scalability.',
                version_id: 2,
                intent: 'edit',
                created_at: '2025-11-05T10:02:40.000Z',
            },
        ],
        user_id: 1,
        progress: 68,
        created_at: '2025-11-01T09:30:00.000000Z',
        updated_at: '2025-11-08T16:45:00.000000Z',
    },
    modules: ecommerceModules,
    prd: ecommercePrd,
    overviewVersions: [
        { overview: ecommerceOverviewV1, user_prompt: null, created_at: '2025-11-02T11:00:00.000Z' },
        {
            overview: ecommerceOverviewV2,
            user_prompt: 'Add a high-level flow diagram and a table of non-functional requirements.',
            created_at: '2025-11-05T10:02:40.000Z',
        },
    ],
    technicalIntake: {
        id: 1,
        project_id: 1,
        platform_targets: 'Web (Responsive), Progressive Web App (PWA)',
        frontend_tech: 'React (Next.js)',
        backend_tech: 'PHP (Laravel)',
        database_tech: 'PostgreSQL, Redis, Elasticsearch',
        ai_usage: 'Recommendations, Classification',
        external_services: 'Payments - Stripe, Email - SendGrid, SMS - Twilio, Analytics - GA4',
        created_at: '2025-11-01T09:45:00.000000Z',
        updated_at: '2025-11-01T09:45:00.000000Z',
    },
    memberIds: [2, 3, 4],
};

// ---------------------------------------------------------------------------
// Project 2 — overview and modules done, later artifacts not generated yet
// ---------------------------------------------------------------------------

const clinicOverview = `# Clinic Booking — System Overview

## Problem
Small clinics book appointments by phone, which causes double bookings, long hold times and frequent no-shows.

## Solution
An online booking system where patients pick a doctor and a free slot, receive reminders, and clinics manage schedules from one dashboard.

## Target Users
- **Patients** — book, reschedule and cancel appointments
- **Doctors** — manage availability and see the daily agenda
- **Receptionists** — handle walk-ins and confirm bookings

## Core Capabilities
1. Doctor availability and slot generation
2. Online booking with SMS and email reminders
3. Patient records and visit history
4. Clinic dashboard with daily occupancy
`;

const clinicModuleSpecs: ModuleSpec[] = [
    {
        id: 21,
        name: 'Scheduling',
        description: 'Doctor availability, slot generation and conflict-free booking.',
        status: 'in_progress',
        metrics: ['Zero double bookings', 'Booking flow under 60 seconds'],
        features: [
            {
                id: 201,
                name: 'Doctor Availability',
                summary: 'Doctors define weekly working hours and time off.',
                priority: 'critical',
                status: 'done',
                description:
                    'Weekly recurring availability with exceptions for holidays and leave; slots are generated from availability and visit length.',
                criteria: ['Overlapping availability is rejected', 'Time off removes affected slots'],
                flow: ['Doctor opens the schedule', 'Sets weekly hours', 'Adds time off'],
                metrics: ['Schedule completeness per doctor'],
            },
            {
                id: 202,
                name: 'Online Booking',
                summary: 'Patients pick a doctor and an open slot.',
                priority: 'critical',
                status: 'in_progress',
                description: 'Patients filter by specialty, see open slots and confirm a booking; the slot is locked while the patient confirms.',
                criteria: ['A slot can be booked only once', 'Patients receive a confirmation SMS'],
                flow: ['Choose a specialty', 'Pick a doctor and slot', 'Confirm with phone number'],
                metrics: ['Online bookings share', 'Booking completion rate'],
            },
        ],
    },
    {
        id: 22,
        name: 'Reminders',
        description: 'SMS and email reminders that reduce no-shows.',
        status: 'planned',
        metrics: ['No-show rate down 30%'],
        features: [
            {
                id: 203,
                name: 'Appointment Reminders',
                summary: 'Reminders 24 hours and 2 hours before the visit.',
                priority: 'high',
                status: 'todo',
                description: 'Scheduled jobs send reminders with one-tap confirm or cancel links.',
                criteria: ['Reminders respect the patient time zone', 'Cancelling frees the slot immediately'],
                flow: ['Receive the reminder', 'Tap confirm or cancel'],
                metrics: ['Reminder confirmation rate'],
            },
        ],
    },
    {
        id: 23,
        name: 'Patient Records',
        description: 'Patient profiles and visit history visible to the treating doctor.',
        status: 'planned',
        metrics: ['Record lookup under 2 seconds'],
        features: [
            {
                id: 204,
                name: 'Visit History',
                summary: 'Doctors see past visits and notes before each appointment.',
                priority: 'medium',
                status: 'draft',
                description: 'A chronological list of visits with notes and prescriptions, visible only to clinic staff.',
                criteria: ['Only clinic staff can view records', 'Every access is audit-logged'],
                flow: ['Doctor opens the agenda', 'Selects the next patient', 'Reviews history'],
                metrics: ['Records opened before visits'],
            },
        ],
    },
];

const clinicModules = clinicModuleSpecs.map((spec, index) => module(spec, index + 1));

const clinic: DemoProject = {
    project: {
        id: 2,
        name: 'Clinic Booking System',
        brief: 'Online appointment booking for small clinics: patients book open slots, get reminders and clinics manage doctor schedules in one place.',
        overview: clinicOverview,
        non_functional_requirements: 'HIPAA-style privacy for patient data, 99.5% uptime.',
        technical_details: '',
        status: 'in_progress',
        c4: null,
        erd: null,
        prd_is_synced: false,
        brainstorming_scene: null,
        overview_chat: [],
        user_id: 1,
        progress: 35,
        created_at: '2025-10-20T08:00:00.000000Z',
        updated_at: '2025-10-28T12:20:00.000000Z',
    },
    modules: clinicModules,
    prd: null,
    overviewVersions: [{ overview: clinicOverview, user_prompt: null, created_at: '2025-10-21T09:00:00.000Z' }],
    technicalIntake: {
        id: 2,
        project_id: 2,
        platform_targets: 'Web (Responsive), Mobile - Android, Mobile - iOS',
        frontend_tech: 'Vue (Nuxt)',
        backend_tech: 'Node.js (Nest/Express)',
        database_tech: 'PostgreSQL',
        ai_usage: null,
        external_services: 'SMS - Twilio, Email - Mailgun',
        created_at: '2025-10-20T08:10:00.000000Z',
        updated_at: '2025-10-20T08:10:00.000000Z',
    },
    memberIds: [2],
};

// ---------------------------------------------------------------------------
// Project 3 — brand new, shows the intake wizard (Prepare page)
// ---------------------------------------------------------------------------

const fleet: DemoProject = {
    project: {
        id: 3,
        name: 'Fleet Tracking Dashboard',
        brief: '',
        overview: '',
        non_functional_requirements: '',
        technical_details: '',
        status: 'draft',
        c4: null,
        erd: null,
        brainstorming_scene: null,
        overview_chat: [],
        user_id: 1,
        progress: 0,
        created_at: '2025-10-12T14:00:00.000000Z',
        updated_at: '2025-10-12T14:00:00.000000Z',
    },
    modules: [],
    prd: null,
    overviewVersions: [],
    technicalIntake: null,
    memberIds: [],
};

export const demoProjects: DemoProject[] = [ecommerce, clinic, fleet];

export function findProject(id: number): DemoProject | undefined {
    return demoProjects.find((p) => p.project.id === id);
}

export function findFeature(id: number): { owner: DemoProject; module: ModuleItem; feature: FeatureItem } | undefined {
    for (const owner of demoProjects) {
        for (const mod of owner.modules) {
            const match = mod.features?.find((f) => f.id === id);
            if (match) return { owner, module: mod, feature: match };
        }
    }
    return undefined;
}

/** Invitation from another workspace, shown on the projects index. */
export const pendingInvitations = [
    {
        id: 501,
        project: { id: 99, name: 'Smart Home Hub', brief: 'A dashboard to control and automate smart home devices.' },
        role: 'developer' as const,
        invited_by: { id: 7, name: 'Youssef Adel', avatar: undefined },
        invited_at: '2025-11-07T09:12:00.000Z',
    },
];
