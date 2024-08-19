const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Retrieve the authorization header from the request
  const authHeader = req.headers['authorization'];

  // Check if the authorization header is missing
  if (!authHeader) {
    console.error('Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Extract the token from the authorization header
  const token = authHeader.split(' ')[1];
  
  // Check if the token is missing from the header
  if (!token) {
    console.error('Token missing from authorization header');
    return res.status(401).json({ message: 'Token missing from authorization header' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Handle token verification errors
    if (err) {
      console.error('Invalid token:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach the decoded user info to the request object
    req.user = { userId: decoded.userId };
    console.log('Authenticated user ID:', req.user.userId);

    // Call the next middleware or route handler
    next();
  });
};
