(function (window) {
	'use strict';

	// =======================
	// Takes a model and view and acts as the controller between them
	// @constructor
	// @param model {object}, the model instance
	// @param view {object}, the view instance
	// =======================
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;

		self.view.bind('newTodo', function (title) {
			self.addItem(title);
		});

		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});

		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title);
		});

		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});

		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});

		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});

		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});
	}

	// =======================
	// Loads and initialises the list view
	// Default is "all"
	// @param locationHash {string}, '' || 'active' || 'completed'
	// =======================
	Controller.prototype.setView = function (locationHash) {
		var route = locationHash.split('/')[1];
		var page = route || '';
		this._updateFilterState(page);
	};

	// =======================
	// Show all todo items on load or rerender of "all" view
	// =======================
	Controller.prototype.showAll = function () {
		var self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};

	// =======================
	// Renders all active tasks for "active" view
	// =======================
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	// =======================
	// Renders all completed tasks for "completed" view
	// =======================
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	// =======================
	// Add new item to DOM and storage
	// @param title {string}, the todo item entered via input field
	// =======================
	Controller.prototype.addItem = function (title) {
		var self = this;

		// If there is nothing but white space, exit addItem
		if (title.trim() === '') {
			return;
		}
		// Add item to list and remove from input field
		self.model.create(title, function () {
			self.view.render('clearNewTodo');
			self._filter(true);
		});
	};

	// =======================
	// Triggers the item editing mode.
	// =======================
	Controller.prototype.editItem = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItem', {id: id, title: data[0].title});
		});
	};

	// =======================
	// While editing an existing todo item
	// @param id {number}, ID of edited item
	// @param title {string}, content of edited item
	// =======================
	Controller.prototype.editItemSave = function (id, title) {
		var self = this;

		// Remove any white space at start of "title"
		while (title[0] === " ") {
			title = title.slice(1);
		}
		// Remove any white space at end of "title"
		while (title[title.length-1] === " ") {
			title = title.slice(0, -1);
		}
		// If "title" contains any characters, update item
		if (title.length !== 0) {
			self.model.update(id, {title: title}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		// If all characters were deleted, remove item
		} else {
			self.removeItem(id);
		}
	};

	// =======================
	// Cancels the item editing mode.
	// =======================
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};

	// =======================
	// Removes item from DOM and storage via matching ID 
	// @param id {number}
	// =======================
	Controller.prototype.removeItem = function (id) {
		var self = this;
		var items;
		self.model.read(function(data) {
			items = data;
		});

		self.model.remove(id, function () {
			self.view.render('removeItem', id);
		});

		self._filter();
	};

	// =======================
	// Will remove all completed items from the DOM and storage.
	// =======================
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});

		self._filter();
	};

	// =======================
	// Update "completed" status of item
	// @param id {number}, ID of item
	// @param completed {object}, state of checkbox
	// @param silent {boolean|undefined}, prevent re-filtering the todo items
	// =======================
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		self.model.update(id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});

		if (!silent) {
			self._filter();
		}
	};

	// =======================
	// Will toggle ALL checkboxes' on/off state, and completeness of models.
	// Just pass in the event object.
	// =======================
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		self.model.read({ completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});
		self._filter();
	};

	// =======================
	// Updates the pieces of the page which change depending on the remaining
	// number of todos.
	// =======================
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});

			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};

	// =======================
	// Re-filters the todo items, based on the active route.
	// @param force {boolean|undefined}, forces a re-painting of todo items.
	// =======================
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

		// Update the elements on the page, which change with each completed todo
		this._updateCount();

		// If the last active route isn't "All", or we're switching routes, we
		// re-create the todo item elements, calling:
		//   this.show[All|Active|Completed]();
		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute]();
		}

		this._lastActiveRoute = activeRoute;
	};

	// =======================
	// Simply updates the filter nav's selected states
	// =======================
	Controller.prototype._updateFilterState = function (currentPage) {
		// Store a reference to the active route, allowing us to re-filter todo
		// items as they are marked complete or incomplete.
		this._activeRoute = currentPage;

		if (currentPage === '') {
			this._activeRoute = 'All';
		}

		this._filter();

		this.view.render('setFilter', currentPage);
	};
	
	// =======================
	// Export to window
	// =======================
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);


