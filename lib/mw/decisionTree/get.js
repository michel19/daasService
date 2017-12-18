const collection = 'global_catalogs';
let condition = {};
module.exports = {
  getCatalogs(req, res) {
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

    req.soajs.model.findEntries(req.soajs, combo,
      (error, response) => res.soajs.returnAPIResponse(req, res, {
        code: 400,
        error,
        data: response[0].dt,
      }));
  },
};
