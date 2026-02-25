const router = require('express').Router();
const { sendMessage, getMessages } = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../config/s3');

router.use(protect);
router.post('/', (req, res, next) => { req.uploadFolder = 'messages'; next(); }, upload.array('attachments', 3), sendMessage);
router.get('/:orderId', getMessages);

module.exports = router;
