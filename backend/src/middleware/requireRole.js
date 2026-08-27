/**
 * Role-based access control middleware.
 * Usage: requireRole('farmer'), requireRole('admin'), requireRole('farmer', 'admin')
 *
 * Must be used AFTER the authenticate middleware.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
}

module.exports = requireRole;
