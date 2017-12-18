const collection = 'global_catalogs';
const condition = {};
const cond1 = {};
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
    };
    req.soajs.model.objectId(req.soajs, req.soajs.inputmaskData.id, (err, resp) => {
      if (err) {
        return res.soajs.returnAPIResponse(req, res, {
          code: 413,
          error: req.soajs.config.errors[413],
        });
      }
      combo.condition._id = { $ne: resp };
      cond1.condition = { _id: resp };
      req.soajs.model.findEntry(req.soajs, combo, (error, record) => {
        if (record) {
          return res.soajs.returnAPIResponse(req, res, {
            code: 411,
            error: req.soajs.config.errors[411],
          });
        }
        return next();
      });
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

  editRecord(req, res) {
    const combo2 = {
      condition: cond1.condition,
      collection,
      updatedFields: req.soajs.inputmaskData.catalog,
      options: {
        multi: false,
        safe: true,
      },
    };
    req.soajs.model.updateEntries(req.soajs, combo2, error => res.soajs.returnAPIResponse(req, res, { code: 400, error, data: true }));
  },
};
