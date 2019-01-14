
jQuery(document).ready(function() {
	/**
	 * Get options
	 */
	var tui_options = (function() {
		var json = null;
		$.ajax({
			'async'    : false,
			'global'   : false,
			'url'      : '/storage/options.json',
			'dataType' : 'json',
			'success'  : function(data) { json = data; }
		});
		return json;
	})();

	/**
	 * Get items
	 */
	var items = (function() {
		var json = null;
		$.ajax({
			'async'    : false,
			'global'   : false,
			'url'      : '/storage/items.json',
			'dataType' : 'json',
			'success'  : function(data) { json = data; }
		});
		return json;
	})();

	/**
	 * header - Introductory content.
	 */
	var header = ''
		+ '<div>  $$&#92;               $$&#92; <br>  $$ |              &#92;__|<br>$$$$$$&#92;   $$&#92;   $$&#92; $$&#92; <br>&#92;_$$  _|  $$ |  $$ |$$ |<br>  $$ |    $$ |  $$ |$$ |<br>  $$ |$$&#92; $$ |  $$ |$$ |<br>  &#92;$$$$  |&#92;$$$$$$  |$$ |<br>   &#92;____/  &#92;______/ &#92;__|</div>'
		+ '<header>'
		+ '<h1>' + tui_options.name + '</h1>&#160;[v.' + tui_options.version + ']'
		+ '<p>' + tui_options.description + '</p>'
		+ '</header>'
		+ '<aside>Use "help" to display all commands.</aside>'
		+ '<footer>Copyright (с) ' + tui_options.copyright + ' <a href="mailto:' + tui_options.email + '" target="_blank">' + tui_options.email + '</a></footer>';

	/**
	 * dispatch - Stores command name and action to be taken when user enters a command.
	 */
	var dispatch = {};

	/**
	 * history - Mantains the record of called commands.
	 */
	var history  = [];

	/**
	 * cmd_opts - Options of current command.
	 */
	var cmd_opts = {
		cmd_name  : null, // If set, edits the subroutine name
		cmd_ps    : null, // The ps value
		cmd_in    : null, // The command string
		cmd_out   : null, // The output of the command.
		cmd_quiet : null, // Set to true when you don't want cmd_in to be recorded
		cmd_token : null, // Set to a unique sting for secure transactions
		cmd_query : null, // Acumulates a string for a subroutine to use
	};

	/**
	 * Command - Accepts a str as command name and a function, object or string as dispatch method.
	 */
	$.command = function(command, cmd_desc, cmd_usage, dispatch_method) {
		var ret = false;
		if (typeof dispatch_method === 'string' || typeof dispatch_method === 'object' || typeof dispatch_method === 'function') {
			dispatch[command] = {
				desc    : cmd_desc,
				usage   : cmd_usage,
				type_of : dispatch_method
			};
			ret = true;
		}
		return ret;
	}; // Command

	/**
	 * Commands - Registers the native Terminal commands.
	 */
	var commands = function() {

		/*
		 * Native commands:
		 * help
		 * history
		 * clear
		 * cowsay
		 */

		// help
		$.command(
			'help',
			'Displays a list of useful information.',
			'help [ [-a | --all] | [command] ]',
			function(tokens) {
				var i, content = '';
				if (typeof tokens[1] === 'string' && tokens[1].length > 0) {
					var cmd_to_show = $.trim(tokens[1]);
					if (cmd_to_show == '-a' || cmd_to_show == '--all') {
						content = '<article class="cmd_entry">Available commands are:</br><ul>'
						for (i in dispatch) {
							content += '<li><p><b>' + i + '</b> - ' + dispatch[i].desc; + '<br>' + 'Usage: ' + dispatch[i].usage + '</p></li>';
						}
						content += '</ul></artile>';
					} else if (typeof dispatch[cmd_to_show] !== 'undefined') {
						content  = '<article><b>' + cmd_to_show + '</b> - ' + dispatch[cmd_to_show].desc + '<br>';
						content += 'Usage: ' + dispatch[cmd_to_show].usage + '</srtile>';
					} else {
						content = 'help:</br>The "' + cmd_to_show + '" option does not exist.';
					}
				} else {
					content  = '<article class="cmd_entry"><p>Use "help [comand name]" to display specific info about a command.</br>Available commands are:</p>';
					content += '<ul>';
					for (i in dispatch) {
						content += '<li>' + i + '</li>';
					}
					content += '</ul></article>';
				}
				return { out : content };
			}
		);

		// history
		$.command(
			'history',
			'Shows list of typed in commands.',
			'history [no options]',
			function() {
				var content = '';
				if (history && history.length > 0) {
					content = '<article class="cmd_entry"><ul>';
					for(var i in history) {
						var tmp = history[i];
						content += '<li>' + tmp + '</li>';
					}
					content += '</ul></article>';
				}
				return { out : content };
			}
		);

		// clear
		$.command(
			'clear',
			'Cleans the screen leaving a new command prompt ready.',
			'clear [no options]',
			function() {
				$('.content').html('');
				return {
					out   : header,
					quiet : 'clear'
				};
			}
		);

		// cowsay
		$.command(
			'cowsay',
			'What does the cow say?',
			'cowsay [no options]',
			function() {
				var cowsay = ['  GO COWS!  ', ' Glück auf  ', '   Howdy   ', '   Aloha   ', 'Hello World'],
					random = Math.floor(Math.random() * cowsay.length);
				var content = '<div class="cmd_entry"><p>  ____________<br>< ' + cowsay[random] + ' ><br>  ------------<br>          &#92;   ^__^<br>           &#92;  (oo)&#92;_______<br>              (__)&#92;       )&#92;/&#92;<br>                  ||----w |<br>                  ||     ||</p></div>';
				return { out : content };
			}
		);

		/*
		 * Custom commands:
		 * search
		 * sites
		 * games
		 */

		// search
		$.command(
			'search',
			'Shows list of search.',
			'search [keyword]',
			function(tokens) {
				var content = '';
				if (typeof tokens[1] === 'string' && tokens[1].length > 0) {
					var result = false;
					// check keyword
					for (var i in items.item) {
						for (var j in items.item[i].tag) {
							if (items.item[i].tag[j] == tokens[1]) {
								result = true;
							}
						}
					}
					// if keyword exist
					if (result == true) {
						for (var i in items.item) {
							for (var j in items.item[i].tag) {
								if (items.item[i].tag[j] == tokens[1]) {
									content += '<article class="cmd_entry"><h3>' + items.item[i].name + '</h3><p>' + items.item[i].description + '<br><a href="' + items.item[i].link + '" target="_blank">' + items.item[i].link + '</a></p></article>';
								}
							}
						}
					} else {
						content = '<div class="cmd_entry" style="color:#f00">No result.</div>';
					}
				} else {
					content = '<div class="cmd_entry">Enter the [keyword] after "search".</div>';
				}
				return { out : content };
			}
		);

		// sites
		$.command(
			'sites',
			'Shows list of sites.',
			'sites [no options]',
			function() {
				var content = '';
				for (var i in items.item) {
					for (var j in items.item[i].tag) {
						if (items.item[i].tag[j] == 'site') {
							content += '<article class="cmd_entry"><h3>' + items.item[i].name + '</h3><p>' + items.item[i].description + '<br><a href="' + items.item[i].link + '" target="_blank">' + items.item[i].link + '</a></p></article>';
						}
					}
				}
				return { out : content };
			}
		);

		// games
		$.command(
			'games',
			'Shows list of games.',
			'games [no options]',
			function() {
				var content = '';
				for (var i in items.item) {
					for (var j in items.item[i].tag) {
						if (items.item[i].tag[j] == 'game') {
							content += '<article class="cmd_entry"><h3>' + items.item[i].name + '</h3><p>' + items.item[i].description + '<br><a href="' + items.item[i].link + '" target="_blank">' + items.item[i].link + '</a></p></article>';
						}
					}
				}
				return { out : content };
			}
		);
	}; // Commands

	/**
	 * terminal - Sets up the terminal on the jQuery object that represents a group of HTML nodes
	 */
	$.fn.terminal = function() {

		// jQuery Plugin
		return this.each(function() {

			// Register commands
			commands();

			var element   = $(this),
				current   = null,
				cdispatch = null;

			element.html('').append(
				  '<div class="content">' + header + '</div>'
				+ '<div class="prompt">'
				+ '<span class="ps">&#62;&#160;</span>'
				+ '<form accept-charset="' + tui_options.charset + '" enctype="' + tui_options.enctype + '">'
				+ '<input type="text" autocomplete="off" autofocus>'
				+ '</form>'
				+ '</div>'
			);

			// Representing prompt, form, input and content section in the terminal
			var input   = element.find('input[type=text]'),
				content = element.find('.content');

			// Set cursor on the prompt (autofocus)
			window.onclick = function() {
				scroll_to_bottom();
				input.focus();
			};

			/*
			 * update_content - Updates the content section. Must be the last function called.
			 */
			var update_content = function(p, command, data) {
				if (cmd_opts.cmd_in  !== null) command = cmd_opts.cmd_in;
				if (cmd_opts.cmd_out !== null) data    = cmd_opts.cmd_out;
				if (cmd_opts.cmd_quiet == 'clear') {
					content.html('');
					p = '';
				} else if (cmd_opts.cmd_quiet == 'blank') {
					p = '<h2 class="cmd_in">' + p + '</h2>';
				} else if (cmd_opts.cmd_quiet == 'output') {
					p = '';
				} else {
					p = '<h2 class="cmd_in">' + p + command + '</h2>';
				}
				content.append('<section class="cmd_out">' + p + data + '</section>');
			};

			/*
			 * get_prompt - Get the current prompt
			 */
			var get_prompt = function() {
				var ps = (cdispatch) ? cdispatch.ps : '';
				return (cmd_opts.cmd_ps !== null) ? cmd_opts.cmd_ps : ps;
			};

			/*
			 * cmd_callback - Does requested type action, or executes top level function.
			 */
			var cmd_callback = function(value, data) {
				data = data || '';
				var cbk = {
					ps     : get_prompt(),
					output : ''
				};

				// Check response for overrides
				cmd_opts.cmd_ps = (typeof data.ps    !== 'undefined') ? set_prompt(data.ps) : null;
							   if (typeof data.in    !== 'undefined') cmd_opts.cmd_in = data.in;
							   if (typeof data.out   !== 'undefined') cbk.output = cmd_opts.cmd_out = data.out;
							   if (typeof data.quiet !== 'undefined') cmd_opts.cmd_quiet = data.quiet;
							   if (typeof data.token !== 'undefined') cmd_opts.cmd_token = data.token;
							   if (typeof data.query !== 'undefined') cmd_opts.cmd_query = data.query;

				// Update content accordingly
				update_content(cbk.ps, value, cbk.output);
			};

			/*
			 * cmd_dispatch_js - Executes JS function
			 */
			var cmd_dispatch_js = function(js_func, tokens, value) {
				return cmd_callback(value, js_func(tokens));
			};

			/*
			 * cmd_execute - Called after submit(). Separates request types.
			 */
			var cmd_execute = function(key, value, tokens, ajax_url) {
				if (key == '') {
					update_content(get_prompt(), value, ''); // empty command
				} else if (cdispatch !== null) {
					cmd_custom_dispatch(key, value, tokens); // Custom Dispatch
				} else if (typeof dispatch[key] === 'undefined') {
					update_content(get_prompt(), value, tui_options.not_found.replace('CMD', tokens[0])); // Command not found
				} else if (typeof dispatch[key].type_of === 'object') {
					cmd_custom_dispatch(key, value, tokens); // Start hook for custom dispatch. (AJAX to different URLs)
				} else if (typeof dispatch[key].type_of === 'string') {
					cmd_do_ajax( key, value, ajax_url); // use AJAX method
				} else if (typeof dispatch[key].type_of === 'function') {
					cmd_dispatch_js(dispatch[key].type_of, tokens, value); // use javascript
				} else {
					cmd_do_ajax(key, value, tui_options.url); // typeof dispatch[key].type_of === 'boolean' || 'symbol' || 'number'
				}
			};

			/*
			 * scroll_to_bottom - This interval is necessary due to the dynamic content div.
			 */
			var scroll_to_bottom = function() {
				$('html').animate({ scrollTop: $(document).height() }, 'slow');
			};

			/*
			 * Submit
			 */
			input.submit(function(e) {
				e.preventDefault();

				// Get value & if first character is whitespace don't save.
				var value = input.val().toLowerCase(),
					save_to_history = (value.charAt(0) == ' ') ? false : true;

				// Encode value by putting it in a fake container and fishing it out.
				value = $.trim($('<div/>').text(value).html());

				// Remove saved command options
				for (opt in cmd_opts) {
					if (opt !== 'cmd_name' && opt !== 'cmd_ps' && opt !== 'cmd_query' && opt !== 'cmd_token') {
						cmd_opts[opt] = null;
					}
				};

				// Cache input (without query)
				cmd_opts.cmd_in = value;

				// Concatenate if query is set
				if (cmd_opts.cmd_query !== null) value = cmd_opts.cmd_query + value;

				var tokens = value.split(/\s+/),
					key = tokens[0];

				// Add to history
				if (history && (typeof dispatch[key] !== 'undefined' || cdispatch) && save_to_history && value.length && cmd_opts.cmd_quiet === null) {
					if (history.length > 512) {
						history.shift();
					}
					
					// Decode before inserting
					history.push($.trim($('<div/>').html(value).text()));
				}

				// Play ball...
				cmd_execute(key, value, tokens);

				// Cleanup and Scroll
				input.val('');
				input.focus();
				scroll_to_bottom();
			}); // Submit

			/*
			 * Keys - Add event handlers to the input field
			 */
			input.keydown(function(e) {
				var keycode = e.keyCode;
				switch(keycode) {

					// Command Completion Tab
					case 9 :
						e.preventDefault();
						var commands = [],
							current_value = $.trim(input.val());
						if (current_value.match(/^[^\s]{0,}$/)) {
							for (i in dispatch) {
								if (current_value == '') {
									commands.push(i);
								} else if (i.indexOf(current_value) == 0) {
									commands.push(i);
								}
							}
							if (commands.length > 1) {
								update_content(
									get_prompt(),
									current_value,
									'<ul><li>' + commands.join('</li><li>') + '</li></ul>'
								);
							} else if (commands.length == 1) {
								input.val(commands.pop() + ' ');
							}
						}
						scroll_to_bottom();
					break;

					// History Up
					case 38 :
						e.preventDefault();
						if (history) {
							current = (current === null) ? history.length - 1 : (current == 0) ? history.length - 1 : current - 1;
							input.val(history[current]);
						}
					break;

					// History Down
					case 40 :
						e.preventDefault();
						if (history) {
							if (current === null || current == (history.length - 1 )) {
								input.val('');
								break;
							}
							current++;
							input.val(history[current]);
						}
					break;

					// Scroll down on Enter
					case 13 :
						e.preventDefault();
						input.submit();
						input.focus();
						scroll_to_bottom();
					break;
				}
			}); // Keys
		});
	}; // terminal

	$('#terminal').terminal();

}); // jQuery
