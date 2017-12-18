/**
 *  Object containing the middleware of /catalogs API
 */
module.exports = {
  getCatalogs(req, res) {
    const collection = 'global_catalogs';
    const opts = {
      collection,
      condition: {},
    };
    req.soajs.model.findEntries(req.soajs, opts,
      (error, response) => res.soajs.returnAPIResponse(req, res, {
        code: 414,
        error,
        data: response,
      }));
  },
};
