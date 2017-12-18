/**
 *  remove a given code from the language api.
 */

const collection = 'global_languages';

module.exports = {

  initialize(req, res, next) {
    code = req.soajs.inputmaskData.code.toUpperCase();
    return next();
  },

  checkUseGcs(req, res, next) {
    const combo = {
      database: 'daas',
      collection: 'gcs',
      condition: {},
      options: {},
    };
    req.soajs.model.findEntries(req.soajs, combo, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: error.code, error });
      }
      const requests = records.map(element => new Promise((resolve, reject) => {
        if (element.language && element.language.languages) {
          const languages = element.language.languages;

          const arequests = languages.map(language => new Promise(() => {
            if (language.toUpperCase() === code) {
              return reject(element);
            }
            return resolve();
          }));
          return Promise.all(arequests).then(() => resolve());
        }

        return resolve();
      }));
      return Promise.all(requests).then(() => next()).catch(element => res.soajs.returnAPIResponse(req, res, {
        code: 715,
        error:
              req.soajs.config.errors[715].replace('<<schema>>', `in schema ${element.name}`),
      }));
    }
    );
  },

  delete: (req, res) => {
    const opts = {
      condition: {},
      collection,
      updatedFields: {
        $unset: {
          [`languages.${req.soajs.inputmaskData.code}`]: req.soajs.inputmaskData.code,
        },
      },
    };
    req.soajs.model.updateEntries(req.soajs, opts,
      (error, response) => res.soajs.returnAPIResponse(req, res,
        { code: 400, error, data: response }));
  },
};
