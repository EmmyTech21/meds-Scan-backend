const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
 
  const authHeader = req.headers['authorization'];

  
  if (!authHeader) {
    console.error('Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  
  const token = authHeader.split(' ')[1];
  
  
  if (!token) {
    console.error('Token missing from authorization header');
    return res.status(401).json({ message: 'Token missing from authorization header' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
   
    if (err) {
      console.error('Invalid token:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    
    req.user = { userId: decoded.userId };
    console.log('Authenticated user ID:', req.user.userId);

    
    next();
  });
};
