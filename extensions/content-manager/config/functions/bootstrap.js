'use strict';

const _ = require('lodash');
const storeUtils = require('../../services/utils/store');
const {
  createDefaultConfiguration,
  syncConfiguration,
} = require('../../services/utils/configuration');

const contentTypeService = require('../../services/ContentTypes');
const componentService = require('../../services/Components');

/**
 * Synchronize content manager schemas
 */
module.exports = () => {
  return syncSchemas();
};

async function syncSchemas() {
  await syncContentTypesSchemas();
  await syncComponentsSchemas();
}

/**
 * Sync content types schemas
 */
async function syncContentTypesSchemas() {
  const configurations = await storeUtils.findByKey(
    'plugin_content_manager_configuration_content_types'
  );

  await updateContentTypes(configurations);
}

async function updateContentTypes(configurations) {
  const updateConfiguration = async uid => {
    const conf = configurations.find(conf => conf.uid === uid);

    return contentTypeService.setConfiguration(
      uid,
      await syncConfiguration(conf, strapi.contentTypes[uid])
    );
  };

  const generateNewConfiguration = async uid => {
    return contentTypeService.setConfiguration(
      uid,
      await createDefaultConfiguration(strapi.contentTypes[uid])
    );
  };

  const currentUIDS = Object.keys(strapi.contentTypes);
  const DBUIDs = configurations.map(({ uid }) => uid);

  const contentTypesToUpdate = _.intersection(currentUIDS, DBUIDs);
  const contentTypesToAdd = _.difference(currentUIDS, DBUIDs);
  const contentTypesToDelete = _.difference(DBUIDs, currentUIDS);

  // delette old schemas
  await Promise.all(
    contentTypesToDelete.map(uid => contentTypeService.deleteConfiguration(uid))
  );

  // create new schemas
  await Promise.all(
    contentTypesToAdd.map(uid => generateNewConfiguration(uid))
  );

  // update current schemas
  await Promise.all(contentTypesToUpdate.map(uid => updateConfiguration(uid)));
}

/**
 * sync components schemas
 */
async function syncComponentsSchemas() {
  const updateConfiguration = async uid => {
    const conf = configurations.find(conf => conf.uid === uid);

    return componentService.setConfiguration(
      uid,
      await syncConfiguration(conf, strapi.components[uid])
    );
  };

  const generateNewConfiguration = async uid => {
    return componentService.setConfiguration(
      uid,
      await createDefaultConfiguration(strapi.components[uid])
    );
  };

  const configurations = await storeUtils.findByKey(
    'plugin_content_manager_configuration_components'
  );

  const realUIDs = Object.keys(strapi.components);
  const DBUIDs = configurations.map(({ uid }) => uid);
  const componentsToUpdate = _.intersection(realUIDs, DBUIDs);
  const componentsToAdd = _.difference(realUIDs, DBUIDs);
  const componentsToDelete = _.difference(DBUIDs, realUIDs);

  // delette old schemas
  await Promise.all(
    componentsToDelete.map(uid => componentService.deleteConfiguration(uid))
  );

  // create new schemas
  await Promise.all(componentsToAdd.map(uid => generateNewConfiguration(uid)));

  // update current schemas
  await Promise.all(componentsToUpdate.map(uid => updateConfiguration(uid)));
}
