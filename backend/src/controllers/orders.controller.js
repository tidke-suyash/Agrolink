const supabase = require('../config/supabase');

/**
 * Create a new order.
 * POST /api/orders
 * Body: { items: [{product_id, quantity, price}], shipping_address, notes }
 */
async function createOrder(req, res, next) {
  try {
    const { items, shipping_address, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    // Calculate total price
    const totalPrice = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: req.user.id,
        items,
        total_price: totalPrice,
        shipping_address,
        notes,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ order: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user's orders.
 * GET /api/orders
 */
async function getMyOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      orders: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single order by ID.
 * GET /api/orders/:id
 */
async function getOrder(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization: buyer, or admin
    if (data.buyer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json({ order: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Update order status (farmer/admin).
 * PUT /api/orders/:id/status
 * Body: { status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;

    const validStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ order: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Get orders for farmer's products.
 * GET /api/orders/farmer
 */
async function getFarmerOrders(req, res, next) {
  try {
    // Get all orders and filter for ones containing this farmer's products
    const { data: farmerProducts } = await supabase
      .from('products')
      .select('id')
      .eq('farmer_id', req.user.id);

    const productIds = (farmerProducts || []).map((p) => p.id);

    if (productIds.length === 0) {
      return res.json({ orders: [] });
    }

    // Get all orders and filter those containing farmer's product IDs in items
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter orders that contain at least one of the farmer's products
    const farmerOrders = (orders || []).filter((order) => {
      const items = order.items || [];
      return items.some((item) => productIds.includes(item.product_id));
    });

    res.json({ orders: farmerOrders });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder, getMyOrders, getOrder,
  updateOrderStatus, getFarmerOrders,
};
