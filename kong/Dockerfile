FROM kong:latest

# Create directory for declarative config
USER root
RUN mkdir -p /usr/local/kong/declarative

# Copy declarative configuration
COPY kong.yml /usr/local/kong/declarative/kong.yml

# Switch back to kong user
USER kong

# Set environment variables for DB-less mode
ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/usr/local/kong/declarative/kong.yml
ENV KONG_PROXY_LISTEN="0.0.0.0:8000, 0.0.0.0:8443 ssl"
ENV KONG_ADMIN_LISTEN="0.0.0.0:8001, 0.0.0.0:8444 ssl"
