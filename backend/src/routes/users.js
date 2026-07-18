const router = require('express').Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

router.put('/profile', async (req, res) => {
  try {
    const { name, avatar, preferences, aiProvider, apiKeys } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, avatar, preferences, aiProvider, apiKeys } },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
