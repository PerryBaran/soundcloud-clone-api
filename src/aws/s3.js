const AWS = require('aws-sdk');
const { v4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const myBucket = new AWS.S3();

const Bucket = process.env.AWS_BUCKET_NAME

exports.uploadFile = (file, userId) => {
  if (!userId) throw new Error('UserId undefined');

  return new Promise((resolve, reject) => {
    const key = `${userId}/${v4()}`;

    const params = {
      Body: file.buffer,
      Bucket,
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

exports.deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket,
      Key: filePath,
    };

    myBucket.deleteObject(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${filePath} deleted`);
      }
    });
  });
};

exports.deleteDirectory = async (directory) => {
  try {
    const listParams = {
      Bucket,
      Prefix: directory,
    };

    const { Contents } = await myBucket.listObjectsV2(listParams).promise();
    if (Contents.length === 0) return;

    const Objects = Contents.map(({ Key }) => {
      return { Key }
    });

    console.log(Objects)
  
    const deleteParms = {
      Bucket,
      Delete: { Objects }
    };
    
    await myBucket.deleteObjects(deleteParms).promise();
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};