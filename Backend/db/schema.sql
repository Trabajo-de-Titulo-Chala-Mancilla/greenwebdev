CREATE DATABASE IF NOT EXISTS carbon_db;

USE carbon_db;

CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255),
    bytes_per_page INT,
    monthly_visits INT,
    green_host BOOLEAN,
    g_co2_per_visit DECIMAL(10,6),
    total_co2_per_year DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
