	var hashUrl = { isHashUpdate: true };

	//1 from calling page
	function warrantiesDlg(){
		Grainger.Modals.waitModal("showWarranties", "showWarranties");

		var url = "/ItemDetailRightComponentController?showWarranties";

		jQuery.ajax({
		    url: url,
		    cache: false,
		    success: function(data) {
		        Grainger.Modals.createAndShowModal("showWarranties", "showWarranties", data);
		    },
		    error: function() {
		        Grainger.Modals.killModal();
		    }
		});
	}

	function showDisclaimerDlg(){
		Grainger.Modals.waitModal("showDisclaimerDlg", "showDisclaimerDlg");
		var data = $("#availabilityPopup").html();
		Grainger.Modals.createAndShowModal("showDisclaimerDlg", "showDisclaimerDlg", data);
//		var url = "/ItemDetailRightComponentController?showDisclaimer";
//
//		Grainger.Modals.waitModal("showDisclaimerDlg", "showDisclaimerDlg");
//
//		jQuery.ajax({
//		    url: url,
//		    cache: false,
//		    success: function(data) {
//		        Grainger.Modals.createAndShowModal("showDisclaimerDlg", "showDisclaimerDlg", data);
//		    },
//		    error: function() {
//		        Grainger.Modals.killModal();
//		    }
//		});
	}

	function showCustomCatalogVerbiageDlg(){
		Grainger.Modals.waitModal();

		jQuery.ajax({
			url:'/components/itemdetail/customcatalogverbiagemodal.jsp',
			type:'GET',
			dataType: 'text',
			cache: false,
			success: function(data){
				Grainger.Modals.createAndShowModal('customCatalogModal', 'customCatalogModal', data);
			}
		});
	}

/* Product Page Functions */

function addProductsToList( isLoggedIn ) {
	if(typeof products == 'undefined' || typeof products.itemsToAdd == 'undefined') {
		products = {};
		products.itemsToAdd = [];
	}

	 if( isLoggedIn ) {
    	 if(products.itemsToAdd.length > 0) {
              var data = JSON.stringify(products);

              Grainger.Modals.waitModal("mylist", "mylist");

              jQuery.ajax({
                   url: contextPath + "/myaccount/mylistmodal?action=multipleItemsAddToList&pageSource=parentChildIDP",
                   type: 'POST',
                   data: {multiAddToListItemsJSON: data},
                   success: function(data) {
						Grainger.Modals.createAndShowModal("mylist", "mylist", data);

						//reset input values to blank
						jQuery('[data-type=product]').val('');

						// Reset products
						products = {};
						products.itemsToAdd = [];
                   },
                   error: function(data) {
                        console.log('An error has a occurred');
                        Grainger.Modals.killModal();
                   }
              });
          } else {
              alert('Please input a valid quantity');
          }
    	//checks character count of modal window
         setTimeout(function(){jQuery("#modal-mylistDesc").on("keyup",function () {
             jQuery("#characterCount").text(240-jQuery("#modal-mylistDesc").val().length);
         });},3000);
     } else {
          jQuery("body").trigger("grainger.notlogged.listadd");
          modalContent = jQuery('#addToListModalMsg').clone();
          jQuery(modalContent).removeClass("hide");

          Grainger.Modals.createAndShowModal("mylist", "mylist", modalContent);
     }
}

//Css update on cancel click
function myListDropDownShareCancel() {
	jQuery("#myListDropDown").removeClass("active");
	jQuery("#myListDropDown dd").addClass("hidden");
}

function myListDropDownEditCancel() {
	jQuery("#editMyListMenu").removeClass("active");
	jQuery("#editMyListMenu dd").addClass("hidden");
}

/* adding multiple items from parent idp page */

function createProductArray( productId , productQty ) {

	if( typeof products == "undefined" || typeof products.itemsToAdd == "undefined") {
		products = {};
		products.itemsToAdd = [];
	}

	var alreadyExists = false;

	if( productQty && !isNaN(productQty) && productQty > 0 ) {

		jQuery.map(products.itemsToAdd, function( item,  index) {

			if(item.code == productId) {
				item.quantity = productQty;
				alreadyExists = true;
			}
		});

		if(!alreadyExists) {
			products.itemsToAdd.push({code: productId, quantity: productQty});
		}


	} else {
		// If you add an incorrect quantity, remove it, or set it 0. Create new array with updated values and copy it to products.itemsToAdd

		var newArray = [];

		jQuery.map(products.itemsToAdd, function( item, index ) {
			if(item.code != productId) {
				newArray.push({code: item.id, quantity: item.quantity});
			}
		});

		products.itemsToAdd = newArray;

	}

}

function bindParentQtyChange(containerID, isClearSelections) {

	var productQuantity = jQuery('#' + containerID + ' [data-type="product"]');

	// create global object to store items in list

	if( typeof products == "undefined" || typeof products.itemsToAdd == "undefined" || isClearSelections) {
		products = {};
		products.itemsToAdd = [];
	}

	jQuery('#'+containerID).on('change','[data-type="product"]',function() {

		var el = jQuery(this),
			id = el.attr('data-productid'),
			quantity = this.value;

		if( isNaN(quantity) ){
			alert('Please input a valid quantity');
			el.val('');
		} else {
			createProductArray( id , quantity );
		}
	});

	/* Adding add to cart */
	jQuery('#'+containerID).on('click','.addToCartBtn',function() {
		if(typeof products == 'undefined' || typeof products.itemsToAdd == "undefined") {
			alert("Please select items to add to cart.");
			return false;
		}

		if(typeof products != 'undefined' && products.itemsToAdd.length > 0) {
			var funcId = jQuery('#analyticsFuncId').val();
			addMultiItemsToCart('parentIDP',funcId);
		} else {
			alert("Please select items to add to cart.");
			return false;
		}
	});

}

/* Dropdown */

function showDropdown( el ) {
	var elem = jQuery(el),
		dropDownOptions = jQuery('[data-type=dropdownOptions]'),
		filterLabels = jQuery('.selectedFilters'),
		showDropdown = elem.children('[data-type=dropdownOptions]'),
		searchLabel = elem.find('.selectedFilters');

	if(elem.hasClass('selected')) {
		showDropdown.hide();
		searchLabel.removeClass('active');
		elem.removeClass('selected');
		return;
	}

	if(dropDownOptions.is(':visible')) {
		dropDownOptions.hide();
		jQuery('[data-type=dropdown]').removeClass('selected');
	}

	filterLabels.removeClass('active');

	elem.addClass('selected');
	showDropdown.show();
	searchLabel.addClass('active');

}

/* Function to update filters and children table */

function updateChildren(selectedInput, standbyText, updateHash, isParentIDP) {
	updateHash = (updateHash != undefined ? updateHash : true);

    Grainger.Modals.waitModal(standbyText, standbyText);

	var url = contextPath + selectedInput;
	var productMain = jQuery('#parentDetailMain');
	var productChildren = jQuery('#parentDetailChildren');
	var parentAlternateSearchTerms = jQuery('#parentAlternateSearchTerms');

    jQuery.ajax({
    	url: url,
    	type: 'GET',
    	cache: false,
    	success: function(data) {
    		if(data) {
    			productMain.html(jQuery(data).find('#parentDetailMain').html());
    			productChildren.html(jQuery(data).find('#parentDetailChildren').html());
    			jQuery(document).trigger('children_update',[productChildren]);
    			parentAlternateSearchTerms.html(jQuery(data).find('#parentAlternateSearchTerms').html());
    			eval(jQuery(data).find('#analyticsJS').html());
    			publishBrightTag();
    		}
			bindDropdown(true);

			// Reset products
			resetProductArray();

    		Grainger.Modals.killModal();

			if (updateHash) {
				hashUrl.isHashUpdate = false;
				var fragment = jQuery('#navFragmentUrl').val();
				window.location.hash = fragment;
            }

            // Reset sticky header
            setStickyHeader();

            // Reset column number in child table if epro and small screen
            if ( typeof(eProUser) !== "undefined" && eProUser === true && jQuery('html').width() < 775) {
				jQuery("#parentDetailChildren, .childThead").find("tr").each(function(){
					jQuery(this).children(".childTableSpec:gt(2)").hide();
				});

			}
    	},
    	error: function(data) {
    		Grainger.Modals.killModal();
    	}
    });

}

function publishBrightTag(){
	try
	{
		jQuery(window).trigger("grainger.techspec.changed");

	}catch(err){
		console.log("Error publishing the event for Bright Tag");
	}
}
function resetProductArray() {
	// Reset products
	products = {};
	products.itemsToAdd = [];
}

function bindDropdown(firstLoad) {
	var productDropdown = jQuery('[data-type="dropdown"]'),
		dropdownOptions = jQuery('[data-type="dropdownOptions"]'),
		filterLabels = jQuery('.selectedFilters');

	if( productDropdown.length > 0 ) {
		productDropdown.on('click',function(e) {
			e.stopPropagation();
			var el = jQuery(this);
			showDropdown( el );
		});

		if(firstLoad) {
			jQuery(document).on('click',function() {
				if(dropdownOptions.is(':visible')) {
					dropdownOptions.hide();
					filterLabels.removeClass('active');
				}
			});
		}
	}

}

function showSKUPreview(hrefObj,childPreviewId,sku,productName) {
	var row = jQuery(hrefObj).closest('tr'),
		childPreview = row.next('tr').find('td');

	if(childPreview.is(':visible')) {
		childPreview.hide();
		jQuery(hrefObj).removeClass('collapse');
		jQuery(hrefObj).addClass('expand');
		row.removeClass('expanded');
		if (typeof(childPreviewId) != 'undefined' && childPreviewId.length > 0) {
			var SHOW_MINI_CIDP_COOKIE = "ndsShowMiniCidp",
				showMiniCidpStr = (jQuery.cookie(SHOW_MINI_CIDP_COOKIE) || new String());
			if (showMiniCidpStr.search(childPreviewId+',') >= 0) {
				showMiniCidpStr = showMiniCidpStr.replace(childPreviewId+',', "");
			} else if (showMiniCidpStr.search(','+childPreviewId) >= 0) {
				showMiniCidpStr = showMiniCidpStr.replace(','+childPreviewId, "");
			} else if (showMiniCidpStr.search(childPreviewId) >= 0) {
				showMiniCidpStr = showMiniCidpStr.replace(childPreviewId, "");
			}
			jQuery.cookie(SHOW_MINI_CIDP_COOKIE, showMiniCidpStr, { path: "/", secure: true });
		}
	} else {
		var childImageUrl = '<img class="s7LazyLoad" data-src="'+ jQuery("#childImageUrl"+sku).val() + '" src="'+jQuery("#childImageUrl"+sku).val()+'" alt="'+productName+'" title="'+productName+'" />'
		jQuery("#childProductImage"+sku).html(childImageUrl);
		childPreview.show();
		jQuery(hrefObj).addClass('collapse');
		jQuery(hrefObj).removeClass('expand');
		row.addClass('expanded');
		if (typeof(childPreviewId) != 'undefined' && childPreviewId.length > 0) {
			var SHOW_MINI_CIDP_COOKIE = "ndsShowMiniCidp";
				showMiniCidpStr = (jQuery.cookie(SHOW_MINI_CIDP_COOKIE) || new String());
			showMiniCidpStr += (showMiniCidpStr.length > 0 ? "," : "") + childPreviewId;
			jQuery.cookie(SHOW_MINI_CIDP_COOKIE, showMiniCidpStr, { path: "/", secure: true });
		}
	}

	//rebind unveil for unloaded images
	jQuery('.s7LazyLoad').unveil();
}

var showStandby = function(standbyMsg) {

    var msgText = (standbyMsg || "Finding Matching Items"),
    	throbber = "<div class='throbber'></div><br>" + msgText,
    	progressDiv = "<div id='progressBackground'></div>",
    	progressItems = "<div id='progressID'></div>",
    	body = jQuery('body'),
    	bodyHeight = body.height(),
    	bodyWidth = body.width();

    	jQuery(progressDiv).appendTo('body').css({
    		height: bodyHeight + 'px',
    		width: bodyWidth + 'px',
    		position: 'absolute',
    		top: '0px'
    	});
    	jQuery(progressItems).appendTo('body').css({
    		position: 'fixed',
    		top: '25%',
    		left: '40%'
    	}).html(throbber);
};

var hideStandby = function() {
	jQuery('#progressID').remove();
	jQuery('#progressBackground').remove();
};



/* Sticky Header */


function setStickyHeader() {
	var didScroll = false,
		childTableHeader = jQuery('#childThead'),
		cthPosition = childTableHeader.offset(),
		windowTop = jQuery(window).scrollTop(),
		getMoreChildren = true,
		loadingMoreChildren = jQuery('#childTableFooter'),
		clonedThead = childTableHeader.clone(true, true),
		newDiv = '<div id="tableFixedHeader"><table class="childTable" cellpadding="0" cellspacing="0"></table><i></i></div>',
		childTable = jQuery('#childTableBody');

	jQuery(newDiv).appendTo('#parentDetailChildren');
	jQuery('#tableFixedHeader').find('.childTable').html(clonedThead);

	var target = jQuery('#tableFixedHeader'),
		targetTH = target.find('th'),
		originalTH = childTableHeader.find('th');

	target.hide();

	jQuery.each(targetTH, function(index, elem) {
		var thWidth = originalTH.eq(index).outerWidth();
		targetTH.eq(index).css({
			'width': thWidth
		});
	});

	if(childTable.height() > childTableHeader.height()) {

		jQuery(window).scroll(function() {
			didScroll = true;
		});

	}

	// reduce child table column count if epro and small screen
	if (jQuery('html').width() < 775) {
		jQuery("#parentDetailChildren, .childThead").find("tr").each(function(){
			jQuery(this).children(".childTableSpec:gt(2)").hide();
		});

		jQuery("#tableFixedHeader").width(jQuery('html').width());
	}

	function getAdditionalChildren() {

		var searchUrl = jQuery('#searchUrl').val(),
			nextPage = jQuery('#pagingInfo').attr('data-nextpage'),
			url = searchUrl + '&requestedPage=' + nextPage,
			childTbody = jQuery('#childTableBody'),
			childPage = jQuery('#pagingInfo');

		var childrenParams = {
			url: url,
			dataType: 'html',
			cache: false,
			success: function(response) {
				var newChildren = jQuery(response).find('#childTableBody').html(),
					newChildPage = jQuery(response).find('#pagingInfo');

				childTbody.append(newChildren);

				if(newChildPage.length > 0) {
					childPage.replaceWith(newChildPage);
				} else {
					getMoreChildren = false;
				}
				
				if (jQuery('html').width() < 775) {
					jQuery("#parentDetailChildren, .childThead").find("tr").each(function(){
						jQuery(this).children(".childTableSpec:gt(2)").hide();
					});

					jQuery("#tableFixedHeader").width(jQuery('html').width());
				}
				
				loadingMoreChildren.hide();
				scrollInterval = setInterval(childrenScrollEvent, 250);
			},
			error: function() {
				console.log('An error has occurred!');
			}
		};

		isGettingChildren = jQuery.ajax(childrenParams);

	}

	function childrenScrollEvent() {
		if(cthPosition != childTableHeader.offset()) {
			cthPosition = childTableHeader.offset();
		}

		if(didScroll) {
			didScroll = false;
			windowTop = jQuery(window).scrollTop();

			if(windowTop > cthPosition.top && (windowTop < childTable.position().top + childTable.height())) {
				target.addClass('isFixed');
				target.show();
			} else {
				target.removeClass('isFixed');
				target.hide();
			}

			if(jQuery('#addMoreChildren').length > 0 && getMoreChildren === true) {
				var childrenTbody = jQuery('#addMoreChildren'),
					tbodyPosition = childrenTbody.offset();

				if(windowTop >= (tbodyPosition.top - jQuery(window).height()) ) {
					clearInterval(scrollInterval);

					loadingMoreChildren.show();

					getAdditionalChildren();
				}
			}
		}

	}

	var scrollInterval = setInterval(childrenScrollEvent, 250);
}

function submitPPSearchRequestPIDP(isLoggedIn,alertMessage) {
	var currentPageURL = unescape(window.location.href);
	if(isLoggedIn) {
		var selectedUrl=window.location.pathname;
		var params='';
		// Fix for SHOP-3511
		// Get the nav fragment URL to get the current URL.
		var currentURL = jQuery("#navFragmentUrl");
		if (currentURL.val()) {
			selectedUrl = decodeURIComponent(currentURL.val()).split("?")[0];
			selectedUrl = selectedUrl.replace("nav=", "");

			if (currentURL.val().split("?")[1]) {
				params=currentURL.val().split("?")[1].split("&");
			}
		}

		var flag=true;

		for(var i=0; i<params.length; i++) {
			if(i == 0) {
				selectedUrl=selectedUrl+"?";
			} else {
				selectedUrl=selectedUrl+"&";
			}
			if(params[i].indexOf("s_pp") == -1) {
				selectedUrl=selectedUrl+params[i];
			} else {
				selectedUrl=selectedUrl+'s_pp='+jQuery('#previouslyPurchasedChbx').is(":checked")+'&cm_pp='+jQuery('#previouslyOrderItemFlag').val();
			}
		}
		if(flag) {
			if(selectedUrl.indexOf("?") < 0) {
				selectedUrl=selectedUrl+"?";
			} else {
				selectedUrl=selectedUrl+"&";
			}
			selectedUrl=selectedUrl+'s_pp='+jQuery('#previouslyPurchasedChbx').is(":checked")+'&cm_pp='+jQuery('#previouslyOrderItemFlag').val();
		}
		updateChildren(selectedUrl, null, true, true);
		publishBrightTag();
	} else {
		document.forms.previouslyPurchasedForm.previouslyPurchasedChbx.checked=false;

		var frwdUrlPath = currentPageURL.substring(currentPageURL.indexOf('/product'));
        var data = '<div class="modal-content"><p class="alert alert-block error">' + alertMessage + '</p></div>'
        + '<form id="prevPurchasedSignIn" name="signIn" method="get" action="/myaccount/signin" style="display: inline;"><input id="frwdUrlPath" type="hidden" name="frwdUrlPath" value="'+ frwdUrlPath +'" /></form>'
        + '<div class="modal-footer"><a href="#" class="cancel">Close</a></div>';

        Grainger.Modals.createAndShowModal(null, null, data);

		jQuery('#prevPurchasedSignInLink').on('click',function(){
			jQuery("#prevPurchasedSignIn").submit();
		});
	}
}

function searchProductVersionId(versionId){

	Grainger.Modals.waitModal();

	var repairPartsDiv = jQuery('#repairPartsTable'),
		loadingProducts = '<div class="loadingProducts"><div class="throbber"></div><p class="loadingMsg">Loading more products...</p></div>';

	repairPartsDiv.html(loadingProducts);

	jQuery.ajax({
		url: "/product/versionIdSearch?"+"versionId="+versionId,
		dataType: "HTML",
		type: "GET",
		cache:false,
		success: function (data) {
			repairPartsDiv.html(data);
		},
		complete: function(data) {
			Grainger.Modals.killWaitModal();
		}
	});
}

function bindRepairPartVersion() {
	var repairVersions = jQuery('#repairPartsVersion').find('.productVersion');

	jQuery(repairVersions).on('click',function() {
		var el = jQuery(this),
			version = el.attr('data-version');

		if(jQuery('#repairPartsVersion .selectedCheck').length > 0) {
			jQuery('#repairPartsVersion .selectedCheck').remove();
		}

		el.append('<span class="selectedCheck alert confirm"></span>');

		jQuery('#repairPartsVersionList .versionInfo').hide();
		el.closest('.versionInfo').addClass('selectedVersion').show();

		jQuery('#repairPartsVersionList .viewAllVersionsLink').show();

		searchProductVersionId(version);
	});
}

function showAllVersions() {
	jQuery('#repairPartsVersionList .versionInfo').show();
	jQuery('#repairPartsVersionList .viewAllVersionsLink').hide();
}

function loadRepairParts(ajaxUrl) {

	Grainger.Modals.waitModal();

	var repairPartsPaging = jQuery('.repairPartsPaging'),
		pageNum = repairPartsPaging.attr('data-nextpage'),
		params = "requestedPage="+pageNum,
		loadingProducts = '<div id="loadingProducts" class="loadingProducts"><div class="throbber"></div><p class="loadingMsg">Loading more products...</p></div>',
		repairPartsDiv = jQuery('#repairPartsTable'),
		repairPartsBody = jQuery('#repairPartsBody'),
		nextLink = jQuery('#repairPartsTable .nextLink'),
		url = '';

	repairPartsDiv.append(loadingProducts);

	if (ajaxUrl.indexOf("?") != -1) {
		url = ajaxUrl + '&' + params;
	} else {
		url = ajaxUrl + '?' + params;
	}

	jQuery.ajax({
		url: url,
		type: 'GET',
		success: function(response) {
			var rpBody = jQuery(response).find('#repairPartsBody');
			pageNum++;

			jQuery('#loadingProducts').remove();
			repairPartsPaging.attr('data-nextpage',pageNum);

			if(jQuery(response).find('.nextLink').length < 1) {
				nextLink.hide();
			}

			repairPartsBody.append(rpBody.html());
		},
		error: function() {
			console.log("Error has occurred, try again");
		},
		complete: function() {
			Grainger.Modals.killWaitModal();
		}
	});

}

function showVideo( id ) {
	var newPageName = (page_variables.PageId) ? (page_variables.PageId): 'ProductPage';

	var newWidgetId = 'ecModalVideoPlayer'+id;

	if(typeof Invodo === "undefined") {
		jQuery.getCachedScript('//e.invodo.com/4.0/s/grainger.com.js').done(function() {

			Invodo.init({
				pageName: newPageName,
				onload: function() {
							Invodo.Widget.add({
								type:"inplayer",
							   	mode:"embedded",
								widgetId:newWidgetId,
								parentDomId:"ecVideo",
								podId:id
							});
				}
			});

		});
	} else {

		if(Invodo.Widget.get(newWidgetId)) {
			Invodo.Widget.remove(newWidgetId);
		}

		Invodo.Widget.add({
			type:"inplayer",
			mode:"embedded",
			widgetId:newWidgetId,
			parentDomId:"ecVideo",
			podId:id
		});

	}

}

function bindModalCarousel() {
	var ecItems = jQuery('#ecModal').find('.carouselItem');

	ecItems.on('click',function() {
		var el = jQuery(this),
		 	elType = el.attr('data-type');

		ecItems.removeClass('active');
		el.addClass('active');

		updateMainImg(el, '#ecImageModal');

		if(elType == 'video') {
			var videoId = el.attr('data-code');
			showVideo(videoId);
		} else {
			jQuery('#ecVideoModal').hide();
			jQuery('#ecImageModal').show();
		}
	});
}

function bindEnhancedContent() {
	var ecContent = jQuery('#productPage .enhancedContent'),
		ecItems;

	if(ecContent.length > 0) {
		ecItems = ecContent.find('.carouselItem');

		ecItems.on('click',function() {

			var el = jQuery(this),
				elType = el.attr('data-type');

			publishECAnalytics(el);
			
			ecItems.removeClass('active');
			el.addClass('active');

			jQuery("#ecVideo").remove();
			jQuery('#image360').remove();
			jQuery("#image360Expanded").remove();
			jQuery('#mainImageZoom').hide();
			jQuery('#mainImageZoomExpanded').hide();
			

			jQuery('#mainImage').trigger('zoom.destroy');

			if( elType === 'prodImage') {

				enhancedContentTrigger.execute(el);

			} else if( elType === '360Image') {

				enhancedContentTrigger.execute(el);
			} else {
				enhancedContentTrigger.execute(el);
			}
		});
		
	}
}

function chooseParentOrChildPage(productCode) {
	var typeOfPage = "IDP";
	//if "WP" is at the beginning of the data-item (it was the parent product code) we are on a parent detail page
	if(productCode.indexOf("WP") == 0) {
		typeOfPage = "PIDP";
	}
	return typeOfPage;
}

function bindHashChange() {

	jQuery(window).bind('hashchange', function () {
		if (hashUrl.isHashUpdate) {
		    var urls=decodeURIComponent(window.location.href).split("#nav=");
			if(urls.length > 1) {
				updateChildren(urls[1], null, false, true);
			} else {
				updateChildren(urls[0], null, false, true);
			}
		}
		hashUrl.isHashUpdate = true;
	});

}

function showAdditionalRequiredItems() {
	jQuery('#requiredAccessoriesExpanded').removeClass("hide");
	jQuery('#idpShowAdditionalRequiredItemsLink').addClass("hide");
}

function hideAdditionalRequiredItems() {
	jQuery('#requiredAccessoriesExpanded').addClass("hide");
	jQuery('#idpShowAdditionalRequiredItemsLink').removeClass("hide");
}

// Toaster on Parent/Child to call attention to filters
var pcToaster = {
	init : function(){
		this.elm = jQuery('#filterToaster').appendTo('body');
		if(jQuery.cookie('pcToasterDismiss') == false || !jQuery.cookie('pcToasterDismiss')){
			var us = this;
			us.bindScroll(true);
			us.top = jQuery('#findFilters').on('click', function(){
				jQuery("html, body").animate({scrollTop:256});
				return false;
			});
			us.close = jQuery('#closeFilterToaster').on('click', function(){
				us.dismiss();
			});
		}
	},
	bindScroll : function(bool){
		var doc = jQuery(window),
			us = this;
		if(bool === true){
			doc.on('scroll.filterToaster', function(){
				if(doc.scrollTop() >= 600){
					us.elm.slideDown();
				}
				if(doc.scrollTop() < 600){
					us.elm.slideUp();	
				}
			});
		}else{
			doc.off('scroll.filterToaster');
		}
	},
	dismiss : function(){
		this.bindScroll(false);
		this.elm.slideUp();
		jQuery.cookie('pcToasterDismiss', true);
	}
}


var expandMainImage = {
	expand: function() {

		var activeItem = jQuery('#productThumbnails .active'),
			type = '',
			expanded = (jQuery('#productPage').hasClass('expanded')) ? 'collapse' : 'expand';

		if(activeItem.length > 0) {
			type = activeItem.attr("data-type");
		} else {
			type = jQuery('#mainImage').attr('data-type');
			activeItem = jQuery('#mainImage');
		}

		switch(type) {
			case "prodImage":
				this.typeImage(expanded);
				break;
			case "360Image":
				this.type360(expanded);
				break;
			case "video":
				this.typeVideo(expanded);
				break;
			default:
				break;
		}
		
		//Don't track analytics when the Full Zoom is closed.
		if(expanded == 'expand'){
			publishECAnalytics(activeItem);
		}

	},

	typeImage: function(action, src) {
		var productContainer = jQuery('#productPage'),
			mainImg = jQuery('#mainImageZoom'),
			mainImgString = '',
			zoomImgString = '';

		if(src) {
			mainImgString = src.split('?')
		} else {
			mainImgString = mainImg.attr('src').split('?')
		}

		if(action === 'expand') {

			productContainer.addClass('expanded');

			jQuery('#mainImage .zoomImg').remove();
			jQuery("#mainImage").trigger('zoom.destroy');

			mainImg.attr('src', mainImgString[0] + '?hei=800&wid=935');

			jQuery('#closeEC2').show();

		} else {
			productContainer.removeClass('expanded');

			mainImg.attr('src', mainImgString[0] + '?$glgmain$');

			zoomImgString = mainImgString[0] + '?$zmmain$';

			jQuery('#mainImage').zoom({url:zoomImgString});

			jQuery('#closeEC2').hide();
		}

		mainImg.show();
		jQuery('#mainImageZoomExpanded').show();

	},

	typeVideo: function(action) {

		//Remove existing player
		jQuery('#ecVideo').remove();

		var productContainer = jQuery('#productPage');

		if(action === 'expand') {
			productContainer.addClass('expanded');
		} else {
			productContainer.removeClass('expanded');
		}

		//Create new player
		var playerWidth = (action === 'expand') ? '935px' : '300px';
			playerHeight = (action === 'expand') ? '450px' : '250px';
			newPlayer = '<div id="ecVideo" style="height: ' + playerHeight +  ';width: ' + playerWidth + ';"></div>',
			el = jQuery('#productThumbnails .active');

		jQuery('#mainImage').append(newPlayer);

		showVideo(el.attr('data-code'));

		jQuery("#closeEC2").hide();
	},

	type360: function(action) {
		var iframe360 = jQuery('#image360'),
			productContainer = jQuery('#productPage');

		if(action === 'expand') {
			productContainer.addClass('expanded');

			jQuery('#closeEC2').show();

			iframe360.attr({
				'height' : 935,
				'width' : 935
			});
		} else {
			productContainer.removeClass('expanded');

			jQuery('#closeEC2').hide();

			iframe360.attr({
				'height' : 500,
				'width' : 500
			});
		}
	}
}

var enhancedContentTrigger = {
	elem: null,

	execute: function(el) {
		this.elem = el;

		var action = jQuery(el).attr('data-type'),
		prodPage = jQuery('#productPage');
		
		prodPage.removeClass("viewer360"); 

		if(action === '360Image') {
			prodPage.addClass("viewer360");
			this.build360();
		} else if(action === 'video') {
			this.buildVideo();
		} else {
			this.buildImage();
		}
	},

	build360: function() {
		var productCode = jQuery(this.elem).attr('data-code'),
			url360 = '//static.grainger.com/rp/s/s7viewers/html5/genericSpinMobile.html?serverUrl=//static.grainger.com/rp/s/is/image/&config=Grainger/Grainger%5FSpinSet%5FHTML5&contentRoot=//static.grainger.com/rp/s/skins/&asset=Grainger/'+ productCode +'',
			width = (jQuery('#productPage').hasClass('expanded')) ? 935 : 500,
			iframe360 = '<iframe id="image360" width="'+width+'" height="'+width+'" src="'+url360+'" frameborder="0"></iframe>';

		jQuery(iframe360).insertBefore('#mainImageZoom');

		if(jQuery('#productPage').hasClass('expanded')) {
			jQuery('#closeEC2').show();
		} else {
			jQuery('#closeEC2').hide();
		}
		var	iframe360Expanded = '<iframe id="image360Expanded" width="931" height="802" src="'+url360+'" frameborder="0"></iframe>';
		jQuery(iframe360Expanded).insertBefore('#mainImageZoomExpanded');		
	},

	buildVideo: function() {
		//Remove existing player
		jQuery('#ecVideo').remove();

		var productContainer = jQuery('#productPage'),
			expanded = productContainer.hasClass('expanded');

		//Create new player
		var playerWidth = (expanded === true) ? '935px' : '300px';
			playerHeight = (expanded === true) ? '450px' : '250px';
			newPlayer = '<div id="ecVideo" style="height: ' + playerHeight +  ';width: ' + playerWidth + ';"></div>',
			el = jQuery('#productThumbnails .active');

		jQuery('#mainImage').append(newPlayer);

		showVideo(el.attr('data-code'));
		
		jQuery('#closeEC2').hide();
	},

	buildImage: function() {
		jQuery("#image360").remove();
		jQuery("#image360Expanded").remove();		
		jQuery('#mainImage').attr('data-type','prodImage');

		var mainImage = jQuery('#mainImageZoom'),
			expanded = (jQuery('#productPage').hasClass('expanded')) ? 'expand' : 'collapse',
			newImageSrc = this.elem.find("img").attr('src');

		expandMainImage.typeImage(expanded, newImageSrc);

		if(jQuery('#productPage').hasClass('expanded')) {
			jQuery('#closeEC2').show();
		} else {
			jQuery('#closeEC2').hide();
		}
	}
}


// On Ready Function
jQuery('document').ready(function() {
	updateCSRFToken();
	bindEnhancedContent();

	pcToaster.init(); // Call to initiate the parent/child Toaster banner

	if(jQuery('#productPage').hasClass('parentProduct')) {
		bindParentQtyChange('productPage');
		setStickyHeader();
		bindDropdown(true);
		bindHashChange();

		var urls=decodeURIComponent(window.location.href).split("#nav=");

		if(urls.length > 1) {
			updateChildren(urls[1], null, false, true);
			if(urls[1].indexOf("s_pp=true")>-1) {
				jQuery("#previouslyPurchasedChbx").attr('checked', true);
			}
		}
	}

	if(jQuery('#repairPartsSection').length > 0) {
		bindParentQtyChange('repairPartsSection');
		bindRepairPartVersion();
		jQuery('#repairPartsLink').show();
		jQuery('#repairPartsVersionList .viewAllVersionsLink').on('click',function() {
			showAllVersions();
		});
	}

	//EPRO - change image size for smaller viewport BEFORE firing imagezoom
	if ( typeof(eProUser) !== "undefined" && eProUser === true && jQuery('html').width() < 775) {
		var mainImageSource = jQuery("#mainImageZoom").attr('src').replace("$mdmain$", "$smmain$");

		jQuery("#mainImageZoom").attr("src", mainImageSource);
	}

	//imageZoom
	if(typeof zoomImage2 === "function") {
		zoomImage2();
	}

	// image trigger
	jQuery('#zoomTrigger').on('click',function() {
		expandMainImage.expand();
	});

	jQuery('#helpTextTrigger').on('click',function() {
	    jQuery("#helpOverlay360").show();
	});

	jQuery('#helpOverlay360').on('click',function() {
	    jQuery(this).hide();
	});

	jQuery(document).on("click","#helpTextTrigger",function() {
	    jQuery("#helpOverlay360").show(0,function(){
	    	jQuery("body").off(".overlay360").on("click.overlay360", function(){
	    		jQuery("#helpOverlay360").hide();
	   		});
	    });
	});

	jQuery('#backToTop').on('click',function(){
		jQuery("html, body").animate({
			scrollTop: jQuery('#header').height() }
		);
	});

	jQuery('#closeEC2').on('click',function() {
		expandMainImage.expand();
	});
	
	publishMotorMatchAnalytics();
	

	//product detail View More link
	if($('#copyTextSection')!=null && $('#copyTextSection')[0]!=null){
		var h = $('#copyTextSection')[0].scrollHeight;
	
		if(h <= 35){
			$('#additionalViewMore').hide();
			$('#additionalViewLess').hide();
			$('#copyTextSection').css({
		        'height': h
		    });
		}
		else {
			$('#copyTextSection').before("<div class='fade-out-productDetails'></div>");
		}
		
		$('#additionalViewMore').click(function(e) {
		    e.stopPropagation();
		    $('#copyTextSection').animate({
		        'height': h
		    },100);
		    $('#additionalViewMore').hide();
		    $('#additionalViewLess').show();
		    $(".fade-out-productDetails").remove();
		    
		});
		
		$('#additionalViewLess').click(function() {
		    $('#copyTextSection').animate({
		        'height': '30px'
		    },100);
		    $('#additionalViewLess').hide();
		    $('#additionalViewMore').show();
		    $('#copyTextSection').before("<div class='fade-out-productDetails'></div>");
		});
	}
	
	//tech Specs View More link
	if($('.techSpecsTable')!=null && $('.techSpecsTable')[0]!=null){
		var techH = $('.techSpecsTable')[0].scrollHeight;
	
		if(techH <= 200){
			$('#additionalTechViewMore').hide();
			$('#additionalTechViewLess').hide();
			$('.techSpecsTable').css({
		        'height': techH
		    });
		}
		else {
			$('.techSpecsTable').before("<div class='fade-out-technicalSpecs'></div>");
		}
		
		$('#additionalTechViewMore').click(function(e) {
		    e.stopPropagation();
		    $('.techSpecsTable').animate({
		        'height': techH
		    });
		    $('#additionalTechViewMore').hide();
		    $('#additionalTechViewLess').show();
		    $(".fade-out-technicalSpecs").remove();
		});
		
		$('#additionalTechViewLess').click(function() {
		    $('.techSpecsTable').animate({
		        'height': '200px'
		    });
		    $('#additionalTechViewLess').hide();
		    $('#additionalTechViewMore').show();
		    $('.techSpecsTable').before("<div class='fade-out-technicalSpecs'></div>");
		});
	}
	
	//image 360 layover
	$('#imageHelpIcon, .ieImageHelpIcon').on('click', function() {
		$('#imageHelpContent').removeClass('hide');
		return false;
	});
	$('#imageHelpClose').on('click', function() {
		$('#imageHelpContent').addClass('hide');
		return false;
	});
	$(document).on('click', function() {
		if (!$('#imageHelpContent').hasClass('hide')) {
			$('#imageHelpContent').addClass('hide');
		}
	});
	$(document).on('click', function() {
		if ($('.productThumbnails').hasClass('productThumbnailFullView')) {
			$('.imageHelpIconAlign').addClass('hide');
		}
	});
	$('.carouselItem').on('click', function() {
		if ($(this).hasClass('image360')) {
			$('.image-help-icon').removeClass('hide');
		} else {
			$('.image-help-icon').addClass('hide');
		}
	});
		
		
});

function publishECAnalytics(activeItem) {

	var slotNumber = activeItem.index() + 1,
		mediaType = activeItem.attr('data-type'),
		pageType = jQuery('#pageTypeAnalyticsId').val(),
		displayType = jQuery('#productPage').hasClass('expanded') ? 'Full Zoom' : 'Standard',
		ecMediaType = '';

	switch(mediaType) {
		case "prodImage":
			ecMediaType = 'Images';
			break;
		case "360Image":
			ecMediaType = '360 view';
			break;
		case "video":
			ecMediaType = 'Videos';
			break;
	}

	jQuery(window).trigger("Media",{pageType:pageType, mediaType:ecMediaType, displayType:displayType, slotNum:slotNumber});

}


function publishMotorMatchAnalytics(){
	var searchTerms = {},
	motorMatchKeyword = jQuery.urlParam('searchSKUs' ),
	motorMatchAttr = jQuery.urlParam('sgAttributes' );

	if(motorMatchAttr){

		var motorMatchAttrValues = motorMatchAttr.split('|');

		if(motorMatchAttrValues.length > 1) {
			//Remove NA values from the filters
			for (var i = motorMatchAttrValues.length - 1; i >=0; i--) {
				var arr = motorMatchAttrValues[i].split(':');
				if(arr[1] == "N/A"){
					motorMatchAttrValues.splice(i,1);
				}else{
					break;
				}
			}

			searchTerms.SearchBreadCrumb = 'Source:MotorMatch Selection Guide|' + motorMatchAttrValues;
			var motorMatchLastFilter = motorMatchAttrValues.pop(),
			motorMatchLastFilterValue = motorMatchLastFilter.split(':');
			searchTerms.SearchDimension = motorMatchLastFilterValue[0];
			searchTerms.SearchValue = motorMatchLastFilterValue[1];
		} else {
			var motorMatchKeywordFilter = motorMatchAttr.split(":");
			searchTerms.SearchDimension = 'Motor Match Keyword';
			searchTerms.SearchValue = motorMatchKeywordFilter[1];
			searchTerms.SearchBreadCrumb = "Motor Match Keyword:" + motorMatchKeywordFilter[1];
		}

		searchTerms.NumOfResults = 1;

		if(page_variables){
			page_variables.SEARCH_TERMS = searchTerms;
		}
	}
}
