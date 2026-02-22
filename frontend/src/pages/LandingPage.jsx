import React, { useState, useEffect } from 'react';
import styles from './LandingPage.module.css';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';
import showcaseImg from '../assets/Silk Saree Embroidery.png';
import creatorImg from '../assets/creator.jpg';

const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';

const LandingPage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Fetch orders immediately on mount
        const fetchOrders = () => {
            getOrders().then(res => setOrders(res.data)).catch(err => console.error('Failed to fetch orders:', err));
        };

        fetchOrders();

        // Poll for new orders every 5 seconds
        const interval = setInterval(fetchOrders, 5000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.landingPage}>
            <header className={styles.hero}>
                <div className="container">
                    <div className={`${styles.heroContent} fade-in`}>
                        <h1>Transform Your Garment Production Workflow</h1>
                        <p>One Platform. Stitch Together.</p>
                        <Link to="/register" className={`btn ${styles.ctaBtn}`}>Start Your Journey</Link>
                    </div>
                </div>
            </header>

            <section className={styles.showcase}>
                <div className="container">
                    <div className={styles.showcaseGrid}>
                        <div className={styles.showcaseText}>
                            <h2>Premium Silk Saree Embroidery</h2>
                            <p>Discover the finest craftsmanship in garment manufacturing. Our platform connects expert artisans with fashion houses for high-quality production of traditional and modern silk sarees.</p>
                            <ul className={styles.featureList}>
                                <li>Intricate Zari Work</li>
                                <li>Hand-stitched Patterns</li>
                                <li>Quality Assurance</li>
                                <li>Timely Delivery</li>
                            </ul>
                        </div>
                        <div className={styles.showcaseImage}>
                            <img src={showcaseImg} alt="Silk Saree Embroidery" className="fade-in" />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.stats}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <h3>250+</h3>
                            <p>Active Orders</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>1200+</h3>
                            <p>Registered Workers</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>5000+</h3>
                            <p>Completed Tasks</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>&lt; 2 hrs</h3>
                            <p>Avg. Response Time</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.ordersSection}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Available Micro-Orders</h2>
                    <div className={styles.ordersGrid}>
                        {orders.length === 0 ? (
                            <p className={styles.emptyText}>No available orders at the moment. Check back soon!</p>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div
                                        className={styles.orderImage}
                                        style={{
                                            backgroundImage: `url(${order.image_url ? `${API_BASE_URL}${order.image_url}` : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'})`
                                        }}
                                    >
                                        {!order.image_url && <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>SAMPLE</span>}
                                    </div>
                                    <div className={styles.orderContent}>
                                        <h3>{order.title}</h3>
                                        <p className={styles.orderDesc}>{order.description}</p>
                                        <div className={styles.orderFooter}>
                                            <span className={styles.budget}>₹{order.budget}</span>
                                            <Link to="/register" className={styles.applyLink}>Apply Now</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.aboutSection}>
                <div className="container">
                    <h2 className="fade-in">Our Mission</h2>
                    <p className="fade-in">
                        StitchNet is a revolutionary digital ecosystem designed to empower the global garment industry.
                        We bridge the gap between skilled manufacturers and fashion visionaries by providing a transparent,
                        efficient, and secure platform for managing micro-orders and production workflows.
                        Our goal is to foster sustainable growth and craftsmanship through cutting-edge technology.
                    </p>
                </div>
            </section>

            <section className={styles.creatorSection}>
                <div className="container">
                    <h2 className="fade-in">Meet the Creator</h2>
                    <div className={styles.creatorGrid}>
                        <div className={`${styles.creatorImageWrapper} fade-in`}>
                            <img
                                src={creatorImg}
                                alt="Dinesh Umashankar"
                                className={styles.creatorImage}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                            />
                        </div>
                        <div className={`${styles.creatorInfo} fade-in`}>
                            <span className={styles.creatorRole}>Founder & Lead Architect</span>
                            <h3>Dinesh Umashankar</h3>
                            <p className={styles.creatorBio}>
                                Dinesh is the visionary developer behind StitchNet, dedicated to transforming
                                the manufacturing landscape with innovative digital solutions. With a deep
                                understanding of both technology and the garment industry's unique challenges,
                                he built this platform to bring precision, transparency, and impact to every stitch.
                            </p>
                            <div className={styles.creatorSocials}>
                                <a href="https://www.linkedin.com/in/dinesh-umashankar" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>LinkedIn</a>
                                <a href="https://dineshumashankar.github.io/Dinesh-Website/dinesh%20website%20for%20uiux/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Portfolio</a>
                                <a href="https://github.com/dineshumashankar" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Github</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.howItWorks}>
                <div className="container">
                    <h2>How It Works</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <h3>Sign Up & Browse</h3>
                            <p>Create an account and explore available micro-orders tailored to your skills.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <h3>Accept & Work</h3>
                            <p>Accept tasks, sign digital contracts, and start working on your terms.</p>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <h3>Track & Get Paid</h3>
                            <p>Update progress, get approval, and receive payments securely.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>&copy; 2026 StitchNet. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
