import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OwnerDashboard from './pages/OwnerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Chatbot from './components/Chatbot';
import './styles/global.css';

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== role) return <Navigate to="/" />; // Or unauthorized page

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/owner/*"
                        element={
                            <PrivateRoute role="owner">
                                <OwnerDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/worker/*"
                        element={
                            <PrivateRoute role="worker">
                                <WorkerDashboard />
                            </PrivateRoute>
                        }
                    />
                </Routes>
                <Chatbot />
            </AuthProvider>
        </Router>
    );
}

export default App;
