(function (window) {
	'use strict';

	// =======================
	// Creates a new Model instance and hooks up the storage.
	//
	// @constructor
	// @param storage {object}, a reference to the client side storage class
	// =======================
	function Model(storage) {
		this.storage = storage;
	}

	// =======================
	// Creates a new todo item in storage
	//
	// @param [title] {string}, the title of the todo
	// @param [callback] {function}, the callback to fire after the model is created
	// =======================
	Model.prototype.create = function (title, callback) {
		title = title || '';
		callback = callback || function () {};

		var newItem = {
			title: title.trim(),
			completed: false
		};

		this.storage.save(newItem, callback);
	};

	// =======================
	// Finds and returns an item in storage. 
	// If no query is given it'll simply return everything.
	// If given a string or number it'll look that up as the ID of the item to find. 
	// Lastly, you can pass it an object to match against.
	//
	// @param [query] {string|number|object}, a query to match items against
	// @param [callback] {function}, the callback to fire after the item is found
	// =======================
	Model.prototype.read = function (query, callback) {
		var queryType = typeof query;
		callback = callback || function () {};

		if (queryType === 'function') {
			callback = query;
			return this.storage.findAll(callback);
		} else if (queryType === 'string' || queryType === 'number') {
			query = parseInt(query, 10);
			this.storage.find({ id: query }, callback);
		} else {
			this.storage.find(query, callback);
		}
	};

	// =======================
	// Updates a model by giving it an ID, data to update, and a callback to fire when
	// the update is complete.
	//
	// @param id {number}, the id of the model to update
	// @param data {object}, the properties to update and their new value
	// @param callback {function}, the callback to fire when the update is complete.
	// =======================
	Model.prototype.update = function (id, data, callback) {
		this.storage.save(data, callback, id);
	};

	// =======================
	// Removes a model from storage
	//
	// @param id {number}, the ID of the model to remove
	// @param callback {function}, the callback to fire when the removal is complete.
	// =======================
	Model.prototype.remove = function (id, callback) {
		this.storage.remove(id, callback);
	};

	// =======================
	// WARNING: Will remove ALL data from storage.
	//
	// @param callback {function}, the callback to fire when the storage is wiped.
	// =======================
	Model.prototype.removeAll = function (callback) {
		this.storage.drop(callback);
	};

	// =======================
	// Returns a count of all todos
	// =======================
	Model.prototype.getCount = function (callback) {
		var todos = {
			active: 0,
			completed: 0,
			total: 0
		};

		this.storage.findAll(function (data) {
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		});
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
