# Sirius

A comprehensive development project with multiple services including a FastAPI backend, Laravel web application, and database design tools.

## 🚀 Quick Start

**Want to start everything at once?** Use our npm scripts:

### Start All Services (Recommended)
```bash
npm run dev
```

This runs [concurrently](https://www.npmjs.com/package/concurrently) in **one** terminal with three processes:
- **Laravel** (Composer `dev`: PHP, queue, Vite): http://localhost:8000  
- **FastAPI** (Uvicorn): http://localhost:8005  
- **LiteLLM proxy** (matches `LITELLM_BASE_URL` in `fastAPI/.env`): http://localhost:4000  

Run `npm run setup:fastapi` once so `fastAPI/venv` exists before `npm run dev`.

The root `package.json` scripts use `fastAPI\venv\Scripts\python.exe` (Windows paths). On macOS or Linux, use **Option 2: Manual Startup** below or adjust paths to `venv/bin/python`.

If you prefer separate terminals, use the manual steps under [Development Workflow](#development-workflow) below.

## Project Structure

- **`fastAPI/`** - FastAPI backend server for AI-powered requirements generation
- **`laravel/`** - Laravel web application with Inertia.js and React frontend
- **`db/`** - Database design and visualization tools
- **`docs/`** - Project documentation
- **`package.json`** - Root `npm run dev` / `setup:*` scripts for the full stack

## FastAPI Server Setup

The FastAPI server provides AI-powered software requirements generation (Gemini via LiteLLM).

### Prerequisites

- Python 3.8+ installed on your system
- At least one Gemini API key ([Google AI Studio](https://aistudio.google.com/app/apikey)), configured in `fastAPI/.env` as `GEMINI_API_KEY_1` (see `fastAPI/.env.example`)
- For full local stack, run the **LiteLLM proxy** on port 4000 (`npm run dev` starts it automatically)

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

   Copy the example file in `fastAPI/` and edit values:

   ```bash
   # Windows
   copy .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

   At minimum for local AI calls, set at least one Gemini key and point LiteLLM at your proxy (see `fastAPI/.env.example` for `GEMINI_API_KEY_*`, `LITELLM_BASE_URL`, optional Langfuse keys).

6. **Start the FastAPI server** (from the virtual environment, from the `src` directory):

   ```bash
   cd src
   uvicorn main:app --reload --host 0.0.0.0 --port 8005
   ```

   If `uvicorn` is not on your PATH after activating the venv, use:

   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8005
   ```

   **Troubleshooting:** If you see `ModuleNotFoundError` (for example `langgraph.checkpoint.sqlite`), ensure you ran `pip install -r requirements.txt` **inside** the same `venv` you use to run Uvicorn.

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

Interactive docs list all routes. Common examples:

- **POST `/v1/Overview/generate`** - Generate a system overview from a project description  
- **POST `/v1/chat/generate-intent`** - Intent-routed overview chat (used by the Laravel System Overview page)

**Example (OpenAPI / health):**

```bash
curl "http://localhost:8005/docs"
```

### Testing the Server

You can test the server by visiting `http://localhost:8005/docs` in your browser.

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

From the repository root:

```bash
npm run setup:fastapi   # first time only: creates fastAPI/venv and installs Python deps
npm run dev             # Laravel + FastAPI + LiteLLM proxy
```

### Option 2: Manual Startup

If you prefer to start services individually:

1. **LiteLLM proxy** (if your `fastAPI/.env` uses `LITELLM_BASE_URL=http://localhost:4000`):

   ```bash
   cd fastAPI
   # Windows: venv\Scripts\activate  |  Linux/macOS: source venv/bin/activate
   set PYTHONIOENCODING=utf-8   # Windows CMD; optional on Unix
   litellm --config configllm.yaml --port 4000
   ```

2. **Start the Laravel development server** (includes PHP server, queue worker, and Vite):

   ```bash
   cd laravel
   composer dev
   ```

3. **Start the FastAPI server** on port 8005:

   ```bash
   cd fastAPI
   # Windows: venv\Scripts\activate  |  Linux/macOS: source venv/bin/activate
   cd src
   uvicorn main:app --reload --host 0.0.0.0 --port 8005
   ```

Services work together as follows:

   - **Laravel Web App**: `http://localhost:8000`
   - **FastAPI Backend**: `http://localhost:8005`
   - **API Documentation**: `http://localhost:8005/docs`
   - **LiteLLM proxy** (when used): `http://localhost:4000`
   - **Vite Dev Server**: `http://localhost:5173` (started by `composer dev`)

## Dependencies

The FastAPI server uses:

- **FastAPI** - Modern web framework for building APIs
- **Uvicorn** - ASGI server for FastAPI
- **Google Generative AI** - Integration with Gemini AI
- **Pydantic** - Data validation and settings management
- **Python-dotenv** - Environment variable management
