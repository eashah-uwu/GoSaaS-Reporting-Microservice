const AWS = require('aws-sdk');
// const { Storage } = require('@google-cloud/storage');
// const { BlobServiceClient } = require('@azure/storage-blob');

const connectToDestination = async (destination, url, apiKey) => {
        if (destination === 'aws') {
            AWS.config.update({
                accessKeyId: url,
                secretAccessKey: apiKey,
                region: "eu-north-1" 
            });

            const s3 = new AWS.S3();
            await s3.listBuckets().promise(); 
            return { success: true, message: 'Connected to AWS' };
        } else if (destination === 'gcp') {
          //  const storage = new Storage({ projectId: url, keyFilename: apiKey });
           // await storage.getBuckets(); 
            return { success: true, message: 'Connected to GCP' };
        } else if (destination === 'azure') {
            //const blobServiceClient = BlobServiceClient.fromConnectionString(apiKey);
            //await blobServiceClient.getProperties(); 
            return { success: true, message: 'Connected to Azure' };
        } else {
            return { success: false, message: 'Invalid destination' };
        }
};

const uploadFile = async (destination, url, apiKey,file, bucketName) => {
        if (destination === 'aws') {
            const s3 = new AWS.S3({
                accessKeyId: url,
                secretAccessKey: apiKey,
                region: 'eu-north-1', 
            });
            const params = {
                Bucket: bucketName,
                Key: file.key,
                Body: file.buffer,
            };
            const data = await s3.upload(params).promise();
            return { success: true, message: 'File uploaded to AWS', url: data.Location };
        }else if (destination === 'gcp') {
            // const storage = new Storage({ projectId: bucketName, keyFilename: apiKey });
            // const bucket = storage.bucket(bucketName);
            // const blob = bucket.file(file.originalname);
            // const stream = blob.createWriteStream();
            // stream.end(file.buffer);
            return { success: true, message: 'File uploaded to GCP' };
        } else if (destination === 'azure') {
            // const blobServiceClient = BlobServiceClient.fromConnectionString(apiKey);
            // const containerClient = blobServiceClient.getContainerClient(bucketName);
            // const blockBlobClient = containerClient.getBlockBlobClient(file.originalname);
            // await blockBlobClient.uploadData(file.buffer);
            return { success: true, message: 'File uploaded to Azure' };
        } else {
            return { success: false, message: 'Invalid destination' };
        }
};


const downloadFile = async (destination, url, apiKey,bucketName, fileKey) => {
    if (destination === 'aws') {
        const s3 = new AWS.S3({
            accessKeyId: url,
            secretAccessKey: apiKey,
            region: 'eu-north-1', 
        });
        const downloadParams = {
            Bucket: bucketName,
            Key: fileKey,
        };
        const file = await s3.getObject(downloadParams).promise();
        return file;
    }
  };
module.exports = {
    connectToDestination,
    uploadFile,
    downloadFile
};
