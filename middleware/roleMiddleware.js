// Middleware to check if the user has the required role
const roleMiddleware = (roles) => {
    return (req, res, next) => {
      const userRole = req.user.role; // Use decoded role from `authMiddleware`
      console.log('Role validation:', userRole); // Debug log
  
      if (!roles.includes(userRole)) {
        console.error(`Access denied. User role "${userRole}" is not in allowed roles: ${roles}`);
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }
  
      next();
    };
  };
  
  module.exports = roleMiddleware;
  