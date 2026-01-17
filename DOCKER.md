# Docker Guide for Stock Watchlist

This project uses [Docker](https://www.docker.com/) to orchestrate the local development environment for Supabase. When you run `npx supabase start`, several Docker containers are launched to provide the full Supabase stack locally.

## Why Docker?

Docker allows us to run a local version of Supabase that is identical to the production environment. This includes the database, authentication service, storage, and the Supabase Studio dashboard.

## Key Containers

When the environment is running, you will see several containers prefixed with `supabase_`:

- **`supabase_db_stock_watchlist`**: The PostgreSQL database.
- **`supabase_studio_stock_watchlist`**: The local dashboard (accessible at `localhost:54323`).
- **`supabase_auth_stock_watchlist`**: GoTrue, the authentication microservice.
- **`supabase_kong_stock_watchlist`**: The API gateway that routes requests to the correct service.
- **`supabase_rest_stock_watchlist`**: PostgREST, which provides a RESTful API over the database.
- **`supabase_realtime_stock_watchlist`**: Handles real-time subscriptions and presence.
- **`supabase_storage_stock_watchlist`**: Local S3-compatible object storage.
- **`supabase_inbucket_stock_watchlist`**: Mailpit, a local SMTP server for testing emails.

## Useful Docker Commands

These commands are helpful for monitoring and managing the local environment:

### Status and Inspection
- `docker ps`: List all running containers and their port mappings.
- `docker ps -a`: List all containers (including stopped ones).
- `docker stats`: Display a live stream of container(s) resource usage statistics (CPU, memory, etc.).

### Logs
- `docker logs -f <container_name>`: Follow the logs for a specific container (e.g., `docker logs -f supabase_db_stock_watchlist`).

### Management
- `docker stop $(docker ps -q)`: Stop all running containers.
- `docker rm -f <container_id>`: Forcefully remove a specific container.

## Troubleshooting

If Supabase fails to start or containers are acting up:
1. **Docker Status**: Ensure Docker Desktop is running.
2. **Resource Limits**: Ensure Docker has enough memory/CPU allocated in settings.
3. **Clean Start**: Run `npx supabase stop --no-backup` and then `npx supabase start` to reset the local environment if it gets corrupted.
