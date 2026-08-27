const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { RAZORPAY_KEY_SECRET } = require('../config/env');

/**
 * Create a Razorpay order.
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} receipt - Unique receipt ID (e.g., order UUID)
 * @param {Object} notes - Optional metadata
 * @returns {Promise<Object>} - Razorpay order object
 */
async function createOrder(amount, receipt, notes = {}) {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt,
      notes,
    });
    return order;
  } catch (error) {
    console.error('Razorpay create order error:', error);
    throw new Error('Failed to create payment order');
  }
}

/**
 * Verify Razorpay payment signature.
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} razorpaySignature
 * @returns {boolean} - Whether the signature is valid
 */
function verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

/**
 * Fetch payment details from Razorpay.
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} - Payment details
 */
async function getPayment(paymentId) {
  try {
    return await razorpay.payments.fetch(paymentId);
  } catch (error) {
    console.error('Razorpay fetch payment error:', error);
    throw new Error('Failed to fetch payment details');
  }
}

module.exports = { createOrder, verifySignature, getPayment };
