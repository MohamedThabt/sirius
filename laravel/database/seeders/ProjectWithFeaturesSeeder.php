<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\Project;
use App\Models\ProjectOverviewVersion;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectWithFeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'moahmed@example.com'],
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

        $features = [
            [
                'project_id' => $project->id,
                'name' => 'User Authentication & Authorization',
                'summary' => 'Implement secure user registration, login, password reset, and role-based access control for customers, vendors, and administrators.',
                'priority' => 'critical',
                'status' => 'completed',
                'order_of_implementation' => 1,
                'description' => 'This feature includes JWT-based authentication, OAuth2 integration, two-factor authentication, and session management. Users can register with email verification, reset passwords securely, and manage their profiles.',
                'acceptance_criteria' => "1. Users can register with email and password\n2. Email verification is required before account activation\n3. Password reset functionality works via email\n4. JWT tokens are issued upon successful login\n5. Role-based permissions are enforced\n6. Session timeout after 30 minutes of inactivity",
                'user_flows' => "1. Registration Flow: User enters email/password → Receives verification email → Clicks link → Account activated\n2. Login Flow: User enters credentials → System validates → JWT token issued → Redirect to dashboard\n3. Password Reset: User clicks 'Forgot Password' → Enters email → Receives reset link → Sets new password",
                'metrics' => 'Authentication success rate: >99%, Average login time: <2 seconds, Password reset completion rate: >80%',
                'erd' => <<<'MERMAID'
erDiagram
    users ||--o{ sessions : "has many"
    users ||--o{ oauth_tokens : "has many"
    users ||--|| two_factor_auth : "has one"
    users }o--|| roles : "belongs to"
    roles ||--o{ role_permissions : "has many"
    permissions ||--o{ role_permissions : "has many"

    users {
        int id PK
        varchar email UK "unique, not null"
        varchar password_hash "not null"
        varchar first_name
        varchar last_name
        varchar phone
        timestamp email_verified_at
        int role_id FK "not null"
        varchar status "default: active"
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    roles {
        int id PK
        varchar name UK "unique, not null"
        text description
        timestamp created_at
        timestamp updated_at
    }

    permissions {
        int id PK
        varchar name UK "unique, not null"
        text description
        varchar resource "not null"
        varchar action "not null"
        timestamp created_at
        timestamp updated_at
    }

    role_permissions {
        int id PK
        int role_id FK "not null"
        int permission_id FK "not null"
        timestamp created_at
    }

    password_resets {
        int id PK
        varchar email "not null"
        varchar token "not null"
        timestamp created_at
        timestamp expires_at "not null"
    }

    sessions {
        varchar id PK
        int user_id FK
        varchar ip_address
        text user_agent
        text payload "not null"
        timestamp last_activity "not null"
    }

    oauth_tokens {
        int id PK
        int user_id FK "not null"
        varchar provider "not null"
        varchar provider_user_id "not null"
        text access_token "not null"
        text refresh_token
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    two_factor_auth {
        int id PK
        int user_id FK "unique, not null"
        varchar secret_key "not null"
        text recovery_codes
        timestamp enabled_at
        timestamp created_at
        timestamp updated_at
    }
MERMAID
                ,
                'sequence_diagram' => <<<'MERMAID'
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant AuthService
    participant Database
    participant EmailService
    participant JWTService

    %% Registration Flow
    User->>Frontend: Enter registration details
    Frontend->>AuthController: POST /api/register
    AuthController->>AuthService: validateAndCreateUser()
    AuthService->>Database: Check email uniqueness
    Database-->>AuthService: Email available
    AuthService->>Database: Create user record
    Database-->>AuthService: User created
    AuthService->>EmailService: Send verification email
    EmailService-->>User: Verification email sent
    AuthService-->>AuthController: Registration successful
    AuthController-->>Frontend: 201 Created
    Frontend-->>User: Show success message

    %% Email Verification Flow
    User->>Frontend: Click verification link
    Frontend->>AuthController: GET /api/verify-email?token=xxx
    AuthController->>AuthService: verifyEmail(token)
    AuthService->>Database: Update email_verified_at
    Database-->>AuthService: Email verified
    AuthService-->>AuthController: Verification successful
    AuthController-->>Frontend: 200 OK
    Frontend-->>User: Account activated

    %% Login Flow
    User->>Frontend: Enter credentials
    Frontend->>AuthController: POST /api/login
    AuthController->>AuthService: authenticate(email, password)
    AuthService->>Database: Find user by email
    Database-->>AuthService: User found
    AuthService->>AuthService: Verify password hash
    AuthService->>JWTService: Generate JWT token
    JWTService-->>AuthService: JWT token
    AuthService->>Database: Update last_login_at
    Database-->>AuthService: Login recorded
    AuthService-->>AuthController: Auth successful + token
    AuthController-->>Frontend: 200 OK + JWT
    Frontend->>Frontend: Store JWT in localStorage
    Frontend-->>User: Redirect to dashboard

    %% Password Reset Flow
    User->>Frontend: Click "Forgot Password"
    Frontend->>AuthController: POST /api/password/forgot
    AuthController->>AuthService: initiatePasswordReset(email)
    AuthService->>Database: Create password reset token
    Database-->>AuthService: Token created
    AuthService->>EmailService: Send reset email
    EmailService-->>User: Password reset email
    User->>Frontend: Click reset link
    Frontend->>AuthController: POST /api/password/reset
    AuthController->>AuthService: resetPassword(token, newPassword)
    AuthService->>Database: Validate token & update password
    Database-->>AuthService: Password updated
    AuthService-->>AuthController: Reset successful
    AuthController-->>Frontend: 200 OK
    Frontend-->>User: Password changed successfully
MERMAID
                ,
                'wireframe' => json_encode([
                    'id' => 'auth-page',
                    'type' => 'page',
                    'children' => [
                        [
                            'id' => 'auth-header',
                            'type' => 'section',
                            'layout' => 'column',
                            'children' => [
                                ['id' => 'logo', 'type' => 'image', 'text' => 'E-Commerce Logo'],
                                ['id' => 'auth-title', 'type' => 'heading', 'level' => 1, 'text' => 'Welcome Back'],
                            ],
                        ],
                        [
                            'id' => 'auth-tabs',
                            'type' => 'tabs',
                            'itemsMap' => [
                                ['id' => 'login', 'label' => 'Login'],
                                ['id' => 'register', 'label' => 'Register'],
                            ],
                            'children' => [
                                [
                                    'id' => 'login-form',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'email-input', 'type' => 'input', 'text' => 'Email Address'],
                                        ['id' => 'password-input', 'type' => 'input', 'text' => 'Password'],
                                        ['id' => 'remember-me', 'type' => 'checkbox', 'text' => 'Remember me'],
                                        ['id' => 'login-button', 'type' => 'button', 'text' => 'Login'],
                                        ['id' => 'forgot-password-link', 'type' => 'link', 'text' => 'Forgot password?'],
                                        ['id' => 'divider-1', 'type' => 'divider'],
                                        ['id' => 'oauth-text', 'type' => 'text', 'text' => 'Or continue with'],
                                        [
                                            'id' => 'oauth-buttons',
                                            'type' => 'container',
                                            'layout' => 'row',
                                            'children' => [
                                                ['id' => 'google-btn', 'type' => 'button', 'text' => 'Google'],
                                                ['id' => 'facebook-btn', 'type' => 'button', 'text' => 'Facebook'],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        ['id' => 'footer', 'type' => 'footer', 'text' => '© 2025 E-Commerce Platform'],
                    ],
                ]),
            ],
            [
                'project_id' => $project->id,
                'name' => 'Product Catalog Management',
                'summary' => 'Create a comprehensive product management system with categories, variants, inventory tracking, and search functionality.',
                'priority' => 'high',
                'status' => 'in_progress',
                'order_of_implementation' => 2,
                'description' => 'The product catalog will support multiple product types, variants (size, color, etc.), categories, tags, and advanced filtering. Vendors can add, edit, and manage their products with rich media support.',
                'acceptance_criteria' => "1. Vendors can create products with name, description, price, and images\n2. Products support multiple variants (size, color, material)\n3. Inventory levels are tracked and updated in real-time\n4. Products can be organized into categories and subcategories\n5. Advanced search with filters (price range, category, rating)\n6. Product images support multiple formats and sizes",
                'user_flows' => "1. Vendor adds product: Fill form → Upload images → Set variants → Set inventory → Publish\n2. Customer browses: View categories → Apply filters → View product details → Add to cart\n3. Search: Enter query → View results → Filter results → Select product",
                'metrics' => 'Product creation time: <5 minutes, Search response time: <500ms, Catalog page load time: <2 seconds',
                'erd' => <<<'MERMAID'
erDiagram
    vendors ||--o{ products : "owns"
    categories ||--o{ products : "contains"
    categories ||--o{ categories : "has subcategories"
    products ||--o{ product_variants : "has"
    products ||--o{ product_images : "has"
    products ||--o{ inventory : "tracks"
    products ||--o{ product_tags : "tagged with"
    product_variants ||--o{ product_variant_attributes : "has"
    product_variants ||--o{ inventory : "tracks"
    tags ||--o{ product_tags : "applied to"
    users ||--|| vendors : "is"

    products {
        int id PK
        int vendor_id FK "not null"
        int category_id FK
        varchar name "not null"
        varchar slug UK "unique, not null"
        text description
        decimal base_price "not null"
        varchar sku UK
        varchar status "default: draft"
        boolean is_featured "default: false"
        timestamp published_at
        timestamp created_at
        timestamp updated_at
    }

    categories {
        int id PK
        int parent_id FK
        varchar name "not null"
        varchar slug UK "unique, not null"
        text description
        varchar image_url
        int sort_order "default: 0"
        boolean is_active "default: true"
        timestamp created_at
        timestamp updated_at
    }

    product_variants {
        int id PK
        int product_id FK "not null"
        varchar sku UK "unique, not null"
        varchar name "not null"
        decimal price_adjustment "default: 0"
        int stock_quantity "default: 0"
        boolean is_active "default: true"
        timestamp created_at
        timestamp updated_at
    }

    product_variant_attributes {
        int id PK
        int variant_id FK "not null"
        varchar attribute_name "not null"
        varchar attribute_value "not null"
        timestamp created_at
    }

    product_images {
        int id PK
        int product_id FK "not null"
        varchar image_url "not null"
        varchar alt_text
        int sort_order "default: 0"
        boolean is_primary "default: false"
        timestamp created_at
    }

    inventory {
        int id PK
        int product_id FK
        int variant_id FK
        int quantity "not null, default: 0"
        int reserved_quantity "default: 0"
        int available_quantity "not null, default: 0"
        int low_stock_threshold "default: 10"
        timestamp last_restocked_at
        timestamp created_at
        timestamp updated_at
    }

    vendors {
        int id PK
        int user_id FK "unique, not null"
        varchar business_name "not null"
        varchar business_email
        varchar business_phone
        text description
        varchar logo_url
        varchar status "default: pending"
        decimal commission_rate "default: 10.00"
        timestamp created_at
        timestamp updated_at
    }

    tags {
        int id PK
        varchar name UK "unique, not null"
        varchar slug UK "unique, not null"
        timestamp created_at
    }

    product_tags {
        int product_id FK "not null"
        int tag_id FK "not null"
        timestamp created_at
    }
MERMAID
                ,
                'sequence_diagram' => <<<'MERMAID'
sequenceDiagram
    participant Vendor
    participant Frontend
    participant ProductController
    participant ProductService
    participant Database
    participant ImageService
    participant SearchIndexer

    %% Create Product Flow
    Vendor->>Frontend: Fill product form
    Frontend->>ProductController: POST /api/products
    ProductController->>ProductService: validateProductData()
    ProductService-->>ProductController: Validation passed
    ProductController->>ProductService: createProduct()
    ProductService->>Database: Insert product record
    Database-->>ProductService: Product created (ID)
    ProductService->>ImageService: Upload product images
    ImageService->>ImageService: Resize & optimize images
    ImageService-->>ProductService: Images uploaded
    ProductService->>Database: Insert product_images records
    Database-->>ProductService: Images saved
    ProductService->>SearchIndexer: Index product for search
    SearchIndexer-->>ProductService: Product indexed
    ProductService-->>ProductController: Product created successfully
    ProductController-->>Frontend: 201 Created + product data
    Frontend-->>Vendor: Show success message

    %% Add Variants Flow
    Vendor->>Frontend: Add product variants
    Frontend->>ProductController: POST /api/products/{id}/variants
    ProductController->>ProductService: addVariants(productId, variants)
    ProductService->>Database: Insert variant records
    Database-->>ProductService: Variants created
    ProductService->>Database: Initialize inventory for variants
    Database-->>ProductService: Inventory initialized
    ProductService-->>ProductController: Variants added
    ProductController-->>Frontend: 200 OK
    Frontend-->>Vendor: Variants added successfully

    %% Customer Browse Flow
    participant Customer
    Customer->>Frontend: Browse category
    Frontend->>ProductController: GET /api/categories/{id}/products
    ProductController->>ProductService: getProductsByCategory(categoryId)
    ProductService->>Database: Query products with filters
    Database-->>ProductService: Product list
    ProductService->>Database: Load images & variants
    Database-->>ProductService: Product details
    ProductService-->>ProductController: Products data
    ProductController-->>Frontend: 200 OK + products
    Frontend-->>Customer: Display product grid

    %% Search Flow
    Customer->>Frontend: Search "wireless headphones"
    Frontend->>ProductController: GET /api/products/search?q=wireless+headphones
    ProductController->>SearchIndexer: Search products
    SearchIndexer-->>ProductController: Search results
    ProductController->>ProductService: enrichSearchResults(productIds)
    ProductService->>Database: Load full product data
    Database-->>ProductService: Product details
    ProductService-->>ProductController: Enriched results
    ProductController-->>Frontend: 200 OK + results
    Frontend-->>Customer: Display search results

    %% Inventory Update Flow
    Vendor->>Frontend: Update inventory
    Frontend->>ProductController: PUT /api/products/{id}/inventory
    ProductController->>ProductService: updateInventory(productId, quantity)
    ProductService->>Database: Update inventory record
    Database-->>ProductService: Inventory updated
    ProductService->>ProductService: Check low stock threshold
    ProductService-->>ProductController: Update successful
    ProductController-->>Frontend: 200 OK
    Frontend-->>Vendor: Inventory updated
MERMAID
                ,
                'wireframe' => json_encode([
                    'id' => 'product-catalog-page',
                    'type' => 'page',
                    'children' => [
                        [
                            'id' => 'breadcrumb',
                            'type' => 'breadcrumb',
                            'crumbs' => [
                                ['label' => 'Home'],
                                ['label' => 'Products'],
                                ['label' => 'Electronics'],
                            ],
                        ],
                        [
                            'id' => 'catalog-header',
                            'type' => 'section',
                            'layout' => 'column',
                            'children' => [
                                ['id' => 'catalog-title', 'type' => 'heading', 'level' => 1, 'text' => 'Product Catalog'],
                                [
                                    'id' => 'header-actions',
                                    'type' => 'container',
                                    'layout' => 'row',
                                    'children' => [
                                        ['id' => 'search-input', 'type' => 'input', 'text' => 'Search products...'],
                                        ['id' => 'add-product-btn', 'type' => 'button', 'text' => 'Add Product'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'catalog-grid',
                            'type' => 'grid',
                            'columnsCount' => 4,
                            'gap' => 20,
                            'children' => [
                                [
                                    'id' => 'filters-sidebar',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'filters-title', 'type' => 'heading', 'level' => 3, 'text' => 'Filters'],
                                        ['id' => 'category-filter', 'type' => 'select', 'text' => 'Category'],
                                        ['id' => 'price-range', 'type' => 'text', 'text' => 'Price Range'],
                                        ['id' => 'min-price', 'type' => 'input', 'text' => 'Min'],
                                        ['id' => 'max-price', 'type' => 'input', 'text' => 'Max'],
                                        ['id' => 'in-stock-only', 'type' => 'checkbox', 'text' => 'In Stock Only'],
                                        ['id' => 'featured-only', 'type' => 'checkbox', 'text' => 'Featured'],
                                        ['id' => 'apply-filters-btn', 'type' => 'button', 'text' => 'Apply Filters'],
                                    ],
                                ],
                                [
                                    'id' => 'products-section',
                                    'type' => 'container',
                                    'layout' => 'column',
                                    'children' => [
                                        [
                                            'id' => 'products-datatable',
                                            'type' => 'datatable',
                                            'columns' => ['Image', 'Name', 'SKU', 'Price', 'Stock', 'Status', 'Actions'],
                                            'rows' => [],
                                        ],
                                        ['id' => 'pagination', 'type' => 'pagination', 'total' => 10, 'page' => 1],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ]),
            ],
            [
                'project_id' => $project->id,
                'name' => 'Shopping Cart & Checkout',
                'summary' => 'Implement shopping cart functionality with persistent storage, guest checkout, and multiple payment gateway integration.',
                'priority' => 'high',
                'status' => 'in_progress',
                'order_of_implementation' => 3,
                'description' => 'Users can add products to cart, modify quantities, apply discount codes, and proceed through a multi-step checkout process. The cart persists across sessions and supports both registered and guest users.',
                'acceptance_criteria' => "1. Users can add/remove items from cart\n2. Cart persists across browser sessions\n3. Guest checkout is supported\n4. Multiple payment methods (credit card, PayPal, bank transfer)\n5. Order summary shows taxes and shipping costs\n6. Order confirmation email is sent after purchase",
                'user_flows' => "1. Add to cart: Browse product → Select variant → Add to cart → View cart\n2. Checkout: Review cart → Enter shipping info → Select payment → Confirm order\n3. Guest checkout: Add items → Enter email → Complete checkout → Create account option",
                'metrics' => 'Cart abandonment rate: <60%, Checkout completion time: <3 minutes, Payment success rate: >95%',
                'erd' => <<<'MERMAID'
erDiagram
    users ||--o{ carts : "has"
    users ||--o{ orders : "places"
    carts ||--o{ cart_items : "contains"
    products ||--o{ cart_items : "in cart"
    product_variants ||--o{ cart_items : "selected"
    orders ||--o{ order_items : "contains"
    orders ||--|| shipping_addresses : "ships to"
    orders ||--o{ payments : "paid by"
    orders ||--o{ order_discounts : "has"
    products ||--o{ order_items : "ordered"
    product_variants ||--o{ order_items : "ordered"
    vendors ||--o{ order_items : "fulfills"
    discount_codes ||--o{ order_discounts : "applied to"

    carts {
        int id PK
        int user_id FK
        varchar session_id
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    cart_items {
        int id PK
        int cart_id FK "not null"
        int product_id FK "not null"
        int variant_id FK
        int quantity "not null, default: 1"
        decimal price "not null"
        timestamp created_at
        timestamp updated_at
    }

    orders {
        int id PK
        int user_id FK
        varchar order_number UK "unique, not null"
        varchar guest_email
        varchar status "default: pending"
        decimal subtotal "not null"
        decimal tax_amount "default: 0"
        decimal shipping_cost "default: 0"
        decimal discount_amount "default: 0"
        decimal total_amount "not null"
        varchar payment_method
        varchar payment_status "default: pending"
        text notes
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        int id PK
        int order_id FK "not null"
        int product_id FK "not null"
        int variant_id FK
        int vendor_id FK "not null"
        int quantity "not null"
        decimal unit_price "not null"
        decimal total_price "not null"
        timestamp created_at
    }

    shipping_addresses {
        int id PK
        int order_id FK "not null"
        varchar first_name "not null"
        varchar last_name "not null"
        varchar email "not null"
        varchar phone
        varchar address_line1 "not null"
        varchar address_line2
        varchar city "not null"
        varchar state
        varchar postal_code "not null"
        varchar country "not null"
        timestamp created_at
    }

    payments {
        int id PK
        int order_id FK "not null"
        varchar payment_gateway "not null"
        varchar transaction_id
        decimal amount "not null"
        varchar currency "default: USD"
        varchar status "default: pending"
        varchar payment_method
        varchar card_last_four
        text metadata
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }

    discount_codes {
        int id PK
        varchar code UK "unique, not null"
        varchar type "not null"
        decimal value "not null"
        decimal min_order_amount
        decimal max_discount_amount
        int usage_limit
        int used_count "default: 0"
        timestamp starts_at
        timestamp expires_at
        boolean is_active "default: true"
        timestamp created_at
        timestamp updated_at
    }

    order_discounts {
        int id PK
        int order_id FK "not null"
        int discount_code_id FK
        decimal discount_amount "not null"
        timestamp created_at
    }
MERMAID
                ,
                'sequence_diagram' => <<<'MERMAID'
sequenceDiagram
    participant Customer
    participant Frontend
    participant CartController
    participant CartService
    participant CheckoutController
    participant PaymentGateway
    participant Database
    participant EmailService

    %% Add to Cart Flow
    Customer->>Frontend: Click "Add to Cart"
    Frontend->>CartController: POST /api/cart/items
    CartController->>CartService: addToCart(productId, variantId, quantity)
    CartService->>Database: Check product availability
    Database-->>CartService: Product available
    CartService->>Database: Insert/Update cart_item
    Database-->>CartService: Item added
    CartService-->>CartController: Cart updated
    CartController-->>Frontend: 200 OK + cart data
    Frontend-->>Customer: Show cart badge update

    %% View Cart Flow
    Customer->>Frontend: Navigate to cart
    Frontend->>CartController: GET /api/cart
    CartController->>CartService: getCart(userId/sessionId)
    CartService->>Database: Load cart with items
    Database-->>CartService: Cart data
    CartService->>CartService: Calculate totals
    CartService-->>CartController: Cart with totals
    CartController-->>Frontend: 200 OK + cart
    Frontend-->>Customer: Display cart items

    %% Apply Discount Code Flow
    Customer->>Frontend: Enter discount code
    Frontend->>CartController: POST /api/cart/discount
    CartController->>CartService: validateDiscountCode(code)
    CartService->>Database: Find discount code
    Database-->>CartService: Code details
    CartService->>CartService: Validate code (expiry, usage)
    CartService->>CartService: Calculate discount
    CartService-->>CartController: Discount applied
    CartController-->>Frontend: 200 OK + updated totals
    Frontend-->>Customer: Show discount applied

    %% Checkout Flow
    Customer->>Frontend: Proceed to checkout
    Frontend->>CheckoutController: POST /api/checkout/init
    CheckoutController->>CartService: getCart()
    CartService-->>CheckoutController: Cart items
    CheckoutController->>Database: Create order (pending)
    Database-->>CheckoutController: Order created
    CheckoutController-->>Frontend: 200 OK + order ID
    Frontend-->>Customer: Show checkout form

    %% Submit Shipping Info
    Customer->>Frontend: Enter shipping details
    Frontend->>CheckoutController: POST /api/checkout/shipping
    CheckoutController->>Database: Save shipping address
    Database-->>CheckoutController: Address saved
    CheckoutController->>CheckoutController: Calculate shipping cost
    CheckoutController-->>Frontend: 200 OK + updated totals
    Frontend-->>Customer: Show payment options

    %% Process Payment Flow
    Customer->>Frontend: Select payment & submit
    Frontend->>CheckoutController: POST /api/checkout/payment
    CheckoutController->>PaymentGateway: Process payment
    PaymentGateway-->>CheckoutController: Payment successful
    CheckoutController->>Database: Update order status (paid)
    Database-->>CheckoutController: Order updated
    CheckoutController->>Database: Clear cart
    Database-->>CheckoutController: Cart cleared
    CheckoutController->>Database: Update inventory
    Database-->>CheckoutController: Inventory updated
    CheckoutController->>EmailService: Send order confirmation
    EmailService-->>Customer: Order confirmation email
    CheckoutController-->>Frontend: 200 OK + order details
    Frontend-->>Customer: Show order success page

    %% Payment Failure Flow
    alt Payment Failed
        PaymentGateway-->>CheckoutController: Payment failed
        CheckoutController->>Database: Update payment status (failed)
        Database-->>CheckoutController: Status updated
        CheckoutController-->>Frontend: 400 Payment Failed
        Frontend-->>Customer: Show payment error
    end
MERMAID
                ,
                'wireframe' => json_encode([
                    'id' => 'checkout-page',
                    'type' => 'page',
                    'children' => [
                        [
                            'id' => 'breadcrumb',
                            'type' => 'breadcrumb',
                            'crumbs' => [
                                ['label' => 'Home'],
                                ['label' => 'Cart'],
                                ['label' => 'Checkout'],
                            ],
                        ],
                        [
                            'id' => 'checkout-header',
                            'type' => 'section',
                            'layout' => 'column',
                            'children' => [
                                ['id' => 'checkout-title', 'type' => 'heading', 'level' => 1, 'text' => 'Checkout'],
                                ['id' => 'checkout-progress', 'type' => 'progress', 'value' => 50],
                            ],
                        ],
                        [
                            'id' => 'checkout-grid',
                            'type' => 'grid',
                            'columnsCount' => 2,
                            'gap' => 24,
                            'children' => [
                                [
                                    'id' => 'checkout-form-section',
                                    'type' => 'container',
                                    'layout' => 'column',
                                    'children' => [
                                        [
                                            'id' => 'shipping-card',
                                            'type' => 'card',
                                            'children' => [
                                                ['id' => 'shipping-title', 'type' => 'heading', 'level' => 2, 'text' => 'Shipping Information'],
                                                ['id' => 'email-input', 'type' => 'input', 'text' => 'Email'],
                                                [
                                                    'id' => 'name-row',
                                                    'type' => 'container',
                                                    'layout' => 'row',
                                                    'children' => [
                                                        ['id' => 'first-name', 'type' => 'input', 'text' => 'First Name'],
                                                        ['id' => 'last-name', 'type' => 'input', 'text' => 'Last Name'],
                                                    ],
                                                ],
                                                ['id' => 'address1', 'type' => 'input', 'text' => 'Address Line 1'],
                                                ['id' => 'address2', 'type' => 'input', 'text' => 'Address Line 2 (Optional)'],
                                                [
                                                    'id' => 'city-state-row',
                                                    'type' => 'container',
                                                    'layout' => 'row',
                                                    'children' => [
                                                        ['id' => 'city', 'type' => 'input', 'text' => 'City'],
                                                        ['id' => 'state', 'type' => 'input', 'text' => 'State'],
                                                        ['id' => 'postal-code', 'type' => 'input', 'text' => 'Postal Code'],
                                                    ],
                                                ],
                                                ['id' => 'phone', 'type' => 'input', 'text' => 'Phone Number'],
                                            ],
                                        ],
                                        [
                                            'id' => 'payment-card',
                                            'type' => 'card',
                                            'children' => [
                                                ['id' => 'payment-title', 'type' => 'heading', 'level' => 2, 'text' => 'Payment Method'],
                                                [
                                                    'id' => 'payment-methods',
                                                    'type' => 'radio-group',
                                                    'options' => ['Credit Card', 'PayPal', 'Bank Transfer'],
                                                ],
                                                ['id' => 'card-number', 'type' => 'input', 'text' => 'Card Number'],
                                                [
                                                    'id' => 'card-details-row',
                                                    'type' => 'container',
                                                    'layout' => 'row',
                                                    'children' => [
                                                        ['id' => 'expiry-date', 'type' => 'input', 'text' => 'MM/YY'],
                                                        ['id' => 'cvv', 'type' => 'input', 'text' => 'CVV'],
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                                [
                                    'id' => 'order-summary-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'summary-title', 'type' => 'heading', 'level' => 2, 'text' => 'Order Summary'],
                                        ['id' => 'discount-input', 'type' => 'input', 'text' => 'Discount Code'],
                                        ['id' => 'apply-discount-btn', 'type' => 'button', 'text' => 'Apply'],
                                        ['id' => 'divider-1', 'type' => 'divider'],
                                        ['id' => 'subtotal-text', 'type' => 'text', 'text' => 'Subtotal: $299.99'],
                                        ['id' => 'shipping-text', 'type' => 'text', 'text' => 'Shipping: $15.00'],
                                        ['id' => 'tax-text', 'type' => 'text', 'text' => 'Tax: $25.00'],
                                        ['id' => 'discount-text', 'type' => 'text', 'text' => 'Discount: -$30.00'],
                                        ['id' => 'divider-2', 'type' => 'divider'],
                                        ['id' => 'total-text', 'type' => 'heading', 'level' => 3, 'text' => 'Total: $309.99'],
                                        ['id' => 'place-order-btn', 'type' => 'button', 'text' => 'Place Order'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ]),
            ],
            [
                'project_id' => $project->id,
                'name' => 'Order Management System',
                'summary' => 'Build a comprehensive order tracking and management system for customers, vendors, and administrators.',
                'priority' => 'medium',
                'status' => 'draft',
                'order_of_implementation' => 4,
                'description' => 'The system tracks orders from placement to delivery, sends notifications at each stage, and provides detailed order history. Vendors can manage their orders, update statuses, and generate shipping labels.',
                'acceptance_criteria' => "1. Orders are created with unique order numbers\n2. Order status updates trigger email notifications\n3. Customers can track orders in real-time\n4. Vendors can update order status and shipping info\n5. Order history is accessible for both customers and vendors\n6. Refund and cancellation requests are supported",
                'user_flows' => "1. Order tracking: Customer views order → Checks status → Receives updates → Confirms delivery\n2. Vendor management: View orders → Update status → Print shipping label → Mark as shipped\n3. Admin oversight: View all orders → Filter by status → Export reports → Handle disputes",
                'metrics' => 'Order processing time: <24 hours, Status update accuracy: 100%, Customer satisfaction: >4.5/5',
                'erd' => <<<'MERMAID'
erDiagram
    orders ||--o{ order_statuses : "has status history"
    orders ||--o{ shipments : "has"
    orders ||--o{ returns : "has"
    orders ||--o{ order_notes : "has"
    orders ||--o{ order_notifications : "triggers"
    shipments ||--o{ tracking_events : "has"
    returns ||--o{ return_items : "contains"
    returns ||--o{ refunds : "processes"
    order_items ||--o{ return_items : "can be returned"
    payments ||--o{ refunds : "refunded to"
    users ||--o{ order_statuses : "updates"
    users ||--o{ returns : "approves"
    users ||--o{ order_notes : "creates"

    order_statuses {
        int id PK
        int order_id FK "not null"
        varchar status "not null"
        text notes
        int created_by FK
        timestamp created_at
    }

    shipments {
        int id PK
        int order_id FK "not null"
        varchar carrier "not null"
        varchar tracking_number UK
        varchar shipping_method
        date estimated_delivery_date
        date actual_delivery_date
        varchar status "default: pending"
        timestamp created_at
        timestamp updated_at
    }

    tracking_events {
        int id PK
        int shipment_id FK "not null"
        varchar event_type "not null"
        text description
        varchar location
        timestamp occurred_at "not null"
        timestamp created_at
    }

    returns {
        int id PK
        int order_id FK "not null"
        varchar return_number UK "unique, not null"
        varchar reason "not null"
        varchar status "default: requested"
        decimal refund_amount
        int approved_by FK
        timestamp approved_at
        timestamp created_at
        timestamp updated_at
    }

    return_items {
        int id PK
        int return_id FK "not null"
        int order_item_id FK "not null"
        int quantity "not null"
        text reason
        varchar condition
        timestamp created_at
    }

    refunds {
        int id PK
        int return_id FK "not null"
        int payment_id FK
        decimal amount "not null"
        varchar method "not null"
        varchar transaction_id
        varchar status "default: pending"
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }

    order_notes {
        int id PK
        int order_id FK "not null"
        int user_id FK "not null"
        text note "not null"
        boolean is_customer_visible "default: false"
        timestamp created_at
    }

    order_notifications {
        int id PK
        int order_id FK "not null"
        varchar notification_type "not null"
        varchar recipient_email "not null"
        varchar subject
        text body
        timestamp sent_at
        timestamp created_at
    }
MERMAID
                ,
                'sequence_diagram' => <<<'MERMAID'
sequenceDiagram
    participant Customer
    participant Frontend
    participant OrderController
    participant OrderService
    participant Database
    participant EmailService
    participant ShippingAPI

    %% View Order Details Flow
    Customer->>Frontend: Navigate to order history
    Frontend->>OrderController: GET /api/orders
    OrderController->>OrderService: getUserOrders(userId)
    OrderService->>Database: Query orders by user
    Database-->>OrderService: Order list
    OrderService-->>OrderController: Orders data
    OrderController-->>Frontend: 200 OK + orders
    Frontend-->>Customer: Display order history

    %% Track Order Flow
    Customer->>Frontend: Click track order
    Frontend->>OrderController: GET /api/orders/{id}/track
    OrderController->>OrderService: getOrderTracking(orderId)
    OrderService->>Database: Load shipment data
    Database-->>OrderService: Shipment info
    OrderService->>ShippingAPI: Get tracking events
    ShippingAPI-->>OrderService: Tracking events
    OrderService-->>OrderController: Tracking data
    OrderController-->>Frontend: 200 OK + tracking
    Frontend-->>Customer: Display tracking timeline

    %% Vendor Update Order Status Flow
    participant Vendor
    Vendor->>Frontend: Update order status
    Frontend->>OrderController: PUT /api/orders/{id}/status
    OrderController->>OrderService: updateOrderStatus(orderId, status)
    OrderService->>Database: Insert order_status record
    Database-->>OrderService: Status recorded
    OrderService->>Database: Update order status
    Database-->>OrderService: Order updated
    OrderService->>EmailService: Send status notification
    EmailService-->>Customer: Status update email
    OrderService-->>OrderController: Update successful
    OrderController-->>Frontend: 200 OK
    Frontend-->>Vendor: Status updated

    %% Add Shipping Information Flow
    Vendor->>Frontend: Enter shipping details
    Frontend->>OrderController: POST /api/orders/{id}/shipment
    OrderController->>OrderService: createShipment(orderId, shipmentData)
    OrderService->>Database: Create shipment record
    Database-->>OrderService: Shipment created
    OrderService->>ShippingAPI: Register tracking number
    ShippingAPI-->>OrderService: Tracking registered
    OrderService->>Database: Update order status (shipped)
    Database-->>OrderService: Order updated
    OrderService->>EmailService: Send shipment notification
    EmailService-->>Customer: Shipment email with tracking
    OrderService-->>OrderController: Shipment created
    OrderController-->>Frontend: 200 OK
    Frontend-->>Vendor: Shipment added

    %% Return Request Flow
    Customer->>Frontend: Request return
    Frontend->>OrderController: POST /api/orders/{id}/returns
    OrderController->>OrderService: createReturn(orderId, returnData)
    OrderService->>Database: Create return record
    Database-->>OrderService: Return created
    OrderService->>Database: Create return_items
    Database-->>OrderService: Items added
    OrderService->>EmailService: Notify vendor of return
    EmailService-->>Vendor: Return request email
    OrderService-->>OrderController: Return created
    OrderController-->>Frontend: 200 OK + return details
    Frontend-->>Customer: Return requested successfully

    %% Admin Approve Refund Flow
    participant Admin
    Admin->>Frontend: Approve refund
    Frontend->>OrderController: POST /api/returns/{id}/approve
    OrderController->>OrderService: approveRefund(returnId)
    OrderService->>Database: Update return status (approved)
    Database-->>OrderService: Return approved
    OrderService->>Database: Create refund record
    Database-->>OrderService: Refund created
    OrderService->>EmailService: Send refund notification
    EmailService-->>Customer: Refund approved email
    OrderService-->>OrderController: Refund approved
    OrderController-->>Frontend: 200 OK
    Frontend-->>Admin: Refund processed
MERMAID
                ,
                'wireframe' => json_encode([
                    'id' => 'order-management-page',
                    'type' => 'page',
                    'children' => [
                        [
                            'id' => 'breadcrumb',
                            'type' => 'breadcrumb',
                            'crumbs' => [
                                ['label' => 'Home'],
                                ['label' => 'Vendor Dashboard'],
                                ['label' => 'Orders'],
                            ],
                        ],
                        [
                            'id' => 'orders-header',
                            'type' => 'section',
                            'layout' => 'column',
                            'children' => [
                                ['id' => 'orders-title', 'type' => 'heading', 'level' => 1, 'text' => 'Order Management'],
                                [
                                    'id' => 'header-actions',
                                    'type' => 'container',
                                    'layout' => 'row',
                                    'children' => [
                                        ['id' => 'search-input', 'type' => 'input', 'text' => 'Search orders...'],
                                        ['id' => 'status-filter', 'type' => 'select', 'text' => 'Filter by Status', 'options' => ['All', 'Pending', 'Processing', 'Shipped', 'Delivered']],
                                        ['id' => 'export-btn', 'type' => 'button', 'text' => 'Export Orders'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'stats-grid',
                            'type' => 'grid',
                            'columnsCount' => 4,
                            'gap' => 16,
                            'children' => [
                                [
                                    'id' => 'pending-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'pending-count', 'type' => 'heading', 'level' => 2, 'text' => '24'],
                                        ['id' => 'pending-label', 'type' => 'text', 'text' => 'Pending Orders'],
                                    ],
                                ],
                                [
                                    'id' => 'processing-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'processing-count', 'type' => 'heading', 'level' => 2, 'text' => '18'],
                                        ['id' => 'processing-label', 'type' => 'text', 'text' => 'Processing'],
                                    ],
                                ],
                                [
                                    'id' => 'shipped-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'shipped-count', 'type' => 'heading', 'level' => 2, 'text' => '42'],
                                        ['id' => 'shipped-label', 'type' => 'text', 'text' => 'Shipped'],
                                    ],
                                ],
                                [
                                    'id' => 'delivered-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'delivered-count', 'type' => 'heading', 'level' => 2, 'text' => '156'],
                                        ['id' => 'delivered-label', 'type' => 'text', 'text' => 'Delivered'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'orders-table-section',
                            'type' => 'container',
                            'layout' => 'column',
                            'children' => [
                                [
                                    'id' => 'orders-datatable',
                                    'type' => 'datatable',
                                    'columns' => ['Order #', 'Customer', 'Date', 'Total', 'Status', 'Tracking', 'Actions'],
                                    'rows' => [],
                                ],
                                ['id' => 'pagination', 'type' => 'pagination', 'total' => 15, 'page' => 1],
                            ],
                        ],
                    ],
                ]),
            ],
            [
                'project_id' => $project->id,
                'name' => 'Admin Dashboard & Analytics',
                'summary' => 'Create an administrative dashboard with business intelligence, reporting, and system management tools.',
                'priority' => 'medium',
                'status' => 'draft',
                'order_of_implementation' => 5,
                'description' => 'The admin dashboard provides comprehensive analytics including sales reports, user statistics, product performance, and revenue insights. Admins can manage users, products, orders, and system settings.',
                'acceptance_criteria' => "1. Dashboard displays key metrics (sales, users, orders)\n2. Reports can be filtered by date range and category\n3. User management (create, edit, suspend accounts)\n4. System settings configuration\n5. Export reports to CSV/PDF\n6. Real-time notifications for critical events",
                'user_flows' => "1. View dashboard: Login → See overview → Drill into metrics → Export data\n2. Manage users: Search user → View profile → Edit permissions → Save changes\n3. Generate report: Select report type → Set filters → Generate → Download",
                'metrics' => 'Dashboard load time: <3 seconds, Report generation time: <10 seconds, Data accuracy: 100%',
                'erd' => <<<'MERMAID'
erDiagram
    users ||--o{ sales_reports : "generates"
    users ||--o{ user_activity_logs : "performs"
    users ||--o{ system_settings : "updates"
    users ||--o{ report_schedules : "creates"
    products ||--o{ product_analytics : "tracked"
    vendors ||--o{ vendor_analytics : "tracked"

    analytics_snapshots {
        int id PK
        date snapshot_date UK "unique, not null"
        decimal total_revenue "not null"
        int total_orders "not null"
        int new_users "not null"
        int active_vendors "not null"
        decimal avg_order_value "not null"
        decimal conversion_rate
        decimal cart_abandonment_rate
        timestamp created_at
    }

    sales_reports {
        int id PK
        varchar report_type "not null"
        date start_date "not null"
        date end_date "not null"
        decimal total_sales "not null"
        int total_orders "not null"
        decimal total_refunds
        decimal net_revenue "not null"
        int generated_by FK "not null"
        varchar file_path
        timestamp created_at
    }

    product_analytics {
        int id PK
        int product_id FK "not null"
        int views_count "default: 0"
        int cart_adds_count "default: 0"
        int purchases_count "default: 0"
        decimal revenue_generated "default: 0"
        decimal avg_rating
        int review_count "default: 0"
        date date "not null"
        timestamp created_at
    }

    vendor_analytics {
        int id PK
        int vendor_id FK "not null"
        decimal total_sales "not null"
        int total_orders "not null"
        decimal total_commission "not null"
        int avg_fulfillment_time
        decimal customer_satisfaction_score
        date date "not null"
        timestamp created_at
    }

    user_activity_logs {
        int id PK
        int user_id FK
        varchar action "not null"
        varchar resource_type
        int resource_id
        varchar ip_address
        text user_agent
        text metadata
        timestamp created_at
    }

    system_settings {
        int id PK
        varchar key UK "unique, not null"
        text value
        varchar type "not null"
        text description
        boolean is_public "default: false"
        int updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    admin_notifications {
        int id PK
        varchar type "not null"
        varchar title "not null"
        text message "not null"
        varchar severity "default: info"
        boolean is_read "default: false"
        varchar related_resource_type
        int related_resource_id
        timestamp created_at
    }

    report_schedules {
        int id PK
        varchar report_type "not null"
        varchar frequency "not null"
        text recipients "not null"
        text filters
        boolean is_active "default: true"
        timestamp last_run_at
        timestamp next_run_at "not null"
        int created_by FK "not null"
        timestamp created_at
        timestamp updated_at
    }
MERMAID
                ,
                'sequence_diagram' => <<<'MERMAID'
sequenceDiagram
    participant Admin
    participant Frontend
    participant DashboardController
    participant AnalyticsService
    participant Database
    participant ReportGenerator
    participant EmailService

    %% Load Dashboard Flow
    Admin->>Frontend: Access admin dashboard
    Frontend->>DashboardController: GET /api/admin/dashboard
    DashboardController->>AnalyticsService: getDashboardMetrics()
    AnalyticsService->>Database: Query analytics_snapshots
    Database-->>AnalyticsService: Latest snapshot
    AnalyticsService->>Database: Query real-time metrics
    Database-->>AnalyticsService: Current data
    AnalyticsService->>AnalyticsService: Calculate KPIs
    AnalyticsService-->>DashboardController: Dashboard data
    DashboardController-->>Frontend: 200 OK + metrics
    Frontend-->>Admin: Display dashboard

    %% View Sales Analytics Flow
    Admin->>Frontend: Navigate to sales analytics
    Frontend->>DashboardController: GET /api/admin/analytics/sales
    DashboardController->>AnalyticsService: getSalesAnalytics(dateRange)
    AnalyticsService->>Database: Query orders by date
    Database-->>AnalyticsService: Order data
    AnalyticsService->>Database: Query payments
    Database-->>AnalyticsService: Payment data
    AnalyticsService->>AnalyticsService: Calculate trends
    AnalyticsService-->>DashboardController: Sales analytics
    DashboardController-->>Frontend: 200 OK + analytics
    Frontend-->>Admin: Display charts & graphs

    %% Generate Report Flow
    Admin->>Frontend: Request report generation
    Frontend->>DashboardController: POST /api/admin/reports/generate
    DashboardController->>ReportGenerator: generateReport(type, filters)
    ReportGenerator->>Database: Query relevant data
    Database-->>ReportGenerator: Data results
    ReportGenerator->>ReportGenerator: Format data & create file
    ReportGenerator->>Database: Save report record
    Database-->>ReportGenerator: Report saved
    ReportGenerator-->>DashboardController: Report generated
    DashboardController-->>Frontend: 200 OK + download link
    Frontend-->>Admin: Show download button

    %% Export Report Flow
    Admin->>Frontend: Click export report
    Frontend->>DashboardController: GET /api/admin/reports/{id}/download
    DashboardController->>ReportGenerator: getReportFile(reportId)
    ReportGenerator->>Database: Load report record
    Database-->>ReportGenerator: Report details
    ReportGenerator-->>DashboardController: File stream
    DashboardController-->>Frontend: File download
    Frontend-->>Admin: Download CSV/PDF

    %% User Management Flow
    Admin->>Frontend: Search for user
    Frontend->>DashboardController: GET /api/admin/users?search=john
    DashboardController->>Database: Query users
    Database-->>DashboardController: User list
    DashboardController-->>Frontend: 200 OK + users
    Frontend-->>Admin: Display user results

    Admin->>Frontend: Update user permissions
    Frontend->>DashboardController: PUT /api/admin/users/{id}
    DashboardController->>Database: Update user record
    Database-->>DashboardController: User updated
    DashboardController->>Database: Log activity
    Database-->>DashboardController: Activity logged
    DashboardController-->>Frontend: 200 OK
    Frontend-->>Admin: User updated successfully

    %% System Settings Flow
    Admin->>Frontend: Update system setting
    Frontend->>DashboardController: PUT /api/admin/settings
    DashboardController->>Database: Update system_settings
    Database-->>DashboardController: Settings updated
    DashboardController->>Database: Log activity
    Database-->>DashboardController: Activity logged
    DashboardController-->>Frontend: 200 OK
    Frontend-->>Admin: Settings saved

    %% Schedule Report Flow
    Admin->>Frontend: Schedule recurring report
    Frontend->>DashboardController: POST /api/admin/reports/schedule
    DashboardController->>Database: Create report_schedule
    Database-->>DashboardController: Schedule created
    DashboardController-->>Frontend: 200 OK
    Frontend-->>Admin: Report scheduled

    %% Notifications Flow
    DashboardController->>AnalyticsService: Check for alerts
    AnalyticsService->>Database: Query critical metrics
    Database-->>AnalyticsService: Metrics data
    AnalyticsService->>AnalyticsService: Evaluate thresholds
    
    alt Critical Alert Triggered
        AnalyticsService->>Database: Create admin_notification
        Database-->>AnalyticsService: Notification created
        AnalyticsService->>EmailService: Send alert email
        EmailService-->>Admin: Critical alert email
    end
MERMAID
                ,
                'wireframe' => json_encode([
                    'id' => 'admin-dashboard-page',
                    'type' => 'page',
                    'children' => [
                        [
                            'id' => 'dashboard-header',
                            'type' => 'section',
                            'layout' => 'column',
                            'children' => [
                                ['id' => 'dashboard-title', 'type' => 'heading', 'level' => 1, 'text' => 'Admin Dashboard'],
                                [
                                    'id' => 'header-actions',
                                    'type' => 'container',
                                    'layout' => 'row',
                                    'children' => [
                                        ['id' => 'date-range-picker', 'type' => 'datepicker', 'text' => 'Select Date Range'],
                                        ['id' => 'refresh-btn', 'type' => 'button', 'text' => 'Refresh'],
                                        ['id' => 'export-btn', 'type' => 'button', 'text' => 'Export Report'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'kpi-grid',
                            'type' => 'grid',
                            'columnsCount' => 4,
                            'gap' => 16,
                            'children' => [
                                [
                                    'id' => 'revenue-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'revenue-label', 'type' => 'text', 'text' => 'Total Revenue'],
                                        ['id' => 'revenue-value', 'type' => 'heading', 'level' => 2, 'text' => '$124,582'],
                                        ['id' => 'revenue-change', 'type' => 'text', 'text' => '+12.5% from last month'],
                                    ],
                                ],
                                [
                                    'id' => 'orders-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'orders-label', 'type' => 'text', 'text' => 'Total Orders'],
                                        ['id' => 'orders-value', 'type' => 'heading', 'level' => 2, 'text' => '1,847'],
                                        ['id' => 'orders-change', 'type' => 'text', 'text' => '+8.2% from last month'],
                                    ],
                                ],
                                [
                                    'id' => 'users-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'users-label', 'type' => 'text', 'text' => 'Active Users'],
                                        ['id' => 'users-value', 'type' => 'heading', 'level' => 2, 'text' => '8,932'],
                                        ['id' => 'users-change', 'type' => 'text', 'text' => '+15.3% from last month'],
                                    ],
                                ],
                                [
                                    'id' => 'conversion-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'conversion-label', 'type' => 'text', 'text' => 'Conversion Rate'],
                                        ['id' => 'conversion-value', 'type' => 'heading', 'level' => 2, 'text' => '3.2%'],
                                        ['id' => 'conversion-change', 'type' => 'text', 'text' => '+0.5% from last month'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'charts-section',
                            'type' => 'grid',
                            'columnsCount' => 2,
                            'gap' => 20,
                            'children' => [
                                [
                                    'id' => 'sales-chart-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'sales-chart-title', 'type' => 'heading', 'level' => 3, 'text' => 'Sales Trend'],
                                        ['id' => 'sales-chart-placeholder', 'type' => 'text', 'text' => '[Sales Line Chart]'],
                                    ],
                                ],
                                [
                                    'id' => 'orders-chart-card',
                                    'type' => 'card',
                                    'children' => [
                                        ['id' => 'orders-chart-title', 'type' => 'heading', 'level' => 3, 'text' => 'Orders by Status'],
                                        ['id' => 'orders-chart-placeholder', 'type' => 'text', 'text' => '[Orders Pie Chart]'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'management-tabs',
                            'type' => 'tabs',
                            'itemsMap' => [
                                ['id' => 'users', 'label' => 'Users'],
                                ['id' => 'products', 'label' => 'Products'],
                                ['id' => 'vendors', 'label' => 'Vendors'],
                                ['id' => 'settings', 'label' => 'Settings'],
                            ],
                            'children' => [
                                [
                                    'id' => 'users-tab-content',
                                    'type' => 'container',
                                    'layout' => 'column',
                                    'children' => [
                                        ['id' => 'user-search', 'type' => 'input', 'text' => 'Search users...'],
                                        [
                                            'id' => 'users-datatable',
                                            'type' => 'datatable',
                                            'columns' => ['Name', 'Email', 'Role', 'Status', 'Created', 'Actions'],
                                            'rows' => [],
                                        ],
                                        ['id' => 'users-pagination', 'type' => 'pagination', 'total' => 20, 'page' => 1],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id' => 'activity-section',
                            'type' => 'card',
                            'children' => [
                                ['id' => 'activity-title', 'type' => 'heading', 'level' => 3, 'text' => 'Recent Activity'],
                                ['id' => 'activity-list', 'type' => 'text', 'text' => '[Activity log items]'],
                            ],
                        ],
                    ],
                ]),
            ],
        ];

        foreach ($features as $featureData) {
            Feature::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'name' => $featureData['name'],
                ],
                $featureData
            );
        }

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
