import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import {
  Sprout, ShoppingBag, Bot, ArrowRight, TrendingUp,
  ShieldCheck, Truck, Sparkles, Check, Search, Filter,
  MapPin, UserCheck
} from 'lucide-react';
import './Home.css';

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Fresh Organic Tomatoes',
    category: 'vegetables',
    farmer_name: 'Rajesh Patil',
    location: 'Nashik, Maharashtra',
    price: 35,
    unit: 'kg',
    stock: 150,
    is_organic: true,
    description: 'Farm-fresh farm-ripened red tomatoes picked this morning with zero chemical residues.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-2',
    title: 'Premium Sharbati Wheat',
    category: 'grains',
    farmer_name: 'Suresh Verma',
    location: 'Sehore, Madhya Pradesh',
    price: 48,
    unit: 'kg',
    stock: 500,
    is_organic: true,
    description: 'Golden grain Sharbati wheat naturally sun-dried, highly nutritious with rich natural luster.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-3',
    title: 'Ratnagiri Alphonso Mangoes (Hapus)',
    category: 'fruits',
    farmer_name: 'Ganesh Sawant',
    location: 'Ratnagiri, Maharashtra',
    price: 650,
    unit: 'dozen',
    stock: 45,
    is_organic: true,
    description: 'GI-tagged authentic GI Alphonso mangoes, naturally ripened in hay with irresistible aroma.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-4',
    title: 'Nashik Red Onions (Export Grade)',
    category: 'vegetables',
    farmer_name: 'Anil Kadam',
    location: 'Lasalgaon, Maharashtra',
    price: 26,
    unit: 'kg',
    stock: 800,
    is_organic: false,
    description: 'Crisp, pungent red onions harvested directly from Lasalgaon heartland.',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-5',
    title: 'Pure A2 Gir Cow Desi Ghee',
    category: 'dairy',
    farmer_name: 'Bhikhu Bhai',
    location: 'Junagadh, Gujarat',
    price: 1450,
    unit: 'liter',
    stock: 20,
    is_organic: true,
    description: 'Bilona method churned pure A2 ghee made from grass-fed Gir cows.',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-6',
    title: 'Organic Lakadong High-Curcumin Turmeric',
    category: 'spices',
    farmer_name: 'Daphne Lyngdoh',
    location: 'Jaintia Hills, Meghalaya',
    price: 320,
    unit: '500g',
    stock: 80,
    is_organic: true,
    description: '7.5%+ natural Curcumin content Lakadong turmeric powder with immense medicinal value.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-7',
    title: 'Traditional Basmati 1121 Rice',
    category: 'grains',
    farmer_name: 'Harpreet Singh',
    location: 'Karnal, Haryana',
    price: 110,
    unit: 'kg',
    stock: 350,
    is_organic: false,
    description: 'Extra long grain aged Basmati with aromatic fragrance, non-sticky cooking.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-8',
    title: 'Organic Cold-Pressed Mustard Oil',
    category: 'spices',
    farmer_name: 'Rameshwar Lal',
    location: 'Bharatpur, Rajasthan',
    price: 195,
    unit: 'liter',
    stock: 60,
    is_organic: true,
    description: 'Kachi Ghani traditional wooden press mustard oil, pungent and rich in Omega-3.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Crops' },
  { id: 'vegetables', label: '🥬 Vegetables' },
  { id: 'fruits', label: '🥭 Fruits' },
  { id: 'grains', label: '🌾 Grains' },
  { id: 'spices', label: '🌶️ Spices' },
  { id: 'dairy', label: '🥛 Dairy' },
  { id: 'organic', label: '🌿 100% Organic' },
];

const MANDI_DATA = [
  { crop: 'Wheat (Sharbati)', price: '₹2,450/qtl', mandi: 'Indore, MP' },
  { crop: 'Onion (Red)', price: '₹1,400/qtl', mandi: 'Lasalgaon, MH' },
  { crop: 'Tomato (Hybrid)', price: '₹1,800/qtl', mandi: 'Vashi, MH' },
  { crop: 'Basmati Rice', price: '₹4,100/qtl', mandi: 'Azadpur, DL' },
  { crop: 'Soybean', price: '₹4,600/qtl', mandi: 'Ujjain, MP' },
  { crop: 'Cotton (Medium)', price: '₹6,800/qtl', mandi: 'Rajkot, GJ' },
  { crop: 'Turmeric (Finger)', price: '₹12,400/qtl', mandi: 'Erode, TN' },
];

export default function Home() {
  const { profile } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [addedItem, setAddedItem] = useState(null);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'organic'
        ? item.is_organic
        : item.category === selectedCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="home-container">
      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <Sparkles size={14} className="text-[#efd9a8]" />
            <span>Direct From 12,000+ Verified Indian Farmers</span>
          </div>

          <h1 className="home-hero-title">
            Fresh Produce at <span>Zero Middleman</span> Prices.
          </h1>

          <p className="home-hero-desc">
            Connect directly with verified cultivators. Buy harvest-fresh grains, vegetables, and organic superfoods with full traceability.
          </p>

          <div className="home-hero-actions">
            <Link to="/products" className="btn-hero-primary">
              <ShoppingBag size={18} />
              <span>Explore Marketplace</span>
            </Link>

            <Link to="/ai" className="btn-hero-secondary">
              <Bot size={18} className="text-[#c4d9c8]" />
              <span>Ask AI Farm Advisor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Mandi Live Ticker ────────────────────────── */}
      <div className="mandi-ticker">
        <div className="mandi-ticker-label">
          <TrendingUp size={16} className="text-[#7c9b85]" />
          <span>Live Mandi Ticker</span>
        </div>
        <div className="mandi-ticker-scroll">
          {MANDI_DATA.map((item, idx) => (
            <div key={idx} className="mandi-ticker-item">
              <span className="mandi-ticker-crop">{item.crop}</span>
              <span className="mandi-ticker-price">{item.price}</span>
              <span className="mandi-ticker-loc">({item.mandi})</span>
              {idx < MANDI_DATA.length - 1 && <span className="text-gray-300">•</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search & Category Filter ────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="category-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input w-full pl-10 text-sm"
            placeholder="Search crop, farmer, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ─── Product Catalog Grid ────────────────────── */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img
                src={product.image}
                alt={product.title}
                className="product-image"
                loading="lazy"
              />
              <div className="product-badge-row">
                <span className="product-badge-category">{product.category}</span>
                {product.is_organic && (
                  <span className="product-badge-organic">🌿 Organic</span>
                )}
              </div>
            </div>

            <div className="product-content">
              <div className="product-farmer">
                <MapPin size={12} />
                <span>{product.farmer_name} • {product.location}</span>
              </div>

              <h3 className="product-title">{product.title}</h3>
              <p className="product-desc">{product.description}</p>

              <div className="product-footer">
                <div className="product-price-box">
                  <span className="product-price">₹{product.price}</span>
                  <span className="product-unit">per {product.unit}</span>
                </div>

                <button
                  className={`btn-add-cart ${addedItem === product.id ? 'added' : ''}`}
                  onClick={() => handleAddToCart(product)}
                >
                  {addedItem === product.id ? (
                    <>
                      <Check size={16} />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Why AgroLink Value Props ─────────────────── */}
      <section className="home-features">
        <div className="feature-card">
          <div className="feature-icon-box">
            <UserCheck size={24} />
          </div>
          <div>
            <h4 className="feature-title">100% Direct From Farmers</h4>
            <p className="feature-desc">
              Every listing connects you directly to the field producer. Zero intermediary commission.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="feature-title">Quality & Harvest Verified</h4>
            <p className="feature-desc">
              Rigorous moisture, grading, and organic origin verification before produce leaves the mandi.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="feature-title">Fast Agro-Logistics</h4>
            <p className="feature-desc">
              Dedicated cold-chain and express rural fleet delivering freshness within 24 to 48 hours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
