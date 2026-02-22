const db = require('../config/db');

exports.createOrder = async (req, res) => {
    const { title, description, quantity, pieceRate, budget, deadline } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("Incoming Create Order Request:", { body: req.body, file: req.file, userId: req.user?.id });
    try {
        const { rows } = await db.execute(
            'INSERT INTO orders (title, description, quantity, piece_rate, budget, deadline, created_by, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [title, description, quantity, pieceRate, budget, deadline, req.user.id, imageUrl]
        );
        const orderId = rows[0].id;
        console.log("Order created successfully in DB, ID:", orderId);
        res.status(201).json({ message: 'Order created', orderId, imageUrl });
    } catch (error) {
        console.error("Database error during order creation:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { rows: orders } = await db.execute("SELECT * FROM orders WHERE status = 'open'");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const { rows: orders } = await db.execute('SELECT * FROM orders WHERE created_by = $1', [req.user.id]);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.applyForOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        await db.execute('INSERT INTO applications (order_id, worker_id) VALUES ($1, $2)', [orderId, req.user.id]);
        res.status(201).json({ message: 'Application submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getApplications = async (req, res) => {
    try {
        const { rows: applications } = await db.execute(`
            SELECT a.id, a.status, a.applied_at, u.name as worker_name, u.id as worker_id, o.title as order_title, o.id as order_id 
            FROM applications a 
            JOIN users u ON a.worker_id = u.id 
            JOIN orders o ON a.order_id = o.id 
            WHERE o.created_by = $1
        `, [req.user.id]);

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.rejectApplication = async (req, res) => {
    const { appId } = req.params;
    try {
        await db.execute("UPDATE applications SET status = 'rejected' WHERE id = $1", [appId]);
        res.json({ message: 'Application rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
        await db.execute('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


