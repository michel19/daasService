

const states = {
  list(req, res) {
    const collection = 'global_aggregation';
    const condition = {};
    const data = {
      records: [],
    };
    const options = {};
    const combo = {
      condition,
      collection,
      options,
    };
    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (records) {
        data.records = records;
      }
      return res.soajs.returnAPIResponse(req, res, { code: 400, error, data });
    });
  },
};
module.exports = states;
