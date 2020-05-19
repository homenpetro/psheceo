/* Droptab Component */

!function($) {
	"use strict";

	var trigger = "[data-trigger=dropTab]";
	var DropTab = function() {};

	DropTab.prototype = {

		constructor: DropTab,

		open: function(e) {
			var $this = $(this),
				$parent = $this.closest('.dropTab'),
				isActive;

			// Stop Event bubbling
			e.stopPropagation();

			// Is the flyout already open?
			isActive = $parent.hasClass('open');

			if( !isActive ) {

				// Hide other dropTabs
				clearDropTab();

				$parent.toggleClass('open');

				// Clone data and append to body, using this method because of IE7 z-index issues

				var flyout = "<div class='dropTabFlyout'></div>";
				var clonedData = $this.siblings('.dropTabMenu').html();
				var offset = $this.offset();

				$(flyout).appendTo('body').html(clonedData).css({
					'top' : (offset.top  + 22 ) + 'px',
					'left' : offset.left + 'px'
				});

			} else {
				clearDropTab();
			}

		}

	}


	// Clear out any active dropTabs
	function clearDropTab() {
		if( $('.dropTabFlyout').length > 0 ) {
			$('.dropTabFlyout').remove();
		}

		$(trigger).each(function() {
			$(this).parent().removeClass('open');
		});
	}

	// Bind DropTab Events
	$(document).on('click.droptab.data-api', clearDropTab)
			   .on('click.droptab.data-api', trigger, DropTab.prototype.open);

}(window.jQuery);