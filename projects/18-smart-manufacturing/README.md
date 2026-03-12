# Project 18: Smart Manufacturing System (Industry 4.0)

**Complexity:** ⭐⭐⭐⭐⭐⭐  
**Duration:** 4-5 weeks  
**Database:** PostgreSQL + InfluxDB  
**Industry Focus:** Manufacturing & Industrial Automation

## Overview
Build a comprehensive Industry 4.0 manufacturing system with real-time equipment monitoring, production scheduling, and predictive maintenance.

## Tech Stack
- **Frontend:** React + Three.js (3D factory floor visualization)
- **Backend:** NestJS (scalable microservices)
- **Primary DB:** PostgreSQL (production orders, equipment inventory)
- **Time-Series DB:** InfluxDB (machine metrics: temperature, vibration, power)
- **Real-time:** Socket.IO + MQTT (equipment communication)
- **Cache:** Redis (production state)
- **Message Queue:** RabbitMQ (order processing)

## Key Features
- ✅ Real-time equipment monitoring (Temperature, Vibration, Power consumption)
- ✅ Production scheduling & order management
- ✅ Quality control tracking
- ✅ Maintenance scheduling optimization
- ✅ Worker shift management
- ✅ 3D factory floor visualization
- ✅ OEE (Overall Equipment Effectiveness) dashboards
- ✅ Predictive maintenance alerts
- ✅ Production analytics & reporting

## Database Schema
- **PostgreSQL:** production_orders, equipment, worker_assignments, quality_metrics
- **InfluxDB:** Time-series data (temperature, vibration, power_consumption, cycle_time)
- **Redis:** Current status cache, real-time metrics

## Learning Outcomes
- Multi-database architecture
- Time-series data optimization
- Real-time IoT sensor integration
- MQTT protocol
- Production system design
- Industry 4.0 patterns

## Recommended Learning Path
1. Start with PostgreSQL setup & schema design
2. Setup InfluxDB for time-series metrics
3. Build basic MQTT sensor simulation
4. Create real-time monitoring dashboard
5. Implement OEE calculations
6. Add predictive maintenance logic

## Getting Started
```bash
# Install dependencies
npm install

# Setup databases
# PostgreSQL: Create database & tables (see docs)
# InfluxDB: docker run -p 8086:8086 influxdb

# Run backend
npm run start:dev

# Run frontend
npm run client:dev
```

## Resources
- See `docs/20_PROJECTS_RECOMMENDED_STACK.md` for full tech stack
- See `docs/200_POPULAR_LIBRARIES.md` for relevant libraries
