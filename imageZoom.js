/* Old Method, keeping around in case we decide to change back */

function imageZoom(target) {
	var imageWidth = 0,
		imageHeight = 0,
		zoomTarget = jQuery('#'+target),
		zoomWindow = zoomTarget.find('.magnifyGlass'),
		zoomTargetImage = zoomTarget.find('img'),
		zoomTargeImageWid = 300,
		zoomedImageWindow = jQuery('#zoomedImage'),
		isFirefox = (navigator.userAgent.indexOf('Mozilla') == 0) ? true : false;

	zoomTarget.mousemove(function(e){
	
		if(!zoomTarget.attr('data-image')) {
			var imgSrc = zoomTargetImage.attr("src"),
				imgString = imgSrc.split('?'),
				zoomImgString = imgString[0] + '?$zmmain$';
				
			zoomedImageWindow.css({
				background: '#FFF url('+zoomImgString+') no-repeat scroll 0px 0px'
			});
			
			zoomTarget.attr('data-image','loaded');
		}
	
		var _this = jQuery(this);

		if(!imageWidth && !imageHeight) {
			var imageObject = new Image();
			imageObject.src = zoomTargetImage.attr("src");
				
			imageWidth = imageObject.width;
			imageHeight = imageObject.height;
		} else {
				
			var magnifyOffset = _this.offset(),
				mx = e.pageX - magnifyOffset.left,
				my = e.pageY - magnifyOffset.top;
				
			if(mx < _this.width() && my < _this.height() && mx > 0 && my > 0) {
				zoomWindow.fadeIn(100);
				zoomedImageWindow.fadeIn(100);
			} else {
				zoomWindow.fadeOut(100);
				zoomedImageWindow.fadeOut(100);
			}
			
			if(zoomWindow.is(":visible")) {
			
				var rx =  Math.round( mx / zoomTargeImageWid * 1000  - zoomTargeImageWid * 0.5 ) * -1,
					ry =  Math.round( my / zoomTargeImageWid * 1000  - zoomTargeImageWid * 0.5 ) * -1,
					px = mx - zoomWindow.width() * 0.5,
					py = my - zoomWindow.height() * 0.5;

				zoomWindow.css({
					left: px, 
					top: py
				});
				
				if(isFirefox) {
					zoomedImageWindow.css({
						backgroundPosition: rx + 'px ' +  ry + 'px'
					});
				} else {
					zoomedImageWindow.css({
						'background-position-x': rx + 'px',
						'background-position-y': ry + 'px'
					});
				}
				
			}
		}
	});

}

function createZoomImage() {
	if(jQuery('#mainImageZoom').doesExist()) {
		var zoomImage = jQuery('<img/>'),
			imageSrc = jQuery('#mainImageZoom').attr('src'),
			imgString = imageSrc.split('?');
			zoomImgString = imgString[0] + '?$zmmain$';

		jQuery("#mainImage").zoom({url:zoomImgString});
	}
}

function zoomImage2() {
	if(jQuery('#mainImageZoom').length > 0) {
		createZoomImage();
	}
}

/*!
Zoom v1.7.8 - 2013-07-30
Enlarge images on click or mouseover.
(c) 2013 Jack Moore - http://www.jacklmoore.com/zoom
license: http://www.opensource.org/licenses/mit-license.php
*/
(function ($) {
	var defaults = {
		url: false,
		callback: false,
		target: false,
		duration: 120,
		on: 'mouseover', // other options: 'grab', 'click', 'toggle'
		onZoomIn: false,
		onZoomOut: false
	};
	// Core Zoom Logic, independent of event listeners.
	$.zoom = function(target, source, img) {
		var outerWidth,
		outerHeight,
		xRatio,
		yRatio,
		offset,
		position = $(target).css('position');
	
		// The parent element needs positioning so that the zoomed element can be correctly positioned within.
		$(target).css({
			position: /(absolute|fixed)/.test(position) ? position : 'relative',
			overflow: 'hidden'
		});
		img.style.width = img.style.height = '';
		
		$(img).addClass('zoomImg').css({
			position: 'absolute',
			top: 0,
			left: 0,
			opacity: 0,
			width: img.width,
			height: img.height,
			border: 'none',
			maxWidth: 'none'
		}).appendTo(target);
		
		return {
			init: function() {
				outerWidth = $(target).outerWidth();
				outerHeight = $(target).outerHeight();
				xRatio = (img.width - outerWidth) / $(source).outerWidth();
				yRatio = (img.height - outerHeight) / $(source).outerHeight();
				offset = $(source).offset();
			},
			move: function (e) {
				var left = (e.pageX - offset.left),
				top = (e.pageY - offset.top);
				top = Math.max(Math.min(top, outerHeight), 0);
				left = Math.max(Math.min(left, outerWidth), 0);
				img.style.left = (left * -xRatio) + 'px';
				img.style.top = (top * -yRatio) + 'px';
			}
		};
	};

	$.fn.zoom = function (options) {
		return this.each(function () {
			var settings = $.extend({}, defaults, options || {}),
				//target will display the zoomed image
				target = settings.target || this,
				//source will provide zoom location info (thumbnail)
				source = this,
				img = document.createElement('img'),
				$img = $(img),
				mousemove = 'mousemove.zoom',
				clicked = false,
				$urlElement;
				// If a url wasn't specified, look for an image element.
				if (!settings.url) {
					$urlElement = $(source).find('img');
					if ($urlElement[0]) {
						settings.url = $urlElement.data('src') || $urlElement.attr('src');
					}
					if (!settings.url) {
						return;
					}
				}
		
				img.onload = function () {
					var zoom = $.zoom(target, source, img);
			
					function start(e) {
						zoom.init();
						zoom.move(e);
						// Skip the fade-in for IE8 and lower since it chokes on fading-in
						// and changing position based on mousemovement at the same time.
						$img.stop()
						.fadeTo($.support.opacity ? settings.duration : 0, 1, $.isFunction(settings.onZoomIn) ? settings.onZoomIn.call(img) : false);
					}
					function stop() {
						$img.stop()
						.fadeTo(settings.duration, 0, $.isFunction(settings.onZoomOut) ? settings.onZoomOut.call(img) : false);
					}
					if (settings.on === 'grab') {
						$(source).on('mousedown.zoom',
							function (e) {
								if (e.which === 1) {
									$(document).one('mouseup.zoom',
										function () {
											stop();
											$(document).off(mousemove, zoom.move);
										}
										);
									start(e);
									$(document).on(mousemove, zoom.move);
									e.preventDefault();
								}
							}
						);
					} else if (settings.on === 'click') {
						$(source).on('click.zoom',
							function (e) {
								if (clicked) {
									// bubble the event up to the document to trigger the unbind.
									return;
								} else {
									clicked = true;
									start(e);
									$(document).on(mousemove, zoom.move);
									$(document).one('click.zoom',
										function () {
											stop();
											clicked = false;
											$(document).off(mousemove, zoom.move);
										}
									);
									return false;
								}
							}
				);
		
				} else if (settings.on === 'toggle') {
					$(source).on('click.zoom', function (e) {
						if (clicked) {
							stop();
						} else {
							start(e);
						}
						clicked = !clicked;
					});
				} else {

					zoom.init(); // Preemptively call init because IE7 will fire the mousemove handler before the hover handler.
					$(source).on('mouseenter.zoom', start).on('mouseleave.zoom', stop).on(mousemove, zoom.move);
				}
		
				if ($.isFunction(settings.callback)) {
					settings.callback.call(img);
				}
			};
		
			img.src = settings.url;
			
			$(source).one('zoom.destroy', function(){
				$(source).off(".zoom");
				$img.remove();
			});
		});
	};

	$.fn.zoom.defaults = defaults;
}(window.jQuery));