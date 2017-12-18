const collection = 'gcs';
const child = [];
const states = {
  list(req, res) {
    const condition = {};
    const data = {
      records: [],
    };
    const options = {};
    const combo = {
      collection,
      condition,
      options,
    };

    child.splice(0, child.length);
    req.soajs.model.findEntries(req.soajs, combo, (error, records) => {
      if (records) {
        records.forEach((onerecord) => {
          if (req.soajs.inputmaskData.parent) {
            if (onerecord.parents && onerecord.parents.length !== 0) {
              onerecord.parents.forEach((oneparent) => {
                if (oneparent === req.soajs.inputmaskData.parent) {
                  child.push(onerecord);
                }
              });
            }
          } else if (!onerecord.parents || onerecord.parents.length === 0) {
            child.push(onerecord);
          }
        });
      }
      const response = child;
      return res.soajs.returnAPIResponse(req, res, { code: 400, error, data: response });
    });
  },
};
module.exports = states;
