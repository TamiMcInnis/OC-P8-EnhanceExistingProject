/* global app, jasmine, describe, it, beforeEach, expect */

describe('controller', function () {
	'use strict';

	var subject, model, view;

	// ================
	// Initialize fake DB with todo array
	// @param todos {array-objects}, an array of todo objects
	// ================
	var setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {
			// todoCounts method will return total of each todo status
			var todoCounts = {
				// active shows length of uncompleted todos
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				// completed shows length of completed todos
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				// total shows length of all todos
				total: todos.length
			};

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	// ================
	// Called by view.method chosen below
	// @param event {string}, string of event passed from view.js viewCmd
	// @param handler {},  ????
	// @param parameter {object || string}, object: id of todo to match, string: title of new todo
	// ================
	var createViewStub = function () {
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	// Define access to view, controller, and model
	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

// ================================================================

	// ================
	// ADDED FUNCTION
	// ================
	it('should show entries on start-up', function () {
		// Define array of todo items
		var todo = [
			{id: 42, title: 'my first todo', completed: false}, 
			{id: 43, title: 'my second todo', completed: true}
		];

		// Initialize DB with new array
		setUpModel(todo);

		// Initialize view to show all todos on load
		subject.setView('');

		// Expect view to have called showEntries for entire array
		expect(view.render).toHaveBeenCalledWith('showEntries', todo);
	});
	// ================

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('#/');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		// ================
		// ADDED FUNCTION
		// ================
		it('should show active entries', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: false},
				{id: 44, title: 'my third todo', completed: true},
				{id: 45, title: 'my fourth todo', completed: true},
				{id: 46, title: 'my fifth todo', completed: true}
			];

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to show all active todos on load
			subject.setView('#/active');

			// Expect view to have called showEntries for array
			expect(view.render).toHaveBeenCalledWith('showEntries', todo);
			// Expect view to have set filter to active
			expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
			// Expect model to be read and retrieve todos that are active
			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));
			// Expect model NOT to have been read and retrieve todos that are complete
			expect(model.read).not.toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
		});
		// ================


		// ================
		// ADDED FUNCTION
		// ================
		it('should show completed entries', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: false},
				{id: 44, title: 'my third todo', completed: true},
				{id: 45, title: 'my fourth todo', completed: true},
				{id: 46, title: 'my fifth todo', completed: true}
			];

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to show all completed todos on load
			subject.setView('#/completed');

			// Expect view to have called showEntries for array
			expect(view.render).toHaveBeenCalledWith('showEntries', todo);
			// Expect view to ahve set filter to completed
			expect(view.render).toHaveBeenCalledWith('setFilter', 'completed');	
			// Expect model to be read and retrieve todos that are completed
			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			// Expect model NOT to have been read and retrieve todos that are active
			expect(model.read).not.toHaveBeenCalledWith({completed: false}, jasmine.any(Function));	
		});
		// ================

		it('should show the content block when todos exists', function () {
			setUpModel([{title: 'my todo', completed: true}]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
				visible: true
			});
		});

		it('should hide the content block when no todos exists', function () {
			setUpModel([]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
				visible: false
			});
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = {id: 42, title: 'my todo', completed: true};
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	// ================
	// ADDED FUNCTION
	// ================
	it('should highlight "All" filter by default', function () {
		// Define array of todo items
		var todo = [
			{id: 42, title: 'my first todo', completed: false}, 
			{id: 43, title: 'my second todo', completed: true}
		];

		// Initialize DB with new array
		setUpModel(todo);

		// Initialize view to show all todos on load
		subject.setView('');

		// Expect view to have set display to all
		expect(view.render).toHaveBeenCalledWith('setFilter', '');
	});
	// ================

	// ================
	// ADDED FUNCTION
	// ================
	it('should highlight "Active" filter when switching to active view', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: true}
			];

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to show all active todos on load
			subject.setView('#/active')

			// Expect view to have set display to active
			expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
	});
	// ================

	// ================
	// ADDED FUNCTION
	// ================
	it('should highlight "Completed" filter when switching to completed view', function () {
		// Define array of todo items
		var todo = [
			{id: 42, title: 'my first todo', completed: false}, 
			{id: 43, title: 'my second todo', completed: true}
		];

		// Initialize DB with new array
		setUpModel(todo);

		// Initialize view to show all completed todos on load
		subject.setView('#/completed');

		// Expect view to have set display to completed
		expect(view.render).toHaveBeenCalledWith('setFilter', 'completed');
	});
	// ================

	describe('toggle all', function () {

		// ================
		// ADDED FUNCTION
		// ================
		it('should toggle all todos to completed', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: false},
				{id: 44, title: 'my third todo', completed: true},
				{id: 45, title: 'my fourth todo', completed: true},
				{id: 46, title: 'my fifth todo', completed: true}
			];			

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to show all completed todos on load
			subject.setView('');

			// Trigger 'Toggle All' button to true
			view.trigger('toggleAll', {completed: true});

			// Expect view to have been set to show all todos
			expect(view.render).toHaveBeenCalledWith('setFilter', '');
			// Expect model to have updated todo 42 to completed
			expect(model.update).toHaveBeenCalledWith(42, {completed: true}, jasmine.any(Function));
			// Expect model to have updated todo 43 to completed
			expect(model.update).toHaveBeenCalledWith(43, {completed: true}, jasmine.any(Function));
		});	
		// ================

		// ================
		// ADDED FUNCTION
		// ================
		it('should toggle all todos to active', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: false},
				{id: 44, title: 'my third todo', completed: true},
				{id: 45, title: 'my fourth todo', completed: true},
				{id: 46, title: 'my fifth todo', completed: true}
			];			

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to show all completed todos on load
			subject.setView('');

			// Trigger 'Toggle All' button to true
			view.trigger('toggleAll', {completed: false});

			// Expect view to have been set to show all todos
			expect(view.render).toHaveBeenCalledWith('setFilter', '');
			// Expect model to have updated todo 44 to active
			expect(model.update).toHaveBeenCalledWith(44, {completed: false}, jasmine.any(Function));
			// Expect model to have updated todo 45 to active
			expect(model.update).toHaveBeenCalledWith(45, {completed: false}, jasmine.any(Function));
			// Expect model to have updated todo 46 to active
			expect(model.update).toHaveBeenCalledWith(46, {completed: false}, jasmine.any(Function));
		});	
		// ================

		// ================
		// ADDED FUNCTION
		// ================
		it('should update the view', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: false},
				{id: 44, title: 'my third todo', completed: true},
			];			

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to show all completed todos on load
			subject.setView('');

			// Trigger 'toggleAll' function and set render view to match
			view.render('toggleAll', {checked: true});
			view.trigger('toggleAll', {completed: true});

			// Expect view to have been set with todo 42 completed
			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: true});
			// Expect view to have been set with todo 43 completed
			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 43, completed: true});	
			// Expect toggle all icon to have been set to true and display accordingly
			expect(view.render).toHaveBeenCalledWith('toggleAll', {checked: true});
		});
	});
	// ================

	describe('new todo', function () {
		// ================
		// ADDED FUNCTION
		// ================
		it('should add a new todo to the model', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: false}
			];

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to all
			subject.setView('');

			// Create new todo
			view.trigger('newTodo', 'my third todo');

			// Expect new todo to have been created
			expect(model.create).toHaveBeenCalledWith('my third todo', jasmine.any(Function));
		});
		// ================

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {

		// ================
		// ADDED FUNCTION
		// ================
		it('should remove an entry from the model', function () {
			// Define array of todo items
			var todo = [
				{id: 42, title: 'my first todo', completed: false}, 
				{id: 43, title: 'my second todo', completed: true}
			];

			// Initialize DB with new array
			setUpModel(todo);

			// Initialize view to all
			subject.setView('');

			// Trigger the "itemRemove" on item 42
			view.trigger('itemRemove', {id: 42});

			// Expect model to have removed item 42
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});
		// ================

		it('should remove an entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 21, completed: true});

			expect(model.update).toHaveBeenCalledWith(21, {completed: true}, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 42, completed: false});

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: false});
		});
	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItem', {id: 21, title: 'my todo'});
		});

		it('should leave edit mode on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'new title'});
		});

		it('should persist the changes on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(model.update).toHaveBeenCalledWith(21, {title: 'new title'}, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'my todo'});
		});

		it('should not persist the changes on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
