const db = require('../config/db');

exports.createContract = async (req, res) => {
    const { orderId, workerId, terms } = req.body;
    try {
        // Start by creating the contract
        const { rows } = await db.execute(
            'INSERT INTO contracts (order_id, worker_id, owner_id, terms) VALUES ($1, $2, $3, $4) RETURNING id',
            [orderId, workerId, req.user.id, terms]
        );
        const contractId = rows[0].id;

        // Then update the order status so it's no longer "open"
        await db.execute("UPDATE orders SET status = 'assigned' WHERE id = $1", [orderId]);

        // Also update the application status
        await db.execute("UPDATE applications SET status = 'accepted' WHERE order_id = $1 AND worker_id = $2", [orderId, workerId]);

        res.status(201).json({ message: 'Contract generated and order assigned', contractId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.signContract = async (req, res) => {
    const { contractId } = req.params;
    const { signature } = req.body; // signature is base64 string
    const role = req.user.role;

    try {
        if (role === 'worker') {
            await db.execute("UPDATE contracts SET worker_signature = $1, status = 'signed_by_worker' WHERE id = $2", [signature, contractId]);
        } else if (role === 'owner') {
            await db.execute("UPDATE contracts SET owner_signature = $1, status = 'signed_by_owner' WHERE id = $2", [signature, contractId]);
        } else {
            return res.status(403).json({ message: "Unauthorized role" });
        }
        res.json({ message: 'Contract signed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getContracts = async (req, res) => {
    try {
        const { rows: contracts } = await db.execute(`
            SELECT 
                c.*, 
                o.title as order_title, 
                o.quantity as order_quantity, 
                o.budget as order_budget, 
                o.deadline as order_deadline,
                o.status as order_status,
                u_owner.name as owner_name,
                u_owner.company as owner_company,
                u_worker.name as worker_name,
                u_worker.skill as worker_skill
            FROM contracts c 
            JOIN orders o ON c.order_id = o.id 
            JOIN users u_owner ON c.owner_id = u_owner.id
            JOIN users u_worker ON c.worker_id = u_worker.id
            WHERE c.owner_id = $1 OR c.worker_id = $2
        `, [req.user.id, req.user.id]);
        res.json(contracts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
