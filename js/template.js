/*jshint laxbreak:true */
(function (window) {
	'use strict';

	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'`': '&#x60;'
	};

	var escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	var reUnescapedHtml = /[&<>"'`]/g;
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
		return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, escapeHtmlChar)
			: string;
	};

	// =======================
	// Sets up defaults for all the Template methods such as a default template
	//
	// @constructor
	// =======================
	function Template() {
		this.defaultTemplate
		=	'<li data-id="{{id}}" class="{{completed}}">'
		+		'<div class="view">'
		+			'<input class="toggle" type="checkbox" {{checked}}>'
		+			'<label>{{title}}</label>'
		+			'<button class="destroy"></button>'
		+		'</div>'
		+	'</li>';
	}

	// =======================
	// Creates an <li> HTML string and returns it for placement in your app.
	//
	// @param data {object}, the array of todos submitted to template
	// @returns {string} HTML String of an <li> element
	// =======================
	Template.prototype.show = function (data) {
		var i, l;
		var view = '';

		// Run through submitted todo array and create template for each item
		for (i = 0, l = data.length; i < l; i++) {
			var template = this.defaultTemplate;
			var completed = '';
			var checked = '';

			// Define checkbox as "checked" and add style of "completed"
			if (data[i].completed) {
				completed = 'completed';
				checked = 'checked';
			}

			// Insert todo details into template
			template = template.replace('{{id}}', data[i].id);
			template = template.replace('{{title}}', escape(data[i].title));
			template = template.replace('{{completed}}', completed);
			template = template.replace('{{checked}}', checked);

			view = view + template;
		}

		// Return completed todo template for view
		return view;
	};

	// =======================
	// Displays a counter of how many todos are left to complete
	//
	// @param activeTodos {number}, the number of active todos.
	// @returns {string} String containing the count
	// =======================
	Template.prototype.itemCounter = function (activeTodos) {
		// Define if an 's' is needed for plural todo number
		var plural = activeTodos === 1 ? '' : 's';

		return '<strong>' + activeTodos + '</strong> item' + plural + ' left';
	};

	// =======================
	// Defines whether to display "clear completed" depending on todo count
	//
	// @param completedTodos {[type]}, the number of completed todos.
	// @returns {string} String containing the count
	// =======================
	Template.prototype.clearCompletedButton = function (completedTodos) {
		if (completedTodos > 0) {
			return 'Clear completed';
		} else {
			return '';
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
