CREATE TABLE IF NOT EXISTS sensors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  type VARCHAR(50) DEFAULT 'weather',
  temp_min_alert REAL DEFAULT 0,
  temp_max_alert REAL DEFAULT 40,
  humidity_max_alert REAL DEFAULT 90,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS readings (
  id SERIAL PRIMARY KEY,
  sensor_id INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  pressure REAL,
  battery_level REAL DEFAULT 100,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readings_sensor_id ON readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_readings_recorded_at ON readings(recorded_at);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  sensor_id INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  value REAL,
  threshold REAL,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_sensor_id ON alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

INSERT INTO sensors (name, location, temp_min_alert, temp_max_alert, humidity_max_alert)
SELECT 'Sensor Alpha', 'Living Room', 5, 35, 80
WHERE NOT EXISTS (SELECT 1 FROM sensors WHERE name = 'Sensor Alpha');

INSERT INTO sensors (name, location, temp_min_alert, temp_max_alert, humidity_max_alert)
SELECT 'Sensor Beta', 'Greenhouse', 10, 38, 85
WHERE NOT EXISTS (SELECT 1 FROM sensors WHERE name = 'Sensor Beta');

INSERT INTO sensors (name, location, temp_min_alert, temp_max_alert, humidity_max_alert)
SELECT 'Sensor Gamma', 'Server Room', 15, 28, 60
WHERE NOT EXISTS (SELECT 1 FROM sensors WHERE name = 'Sensor Gamma');
