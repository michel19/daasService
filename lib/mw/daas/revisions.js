
const collectionName = 'gcs';

const listMw = {
  listRevisions(req, res, next) {
    const opts = {};
    const fields = { refId: 1, name: 1, author: 1, modified: 1, v: 1 };
    opts.collection = `${collectionName}_versioning`;
    opts.condition = {};
    opts.fields = fields;
    opts.options = { $sort: { v: -1 } };
    req.soajs.model.findEntries(req.soajs, opts, (error, response) => res.soajs.returnAPIResponse(req, res, {
      code: 400,
      error,
      data: response,
    }));
  },
};

module.exports = listMw;
