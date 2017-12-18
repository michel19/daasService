
const states = {
  'check id': function (req, res, next) {
    req.soajs.model.objectId(req.soajs, req.soajs.inputmaskData.id, (error, id) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 408,
          error,
        });
      }
      req.soajs.inputmaskData.id = id;
      return next();
    });
  },
  getCatalog(req, res) {
    const condition = {
      _id: req.soajs.inputmaskData.id,
    };
    const collection = 'global_catalogs';
    const opts = {
      collection,
      condition,
    };

    req.soajs.model.findEntry(req.soajs, opts, (error, response) => res.soajs.returnAPIResponse(req, res, {
      code: 802,
      error,
      data: response,
    }));
  },


};

module.exports = states;
