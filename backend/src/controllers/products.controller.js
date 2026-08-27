const supabase = require('../config/supabase');

/**
 * List products with filters.
 * GET /api/products
 * Query: ?category=&search=&farmer_id=&page=1&limit=20
 */
async function listProducts(req, res, next) {
  try {
    const {
      category, search, farmer_id,
      page = 1, limit = 20,
      sort = 'created_at', order = 'desc',
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, profiles!farmer_id(name, location, avatar_url)', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_approved', true)
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (farmer_id) query = query.eq('farmer_id', farmer_id);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      products: data,
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
 * Get single product by ID.
 * GET /api/products/:id
 */
async function getProduct(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles!farmer_id(name, location, avatar_url, phone)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new product (farmer only).
 * POST /api/products
 */
async function createProduct(req, res, next) {
  try {
    const { title, description, price, unit, stock, images, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        farmer_id: req.user.id,
        title,
        description,
        price: parseFloat(price),
        unit: unit || 'kg',
        stock: parseInt(stock) || 0,
        images: images || [],
        category: category || 'vegetables',
        is_approved: false, // Needs admin approval
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ product: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a product (farmer owns it).
 * PUT /api/products/:id
 */
async function updateProduct(req, res, next) {
  try {
    const { title, description, price, unit, stock, images, category, is_active } = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('products')
      .select('farmer_id')
      .eq('id', req.params.id)
      .single();

    if (!existing || (existing.farmer_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(unit !== undefined && { unit }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(images !== undefined && { images }),
        ...(category !== undefined && { category }),
        ...(is_active !== undefined && { is_active }),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ product: data });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a product.
 * DELETE /api/products/:id
 */
async function deleteProduct(req, res, next) {
  try {
    const { data: existing } = await supabase
      .from('products')
      .select('farmer_id')
      .eq('id', req.params.id)
      .single();

    if (!existing || (existing.farmer_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get farmer's own products (including unapproved).
 * GET /api/products/my
 */
async function getMyProducts(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ products: data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getMyProducts,
};
