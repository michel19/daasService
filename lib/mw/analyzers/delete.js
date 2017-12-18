

const collection = 'global_es_analyzers';
let name = '';
const condition = {};
const options = {};
const combo = {
  collection,
  condition,
  options,
};
const combo2 = {
  collection: 'gcs',
  condition,
  options,
};

module.exports = {

  initialize(req, res, next) {
    name = req.soajs.inputmaskData.name;
    return next();
  },

  /**
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
        return res.soajs.returnAPIResponse(req, res, { code: 701, error: req.soajs.config.errors[701] });
      }
      return next();
    });
  },

  /**
	 * users cannot delete predefined analyzersx
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
        return res.soajs.returnAPIResponse(req, res, { code: error.code, error });
      }
      if (records) {
        return res.soajs.returnAPIResponse(req, res, { code: 702, error: req.soajs.config.errors[702] });
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
    req.soajs.model.findEntries(req.soajs, combo2, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: error.code, error });
      }
      const requests = records.map(element => new Promise((resolve, reject) => {
        setTimeout(() => {
          if (element.soajsES && element.soajsES.settings && element.soajsES.settings.analyzers) {
            const analyzers = element.soajsES.settings.analyzers;

            const arequests = analyzers.map(analyzer => new Promise(() => {
              setTimeout(() => {
                if (analyzer.name === name) {
                  reject();
                  return res.soajs.returnAPIResponse(req, res, {
                    code: 703,
                    error:
            req.soajs.config.errors[703].replace('<<schema>>', `in schema ${element.name}`),
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
  deleteAnalyzer(req, res) {
    combo.condition = { name };
    req.soajs.model.deleteEntries(req.soajs, combo, (error) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: error.code, error });
      }
      return res.soajs.returnAPIResponse(req, res, { code: 400, error: null, data: true });
    });
  },
};
