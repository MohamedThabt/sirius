/**
 * Long-form artifacts for the "E-Commerce Platform" demo project.
 * Adapted from database/seeders/ProjectWithFeaturesSeeder.php so the demo shows
 * the same kind of output Sirius generated in production.
 */

export const ecommerceBrief =
    'A multi-vendor e-commerce marketplace where independent sellers list products and shoppers browse, compare and buy them through one fast, trustworthy checkout. Vendors get inventory and order tools; admins get analytics across the whole platform.';

export const ecommerceOverviewV1 = `# E-Commerce Platform — System Overview

## Problem
Independent sellers juggle separate storefronts, payment providers and spreadsheets to run their business. Shoppers face inconsistent checkout experiences and little trust in small vendors.

## Solution
A single **multi-vendor marketplace** that gives sellers a shared storefront, a unified checkout and real-time inventory, while giving shoppers one account, one cart and one trusted payment flow.

## Target Users
- **Shoppers** — browse, compare and purchase products from many vendors.
- **Vendors** — list products, manage stock, fulfil orders and track sales.
- **Administrators** — approve vendors, moderate the catalog and monitor platform health.

## Core Capabilities
1. Account management with role-based access (shopper, vendor, admin)
2. Product catalog with categories, variants and full-text search
3. Persistent cart and a guest-friendly, multi-step checkout
4. Payment processing through multiple gateways with refunds
5. Order tracking with email notifications
6. Vendor portal with sales analytics

## Success Criteria
- Checkout conversion above **3%**
- Payment success rate above **95%**
- p95 page load under **2 seconds**
`;

export const ecommerceOverviewV2 = `${ecommerceOverviewV1}
## High-Level Flow

\`\`\`mermaid
flowchart LR
    Shopper([Shopper]) --> Catalog[Browse & Search Catalog]
    Catalog --> Cart[Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Payment{Payment Gateway}
    Payment -- success --> Order[Order Created]
    Payment -- failure --> Checkout
    Order --> Vendor([Vendor Fulfilment])
    Vendor --> Shipping[Shipment & Tracking]
    Shipping --> Shopper
\`\`\`

## Non-Functional Requirements
| Area | Requirement |
| --- | --- |
| Availability | 99.9% monthly uptime |
| Performance | 10,000 concurrent users, checkout < 3s |
| Security | PCI DSS for payments, GDPR for personal data |
| Scalability | Horizontally scalable API and read replicas |
`;

export const ecommercePrd = `# Product Requirements Document — E-Commerce Platform

| Version | Date | Summary | Author |
| --- | --- | --- | --- |
| 1 | 2025-11-06 | Initial draft | Demo User |

## 1. Why?
The E-Commerce Platform addresses the growing need for a comprehensive, scalable online marketplace that supports multiple vendors, provides seamless shopping experiences, and delivers powerful business intelligence. It replaces fragmented e-commerce tooling with one system for products, orders, payments and insights.

The core value proposition is to empower businesses of all sizes to establish and grow their online presence while giving customers a modern, secure and intuitive shopping experience.

## 2. Goals & Success Metrics
**Business goals**
1. Reach $1M gross merchandise value (GMV) within 6 months of launch
2. Onboard 500+ active vendors in the first year
3. Maintain 60%+ customer retention

**KPIs**
- Daily Active Users: 10,000+
- Net Promoter Score: 50+
- Checkout conversion rate: 3%+
- Average order value: $75+
- Cart abandonment: below 60%
- Payment success rate: 95%+

## 3. Scope
**In scope**
- Authentication and role-based access
- Product catalog with categories, variants and inventory
- Search and filtering
- Persistent cart, guest and registered checkout
- Multiple payment gateways (card, PayPal, bank transfer)
- Order management, tracking and email notifications
- Vendor portal and admin analytics

**Out of scope (Phase 2)**
- Native mobile apps
- AI recommendations
- Multi-language and multi-currency
- Subscriptions and loyalty programs

## 4. User Personas & Journeys
### Persona 1 — Sarah, Online Shopper
*Goal:* find and buy products quickly and securely.

1. Browses categories and searches "wireless headphones under $100"
2. Compares variants and reviews, adds to cart
3. Applies a discount code and checks out as a guest
4. Pays by card and receives a confirmation email
5. Tracks the shipment until delivery

### Persona 2 — Mike, Vendor
*Goal:* manage his catalog and grow sales.

1. Registers as a vendor and completes his profile
2. Adds products with images, variants and stock
3. Receives order notifications and ships orders
4. Reviews sales analytics and adjusts listings

## 5. Customer Journey

\`\`\`mermaid
journey
    title Sarah buys headphones
    section Discover
      Search catalog: 4: Shopper
      Compare variants: 3: Shopper
    section Purchase
      Add to cart: 5: Shopper
      Guest checkout: 4: Shopper
      Pay by card: 4: Shopper, Payment Gateway
    section After purchase
      Confirmation email: 5: Shopper
      Track delivery: 4: Shopper, Vendor
\`\`\`

## 6. Constraints & Assumptions
**Constraints**
- PCI DSS compliance for payments, GDPR for personal data
- 10,000+ concurrent users; transactions complete within 3 seconds
- 99.9% uptime; responsive web only in Phase 1

**Assumptions**
- Users have email access for verification and notifications
- Payment gateways and shipping carriers expose reliable APIs
- Vendors keep product and inventory data accurate

## 7. Risks & Mitigations
| Risk | Mitigation |
| --- | --- |
| Payment gateway outage | Multiple providers with automatic failover and health alerts |
| High cart abandonment | Guest checkout, cart persistence, abandoned-cart emails |
| Overselling stock | Row-level locks during checkout, low-stock alerts |
| Data breach | Encryption at rest and in transit, audits, PCI scans |
| Traffic spikes | Horizontal scaling, Redis caching, CDN, read replicas |

## 8. Release Plan
- **Phase 1 — Foundation (months 1–2):** auth, catalog, cart, single gateway, basic orders
- **Phase 2 — Core (months 3–4):** search, multiple gateways, notifications, vendor portal
- **Phase 3 — Scale (months 5–6):** performance, analytics, reviews, public launch
- **Phase 4 — Growth (7+):** recommendations, mobile apps, international expansion

## 9. Dependencies
**Internal:** engineering, design, QA, DevOps and product management.

**External:** Stripe and PayPal, SendGrid / AWS SES, carrier tracking APIs, AWS, Cloudflare CDN.
`;

export const ecommerceC4 = JSON.stringify(
    {
        title: 'E-Commerce Platform - System Context',
        description: 'High-level system context diagram showing the e-commerce platform and its external interactions',
        type: 'system-context',
        version: '1.0.0',
        metadata: { author: 'Sirius', created: '2025-11-07', updated: '2025-11-07', tags: ['e-commerce', 'multi-vendor', 'system-context'] },
        elements: [
            {
                id: 'customer',
                type: 'person',
                name: 'Customer',
                description: 'Browses and purchases products from the platform',
                isExternal: true,
                position: { x: 350, y: 50 },
            },
            {
                id: 'vendor',
                type: 'person',
                name: 'Vendor',
                description: 'A business that sells products through the platform',
                isExternal: true,
                position: { x: 650, y: 50 },
            },
            {
                id: 'admin',
                type: 'person',
                name: 'Administrator',
                description: 'Manages vendors, catalog and platform settings',
                isExternal: true,
                position: { x: 950, y: 50 },
            },
            {
                id: 'ecommerce-platform',
                type: 'software-system',
                name: 'E-Commerce Platform',
                description: 'Multi-vendor marketplace with catalog, cart, payments and analytics',
                technology: 'Laravel + React',
                isExternal: false,
                position: { x: 650, y: 350 },
            },
            {
                id: 'payment-gateway',
                type: 'software-system',
                name: 'Payment Gateway',
                description: 'Stripe, PayPal and Square payment processing',
                technology: 'REST API',
                isExternal: true,
                position: { x: 250, y: 650 },
            },
            {
                id: 'email-service',
                type: 'software-system',
                name: 'Email Service',
                description: 'Transactional email delivery',
                technology: 'SendGrid / AWS SES',
                isExternal: true,
                position: { x: 550, y: 650 },
            },
            {
                id: 'shipping-api',
                type: 'software-system',
                name: 'Shipping APIs',
                description: 'Rates, labels and shipment tracking',
                technology: 'USPS, FedEx, UPS',
                isExternal: true,
                position: { x: 850, y: 650 },
            },
            {
                id: 'analytics',
                type: 'software-system',
                name: 'Analytics Service',
                description: 'Business intelligence and event tracking',
                technology: 'GA4, Mixpanel',
                isExternal: true,
                position: { x: 1150, y: 650 },
            },
        ],
        relationships: [
            { id: 'rel-1', from: 'customer', to: 'ecommerce-platform', label: 'Browses products, manages cart, places orders', technology: 'HTTPS' },
            { id: 'rel-2', from: 'vendor', to: 'ecommerce-platform', label: 'Manages products, orders and inventory', technology: 'HTTPS' },
            { id: 'rel-3', from: 'admin', to: 'ecommerce-platform', label: 'Manages users, vendors and settings', technology: 'HTTPS' },
            {
                id: 'rel-4',
                from: 'ecommerce-platform',
                to: 'payment-gateway',
                label: 'Processes payments and refunds',
                technology: 'REST API / Webhooks',
            },
            {
                id: 'rel-5',
                from: 'ecommerce-platform',
                to: 'email-service',
                label: 'Sends confirmations and notifications',
                technology: 'SMTP / REST API',
            },
            {
                id: 'rel-6',
                from: 'ecommerce-platform',
                to: 'shipping-api',
                label: 'Gets rates, creates labels, tracks shipments',
                technology: 'REST API',
            },
            { id: 'rel-7', from: 'ecommerce-platform', to: 'analytics', label: 'Tracks behaviour and sales metrics', technology: 'JavaScript SDK' },
            { id: 'rel-8', from: 'email-service', to: 'customer', label: 'Delivers order updates', technology: 'Email' },
            { id: 'rel-9', from: 'email-service', to: 'vendor', label: 'Sends order notifications', technology: 'Email' },
        ],
        layout: { type: 'hierarchical', direction: 'TB' },
    },
    null,
    2,
);

export const authErd = `erDiagram
    users }o--|| roles : "has"
    users ||--o{ password_resets : "requests"
    users ||--o{ sessions : "opens"

    users {
        int id "PK"
        varchar email "UK, NOT NULL"
        varchar password_hash "NOT NULL"
        varchar first_name "NOT NULL"
        varchar last_name "NOT NULL"
        int role_id "FK, NOT NULL, REFERENCES roles(id)"
        varchar status "DEFAULT 'active'"
        timestamp email_verified_at "NULLABLE"
        timestamp created_at "NOT NULL"
    }

    roles {
        int id "PK"
        varchar name "UK, NOT NULL"
        text description "NULLABLE"
    }

    password_resets {
        int id "PK"
        int user_id "FK, NOT NULL, REFERENCES users(id)"
        varchar token_hash "NOT NULL"
        timestamp expires_at "NOT NULL"
    }

    sessions {
        varchar id "PK"
        int user_id "FK, NULLABLE, REFERENCES users(id)"
        varchar ip_address "NULLABLE"
        timestamp last_activity "NOT NULL"
    }`;

export const catalogErd = `erDiagram
    vendors ||--o{ products : "owns"
    categories ||--o{ products : "contains"
    categories ||--o{ categories : "has subcategories"
    products ||--o{ product_variants : "has"
    products ||--o{ product_images : "has"

    vendors {
        int id "PK"
        int user_id "FK, UK, NOT NULL"
        varchar business_name "NOT NULL"
        varchar status "DEFAULT 'pending'"
    }

    categories {
        int id "PK"
        int parent_id "FK, NULLABLE"
        varchar name "NOT NULL"
        varchar slug "UK, NOT NULL"
        boolean is_active "DEFAULT true"
    }

    products {
        int id "PK"
        int vendor_id "FK, NOT NULL"
        int category_id "FK, NOT NULL"
        varchar name "NOT NULL"
        varchar slug "UK, NOT NULL"
        decimal base_price "NOT NULL, CHECK > 0"
        varchar status "DEFAULT 'draft'"
        boolean is_featured "DEFAULT false"
    }

    product_variants {
        int id "PK"
        int product_id "FK, NOT NULL"
        varchar sku "UK, NOT NULL"
        varchar name "NOT NULL"
        decimal price_adjustment "DEFAULT 0.00"
        int stock_quantity "NOT NULL, DEFAULT 0"
    }

    product_images {
        int id "PK"
        int product_id "FK, NOT NULL"
        varchar image_url "NOT NULL"
        boolean is_primary "DEFAULT false"
    }`;

export const checkoutErd = `erDiagram
    users ||--o{ carts : "has"
    carts ||--o{ cart_items : "contains"
    products ||--o{ cart_items : "in cart"
    users ||--o{ orders : "places"
    orders ||--o{ order_items : "contains"
    orders ||--|| shipping_addresses : "ships to"
    discount_codes ||--o{ orders : "applied to"

    carts {
        int id "PK"
        int user_id "FK, NULLABLE"
        varchar session_id "NULLABLE, INDEX"
        timestamp expires_at "NOT NULL"
    }

    cart_items {
        int id "PK"
        int cart_id "FK, NOT NULL"
        int product_id "FK, NOT NULL"
        int variant_id "FK, NULLABLE"
        int quantity "NOT NULL, CHECK > 0"
        decimal price "NOT NULL"
    }

    orders {
        int id "PK"
        int user_id "FK, NULLABLE"
        varchar guest_email "NULLABLE"
        varchar order_number "UK, NOT NULL"
        varchar status "DEFAULT 'pending'"
        decimal total_amount "NOT NULL"
        int discount_code_id "FK, NULLABLE"
    }

    order_items {
        int id "PK"
        int order_id "FK, NOT NULL"
        int product_id "FK, NOT NULL"
        int quantity "NOT NULL"
        decimal unit_price "NOT NULL"
    }

    shipping_addresses {
        int id "PK"
        int order_id "FK, UK, NOT NULL"
        varchar full_name "NOT NULL"
        varchar address_line1 "NOT NULL"
        varchar city "NOT NULL"
        varchar postal_code "NOT NULL"
        varchar country "NOT NULL"
    }

    discount_codes {
        int id "PK"
        varchar code "UK, NOT NULL"
        decimal percent_off "CHECK > 0 AND <= 100"
        timestamp expires_at "NULLABLE"
    }`;

export const paymentsErd = `erDiagram
    orders ||--o{ payments : "paid by"
    payments ||--o{ refunds : "refunded by"

    orders {
        int id "PK"
        varchar order_number "UK, NOT NULL"
        varchar payment_status "DEFAULT 'pending'"
        decimal total_amount "NOT NULL"
    }

    payments {
        int id "PK"
        int order_id "FK, NOT NULL"
        varchar payment_gateway "NOT NULL"
        varchar transaction_id "UK, NOT NULL"
        decimal amount "NOT NULL, CHECK > 0"
        varchar status "DEFAULT 'pending'"
    }

    refunds {
        int id "PK"
        int payment_id "FK, NOT NULL"
        decimal amount "NOT NULL, CHECK > 0"
        varchar reason "NULLABLE"
        varchar status "DEFAULT 'requested'"
    }`;

export const ordersErd = `erDiagram
    orders ||--o{ order_statuses : "has status history"
    orders ||--o{ shipments : "has"

    orders {
        int id "PK"
        varchar order_number "UK, NOT NULL"
        varchar status "DEFAULT 'pending'"
    }

    order_statuses {
        int id "PK"
        int order_id "FK, NOT NULL"
        varchar status "NOT NULL"
        int created_by "FK, NOT NULL"
        timestamp created_at "NOT NULL"
    }

    shipments {
        int id "PK"
        int order_id "FK, NOT NULL"
        varchar carrier "NOT NULL"
        varchar tracking_number "UK, NOT NULL"
        varchar status "DEFAULT 'pending'"
    }`;

/** Project-level ERD: the merged result of every module ERD. */
export const ecommerceErd = `erDiagram
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
        int role_id "FK, NOT NULL"
        varchar status "DEFAULT 'active'"
        timestamp created_at "NOT NULL"
    }

    roles {
        int id "PK"
        varchar name "UK, NOT NULL"
        text description "NULLABLE"
    }

    vendors {
        int id "PK"
        int user_id "FK, UK, NOT NULL"
        varchar business_name "NOT NULL"
        varchar status "DEFAULT 'pending'"
        decimal commission_rate "NOT NULL, DEFAULT 0.10"
    }

    categories {
        int id "PK"
        int parent_id "FK, NULLABLE"
        varchar name "NOT NULL"
        varchar slug "UK, NOT NULL"
        boolean is_active "DEFAULT true"
    }

    products {
        int id "PK"
        int vendor_id "FK, NOT NULL"
        int category_id "FK, NOT NULL"
        varchar name "NOT NULL"
        varchar slug "UK, NOT NULL"
        decimal base_price "NOT NULL, CHECK > 0"
        varchar status "DEFAULT 'draft'"
    }

    product_variants {
        int id "PK"
        int product_id "FK, NOT NULL"
        varchar sku "UK, NOT NULL"
        varchar name "NOT NULL"
        int stock_quantity "NOT NULL, DEFAULT 0"
    }

    product_images {
        int id "PK"
        int product_id "FK, NOT NULL"
        varchar image_url "NOT NULL"
        boolean is_primary "DEFAULT false"
    }

    carts {
        int id "PK"
        int user_id "FK, NULLABLE"
        varchar session_id "NULLABLE, INDEX"
        timestamp expires_at "NOT NULL"
    }

    cart_items {
        int id "PK"
        int cart_id "FK, NOT NULL"
        int product_id "FK, NOT NULL"
        int quantity "NOT NULL, CHECK > 0"
        decimal price "NOT NULL"
    }

    orders {
        int id "PK"
        int user_id "FK, NOT NULL"
        varchar order_number "UK, NOT NULL"
        varchar status "DEFAULT 'pending'"
        decimal total_amount "NOT NULL"
        varchar payment_status "DEFAULT 'pending'"
    }

    order_items {
        int id "PK"
        int order_id "FK, NOT NULL"
        int product_id "FK, NOT NULL"
        int vendor_id "FK, NOT NULL"
        int quantity "NOT NULL, CHECK > 0"
        decimal unit_price "NOT NULL"
    }

    shipping_addresses {
        int id "PK"
        int order_id "FK, UK, NOT NULL"
        varchar address_line1 "NOT NULL"
        varchar city "NOT NULL"
        varchar postal_code "NOT NULL"
        varchar country "NOT NULL"
    }

    payments {
        int id "PK"
        int order_id "FK, NOT NULL"
        varchar payment_gateway "NOT NULL"
        varchar transaction_id "UK, NOT NULL"
        decimal amount "NOT NULL"
        varchar status "DEFAULT 'pending'"
    }

    order_statuses {
        int id "PK"
        int order_id "FK, NOT NULL"
        varchar status "NOT NULL"
        timestamp created_at "NOT NULL"
    }

    shipments {
        int id "PK"
        int order_id "FK, NOT NULL"
        varchar carrier "NOT NULL"
        varchar tracking_number "UK, NOT NULL"
        varchar status "DEFAULT 'pending'"
    }`;

export const loginSequence = `sequenceDiagram
    actor User
    participant UI as Web App
    participant API as Auth API
    participant DB as Database
    participant Mail as Email Service

    User->>UI: Submit email and password
    UI->>API: POST /login
    API->>DB: Find user by email
    DB-->>API: User record
    alt Valid credentials
        API->>API: Verify password hash
        API->>DB: Create session
        API-->>UI: 200 OK + session cookie
        UI-->>User: Redirect to dashboard
    else Invalid credentials
        API-->>UI: 422 Invalid credentials
        UI-->>User: Show error message
    end
    opt Email not verified
        API->>Mail: Send verification link
        UI-->>User: Prompt to verify email
    end`;

export const searchSequence = `sequenceDiagram
    actor Shopper
    participant UI as Web App
    participant API as Catalog API
    participant Cache as Redis Cache
    participant Search as Search Index

    Shopper->>UI: Type query and pick filters
    UI->>API: GET /products?q=headphones&max_price=100
    API->>Cache: Lookup cached result
    alt Cache hit
        Cache-->>API: Cached product page
    else Cache miss
        API->>Search: Full-text query with filters
        Search-->>API: Ranked product IDs
        API->>Cache: Store result (60s TTL)
    end
    API-->>UI: Paginated products + facets
    UI-->>Shopper: Render results and filter counts`;

export const guestCheckoutSequence = `sequenceDiagram
    actor Guest
    participant UI as Checkout UI
    participant API as Order API
    participant Inv as Inventory
    participant Pay as Payment Gateway
    participant Mail as Email Service

    Guest->>UI: Enter email and shipping address
    UI->>API: POST /checkout/guest
    API->>Inv: Reserve stock for cart items
    Inv-->>API: Reservation confirmed
    API->>Pay: Create payment intent
    Pay-->>UI: Client secret
    Guest->>UI: Confirm card details
    UI->>Pay: Confirm payment
    Pay-->>API: Webhook payment_succeeded
    API->>API: Create order and release cart
    API->>Mail: Send order confirmation
    API-->>UI: Order number
    UI-->>Guest: Show confirmation page`;

export const loginWireframe = JSON.stringify({
    screens: [
        {
            id: 'login-screen',
            name: 'Sign In',
            type: 'page',
            children: [
                { id: 'nav', type: 'navbar', items: ['ShopSphere', 'Categories', 'Deals', 'Cart'] },
                {
                    id: 'login-card',
                    type: 'card',
                    children: [
                        { id: 'login-title', type: 'heading', level: 2, text: 'Welcome back' },
                        { id: 'login-sub', type: 'text', text: 'Sign in to track orders and check out faster.' },
                        { id: 'email', type: 'input', text: 'Email address' },
                        { id: 'password', type: 'input', text: 'Password' },
                        { id: 'remember', type: 'checkbox', text: 'Remember me' },
                        { id: 'submit', type: 'button', text: 'Sign in' },
                        { id: 'forgot', type: 'link', text: 'Forgot your password?' },
                        { id: 'divider', type: 'divider' },
                        { id: 'register', type: 'link', text: 'New here? Create an account' },
                    ],
                },
                { id: 'footer', type: 'footer', text: '© ShopSphere' },
            ],
        },
        {
            id: 'register-screen',
            name: 'Create Account',
            type: 'page',
            children: [
                { id: 'nav-2', type: 'navbar', items: ['ShopSphere', 'Categories', 'Deals', 'Cart'] },
                {
                    id: 'register-card',
                    type: 'card',
                    children: [
                        { id: 'register-title', type: 'heading', level: 2, text: 'Create your account' },
                        { id: 'first-name', type: 'input', text: 'First name' },
                        { id: 'last-name', type: 'input', text: 'Last name' },
                        { id: 'reg-email', type: 'input', text: 'Email address' },
                        { id: 'reg-password', type: 'input', text: 'Password' },
                        { id: 'account-type', type: 'radio-group', options: ['Shopper', 'Vendor'] },
                        { id: 'terms', type: 'checkbox', text: 'I agree to the Terms of Service' },
                        { id: 'reg-submit', type: 'button', text: 'Create account' },
                    ],
                },
                { id: 'footer-2', type: 'footer', text: '© ShopSphere' },
            ],
        },
    ],
});

export const searchWireframe = JSON.stringify({
    screens: [
        {
            id: 'search-results',
            name: 'Search Results',
            type: 'page',
            children: [
                { id: 'nav', type: 'navbar', items: ['ShopSphere', 'Categories', 'Deals', 'Cart (2)'] },
                { id: 'crumbs', type: 'breadcrumb', crumbs: [{ label: 'Home' }, { label: 'Electronics' }, { label: 'Headphones' }] },
                {
                    id: 'layout',
                    type: 'grid',
                    columnsCount: 2,
                    gap: 16,
                    children: [
                        {
                            id: 'filters',
                            type: 'card',
                            children: [
                                { id: 'filters-title', type: 'heading', level: 3, text: 'Filters' },
                                { id: 'category', type: 'select', text: 'Category', options: ['All', 'Over-ear', 'In-ear', 'Gaming'] },
                                { id: 'brand', type: 'checkbox', text: 'Only top-rated brands' },
                                { id: 'in-stock', type: 'switch', text: 'In stock only' },
                                { id: 'rating', type: 'radio-group', options: ['4★ & up', '3★ & up', 'Any'] },
                                { id: 'apply', type: 'button', text: 'Apply filters' },
                            ],
                        },
                        {
                            id: 'results',
                            type: 'container',
                            children: [
                                { id: 'search', type: 'input', text: 'Search products…' },
                                {
                                    id: 'products',
                                    type: 'datatable',
                                    columns: ['Product', 'Vendor', 'Price', 'Rating'],
                                    rows: [
                                        ['Aurora ANC Headphones', 'SoundLab', '$89.00', '4.7'],
                                        ['Pulse Wireless Buds', 'NovaTech', '$59.00', '4.4'],
                                        ['Studio Monitor X2', 'AudioWorks', '$99.00', '4.8'],
                                        ['Bass Boost Pro', 'SoundLab', '$74.00', '4.2'],
                                    ],
                                },
                                { id: 'pager', type: 'pagination', total: 8, page: 1 },
                            ],
                        },
                    ],
                },
                { id: 'footer', type: 'footer', text: '© ShopSphere' },
            ],
        },
    ],
});

export const guestCheckoutWireframe = JSON.stringify({
    screens: [
        {
            id: 'checkout-details',
            name: 'Shipping Details',
            type: 'page',
            children: [
                { id: 'nav', type: 'navbar', items: ['ShopSphere', 'Secure Checkout'] },
                { id: 'steps', type: 'progress', value: 33 },
                {
                    id: 'checkout-grid',
                    type: 'grid',
                    columnsCount: 2,
                    gap: 16,
                    children: [
                        {
                            id: 'shipping-card',
                            type: 'card',
                            children: [
                                { id: 'contact-title', type: 'heading', level: 3, text: 'Contact & Shipping' },
                                { id: 'guest-email', type: 'input', text: 'Email for order updates' },
                                { id: 'full-name', type: 'input', text: 'Full name' },
                                { id: 'address', type: 'input', text: 'Street address' },
                                { id: 'city', type: 'input', text: 'City' },
                                { id: 'country', type: 'select', text: 'Country', options: ['Egypt', 'United States', 'Germany'] },
                                { id: 'create-account', type: 'checkbox', text: 'Create an account after checkout' },
                                { id: 'continue', type: 'button', text: 'Continue to payment' },
                            ],
                        },
                        {
                            id: 'summary-card',
                            type: 'card',
                            children: [
                                { id: 'summary-title', type: 'heading', level: 3, text: 'Order Summary' },
                                {
                                    id: 'summary-table',
                                    type: 'datatable',
                                    columns: ['Item', 'Qty', 'Total'],
                                    rows: [
                                        ['Aurora ANC Headphones', '1', '$89.00'],
                                        ['USB-C Charging Cable', '2', '$18.00'],
                                    ],
                                },
                                { id: 'discount', type: 'input', text: 'Discount code' },
                                { id: 'total', type: 'text', text: 'Total: $107.00' },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: 'checkout-payment',
            name: 'Payment',
            type: 'page',
            children: [
                { id: 'nav-2', type: 'navbar', items: ['ShopSphere', 'Secure Checkout'] },
                { id: 'steps-2', type: 'progress', value: 66 },
                {
                    id: 'payment-card',
                    type: 'card',
                    children: [
                        { id: 'payment-title', type: 'heading', level: 3, text: 'Payment Method' },
                        { id: 'method', type: 'radio-group', options: ['Credit / Debit Card', 'PayPal', 'Bank Transfer'] },
                        { id: 'card-number', type: 'input', text: 'Card number' },
                        { id: 'expiry', type: 'input', text: 'MM / YY' },
                        { id: 'cvc', type: 'input', text: 'CVC' },
                        { id: 'pay', type: 'button', text: 'Pay $107.00' },
                    ],
                },
                { id: 'secure-note', type: 'text', text: 'Payments are processed securely. We never store your card details.' },
            ],
        },
    ],
});
