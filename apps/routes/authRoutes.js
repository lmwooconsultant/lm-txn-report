const express = require('express');
const {verifyFirebaseToken} = require('../middleware/authMiddleware');
const { loginUser } = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginUser); // Login endpoint

// Protected route example
router.get('/profile', verifyFirebaseToken, (req, res) => {
  res.json({ message: 'User authenticated', user: req.user });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
      res.clearCookie("sessionToken");
      res.redirect("/login");
  });
});

module.exports = router;
