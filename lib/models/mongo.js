const database = 'daas';

const lib = {
	defaults(combo) {
		if (!combo.database) {
			combo.database = database;
		}

		if (!Object.hasOwnProperty.call(combo, 'versioning')) {
			combo.versioning = false;
		}
	},

	objectId(soajs, id, cb) {
		let myId;
		try {
			myId = soajs.mongo[database].ObjectId(id);
		} catch (e) {
			soajs.log.error(id);
			soajs.log.error(e);
			return cb(e);
		}
		return cb(null, myId);
	},

	generateId(soajs) {
		return new soajs.mongo[database].ObjectId();
	},

	findEntries(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].find(combo.collection, combo.condition
			|| {}, combo.fields || null, combo.options || null, cb);
	},

	countEntries(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].count(combo.collection, combo.condition
			|| {}, cb);
	},

	findEntry(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].findOne(combo.collection, combo.condition
			|| {}, combo.fields || {}, cb);
	},

	insertEntries(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].insert(combo.collection, combo.record, combo.versioning
			|| false, cb);
	},

	saveEntry(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].save(combo.collection, combo.record, combo.versioning
			|| false, cb);
	},

	updateEntries(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].update(combo.collection, combo.condition, combo.updatedFields, combo.options || {}, combo.versioning || false, cb);
	},

	deleteEntries(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].remove(combo.collection, combo.condition, cb);
	},

	findStream(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].findStream(combo.collection, combo.condition, cb);
	},

	distinctEntries(soajs, combo, cb) {
		lib.defaults(combo);
		soajs.mongo[combo.database].distinct(combo.collection, combo.fields, combo.condition, cb);
	}
};

module.exports = lib;
