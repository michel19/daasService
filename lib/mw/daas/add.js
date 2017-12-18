const collectionName = 'gcs';
const helper = require('./helper.js');

const addMw = {
  check(req, res, next) {
    helper.mapPostedConfig(req.soajs.inputmaskData.config);
    req.soajs.inputmaskData.name = req.soajs.inputmaskData.name.toLowerCase().trim().replace(/\s+/g, '_');

    if (req.soajs.inputmaskData.config.inputs && req.soajs.inputmaskData.config.inputs.indexed) {
      delete req.soajs.inputmaskData.config.inputs.indexed;
    }

    const record = {
      name: req.soajs.inputmaskData.name,
      parents: req.soajs.inputmaskData.config.parents,
      searchable: req.soajs.inputmaskData.config.searchable,
      language: req.soajs.inputmaskData.config.language,
      inputs: req.soajs.inputmaskData.config.inputs,
      genericService: req.soajs.inputmaskData.config.genericService,
      soajsService: req.soajs.inputmaskData.config.soajsService,
      soajsUI: req.soajs.inputmaskData.config.soajsUI,
      soajsES: req.soajs.inputmaskData.config.soajsES,
    };

    if (record.searchable) {
      // mapping has to be filled
      if (!req.soajs.inputmaskData.config.soajsES || !req.soajs.inputmaskData.config.soajsES.mapping
        || Object.keys(req.soajs.inputmaskData.config.soajsES.mapping).length === 0) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 805,
          error: req.soajs.config.errors[805],
        });
      }
    }

    if (req.soajs.urac) {
      record.author = req.soajs.urac.username;
    }

    const opts = {};
    opts.collection = collectionName;
    opts.condition = { name: record.name };
    req.soajs.model.findEntry(req.soajs, opts, (error, response) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 400,
          error,
        });
      }

      if (response) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 800,
          error,
        });
      }
      req.soajs.data = record;
      next();
    })
    ;
  },

  add(req, res) {
    const opts = {};
    opts.collection = collectionName;
    opts.record = req.soajs.data;
    opts.versioning = true;

    // before  inserting the record check if such service exists
    helper.checkIfGCisAService(req.soajs.config, {
      $or: [
        { port: req.soajs.inputmaskData.config.genericService.config.servicePort },
        { name: req.soajs.inputmaskData.config.genericService.config.serviceName },
      ],
    }, opts.record, 1, req, (error) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 804,
          error,
          data: true,
        });
      }
      req.soajs.model.insertEntries(req.soajs, opts, (error, dbRecord) => {
        if (error) {
          return error; // 400
        }
        return res.soajs.returnAPIResponse(req, res, {
          code: 400,
          error: null,
          data: true,
        });
      });
    })
    ;
  },
};

module.exports = addMw;
