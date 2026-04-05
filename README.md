# Sirius

A comprehensive development project with multiple services including a FastAPI backend, Laravel web application, and database design tools.

## 🚀 Quick Start

**Want to start everything at once?** Use our npm scripts:

### Start All Services (Recommended)
```bash
npm run dev
```

This will open two separate terminal windows:
- **Laravel Server**: http://localhost:8000  
- **FastAPI Server**: http://localhost:8005

### Alternative: PowerShell Scripts
```powershell
.\start-dev.ps1
```

### Windows (Batch)
```cmd
start-dev.bat
```

### Linux/macOS
```bash
./start-dev.sh
```

These scripts will automatically start both Laravel and FastAPI services. See [START-HERE.md](START-HERE.md) for detailed instructions.

## Project Structure

- **`fastAPI/`** - FastAPI backend server for AI-powered requirements generation
- **`laravel/`** - Laravel web application with Inertia.js and React frontend
- **`db/`** - Database design and visualization tools
- **`docs/`** - Project documentation
- **`start-dev.*`** - Development environment startup scripts
- **`START-HERE.md`** - Quick start guide for the monorepo

## FastAPI Server Setup

The FastAPI server provides AI-powered software requirements generation using Google's Gemini AI.

### Prerequisites

- Python 3.8+ installed on your system
- A Google API key for Gemini AI ([Get one here](https://aistudio.google.com/app/apikey))

### Installation Steps

1. **Navigate to the FastAPI directory:**

   ```bash
   cd fastAPI
   ```

2. **Create a Python virtual environment:**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   ```bash
   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**

   **Option A - Copy from example (Recommended):**
   Create a `.env.example` file in the `fastAPI` directory:

   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

   Then copy it to create your `.env` file:

   ```bash
   # Windows
   copy .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

   **Option B - Create directly:**
   Create a `.env` file in the `fastAPI` directory:

   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

   Replace `your_google_api_key_here` with your actual Google API key.

6. **Start the FastAPI server:**
   ```bash
   cd src
   uvicorn main:app --reload --host 0.0.0.0 --port 8005
   ```

### Port Configuration

The FastAPI server runs on **port 8005** instead of the default 8000 because:

- **Laravel development server uses port 8000** by default
- This prevents port conflicts when running both services simultaneously
- Allows seamless development of the full-stack application

### API Endpoints

Once running, the FastAPI server will be available at:

- **Server**: `http://localhost:8005`
- **API Documentation**: `http://localhost:8005/docs` (Swagger UI)
- **Alternative Documentation**: `http://localhost:8005/redoc`

#### Available Endpoints

- **POST `/generate-requirements`** - Generate structured software requirements from project descriptions

**Example Request:**

```bash
curl -X POST "http://localhost:8005/generate-requirements" \
  -H "Content-Type: application/json" \
  -d '{
    "project_description": "A task management app for teams",
    "parse_response": true
  }'
```

### Testing the Server

You can test the server by visiting `http://localhost:8005/docs` in your browser or using the curl command above.

## Laravel Server Setup

The Laravel application provides the web interface and frontend for the Sirius project.

### Prerequisites

- PHP 8.1+ installed on your system
- Composer (PHP package manager)
- Node.js and pnpm (for frontend assets) [[memory:8177371]]

### Installation Steps

1. **Navigate to the Laravel directory:**

   ```bash
   cd laravel
   ```

2. **Install PHP dependencies:**

   ```bash
   composer install
   ```

3. **Set up environment variables:**
   Copy the example environment file:

   ```bash
   # Windows
   copy .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

4. **Generate application key:**

   ```bash
   php artisan key:generate
   ```

5. **Set up database:**

   ```bash
   php artisan migrate
   ```

6. **Install frontend dependencies:**

   ```bash
   pnpm install
   ```

7. **Build frontend assets:**

   ```bash
   # For development
   pnpm run dev

   # For production
   pnpm run build
   ```

8. **Start the Laravel development server:**

   ```bash
   php artisan serve
   ```

   The Laravel server will run on `http://localhost:8000` by default.

## Development Workflow

### Option 1: Quick Start (Recommended)
Use the provided startup scripts to run everything at once:

```powershell
# Windows PowerShell
.\start-dev.ps1

# Windows Batch
start-dev.bat

# Linux/macOS
./start-dev.sh
```

### Option 2: Manual Startup
If you prefer to start services individually:

1. **Start the Laravel development server** (includes PHP server, queue worker, and Vite):

   ```bash
   cd laravel
   composer dev
   ```

2. **Start the FastAPI server** on port 8005:

   ```bash
   cd fastAPI
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/macOS
   cd src
   uvicorn main:app --reload --host 0.0.0.0 --port 8005
   ```

3. Both services can run simultaneously without conflicts:
   - **Laravel Web App**: `http://localhost:8000`
   - **FastAPI Backend**: `http://localhost:8005`
   - **API Documentation**: `http://localhost:8005/docs`
   - **Vite Dev Server**: `http://localhost:5173` (for hot reloading)

## Dependencies

The FastAPI server uses:

- **FastAPI** - Modern web framework for building APIs
- **Uvicorn** - ASGI server for FastAPI
- **Google Generative AI** - Integration with Gemini AI
- **Pydantic** - Data validation and settings management
- **Python-dotenv** - Environment variable management
