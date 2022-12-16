const AWS = require('aws-sdk');
const { v4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const myBucket = new AWS.S3();

const uploadFile = (file, userId) => {
  if (!userId) throw new Error('UserId undefined');

  return new Promise((resolve, reject) => {
    const key = `${userId}/${v4()}`;

    const params = {
      Body: file.buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    myBucket.putObject(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${process.env.AWS_BUCKET_URL}/${key}`);
      }
    });
  });
};

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath
    }

    myBucket.deleteObject(params, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(`${filePath} deleted`)
      }
    });
  });
}

module.exports = {
  uploadFile,
  deleteFile
};
