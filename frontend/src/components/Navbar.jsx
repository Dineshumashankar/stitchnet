import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Hide navbar on dashboard routes
    if (location.pathname.startsWith('/owner') || location.pathname.startsWith('/worker')) {
        return null;
    }

    return (
        <nav className={styles.navbar}>
            <div className="container">
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logo}>
                        <img src={logo} alt="StitchNet Logo" className={styles.logoIcon} />
                        STITCHNET
                    </Link>
                    <ul className={styles.navLinks}>
                        {!user ? (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register" className="btn">Get Started</Link></li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to={user.role === 'owner' ? '/owner' : '/worker'}>Dashboard</Link>
                                </li>
                                <li><button onClick={handleLogout} className="btn">Logout</button></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
