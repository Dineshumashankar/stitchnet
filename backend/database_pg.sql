-- PostgreSQL Database Schema for StitchNet (Supabase Compatible)

-- 1. Define ENUM Types (Postgres requires explicit type creation)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'worker', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('open', 'assigned', 'cutting', 'sewing', 'finishing', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_status AS ENUM ('pending', 'signed_by_worker', 'signed_by_owner', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    location VARCHAR(255) DEFAULT NULL,
    profile_photo VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT NOT NULL,
    budget DECIMAL(10, 2) NOT NULL, 
    piece_rate DECIMAL(10, 2),
    deadline DATE NOT NULL,
    status order_status DEFAULT 'open',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    worker_id INT NOT NULL REFERENCES users(id),
    status app_status DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    worker_id INT NOT NULL REFERENCES users(id),
    owner_id INT NOT NULL REFERENCES users(id),
    terms TEXT NOT NULL,
    status contract_status DEFAULT 'pending',
    worker_signature TEXT,
    owner_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
