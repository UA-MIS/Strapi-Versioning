## Strapi AWS S3 Object Versioning


#### General Overview
Strapi AWS S3 Object Versioning is a plugin for Strapi, an open-source, node.JS, headless content management system.  This allows Strapi users to navigate between the different versions of objects in the system. This versioning functionality is implemented via a drop down menu and a “save” button located on the EditView page for the respective object in Strapi. 

The dropdown menu and buttons communicate with an Amazon Web Services Simple Storage Service (S3) bucket that collects and stores all versions of the object. This new functionality will allow users to roll back to previous versions of the object, and the version selected can be edited, saved, or deleted.  Prior to this plugin, users had to simply replace the current object by uploading the earlier version of the object.  The ability to simply select an earlier version within the UI will result in easier, more accurate, and quicker object rollbacks.


### Key Changes 
 When the user accesses Strapi and selects a model and one specific item, this action fires off a Fetch request that now goes to an AWS S3 bucket and gets the most recent version of the key instead of going to the database in use by the user.
- DATABASE:  The user may use Strapi’s own, SQLite Database, their own MySQL, or another database. 
- The key is what the AWS S3 bucket recognizes as the name of the object. The key is determined by model and associated ID.


### Configuring the .ENV File 

The .env file must include the following information:

DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_HOST=
DATABASE_PORT= 
DATABASE_PASSWORD=
AWS_KEYID=
AWS_SAK=
AWS_BUCKET= 

- The .ENV File must be formatted as a DotENV extension. 


###Versions of Tech Stack: 
- Node.js version: 12.16.1
- NPM version: 6.13.4
- Strapi version: 3.0.0-beta.19.5
- Database: MySQL 5.7.12
- Visual Studio Code version: 1.43.2


#### Files/Folders Edited
Content Manager Plugin
EditView File
Content Manager Service



