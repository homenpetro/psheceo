(function($){
/*
* name - gRotator
* desc - functionality in the style of a jquery plugin to intialize the
* ui element of a feature rotator or slideshow
* author - Patrick Szczypinski, Front End Development
*
* available options documented below, but to make this thing work, here's an example:
*
* $('#rotatorContainerID').gRotator({'slideTime':3000, 'rotationSpeed':500, 'autoplay':false });
*
* that will initialize a rotator on slides contained in the div with an id 'rotatorContainerID'
* with a slide duration of 3 seconds, a fadein/out speed of half a second and will not play on load.
*/

	$.fn.gRotator = function(options){

		/* Let us set some defaults */
		var settings = $.extend({
			'slideTime' : 3500, //initial slide duration of 3.5 seconds. Option takes an integer
			'rotationSpeed' : 1000, //one second animation. Option takes an integer
			'autoplay' : true, //autoplays by default. Option takes a boolean
			'tabbed' : false, //setup the carousel for larger tab layout
			'rotatorNav' : true //navigation displays by default. Option takes a boolean
		}, options), //and extend this with custom options if you need to

			//some more vars
			el = this,
			RotatedEls = [],
			RotatedElsCount = 0,
			i = 0,
			SlideTimersArray = [],
			thisNav = '';

		/* Build an array of elements to be rotated, get some important info about them, and store it for manipulation later */
		el.find('.pane').each(function(i){
			RotatedEls.push($(this));
			$(this).data('position', i+1);
			if (i === 0) {
				$(this).data('currentSlide', true);
			}
		});

		//just how many elements are we rotating here?
		RotatedElsCount = RotatedEls.length;

		//finally, initialize ze carouselz!
		gCarouselInit(el);

		//initialization functionality if we need it. bind some stuff too in here!
		function gCarouselInit(container) {

			if (settings.tabbed){
				$('#slideShow').addClass('tabbed');
			}

			//check to make sure we're not already initialized
			if (!el.data('gRotatorInitialized')) {
				//build out the nav if the option says to do so and there is more than one slide
				if (settings.rotatorNav && RotatedElsCount > 0) {
					gCarouselBuildNav(el, RotatedElsCount);
				}

				//play the carousel if autoplay is set to true otherwise set the data to pause and don't play it
				if (settings.autoplay) {
					gCarouselPlay();
				} else {
					container.data('paused', true);
				}

				//bind event listeners for hover-pause effect
				$(container).on('mouseenter.gCarousel', function(){
					gCarouselPause();
				});

				$(container).on('mouseleave.gCarousel', function(){
					if (!container.data('paused')) {
						gCarouselPlay();
					}
				});

				el.data('gRotatorInitialized', true);
			}

		}

		//this rotates the slide and has an option for steps if we think we need to jump at all
		//optional parameter for which slide we're going to called 'slide'. This is what happens when you click on the nav.
		function gCarouselRotate(slide) {
			var currentslide = '',
				nextslide = '',
				nextSlideIndex = 0,
				nextNav = '',
				i = 0,
				navClicked = false;

			if (typeof slide !== 'undefined') {
				navClicked = true;
			}

			//get the current and next slide to animate them
			for (i; i < RotatedElsCount; i++) {
				if (RotatedEls[i].data('currentSlide')) {
					//set the current slide if the data attribute is set to currentSlide true
					currentslide = RotatedEls[i];
					
					//set the next slide to the next one in the list, unless the current one is the last one or we've chosen one to jump to.
					if (!navClicked) {
						if (i === RotatedElsCount - 1) {
							nextSlideIndex = 0;
						} else {
							nextSlideIndex = i + 1;
						}
					} else {
						nextSlideIndex = slide - 1;
					}

					break;
				}

			}

			//assign the next slide
			nextslide = RotatedEls[nextSlideIndex];

			//adjust the data on the curent and next slides and then animate them
			//Future Enhancement: adjust this to change the animation based on options, should that be desired.
			if (!navClicked) {
				currentslide.data('currentSlide', false).fadeOut(settings.rotationSpeed);
				nextslide.data('currentSlide', true).fadeIn(settings.rotationSpeed);
				gCarouselPlay();
			} else {
				currentslide.data('currentSlide', false).hide();
				nextslide.data('currentSlide', true).show();
			}

			if (settings.rotatorNav && RotatedElsCount > 0) {
				advanceNav(nextSlideIndex);
			}

		}

		//function to make the nav visually advance, that is if there is a nav.
		function advanceNav(index) {
			var navEls = el.find('.gRotatorNav .gRotatorNavTrigger');
			
			navEls.removeClass('activeNav');

			$.each(navEls, function(i){
				if (i === index) {
					$(this).addClass('activeNav');
				}
			});
		}

		//this is the command to set a timeout and play the rotator.
		//'playClicked' parameter is an optional callback that assigns data to the container that lets the plugin know that we clicked play.
		function gCarouselPlay(playClicked) {
			gCarouselPause(); //kill all rotator timeouts. Must pause before we can play. weird, right?
			SlideTimersArray.push( setTimeout(function(){ gCarouselRotate(); }, settings.slideTime));
		}

		//this pauses the rotator and may be temporary. Basically kills all rotator timeouts
		//'pauseClicked' parameter is an optional callback that assigns data to the container that lets the plugin know that we clicked pause so that we don't accidentally play it later.
		function gCarouselPause(pauseClicked) {
			var i = 0,
				timersNo = SlideTimersArray.length;

			//stop the rotator by killing all the timeouts set in the play function
			for (i; i < timersNo; i++) {
				clearTimeout(SlideTimersArray[i]);
			//	console.log('cleared a timeout');

				if (i === timersNo - 1) {
					SlideTimersArray = [];
				}
			}
		}

		//pause or play the carousel depending on 
		function gCarouselPlayPause(button) {
			if (el.data('paused')) {
				el.data('paused', false);
				//change the button text and title
				button.html('ll')
					  .attr('title', 'pause slideshow')
					  .toggleClass('activeNav');
				//play the slideshow
				gCarouselPlay();
			} else {
				el.data('paused', true);
				//change the button text and title
				button.html('&gt;')
					  .attr('title', 'play slideshow')
					  .toggleClass('activeNav');
			}

		}

		function findTabTitle(index){
			return $(container).find('.pane'+index).data('slide-tab-title');
		}

		function gCarouselBuildNav(container, RotatedElsCount) {
			/* Build out the navigational elements and make them hot */

			var navHTML = '<ul class="gRotatorNav' + (settings.tabbed ? ' gRotatorTabNav' : '') +'">',
				i = 0,
				thisNav = '',
				playPause = '';
			if (settings.tabbed) {
				for (i; i < RotatedElsCount; i ++) {
					if (i === 0) {
						navHTML += '<li data-slide-ref="'+(i+1)+'" class=\"gRotatorNavTrigger activeNav\"><div class="tabContent">' + findTabTitle(i) + '</div></li>';
					} else {
						navHTML += '<li data-slide-ref="'+(i+1)+'" class=\"gRotatorNavTrigger\"><div class="tabContent">' + findTabTitle(i) + '</div></li>';
					}
				}
			}else{
				for (i; i < RotatedElsCount; i ++) {
					//build out a list item for each of the panes.
					//if it's the first one, on init give it an active class
					if (i === 0) {
						navHTML += '<li data-slide-ref="'+(i+1)+'" class=\"gRotatorNavTrigger activeNav\">' + (i+1) + '</li>';
					} else {
						navHTML += '<li data-slide-ref="'+(i+1)+'" class=\"gRotatorNavTrigger\">' + (i+1) + '</li>';
					}
				}
				if (settings.autoplay) {
					navHTML += '<li class=\"gRotatorPlayPause\">ll</li></ul>';
				} else {
					navHTML += '<li class=\"gRotatorPlayPause\">&gt;</li></ul>';
				}
			}

			//append them to the container
			container.append(navHTML);

			//bind event listeners for the carousel navigation
			thisNav = $(container).find('.gRotatorNav li.gRotatorNavTrigger');
			playPause = $(container).find('.gRotatorNav li.gRotatorPlayPause');

			if (settings.tabbed){
				if (thisNav.length > 2) {
					thisNav.outerWidth((100/thisNav.length)+'%');
				}else{
					thisNav.outerWidth(165+'px')
				}
			}

			//this rotates you to a specific number and does a show/hide instead of a fadein/out
			thisNav.on('click.gCarousel', function(){
				gCarouselPause();
				gCarouselRotate($(this).data('slide-ref'));
			});

			//this pauses or plays the carousel and enables/disables the hover pause
			playPause.on('click.gCarousel', function(){
				gCarouselPause();
				gCarouselPlayPause($(this));
			});

		}

		//maintain chainability
		return el;
	}// end $.fn.gRotator

}(jQuery));// end immediate function to pass in jQuery as $