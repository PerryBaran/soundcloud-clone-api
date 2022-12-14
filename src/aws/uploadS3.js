const AWS = require('aws-sdk');
const { uuid } = require('uuidv4');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccesKey: process.env.AWS_SECRET_KEY,
});

const myBucket = new AWS.S3();

const uploadFileToS3 = async (file) => {
  return new Promise((resolve, reject) => {
    const key = uuid();

    const params = {
      Body: file.buffer,
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${file.fieldname}/${key}`,
    };

    myBucket.putObject(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${process.env.AWS_BUCKET_URL}/${file.fieldName}/${key}`);
      }
    });
  });
};
