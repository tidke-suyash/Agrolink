const express = require('express');
const cors = require('cors');
const { PORT, FRONTEND_URL, NODE_ENV } = require('./src/config/env');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const productsRoutes = require('./src/routes/products.routes');
const ordersRoutes = require('./src/routes/orders.routes');
const paymentsRoutes = require('./src/routes/payments.routes');
const weatherRoutes = require('./src/routes/weather.routes');
const marketRoutes = require('./src/routes/market.routes');
const aiRoutes = require('./src/routes/ai.routes');
const complaintsRoutes = require('./src/routes/complaints.routes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgroLink API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintsRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
});

// ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌱 AgroLink API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Frontend:    ${FRONTEND_URL}\n`);
});

module.exports = app;
