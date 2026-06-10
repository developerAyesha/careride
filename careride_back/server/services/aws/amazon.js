const Config = require("../../config.js");
const logger = require('../../services/winston').logger;
const fs = require("fs");
const path = require("path");

const { SNSClient, PublishCommand }= require('@aws-sdk/client-sns');
const SNSCONFIG = Config.AMAZON_AWS.SNS;

const { S3Client, ListBucketsCommand, ListObjectsCommand, CreateBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
//const { getSignedUrl }  = require("@aws-sdk/s3-request-presigner");
const S3CONFIG = Config.AMAZON_AWS.S3;

const { MediaConvertClient, ListJobsCommand, CreateJobCommand, CancelJobCommand  } = require("@aws-sdk/client-mediaconvert");
const MEDIACONVERTCONFIG = Config.AMAZON_AWS.mediaconvert;


const s3Client = new S3Client({
	region: S3CONFIG.region,
	credentials: {
		accessKeyId: S3CONFIG.accessKeyId,
		secretAccessKey: S3CONFIG.secretAccessKey,
	}
});

module.exports.s3Client = s3Client;


module.exports.listBucket = async function() {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("Success", data.Buckets);
    return data;
  } catch (err) {
    console.log("Error listBucket", err);
    throw new Error(err.message);
  }
};
//  {Name: 'ibusx.video.public', CreationDate: 2022-05-15T18:10:54.000Z }


//{ Bucket: 'ibusx.video.public', Prefix: 'upload/' }
module.exports.listFiles = async function(params) {
  try {
    const data = await s3Client.send(new ListObjectsCommand(params));
    return data;
  } catch (err) {
    logger.error("Error listFiles", err);
    throw new Error(err.message);
  }
};

//bucketParams = { Bucket: "BUCKET_NAME", Key: "KEY" }
module.exports.deleteFile = async function(bucketParams) {
  try {
    const data = await s3Client.send(new DeleteObjectCommand(bucketParams));
    logger.info("Success. Object deleted.");
    return data; // For unit tests.
  } catch (err) {
    logger.error("Error deleteFile", err);
    throw new Error(err.message);
  }
}



// {Bucket: 'ibusx.video.public', Key: 'upload/70AEB41DC7B6.mp4', Body: fileStream }
module.exports.uploadToBucket = async function(uploadParams) {
  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    logger.info("Success uploadToBucket " + data.ETag);
    return data;
  } catch (err) {
    logger.error("Error uploadToBucket", err);
    throw new Error(err.message);
  }
};



async function signUrl(name) {
  try {
	const bucketParams = {Bucket: 'ibusx.video.public', Key: name}
    const command = new GetObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60*60 });// expires in seconds
    console.log(signedUrl);
  } catch (err) {
    console.log("Error creating presigned URL", err);
  }
};




const emcClient = new MediaConvertClient({
	region: MEDIACONVERTCONFIG.region,
	credentials: {
		accessKeyId: MEDIACONVERTCONFIG.accessKeyId,
		secretAccessKey: MEDIACONVERTCONFIG.secretAccessKey,
	},
	endpoint: MEDIACONVERTCONFIG.endpoint,
});
module.exports.emcClient = emcClient;


module.exports.emcListJobs = async function() {
	const params = {
		MaxResults: 3,
		Order: "DESCENDING",   //  ASCENDING, DESCENDING
		Queue: MEDIACONVERTCONFIG.queue,
		//Status: "ERROR" // e.g., "SUBMITTED", 'ERROR'
	};

	try {
		const data = await emcClient.send(new ListJobsCommand(params));
		//console.log("Success. Jobs: ", data.Jobs);
		return data.Jobs;
	} catch (err) {
		console.error("Error", err);
	}
}


module.exports.emcCancelJob = async function(id) {
	const params = {Id: id }
	try {
		const data = await emcClient.send(new CancelJobCommand(params));
		console.log(data);
	} catch (err) {
		console.error("Error", err);
	}
}


module.exports.emcCreateJob = async function(params) {
  params.Queue = MEDIACONVERTCONFIG.queue; //JOB_QUEUE_ARN
  params.Role = MEDIACONVERTCONFIG.role; //IAM_ROLE_ARN

  try {
    const data = await emcClient.send(new CreateJobCommand(params));
    return data;
  } catch (err) {
    logger.error("Error", err);
    throw new Error(err.message);
  }
};


