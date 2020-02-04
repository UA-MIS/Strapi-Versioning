const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

//configuring the AWS environment
AWS.config.update({
    accessKeyId: "AKIA6QUP5IHOBU7I5TS2",
    secretAccessKey: "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"
  });

var s3 = new AWS.S3();
var filePath = "./data/file.txt";

//configuring parameters
var params = {
  Bucket: 'strapi.capstone.versioning',
  Body : fs.createReadStream(filePath),
  Key : "folder/"+path.basename(filePath)
};

s3.upload(params, function (err, data) {
  //handle error
  if (err) {
    console.log("Error", err);
  }

  //success
  if (data) {
    console.log("Uploaded in:", data.Location);
  }
});