# Expense Tracker - Microservices System

Welcome to the **Expense Tracker** project. This repository houses a robust, event-driven microservices architecture designed for high scalability and modularity. It handles secure user authentication and rich profile management using modern Java Spring Boot practices.

## 🚀 System Architecture

The system is split into two primary microservices: `authService` and `userService`, decoupled asynchronously via **Kafka**.

```mermaid
sequenceDiagram
    participant Client
    participant AuthService
    participant AuthDB
    participant Kafka
    participant UserService
    participant UserDB
    participant DsService
    participant MistralAI

    Client->>AuthService: POST /signup
    AuthService->>AuthDB: Save User (Creds)
    AuthService->>Kafka: Publish "UserCreated"
    AuthService-->>Client: 200 OK (JWT)

    par Async Processing
        Kafka->>UserService: Consume Event
        UserService->>UserDB: Save User (Profile)
    end

    Client->>DsService: POST /v1/ds/message (Bank SMS)
    DsService->>MistralAI: Extract Expense Info
    MistralAI-->>DsService: JSON Data
    DsService-->>Client: 200 OK (Expense Details)

    Client->>DsService: POST /v1/ds/message
    DsService->>Kafka: Publish "ExpenseCreated" (Topic: expense_service)
    Kafka->>ExpenseService: Consume Event
    ExpenseService->>ExpenseDB: Save Expense
```

## 🌟 Key Features

### 1. High Scalability

I designed this system to handle high traffic loads efficiently:

- **Stateless Authentication**: Uses **JWT (JSON Web Tokens)** for session management, allowing the `authService` to scale horizontally without sticky sessions.
- **Asynchronous Processing**: **Kafka** queues user creation events, ensuring that the critical "Onboarding" flow never blocks even if the `userService` is under heavy load.
- **Independent Scaling**: The `userService`, `authService`, and `expenseService` can be scaled independently based on their specific resource demands.

### 2. Reusability & Modularity

The codebase is structured for easy reuse in future projects:

- **Decoupled Logic**: The `authService` focuses solely on credentials and tokens, while `userService` manages profile data. This separation of concerns allows either service to be plugged into other architectures.
- **Configuration Driven**: All key settings (Database URLs, Kafka Topics) are externalized in `application.properties`, making environment switching seamless.

## 🛠️ Microservices Overview

### A. Auth Service (`org.example`)

**Responsibility**: Authentication, Token Generation, Credential Storage.

- **Controller**: Handles `/signup` and `/login` endpoints.
- **Producer**: Publishes `UserInfoDto` events to the `userEvents` Kafka topic upon successful signup.
- **Security**: Implements Spring Security with a custom `JwtAuthFilter`.

### B. User Service (`com.arnav.userService`)

**Responsibility**: Managing User Profiles (Address, Phone, Email).

- **Consumer**: Listens to the `userEvents` topic. When a user signs up, it automatically creates a corresponding profile in the User DB.
- **Service Layer**: Handles business logic for creating and retrieving detailed user information.

### C. Data Science Service (`dsService`)

**Responsibility**: Intelligent processing of data, specifically extracting expense information from Bank SMS messages using LLMs.

- **Stack**: Python, Flask, Langchain.
- **LLM Integration**: Uses **Mistral AI** (via Langchain) to parse unstructured SMS text into structured JSON data.
- **API**: Exposes `/v1/ds/message` to accept SMS text and return structured expense objects.
- **Producer**: Publishes extracted expense data to the `expense_service` Kafka topic.
- **Port**: Runs on port `8002` (Local) / `5000` (Docker) to avoid conflicts with Kong.

### D. Expense Service (`org.example`)

**Responsibility**: Core banking and transaction management.

- **Consumer**: Listens to the `expense_service` topic. Receiving expense data from `dsService` and persisting it.
- **Database**: Stores expense records with support for multi-currency transactions.

## 🔧 Technical Stack

- **Language**: Java, Python
- **Framework**: Spring Boot, Flask
- **Messaging**: Apache Kafka
- **Database**: MySQL
- **Security**: Spring Security & JWT
- **Data Science**: Langchain, Mistral AI
- **Infrastructure**: Docker, Kong Gateway

## 🏃‍♂️ Local Development Setup

### Ports

| Service             | Port   | Description                      |
| :------------------ | :----- | :------------------------------- |
| **Kong Proxy**      | `8000` | Entry point for API requests     |
| **Auth Service**    | `9820` | Authentication & Identity        |
| **User Service**    | `9810` | User Profiles                    |
| **Expense Service** | `9830` | Expense Management               |
| **DS Service**      | `8002` | Python/AI Service (Local)        |
| **Kafka (Local)**   | `9093` | Kafka Bootstrap for Host Machine |

### Running Locally

1. **Start Infrastructure**:
   ```bash
   docker-compose up -d mysql kafka kong
   ```
2. **Start Services**:
   - Build and run `authService`, `userService`, and `expenseService` using Gradle.
   - Run `dsService` using Python (`python __init__.py`).
