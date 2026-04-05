# Sirius

A modern web application built with Laravel, React, and Inertia.js, featuring a beautiful and responsive user interface with comprehensive authentication and user management capabilities.

## 🚀 Features

- **Modern Tech Stack**: Built with Laravel 12, React 19, and Inertia.js
- **Beautiful UI**: Styled with Tailwind CSS and Radix UI components
- **Authentication System**: Complete user registration, login, and password management
- **Responsive Design**: Mobile-first approach with modern navigation
- **TypeScript Support**: Full TypeScript integration for better development experience
- **SSR Ready**: Server-side rendering capabilities with Inertia.js
- **Modern Development**: Hot reloading, ESLint, Prettier, and comprehensive tooling

## 🛠️ Tech Stack

### Backend

- **Laravel 12** - PHP framework
- **Inertia.js** - Modern monolith approach
- **SQLite** - Database (easily configurable for other databases)
- **Laravel Wayfinder** - Modern Laravel development tools

### Frontend

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Vite** - Fast build tool and dev server

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PHPUnit** - Testing framework
- **Laravel Sail** - Docker development environment

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2+** with required extensions
- **Composer** - PHP package manager
- **Node.js 18+** and **npm** or **pnpm**
- **Git** - Version control

## 🚀 Installation

1. **Clone the repository**

    ```bash
    git clone <your-repository-url>
    cd sirius
    ```

2. **Install PHP dependencies**

    ```bash
    composer install
    ```

3. **Install Node.js dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

4. **Environment setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

5. **Database setup**

    ```bash
    # For SQLite (default)
    touch database/database.sqlite

    # Or configure your preferred database in .env
    php artisan migrate
    ```

6. **Build assets**
    ```bash
    npm run build
    # or
    pnpm build
    ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start all services (Laravel, Vite, Queue)
composer run dev

# Or start services individually
php artisan serve
npm run dev
```

### Production Mode

```bash
npm run build
php artisan serve
```

### Testing

```bash
# Run PHP tests
composer test

# Run frontend type checking
npm run types
```

## 📁 Project Structure

```
sirius/
├── app/                    # Laravel application logic
│   ├── Http/             # HTTP layer (controllers, middleware, requests)
│   ├── Models/           # Eloquent models
│   └── Providers/        # Service providers
├── resources/             # Frontend resources
│   ├── js/               # React components and pages
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Inertia.js pages
│   │   └── layouts/      # Page layouts
│   └── css/              # Stylesheets
├── routes/                # Application routes
├── database/              # Database migrations and seeders
└── tests/                 # Test files
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure in your `.env` file:

```env
APP_NAME="Sirius"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# For other databases (MySQL, PostgreSQL)
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sirius
# DB_USERNAME=root
# DB_PASSWORD=
```

### Database Configuration

The project comes with SQLite by default for easy development. To use other databases:

1. Update your `.env` file with database credentials
2. Install the appropriate PHP database extension
3. Run migrations: `php artisan migrate`

## 🎨 Customization

### Styling

- **Tailwind CSS**: Configure in `tailwind.config.js`
- **Components**: Customize UI components in `resources/js/components/ui/`
- **Theme**: Modify appearance settings in the settings panel

### Adding New Features

1. Create routes in `routes/web.php`
2. Add controllers in `app/Http/Controllers/`
3. Create Inertia.js pages in `resources/js/pages/`
4. Add models in `app/Models/`

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
composer test

# Run specific test files
php artisan test tests/Feature/Auth/

# Run tests with coverage
php artisan test --coverage
```

## 📦 Available Scripts

### Composer Scripts

- `composer dev` - Start development environment
- `composer test` - Run tests
- `composer dev:ssr` - Start development with SSR

### NPM Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run build:ssr` - Build for SSR
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🚀 Deployment

### Production Build

```bash
npm run build
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Server Requirements

- PHP 8.2+
- Composer
- Node.js 18+ (for building assets)
- Web server (Apache/Nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Laravel documentation](https://laravel.com/docs)
2. Review the [Inertia.js documentation](https://inertiajs.com/)
3. Check existing issues in the repository
4. Create a new issue with detailed information

## 🔄 Updates

To update the project dependencies:

```bash
# Update PHP dependencies
composer update

# Update Node.js dependencies
npm update
# or
pnpm update
```

---

**Built with ❤️ using Laravel, React, and Inertia.js**
