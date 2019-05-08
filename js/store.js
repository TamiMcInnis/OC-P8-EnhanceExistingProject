/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	// =======================
	// Creates a new client side storage object
	// Will create an empty collection if no collection already exists.
	// @param name {string}, the name of our DB we want to use
	// @param callback {function}, our fake DB uses callbacks because in real life you probably would be making AJAX calls
	// =======================
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	// =======================
	// Finds items based on a query given as a JS object
	// @param query {object}, the query to match. ex: completed: true, or id: 34583453)
	// @param callback {function}, the callback to fire when the query has completed running
	// @example
	// db.find({foo: 'bar', hello: 'world'}, function (data) {
	//	 // data will return any items that have foo: bar and
	//	 // hello: world in their properties
	// });
	// =======================
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	// =======================
	// Will retrieve all data from the collection
	// @param callback {function}, the callback to fire upon retrieving data
	// =======================
	Store.prototype.findAll = function (callback) {

		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	// =======================
	// Will save the given data to the DB. 
	// If no id exists ,will create a new item.
	// Else update an existing item's properties
	// 
	// @param updateData {object}, the data to save back into the DB
	// @param callback {function}, the callback to fire after saving
	// @param id {number}, an optional param to enter an ID of an item to update
	// =======================
	Store.prototype.save = function (updateData, callback, id) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		var newId;
		callback = callback || function () {};

		// If an existing ID was given, find the item and update each property
		if (id) {
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (var key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		// Else create new todo item
		} else {
			// Generate an ID via UTC time
    		newId = new Date().getTime();
			updateData.id = parseInt(newId);
    		
    		// Add new item to storage
			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	// =======================
	// Will remove an item from the Store based on its ID
	// @param id {number}, the ID of the item you want to remove
	// @param callback {function}, the callback to fire after saving
	// =======================
	Store.prototype.remove = function (id, callback) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		var todoId;
		
		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todoId = todos[i].id;
			}
		}

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == todoId) {
				todos.splice(i, 1);
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	};

	// =======================
	// Will drop all storage and start fresh
	// @param callback {function}, the callback to fire after dropping the data
	// =======================
	Store.prototype.drop = function (callback) {
		var data = {todos: []};
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// =======================
	// Export to window
	// =======================
	window.app = window.app || {};
	window.app.Store = Store;
})(window);

