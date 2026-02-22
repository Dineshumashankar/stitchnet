import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApplications, getMyOrders, createOrder, createContract, getContracts, signContract, updateOrderStatus } from '../services/api';
import SignaturePad from '../components/SignaturePad';
import DashboardLayout from '../components/DashboardLayout';
import ProfileView from '../components/ProfileView';
import SettingsView from '../components/SettingsView';
import styles from './Dashboard.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Sub-components for better readability
const SummaryView = ({ kpis, applications, myOrders, onAcceptApp, onRejectApp, onPostClick }) => (
    <div className={styles.animateIn}>
        <div className={styles.kpiGrid}>
            {kpis.map((kpi, idx) => (
                <div key={idx} className={styles.kpiCard} style={{ '--delay': `${idx * 0.1}s`, '--kpi-bg': kpi.color }}>
                    <div className={styles.kpiInfo}>
                        <span className={styles.kpiTitle}>{kpi.title}</span>
                        <div className={styles.kpiValueRow}>
                            <span className={styles.kpiValue}>{kpi.value}</span>
                            {kpi.change && <span className={styles.kpiChange}>{kpi.change}</span>}
                        </div>
                    </div>
                    <div className={styles.kpiIcon}>{kpi.icon}</div>
                </div>
            ))}
        </div>

        <div className={styles.dashboardGrid}>
            <section className={styles.mainSection}>
                <div className={styles.sectionHeader}>
                    <h2>Production Overview</h2>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className={styles.primaryAction} onClick={onPostClick}>
                            <span>+ Post New Order</span>
                        </button>
                    </div>
                </div>
                <div className={styles.tableCard}>
                    <table className={styles.productionTable}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Garment Type</th>
                                <th>Current Status</th>
                                <th>Assigned Worker</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className={styles.emptyText}>No active production orders found.</td>
                                </tr>
                            ) : (
                                myOrders.slice(0, 6).map((order, idx) => (
                                    <tr key={order.id} style={{ '--delay': `${0.4 + (idx * 0.05)}s` }}>
                                        <td className={styles.idCell}>#ORD-{1000 + order.id}</td>
                                        <td style={{ fontWeight: 600 }}>{order.title}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[(order.status || 'open').toLowerCase().replace(' ', '')] || styles.sewing}`}>
                                                {order.status || 'Open'}
                                            </span>
                                        </td>
                                        <td style={{ color: order.status === 'open' ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 500 }}>
                                            {order.status === 'open' ? 'Waiting for Assignment' : 'Assigned Member'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <aside className={styles.sideColumn}>
                <section className={styles.sideSection}>
                    <div className={styles.sectionHeader}>
                        <h2>New Applications</h2>
                        <Link to="/owner/workers" className={styles.viewAll}>View Directory</Link>
                    </div>
                    <div className={styles.miniList}>
                        {applications.length === 0 ? (
                            <div className={styles.emptyText}>No pending applications.</div>
                        ) : (
                            applications.slice(0, 4).map((app, idx) => (
                                <div key={app.id} className={styles.miniItem} style={{ '--delay': `${0.6 + (idx * 0.1)}s` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div className={styles.avatar} style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                                            {app.worker_name?.charAt(0) || 'W'}
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <p className={styles.itemName}>{app.worker_name}</p>
                                            <p className={styles.itemMeta}>{app.order_title}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className={styles.tinyBtn}
                                            onClick={() => onAcceptApp(app.id, app.order_id, app.worker_id)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className={styles.tinyBtn}
                                            style={{ backgroundColor: '#fff1f2', color: '#e11d48', borderColor: '#fecdd3' }}
                                            onClick={() => onRejectApp(app.id)}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </aside>
        </div>
    </div>
);

const OrdersView = ({ myOrders, onPostClick }) => (
    <div className={`${styles.mainSection} ${styles.animateIn}`}>
        <div className={styles.sectionHeader}>
            <h2>Manage Micro-Orders</h2>
            <button className={styles.primaryAction} onClick={onPostClick}>+ Post New Order</button>
        </div>
        <div className={styles.tableCard}>
            <table className={styles.productionTable}>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Garment</th>
                        <th>Worker</th>
                        <th>Rate (₹)</th>
                        <th>Budget</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {myOrders.map((order, idx) => (
                        <tr key={order.id} className={styles.animateIn} style={{ '--delay': `${idx * 0.05}s` }}>
                            <td className={styles.idCell}>#ORD-{1000 + order.id}</td>
                            <td>{order.title}</td>
                            <td>{order.status === 'open' ? 'Unassigned' : 'Assigned'}</td>
                            <td>₹{order.pieceRate || '--'}</td>
                            <td>₹{order.budget}</td>
                            <td>
                                <span className={`${styles.statusBadge} ${styles[(order.status || 'open').toLowerCase().replace(' ', '')]}`}>
                                    {order.status || 'Open'}
                                </span>
                            </td>
                            <td><button className={styles.actionBtn}>Edit</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const WorkerView = ({ contracts }) => {
    // Group contracts by worker
    const workerGroups = contracts.reduce((acc, contract) => {
        const workerId = contract.worker_id;
        if (!acc[workerId]) {
            acc[workerId] = {
                id: workerId,
                name: contract.worker_name,
                skill: contract.worker_skill || 'Professional',
                orders: []
            };
        }
        acc[workerId].orders.push({
            id: contract.order_id,
            title: contract.order_title,
            status: contract.order_status
        });
        return acc;
    }, {});

    const workers = Object.values(workerGroups);

    return (
        <div className={styles.animateIn}>
            <div className={styles.sectionHeader}>
                <h2>Worker Directory</h2>
                <p className={styles.date}>Verified experts you've collaborated with.</p>
            </div>
            {workers.length === 0 ? (
                <div className={styles.tableCard} style={{ padding: '60px', textAlign: 'center' }}>
                    <p className={styles.emptyText}>No verified workers found. Assign an order to see them here.</p>
                </div>
            ) : (
                <div className={styles.workerGrid}>
                    {workers.map((worker, idx) => (
                        <div key={worker.id} className={styles.workerCard} style={{ '--delay': `${0.1 * idx}s` }}>
                            <div className={styles.workerAvatar}>
                                {worker.name.charAt(0)}
                            </div>
                            <h3 className={styles.workerName}>{worker.name}</h3>
                            <div className={styles.workerTags}>
                                <span className={`${styles.workerTag} ${styles.senior}`}>
                                    {worker.skill}
                                </span>
                            </div>
                            <div style={{ padding: '0 20px', width: '100%', textAlign: 'left', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 800 }}>Order History</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {worker.orders.map(order => (
                                        <li key={order.id} style={{ fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600 }}>{order.title}</span>
                                            <span className={`${styles.statusBadge} ${styles[(order.status || 'open').toLowerCase().replace(' ', '')] || styles.sewing}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                                {order.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.workerFooter}>
                                <div className={styles.workerRating}>
                                    <span>★</span> 5.0
                                </div>
                                <div className={styles.workerAvailability}>
                                    <div className={`${styles.availabilityDot} ${styles.online}`}></div>
                                    Active Member
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ContractsView = ({ contracts, signingContractId, setSigningContractId, handleSignContract, user }) => {
    const handleDownloadPDF = (contractId) => {
        const input = document.getElementById(`contract-doc-${contractId}`);
        html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`Manufacturing_Agreement_${contractId}.pdf`);
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '___________';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const renderSignature = (signature, label, isForPDF = false) => {
        if (!signature) return <span className={styles.emptyText} style={{ padding: 0, fontSize: isForPDF ? '1rem' : '0.85rem' }}>{isForPDF ? '_______________________________' : 'Waiting for Signature...'}</span>;
        const isImage = signature.startsWith('data:image');
        return (
            <div style={{ position: 'relative' }}>
                {isImage ? (
                    <img src={signature} alt={label} style={{ width: isForPDF ? '180px' : '150px', height: isForPDF ? '80px' : '60px', objectFit: 'contain' }} />
                ) : (
                    <span style={{
                        fontFamily: "'Dancing Script', cursive",
                        fontSize: isForPDF ? '2.2rem' : '1.8rem',
                        color: 'var(--text-main)',
                        borderBottom: '1.5px solid var(--border)',
                        display: 'inline-block',
                        minWidth: '150px'
                    }}>
                        {signature}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className={`${styles.mainSection} ${styles.animateIn}`}>
            <div className={styles.sectionHeader}><h2>Production Contracts</h2></div>
            {contracts.length === 0 ? (
                <div className={styles.tableCard} style={{ padding: '60px', textAlign: 'center' }}>
                    <p className={styles.emptyText}>No contracts generated yet.</p>
                </div>
            ) : (
                contracts.map((contract) => {
                    const isSignedByOwner = !!contract.owner_signature;
                    const isSignedByWorker = !!contract.worker_signature;
                    const isCompleted = contract.status === 'completed';

                    return (
                        <div key={contract.id} className={styles.documentContainer}>
                            <div className={styles.docHeader}>
                                <div className={styles.statusStepper}>
                                    <div className={`${styles.step} ${isSignedByOwner ? styles.completed : styles.current}`}>
                                        <div className={styles.stepIcon}>{isSignedByOwner ? '✓' : '1'}</div>
                                        <span className={styles.stepLabel}>Owner</span>
                                    </div>
                                    <div className={styles.stepLine}></div>
                                    <div className={`${styles.step} ${isSignedByWorker ? styles.completed : (isSignedByOwner ? styles.current : '')}`}>
                                        <div className={styles.stepIcon}>{isSignedByWorker ? '✓' : '2'}</div>
                                        <span className={styles.stepLabel}>Worker</span>
                                    </div>
                                    <div className={styles.stepLine}></div>
                                    <div className={`${styles.step} ${isCompleted ? styles.completed : (isSignedByWorker ? styles.current : '')}`}>
                                        <div className={styles.stepIcon}>{isCompleted ? '✓' : '3'}</div>
                                        <span className={styles.stepLabel}>Closed</span>
                                    </div>
                                </div>
                            </div>

                            <div id={`contract-doc-${contract.id}`} style={{ padding: '60px', backgroundColor: 'white', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>DIGITAL WORK CONTRACT AGREEMENT</h1>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>StitchNet Manufacturing Network</p>
                                </div>

                                <div style={{ border: '1.5px solid #f1f5f9', borderRadius: '12px', padding: '32px', marginBottom: '40px' }}>
                                    <div className={styles.partyGrid}>
                                        <div className={styles.partyBox}>
                                            <h4>FACTORY OWNER (YOU)</h4>
                                            <p className={styles.partyName}>{contract.owner_name}</p>
                                            <p className={styles.partyDetails}>StitchNet Verified Partner</p>
                                        </div>
                                        <div className={styles.partyBox}>
                                            <h4>TEXTILE WORKER</h4>
                                            <p className={styles.partyName}>{contract.worker_name || 'Assigned Worker'}</p>
                                            <p className={styles.partyDetails}>Independent Service Provider</p>
                                        </div>
                                    </div>

                                    <div className={styles.taskBox}>
                                        <h4 style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>MANUFACTURING SCOPE</h4>
                                        <p className={styles.taskDesc}>
                                            This agreement authorizes the designated worker to perform manufacturing services for Order <strong>#{contract.order_id}</strong> ({contract.order_title}).
                                            Payment is secured via StitchNet Escrow.
                                        </p>
                                    </div>

                                    <table className={styles.financialTable}>
                                        <thead>
                                            <tr>
                                                <th>DESCRIPTION</th>
                                                <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Production Fee (Micro-Order #{contract.order_id})</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{contract.order_budget}</td>
                                            </tr>
                                            <tr className={styles.totalRow}>
                                                <td>TOTAL PAYABLE UPON APPROVAL</td>
                                                <td style={{ textAlign: 'right' }}>₹{contract.order_budget}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className={styles.deadlineRow}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        <span>FINAL COMPLETION DEADLINE: <strong>{formatDate(contract.order_deadline)}</strong></span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>OWNER AUTHORIZATION</p>
                                        <div style={{ paddingBottom: '10px', minHeight: '80px', display: 'flex', alignItems: 'flex-end' }}>
                                            {isSignedByOwner ? renderSignature(contract.owner_signature, "Owner", true) : (
                                                signingContractId === contract.id ? (
                                                    <div style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
                                                        <SignaturePad onSave={(data) => handleSignContract(data, contract.id)} onClear={() => setSigningContractId(null)} />
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setSigningContractId(contract.id)} className={styles.primaryAction} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                                                        ✍️ Sign Document
                                                    </button>
                                                )
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>Duly Authorized Signatory</p>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>WORKER ACKNOWLEDGMENT</p>
                                        <div style={{ paddingBottom: '10px', minHeight: '80px', display: 'flex', alignItems: 'flex-end' }}>
                                            {renderSignature(contract.worker_signature, "Worker", true)}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>Accepted by Service Provider</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1.5px dashed #f1f5f9', textAlign: 'center' }}>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                                        StitchNet Digital Verification Code: <strong>SN-V-{contract.id}-{contract.order_id}</strong> |
                                        Authenticated Digital Manufacturing Agreement.
                                    </p>
                                </div>
                            </div>
                            {(isSignedByOwner || isSignedByWorker) && (
                                <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleDownloadPDF(contract.id)} className={styles.tinyBtn} style={{ height: '44px', padding: '0 24px' }}>
                                        📥 Download PDF Agreement
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

const PaymentsView = ({ myOrders }) => {
    const totalEscrow = myOrders
        .filter(o => o.status === 'assigned' || o.status === 'cutting' || o.status === 'sewing' || o.status === 'finishing')
        .reduce((sum, o) => sum + parseFloat(o.budget || 0), 0);

    const paidToDate = myOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.budget || 0), 0);

    const pendingApproval = myOrders
        .filter(o => o.status === 'finishing')
        .reduce((sum, o) => sum + parseFloat(o.budget || 0), 0);

    return (
        <div className={styles.animateIn}>
            <div className={styles.sectionHeader}>
                <h2>Payments & Escrow</h2>
                <p className={styles.date}>Manage your manufacturing capital and secured payments.</p>
            </div>

            <div className={styles.paymentsGrid}>
                <div className={styles.balanceCard}>
                    <span className={styles.balanceLabel}>Currently in Escrow</span>
                    <div className={styles.balanceValue}>₹{totalEscrow.toLocaleString()}</div>
                    <div className={styles.balanceMeta}>
                        <span>{myOrders.filter(o => o.status !== 'open' && o.status !== 'completed').length} Active Contracts</span>
                        <span>Secured by StitchNet</span>
                    </div>
                </div>
                <div className={styles.balanceCard} style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}>
                    <span className={styles.balanceLabel}>Total Paid to Date</span>
                    <div className={styles.balanceValue}>₹{paidToDate.toLocaleString()}</div>
                    <div className={styles.balanceMeta}>
                        <span>{myOrders.filter(o => o.status === 'completed').length} Orders Completed</span>
                        <span>Verified 100%</span>
                    </div>
                </div>
            </div>

            <h3 style={{ margin: '40px 0 20px', fontWeight: 800 }}>Bank Account & Payouts</h3>
            <div className={styles.methodGrid}>
                <button
                    className={styles.methodCard}
                    style={{ width: '100%', border: '2px dashed var(--border)', justifyContent: 'center', background: '#f8fafc' }}
                    onClick={() => alert('Bank integration coming soon!')}
                >
                    <div className={styles.methodIcon} style={{ background: 'white' }}>➕</div>
                    <div className={styles.methodInfo} style={{ textAlign: 'left' }}>
                        <h4>Link New Bank Account</h4>
                        <p>Verify your account for secure payouts</p>
                    </div>
                </button>
            </div>

        </div>
    );
};

const OrderModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '',
        pieceRate: '',
        budget: '',
        deadline: ''
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Auto-calculate budget when quantity or pieceRate changes
    useEffect(() => {
        const qty = parseFloat(formData.quantity) || 0;
        const rate = parseFloat(formData.pieceRate) || 0;
        if (qty && rate) {
            setFormData(prev => ({ ...prev, budget: (qty * rate).toString() }));
        }
    }, [formData.quantity, formData.pieceRate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            await createOrder(data);
            alert('Order posted successfully!');
            onSuccess();
        } catch (err) {
            console.error("Order creation failed details:", err);
            const msg = err.response?.data?.message || err.message || "An unknown error occurred";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
                <div className={styles.modalHeader}>
                    <h2>Post New Production Order</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {error && <div className={styles.errorMessage} style={{ color: 'red', backgroundColor: '#fff1f2', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}
                    <div className={styles.inputGroup}>
                        <label>Production Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Cotton Shirts Batch (500pc)" />
                    </div>
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>Volume (Units)</label>
                            <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required placeholder="0" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Rate per Unit (₹)</label>
                            <input type="number" value={formData.pieceRate} onChange={e => setFormData({ ...formData, pieceRate: e.target.value })} required placeholder="0" />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Total Budget Estimation (₹)</label>
                        <div style={{ position: 'relative' }}>
                            <input type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} required readOnly style={{ background: '#f8fafc', cursor: 'not-allowed', color: 'var(--text-muted)', fontWeight: 700 }} />
                            <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800 }}>AUTO-CALC</span>
                        </div>
                    </div>
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>Completion Deadline</label>
                            <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Sample Image</label>
                            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={{ padding: '10px' }} />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Manufacturing Specs / Notes</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows="3" placeholder="Add specific requirements for the workers..."></textarea>
                    </div>
                    <button type="submit" className={styles.primaryAction} disabled={loading} style={{ width: '100%', marginTop: '12px', justifyContent: 'center', height: '52px' }}>
                        {loading ? 'Processing...' : 'Confirm & Post Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [signingContractId, setSigningContractId] = useState(null);

    const fetchData = async () => {
        try {
            const [appsRes, ordersRes, contractsRes] = await Promise.all([
                getApplications(),
                getMyOrders(),
                getContracts()
            ]);
            // Filter out rejected applications from the recent list
            setApplications(appsRes.data.filter(app => app.status !== 'rejected'));
            setMyOrders(ordersRes.data);
            setContracts(contractsRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const completedCount = myOrders.filter(o => o.status === 'completed').length;
    const totalCount = myOrders.length || 1;
    const productionPercent = Math.round((completedCount / totalCount) * 100);

    const kpis = [
        { title: 'Active Orders', value: myOrders.filter(o => o.status === 'open' || o.status === 'assigned').length.toString(), change: '+2', icon: '📦', color: '#eff6ff' },
        { title: 'New Apps', value: applications.length.toString(), change: '+5', icon: '👥', color: '#fff7ed' },
        { title: 'Production', value: `${productionPercent}%`, change: 'On track', icon: '⚙️', color: '#fefce8' },
        { title: 'Total Budget', value: `₹${myOrders.reduce((sum, o) => sum + parseFloat(o.budget), 0)}`, change: 'Current mo', icon: '💰', color: '#f0fdf4' }
    ];

    const handleAcceptApplication = async (appId, orderId, workerId) => {
        try {
            await createContract({
                orderId,
                workerId,
                terms: "Standard digital manufacturing agreement. Task must be completed by the agreed deadline. Payment will be released upon quality approval by the factory owner."
            });
            alert('Contract created! Visit the Contracts tab to sign.');
            fetchData();
        } catch (err) {
            alert('Failed to accept application.');
        }
    };

    const handleRejectApplication = async (appId) => {
        if (!window.confirm("Reject this application?")) return;
        try {
            const { rejectApplication } = await import('../services/api');
            await rejectApplication(appId);
            fetchData();
        } catch (err) {
            alert('Failed to reject application.');
        }
    };

    const handleSignContract = async (signatureData, contractId) => {
        try {
            await signContract({ contractId, signature: signatureData });
            alert('Document signed successfully!');
            setSigningContractId(null);
            fetchData();
        } catch (err) {
            alert('Failed to sign contract.');
        }
    };

    const handleApproveWork = async (orderId) => {
        if (!window.confirm("Mark this production as Completed?")) return;
        try {
            await updateOrderStatus(orderId, 'completed');
            alert('Production approved and completed!');
            fetchData();
        } catch (err) {
            alert('Failed to approve work.');
        }
    };

    return (
        <DashboardLayout>
            <header className={styles.dashHeader}>
                <div className={styles.welcome}>
                    <h1>Factory Control</h1>
                    <p className={styles.date}>Manage your manufacturing operations from here.</p>
                </div>
            </header>

            <Routes>
                <Route index element={<SummaryView kpis={kpis} applications={applications} myOrders={myOrders} onAcceptApp={handleAcceptApplication} onRejectApp={handleRejectApplication} onPostClick={() => setShowModal(true)} />} />
                <Route path="micro-orders" element={
                    <>
                        <OrdersView myOrders={myOrders} onPostClick={() => setShowModal(true)} />
                        {myOrders.some(o => o.status === 'finishing') && (
                            <div className={styles.animateIn} style={{ marginTop: '20px' }}>
                                <div className={styles.sectionHeader}><h2>Pending Approvals</h2></div>
                                <div className={styles.tableCard}>
                                    <table className={styles.productionTable}>
                                        <tbody>
                                            {myOrders.filter(o => o.status === 'finishing').map(o => (
                                                <tr key={o.id}>
                                                    <td>{o.title}</td>
                                                    <td><button className={styles.tinyBtn} onClick={() => handleApproveWork(o.id)}>Approve Finished Work</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                } />
                <Route path="workers" element={<WorkerView contracts={contracts} />} />
                <Route path="contracts" element={<ContractsView contracts={contracts} signingContractId={signingContractId} setSigningContractId={setSigningContractId} handleSignContract={handleSignContract} user={user} />} />
                <Route path="payments" element={<PaymentsView myOrders={myOrders} />} />
                <Route path="profile" element={<ProfileView />} />
                <Route path="settings" element={<SettingsView />} />
            </Routes>

            {showModal && (
                <OrderModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchData();
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default OwnerDashboard;
