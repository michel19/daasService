

let condition = {};
const collection = 'global_aggregation';

module.exports = {
  checkExisting(req, res, next) {
    condition = {};

    const options = {};
    const combo = {
      condition,
      collection,
      options,
    };
    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (!records) {
        return res.soajs.returnAPIResponse(req, res, { code: 401, error: req.soajs.config.errors[401] });
      }
      return next();
    });
  },

  editRecord(req, res) {
    const combo2 = {
      condition,
      collection,
      updatedFields: {
        $set: {
          status: 'ready',
          ts: new Date().getTime(),
        },
      },
      options: {
        multi: false,
        safe: true,
      },
    };

    req.soajs.model.updateEntries(req.soajs, combo2, error => res.soajs.returnAPIResponse(req, res, { code: 400, error, data: true }));
  },
};
