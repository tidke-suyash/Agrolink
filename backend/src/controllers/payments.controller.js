const razorpayService = require('../services/razorpayService');
const supabase = require('../config/supabase');
const { RAZORPAY_KEY_ID } = require('../config/env');

/**
 * Create a Razorpay order for payment.
 * POST /api/payments/create-order
 * Body: { order_id } — the AgroLink order UUID
 */
async function createPaymentOrder(req, res, next) {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    // Fetch the order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('buyer_id', req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not in pending status' });
    }

    // Create Razorpay order
    const rzpOrder = await razorpayService.createOrder(
      order.total_price,
      order_id,
      {
        buyer_id: req.user.id,
        order_id: order_id,
      }
    );

    // Save Razorpay order ID to our order
    await supabase
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', order_id);

    res.json({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify Razorpay payment signature and mark order as paid.
 * POST /api/payments/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }
 */
async function verifyPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification data is required' });
    }

    // Verify signature
    const isValid = razorpayService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update order status to paid
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id,
      })
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Reduce stock for each item
    const items = data.items || [];
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        qty: item.quantity,
      }).catch(() => {
        // If RPC doesn't exist, do it manually
        supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()
          .then(({ data: product }) => {
            if (product) {
              supabase
                .from('products')
                .update({ stock: Math.max(0, product.stock - item.quantity) })
                .eq('id', item.product_id)
                .then(() => {});
            }
          });
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPaymentOrder, verifyPayment };
