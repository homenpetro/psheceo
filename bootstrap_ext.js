/* =============================================================
 * bootstrap-better-typeahead.js v1.0.0 by Philipp Nolte
 * https://github.com/ptnplanet/Bootstrap-Better-Typeahead
 * =============================================================
 * This plugin makes use of twitter bootstrap typeahead
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 *
 * Bootstrap is licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 * ==============================================================
 * **************************************************************
 * NOTICE: This file is also to be used for extending or
 * customizing bootstrap javascript functionality. DO NOT modify
 * bootstrap.js!!
 * ===============================================================
 * Changelog:
 *
 * ACCT-5485 - fire lookup of typeahead on focus of the field when
 * minLength = 0. Remove highlighting and many other processes
 * in the case of minLength = 0 to speed up the load.
 * 
 * ACCT-5545 - IE bug where clicking on the scrollbar if the 
 * typeahead is overflowed hides the suggestions. Added event,
 * extended listener.
 *
 */

!function($) {

	"use strict";

	/**
	 * The better typeahead plugin will extend the bootstrap typeahead plugin and provide the abbility to set the
	 * maxLength option to zero. The tab keyup event handler had to be moved to the keydown event handler, so that
	 * the full list of available items is shown on tab-focus and the original behaviour is preserved as best as
	 * possible.
	 *
	 * @type {object}
	 */
	var BetterTypeahead = {
		lookup: function(event) {
			var items;

			// Now supports empty queries (eg. with a length of 0).
			this.query = this.$element.val() || '';

			if (this.query === '') {
				var showAll = true;
			}
		   
			if (this.query.length < this.options.minLength) {
				return this.shown ? this.hide() : this;
			}

			if (showAll) {
				items = this.source();
				
				return items ? this.processAll(items) : this;
			} else {
				items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
				return items ? this.process(items) : this;
			}

		}

		, process: function (items) {
			var that = this;

			items = $.grep(items, function (item) {
				return that.matcher(item);
			});

			items = this.sorter(items);

			if (!items.length) {
				return this.shown ? this.hide() : this;
			}

			if (this.query.length) {
				items = items.slice(0, this.options.items);
			}

			return this.render(items).show();
		}

		, processAll: function(items) { //skip a lot of processing if the search is empty
			var that = this;

			return this.render(items, true).show();
		}

		, render: function (items, showAll) {
			var that = this

			if (!showAll) { //if we have a filter applied
				items = $(items).map(function (i, item) {
					i = $(that.options.item).attr('data-value', item);
					i.find('a').html(that.highlighter(item));
					return i[0];
				});

				if (this.query.length > 0) {
					items.first().addClass('active');
				}
			} else { //if we are showing everything
				items = $(items).map(function (i, item) {
					i = $(that.options.item).attr('data-value', item);
					i.find('a').html(item);
					return i[0];
				});
			}

			this.$menu.html(items);
			return this;
		}

		, keydown: function (e) {
			this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27]);

			// Added tab handler. Tabbing out of the input (thus blurring).
			if (e.keyCode === 9) { // tab
				if (!this.shown) return;
				this.select();
			} else {
				this.move(e);
			}
		}

		, keyup: function (e) {
			switch(e.keyCode) {
				case 40: // down arrow
				case 38: // up arrow
				case 16: // shift
				case 17: // ctrl
				case 18: // alt
					break;

				// Moved tab handler to keydown.
				case 13: // enter
					if (!this.shown) return;
					this.select();
					break;

				case 27: // escape;
					if (!this.shown) return;
					this.hide();
					break;

				default:
					this.lookup();
			}

			e.stopPropagation();
			e.preventDefault();
		}

		, focus: function(e) {
			this.focused = true;

			if (!this.mousedover) {
				this.lookup(e);
			}
		}

		// TA-82 - added the below events to expose hover event
		, next: function (event) {
		    var active = this.$menu.find('.active').removeClass('active')
		        , next = active.next();

		    if (!next.length) {
		    	next = $(this.$menu.find('li')[0]);
		    }

		    next.addClass('active');
		    this.hover( next ); // TA-82 - default behavior except for this
	    }

	  	, prev: function (event) {
	      	var active = this.$menu.find('.active').removeClass('active')
	        	, prev = active.prev();

	      	if (!prev.length) {
	        	prev = this.$menu.find('li').last();
	      	}

	      	prev.addClass('active');
	      	this.hover( prev ); // TA-82 - default behavior except for this
	    }

	    ,  mouseenter: function (e) {
		    this.mousedover = true;
		    this.$menu.find('.active').removeClass('active');
		    $(e.currentTarget).addClass('active');

		    this.hover( $(e.currentTarget) ); // TA-82 - default behavior except for this
		}

	    , hover: function(hoveredItem) { // TA-82 - exposes hover to options
	    	if ( this.options.hover ) {
	    		this.options.hover( hoveredItem );
	    	}
	    }
	};

	$.extend($.fn.typeahead.Constructor.prototype, BetterTypeahead);

}(window.jQuery);


/*
 * Project: Bootstrap Hover Dropdown
 * Author: Cameron Spear
 * Contributors: Mattia Larentis
 *
 * Dependencies: Bootstrap's Dropdown plugin, jQuery
 *
 * A simple plugin to enable Bootstrap dropdowns to active on hover and provide a nice user experience.
 *
 * License: MIT
 *
 * http://cameronspear.com/blog/bootstrap-dropdown-on-hover-plugin/
 */
;(function($, window, undefined) {
	// don't do anything if touch is supported
	// (plugin causes some issues on mobile)
	if('ontouchstart' in document) return;

	// outside the scope of the jQuery plugin to
	// keep track of all dropdowns
	var $allDropdowns = $();

	// if instantlyCloseOthers is true, then it will instantly
	// shut other nav items when a new one is hovered over
	$.fn.dropdownHover = function(options) {

		// the element we really care about
		// is the dropdown-toggle's parent
		$allDropdowns = $allDropdowns.add(this.parent());

		return this.each(function() {
			var $this = $(this),
				$parent = $this.parent(),
				defaults = {
					delay: 500,
					instantlyCloseOthers: true
				},
				data = {
					delay: $(this).data('delay'),
					instantlyCloseOthers: $(this).data('close-others')
				},
				settings = $.extend(true, {}, defaults, options, data),
				timeout;

			$parent.hover(function(event) {
				// so a neighbor can't open the dropdown
				if(!$parent.hasClass('open') && !$this.is(event.target)) {
					return true;
				}

				if(settings.instantlyCloseOthers === true)
					$allDropdowns.removeClass('open');

				window.clearTimeout(timeout);
				$parent.addClass('open');
				$parent.trigger($.Event('show.bs.dropdown'));
			}, function() {
				timeout = window.setTimeout(function() {
					$parent.removeClass('open');
					$parent.trigger('hide.bs.dropdown');
				}, settings.delay);
			});

			// this helps with button groups!
			$this.hover(function() {
				if(settings.instantlyCloseOthers === true)
					$allDropdowns.removeClass('open');

				window.clearTimeout(timeout);
				$parent.addClass('open');
				$parent.trigger($.Event('show.bs.dropdown'));
			});

			// handle submenus
			$parent.find('.dropdown-submenu').each(function(){
				var $this = $(this);
				var subTimeout;
				$this.hover(function() {
					window.clearTimeout(subTimeout);
					$this.children('.dropdown-menu').show();
					// always close submenu siblings instantly
					$this.siblings().children('.dropdown-menu').hide();
				}, function() {
					var $submenu = $this.children('.dropdown-menu');
					subTimeout = window.setTimeout(function() {
						$submenu.hide();
					}, settings.delay);
				});
			});
		});
	};

	$(document).ready(function() {
		// apply dropdownHover to all elements with the data-hover="dropdown" attribute
		$('[data-hover="dropdown"]').dropdownHover();
	});
})(jQuery, this);