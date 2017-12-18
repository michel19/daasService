const composer = require('soajs.composer');

composer.deploy(`${__dirname}/config.js`, (error) => {
  console.log((error) || 'DAAS Service started ...');
});
