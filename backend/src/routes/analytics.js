const router = require('express').Router();
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');
const Chat = require('../models/Chat');

router.use(protect);

router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [totalDocs, totalChats, recentDocs, recentChats, docsByType, uploadsByDay] = await Promise.all([
      Document.countDocuments({ user: userId }),
      Chat.countDocuments({ user: userId }),
      Document.countDocuments({ user: userId, createdAt: { $gte: sevenDaysAgo } }),
      Chat.countDocuments({ user: userId, createdAt: { $gte: sevenDaysAgo } }),
      Document.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$fileType', count: { $sum: 1 } } }
      ]),
      Document.aggregate([
        { $match: { user: userId, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const recentDocsList = await Document.find({ user: userId })
      .select('title fileType createdAt wordCount tags')
      .sort('-createdAt')
      .limit(5);

    const recentChatsList = await Chat.find({ user: userId })
      .populate('documents', 'title')
      .select('title updatedAt documents')
      .sort('-updatedAt')
      .limit(5);

    res.json({
      stats: { totalDocs, totalChats, recentDocs, recentChats, totalTokensUsed: req.user.stats.totalTokensUsed },
      docsByType,
      uploadsByDay,
      recentDocuments: recentDocsList,
      recentChats: recentChatsList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
