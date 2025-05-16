const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../middlewares/validators/authValidator');
const { validationResult } = require('express-validator');
const cache = require('../middlewares/cache');
const authenticateToken = require('../middlewares/authMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', registerValidator, validate, authController.register); // pas de cache ici
router.post('/login', loginValidator, validate, authController.login); // pas de cache ici
router.get('/me', authenticateToken, cache, authController.getMe); // cache ici sur GET

module.exports = router;