# Project 16: IoT Smart Home System

**Complexity:** ⭐⭐⭐⭐⭐⭐  
**Duration:** 4-5 weeks  
**Database:** MongoDB + Cassandra + Redis  
**Level:** Advanced

## Overview
Build a comprehensive smart home system with device management, real-time automation, and IoT sensor integration.

## Tech Stack
- **Frontend:** React + Material-UI
- **Backend:** NestJS (scalable)
- **Device Config:** MongoDB (flexible)
- **Time-Series:** Cassandra (sensor data)
- **Cache:** Redis (real-time state)
- **Real-time:** Socket.IO
- **IoT Protocol:** MQTT.js
- **Visualization:** Recharts

## Key Features
- ✅ Device discovery & pairing
- ✅ Real-time control
- ✅ Automation rules
- ✅ Scheduling
- ✅ Scene management
- ✅ Energy monitoring
- ✅ Historical data graphs
- ✅ Mobile app support
- ✅ Voice control integration

## Tech Dependencies
```bash
# Backend
npm install @nestjs/common mqtt.js mongoose cassandra-driver redis socket.io

# Frontend
npm install react material-ui socket.io-client recharts mqtt tailwindcss
```

## Database Architecture
```javascript
// MongoDB - Device configuration
const deviceSchema = mongoose.Schema({
  name: String,
  type: String, // 'light', 'thermostat', 'camera'
  location: String,
  mqtt_topic: String,
  status: Object,
  automationRules: Array
});

// Cassandra - Time-series sensor data (high throughput)
CREATE TABLE sensor_readings (
  sensor_id TEXT,
  timestamp TIMESTAMP,
  temperature FLOAT,
  humidity FLOAT,
  power FLOAT,
  PRIMARY KEY ((sensor_id), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND COMPACT STORAGE;

// Redis - Real-time state
// Device status, scene states, automation triggers
```

## Learning Outcomes
- MQTT protocol for IoT
- Real-time device control
- Multiple database architectures
- Automation rule engines
- Scene management
- Cassandra for time-series
- NestJS microservices
- Home automation patterns

## Project Structure
```
smart-home/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── devices/
│   │   │   ├── automation/
│   │   │   ├── scenes/
│   │   │   └── analytics/
│   │   ├── mqtt/
│   │   │   └── mqtt-service.ts
│   │   └── main.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeviceCard.jsx
│   │   │   ├── DeviceControl.jsx
│   │   │   ├── SceneManager.jsx
│   │   │   ├── AutomationEditor.jsx
│   │   │   └── Analytics.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── docker-compose.yml
```

## Getting Started
```bash
npm install
docker-compose up
npm run server
npm run client
```

## Features to Add
- Voice assistants (Alexa, Google Home)
- Security cameras
- Smart locks
- Climate control
- Lighting automation
- Presence detection
- Machine learning predictions
- Mobile app

## Resources
- MQTT documentation
- Cassandra documentation
- NestJS guide
- Smart home architecture patterns
