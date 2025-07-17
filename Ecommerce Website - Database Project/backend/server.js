const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
let db;

async function initializeDB() {
    try {
        // Create connection
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Codsnipepro1',
            database: 'db_project'
        });

        console.log('MySQL connected successfully');


        // Set up error handler after connection is established
        db.on('error', async (err) => {
            console.error('Database error:', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log('Reconnecting to database...');
                await initializeDB();
            }
        });

        return db;
    } catch (err) {
        console.error('Database connection failed:', err);
        // Retry after 5 seconds
        setTimeout(initializeDB, 5000);
        throw err;
    }
}

// Initialize database connection
initializeDB().then(() => {


    // API ENDPOINTS

    // Register Endpoint (updated to async/await)
    app.post('/register', async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Check if user exists
            const [users] = await db.query(
                'SELECT * FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (users.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Create new user
            const [result] = await db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, password]
            );

            res.status(201).json({
                message: 'User registered successfully',
                userId: result.insertId
            });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: 'Registration failed' });
        }
    });

    // Login Endpoint (updated to async/await)
    app.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            const [users] = await db.query(
                'SELECT * FROM users WHERE email = ? AND password = ?',
                [email, password]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = users[0];
            res.json({
                userId: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Get all games endpoint
    app.get('/api/games', async (req, res) => {
        try {
            const [games] = await db.query(`
            SELECT 
                game_id as id,
                game_title as title,
                description,
                price/100 as price,
                genre,
                platform,
                image_url
            FROM games
        `);
            // Convert to proper JavaScript objects
            const formattedGames = games.map(game => ({
                ...game,
                price: Number(game.price)  // Force numeric conversion
            }));

            res.json(formattedGames);
        } catch (err) {
            console.error('Failed to fetch games:', err);
            res.status(500).json({
                error: 'Failed to fetch games',
                details: err.message
            });
        }
    });

    // Get single game endpoint
    app.get('/api/games/:id', async (req, res) => {
        try {
            const [games] = await db.query(`
            SELECT 
                game_id as id,
                game_title as title,
                description,
                price/100 as price,
                genre,
                platform,
                image_url
            FROM games 
            WHERE game_id = ?
        `, [req.params.id]);

            if (games.length === 0) {
                return res.status(404).json({ error: 'Game not found' });
            }

            res.json(games[0]);
        } catch (err) {
            console.error('Failed to fetch game:', err);
            res.status(500).json({ error: 'Failed to fetch game' });
        }
    });

    // Create order endpoint
    app.post('/api/orders', async (req, res) => {
        try {
            console.log('Incoming request body:', JSON.stringify(req.body, null, 2));

            await db.beginTransaction();
            const { cart, userId } = req.body;
            if (!userId) {  // Add validation for userId
                throw new Error('User ID is required');
            }

            // 1. Validate cart structure
            if (!Array.isArray(cart)) {
                throw new Error('Cart must be an array');
            }

            // 2. Calculate total (with validation)
            const totalAmount = cart.reduce((sum, item) => {
                if (!item.id || isNaN(item.price) || isNaN(item.quantity)) {
                    throw new Error(`Invalid item in cart: ${JSON.stringify(item)}`);
                }
                return sum + (Math.round(Number(item.price) * 100) * Number(item.quantity));
            }, 0);

            // 3. Create order
            const [orderResult] = await db.query(
                'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
                [userId, totalAmount, 'completed']
            );
            const orderId = orderResult.insertId;

            // 4. Add order items
            await Promise.all(cart.map(item =>
                db.query(
                    'INSERT INTO order_items (order_id, game_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.quantity, Math.round(item.price * 100)]
                )
            ));

            // 5. Create payment record
            await db.query(
                'INSERT INTO payments (order_id, payment_method, payment_status) VALUES (?, ?, ?)',
                [orderId, 'online', 'completed']
            );

            await db.commit();
            console.log('Order created successfully:', orderId);
            res.json({ orderId });

        } catch (err) {
            await db.rollback();
            console.error('Checkout process failed:', {
                error: err,
                message: err.message,
                stack: err.stack,
                sql: err.sql
            });
            res.status(500).json({
                error: 'Checkout failed',
                details: err.message
            });
        }
    });

    // Get order details
    app.get('/api/orders/:id', async (req, res) => {
        try {
            const [orders] = await db.query(`
            SELECT 
              o.order_id,
              o.total_amount,
              DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i:%s') as order_date,
              o.status,
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'title', g.game_title,
                  'quantity', oi.quantity,
                  'price', (oi.price_at_purchase / 100)
                )
              ) as items
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN games g ON oi.game_id = g.game_id
            WHERE o.order_id = ?
            GROUP BY o.order_id`,
                [req.params.id]
            );

            if (orders.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Fix the JSON parsing
            const order = {
                ...orders[0],
                items: typeof orders[0].items === 'string' ?
                    JSON.parse(orders[0].items) :
                    orders[0].items
            };

            res.json(order);

        } catch (err) {
            console.error('Failed to fetch order:', err);
            res.status(500).json({
                error: 'Failed to fetch order',
                details: err.message
            });
        }
    });

    //temporary route endpoint:
    // Add this above your other routes
    app.get('/api/orders/test', (req, res) => {
        res.json({
            order_id: 999,
            user_id: 1,
            total_amount: 3999,
            order_date: new Date().toISOString(),
            status: 'completed',
            items: [
                { title: 'Test Game', price: 39.99, quantity: 1 }
            ]
        });
    });


    // Start server
    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
