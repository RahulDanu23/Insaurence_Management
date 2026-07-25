const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // req.user is set by the authMiddleware before this runs
      if (!req.user || !req.user.role) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized: User role not found" 
        });
      }

      // Check if user's role is in the allowed roles array
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Forbidden: You do not have permission to access this route. Requires: ${allowedRoles.join(' or ')}` 
        });
      }

      next();
    } catch (error) {
      console.log("Role Middleware Error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error during role validation" 
      });
    }
  };
};

module.exports = roleMiddleware;
