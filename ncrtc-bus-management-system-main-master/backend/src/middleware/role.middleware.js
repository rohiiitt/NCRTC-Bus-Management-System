// src/middleware/role.middleware.js
// Two middleware helpers:
//   allowRoles('admin', 'depot_manager') — checks specific roles
//   sameDepotOnly — depot managers/drivers only see their depot

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required: ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
}

function sameDepotOnly(req, res, next) {
  const role = req.user.role;
  // These roles see ALL depots
  if (role === 'admin' || role === 'control_operator' || role === 'executive') {
    req.depotFilter = null;
  } else {
    // depot_manager and driver only see their depot
    req.depotFilter = req.user.depotId;
  }
  next();
}

module.exports = { allowRoles, sameDepotOnly };
