

const condition = {};
const collection = 'global_aggregation';

module.exports = {
  checkGCSServices(req, res, next) {
    const combo1 = {
      collection: 'gcs',
      condition: {
        name: {
          $in: req.soajs.inputmaskData.data.schemas,
        },
      },
    };

    req.soajs.model.countEntries(req.soajs, combo1, (error, count) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: 400, error });
      }

      if (count !== req.soajs.inputmaskData.data.schemas.length) {
        return res.soajs.returnAPIResponse(req, res, { code: 405, error: req.soajs.config.errors[405] });
      }
      next();
    });
  },

  editRecord(req, res) {
    const criteria = req.soajs.inputmaskData.data.criteria;
    const schemas = req.soajs.inputmaskData.data.schemas;
    const status = req.soajs.inputmaskData.data.status;

    const combo2 = {
      condition,
      collection,
      updatedFields: {
        $set: {
          criteria,
          schemas,
          status,
        },
      },

      options: {
        upsert: true,
        multi: false,
        safe: true,
      },
    };
    req.soajs.model.updateEntries(req.soajs, combo2, error => res.soajs.returnAPIResponse(req, res, { code: 400, error, data: true }));
  },
};
