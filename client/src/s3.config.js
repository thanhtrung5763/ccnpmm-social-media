const dotenv = require("dotenv");
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
dotenv.config();


// aws.config.update({
//   credentials: creds,
//   region: 'ap-southeast-1',
// })

let s3 = new S3Client({
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  // signatureVersion: 'v4',
  s3ForcePathStyle: true,
})

// Multer S3 storage configuration
const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'social-network-cnpmm',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read', // Set ACL to public-read for public access
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Set the file name in the S3 bucket
      console.log(file);
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

module.exports = uploadS3;