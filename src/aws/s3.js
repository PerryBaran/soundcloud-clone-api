const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const myBucket = new AWS.S3();

const Bucket = process.env.AWS_BUCKET_NAME;

exports.uploadFile = (file, directory) => {
  if (!directory) throw new Error('filepath undefined');

  return new Promise((resolve, reject) => {
    const filepath = `${directory}/${uuid()}`;

    const params = {
      Body: file.buffer,
      Bucket,
      Key: filepath,
    };

    myBucket.putObject(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${process.env.AWS_BUCKET_URL}/${filepath}`);
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
      return { Key };
    });

    const deleteParms = {
      Bucket,
      Delete: { Objects },
    };

    await myBucket.deleteObjects(deleteParms).promise();
  } catch (err) {
    throw new Error(err);
  }
};
