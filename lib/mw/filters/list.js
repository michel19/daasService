const collection = 'global_es_filters';

const states = {
  list(req, res) {
    const condition = {};
    const data = {
      records: [],
    };
    const options = {};
    const combo = {
      collection,
      condition,
      options,
    };
    req.soajs.model.findEntries(req.soajs, combo, (error, records) => {
      if (records) {
        data.records = records;
      }
      return res.soajs.returnAPIResponse(req, res, { code: 400, error, data });
    });
  },
};
module.exports = states;
