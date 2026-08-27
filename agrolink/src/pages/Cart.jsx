import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  ShieldCheck, CheckCircle2, Truck, ArrowLeft, Tag
} from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const deliveryFee = items.length > 0 ? (totalPrice > 1000 ? 0 : 50) : 0;
  const finalTotal = Math.max(0, totalPrice - discount + deliveryFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'AGROLINK20' || couponCode.toUpperCase() === 'KISAN') {
      const disc = Math.round(totalPrice * 0.15);
      setDiscount(disc);
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code. Try: AGROLINK20');
    }
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      setOrderPlaced(true);
      clearCart();
    }, 1200);
  };

  if (orderPlaced) {
    return (
      <div className="glass p-12 text-center max-w-lg mx-auto animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-[#f6faf7] text-[#7c9b85] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Your direct farm order has been placed. The farmer has been notified and will package your fresh harvest immediately.
        </p>
        <div className="p-4 bg-[#f6faf7] rounded-lg border border-[#c4d9c8] text-left mb-6 text-xs text-[#4f6b58]">
          <p className="font-semibold mb-1">Order #AGRO-{Math.floor(100000 + Math.random() * 900000)}</p>
          <p>Estimated Express Delivery: Tomorrow by 11:00 AM</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn btn-secondary text-sm">
            Back to Shop
          </Link>
          <Link to="/orders" className="btn btn-primary text-sm">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass p-12 text-center max-w-lg mx-auto animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Support local cultivators by adding fresh crops and farm products directly to your cart.
        </p>
        <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Browse Fresh Crops</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Shopping Cart</h1>
          <p className="text-sm text-gray-500">{totalItems} fresh items in your basket</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#c97b71] hover:underline flex items-center gap-1 font-medium"
        >
          <Trash2 size={13} />
          <span>Empty Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass p-4 rounded-xl flex flex-wrap items-center gap-4 hover:shadow-md transition-shadow"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200'}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg shrink-0 border border-gray-100"
              />

              <div className="flex-1 min-w-[140px]">
                <h4 className="font-bold text-gray-900 text-base truncate">{item.title}</h4>
                <p className="text-xs text-gray-500 mb-2">
                  {item.farmer_name ? `Farmer: ${item.farmer_name}` : 'Local Harvest'}
                </p>
                <div className="text-[#4f6b58] font-bold font-mono text-base">
                  ₹{item.price}{' '}
                  <span className="text-xs font-normal text-gray-400">/ {item.unit || 'kg'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto">
              {/* Quantity controls */}
              <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200 shrink-0">
                <button
                  className="w-7 h-7 bg-white rounded flex items-center justify-center text-gray-700 hover:bg-[#f6faf7] transition"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-sm font-mono">
                  {item.quantity}
                </span>
                <button
                  className="w-7 h-7 bg-white rounded flex items-center justify-center text-gray-700 hover:bg-[#f6faf7] transition"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right min-w-[70px] shrink-0">
                <div className="font-bold text-gray-900 font-heading">
                  ₹{item.price * item.quantity}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#e0a0a0] hover:text-[#c97b71] p-1 mt-1"
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="flex flex-col gap-5">
          <div className="glass p-6 rounded-xl flex flex-col gap-4">
            <h3 className="font-bold text-lg text-gray-900 font-heading">Order Summary</h3>

            <div className="flex flex-col gap-2 text-sm text-gray-600 border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-mono font-medium">₹{totalPrice}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#7c9b85] font-medium">
                  <span>Farm Discount (15%)</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Direct Rural Logistics</span>
                <span className="font-mono">
                  {deliveryFee === 0 ? (
                    <span className="text-[#7c9b85] font-semibold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-1">
              <span>Total Payable</span>
              <span className="text-2xl text-[#4f6b58] font-mono">₹{finalTotal}</span>
            </div>

            {/* Coupon Code input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Coupon (AGROLINK20)"
                  className="input w-full pl-9 text-xs uppercase"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary text-xs px-3">
                Apply
              </button>
            </form>
            {couponApplied && (
              <p className="text-xs text-[#7c9b85] font-medium -mt-2">
                ✓ Coupon AGROLINK20 applied successfully!
              </p>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="btn btn-primary w-full mt-2 py-3 flex items-center justify-center gap-2 font-bold shadow-lg"
            >
              {checkoutLoading ? (
                'Processing Order...'
              ) : (
                <>
                  <span>Place Direct Farm Order</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
              <ShieldCheck size={16} className="text-[#7c9b85]" />
              <span>Razorpay Secured & Verified Settlement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
