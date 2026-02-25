const router = require('express').Router();
const { createRequest, getMyRequests, getRequest, acceptQuote } = require('../controllers/designer.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { upload } = require('../config/s3');

router.use(protect, restrictTo('designer', 'admin'));
router.post('/requests', (req, res, next) => { req.uploadFolder = 'designs'; next(); }, upload.array('designFiles', 5), createRequest);
router.get('/requests', getMyRequests);
router.get('/requests/:id', getRequest);
router.patch('/requests/:id/accept-quote', acceptQuote);

module.exports = router;
