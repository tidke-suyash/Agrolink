import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard — wraps routes to enforce authentication and role requirements.
 * Usage: <RoleGuard roles={['farmer']}><FarmerDashboard /></RoleGuard> or as layout <RoleGuard />
 */
export default function RoleGuard({ children, roles = [] }) {
  const { isAuthenticated, role, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (roles.length > 0 && !roles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      farmer: '/farmer/dashboard',
      customer: '/',
      admin: '/admin',
    };
    return <Navigate to={dashboardMap[role] || '/'} replace />;
  }

  return children ? children : <Outlet />;
}
