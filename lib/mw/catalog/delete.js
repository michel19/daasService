const collection = 'global_catalogs';
let name = '';
const condition = {};
const options = {};
const combo = {
  collection,
  condition,
  options,
};


module.exports = {

  initialize(req, res, next) {
    name = req.soajs.inputmaskData.name;
    return next();
  },

  /** a
   * check if the anlyzer name that you are trying to delete already exist.
   * @param req
   * @param res
   * @param next
   */
  checkExisting(req, res, next) {
    combo.condition = { name };
    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: error.code, error });
      }
      if (!records) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 415,
          error: req.soajs.config.errors[415],
        });
      }
      return next();
    });
  },

  /**
   * users cannot delete a catalog if its already in use.
   * @param req
   * @param res
   * @param next
   */
  checkUsage(req, res, next) {
    return next();
  },

  /**
   * purge the given catalog from the DB
   * @param req
   * @param res
   * @returns {*}
   */
  deleteCAtalog(req, res) {
    combo.condition = {
      name,
    };
    req.soajs.model.deleteEntries(req.soajs, combo, (error) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: error.code, error });
      }
      return res.soajs.returnAPIResponse(req, res, { code: 400, error: null, data: true });
    });
  },
};
