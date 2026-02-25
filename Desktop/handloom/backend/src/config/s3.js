const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images (jpeg, jpg, png, webp) and PDFs are allowed'));
};

const hasRealAwsKeys =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key' &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key';

let storage;
if (hasRealAwsKeys) {
  storage = multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => {
      const folder = req.uploadFolder || 'general';
      const filename = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, filename);
    },
  });
} else {
  // Dev fallback: save to local uploads/ directory
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const folder = req.uploadFolder || 'general';
      cb(null, `${folder}-${uuidv4()}${path.extname(file.originalname)}`);
    },
  });
  if (process.env.NODE_ENV !== 'test') {
    console.log('⚠️  AWS keys not configured — using local disk storage for uploads');
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { s3, upload };
