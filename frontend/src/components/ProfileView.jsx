import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from '../pages/Dashboard.module.css'; // Updated to Dashboard styles

const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';

const ProfileView = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        location: '',
        phone: '',
        profile_photo: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.getProfile();
            setProfile(res.data);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Update text fields
            await api.updateProfile({
                name: profile.name,
                location: profile.location,
                phone: profile.phone
            });

            // Update photo if selected
            if (photoFile) {
                await api.uploadProfilePhoto(photoFile);
            }

            alert('Profile updated successfully!');
            fetchProfile(); // Refresh data
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className={styles.animateIn}>
            <div className={styles.sectionHeader}>
                <h2>My Profile Details</h2>
            </div>

            <div className={styles.tableCard} style={{ padding: '40px', maxWidth: '800px' }}>
                <form onSubmit={handleSave} className={styles.modalForm}>

                    {/* Profile Photo Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#f3f4f6',
                            border: '4px solid #fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {photoPreview || profile.profile_photo ? (
                                <img
                                    src={photoPreview || (profile.profile_photo ? `${API_BASE_URL}${profile.profile_photo}` : '')}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ fontSize: '2.5rem' }}>👤</span>
                            )}
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#111827' }}>Profile Photo</h3>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '15px' }}>
                                Supports JPG, PNG or WEBP. Max size 5MB.
                            </p>
                            <label
                                htmlFor="photo-upload"
                                className={styles.secondaryAction}
                                style={{ display: 'inline-flex', width: 'auto' }}
                            >
                                Change Photo
                            </label>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '10px 0 20px 0' }}></div>

                    {/* Form Fields */}
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>



                    <div className={styles.inputGroup}>
                        <label>Location / City</label>
                        <input
                            type="text"
                            name="location"
                            value={profile.location}
                            onChange={handleChange}
                            placeholder="e.g. Tiruppur, Tamil Nadu"
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button
                            type="submit"
                            className={styles.primaryAction}
                            disabled={saving}
                            style={{ width: 'auto' }}
                        >
                            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileView;
