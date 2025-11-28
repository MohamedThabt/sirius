# LiteLLM Proxy Server Guide

This guide explains how to set up and use the LiteLLM proxy server for routing AI model requests in the Sirius project.

## Overview

The proxy server acts as a unified gateway for multiple AI model providers (Gemini, OpenAI, etc.), providing:

- **Load balancing** across multiple API keys
- **Automatic failover** when quota is exhausted
- **Rate limiting** and request throttling
- **Usage tracking** and cost management
- **Simple API interface** for the application

## Architecture

```
FastAPI Application → LiteLLM Proxy (localhost:4000) → Multiple Gemini API Keys
```

## Setup Instructions

### 1. Install LiteLLM (you will find it in requirements)

```bash
pip install -r requirements.txt
```

### 2. Configure API Keys

1. Copy the example configuration file:
   ```bash
   cd fastAPI/src
   cp configllm_example.yaml configllm.yaml
   ```

2. Edit `configllm.yaml` and add your Gemini API keys:
   ```yaml
   model_list:
     - model_name: "gem2.5f"
       litellm_params:
         model: "gemini/gemini-2.5-flash"
         api_key: "YOUR_GEMINI_API_KEY_1"
         rpm: 5
     
     - model_name: "gem2.5f"
       litellm_params:
         model: "gemini/gemini-2.5-flash"
         api_key: "YOUR_GEMINI_API_KEY_2"
         rpm: 5
   ```

> ⚠️ **Important**: Never commit `fastAPI/src/configllm.yaml` with real API keys to version control. The file is already in `.gitignore`.

### 3. Start the Proxy Server

```bash
cd fastAPI/src
litellm --config configllm.yaml --port 4000    
```

The proxy will start on `http://localhost:4000`.


## Configuration Options

### General Settings

```yaml
general_settings:
  num_retries: 3          # Number of retry attempts
  retry_after: 2          # Seconds to wait before retry
  allowed_fails: 1        # Allowed failures before cooldown
  cooldown_time: 30       # Cooldown period in seconds
```

### Model Configuration

```yaml
model_list:
  - model_name: "gem2.5f"           # Alias used in requests
    litellm_params:
      model: "gemini/gemini-2.5-flash"  # Actual model ID
      api_key: "YOUR_API_KEY"           # Gemini API key
      rpm: 5                            # Requests per minute
```

### Available Models

- `gem2.5f` - Gemini 2.5 Flash (general purpose)
- `gem2.5pro` - Gemini 2.5 Flash Thinking (advanced reasoning)

### Routing Strategy

```yaml
routing_strategy: simple-shuffle  # Round-robin across API keys
```

## Usage in Application

The FastAPI application automatically uses the proxy via `llm_proxy.py`:

```python
from controllers.llm_proxy import proxy

# Make a request through the proxy
response_text, usage_metrics = await proxy("Your prompt here")

# Access usage information
print(f"Input tokens: {usage_metrics.input_tokens}")
print(f"Output tokens: {usage_metrics.output_tokens}")
print(f"Total cost: ${usage_metrics.cost}")
```

## API Endpoints Used

The proxy provides OpenAI-compatible endpoints:

```python
POST http://localhost:4000/chat/completions
```

Request body:
```json
{
  "model": "gem2.5f",
  "messages": [
    {
      "role": "user",
      "content": "Your prompt"
    }
  ],
  "temperature": 0.7,
  "top_p": 0.8
}
```

## Monitoring & Debugging

### View Logs

The proxy server logs all requests and responses to the console. Watch for:
- Request routing decisions
- API key rotation
- Rate limit warnings
- Error messages

### Common Issues

1. **Connection Refused**
   - Ensure the proxy server is running on port 4000
   - Check if another service is using the port

2. **Quota Exhausted**
   - The proxy will automatically rotate to the next API key
   - Add more API keys to `configllm.yaml`

3. **Rate Limiting**
   - Adjust `rpm` values in the configuration
   - Add more API keys for higher throughput

## Production Deployment

For production environments:

1. **Use environment variables** for API keys:
   ```yaml
   api_key: ${GEMINI_API_KEY_1}
   ```

2. **Run as a service** using systemd or Docker:
   ```bash
   litellm --config /path/to/configllm.yaml --host 0.0.0.0 --port 4000
   ```

3. **Enable authentication** (optional):
   ```yaml
   general_settings:
     master_key: "your-secret-key"
   ```

4. **Monitor usage** through the admin UI:
   ```
   http://localhost:4000/ui
   ```

## Testing the Proxy

Test the proxy connection manually:

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gem2.5f",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Getting API Keys

To get Gemini API keys:
1. Visit https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add it to `configllm.yaml`

## Support

For issues or questions:
- Check LiteLLM documentation: https://docs.litellm.ai/
- Review proxy logs for error messages
- Verify API keys are valid and have quota
- Ensure the proxy server is accessible on `localhost:4000`

---

**Note**: Keep your `configllm.yaml` file secure and never commit it with real API keys to version control.