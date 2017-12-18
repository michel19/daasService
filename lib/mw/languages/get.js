/**
 *  Object containing the middleware of /languages API
 */
const collection = 'global_languages';

module.exports = {
  getAll: (req, res) => {
    const opts = {
      condition: {},
      collection,
    };
    req.soajs.model.findEntries(req.soajs, opts, (error, response) => {
      let data = {};
      if (response && response.length > 0) {
        data = response[0].languages;
      }
      return res.soajs.returnAPIResponse(req, res, { code: 402, error, data });
    });
  },
};
