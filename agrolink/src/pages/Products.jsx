import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Search, Filter, ShoppingBag, Check, MapPin, SlidersHorizontal } from 'lucide-react';
import './Home.css';

const ALL_PRODUCTS = [
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

export default function Products() {
  const { addToCart } = useCart();
  const [products] = useState(ALL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [addedId, setAddedId] = useState(null);

  const handleAdd = (item) => {
    addToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filtered = products
    .filter((p) => {
      const matchCat = selectedCategory === 'all' ? true : p.category === selectedCategory;
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.farmer_name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Marketplace Catalog</h1>
          <p className="text-sm text-gray-500">Explore authentic crops sourced directly from verified farmer clusters.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search produce..."
              className="input w-full pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-bar">
        {['all', 'vegetables', 'fruits', 'grains', 'spices', 'dairy'].map((cat) => (
          <button
            key={cat}
            className={`category-pill capitalize ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="product-grid">
        {filtered.map((product) => (
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
                  className={`btn-add-cart ${addedId === product.id ? 'added' : ''}`}
                  onClick={() => handleAdd(product)}
                >
                  {addedId === product.id ? (
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
    </div>
  );
}
