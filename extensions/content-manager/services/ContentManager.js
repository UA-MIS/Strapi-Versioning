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
    var modelName = model.split(".")
    var getParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: modelName[1] + '/' + params.id + '.JSON',
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

  async fetchVersions(params) {
    const { id, model } = params;
    let objectParams = {
      Bucket: process.env.AWS_BUCKET,
      Prefix: 'restaurants/28.JSON'
    }

    try{
      const previousVersion = await s3.listObjectVersions(params).promise().then( result => {
        const versions = result.Versions
        const versionList = []
        // console.log(versions)
        for (i=0;i<=versions.length; i++) {
          versionList.push(versions[i].VersionId)
          console.log(versions[i].VersionId)
          // console.log('hit')
        }
        console.log(versionList)
        return versionList;
      })
    } catch (err) {
      console.log(err);
      return;
    }
  },

  count(params, query) {
    const { model } = params;
    const { ...filters } = query;

    return strapi.entityService.count({ params: filters }, { model });
  },

  async create(data, { files, model } = {}) {
    var bufferObject = new Buffer.from(JSON.stringify(data, {files, model}))
    var keyID;
    var modelName = model.split(".")
    var dataCreated = await strapi.entityService.create({ data, files }, { model }).then(function(response){
      keyID = response.id
    });

    var awsParams = {
      Bucket: process.env.AWS_BUCKET,
      Body: bufferObject,
      Key: modelName[1] + '/' + keyID + '.JSON'
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
    var modelName = model.split(".")

    var awsParams = {
      Bucket: process.env.AWS_BUCKET,
      Body: bufferObject,
      Key: modelName[1] + '/' + params.id + '.JSON'
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
    var modelName = model.split(".")
    var getParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: modelName[1] + '/' + params.id + '.JSON',
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
    var modelName = model.split(".")

    for (var id in query){
      var getParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: modelName[1] + '/' + query[id] + '.JSON',
      }
      console.log(id)
      s3.deleteObject(getParams, function(err, data) {
        if (err) {
        console.log(err, err.stack)
        } else {
        console.log(data)
        }
      })
    }

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
