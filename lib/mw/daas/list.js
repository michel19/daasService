
const listMw = {
  listEntries(req, res) {
    const fields = {
      id: 1,
      name: 1,
      ts: 1,
      author: 1,
      modified: 1,
      v: 1,
      'genericService.config.servicePort': 1,
      'genericService.config':1,
      'soajsUI':1,
    };
    if (req.soajs.inputmaskData.port) {
      fields['genericService.config.servicePort'] = 1;
    }

    const opts = {};
    opts.collection = 'gcs';
    opts.condition = {};
    opts.fields = fields;
    opts.options = { $sort: { ts: -1, v: -1 } };
    req.soajs.model.findEntries(req.soajs, opts, (error, response) => res.soajs.returnAPIResponse(req, res, {
      code: 400,
      error,
      data: response,
    }));
  },
};

module.exports = listMw;
