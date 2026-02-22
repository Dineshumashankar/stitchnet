import React, { useState } from 'react';
import styles from '../pages/Dashboard.module.css';

const SettingsView = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true
    });

    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('en');

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={styles.animateIn}>
            <div className={styles.sectionHeader}>
                <h2>Settings</h2>
                <p>Manage your application preferences and account settings.</p>
            </div>

            <div className={styles.dashboardGrid}>
                {/* Account Settings */}
                <div className={styles.tableCard} style={{ padding: '30px' }}>
                    <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>Account Preferences</h3>

                    <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
                        <label>Language</label>
                        <select
                            className={styles.secondaryAction}
                            style={{ width: '100%', padding: '10px' }}
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="en">English (US)</option>
                            <option value="ta">Tamil (தமிழ்)</option>
                            <option value="hi">Hindi (हिंदी)</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
                        <label>Timezone</label>
                        <select className={styles.secondaryAction} style={{ width: '100%', padding: '10px' }} disabled>
                            <option>Asia/Kolkata (GMT+5:30)</option>
                        </select>
                    </div>

                    <button className={styles.secondaryAction} style={{ width: 'auto' }}>Change Password</button>
                    <button className={styles.secondaryAction} style={{ width: 'auto', marginLeft: '10px', color: '#dc2626', borderColor: '#fee2e2', background: '#fef2f2' }}>Delete Account</button>
                </div>

                {/* Notifications & Appearance */}
                <div className={styles.tableCard} style={{ padding: '30px' }}>
                    <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>App Settings</h3>

                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Notifications</h4>
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ textTransform: 'capitalize' }}>{key} Notifications</span>
                                <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => handleToggle(key)}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: value ? '#2563eb' : '#ccc', borderRadius: '20px', transition: '.4s'
                                    }}>
                                        <span style={{
                                            position: 'absolute', content: '""', height: '16px', width: '16px', left: value ? '22px' : '2px', bottom: '2px',
                                            backgroundColor: 'white', borderRadius: '50%', transition: '.4s'
                                        }}></span>
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Appearance</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setTheme('light')}
                                style={{
                                    flex: 1, padding: '10px', border: `2px solid ${theme === 'light' ? '#2563eb' : '#e5e7eb'}`,
                                    borderRadius: '8px', background: 'white', cursor: 'pointer'
                                }}
                            >
                                ☀️ Light
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                style={{
                                    flex: 1, padding: '10px', border: `2px solid ${theme === 'dark' ? '#2563eb' : '#e5e7eb'}`,
                                    borderRadius: '8px', background: '#1f2937', color: 'white', cursor: 'pointer'
                                }}
                            >
                                🌙 Dark
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                <p>StitchNet v1.0.2 &copy; 2026</p>
                <p>Need help? <a href="#" style={{ color: '#2563eb' }}>Contact Support</a></p>
            </div>
        </div>
    );
};

export default SettingsView;
