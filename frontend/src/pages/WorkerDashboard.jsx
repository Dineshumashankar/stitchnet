import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, applyForOrder, getContracts, signContract, updateOrderStatus } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import SignaturePad from '../components/SignaturePad';
import ProfileView from '../components/ProfileView';
import SettingsView from '../components/SettingsView';
import styles from './Dashboard.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Sub-components
const SummaryView = ({ kpis, contracts, onUpdateStatus }) => (
    <div className={styles.animateIn}>
        <div className={styles.kpiGrid}>
            {kpis.map((kpi, idx) => (
                <div key={idx} className={styles.kpiCard} style={{ '--kpi-bg': kpi.color, '--delay': `${idx * 0.1}s` }}>
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
                    <h2>Active Production Tasks</h2>
                    <Link to="/worker/payments" className={styles.viewAll}>View Details</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {contracts.filter(c => c.order_status !== 'completed').length === 0 ? (
                        <div className={styles.tableCard} style={{ padding: '60px', textAlign: 'center' }}>
                            <p className={styles.emptyText}>No active tasks. Browse work to get started!</p>
                        </div>
                    ) : (
                        contracts.filter(c => c.order_status !== 'completed').map((contract, idx) => (
                            <div key={contract.id} className={`${styles.taskCard} ${styles.animateIn}`} style={{ '--delay': `${0.3 + (idx * 0.1)}s` }}>
                                <div className={styles.taskMainInfo}>
                                    <span className={styles.idTag}>#TSK-{1000 + contract.id}</span>
                                    <h3 className={styles.taskTitle}>{contract.order_title}</h3>
                                    <div className={styles.taskStats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statItemLabel}>Quantity</span>
                                            <span className={styles.statItemValue}>{contract.order_quantity} Units</span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statItemLabel}>Deadline</span>
                                            <span className={styles.statItemValue}>{new Date(contract.order_deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span className={`${styles.statusBadge} ${styles[(contract.order_status || 'open').toLowerCase().replace('_', '')] || styles.sewing}`}>
                                        {(contract.order_status || 'Open').replace('_', ' ')}
                                    </span>
                                    <select
                                        className={styles.statusSelect}
                                        onChange={(e) => onUpdateStatus(contract.order_id, e.target.value)}
                                        value={contract.order_status || 'open'}
                                    >
                                        <option value="open">Open</option>
                                        <option value="cutting">Cutting</option>
                                        <option value="sewing">Sewing</option>
                                        <option value="finishing">Finishing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <aside className={styles.sideColumn}>
                <section className={styles.sideSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Weekly Perf</h2>
                    </div>
                    <div className={styles.statBox}>
                        <div className={styles.circularProgress}>
                            <span className={styles.progressValue}>98%</span>
                        </div>
                        <p className={styles.statLabel}>Efficiency Score</p>
                    </div>
                </section>
            </aside>
        </div>
    </div>
);

const BrowseView = ({ orders, handleApply }) => (
    <div className={styles.animateIn}>
        <div className={styles.sectionHeader}>
            <h2>Available Opportunities</h2>
        </div>
        <div className={styles.ordersGrid}>
            {orders.length === 0 ? (
                <div className={styles.tableCard} style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}>
                    <p className={styles.emptyText}>No available orders at the moment.</p>
                </div>
            ) : (
                orders.map((order, idx) => (
                    <div key={order.id} className={styles.orderCard} style={{ '--delay': `${idx * 0.1}s` }}>
                        <div
                            className={styles.orderImage}
                            style={{
                                backgroundImage: `url(${order.image_url ? `${API_BASE_URL}${order.image_url}` : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'})`
                            }}
                        >
                            {!order.image_url && <div className={styles.orderBadge}>SAMPLE</div>}
                        </div>
                        <div className={styles.orderBody}>
                            <h3 className={styles.orderTitle}>{order.title}</h3>
                            <p className={styles.orderDesc}>{order.description}</p>
                            <div className={styles.orderMeta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Budget</span>
                                    <span className={styles.metaValue}>₹{order.budget}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Pieces</span>
                                    <span className={styles.metaValue}>{order.quantity}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Rate</span>
                                    <span className={styles.metaValue}>₹{order.pieceRate || '--'}/pc</span>
                                </div>
                            </div>
                            <button className={styles.applyBtn} onClick={() => handleApply(order.id)}>
                                <span>Apply for Order</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const PaymentsView = ({ contracts }) => {
    const completedContracts = contracts.filter(c => c.status === 'completed');
    const totalEarnings = completedContracts.reduce((sum, c) => sum + parseFloat(c.order_budget || 0), 0);
    const inEscrow = contracts
        .filter(c => c.status !== 'completed' && !!c.owner_signature && !!c.worker_signature)
        .reduce((sum, c) => sum + parseFloat(c.order_budget || 0), 0);

    return (
        <div className={styles.animateIn}>
            <div className={styles.sectionHeader}>
                <h2>Payments & Escrow</h2>
                <p className={styles.date}>Track your earnings and secured escrow balances.</p>
            </div>

            <div className={styles.paymentsGrid}>
                <div className={styles.balanceCard} style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}>
                    <span className={styles.balanceLabel}>Total Net Earnings</span>
                    <div className={styles.balanceValue}>₹{totalEarnings.toLocaleString()}</div>
                    <div className={styles.balanceMeta}>
                        <span>{completedContracts.length} Tasks Completed</span>
                        <span>Available for Payout</span>
                    </div>
                </div>
                <div className={styles.balanceCard}>
                    <span className={styles.balanceLabel}>Secured in Escrow</span>
                    <div className={styles.balanceValue}>₹{inEscrow.toLocaleString()}</div>
                    <div className={styles.balanceMeta}>
                        <span>{contracts.filter(c => c.status !== 'completed').length} Active Contracts</span>
                        <span>StitchNet Protection Active</span>
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
            pdf.save(`Service_Agreement_${contractId}.pdf`);
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '___________';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const renderSignature = (signature, label, isForPDF = false) => {
        if (!signature) return <span className={styles.emptyText} style={{ padding: 0, fontSize: isForPDF ? '1rem' : '0.85rem' }}>{isForPDF ? '_______________________________' : 'Click Sign to verify...'}</span>;

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
                        {signature.replace(/_/g, ' ').replace(/\.pvt/gi, ' Pvt').replace(/\./g, ' ')}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className={`${styles.mainSection} ${styles.animateIn}`}>
            <div className={styles.sectionHeader}>
                <h2>My Contracts</h2>
            </div>
            {contracts.length === 0 ? (
                <div className={styles.tableCard} style={{ padding: '60px', textAlign: 'center' }}>
                    <p className={styles.emptyText}>No contracts generated yet. Apply for orders to get started.</p>
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
                                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>SERVICE AGREEMENT</h1>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>StitchNet Manufacturing Network</p>
                                </div>

                                <div style={{ border: '1.5px solid #f1f5f9', borderRadius: '12px', padding: '32px', marginBottom: '40px' }}>
                                    <div className={styles.partyGrid}>
                                        <div className={styles.partyBox}>
                                            <h4>FACTORY OWNER</h4>
                                            <p className={styles.partyName}>{contract.owner_name}</p>
                                            <p className={styles.partyDetails}>StitchNet Verified Partner</p>
                                        </div>
                                        <div className={styles.partyBox}>
                                            <h4>TEXTILE WORKER</h4>
                                            <p className={styles.partyName}>{user.name}</p>
                                            <p className={styles.partyDetails}>Independent Service Provider</p>
                                        </div>
                                    </div>

                                    <div className={styles.taskBox}>
                                        <h4 style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '700', marginBottom: '16px' }}>MANUFACTURING SCOPE</h4>
                                        <p className={styles.taskDesc}>
                                            This agreement authorizes <strong>{user.name}</strong> to perform manufacturing services for Order <strong>#{contract.order_id}</strong> ({contract.order_title}).
                                            The scope includes all standard production tasks as per industrial quality benchmarks.
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
                                            {renderSignature(contract.owner_signature, "Owner", true)}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>Duly Authorized Signatory</p>
                                    </div>

                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>WORKER ACKNOWLEDGMENT</p>
                                        <div style={{ paddingBottom: '10px', minHeight: '80px', display: 'flex', alignItems: 'flex-end' }}>
                                            {contract.worker_signature ?
                                                renderSignature(contract.worker_signature, "Worker", true) :
                                                (!contract.worker_signature && !isCompleted ?
                                                    (signingContractId === contract.id ? (
                                                        <div style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
                                                            <SignaturePad
                                                                onSave={(data) => handleSignContract(data, contract.id)}
                                                                onClear={() => setSigningContractId(null)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSigningContractId(contract.id)}
                                                            className={styles.primaryAction}
                                                            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                                                        >
                                                            ✍️ Sign Document
                                                        </button>
                                                    )) :
                                                    <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Signature Pending...</span>
                                                )
                                            }
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>Agreed and Accepted</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1.5px dashed #f1f5f9', textAlign: 'center' }}>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                                        StitchNet Digital Verification Code: <strong>SN-V-{contract.id}-{contract.order_id}</strong> |
                                        This is a legally binding digital manufacturing agreement.
                                    </p>
                                </div>
                            </div>

                            <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                <button
                                    onClick={() => handleDownloadPDF(contract.id)}
                                    className={styles.tinyBtn}
                                    style={{ height: '44px', padding: '0 24px' }}
                                >
                                    📥 Download Official Copy
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [signingContractId, setSigningContractId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, contractsRes] = await Promise.all([
                    getOrders(),
                    getContracts()
                ]);
                setOrders(ordersRes.data);
                setContracts(contractsRes.data);
            } catch (err) {
                console.error("Dashboard error", err);
            }
        };

        fetchData();

        // Poll for updates every 5 seconds
        const interval = setInterval(fetchData, 5000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const handleApply = async (orderId) => {
        try {
            await applyForOrder({ orderId });
            alert('Applied successfully!');
        } catch (err) {
            alert('Already applied or error.');
        }
    };

    const handleUpdateStatus = async (orderId, status, requireConfirm = false) => {
        // If marking as completed, show confirmation dialog
        if (status === 'completed' && requireConfirm) {
            const confirmed = window.confirm(
                '✅ Mark this order as COMPLETED?\n\n' +
                'This will:\n' +
                '• Move the order to your Earnings page\n' +
                '• Add the payment amount to your total earnings\n' +
                '• Remove it from Active Work\n\n' +
                'Are you sure the work is finished?'
            );

            if (!confirmed) {
                return; // User cancelled
            }
        }

        try {
            await updateOrderStatus(orderId, status);

            if (status === 'completed') {
                alert('🎉 Order marked as completed! Check your Earnings page.');
            } else {
                alert('Status updated!');
            }

            const res = await getContracts();
            setContracts(res.data);
        } catch (err) {
            console.error("Update error:", err);
            alert('Update error.');
        }
    };

    const handleSignContract = async (signatureData, contractId) => {
        try {
            await signContract({ contractId, signature: signatureData });
            alert('Signed!');
            setSigningContractId(null);
            const res = await getContracts();
            setContracts(res.data);
        } catch (err) {
            alert('Sign error.');
        }
    };

    const totalEarnings = contracts
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + parseFloat(c.order_budget || 0), 0);

    const kpis = [
        { title: 'Earnings', value: `₹${(totalEarnings / 1000).toFixed(1)}k`, change: 'Total', icon: '💰', color: '#f0fdf4' },
        { title: 'Contracts', value: contracts.filter(c => c.status !== 'completed').length.toString(), change: 'Active', icon: '📝', color: '#eff6ff' },
        { title: 'Score', value: '4.9', change: '+0.1', icon: '⭐️', color: '#fff7ed' },
        { title: 'Rank', value: '#12', change: 'Top 5%', icon: '🏆', color: '#fefce8' }
    ];

    return (
        <DashboardLayout>
            <header className={styles.dashHeader}>
                <div className={styles.welcome}>
                    <h1>Worker Portal</h1>
                    <p className={styles.date}>Browse orders and manage your earnings.</p>
                </div>
            </header>

            <Routes>
                <Route index element={<SummaryView kpis={kpis} contracts={contracts} onUpdateStatus={handleUpdateStatus} />} />
                <Route path="browse" element={<BrowseView orders={orders} handleApply={handleApply} />} />
                <Route path="applications" element={<div className={styles.animateIn}><h2>My Applications</h2><p>Track the status of your submitted order requests.</p></div>} />
                <Route path="contracts" element={<ContractsView contracts={contracts} signingContractId={signingContractId} setSigningContractId={setSigningContractId} handleSignContract={handleSignContract} user={user} />} />
                <Route path="payments" element={<PaymentsView contracts={contracts} />} />
                <Route path="profile" element={<ProfileView />} />
                <Route path="settings" element={<SettingsView />} />
            </Routes>
        </DashboardLayout>
    );
};

export default WorkerDashboard;
