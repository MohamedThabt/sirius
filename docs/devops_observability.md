# Sirius DevOps & Observability Architecture

This document provides a comprehensive overview of the DevOps pipeline and the observability stack implemented in the Sirius system. It details how the application is built, deployed, monitored, and audited.

---

## 1. DevOps Architecture (CI/CD & Deployment Flow)

The deployment pipeline is built on **GitHub Actions** and orchestrated in production using **Dokploy**.

### CI/CD Diagram

```mermaid
architecture-beta
    %% Groups
    group github_env(cloud)["GitHub Env: CI/CD & Source Control"]
    group ghcr_env(cloud)["GitHub Container Registry - GHCR"]
    group webhooks_env(cloud)["Redeployment Webhooks"]
    group dokploy_env(server)["Dokploy Production Host"]
    group dokploy_net(server)["Docker Network: 'dokploy-network'"] in dokploy_env

    %% Services in GitHub Env
    service dev_push(internet)["Developer Push to 'main'"] in github_env
    service github_actions(server)["GitHub Actions Runner"] in github_env
    service build_fastapi(server)["Build & Push FastAPI Image"] in github_env
    service build_laravel(server)["Build & Push Laravel Image"] in github_env

    %% Services in GHCR Env
    service fastapi_registry(server)["ghcr.io/.../sirius-fastapi:latest"] in ghcr_env
    service laravel_registry(server)["ghcr.io/.../sirius-laravel:latest"] in ghcr_env

    %% Services in Redeployment Webhooks
    service fastapi_webhook(server)["FastAPI Compose Webhook"] in webhooks_env
    service laravel_webhook(server)["Laravel Compose Webhook"] in webhooks_env

    %% Services in Dokploy Host
    service dokploy_daemon(server)["Dokploy Panel Daemon"] in dokploy_env
    service pull_images(server)["Pull Latest Images"] in dokploy_env
    service recreate_stack(server)["Recreate Stack Containers"] in dokploy_env

    %% Services in Docker Network
    service prod_nginx(server)["prod-nginx Web Server"] in dokploy_net
    service prod_laravel(server)["prod-app Laravel Container"] in dokploy_net
    service nightwatch_agent(server)["nightwatch Monitoring Agent"] in dokploy_net
    service fastapi_backend(server)["fastapi Backend Container"] in dokploy_net
    service litellm_proxy(server)["litellm-proxy Container"] in dokploy_net

    %% Edges
    dev_push:B --> T:github_actions
    github_actions:L --> R:build_fastapi
    github_actions:R --> L:build_laravel

    build_fastapi:B --> T:fastapi_registry
    build_laravel:B --> T:laravel_registry

    build_fastapi:R --> L:fastapi_webhook
    build_laravel:R --> L:laravel_webhook

    fastapi_webhook:B --> T:dokploy_daemon
    laravel_webhook:B --> T:dokploy_daemon

    dokploy_daemon:B --> T:pull_images
    fastapi_registry:R --> L:pull_images
    laravel_registry:R --> L:pull_images

    pull_images:B --> T:recreate_stack

    recreate_stack:B --> T:prod_nginx
    recreate_stack:B --> T:prod_laravel
    recreate_stack:B --> T:nightwatch_agent
    recreate_stack:B --> T:fastapi_backend
    recreate_stack:B --> T:litellm_proxy

    %% Alignments to keep the layout organized
    align row build_fastapi build_laravel
    align row fastapi_registry laravel_registry
    align row fastapi_webhook laravel_webhook
```

### CI/CD Workflow Description

1. **Trigger:** A developer pushes code changes to the `main` branch or manually invokes `workflow_dispatch` on GitHub.
2. **FastAPI Workflow ([fastapi.yml](file:///e:/sirius/.github/workflows/fastapi.yml)):**
   - Sets up Docker Buildx and checks out code.
   - Logs into GitHub Container Registry (GHCR).
   - Builds and tags the FastAPI image (`ghcr.io/mohamedthabt/sirius-fastapi:latest`) with caching.
   - Triggers Dokploy's API to redeploy (`https://1-dokploy.siriusai.tech/api/compose.redeploy`) using a secured `DOKPLOY_API_TOKEN` and the target `composeId` (`fPNb4ZR1VP1YJHkQX0DJ_`).
3. **Laravel Workflow ([laravel.yml](file:///e:/sirius/.github/workflows/laravel.yml)):**
   - Sets up Buildx, checks out code, and authenticates with GHCR.
   - Builds and tags the Laravel multi-stage production image (`ghcr.io/mohamedthabt/sirius-laravel:latest`).
   - Injects production Vite variables as build arguments (such as Google Analytics IDs and PostHog project tokens) so they are inlined into the frontend JS bundle.
   - Triggers Dokploy's API to redeploy the Laravel stack using the compose ID `KM5938sqJDoSyVeRGax4s`.
4. **Dokploy Deployment:**
   - Dokploy's controller listens to redeployment calls, pulls the latest built images from GHCR, builds runtime container volumes, restarts the containers, and hooks them onto the shared `dokploy-network` external network.

---

## 2. Observability & Telemetry Architecture

The system uses a multi-tier observability stack targeting different layers of the infrastructure, frontend client, and application metrics.

### Observability Data Flow Diagram

```mermaid
architecture-beta
    %% Groups
    group client_layer(internet)["Client Browser Layer"]
    group client_analytics(cloud)["Client Analytics Services"]
    group prod_infra(server)["Docker Stack Infrastructure"]
    group laravel_stack(server)["Laravel App Stack"] in prod_infra
    group fastapi_stack(server)["FastAPI Backend Stack"] in prod_infra
    group log_system(disk)["Logs & Audit Trails"] in prod_infra
    group nightwatch_cloud(cloud)["Laravel Nightwatch Telemetry"]
    group langfuse_cloud(cloud)["Langfuse LLM Telemetry"]
    group server_metrics(server)["Server Metrics"]

    %% Client Services
    service spa_frontend(internet)["React App / SPA Frontend"] in client_layer

    %% Client Analytics Services
    service posthog(server)["PostHog SPA Integration"] in client_analytics
    service ga4(server)["Google Analytics (GA4)"] in client_analytics

    %% Laravel Services
    service prod_nginx(server)["prod-nginx Web Server"] in laravel_stack
    service prod_laravel(server)["prod-app Laravel (php-fpm)"] in laravel_stack
    service nightwatch_agent(server)["nightwatch-agent (Sidecar)"] in laravel_stack

    %% FastAPI Services
    service fastapi_backend(server)["fastapi Backend (uvicorn)"] in fastapi_stack
    service litellm_proxy(server)["litellm-proxy Container"] in fastapi_stack

    %% Log Services
    service telegram_logger(server)["Telegram Alerts Logger"] in log_system
    service laravel_logs(disk)["Laravel Log Channels"] in log_system
    service fastapi_logs(disk)["FastAPI Logs (app/errors)"] in log_system
    service logs_dashboard(server)["Logs Dashboard UI"] in log_system

    %% External Telemetry Services
    service nightwatch_portal(server)["Nightwatch Cloud Portal"] in nightwatch_cloud
    service langfuse_board(server)["Langfuse Analytics Board"] in langfuse_cloud
    service dokploy_dashboard(server)["Dokploy Metrics Dashboard"] in server_metrics

    %% Edges
    spa_frontend:L --> R:posthog
    spa_frontend:R --> L:ga4
    spa_frontend:B --> T:prod_nginx
    spa_frontend:B --> T:fastapi_backend

    prod_nginx:B --> T:prod_laravel
    prod_laravel:R --> L:nightwatch_agent
    fastapi_backend:R --> L:litellm_proxy

    prod_laravel:B --> T:laravel_logs
    prod_laravel:B --> T:telegram_logger
    fastapi_backend:B --> T:fastapi_logs
    logs_dashboard:T --> B:fastapi_backend

    nightwatch_agent:B --> T:nightwatch_portal
    litellm_proxy:B --> T:langfuse_board

    %% Edge from infrastructure container to host metrics
    prod_nginx{group}:B --> T:dokploy_dashboard{group}

    %% Alignments to organize the layout
    align row posthog ga4
    align row prod_nginx fastapi_backend
    align row telegram_logger laravel_logs fastapi_logs logs_dashboard
    align row nightwatch_portal langfuse_board dokploy_dashboard
```

---

## 3. Observability Tools & Configuration Details

### 📊 1. PostHog
- **Purpose:** Frontend User Analytics, SPA navigation tracking, and User Session recording.
- **Integration Type:** Client-side JavaScript library (`posthog-js`) with `@posthog/react` Provider.
- **Key Details:**
  - Initialized dynamically in [app.tsx](file:///e:/sirius/laravel/resources/js/app.tsx) using the `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` env variable.
  - Automatically captures SPA navigation changes on Inertia `navigate` event.
  - Integrates user identities (`posthog.identify()`) dynamically when a user is authenticated, passing their unique User ID, email, and name.
  - Automatically resets (`posthog.reset()`) on logout to prevent leakage of tracking data across sessions.

### 📈 2. Google Analytics (GA4)
- **Purpose:** Standard web traffic analytics, bounce rates, page popularity, and geographic demographics.
- **Integration Type:** Client-side Google Tag.
- **Key Details:**
  - Configured using GA measurement ID `G-333ZHPTC8B`.
  - Maps virtual page views inside the single-page app (SPA) environment by hooking into the Inertia `navigate` event, ensuring page paths are reported accurately on SPA updates without needing complete browser reloads.

### ⏱️ 3. Laravel Nightwatch
- **Purpose:** Detailed application performance monitoring (APM) specifically tailored for Laravel. Tracks slow endpoints, DB query execution times, N+1 query warnings, and jobs telemetry.
- **Integration Type:** Composer package (`laravel/nightwatch` in composer dependency) with Docker Sidecar Agent.
- **Key Details:**
  - Configured in [docker-compose.prod.yml](file:///e:/sirius/laravel/docker-compose.prod.yml).
  - The sidecar container runs the official `laravelphp/nightwatch-agent:v1` image.
  - Telemetry is dispatched via the local internal network (`NIGHTWATCH_INGEST_URI=nightwatch:2407`) without blocking the client's request-response lifecycle.
  - The agent buffers, batches, and sends performance data to the Nightwatch cloud.
  - Status can be verified inside the containers via `php nightwatch-status`.

### 🛡️ 4. Telegram Alerts, Custom Logging Channels & Pail (Logs Dashboard)
- **Purpose:** Errors auditing, security logging, developer debugging, and immediate operations alerting.
- **Integration Type:** Built-in Monolog stack drivers, Pail CLI (development), Telegram integration, and a Custom React Admin Dashboard.
- **Key Details:**
  - **Laravel Logging Stack:** Configured in [logging.php](file:///e:/sirius/laravel/config/logging.php). Includes standard daily file rotation (`laravel.log`), structured JSON format logging for parsers (`laravel-json.log`), and a custom **Telegram logger** (`CreateTelegramLogger`) which triggers instant alerts to a production Telegram channel for critical errors.
  - **FastAPI Logging:** Logs app activity into `logs/app.log` and error logs into `logs/errors.log`.
  - **FastAPI Logs API:** Exposes consolidated logs endpoints in [api_routes.py](file:///e:/sirius/fastAPI/src/routes/api_routes.py):
    - `GET /v1/logs`: Fetches paginated logs with dynamic level filter (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`) and keyword search.
    - `GET /v1/logs/stats`: Fetches total logs size, line count, and occurrences per log level.
    - `DELETE /v1/logs/clear` and `GET /v1/logs/download/{log_type}`.
  - **Logs Dashboard UI:** Admin React panel pages in [laravelLogs/](file:///e:/sirius/laravel/resources/js/pages/dashboard/laravelLogs) and [fastApiLogs/](file:///e:/sirius/laravel/resources/js/pages/dashboard/fastApiLogs) communicate with the respective backends to display real-time application and error logs directly in the admin dashboard.

### 🧠 5. Langfuse
- **Purpose:** LLM application monitoring, token cost estimation, prompt version tracking, latency profiling, and reasoning trace logs.
- **Integration Type:** LiteLLM Proxy callback plugins.
- **Key Details:**
  - Configured directly inside [configllm.yaml](file:///e:/sirius/fastAPI/src/configllm.yaml) through the LiteLLM native callbacks setting.
  - When enabled, LiteLLM intercepts requests passing to model list endpoints (like Gemini and Cerebras) and triggers async `success_callback` and `failure_callback` hooks to Langfuse.
  - Relies on standard environment variables (`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST`) defined on the `litellm-proxy` environment.

### 🖥️ 6. Dokploy Metrics (Dokploy Matrex)
- **Purpose:** Host-level systems infrastructure metrics. CPU utilization, Memory usage, network I/O, Disk space, and Docker daemon resource tracking.
- **Integration Type:** Server Agent daemon monitoring.
- **Key Details:**
  - Installed as part of Dokploy's base infrastructure on the production host system (`1-dokploy.siriusai.tech`).
  - Regularly polls container stats across all active stacks (Laravel and FastAPI/LiteLLM groups).
  - Displays real-time charts in the Dokploy dashboard, allowing administrators to configure system alerts and detect memory leaks or server utilization anomalies.
