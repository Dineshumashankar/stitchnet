import axios from 'axios';
import { notifyChatbot } from '../utils/chatbotNotifier';

// Create an instance of axios with the base URL for the backend
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

const USE_MOCK = false; // Set to true for frontend-only development

// Initial Seed Data for Mock Mode
const seedMockData = () => {
    if (!localStorage.getItem('mock_orders')) {
        const initialOrders = [
            { id: 1, title: 'Cotton T-Shirt Bulk', description: 'Need 500 cotton t-shirts stitched.', quantity: 500, pieceRate: 100, budget: 50000, status: 'open', created_at: new Date().toISOString() },
            { id: 2, title: 'Denim Jackets', description: '100 denim jackets with embroidery.', quantity: 100, pieceRate: 1200, budget: 120000, status: 'open', created_at: new Date().toISOString() },
            { id: 3, title: 'Silk Sarees Finishing', description: 'Hemming and finishing for 50 silk sarees.', quantity: 50, pieceRate: 300, budget: 15000, status: 'open', created_at: new Date().toISOString() }
        ];
        localStorage.setItem('mock_orders', JSON.stringify(initialOrders));
    } else {
        // Migration: Ensure existing orders have quantity and pieceRate
        const existing = JSON.parse(localStorage.getItem('mock_orders'));
        const updated = existing.map(o => ({
            ...o,
            quantity: o.quantity || 500,
            pieceRate: o.pieceRate || (o.budget / (o.quantity || 500)) || 100
        }));
        localStorage.setItem('mock_orders', JSON.stringify(updated));
    }
    if (!localStorage.getItem('mock_applications')) {
        localStorage.setItem('mock_applications', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_contracts')) {
        localStorage.setItem('mock_contracts', JSON.stringify([]));
    }
};

if (USE_MOCK) {
    seedMockData();
}

// Helper for mock data
const getMockData = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const saveMockData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Interceptor to add the JWT token to every request's Authorization header
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Auth API calls
export const login = async (data) => {
    if (USE_MOCK) {
        const isWorker = data.email.toLowerCase().includes('worker');
        const role = isWorker ? 'worker' : 'owner';
        const name = isWorker ? 'Mock Worker' : 'Owner User';

        const mockUser = { id: isWorker ? 2 : 1, name, email: data.email, role };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token');
        return { data: { token: 'mock-token', user: mockUser } };
    }
    return API.post('/auth/login', data);
};

export const register = async (data) => {
    if (USE_MOCK) {
        const mockUser = { id: 1, name: data.name, email: data.email, role: data.role };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token');
        return { data: { token: 'mock-token', user: mockUser } };
    }
    return API.post('/auth/register', data);
};

// Orders API calls
export const createOrder = async (data) => {
    if (USE_MOCK) {
        const orders = getMockData('mock_orders');
        const newOrder = {
            ...Object.fromEntries(data instanceof FormData ? data.entries() : Object.entries(data)),
            id: orders.length + 1,
            status: 'open',
            created_at: new Date().toISOString()
        };
        orders.push(newOrder);
        saveMockData('mock_orders', orders);
        return { data: { message: 'Order created', orderId: newOrder.id } };
    }
    // If data is FormData, axios handles everything including boundary headers
    const response = await API.post('/orders', data);
    const orderTitle = data instanceof FormData ? data.get('title') : data.title;
    notifyChatbot(`Success! New Order "${orderTitle}" has been posted to the network.`);
    return response;
};

export const getOrders = async () => {
    if (USE_MOCK) {
        const orders = getMockData('mock_orders');
        return { data: orders.filter(o => o.status === 'open') };
    }
    return API.get('/orders');
};

export const getMyOrders = async () => {
    if (USE_MOCK) {
        const orders = getMockData('mock_orders');
        return { data: orders };
    }
    return API.get('/orders/my');
};

export const applyForOrder = async (data) => {
    if (USE_MOCK) {
        const applications = getMockData('mock_applications');
        const newApp = {
            id: applications.length + 1,
            order_id: data.orderId,
            worker_id: 2,
            worker_name: 'Mock Worker',
            status: 'pending',
            applied_at: new Date().toISOString()
        };
        applications.push(newApp);
        saveMockData('mock_applications', applications);
        return { data: { message: 'Application submitted' } };
    }
    const response = await API.post(`/orders/${data.orderId}/apply`);
    notifyChatbot(`Application sent for Order #${data.orderId}. The owner will review your profile shortly.`);
    return response;
};

// Applications API calls
export const getApplications = async () => {
    if (USE_MOCK) {
        const applications = getMockData('mock_applications');
        const orders = getMockData('mock_orders');
        return {
            data: applications.map(app => ({
                ...app,
                order_title: orders.find(o => o.id === app.order_id)?.title || 'Unknown Order'
            }))
        };
    }
    return API.get('/orders/applications');
};

// Contracts API calls
export const createContract = async (data) => {
    if (USE_MOCK) {
        const contracts = getMockData('mock_contracts');
        const orders = getMockData('mock_orders');
        const order = orders.find(o => o.id === data.orderId);
        const newContract = {
            id: contracts.length + 1,
            order_id: data.orderId,
            order_title: order?.title || 'Unknown Order',
            worker_id: data.workerId,
            terms: data.terms,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        contracts.push(newContract);
        saveMockData('mock_contracts', contracts);
        return { data: { message: 'Contract created' } };
    }
    const response = await API.post('/contracts', data);
    notifyChatbot(`Contract created for Order #${data.orderId}. It is now ready for digital signing.`);
    return response;
};

export const getContracts = async () => {
    if (USE_MOCK) {
        return { data: getMockData('mock_contracts') };
    }
    return API.get('/contracts');
};

export const signContract = async (data) => {
    if (USE_MOCK) {
        const contracts = getMockData('mock_contracts');
        const contract = contracts.find(c => c.id === data.contractId);
        if (contract) {
            contract.owner_signature = data.signature;
            contract.status = 'signed_by_owner';
            saveMockData('mock_contracts', contracts);
        }
        return { data: { message: 'Document signed successfully' } };
    }
    const response = await API.post(`/contracts/${data.contractId}/sign`, { signature: data.signature });
    notifyChatbot(`Contract #${data.contractId} has been signed! Moving to the next production phase.`);
    return response;
};

export const updateOrderStatus = async (orderId, status) => {
    if (USE_MOCK) {
        const orders = getMockData('mock_orders');
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            saveMockData('mock_orders', orders);
        }
        return { data: { message: 'Order status updated' } };
    }
    const response = await API.patch(`/orders/${orderId}/status`, { status });
    notifyChatbot(`Order #${orderId} status changed to ${status.toUpperCase()}. Check your dashboard for details.`);
    return response;
};



export const rejectApplication = async (appId) => {
    if (USE_MOCK) {
        const applications = getMockData('mock_applications');
        const app = applications.find(a => a.id === appId);
        if (app) {
            app.status = 'rejected';
            saveMockData('mock_applications', applications);
        }
        return { data: { message: 'Application rejected' } };
    }
    return API.patch(`/orders/applications/${appId}/reject`);
};

export const getProfile = async () => {
    return API.get('/profile');
};

export const updateProfile = async (data) => {
    return API.patch('/profile', data);
};

export const uploadProfilePhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return API.post('/profile/photo', formData);
};

export default {
    login,
    register,
    createOrder,
    getOrders,
    getMyOrders,
    applyForOrder,
    getApplications,
    createContract,
    getContracts,
    signContract,
    updateOrderStatus,

    rejectApplication,
    getProfile,
    updateProfile,
    uploadProfilePhoto
};
