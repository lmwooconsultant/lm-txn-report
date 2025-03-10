const admin = require('../../config/firebaseConfig');

const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user data to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token', error });
  }
};

const isAuthenticated = (req, res, next) => {


  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }
  next();
};

module.exports = {
  verifyFirebaseToken,
  isAuthenticated
};
