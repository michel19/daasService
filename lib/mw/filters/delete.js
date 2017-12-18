const collection = 'global_es_filters';
const inArray = require('in-array');

let name = '';
const condition = {};
const options = {};
const combo = {
  collection,
  condition,
  options,
};
const combo3 = {
  database: 'daas',
  collection: 'gcs',
  condition: {},
  options: {},
};


module.exports = {

  initialize(req, res, next) {
    name = req.soajs.inputmaskData.name;
    return next();
  },
  /**
	 * check if the filter name that you are trying to delete already exist.
	 * @param req
	 * @param res
	 * @param next
	 */
  checkExisting(req, res, next) {
    combo.condition = {
      name,
    };
    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: error.code,
          error,
        });
      }
      if (!records) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 711,
          error: req.soajs.config.errors[711],
        });
      }
      return next();
    });
  },
  /**
	 * users cannot delete predefined analyzers
	 * @param req
	 * @param res
	 * @param next
	 */
  checkPredefined(req, res, next) {
    // You cannot delete a predefined analyzer
    combo.condition = {
      name,
      preDefined: true,
    };
    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: error.code,
          error,
        });
      }
      if (records) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 712,
          error: req.soajs.config.errors[712],
        });
      }
      return next();
    });
  },
  /**
	 * users cannot delete an analyzer if its already in use.
	 * @param req
	 * @param res
	 * @param next
	 */
  checkUsage(req, res, next) {
    const combo2 = {
      database: 'daas',
      collection: 'global_es_analyzers',
      condition: {},
      options: {},
    };

    req.soajs.model.findEntries(req.soajs, combo2, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: error.code,
          error,
        });
      }

      const requests = records.map(item => new Promise((resolve, reject) => {
        setTimeout(() => {
          if (inArray(item.filter, name)) {
            reject();
            return res.soajs.returnAPIResponse(req, res, {
              code: 713,
              error:
                req.soajs.config.errors[713].replace('<<analyzer>>', ` named ${item.name}`),
            });
          }
          return resolve();
        }, 100);
      }));

      return Promise.all(requests).then(() => next());
    });
  },

  checkUseGcs(req, res, next) {
    req.soajs.model.findEntries(req.soajs, combo3, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: error.code, error });
      }
      const requests = records.map(element => new Promise((resolve, reject) => {
        setTimeout(() => {
          if (element.soajsES && element.soajsES.settings && element.soajsES.settings.filters) {
            const filters = element.soajsES.settings.filters;

            const arequests = filters.map(filter => new Promise(() => {
              setTimeout(() => {
                if (filter.name === name) {
                  reject();
                  return res.soajs.returnAPIResponse(req, res, {
                    code: 703,
                    error:
                        req.soajs.config.errors[714].replace('<<schema>>', `in schema ${element.name}`),
                  });
                }
                return resolve();
              }, 100);
            }));
            return Promise.all(arequests).then(() => resolve());
          }

          return resolve();
        }, 100);
      }));
      return Promise.all(requests).then(() => next());
    }
    );
  },
  /**
	 * purge the given analyzer from the DB
	 * @param req
	 * @param res
	 * @returns {*}
	 */
  deleteFilter(req, res) {
    combo.condition = {
      name,
    };
    req.soajs.model.deleteEntries(req.soajs, combo, (error) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: error.code,
          error,
        });
      }
      return res.soajs.returnAPIResponse(req, res, { code: 400, error: null, data: true });
    });
  },
};
