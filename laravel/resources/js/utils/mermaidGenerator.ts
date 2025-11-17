// Mock AI generation for Mermaid sequence diagrams
export const generateMermaidSequence = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();

    // Login flow
    if (lowerPrompt.includes('login') || lowerPrompt.includes('authentication') || lowerPrompt.includes('auth')) {
        return `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant AuthService
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /login
    Backend->>AuthService: Validate credentials
    AuthService->>Database: Query user data
    Database-->>AuthService: User data
    AuthService-->>Backend: Authentication result
    Backend-->>Frontend: JWT token
    Frontend-->>User: Redirect to dashboard`;
    }

    // API flow
    if (lowerPrompt.includes('api') || lowerPrompt.includes('rest') || lowerPrompt.includes('http')) {
        return `sequenceDiagram
    participant Client
    participant API Gateway
    participant AuthService
    participant BusinessService
    participant Database
    
    Client->>API Gateway: HTTP Request
    API Gateway->>AuthService: Validate token
    AuthService-->>API Gateway: Token valid
    API Gateway->>BusinessService: Process request
    BusinessService->>Database: Query data
    Database-->>BusinessService: Data result
    BusinessService-->>API Gateway: Response data
    API Gateway-->>Client: HTTP Response`;
    }

    // Payment flow
    if (lowerPrompt.includes('payment') || lowerPrompt.includes('checkout') || lowerPrompt.includes('billing')) {
        return `sequenceDiagram
    participant User
    participant Frontend
    participant PaymentService
    participant BankAPI
    participant OrderService
    participant Database
    
    User->>Frontend: Initiate payment
    Frontend->>PaymentService: Process payment
    PaymentService->>BankAPI: Charge card
    BankAPI-->>PaymentService: Payment result
    PaymentService->>OrderService: Update order status
    OrderService->>Database: Save transaction
    Database-->>OrderService: Transaction saved
    OrderService-->>PaymentService: Order updated
    PaymentService-->>Frontend: Payment success
    Frontend-->>User: Confirmation`;
    }

    // E-commerce flow
    if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shopping') || lowerPrompt.includes('cart')) {
        return `sequenceDiagram
    participant User
    participant Frontend
    participant CartService
    participant InventoryService
    participant PaymentService
    participant OrderService
    
    User->>Frontend: Add to cart
    Frontend->>CartService: Update cart
    CartService->>InventoryService: Check availability
    InventoryService-->>CartService: Stock available
    CartService-->>Frontend: Cart updated
    User->>Frontend: Proceed to checkout
    Frontend->>PaymentService: Process payment
    PaymentService-->>Frontend: Payment success
    Frontend->>OrderService: Create order
    OrderService-->>Frontend: Order created
    Frontend-->>User: Order confirmation`;
    }

    // User registration
    if (lowerPrompt.includes('register') || lowerPrompt.includes('signup') || lowerPrompt.includes('registration')) {
        return `sequenceDiagram
    participant User
    participant Frontend
    participant ValidationService
    participant UserService
    participant Database
    participant EmailService
    
    User->>Frontend: Submit registration form
    Frontend->>ValidationService: Validate input
    ValidationService-->>Frontend: Validation passed
    Frontend->>UserService: Create user account
    UserService->>Database: Save user data
    Database-->>UserService: User created
    UserService->>EmailService: Send verification email
    EmailService-->>UserService: Email sent
    UserService-->>Frontend: Registration success
    Frontend-->>User: Check email for verification`;
    }

    // File upload
    if (lowerPrompt.includes('upload') || lowerPrompt.includes('file') || lowerPrompt.includes('document')) {
        return `sequenceDiagram
    participant User
    participant Frontend
    participant UploadService
    participant StorageService
    participant Database
    participant NotificationService
    
    User->>Frontend: Select file
    Frontend->>UploadService: Upload file
    UploadService->>StorageService: Save file
    StorageService-->>UploadService: File saved
    UploadService->>Database: Record file metadata
    Database-->>UploadService: Metadata saved
    UploadService->>NotificationService: Send notification
    NotificationService-->>UploadService: Notification sent
    UploadService-->>Frontend: Upload complete
    Frontend-->>User: File uploaded successfully`;
    }

    // Search functionality
    if (lowerPrompt.includes('search') || lowerPrompt.includes('query') || lowerPrompt.includes('find')) {
        return `sequenceDiagram
    participant User
    participant Frontend
    participant SearchService
    participant IndexService
    participant Database
    participant CacheService
    
    User->>Frontend: Enter search query
    Frontend->>SearchService: Process search
    SearchService->>CacheService: Check cache
    CacheService-->>SearchService: Cache miss
    SearchService->>IndexService: Query index
    IndexService->>Database: Search data
    Database-->>IndexService: Search results
    IndexService-->>SearchService: Indexed results
    SearchService->>CacheService: Cache results
    SearchService-->>Frontend: Search results
    Frontend-->>User: Display results`;
    }

    // Default generic flow
    return `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: User action
    Frontend->>Backend: Process request
    Backend->>Database: Query data
    Database-->>Backend: Data result
    Backend-->>Frontend: Response
    Frontend-->>User: Update UI`;
};

// Sample templates for different scenarios
export const mermaidTemplates = {
    login: `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant AuthService
    
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /login
    Backend->>AuthService: Validate credentials
    AuthService->>Database: Query user data
    Database-->>AuthService: User data
    AuthService-->>Backend: Authentication result
    Backend-->>Frontend: JWT token
    Frontend-->>User: Redirect to dashboard`,

    api: `sequenceDiagram
    participant Client
    participant API Gateway
    participant AuthService
    participant BusinessService
    participant Database
    
    Client->>API Gateway: HTTP Request
    API Gateway->>AuthService: Validate token
    AuthService-->>API Gateway: Token valid
    API Gateway->>BusinessService: Process request
    BusinessService->>Database: Query data
    Database-->>BusinessService: Data result
    BusinessService-->>API Gateway: Response data
    API Gateway-->>Client: HTTP Response`,

    payment: `sequenceDiagram
    participant User
    participant Frontend
    participant PaymentService
    participant BankAPI
    participant OrderService
    participant Database
    
    User->>Frontend: Initiate payment
    Frontend->>PaymentService: Process payment
    PaymentService->>BankAPI: Charge card
    BankAPI-->>PaymentService: Payment result
    PaymentService->>OrderService: Update order status
    OrderService->>Database: Save transaction
    Database-->>OrderService: Transaction saved
    OrderService-->>PaymentService: Order updated
    PaymentService-->>Frontend: Payment success
    Frontend-->>User: Confirmation`,

    ecommerce: `sequenceDiagram
    participant User
    participant Frontend
    participant CartService
    participant InventoryService
    participant PaymentService
    participant OrderService
    
    User->>Frontend: Add to cart
    Frontend->>CartService: Update cart
    CartService->>InventoryService: Check availability
    InventoryService-->>CartService: Stock available
    CartService-->>Frontend: Cart updated
    User->>Frontend: Proceed to checkout
    Frontend->>PaymentService: Process payment
    PaymentService-->>Frontend: Payment success
    Frontend->>OrderService: Create order
    OrderService-->>Frontend: Order created
    Frontend-->>User: Order confirmation`,

    registration: `sequenceDiagram
    participant User
    participant Frontend
    participant ValidationService
    participant UserService
    participant Database
    participant EmailService
    
    User->>Frontend: Submit registration form
    Frontend->>ValidationService: Validate input
    ValidationService-->>Frontend: Validation passed
    Frontend->>UserService: Create user account
    UserService->>Database: Save user data
    Database-->>UserService: User created
    UserService->>EmailService: Send verification email
    EmailService-->>UserService: Email sent
    UserService-->>Frontend: Registration success
    Frontend-->>User: Check email for verification`,

    upload: `sequenceDiagram
    participant User
    participant Frontend
    participant UploadService
    participant StorageService
    participant Database
    participant NotificationService
    
    User->>Frontend: Select file
    Frontend->>UploadService: Upload file
    UploadService->>StorageService: Save file
    StorageService-->>UploadService: File saved
    UploadService->>Database: Record file metadata
    Database-->>UploadService: Metadata saved
    UploadService->>NotificationService: Send notification
    NotificationService-->>UploadService: Notification sent
    UploadService-->>Frontend: Upload complete
    Frontend-->>User: File uploaded successfully`,

    search: `sequenceDiagram
    participant User
    participant Frontend
    participant SearchService
    participant IndexService
    participant Database
    participant CacheService
    
    User->>Frontend: Enter search query
    Frontend->>SearchService: Process search
    SearchService->>CacheService: Check cache
    CacheService-->>SearchService: Cache miss
    SearchService->>IndexService: Query index
    IndexService->>Database: Search data
    Database-->>IndexService: Search results
    IndexService-->>SearchService: Indexed results
    SearchService->>CacheService: Cache results
    SearchService-->>Frontend: Search results
    Frontend-->>User: Display results`,
};

// Simple generator for Mermaid journey diagrams based on prompt keywords
export const generateMermaidJourney = (prompt: string): string => {
    const p = prompt.toLowerCase();
    if (p.includes('onboarding') || p.includes('signup') || p.includes('register')) {
        return `journey
    title User Onboarding Journey
    section Registration
      Visit registration page: 3: User
      Fill registration form: 2: User
      Submit form: 2: User
      Email verification sent: 2: System
    section Verification
      Open verification email: 2: User
      Click verification link: 2: User
      Account verified: 3: System
    section First Login
      Sign in: 3: User
      Complete profile: 2: User
      Guided tour: 1: User`;
    }
    if (p.includes('checkout') || p.includes('purchase') || p.includes('payment')) {
        return `journey
    title E-commerce Checkout Journey
    section Cart
      Add item to cart: 3: User
      Review cart: 2: User
    section Payment
      Enter shipping details: 2: User
      Enter payment info: 1: User
      Process payment: 2: System
    section Post-purchase
      Order confirmation: 3: System
      Receive email receipt: 2: System`;
    }
    // Default template
    return `journey
    title Generic User Journey
    section Discover
      Find product: 3: User
      Read description: 2: User
    section Decide
      Compare options: 2: User
      Choose item: 2: User
    section Act
      Start process: 2: User
      System responds: 2: System`;
};
