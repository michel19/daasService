const collection = 'global_es_analyzers';
module.exports = {
  checkExisting(req, res, next) {
    const data = req.soajs.inputmaskData.data;
    const combo1 = {
      collection: 'global_es_filters',
      condition: {
        name: {
          $in: req.soajs.inputmaskData.data.filter,
        },
      },
    };
    req.soajs.model.countEntries(req.soajs, combo1, (err, count) => {
      if (err) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 400,
          error: req.soajs.config.errors[400],
        });
      }
      if (count === req.soajs.inputmaskData.data.filter.length) {
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
              code: 700,
              error: req.soajs.config.errors[700],
            });
          }
          return next();
        });
      } else {
        return res.soajs.returnAPIResponse(req, res, {
          code: 704,
          error: req.soajs.config.errors[704],
        });
      }
    });
  },

  addAnalyzer(req, res) {
    const record = req.soajs.inputmaskData.data;
    const combo2 = {
      collection,
      record,
      versioning: true,
    };
    req.soajs.model.insertEntries(req.soajs, combo2, error => res.soajs.returnAPIResponse(req, res, {
      code: 400,
      error,
      data: true,
    }));
  },
};
