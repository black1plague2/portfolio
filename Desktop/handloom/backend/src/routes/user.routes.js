const router = require('express').Router();
const { getProfile, updateProfile, submitKyc, changePassword } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload } = require('../config/s3');

router.use(protect);
router.get('/profile', getProfile);
router.patch('/profile', upload.single('avatar'), updateProfile);
router.post('/kyc', (req, res, next) => { req.uploadFolder = 'kyc'; next(); }, upload.array('documents', 5), submitKyc);
router.patch('/change-password', changePassword);

module.exports = router;
