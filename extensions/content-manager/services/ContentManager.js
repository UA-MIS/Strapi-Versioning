'use strict';
require('dotenv').config({ path: require('find-config')('.env') })

const _ = require('lodash');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_KEYID,
  secretAccessKey: process.env.AWS_SAK
});

var s3 = new AWS.S3();

/**
 * A set of functions called "actions" for `ContentManager`
 */
module.exports = {
  fetchAll(params, query) {
    const { query: request, populate, ...filters } = query;

    const queryFilter = !_.isEmpty(request)
      ? {
          ...filters, // Filters is an object containing the limit/sort and start
          ...request,
        }
      : filters;

    return strapi.entityService.find(
      { params: queryFilter, populate },
      { model: params.model }
    );
  },

  async fetch(params, populate) {
    const { id, model } = params;

    var getParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: params.id + '.JSON',
      //VersionId: '8LmPm9ryal27CWDDU4pXV_KyKLFP9klP'
  }

    var dataReturned = await s3.getObject(getParams).promise();
    dataReturned = JSON.parse(dataReturned.Body.toString())
    console.log(dataReturned)
    return dataReturned;

    // return strapi.entityService.findOne(
    //   {
    //     params: {
    //       id,
    //     },
    //     populate,
    //   },
    //   { model }
    // );
  },

  count(params, query) {
    const { model } = params;
    const { ...filters } = query;

    return strapi.entityService.count({ params: filters }, { model });
  },

  async create(data, { files, model } = {}) {
    var bufferObject = new Buffer.from(JSON.stringify(data, {files, model}))
    var keyID;
    var dataCreated = await strapi.entityService.create({ data, files }, { model }).then(function(response){
      keyID = response.id
    });

    var awsParams = {
      Bucket: process.env.AWS_BUCKET,
      Body: bufferObject,
      Key: keyID + '.JSON'
    }
    s3.upload(awsParams, function (err, data2) {
      if (err) {
        console.log("Error", err);
      }

      if (data2) {
        console.log("Uploaded in:", data2.location);
      }
    })
    return keyID;
  },

  edit(params, data, { model, files } = {}) {
    var bufferObject = new Buffer.from(JSON.stringify(data, {files, model}))

    var awsParams = {
      Bucket: process.env.AWS_BUCKET,
      Body: bufferObject,
      Key: params.id + '.JSON'
    }
    s3.upload(awsParams, function (err, data2) {
      if (err) {
        console.log("Error", err);
      }

      if (data2) {
        console.log("Uploaded in:", data2.location);
      }
    })
    return strapi.entityService.update({ params, data, files }, { model });
  },

  delete(params) {
    const { id, model } = params;

    var getParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: params.id + '.JSON',
  }

    s3.deleteObject(getParams, function(err, data) {
      if (err) {
      console.log(err, err.stack)
      } else {
      console.log(data)
      }
    })

    return strapi.entityService.delete({ params: { id } }, { model });
  },

  deleteMany(params, query) {
    const { model } = params;

    const { primaryKey } = strapi.query(model);
    const filter = { [`${primaryKey}_in`]: Object.values(query), _limit: 100 };

    return strapi.entityService.delete({ params: filter }, { model });
  },

  search(params, query) {
    const { model } = params;

    return strapi.entityService.search({ params: query }, { model });
  },

  countSearch(params, query) {
    const { model } = params;
    const { _q } = query;

    return strapi.entityService.countSearch({ params: { _q } }, { model });
  },
};
