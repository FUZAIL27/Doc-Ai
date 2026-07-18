const router = require('express').Router();
const ctrl = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/upload', ctrl.upload.single('file'), ctrl.uploadDocument);
router.get('/', ctrl.getDocuments);
router.get('/:id', ctrl.getDocument);
router.put('/:id', ctrl.updateDocument);
router.delete('/:id', ctrl.deleteDocument);
router.post('/:id/analyze', ctrl.analyzeDocument);

module.exports = router;
