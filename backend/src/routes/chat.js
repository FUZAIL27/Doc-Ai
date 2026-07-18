const router = require('express').Router();
const ctrl = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', ctrl.createChat);
router.get('/', ctrl.getChats);
router.get('/:id', ctrl.getChat);
router.post('/:id/message', ctrl.sendMessage);
router.delete('/:id', ctrl.deleteChat);

module.exports = router;
