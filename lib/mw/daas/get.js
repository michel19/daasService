
const collectionName = 'gcs';
const listMw = {
  listEntries(req, res) {
    const opts = {};
    req.soajs.model.objectId(req.soajs, req.soajs.inputmaskData.id, (error, id) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 801,
          error,
        });
      }

      req.soajs.inputmaskData.id = id;

      let condition = { _id: req.soajs.inputmaskData.id };
      let suffix = '';
      if (req.soajs.inputmaskData.version && req.soajs.inputmaskData.version !== '') {
        condition = {
          refId: req.soajs.inputmaskData.id,
          v: req.soajs.inputmaskData.version,
        };
        suffix = '_versioning';
      }
      opts.collection = collectionName + suffix;
      opts.condition = condition;
      req.soajs.model.findEntry(req.soajs, opts, (error, response) => res.soajs.returnAPIResponse(req, res, {
        code: 802,
        error,
        data: response,
      }));
    });
  },
};

module.exports = listMw;
