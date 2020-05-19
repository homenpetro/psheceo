// NEW CAROUSEL

$(document).ready(function (){
	var $this = $('#carousel-box-HPBTZ11_Carousel_alternateProducts'),
		$parent = $this.closest('.carousel'),
		$carouselContainer = $parent.find('.carouselProductLists'),
		$carouselContainerPos = $carouselContainer.position(),
		$carouselChildren = $carouselContainer.children(),
		moveChildren = $parent.attr('data-carousel'),
		currentPage = $parent.attr('data-currentpage'),
		maxPages = Math.ceil($carouselChildren.length / moveChildren);
	
	$('.carouselMaxPage_alternateProducts').html(maxPages);
	
	if(currentPage == maxPages) {
		$parent.find('[data-action=moveRight]').addClass('disabled');
	}

	var $this = $('#carousel-box-HPBTZ11_Carousel_optionalProducts'),
		$parent = $this.closest('.carousel'),
		$carouselContainer = $parent.find('.carouselProductLists'),
		$carouselContainerPos = $carouselContainer.position(),
		$carouselChildren = $carouselContainer.children(),
		moveChildren = $parent.attr('data-carousel'),
		currentPage = $parent.attr('data-currentpage'),
		maxPages = Math.ceil($carouselChildren.length / moveChildren);
		
	$('.carouselMaxPage_optionalProducts').html(maxPages);
		
		if(currentPage == maxPages) {
			$parent.find('[data-action=moveRight]').addClass('disabled');
		}
		
	var $this = $('#carousel-box-HPBTZ11_Carousel_recommendedProducts'),
		$parent = $this.closest('.carousel'),
		$carouselContainer = $parent.find('.carouselProductLists'),
		$carouselContainerPos = $carouselContainer.position(),
		$carouselChildren = $carouselContainer.children(),
		moveChildren = $parent.attr('data-carousel'),
		currentPage = $parent.attr('data-currentpage'),
		maxPages = Math.ceil($carouselChildren.length / moveChildren);
	
	$('.carouselMaxPage_recommendedProducts').html(maxPages);
	
	if(currentPage == maxPages) {
		$parent.find('[data-action=moveRight]').addClass('disabled');
	}
	if($('#verticalCaroursel') && $('#verticalCaroursel').val() == 'true' ){
		var $parent = $('#verticalThumbnailCaraousel'),
		$carouselContainer = $parent.find('.carouselProductLists'),
		$carouselContainerPos = $carouselContainer.position(),
		$carouselChildren = $carouselContainer.children(),
		moveChildren = $parent.attr('data-carousel'),
		width = $parent.find('li').outerWidth(true) * moveChildren,
		currentPage = $parent.attr('data-currentpage');
		if(currentPage==1 && $carouselChildren.length<moveChildren){
			var newTop=(moveChildren-$carouselChildren.length) * 71;
			$parent.css({
					top: newTop + 'px'
			});
		}
	}
});

!function($) {
	"use strict";
	
	var trigger = "[data-trigger=carousel]",
		GraingerCarousel = function() {};
		
	GraingerCarousel.prototype = {
		constructor: GraingerCarousel,
				
		loadImages: function(children) {
			var prodImage;
			
			for(var i = 0;i<children.length;i++) {
				prodImage = jQuery(children[i]).find('.carouselProductImage img');

				if( prodImage.attr('data-loadimage')) {
					prodImage.attr('src',prodImage.attr('data-src'));
					prodImage.attr('data-loadimage',false);
				}
			}
		},
		
		move: function(e) {
			e.preventDefault();

			var $this = $(this),
				$parent = $this.closest('.carousel'),
				$carouselContainer = $parent.find('.carouselProductLists'),
				$carouselContainerPos = $carouselContainer.position(),
				$carouselChildren = $carouselContainer.children(),
				moveChildren = $parent.attr('data-carousel'),
				width = $parent.find('li').outerWidth(true) * moveChildren,
				currentPage = $parent.attr('data-currentpage'),
				direction = $this.attr('data-action'),
				currentLeft = $carouselContainerPos.left,
				maxPages = Math.ceil($carouselChildren.length / moveChildren),
				newLeft;
			
			if($('#verticalCaroursel') && $('#verticalCaroursel').val() == 'true' ){
				width = ( $parent.find('li').outerWidth(true) + 22) * moveChildren;
			}

			if($this.hasClass('disabled')) {
				return;
			}
			
			if(!$parent.hasClass('loadedImages')) {
				GraingerCarousel.prototype.loadImages($carouselChildren);
				$parent.addClass('loadedImages');
			}

			$parent.find('[data-action]').removeClass('disabled');

			if(direction == 'moveLeft') {
				currentPage--;
				$parent.attr('data-currentpage',currentPage);

				if(currentPage == 1) {
					$parent.find('[data-action=moveLeft]').addClass('disabled');
					$parent.find('[data-action=moveRight]').removeClass('disabled');
				}

				newLeft = (currentPage - 1) * width;

			} else {
				if(currentPage != maxPages){
					currentPage++;
				}
				
				$parent.attr('data-currentpage',currentPage);

				if(currentPage == maxPages) {
					$parent.find('[data-action=moveLeft]').removeClass('disabled');
					$parent.find('[data-action=moveRight]').addClass('disabled');
				}
				
				newLeft = (currentPage - 1) * width;
			}

			$parent.find('.carouselCurrentPage').html(currentPage)

			if($('#verticalCaroursel') && $('#verticalCaroursel').val() == 'true' ){
				var newH=width * currentPage;
				$carouselContainer.css({
					top: -newLeft + 'px',
					height: newH + 'px'
				});
			}else{
				$carouselContainer.css({
					left: -newLeft + 'px'
				});	
			}
			
		
		}
	
	}
	
	$(document).on('click.graingercarousel.data-api', trigger, GraingerCarousel.prototype.move);
	
}(window.jQuery);

window.addToCartFromCarousel = function (productCode, functionCode, baseItem, index) {
	io_add_to_cart = true;
	
	if(index == null || index.length === 0){
		index = productCode;
	}
	if(isValidQtyAvl('quantity' + index)){
		addtocart(productCode, 'true', index, functionCode, baseItem );
	}
	return false;
}
