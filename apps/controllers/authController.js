const admin = require('../../config/firebaseConfig');

const loginUser = async (req, res) => {
  const { idToken } = req.body; // Firebase ID Token from frontend

  if (!idToken) {
    return res.status(400).json({ error: 'Missing ID token' });
  }

  try {
    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Create a custom session token (optional)
    const sessionToken = await admin.auth().createSessionCookie(idToken, { expiresIn: 60 * 60 * 24 * 5 * 1000 }); // 5 days

    req.session.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      sessionToken
  };
    res.json({
      message: 'Login successful',
      sessionToken,
      user: decodedToken, // Contains user details
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid ID token', details: error.message });
  }
};

module.exports = { loginUser };
