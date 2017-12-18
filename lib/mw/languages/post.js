const collection = 'global_languages';

module.exports = {
  /*
	* search if the code already exists and return a warning to the user
	*/
  checkExisting: (req, res, next) => {
    const opt = {
      collection,
      condition: {
        [`languages.${Object.keys(req.soajs.inputmaskData.languages)}`]: { $exists: true },
      },
    };
    /**
		 * find if a key having the same language code already exists
		 */
    req.soajs.model.findEntry(req.soajs, opt, (err, resp) => {
      if (resp) {
        return res.soajs.returnAPIResponse(req, res, { code: 403, error: req.soajs.config.errors['403'] });
      }
      return next();
    });
  },

  /*
	* add language to database
	*/
  addLanguage: (req, res) => {
    const opt1 = {
      collection,
      condition: {},
      record: {
        languages: req.soajs.inputmaskData.languages,
      },
    };
    req.soajs.model.findEntries(req.soajs, opt1, (err1, data) => {
      if (!data || !data.length) {
        /**
				 * insert the language if the database is empty
				 */
        req.soajs.model.insertEntries(req.soajs,
          opt1, (error, response) => res.soajs.returnAPIResponse(req, res, {
            code: 400,
            error,
            data: response,
          }));
      } else {
        const opts = {
          collection,
          condition: {
            [`languages.${Object.keys(req.soajs.inputmaskData.languages)[0]}`]: { $exists: false },
          },
          updatedFields: {
            $set: {
              [`languages.${Object.keys(req.soajs.inputmaskData.languages)[0]}`]:
              req.soajs.inputmaskData.languages[Object.keys(req.soajs.inputmaskData.languages)[0]],
            },
            $setOnInsert: {
              [`languages.${Object.keys(req.soajs.inputmaskData.languages)[0]}`]:
              req.soajs.inputmaskData.languages[Object.keys(req.soajs.inputmaskData.languages)[0]],
            },
          },
          options: {
            upsert: true,
            multi: false,
            safe: true,
          },
        };
        /**
				 * update the record if the database contain at least one language
				 */
        req.soajs.model.updateEntries(req.soajs,
          opts, (error, response) => res.soajs.returnAPIResponse(req, res, {
            code: 400,
            error,
            data: response,
          }));
      }
    });
  },
};
