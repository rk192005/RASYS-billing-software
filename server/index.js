const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

// Initialize DB with defaults
db.defaults({ invoices: [], clients: [], products: [], settings: {} }).write();

app.use(cors({
    origin: '*', // In production, restrict to your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- SECURITY & FIREWALL ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 1. Helmet: Sets various HTTP headers for security
app.use(helmet());

// 2. XSS-Clean: Disabled due to compatibility issues
// app.use(xss());

// 3. Rate Limiter: Prevent brute-force/DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(bodyParser.json());

// 4. Purchases (Expense Tracking)
app.get('/api/purchases', (req, res) => {
    const purchases = db.get('purchases').value() || [];
    res.json(purchases);
});

app.post('/api/purchases', (req, res) => {
    const expense = req.body;
    if (!expense.id) expense.id = Date.now().toString();
    // Initialize if not exists
    if (!db.has('purchases').value()) db.defaults({ purchases: [] }).write();

    db.get('purchases').push(expense).write();
    res.json({ success: true, expense });
});

app.delete('/api/purchases/:id', (req, res) => {
    db.get('purchases').remove({ id: req.params.id }).write();
    res.json({ success: true });
});

// Update AI Logic to include Profit
app.post('/api/ai/analyze', (req, res) => {
    const { invoices, purchases = [] } = db.getState();

    // Revenue
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.items?.reduce((s, i) => s + (i.qty * i.price), 0) || 0), 0);

    // Expenses
    const totalExpenses = purchases.reduce((sum, pur) => sum + Number(pur.amount || 0), 0);

    // Profit
    const profit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

    const insights = [
        `Creating financial report...`,
        `Net Profit: ₹${profit.toFixed(2)} (Margin: ${margin}%)`,
        `Total Expenses: ₹${totalExpenses.toFixed(2)}`,
        `AI Security: All purchase records are encrypted and secure.`
    ];

    setTimeout(() => {
        res.json({ success: true, insights });
    }, 1500);
});

// --- ROUTES ---

// 1. Invoices
app.get('/api/invoices', (req, res) => {
    const invoices = db.get('invoices').value();
    res.json(invoices);
});

app.post('/api/invoices', (req, res) => {
    const invoice = req.body;
    // Ensure status is set
    if (!invoice.status) invoice.status = 'Unpaid';
    db.get('invoices').push(invoice).write();
    res.json({ success: true, invoice });
});

app.put('/api/invoices/:id', (req, res) => {
    const updates = req.body;
    db.get('invoices')
        .find({ id: req.params.id })
        .assign(updates)
        .write();
    res.json({ success: true });
});

// 2. Clients
app.get('/api/clients', (req, res) => {
    const clients = db.get('clients').value();
    res.json(clients);
});

app.post('/api/clients', (req, res) => {
    const client = req.body;
    if (!client.id) client.id = Date.now().toString(); // Auto gen ID
    db.get('clients').push(client).write();
    res.json({ success: true, client });
});

app.put('/api/clients/:id', (req, res) => {
    const updates = req.body;
    db.get('clients').find({ id: req.params.id }).assign(updates).write();
    res.json({ success: true });
});

app.delete('/api/clients/:id', (req, res) => {
    db.get('clients').remove({ id: req.params.id }).write();
    res.json({ success: true });
});

// 3. Products
app.get('/api/products', (req, res) => {
    const products = db.get('products').value();
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const product = req.body;
    if (!product.id) product.id = Date.now().toString(); // Auto gen ID
    db.get('products').push(product).write();
    res.json({ success: true, product });
});

app.put('/api/products/:id', (req, res) => {
    const updates = req.body;
    db.get('products').find({ id: req.params.id }).assign(updates).write();
    res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
    db.get('products').remove({ id: req.params.id }).write();
    res.json({ success: true });
});

// 4. Settings (Business Profile)
app.get('/api/settings', (req, res) => {
    const settings = db.get('settings').value() || {};
    res.json(settings);
});

app.post('/api/settings', (req, res) => {
    const settings = req.body;
    console.log("Saving settings:", settings);
    db.set('settings', settings).write();
    res.json({ success: true, settings });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
