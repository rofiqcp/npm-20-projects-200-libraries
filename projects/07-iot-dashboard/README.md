# Project 7: IoT Weather Dashboard (PostgreSQL)

**Complexity:** ⭐⭐⭐  
**Duration:** 2-3 weeks  
**Database:** PostgreSQL  
**Level:** Sedang (Intermediate)

## Overview
Build a real-time IoT weather dashboard using PostgreSQL and Arduino/Raspberry Pi sensor data. Learn complex database queries, real-time updates, and IoT integration.

## Tech Stack
- **Frontend:** React + Hooks
- **Backend:** Express.js + Socket.IO
- **Database:** PostgreSQL
- **Real-time:** Socket.IO events
- **Charts:** Recharts
- **IoT Protocol:** MQTT.js
- **Scheduling:** node-cron
- **Styling:** Tailwind CSS

## Key Features
- ✅ Real-time sensor data (temperature, humidity)
- ✅ Temperature & humidity trend graphs
- ✅ Multiple sensor support
- ✅ Historical data visualization
- ✅ Alert thresholds
- ✅ Email notifications
- ✅ Average calculations (hourly, daily, weekly)
- ✅ Sensor location mapping
- ✅ Data archival

## Tech Dependencies
```bash
# Backend
npm install express pg socket.io mqtt.js node-cron nodemailer

# Frontend
npm install react socket.io-client recharts axios tailwindcss
```

## Database Schema
```javascript
// PostgreSQL - Complex queries + JSON support
const { Client } = require('pg');

CREATE TABLE sensors (
  id SERIAL PRIMARY KEY,
  sensor_name VARCHAR(100),
  location VARCHAR(100),
  sensor_type VARCHAR(50),
  mqtt_topic VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  sensor_id INTEGER REFERENCES sensors(id) ON DELETE CASCADE,
  temperature FLOAT,
  humidity FLOAT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  sensor_id INTEGER REFERENCES sensors(id),
  alert_type VARCHAR(50),
  threshold FLOAT,
  email_recipient VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX idx_sensor_time ON readings(sensor_id, timestamp DESC);
CREATE INDEX idx_timestamp ON readings(timestamp);
```

## Learning Outcomes
- PostgreSQL advanced features
- Complex SQL queries (aggregations, JOINs)
- Socket.IO for real-time updates
- MQTT protocol for IoT
- Scheduled tasks with node-cron
- Email notifications
- Time-series data handling
- Data archival strategies

## Project Structure
```
iot-dashboard/
├── backend/
│   ├── db/
│   │   └── schema.sql
│   ├── routes/
│   │   ├── sensors.js
│   │   └── readings.js
│   ├── mqtt/
│   │   └── mqtt-client.js
│   ├── services/
│   │   └── alertService.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SensorCard.jsx
│   │   │   ├── TrendChart.jsx
│   │   │   └── AlertSettings.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
# Install dependencies
npm install

# Setup PostgreSQL
psql -U postgres -d iot_dashboard -f backend/db/schema.sql

# Backend
npm run server

# Frontend (new terminal)
npm run client
```

## MQTT Setup (Arduino/Raspberry Pi)
```python
# Example Raspberry Pi sensor script
import paho.mqtt.client as mqtt
import Adafruit_DHT as dht

DHT_SENSOR = dht.DHT22
DHT_PIN = 4

mqtt_client = mqtt.Client()
mqtt_client.connect("localhost", 1883, 60)

while True:
    humidity, temperature = dht.read_retry(DHT_SENSOR, DHT_PIN)
    mqtt_client.publish("sensors/room/temperature", temperature)
    mqtt_client.publish("sensors/room/humidity", humidity)
    time.sleep(60)
```

## Features to Add
- Multiple location support
- Historical data export
- Data aggregation (averages, min/max)
- Mobile app
- Machine learning anomaly detection
- Weather API integration
- Plant watering recommendations
- Multi-user support

## Resources
- See `docs/200_POPULAR_LIBRARIES.md` for library alternatives
- PostgreSQL documentation
- Socket.IO real-time guide
- MQTT protocol documentation
- Arduino/Raspberry Pi guides
