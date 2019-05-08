/*global app, $on */
(function () {
	'use strict';

	// ================
	// Sets up a brand new Todo list.
	// @param name {string}, the name of the new to do list.
 	// ================
	function Todo(name) {
		this.storage = new app.Store(name);
		this.model = new app.Model(this.storage);
		this.template = new app.Template();
		this.view = new app.View(this.template);
		this.controller = new app.Controller(this.model, this.view);
	}

	// Create new Todo DB item from constructor
	var todo = new Todo('todos-vanillajs');

	// Define the view which runs on initial load
	function setView() {
		todo.controller.setView(document.location.hash);
	}
	$on(window, 'load', setView);
	$on(window, 'hashchange', setView);
})();


