


Tech Stack
| Layer            | Technology                           | Purpose                                      |
| ---------------- | ------------------------------------ | -------------------------------------------- |
| Frontend         | React + Vite                         | UI for login, dashboard, and note management |
| Backend          | NestJS                               | REST API for auth and notes                  |
| Database         | PostgreSQL                           | Persistent user/note storage                 |
| Cache            | Redis                                | Cached search results per user               |
| Proxy            | NGINX                                | Load balancing across API replicas           |
| Monitoring       | Prometheus Metrics via `prom-client` | Observability                                |
| Containerization | Docker Compose                       | Service orchestration and scaling            |


1. System Architecture Overview
                    ┌──────────────────────────┐
                    │        Frontend          │
                    │ React + Vite (port 5173) │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       NGINX Proxy        │
                    │ (Load balances API)      │
                    └────────────┬─────────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 ▼                                ▼
        ┌────────────────────┐          ┌────────────────────┐
        │   API Instance 1   │          │   API Instance 2   │
        │ NestJS (port 3000) │          │ NestJS (port 3001) │
        └────────────┬───────┘          └────────────┬───────┘
                     │                              │
                     ▼                              ▼
        ┌──────────────────────┐       ┌──────────────────────┐
        │   PostgreSQL (DB)    │       │   Redis (Cache)      │
        │ User & Notes storage │       │ Query cache per user │
        └──────────────────────┘       └──────────────────────┘

The Notes Web App is a containerized, scalable full-stack system composed of five main services working together in a microservice-style setup.

Frontend (React + Vite)
The user-facing web application.
It allows users to register, log in, and manage their personal notes.
Each note includes a title, content, and optional tags.
The frontend communicates with the backend API over HTTP.

Backend API (NestJS)
A RESTful API built with NestJS that handles all business logic.
It manages user authentication, CRUD operations for notes, and caching interactions with Redis.
It uses PostgreSQL for persistent data storage and exposes Prometheus-compatible metrics for monitoring.

Database (PostgreSQL)
Stores user credentials and all note data.
Each note record is linked to a user, including timestamps and tags.
The schema ensures data integrity and relationships between users and their notes.

Cache Layer (Redis)
Used to cache frequently accessed data, such as user-specific filtered notes by tags.
Redis significantly improves performance by avoiding repetitive queries to PostgreSQL.
Cache entries are automatically invalidated when a user creates, updates, or deletes a note.

Load Balancer (NGINX)
Distributes incoming API traffic evenly across multiple backend instances.
Ensures high availability and fault tolerance.
The load balancer performs health checks and removes unhealthy instances from rotation automatically.

These components are orchestrated using Docker Compose, which manages their lifecycle, networking, and environment configuration.

2. System Setup Overview

  The application is designed for both development and production setups.

  In development, each service can run independently using local Node.js and database servers.
  Developers can edit code and see live updates instantly.

  In production, Docker Compose manages all containers.
  Each service runs in isolation within its own container, communicating through a shared virtual network.
  Environment variables are loaded from .env files to keep sensitive information secure and configuration flexible.

  At startup:

  PostgreSQL initializes and creates the notes database.

  Redis starts as an in-memory cache.

  Two instances of the backend API start and connect to both PostgreSQL and Redis.

  The frontend connects to the backend via NGINX, which balances the load.

3. API Endpoints

The API exposes clear RESTful endpoints organized under the /api prefix.
All responses use JSON format.

Authentication

POST /api/auth/register – Registers a new user with email and password.

POST /api/auth/login – Authenticates a user and returns a JWT token.

Notes Management

GET /api/notes – Returns all notes belonging to the authenticated user.
Supports optional filtering by tags (e.g., ?tags=work,personal).

POST /api/notes – Creates a new note.

PUT /api/notes/:id – Updates an existing note by ID.

DELETE /api/notes/:id – Deletes a note by ID.

Monitoring

GET /metrics – Exposes Prometheus-compatible metrics for performance monitoring.
Includes cache hits, cache misses, and request durations.

GET /health – Returns the system health status for load balancer checks.

4. Scaling and Load Balancing

The system demonstrates horizontal scalability using Docker Compose’s replication feature.

Two instances of the backend API run concurrently.

NGINX acts as a reverse proxy and load balancer, distributing traffic evenly between them.

Health checks ensure traffic is only routed to healthy instances.

Redis acts as a shared cache between all backend instances, maintaining consistency.

PostgreSQL remains a single instance for simplicity but could be replaced by a managed, clustered database in a production-grade setup.

This architecture allows the system to handle higher traffic and remain available even if one backend instance fails.

5. Environment Configuration

The system uses .env files to manage configuration values for each service.
This approach separates code from configuration and makes the system flexible for different environments (development, staging, production).

Key Environment Variables:

Variable	Description
PORT	The port number the backend server listens on.
JWT_SECRET	Secret key used to sign and verify JWT tokens.
POSTGRES_HOST	Hostname or container name of the PostgreSQL service.
POSTGRES_USER	Username for connecting to PostgreSQL.
POSTGRES_PASSWORD	Password for connecting to PostgreSQL.
POSTGRES_DB	Database name used by the application.
REDIS_HOST	Hostname or container name of the Redis service.
REDIS_PORT	TCP port Redis listens on.

All containers automatically load their environment values when started via Docker Compose.

6. Monitoring and Observability

The backend exposes runtime metrics through the /metrics endpoint, compatible with Prometheus.
These metrics allow developers or operators to monitor:

Cache efficiency (hits and misses)

Average request duration

System health and uptime

These insights can be visualized using Prometheus and Grafana if integrated later.

7. Improvments
  - Creating a service desegnated to DB calls only, via API.
  - PostgreSQL can be connected through pgAdmin, OR Docker. I can explain further in the interview!!
  - All variables/settings/url etc should be inside env file - this way Docker can reach them in runtime

8. Summary

The Notes Web App is a self-contained, scalable web system that demonstrates modern backend and frontend integration with containerized infrastructure.

It emphasizes:

Modular architecture

Efficient caching

Load-balanced scalability

Observability

Simplicity in deployment

This makes it an ideal reference for designing full-stack systems ready for production environments.