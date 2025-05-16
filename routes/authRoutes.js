const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../middlewares/validators/authValidator');
const { validationResult } = require('express-validator');
const authenticateToken = require('../middlewares/authMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;