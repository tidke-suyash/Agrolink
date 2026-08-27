import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Home, Package, ShoppingCart, BarChart3, Cloud,
  Bot, Settings, LogOut, Menu, X, User, ChevronRight,
  Sprout, ShoppingBag, LayoutDashboard, ClipboardList,
  Plus, Shield, Sparkles, Zap, ShieldAlert
} from 'lucide-react';
import './Layout.css';

const customerNav = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/products', icon: ShoppingBag, label: 'Products' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart' },
  { path: '/orders', icon: ClipboardList, label: 'My Orders' },
  { path: '/complaints', icon: Zap, label: 'Power & Grievances' },
  { path: '/weather', icon: Cloud, label: 'Weather' },
  { path: '/market', icon: BarChart3, label: 'Market Prices' },
  { path: '/ai', icon: Bot, label: 'AI Assistant' },
  { path: '/profile', icon: User, label: 'My Profile' },
];

const farmerNav = [
  { path: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/complaints', icon: Zap, label: 'Power & Grievances' },
  { path: '/farmer/products', icon: Package, label: 'My Products' },
  { path: '/farmer/products/new', icon: Plus, label: 'Add Product' },
  { path: '/farmer/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/weather', icon: Cloud, label: 'Weather' },
  { path: '/market', icon: BarChart3, label: 'Market Prices' },
  { path: '/ai', icon: Bot, label: 'AI Assistant' },
  { path: '/profile', icon: User, label: 'My Profile' },
];

const adminNav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/complaints', icon: Zap, label: 'Grievance Console' },
  { path: '/admin/users', icon: User, label: 'Users' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/market', icon: BarChart3, label: 'Market Prices' },
  { path: '/profile', icon: User, label: 'My Profile' },
];

export default function Layout({ children }) {
  const { profile, role, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'admin' ? adminNav : role === 'farmer' ? farmerNav : customerNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const roleBadgeClass = role === 'admin' ? 'badge-error' : role === 'farmer' ? 'badge-primary' : 'badge-amber';

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header glass">
        <div className="header-left">
          <button
            className="btn-icon menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            id="menu-toggle"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="logo" onClick={() => navigate('/')}>
            <Sprout size={28} className="logo-icon" />
            <span className="logo-text">AgroLink</span>
          </div>
        </div>

        <div className="header-right">
          <NavLink to="/cart" className="relative p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition mr-1">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7c9b85] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                {totalItems}
              </span>
            )}
          </NavLink>

          <span className={`badge ${roleBadgeClass}`}>
            {role === 'admin' ? <Shield size={12} /> : role === 'farmer' ? <Sprout size={12} /> : <ShoppingBag size={12} />}
            {role || 'customer'}
          </span>
          <div 
            className="header-avatar cursor-pointer hover:ring-2 hover:ring-[var(--color-primary)] transition" 
            id="user-avatar"
            onClick={() => navigate('/profile')}
            title="View Profile"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} />
            ) : (
              <User size={18} />
            )}
          </div>
          <span 
            className="header-name hide-mobile cursor-pointer hover:text-[var(--color-primary)] transition"
            onClick={() => navigate('/profile')}
          >
            {profile?.name || profile?.email?.split('@')[0] || 'User'}
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`layout-sidebar glass ${sidebarOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/' || item.path === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.path === '/cart' && totalItems > 0 && (
                <span className="ml-auto mr-2 bg-[#7c9b85] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
              {item.path === '/complaints' && (
                <span className="ml-auto mr-1 bg-amber-500/20 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Zap size={10} className="text-amber-600" /> 24x7
                </span>
              )}
              {item.path === '/admin/complaints' && (
                <span className="ml-auto mr-1 bg-red-500/20 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <ShieldAlert size={10} className="text-red-600" /> Admin
                </span>
              )}
              {item.path === '/ai' && (
                <span className="ml-auto mr-1 bg-[#e8c787]/20 text-[#8a6423] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Sparkles size={10} /> AI
                </span>
              )}
              <ChevronRight size={14} className="sidebar-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleSignOut} id="sign-out-btn">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="layout-main">
        <div className="main-content">
          {children}
        </div>
      </main>
    </div>
  );
}
