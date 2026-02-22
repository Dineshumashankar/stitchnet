import React from 'react';
import styles from './Dashboard.module.css';

const AdminDashboard = () => {
    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <h1>Admin Dashboard</h1>
            <div className="card fade-in" style={{ marginTop: '20px' }}>
                <p>Welcome, Admin. System monitoring tools will ideally be placed here.</p>
                <p>This module allows you to manage users and view platform activity.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
