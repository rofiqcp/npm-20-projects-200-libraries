# Project 17: Microservices E-Commerce Architecture

**Complexity:** ⭐⭐⭐⭐⭐⭐  
**Duration:** 5-6 weeks  
**Database:** Multi-Database Architecture  
**Level:** Advanced

## Overview
Build a production-grade microservices architecture for an e-commerce platform. Learn service separation, inter-service communication, and distributed systems.

## Tech Stack
- **API Gateway:** Express.js + GraphQL
- **Services Framework:** NestJS per service
- **Databases:** Multiple specialized databases
- **Communication:** REST + GraphQL
- **Message Queue:** RabbitMQ or Kafka
- **Containerization:** Docker
- **Orchestration:** Docker Compose (dev)

## Microservices

### 1. User Service
```javascript
Database: PostgreSQL
Language: TypeScript + NestJS
Responsibilities: Authentication, user profiles, JWT
Port: 3001
```

### 2. Product Service
```javascript
Database: MongoDB (flexible catalog)
Language: TypeScript + NestJS
Elasticsearch: Product search
Responsibilities: Product catalog, inventory
Port: 3002
```

### 3. Order Service
```javascript
Database: PostgreSQL (ACID transactions)
Language: TypeScript + NestJS
Responsibilities: Order management, order history
Port: 3003
```

### 4. Payment Service
```javascript
Database: PostgreSQL (audit trail)
Language: TypeScript + NestJS
Integration: Stripe SDK
Responsibilities: Payment processing, refunds
Port: 3004
```

### 5. Notification Service
```javascript
Database: Redis (queue)
Language: TypeScript + NestJS
Queue: RabbitMQ/Kafka
Responsibilities: Email, SMS notifications
Port: 3005
```

## Tech Dependencies
```bash
# All services
npm install @nestjs/common @nestjs/core @nestjs/microservices typeorm passport

# Depending on service
npm install pg mongodb stripe redis amqplib

# API Gateway
npm install apollo-server-express express graphql
```

## Architecture Diagram
```
┌────────────────────────────────┐
│   API Gateway (GraphQL)        │
│   Port 3000                    │
└──────────────┬─────────────────┘
      ↓        ↓        ↓        ↓
   ┌──────┬────────┬──────────┬──────────┐
   ↓      ↓        ↓          ↓          ↓
 User   Product  Order    Payment  Notification
 Svc    Svc      Svc      Svc      Svc
3001   3002     3003     3004     3005
  │      │        │        │        │
  ↓      ↓        ↓        ↓        ↓
 PgSQL  Mongo   PgSQL    PgSQL     Redis
  
  ↓ Message Bus
RabbitMQ/Kafka
```

## Project Structure
```
ecommerce-microservices/
├── api-gateway/
│   ├── src/
│   │   ├── schema/
│   │   └── server.js
│   └── package.json
├── services/
│   ├── user-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── main.ts
│   │   └── package.json
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
├── shared/
│   ├── dtos/
│   └── interfaces/
├── docker-compose.yml
└── package.json
```

## Docker Compose Setup
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:14
  mongodb:
    image: mongo:latest
  redis:
    image: redis:latest
  rabbitmq:
    image: rabbitmq:management
  
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - mongodb
      - rabbitmq
  
  user-service:
    build: ./services/user-service
    ports:
      - "3001:3001"
    depends_on:
      - postgres
  
  product-service:
    build: ./services/product-service
    ports:
      - "3002:3002"
    depends_on:
      - mongodb
```

## Learning Outcomes
- Microservices architecture patterns
- Service communication patterns
- Database per service pattern
- API aggregation
- Event-driven architecture
- Distributed transactions
- Container orchestration
- Service discovery
- Circuit breaker pattern

## Getting Started
```bash
# Install dependencies for all services
npm install

# Root level scripts
npm run install-all
npm run docker:up
npm run dev

# Individual service development
cd services/user-service
npm run start:dev
```

## Inter-Service Communication
```javascript
// Example: Order Service calling Product Service
const validateInventory = async (productId, quantity) => {
  const response = await axios.post(
    'http://product-service:3002/api/inventory/check',
    { productId, quantity }
  );
  return response.data;
};

// Event-driven: RabbitMQ
amqp.publish('order.created', orderData);
```

## Advanced Patterns
- Circuit Breaker (Opossum)
- Service Mesh (optional - Istio)
- Distributed Tracing (Jaeger)
- API Rate Limiting per service
- Service authentication (service-to-service)
- Saga pattern for distributed transactions

## Deployment Strategy
- Kubernetes for production
- Service mesh for inter-service communication
- Load balancing
- Auto-scaling policies
- Health checks per service
- Distributed logging (ELK stack)

## Features to Add
- API versioning
- Backward compatibility
- Schema evolution
- Service-to-service security
- Observability dashboard
- Performance monitoring
- Chaos engineering testing

## Resources
- Microservices architecture guide
- NestJS documentation
- Docker Compose reference
- RabbitMQ/Kafka documentation
- Distributed systems patterns
