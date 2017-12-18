
const gitCollection = 'git_accounts';

const objecthash = require('object-hash');

const fs = require('fs');

const utils = {

  mapPostedConfig(config) {
    const commonFields = config.genericService.config.schema.commonFields;
    for (const i in commonFields) {
      if (Object.hasOwnProperty.call(commonFields, i)) {
        if (Object.hasOwnProperty.call(commonFields[i], 'req')) {
          commonFields[i].required = commonFields[i].req;
          delete commonFields[i].req;
          delete commonFields[i].indexed;
          delete commonFields[i].searchable;
        }
      }
    }

    ['add', 'update'].forEach((formType) => {
      const formConfig = config.soajsUI.form[formType];

      for (let j = 0; j < formConfig.length; j++) {
        for (const field in formConfig[j]) {
          if (Object.hasOwnProperty.call(formConfig[j], field)) {
            if (field === 'req') {
              formConfig[j].required = formConfig[j].req;
              delete formConfig[j].req;
            }

            if (field === '_type') {
              formConfig[j].type = formConfig[j]._type;
              delete formConfig[j]._type;
            }
          }
        }
      }
    });
  },

  compareIMFV(oldIMFV, newIMFV) {
    if (Object.keys(oldIMFV).length !== Object.keys(newIMFV).length) {
      return true;
    }
    for (const input in newIMFV) {
      if (oldIMFV[input]) {
        const hash1 = objecthash(oldIMFV[input]);
        const hash2 = objecthash(newIMFV[input]);
        if (hash1 !== hash2) {
          return true;
        }
      }
    }
    return false;
  },

  compareMapping(oldMapping, newMapping) {
    if (Object.keys(oldMapping).length !== Object.keys(newMapping).length) {
      return true;
    }
    for (const input in newMapping) {
      if (oldMapping[input]) {
        const hash1 = objecthash(oldMapping[input]);
        const hash2 = objecthash(newMapping[input]);
        if (hash1 !== hash2) {
          return true;
        }
      }
    }
    return false;
  },

  compareAPISFields(oldAPIs, newAPIs) {
    for (const route in newAPIs) {
      if (Object.hasOwnProperty.call(newAPIs, route)) {
        if (route === 'commonFields') {
          continue;
        }
        if (oldAPIs[route]) {
          const oldFields = oldAPIs[route].commonFields;
          const newFields = newAPIs[route].commonFields;
          // compare fields
          if (oldFields && newFields) {
            if (oldFields.length !== newFields.length || !oldFields.every((u, i) => u === newFields[i])) {
              return true;
            }
          }
        }
      }
    }
    return false;
  },

  compareAPIs(oldAPIs, newAPIs) {
    for (const route in newAPIs) {
      if (oldAPIs[route]) {
        if ((oldAPIs[route].type !== newAPIs[route].type) || (oldAPIs[route].method !== newAPIs[route].method)) {
          return true;
        }

        if (Object.keys(oldAPIs[route].workflow).length !== Object.keys(newAPIs[route].workflow).length) {
          return true;
        }

        for (const wfStep in newAPIs[route].workflow) {
          if (Object.hasOwnProperty.call(newAPIs[route].workflow, wfStep)) {
            const hash1 = objecthash(oldAPIs[route].workflow[wfStep]);
            const hash2 = objecthash(newAPIs[route].workflow[wfStep]);
            if (hash1 !== hash2) {
              return true;
            }
          }
        }
      }
    }
    return false;
  },

  compareUI(oldUI, newUI) {
    let columnHash1,
      columnHash2;

    if (oldUI.list.columns.length !== newUI.list.columns.length) {
      return true;
    }
    for (let column = 0; column < newUI.list.columns.length; column++) {
      columnHash1 = objecthash(newUI.list.columns[column]);
      columnHash2 = objecthash(oldUI.list.columns[column]);
      if (columnHash1 !== columnHash2) {
        return true;
      }
    }

    if (oldUI.form.add.length !== newUI.form.add.length) {
      return true;
    }
    for (let field = 0; field < newUI.form.add.length; field++) {
      columnHash1 = objecthash(newUI.form.add[field]);
      columnHash2 = objecthash(oldUI.form.add[field]);
      if (columnHash1 !== columnHash2) {
        return true;
      }
    }

    if (oldUI.form.update.length !== newUI.form.update.length) {
      return true;
    }
    let field = 0;
    for (field; field < newUI.form.update.length; field++) {
      columnHash1 = objecthash(newUI.form.update[field]);
      columnHash2 = objecthash(oldUI.form.update[field]);
      if (columnHash1 !== columnHash2) {
        return true;
      }
    }
    return false;
  },

  extractAPIsList(schema) {
    const excluded = ['commonFields'];
    const apiList = [];
    for (const route in schema) {
      if (Object.hasOwnProperty.call(schema, route)) {
        if (excluded.indexOf(route) !== -1) {
          continue;
        }

        const oneApi = {
          l: schema[route]._apiInfo.l,
          v: route,
        };

        if (schema[route]._apiInfo.group) {
          oneApi.group = schema[route]._apiInfo.group;
        }

        if (schema[route]._apiInfo.groupMain) {
          oneApi.groupMain = schema[route]._apiInfo.groupMain;
        }

        apiList.push(oneApi);
      }
    }
    return apiList;
  },

  checkIfGCisAService(config, condition, GCDBRecord, version, req, cb) {
    let opts = {
      database: 'provision',
    };
    opts.collection = 'services';
    opts.condition = condition;
    req.soajs.model.findEntry(req.soajs, opts, (error, oneRecord) => {
      if (error) {
        return cb(error);
      }

      if (oneRecord && oneRecord.gcId && oneRecord.gcId !== GCDBRecord._id.toString()) {
        return cb(req.soajs.config.errors[804]);
      }
      opts = {
        database: 'provision',
      };
      opts.collection = gitCollection;
      opts.conditions = { 'repos.name': 'HerronTech/gcs' };
      opts.fields = { owner: 1, provider: 1 };
      req.soajs.model.findEntry(req.soajs, opts, (error, gitResponse) => {
        if (error) {
          return cb(error);
        }

        if (!gitResponse) {
          req.soajs.log.error('No gitResponse');
          return cb(req.soajs.config.errors[805]);
        }

        const serviceGCDoc = {
          $set: {
            port: req.soajs.inputmaskData.config.genericService.config.servicePort,
            requestTimeout: req.soajs.inputmaskData.config.genericService.config.requestTimeout,
            requestTimeoutRenewal: req.soajs.inputmaskData.config.genericService.config.requestTimeoutRenewal,
            src: {
              provider: gitResponse.provider,
              owner: 'HerronTech',
              repo: 'gcs',
            },
            version,
            versions: {},
          },
        };

        serviceGCDoc.$set.versions[version] = {
          extKeyRequired: req.soajs.inputmaskData.config.genericService.config.extKeyRequired || false,
          oauth: req.soajs.inputmaskData.config.genericService.config.oauth || false,
          session: req.soajs.inputmaskData.config.genericService.config.session || false,
          urac: req.soajs.inputmaskData.config.genericService.config.urac || false,
          urac_Profile: req.soajs.inputmaskData.config.genericService.config.urac_Profile || false,
          urac_ACL: req.soajs.inputmaskData.config.genericService.config.urac_ACL || false,
          provision_ACL: req.soajs.inputmaskData.config.genericService.config.provision_ACL || false,
          apis: utils.extractAPIsList(req.soajs.inputmaskData.config.genericService.config.schema),
        };

        let queryCondition = {};
        if( GCDBRecord._id && oneRecord && !oneRecord.gcId){
          // in case of updating
           queryCondition = {
            name: req.soajs.inputmaskData.config.genericService.config.serviceName,
          };
        } else if (GCDBRecord._id && !oneRecord) {
          queryCondition = {
            name: req.soajs.inputmaskData.config.genericService.config.serviceName,
            gcId: GCDBRecord._id.toString(),
          };
        }
        else{
          // in case of inserting
           queryCondition = {
            name: req.soajs.inputmaskData.config.genericService.config.serviceName,
          };

        }


        opts = {
          database: 'provision',
        };
        opts.collection = 'services';
        opts.condition = queryCondition;
        opts.updatedFields = serviceGCDoc;
        opts.options = { upsert: true };
        if (oneRecord && !oneRecord.gcId && GCDBRecord._id) {
          opts.updatedFields.$set.gcId = GCDBRecord._id.toString();
        }
        req.soajs.model.updateEntries(req.soajs, opts, (error) => {
          if (error) {
            return cb(error);
          }
          return cb(null, true);
        });




      });
    });
  },

};

module.exports = utils;
