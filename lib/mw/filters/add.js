const collection = 'global_es_filters';
module.exports = {
  checkExisting(req, res, next) {
    const data = req.soajs.inputmaskData.data;
    const condition = {
      name: data.name,
    };
    const options = {};
    const combo = {
      collection,
      condition,
      options,
    };
    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (records) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 710,
          error: req.soajs.config.errors[710],
        });
      }
      return next();
    });
  },

  addFilter(req, res) {
    const record = req.soajs.inputmaskData.data;
    const combo2 = {
      collection,
      record,
      versioning: true,
    };
    req.soajs.model.insertEntries(req.soajs, combo2, error => res.soajs.returnAPIResponse(req, res, { code: 400, error, data: true }));
  },
};
