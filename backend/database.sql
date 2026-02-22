CREATE DATABASE IF NOT EXISTS stitchnet_db;
USE stitchnet_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'worker', 'admin') NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    profile_photo VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT NOT NULL,
    budget DECIMAL(10, 2) NOT NULL, -- Stored in INR
    piece_rate DECIMAL(10, 2),
    deadline DATE NOT NULL,
    status ENUM('open', 'assigned', 'cutting', 'sewing', 'finishing', 'completed') DEFAULT 'open',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Applications Table (Workers applying for orders)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    worker_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    worker_id INT NOT NULL,
    owner_id INT NOT NULL,
    terms TEXT NOT NULL,
    status ENUM('pending', 'signed_by_worker', 'signed_by_owner', 'completed') DEFAULT 'pending',
    worker_signature TEXT, -- Base64 string or path to image
    owner_signature TEXT, -- Base64 string or path to image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
