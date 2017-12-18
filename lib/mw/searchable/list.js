const collection = 'gcs';
const states = {
  list(req, res) {
    const condition = {
      searchable: true,
    };
    const combo = {
      collection,
      condition,
    };
    req.soajs.model.findEntries(req.soajs, combo, (error, records) => {
      if (error) {
        return res.soajs.returnAPIResponse(req, res, { code: 400, error });
      }

      const data = [];
      if (records) {
        const requests = records.map(item => new Promise((resolve) => {
          setTimeout(() => {
            if (item.soajsES && item.soajsES.mapping) {
              const inputs = Object.keys(item.soajsES.mapping);
              if (inputs.length > 0) {
                data.push({
                  serviceName: item.name,
                  inputs,
                });
              }
            }
            return resolve();
          }, 100);
        }));
        return Promise.all(requests).then(() =>
          res.soajs.returnAPIResponse(req, res, { code: 400, error, data }));
      }

      return res.soajs.returnAPIResponse(req, res, { code: 400, error, data });
    });
  },
};
module.exports = states;

