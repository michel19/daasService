const collectionName = 'gcs';
const helper = require('./helper.js');

const updateMw = {
  s1(req, res) {
    const opts = {};
    req.soajs.model.objectId(req.soajs, req.soajs.inputmaskData.id, (error, id) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 801,
          error,
        });
      }

      req.soajs.inputmaskData.id = id;

      if (req.soajs.inputmaskData.config.searchable) {
        // mapping has to be filled
        if (!req.soajs.inputmaskData.config.soajsES || !req.soajs.inputmaskData.config.soajsES.mapping || Object.keys(req.soajs.inputmaskData.config.soajsES.mapping).length === 0) {
          return res.soajs.returnAPIResponse(req, res, {
            code: 805,
            error: req.soajs.config.errors[805],
          });
        }
      }

      // loop through req.soajs.inputmaskData.config and transform "req" to "required"
      helper.mapPostedConfig(req.soajs.inputmaskData.config);
      opts.collection = collectionName;
      opts.condition = { _id: req.soajs.inputmaskData.id };
      req.soajs.model.findEntry(req.soajs, opts, (error, oldServiceConfig) => {
        if (error) {
          return res.soajs.returnAPIResponse(req, res, {
            code: 400,
            error,
          });
        }

        if (!oldServiceConfig) {
          return res.soajs.returnAPIResponse(req, res, {
            code: 800,
            error: req.soajs.config[802],
          });
        }

        // check if the IMFV configuration have changed
        const oldIMFV = oldServiceConfig.genericService.config.schema.commonFields;
        const newIMFV = req.soajs.inputmaskData.config.genericService.config.schema.commonFields;
        let newVersion = helper.compareIMFV(oldIMFV, newIMFV);
        let gcV = oldServiceConfig.v;

        if (!newVersion) {
          if (oldServiceConfig.soajsES && oldServiceConfig.soajsES.mapping && req.soajs.inputmaskData.config.soajsES) {
            // check if the inputs mapping has changed
            newVersion = helper.compareMapping(oldServiceConfig.soajsES.mapping, req.soajs.inputmaskData.config.soajsES.mapping);
          }

          if (!newVersion) {
            // check if apis inputs have changed
            const oldAPIFields = oldServiceConfig.genericService.config.schema;
            const newAPIFields = req.soajs.inputmaskData.config.genericService.config.schema;

            newVersion = helper.compareAPISFields(oldAPIFields, newAPIFields);
            if (!newVersion) {
              // check if apis workflow have changed
              const oldAPIWF = oldServiceConfig.soajsService.apis;
              const newAPIWF = req.soajs.inputmaskData.config.soajsService.apis;
              newVersion = helper.compareAPIs(oldAPIWF, newAPIWF);
              if (!newVersion) {
                // check if ui is different
                const oldAPIUI = oldServiceConfig.soajsUI;
                const newAPIUI = req.soajs.inputmaskData.config.soajsUI;
                newVersion = helper.compareUI(oldAPIUI, newAPIUI);
              }
            }
          }
        }

        if (newVersion) {
          gcV++;
        }

        helper.checkIfGCisAService(req.soajs.config, {
          $and: [
            {
              $or: [
                { port: req.soajs.inputmaskData.config.genericService.config.servicePort },
                { name: req.soajs.inputmaskData.config.genericService.config.serviceName },
              ],
            },
            {
              gcId: { $ne: req.soajs.inputmaskData.id.toString() },
            },
          ],
        }, oldServiceConfig, gcV, req, (error) => {
          if (error) {
            return res.soajs.returnAPIResponse(req, res, {
              code: 400,
              error,
            });
          }

          const opts = {};
          opts.collection = collectionName;
          opts.condition = { _id: req.soajs.inputmaskData.id };

          if (req.soajs.inputmaskData.config.inputs.indexed) {
            delete req.soajs.inputmaskData.config.inputs.indexed;
          }

          opts.updatedFields = {
            $set: {
              parents: req.soajs.inputmaskData.config.parents,
              searchable: req.soajs.inputmaskData.config.searchable,
              language: req.soajs.inputmaskData.config.language,
              inputs: req.soajs.inputmaskData.config.inputs,
              genericService: req.soajs.inputmaskData.config.genericService,
              soajsService: req.soajs.inputmaskData.config.soajsService,
              soajsUI: req.soajs.inputmaskData.config.soajsUI,
              soajsES: req.soajs.inputmaskData.config.soajsES,
              modified: new Date().getTime(),
            },
          };
          opts.versioning = newVersion;
          req.soajs.model.updateEntries(req.soajs, opts, error => res.soajs.returnAPIResponse(req, res, {
            code: 400,
            error,
            data: true,
          }));
        });
      });
    });
  },
};
module.exports = updateMw;
