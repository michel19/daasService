const collection = 'global_catalogs';
const async = require('async');

module.exports = {

  /**
	 * Check if there is a catalog with the same name
	 * @param req
	 * @param res
	 * @param next
	 */
  checkExisting(req, res, next) {
    const combo = {
      collection,
      condition: {
        name: req.soajs.inputmaskData.catalog.name,
      },
      options: {},
    };

    req.soajs.model.findEntry(req.soajs, combo, (error, records) => {
      if (records) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 411,
          error: req.soajs.config.errors[411],
        });
      }
      return next();
    });
  },

  /**
	 * Check if the tenants and their corresponding applications actually exist in the database
	 * @param req
	 * @param res
	 * @param next
	 */
  checkApplications(req, res, next) {
    /**
		 * checks if an entry exists in the given array or not
		 * @param value
		 * @param index
		 * @param self
		 * @returns {boolean}
		 */
    async.each(req.soajs.inputmaskData.catalog.tenants, (tenant, cb) => {
      const opts = {
        database: 'provision',
        collection: 'tenants',
        condition: {
          'applications.keys.extKeys.extKey': tenant,
        },
      };
      req.soajs.model.findEntry(req.soajs, opts, (error, response) => {
        if (error) {
          return cb(error);
        }
        if (!response) {
          return cb({ code: 416, error: req.soajs.config.errors[416] });
        }
        cb();
      });
    }, (error) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, {
          code: error.code || 400,
          error: error.error || req.soajs.config.errors[400],
        });
      }
      next();
    });
  },

  /**
	 * Check if the arriving services actually exists in the database
	 * @param req
	 * @param res
	 * @param next
	 */
  checkServicesInputs(req, res, next) {
    console.log('next'); //todelete
    const query = {
      $or: [],
    };

    for (const service in req.soajs.inputmaskData.catalog['gc-services']) {
      query.$or.push({
        name: Object.keys(req.soajs.inputmaskData.catalog['gc-services'][service])[0],
        'inputs.searchable': {
          $all: req.soajs.inputmaskData.catalog['gc-services'][service][Object.keys(req.soajs.inputmaskData.catalog['gc-services'][service])[0]],
        },
      });
    }

    const cond = {
      collection: 'gcs',
      condition: query,
    };

    req.soajs.model.countEntries(req.soajs, cond, (error, count) => {
      if (count === Object.keys(req.soajs.inputmaskData.catalog['gc-services']).length) {
        return next();
      }

      return res.soajs.returnAPIResponse(req, res, {
        code: 417,
        error: req.soajs.config.errors[417],
      });
    });
  },

  AddToDB(req, res) {
    const record = req.soajs.inputmaskData.catalog;
    const combo2 = {
      collection,
      record,
      versioning: true,
    };
    req.soajs.model.insertEntries(req.soajs, combo2, error => res.soajs.returnAPIResponse(req, res, { code: 400, error, data: true }));
  },
};
