/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	// ================
    // View that abstracts away the browser's DOM completely.
    // It has two simple entry points:
    //
    //   - bind(eventName, handler)
    //     Takes a todo application event and registers the handler
    //   - render(command, parameterObject)
    //     Renders the given command with the options
	// ================
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	// ================
	// Find currently selected filter and add the outline class '.selected' to it
	// @param currentPage {string}, name of filter to apply outlne to ('' || 'active' || 'completed')
	// ================
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};
	// ================

	// ================
	// Toggle todo items complete status on or off
	// @param id {integer}, the id of the clicked todo item
	// @param completed {boolean}, the new status of the todo, either true or false
	// ================
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};

	// ================
	// Allow user to edit an existing todo item
	// @param id {integer}, the id of the clicked todo item
	// @param title {string}, the value of the todo title in the input field
	// ================
	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	// ================
	// Submit the completed changes to existing todo item
	// @param id {integer}, the id of the clicked todo item
	// @param title {string}, the value of the todo title in the input field on submit
	// ================
	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	// =======================
	// Calling View.render will execute the viewCommands method with parameters
	// @param viewCmd {string}, name of method to call (options below)
	// @param parameter {object}, the item(s) to perform the method on
	// =======================
	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			// Shows all entries matching the status activated (all, active, complete)
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			// Removes specified todo from the view
			removeItem: function () {
				self._removeItem(parameter);
			},
			// Updates the "items left" value of active todos when total changes
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			// Removes completed todos from list
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			// Sets display of main todo area to match display value of footer, based on todos status
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			// User clicks arrow to mark all todos as complete at once
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			// Filters todos visible to match status activated (all, active, complete)
			setFilter: function () {
				self._setFilter(parameter);
			},
			// Removes text in input field after new todo is submitted
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			// Changes "completed" status of matched todo to true or false when user checks item
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			// Triggers when user double clicks existing todo
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			// Triggers when user saves edited todo
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};
		viewCommands[viewCmd]();
	};


	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};


	// =======================
	// Binds reference of "this" (view.js) for use inside of events in controller.js
	// Is called via the controller.js on initial load for each possible event
	// @param event {string}, name of event to match for binding
	// @param handler {function}, the function to bind "this" within
	// =======================
	View.prototype.bind = function (event, handler) {
		var self = this;
		if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
