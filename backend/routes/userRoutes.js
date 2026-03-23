const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  toggleWishlist,
  getUserStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/', protect, authorize('admin'), getUsers);
router
  .route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .delete(protect, authorize('admin'), deleteUser);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
