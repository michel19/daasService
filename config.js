const cbSchema = require('./schemas/cb');

module.exports = {
  type: 'service',
  prerequisites: {
    cpu: ' ',
    memory: ' ',
  },
  swagger: true,
  serviceName: 'daas',
  serviceGroup: 'global',
  serviceVersion: 1,
  servicePort: (process.env.SOAJS_MANUAL) ? 6556 : 4556,
  requestTimeout: 1,
  requestTimeoutRenewal: 1,
  extKeyRequired: false,
  injection: true,
  oauth: false,
  urac: false,
  urac_Profile: false,
  urac_ACL: false,
  provision_ACL: false,
  session: false,
  dbs: [
    {
      prefix: process.env.SOAJS_DB_PREFIX || '',
      name: 'daas',
      mongo: true,
      multitenant: false,
    },
    {
	  prefix: process.env.SOAJS_DB_PREFIX || '',
	  name: 'core_provision',
	  mongo: true,
	  multitenant: false,
    },
    {
      prefix: '', //todo check this process.env.SOAJS_DB_PREFIX || '',
      name: 'esClient',
      es: true,
    },
  ],
  models: {
    path: `${__dirname}/lib/models/`,
    name: 'mongo',
  },
  schema: {
    commonFields: {
      name: {
        required: true,
        source: [
          'query.name',
          'body.name',
        ],
        validation: {
          type: 'string',
        },
      },

      id: {
        source: ['query.id'],
        required: true,
        validation: {
          type: 'string',
        },
      },

      parent: {
        required: false,
        source: [
          'query.parent',
        ],
        validation: {
          type:'string',
        },
      },

      code: {
        required: true,
        source: [
          'query.code',
        ],
        validation: {
          type: 'string',
        },
      },

      catalog: {
        required: true,
        source: [
          'body.catalog',
        ],
        validation: {
          type: 'object',
          required: [
            'name',
            'tenants',
            'gc-services',
          ],
          properties: {
            name: {
              type: 'string',
              pattern: /^[0-9a-zA-Z]+$/,
            },
            tenants: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            'gc-services': {
              type: 'array',
              items: {
                type: 'object',
                required: ['resultsPerPage'],
              },
              patternProperties: {
                '^[a-zA-Z]+$': {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
              properties: {
                resultsPerPage: {
                  type: 'integer',
                },
              },
            },
          },
        },
      },
    },

    get: {
      '/aggregation': {
        _apiInfo: {
          l: 'get the aggregation module',
          group: '',
        },
        mw: `${__dirname}/lib/mw/aggregation/get.js`,
      },

      '/parent': {
        _apiInfo: {
          l: 'get the list of childs',
          group: '',
        },
        mw: `${__dirname}/lib/mw/parent-child/list_get.js`,
        imfv: {
          commonFields: [
            'parent',
          ],
        },
      },

      '/analyzers': {
        _apiInfo: {
          l: 'List all analyzers',
          group: '',
        },
        mw: `${__dirname}/lib/mw/analyzers/list.js`,
      },

      '/catalog': {
        _apiInfo: {
          l: 'List all catalogs',
          group: 'catalogs',
        },
        mw: `${__dirname}/lib/mw/catalog/list.js`,
      },

      '/catalog/get': {
        _apiInfo: {
          l: 'get catalog by id',
          group: '',
        },
        mw: `${__dirname}/lib/mw/catalog/get.js`,
        imfv: {
          commonFields: [
            'id',
          ],
        },
      },

      '/decisionTree': {
        _apiInfo: {
          l: 'get DT from a given catalog',
          group: '',
        },
        mw: `${__dirname}/lib/mw/decisionTree/get.js`,
        imfv: {
          commonFields: [
            'name',
          ],
        },
      },

      '/filters': {
        _apiInfo: {
          l: 'List all Filters',
          group: '',
        },
        mw: `${__dirname}/lib/mw/filters/list.js`,
      },

      '/languages': {
        _apiInfo: {
          l: 'list languages',
          group: 'languages',
        },
        mw: `${__dirname}/lib/mw/languages/get.js`,
      },

      '/searchable': {
        _apiInfo: {
          l: 'adding records for deamon',
          group: 'aggregation',
        },
        mw: `${__dirname}/lib/mw/searchable/list.js`,
      },

      '/cb/list': {
        _apiInfo: {
          l: 'List Content Schema',
          group: 'Content Builder',
          groupMain: true,
        },
        mw: `${__dirname}/lib/mw/daas/list.js`,
        imfv: {
          custom: {
            port: {
              required: false,
              source: ['query.port'],
              validation: {
                type: 'boolean',
              },
            },
          },
        },
      },

      '/cb/get': {
        _apiInfo: {
          l: 'Get One Content Schema',
          group: 'Content Builder',
        },
        mw: `${__dirname}/lib/mw/daas/get.js`,
        imfv: {
          commonFields: ['id'],
          custom: {
            version: {
              required: false,
              source: ['query.version'],
              validation: {
                type: 'integer',
              },
            },
          },
        },
      },

      '/cb/listRevisions': {
        _apiInfo: {
          l: 'List Content Schema Revisions',
          group: 'Content Builder',
        },
        mw: `${__dirname}/lib/mw/daas/revisions.js`,
      },
    },

    post: {
      '/aggregation/rebuild': {
        _apiInfo: {
          l: 'rebuild the daemon',
          group: '',
        },
        mw: `${__dirname}/lib/mw/aggregation/rebuild.js`,
      },

      '/aggregation': {
        _apiInfo: {
          l: 'save aggregation module changes',
          group: '',
        },
        mw: `${__dirname}/lib/mw/aggregation/save.js`,
        imfv: {
          custom: {
            data: {
              required: true,
              source: [
                'body.data',
              ],
              validation: {
                type: 'object',
                properties: {
                  criteria: {
                    type: 'object',
                    description: 'criteria on which the daemon should worlk upon',
                  },
	              status: { type: "string", "enum": ['ready', 'processing'], required: true},
                  schemas: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'list of schemas',
                  },
                },
              },
            },
          },
        },
      },

      '/analyzers': {
        _apiInfo: {
          l: 'add a new analyzers',
          group: '',
        },
        mw: `${__dirname}/lib/mw/analyzers/add.js`,
        imfv: {
          custom: {
            data: {
              required: true,
              source: [
                'body.data',
              ],
              validation: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  filter: {
                    description: 'list of applied filter names',
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  tokenizer: {
                    type: 'string',
                    description: "analyzer's tokinizer",
                  },
                  option: {
                    type: 'object',
                    description: "analyzer's options",
                  },
                },
              },
            },
          },
        },
      },

      '/catalog': {
        _apiInfo: {
          l: 'Add catalog',
          group: 'catalog',
        },
        mw: `${__dirname}/lib/mw/catalog/post.js`,
        imfv: {
          commonFields: ['catalog'],
        },
      },

      '/filters': {
        _apiInfo: {
          l: 'add a new filter',
          group: '',
        },
        mw: `${__dirname}/lib/mw/filters/add.js`,
        imfv: {
          custom: {
            data: {
              required: true,
              source: [
                'body.data',
              ],
              validation: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  type: {
                    type: 'string',
                  },
                  preDefined: {
                    type: 'boolean',
                    default: false,
                  },
                  isCharFilter: {
                    type: 'boolean',
                    default: false,
                  },
                  option: {
                    type: 'object',
                    description: "filter's options",
                  },
                },
              },
            },
          },
        },
      },

      '/languages': {
        _apiInfo: {
          l: 'Add language',
          group: 'language',
        },
        mw: `${__dirname}/lib/mw/languages/post.js`,
        imfv: {
          custom: {
            languages: {
              required: true,
              source: [
                'body.languages',
              ],
              validation: {
                type: 'object',
                patternProperties: {
                  '^[a-zA-Z]+$': {
                    type: 'object',
                    required: true,
                    properties: {
                      name: {
                        type: 'string',
                      },
                      direction: {
                        type: 'string',
                        enum: [
                          'ltr', 'rtl',
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/cb/add': {
        _apiInfo: {
          l: 'Add New Content Schema',
          group: 'Content Builder',
        },
        mw: `${__dirname}/lib/mw/daas/add.js`,
        imfv: {
          commonFields: ['name'],
          custom: {
            config: {
              required: true,
              source: ['body.config'],
              validation: cbSchema,
            },
          },
        },
      },
    },

    put: {
      '/catalog/:id': {
        _apiInfo: {
          l: 'Edit catalog',
          group: 'catalog',
        },
        mw: `${__dirname}/lib/mw/catalog/put.js`,
        imfv: {
          commonFields: [
            'name', 'catalog',
          ],
          custom: {
            id: {
              required: true,
              source: ['params.id'],
              validation: {
                type: 'string',
              },
            },
          },
        },
      },



      '/decisionTree': {
        _apiInfo: {
          l: 'edit DT from a given catalog',
          group: '',
        },
        mw: `${__dirname}/lib/mw/decisionTree/edit.js`,
        imfv: {
          custom: {
            data: {
              required: true,
              source: [
                'body.data',
              ],
              validation: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    genre: {
                      type: 'string',
                      enum: [
                        'operator',
                        'query',
                      ],
                    },
                    type: {
                      type: 'string',
                    },
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                      },
                    },
                    query: {
                      type: 'string',
                    },
                    fields: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    options: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
          commonFields: [
            'name',
          ],
        },
      },

      '/cb/update': {
        _apiInfo: {
          l: 'Update Content Schema',
          group: 'Content Builder',
        },
        mw: `${__dirname}/lib/mw/daas/update.js`,
        imfv: {
          custom: {
            config: {
              required: true,
              source: ['body.config'],
              validation: cbSchema,
            },
          },
          commonFields: ['id'],
        },
      },
    },

    delete: {
      '/analyzers': {
        _apiInfo: {
          l: 'delete a given analyzers',
          group: '',
        },
        mw: `${__dirname}/lib/mw/analyzers/delete.js`,
        imfv: {
          commonFields: [
            'name',
          ],
        },
      },

      '/catalog': {
        _apiInfo: {
          l: 'Delete an existing catalog',
          group: 'catalog',
        },
        mw: `${__dirname}/lib/mw/catalog/delete.js`,
        imfv: {
          commonFields: [
            'name',
          ],
        },
      },

      '/decisionTree': {
        _apiInfo: {
          l: 'reset decistion tree to null',
          group: '',
        },
        mw: `${__dirname}/lib/mw/decisionTree/delete.js`,
        imfv: {
          commonFields: [
            'name',
          ],
        },
      },

      '/filters': {
        _apiInfo: {
          l: 'delete a given filter',
          group: '',
        },
        mw: `${__dirname}/lib/mw/filters/delete.js`,
        imfv: {
          commonFields: [
            'name',
          ],
        },
      },

      '/languages': {
        _apiInfo: {
          l: 'delete language',
          group: 'language',
        },
        mw: `${__dirname}/lib/mw/languages/delete.js`,
        imfv: {
          commonFields: [
            'code',
          ],
        },
      },
    },
  },
  errors: require('./error'),
};
