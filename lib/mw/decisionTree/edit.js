const collection = 'global_catalogs';
let condition = {};
module.exports = {
  checkExisting(req, res, next) {
    const name = req.soajs.inputmaskData.name;
    condition = {
      name,
    };
    const options = {};
    const combo = {
      collection,
      condition,
      options,
    };
    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (!records) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 401,
          error: req.soajs.config.errors[401],
        });
      }
      return next();
    });
  },

  editRecord(req, res) {
    const combo2 = {
      condition,
      collection,
      updatedFields: { $set: { dt: req.soajs.inputmaskData.data } },
      options: {
        multi: false,
        safe: true,
      },
    };
    req.soajs.model.updateEntries(req.soajs, combo2, error => res.soajs.returnAPIResponse(req, res, { code: 400, error, data: true }));
  },
};
