FROM mysql:8.0

# Copy the initialization script to the docker-entrypoint-initdb.d directory
# This script will run automatically when the database is created
COPY init.sql /docker-entrypoint-initdb.d/
