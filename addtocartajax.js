var dlg;
var product;
var val;
var sensitiveItemlist = new Array();
var cartItems = new Array();
var quantities = new Array();

/*
 * Close the addTocartmodel.jsp
 * update the cart items in the cart
 */
function hideAddToCartDialog(pageSource) {
	Grainger.Modals.killModal();

	AkamaiCookie.updateQuickCartCount();

	/* If the pagesource is from the purchasedItems then reload the entire page */
	if($("#isCartPage").val() === 'true' ){
		setTimeout("location.reload(true);", 200);	
	}
	else if(pageSource != null){
		if(pageSource == "purchasedItems"){
			reloadOrderHistoryPage();
	    } else if(pageSource == 'addToOrder' || pageSource == 'pendingOrder') {
	    	setTimeout("location.reload(true);", 500);
	    }
	}
	jQuery('.lt-ie9 .pdf-menu #pdf-container').show();
}

function reloadOrderHistoryPage() {
	/* Yes, we're getting into specific code for specific pages. Bah. */
	var defaultTab = "";
	if(jQuery('#orderhistoryOrdersTab') != null && jQuery('#orderhistoryItemsTab') != null){
		if(jQuery('orderhistoryItemsTab').hasClass('active') && window.location.toString().indexOf("purchased") < 0){
			if(window.location.toString().indexOf('?') > 0){
				defaultTab = "&purchased";
			} else {
				defaultTab = "?purchased";
			}
		}
	}
	window.location = window.location + defaultTab;
}

//TODO review and fix validation error
function addToCartWithCustomProduct(customProductEntryJson) {

	Grainger.Modals.waitModal("addToCart", "addToCart");

	jQuery.ajax({
		url : "/cart/addToCartWithCustomProduct",
		data : customProductEntryJson,
		type : "POST",
		mimetype : "text/html",
		success : function(type, value, evt) {
			if (value.indexOf("refreshPage") == -1) {
				Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);
				jQuery(".s7LazyLoad").unveil();
				intelligentOfferAddtoCart(prodcode);
			} else {
				setTimeout("location.reload(true);", 500);
			}
		},
		error : function(type, error) {
			console.error("Error  " + error);
			Grainger.Modals.killModal();
		}
	});
}

/**
 * Add one Sourcing item to cart.
 * @param {string} sourcingItemCode
 * @param {number} index the index of the item in current page.
 * @param {number} minimumQty The minimum ordering quantity.
 * @param {boolean} viewByItem true if add to cart from view by item page.
 */
function addToCartWithSourcingProduct(sourcingItemCode, index, minimumQty, viewByItem) {
	var soiContent = {};
	soiContent['sourcingItemCode'] = sourcingItemCode;
	soiContent['sourceItemQuantity'] = jQuery('#qty' + index).val();
	soiContent['viewByItem'] = viewByItem;

	if (!isValidQtyAvl('qty' + index)) {
		return false;
	}

	if (soiContent.sourceItemQuantity < minimumQty) {
		alert(jQuery('#minimumQtyMessage').text());
		jQuery('#qty' + index).val(minimumQty);
		return false;
	}
	Grainger.Modals.waitModal("addToCart", "addToCart");
	jQuery.ajax({
		url : "/cart/addSourcingItemToCart",
		data : soiContent,
		type : "POST",
		mimetype : "text/html",
		success : function(type, value, evt) {
				if (value.indexOf("refreshPage") == -1) {
					val = value;
					Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);
					jQuery(".s7LazyLoad").unveil();

				} else {
					setTimeout("location.reload(true);", 500);
				}
		},
		error : function(type, error) {
			console.error("Error  " + error);
			Grainger.Modals.killModal();
		}
	});
}

function addToCartWithEntireSourcingQuoteAndQtyUpdate(sourcingQuoteId, countOnPage) {
	Grainger.Modals.waitModal("addToCart", "addToCart");
	var soiContent, index, productAndQuantity, minimumQuantity;

	soiContent = {};
	soiContent.sourcingQuoteId = sourcingQuoteId;
	soiContent.productAndQuanties = [];

    for (index = 0; index < countOnPage; index++) {

        minimumQuantity = jQuery('#sourcingProductMinimum' + index).val();
        productAndQuantity = {};
        productAndQuantity.product = jQuery('#sourcingProductCode' + index).val();
        productAndQuantity.quantity = jQuery('#qty' + index).val();
        soiContent.productAndQuanties.push(productAndQuantity);

        if (!isValidQtyAvl('qty' + index)) {
            return false;
        }

        if (productAndQuantity.quantity < minimumQuantity) {
            alert(jQuery('#minimumQtyMessage').text());
            jQuery('#qty' + index).val(minimumQuantity);
            return false;
        }
    }

	jQuery.ajax({url: "/cart/addToCartWithEntireSourcingQuoteAndQtyUpdate", type: "POST", data: JSON.stringify(soiContent),
		contentType: "application/json"}).done(function(data) {

		if (data.indexOf("refreshPage") == -1) {
			val = data;
			Grainger.Modals.createAndShowModal("addToCart", "addToCart", val, 'sourcingQuotesModal');
			jQuery(".s7LazyLoad").unveil();

		} else {
			setTimeout("location.reload(true);", 1500);
		}
	}).error(function(jqXHR, textStatus, errorThrown) {
		console.log(textStatus);
		Grainger.Modals.killModal();
	});
}

function addToCartWithEntireSourcingQuote(sourcingQuoteId) {
	Grainger.Modals.waitModal("addToCart", "addToCart");
	var soiContent;

	soiContent = {};
	soiContent.sourcingQuoteId = sourcingQuoteId;

	jQuery.ajax({url: "/cart/addEntireSourcingQuoteToCart", type: "POST", data: soiContent}).done(function(data) {

		if (data.indexOf("refreshPage") == -1) {
			val = data;
			Grainger.Modals.createAndShowModal("addToCart", "addToCart", val, "sourcingQuotesModal");
			jQuery(".s7LazyLoad").unveil();

		} else {
			setTimeout("location.reload(true);", 1500);
		}
	}).error(function(jqXHR, textStatus, errorThrown) {
		console.log(textStatus);
		Grainger.Modals.killModal();
	});
}

function addtocart(prodcode, quickAdd, index, functionCode, baseItem) {
	if (isBlank(index)) {
		index = "";
	}
	
	var quantityelement = "quantity" + index;

	var prodquantity = 1;
	var parentZoneId = jQuery('#parentZoneId').val();

	if (jQuery('#' + prodcode) != null && typeof jQuery('#' + prodcode).val() === 'number' && jQuery('#' + prodcode).val() % 1 == 0) {
		prodquantity = jQuery('#' + prodcode).val();
	} else {
		if (jQuery('#' + quantityelement).doesExist()) {
			prodquantity = jQuery('#' + quantityelement).val();
		}
	}
	
	var warranty = "";
	var warrantyCheckElement = "warrantyCheck" + prodcode;

	if (jQuery('#' + warrantyCheckElement).doesExist()) {
		if (jQuery('#' + warrantyCheckElement).is(':checked')) {
			warranty = "warranty=true";
		}
	}
	
    var orderCode = jQuery.urlParam("ordercode");
    var params = { warranty: warranty, ordercode: (orderCode != null && orderCode != "") ? orderCode : "" }
	var queryParams = jQuery.param(params);

	var myContent = {};
	myContent['productCode'] = prodcode;
	myContent['quickAdd'] = quickAdd;
	myContent['quantity'] = prodquantity;
	myContent['functionCode'] = functionCode;
	myContent['baseItem'] = baseItem;
	myContent['CSRFToken'] = $('input[name="CSRFToken"]').val();
	myContent[jQuery("#secureToken > input:first").attr('name')] = jQuery("#secureToken > input:first").val();
	myContent['modal'] = 'true'

	Grainger.Modals.killModal();

	Grainger.Modals.waitModal("addToCart", "addToCart");

	jQuery.ajax({
		url : "/cart/add?" + queryParams,
		data : myContent,
		type : "POST",
		mimetype : "text/html",
		success : function(type, value, evt) {
            if (value.indexOf("refreshPage") == -1) {
                val = value;

                Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);

                jQuery(".s7LazyLoad").unveil();

                intelligentOfferAddtoCart(prodcode, parentZoneId);
            } else {
                setTimeout("location.reload(true);", 500);
            }
		},
		error : function(type, error) {
			alert("Error  " + error);
			Grainger.Modals.killModal();
		}
	});
}


function intelligentOfferAddtoCart(prodcode, parentZoneId) {
	segmentValue = jQuery.cookie('segment');

	var firstRecommendationZone = jQuery("#firstRecommendationZone").val();

	//Excluding Add to Cart zone for dynamic quickview to generate recommendations from parent
	if(typeof parentZoneId !== "undefined" && parentZoneId !== 'A2CBTZ4'){
		firstRecommendationZone = parentZoneId;
		if( jQuery('#addtocart-items-box').length ) {
			jQuery("#addtocart-items-box").attr('id', jQuery("#addtocart-items-box").attr('id')+"-"+parentZoneId);
		}
	}

	var secondRecommendationZone = jQuery("#secondRecommendationZone").val();
	var categoryId = jQuery("#categoryId").val();
	
	
}

// this method is nasty, and really took a beating with the jquery conversion
// doubt this will work
function dataCheckInCarouselAddToCart() {
	var datalength = jQuery('#carouseladdtocart > .carouselwrap > .carousel-box > .carouselscroll > em > .carouselscrollbox').length;
	
	if (datalength != null && datalength > 4) {
		jQuery('#carouseladdtocart > .carouselwrap > .carouselprev, #carouseladdtocart > .carouselwrap > .carouselnext').removeClass('hide');
	}
	
	var ordercode = jQuery.urlParam("ordercode");
	
	if(datalength != null && ordercode != undefined && ordercode !=null && ordercode != ''){
		jQuery('#carouseladdtocart > .carouselwrap > #addtocart-items-box > #addtocart-items-box_Carousel > .carouselContainer > .carouselProductLists > .carouselProduct > .carouselAddToCart > .button > .add-to-cart').val("Add To Order");
		
		jQuery('#carouseladdtocart > .carouselwrap > .carousel-box > .carouselscroll > em > .carouselscrollbox > .item ').each(function(index) {
			jQuery('a').each(function(index) {
				var imgNodes = jQuery(this).find('img');
				if(imgNodes != null && imgNodes[0] != null){
					jQuery(this).replaceWidth(imgNodes[0]);
				}
			});
			jQuery('.item-detail > .product-name').each(function(index) {
				var label = node.innerHTML;
				var p = jQuery('<p/>');
				p.html(label);
				jQuery(p).addClass("product-name");
				jQuery(node).replaceWith(p);
			});
		});
		
	}
	
	jQuery("#addToCartModal .s7LazyLoad").unveil(300);

}

function addToOrderFromHomePage(prodcode, qty, pageSource, functionCode,quoteNumber, sectionId, event) {
	// specific to Homepage ATC
	if (event != null) {
		if (sectionId == "productOnSale") {
			$('#pageZone').val('productOnSale');
		} else if (sectionId == "mostPopularProduct") {
			$('#pageZone').val('mostPopularProduct');
		}
	}
	addtoorder(prodcode, qty, pageSource, functionCode, quoteNumber, sectionId);
}

function addtoorder(prodcode,qty,pageSource,functionCode, quoteNumber,sectionId) {
	if (isBlank(prodcode)) {
		return;
	}

	if (isBlank(qty)) {
		qty = 1;
	} else {
		qty=$.trim(qty);
	}

	if(sectionId =="relatedProducts"){
		$('#pageZone').val('relatedProducts');
	}
	else if(sectionId =="alternateProducts"){
		$('#pageZone').val('alternateProducts');
	}
	else if (sectionId =="recommendedProducts"){
		$('#pageZone').val('recommendedProducts');
	}
	else if (sectionId =="replacementProduct"){
		$('#pageZone').val('replacementProduct');
	}
	
	/* Default to searchResultsItems to do only Ajax refresh. */
	if(isBlank(pageSource)){
		pageSource = "searchResultsItems";
	}
	else if (pageSource =="productListComponent"){
		$('#pageZone').val(pageSource);
	}else{
		if(pageSource == "searchResultsItems"){
			if(isMotormatch()){
				if (jQuery('#gridOrList').hasClass('showGrid')) {
					functionCode = "MMGVES";
				} else {
					functionCode = "MMLVES";	
				}	
			}
		}
	}

	/* moved logic from addtoorder with 2 arguments here since it was not being called in the onClick if statement. */
	if(isBlank(functionCode)){
		if (jQuery('#gridOrList').hasClass('showGrid')) {
			functionCode = "GVES";
		} else {
			functionCode = "LVES";	
		}
	}
	var myContent = {};
	myContent['productCode'] = prodcode;
	myContent['quickAdd'] = 'true';
	myContent['quantity'] = qty;
	myContent['pageSource'] = pageSource;
	myContent['functionCode'] = functionCode;
	myContent[jQuery("#secureToken > input:first").attr('name')] = jQuery("#secureToken > input:first").val();
	myContent['modal'] = 'true';
	myContent['quoteNumber'] = quoteNumber;
	myContent['CSRFToken'] = $('input[name="CSRFToken"]').val();
	myContent['_requestConfirmationToken'] = $("#pageSizeForm input[name=_requestConfirmationToken]").val();
	
	Grainger.Modals.waitModal("addToCart", "addToCart");
	
	var bindArgs = {
		url : "/cart/Add",
		data :myContent,
		type : "POST",
		mimetype : "text/html",
		success : function(type, value, evt) {

			if (value == null) {
				setTimeout("location.reload(true);", 500);
			} else if (value.indexOf("restrictedStates") != -1) {

				materialExceptions(prodcode, false, functionCode);
			} else {
				if (value.indexOf("refreshPage") == -1) {

					val = value;
					Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);
					jQuery(".s7LazyLoad").unveil();

					intelligentOfferAddtoCart(prodcode);
				} else {
					setTimeout("location.reload(true);", 500);
				}
			}

		},
		error : function(xhr,type, error) {
			if(xhr.status==401 ||xhr.status==404){
				window.location.reload();
			}
			else{
				alert("Error  " + error);
				Grainger.Modals.killModal();
			}
		}
	};
	
	jQuery.ajax(bindArgs);
}

function renderAddToCartModal(prodcode, functionCode) {
	var cmFunctionCode = "";
	/* not the same as isNotEmpty!!! */
	if (isNotEmpty(functionCode)) {
		cmFunctionCode = functionCode;
	}

	var url = contextPath + "/modal/addtocart"
	var ordercode = jQuery.urlParam("ordercode");
	if(ordercode != undefined && ordercode !=null && ordercode != ''){
		url += "?ordercode=" + ordercode;
	}
	
	Grainger.Modals.waitModal("addToCart", "addToCart");

	var bindArgs = {
		url : url,
		data : {
			productCode : prodcode,
			functionCode: cmFunctionCode
		},
		type : "POST",
		mimetype : "text/html",
		success : function(type, value, evt) {

			if (value.indexOf("refreshPage") == -1) {
				val = value;
				Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);
				jQuery(".s7LazyLoad").unveil();

				intelligentOfferAddtoCart(prodcode);
			} else {
				setTimeout("location.reload(true);", 500);
			}
		},
		error : function(type, error) {
			alert("Error  " + error);
			Grainger.Modals.killModal();
		}
	};

	jQuery.ajax(bindArgs);
}

function materialExceptions(prodcode, ckynq, functionCode, isAlternateModal) {
	var restrictionYesNoQ = "",
		cmFunctionCode = "",
		postData;

	if (isNotEmpty(functionCode)) {
		cmFunctionCode = functionCode;
	}
	
	if (jQuery('#restrictionYesNoQ') != null) {
		restrictionYesNoQ = jQuery('#stateRestrictionQuestion [name="restrictionYesNoQ"]:checked').val();
	}

	if (ckynq == true) {
		if (typeof restrictionYesNoQ === 'undefined' || restrictionYesNoQ === '') {
			jQuery("#staterestrictionmessage").removeClass("hidden");
			return;
		}
	}

	var invalidCartItems = jQuery("#invalidProdCodes").val(),
		url = contextPath + "/modal/materialExceptionsModal?materialExceptionsModal",
		ordercode = jQuery.urlParam("ordercode");

	if(ordercode != undefined && ordercode !=null && ordercode != ''){
		url += "&ordercode=" + ordercode;
	}

	var postData = {
			productCode : prodcode,
			restrictionYesNoQ : restrictionYesNoQ,
			functionCode: cmFunctionCode,
			invalidProductCodes: invalidCartItems
		};

	Grainger.Modals.waitModal("addToCart", "addToCart");

	var bindArgs = {
		url: url,
		data: postData,
		type: 'POST',
		mimetype : "text/html",
		success : function(data, value, evt) {
			if (data.indexOf("refreshPage") != -1) {
				/* If nothing is added to the cart, just refresh the current page and don't show the modal window. */
				var sURL = unescape(window.location.href);
				window.location.replace(sURL);
			} else {
				/* AJAX call's return data need to be shown in modal window.
				 * It may be state restricted info, low lead restricted info, alternate items info,
				 * or add-to-cart modal.
				 */
				val = value;
				Grainger.Modals.createAndShowModal("addToCart", "addToCart", data);
				intelligentOfferAddtoCart(prodcode);
			}
			jQuery(".s7LazyLoad").unveil();
		},
		error : function(type, error) {
			alert("Error  " + error);
			Grainger.Modals.killModal();
		}
	};

	jQuery.ajax(bindArgs);
}

function setSensitiveItem(val, item) {
	var nextelement = 0;

	if (sensitiveItemlist.length > 0) {
		nextelement = sensitiveItemlist.length;
	}
	sensitiveItemlist[nextelement] = val + ":" + item;
}

function sensitiveItems(cartItems) {

	Grainger.Modals.waitModal("addToCart", "addToCart");

	var bindArgs = {
		url : "/modal/materialExceptionsModal?materialExceptionsModal",
		content : {
			cartItems : sensitiveItemlist
		},
		type : "POST",
		data : jQuery("#senstiveItems").serialize(),
		mimetype : "text/html",
		success : function(type, value, evt) {

			if (value.indexOf("addToCart") != -1) {
				var query = getCurrentUrlParams();
				var prodcode = query.prodcode;

				renderAddToCartModal(prodcode);
			} else if (value.indexOf("refreshPage") != -1) {

				setTimeout("location.reload(true);", 500);
			} else {
				sensitiveItemlist = new Array();
				val = value;
				Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);
				jQuery(".s7LazyLoad").unveil();

				intelligentOfferAddtoCart(prodcode);
			}
			
		},
		error : function(type, error) {
			alert("Error  " + error);
			Grainger.Modals.killModal();
		}
	};

	jQuery.ajax(bindArgs);
}


function cartEntryStateRestrictions(prodcode) {

	Grainger.Modals.waitModal("addToCart", "addToCart");

	var bindArgs = {
		url : "/modal/materialExceptionsModal?cartStateRestrictionsModal",
		data : {
			productCode : prodcode
		},
		type : "POST",
		mimetype : "text/html",
		success : function(data, value, evt) {
			val = value;
			Grainger.Modals.createAndShowModal("addToCart", "addToCart", data);
			jQuery(".s7LazyLoad").unveil();

			intelligentOfferAddtoCart(prodcode);
		},
		error : function(type, error) {
			alert("Error  " + error);
			Grainger.Modals.killModal();
		}
	};

	jQuery.ajax(bindArgs);
}


/**
 * Gets the url parameters on the url curently in the browser address bar
 * @function getCurrentUrlParams
 * @returns {object} key value pairs of parameters and their values
 */
function getCurrentUrlParams() {
	var uri = location.href,
		query = uri.substring(uri.indexOf("?") + 1, uri.length);

	return jQuery.parseParams(query);
}

function addtocartfromidp(prodcode, functionCode, baseItem) {

	var	index = prodcode;

	if(isValidQtyAvl('quantity' + index)){
		if(baseItem == null || baseItem == ''){
			baseItem = prodcode;
		}
		addtocart(prodcode, 'true', index, functionCode, baseItem );
	}
	return false;	
}

function addQuoteItemsToCart(quoteId){
	var myContent = {};
		myContent['quickAdd'] = 'true';
		myContent[jQuery("#secureToken > input:first").attr('name')] = jQuery("#secureToken > input:first").val();
		myContent['modal'] = 'true';
		myContent['_requestConfirmationToken'] =$("#searchbarHeader input[name=_requestConfirmationToken]").val();
  	Grainger.Modals.waitModal("addToCart", "addToCart");

  	var bindArgs = {
		url : contextPath+ "/cart/addQuoteToCart?quoteId=" + quoteId,
		data : myContent,
		type : "POST",
		mimetype : "text/html",
		success : function(type, value, evt) {
				if (value.indexOf("refreshPage") == -1) {
					val = value;
					Grainger.Modals.createAndShowModal("addToCart", "addToCart", type, "sourcingQuotesModal");
					jQuery(".s7LazyLoad").unveil();

				} else {
					setTimeout("location.reload(true);", 500);
				}
		},
		 error: function(jqXHR, error, errorThrown) {
			alert(jqXHR.responseText);
			Grainger.Modals.killModal();
		}
	};

	jQuery.ajax(bindArgs);
}

function getAllUnpublishedPOLists(productCode){
	$.ajax({
		type : "GET",
		url : contextPath+"/my-account/microsites/getUnpublishedPoLists?&productCode="+productCode,
		dataType : "text",
		cache: false,
		success : function(data) {
			Grainger.Modals.createAndShowModal('getPoLists','getPoLists',data);
		}
	});
}

function addToPOList(productCode){
	data = jQuery("#addToPoListForm");
	dataString = data.serialize();
	$.ajax({
		type : "POST",
		data: dataString,
		url : contextPath+"/my-account/microsites/addToPolist", 
		dataType : "text",
		cache: false,
		success : function(data) {
			Grainger.Modals.createAndShowModal('getPoLists','getPoLists',data);
		}
	});
}



function addMultiItemsToCart(pageSource, functionCode, baseItem) {

	if(typeof products == "undefined" || typeof products.itemsToAdd == "undefined") {
		products = {};
		products.itemsToAdd = [];
	}
	
	if(products.itemsToAdd.length < 1) {
		alert('Please input a valid quantity');
		return;
	}
	
	/* Split products object into two arrays */
	
	var prodcode,
		productCodes = [],
		quantities = [];
	
	jQuery.map(products.itemsToAdd, function( item, index ) {
		productCodes.push(item.code);
		quantities.push(item.quantity);
	});

	if(productCodes.length > 0) {
		prodcode=productCodes[productCodes.length-1];
	}

	var myContent = {
		'cartItems' : productCodes,
		'quantities' : quantities,
		'quickAdd' : 'true',
		'pageSource' : pageSource,
		'functionCode' : functionCode,
		'baseItem' : baseItem,
		'modal' : 'true'
	};
	myContent[jQuery("#secureToken > input:first").attr('name')] = jQuery("#secureToken > input:first").val();

	Grainger.Modals.waitModal("addToCart", "addToCart");

	jQuery.ajax({
		url : "/cart/multiAdd",
		data : myContent,
		type: "POST",
		traditional: true,
		success : function(type, value, evt) {

			if (value.indexOf("refreshPage") == -1) {
				//reset input values to blank
				jQuery('[data-type=product]').val('');

				// Reset products
				products = {};
				products.itemsToAdd = [];

				Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);
				jQuery(".s7LazyLoad").unveil();

				//intelligentOfferAddtoCart(prodcode);
			} else {
				setTimeout("location.reload(true);", 250);
			}

		},
		error : function(jqXHR, textStatus,errorThrown) {
			alert("Error  " + errorThrown);
			Grainger.Modals.killModal();
		}
	});
}

function addToCartFromChildIDP(prodcode) {
	$('#pageZone').val('productAddtoCart');
	if(isValidQtyAvl('quantity' + prodcode)){

		Grainger.Modals.waitModal("addToCart", "addToCart");

		var tokenName = jQuery("#secureToken input").attr('name'),
		    tokenValue = jQuery("#secureToken input").val(),
		    cartRestrictedModalLength;

		data = jQuery("#addItemsToCartFromIdp");
		if(isMotormatch()){
			data[0].functionCode.value = 'MMPD';
		}
		dataString = data.serialize();		
		jQuery.ajax({
			type: "POST",
	        url: "/cart/multiAdd" + "?fromIdp=true" + "&" + tokenName + "=" + tokenValue,
	        data: dataString,
	        dataType: "text",
	        success : function(value) {	
	        	if (value == null) {
	        		setTimeout("location.reload(true);", 500);
	        	} else {
	        		
	        		if (value.indexOf("refreshPage") == -1) {
	        			
	        			Grainger.Modals.createAndShowModal('addToCart','Add To Cart',value,'');
	        			//intelligentOfferAddtoCart(prodcode); // Changed for IIB-1489
	        			cartRestrictedModalLength = jQuery("#cartRestrictedModal").length;
	        			if( cartRestrictedModalLength > 0 ) {
							jQuery(document).on("keydown.restrictedModal", function (e) {	
								var key = e.keyCode;
								
								if (key == 27) {									
									if( cartRestrictedModalLength > 0 ) {
		        					    materialExceptions(prodcode, true, 'PDPD', false);		        					           					    
										return false;
									}									
	        					}						   
							});
	    	        	} 	 
	        			jQuery(".s7LazyLoad").unveil();

	        		} else {
	        			setTimeout("location.reload(true);", 500);
	        		}
	        	}
	        },
	        error: function(error,xhr) {
                /* An error occurred during the add operation, for now direct the user to the error page. */
                /* At some point proper user messaging should be displayed, however the error page is better than nothing */
	        	if (xhr.status==401 || xhr.status==404) {
	        		window.location.reload();
	        	} else {
	        		alert("Error, favor de intentar nuevamente | Something went wrong, please try again");
	        		window.location.replace('/error/404');
	        	}
                return false;
	        }
		});
	}
	return false;
}

function addtocartfromrta(prodcode) {
	

	var sessionSearchAddTokenVal = $("#bulkorderSingleAddForm input[name=_requestConfirmationToken]").val();

	if(isValidQtyAvl('quantityAvlRta' + prodcode)){
		Grainger.Modals.waitModal("addToCart", "addToCart");
		var quantity=jQuery('#quantityAvlRta'+prodcode).val();
		jQuery.ajax({
			type: "POST",
	        url: "/cart/multiAdd",
	        data: {'quantity':quantity,'productCode':prodcode, '_requestConfirmationToken':sessionSearchAddTokenVal},
	        dataType: "text",
	        success : function(value) {	
	        	if (value == null) {
	        		setTimeout("location.reload(true);", 500);
	        	} else {
	        		
	        		if (value.indexOf("refreshPage") == -1) {
	        			
	        			Grainger.Modals.createAndShowModal('addToCart','Add To Cart',value,'');
	        			//intelligentOfferAddtoCart(prodcode); // Changed for IIB-1489
	        			cartRestrictedModalLength = jQuery("#cartRestrictedModal").length;
	        			if( cartRestrictedModalLength > 0 ) {
							jQuery(document).on("keydown.restrictedModal", function (e) {	
								var key = e.keyCode;
								
								if (key == 27) {									
									if( cartRestrictedModalLength > 0 ) {
		        					    materialExceptions(prodcode, true, 'PDPD', false);		        					           					    
										return false;
									}									
	        					}						   
							});
	    	        	} 	 
	        			jQuery(".s7LazyLoad").unveil();

	        		} else {
	        			setTimeout("location.reload(true);", 500);
	        		}
	        	}
	        }
		});
	}
}


function replaceCartItem(originalProductCode, newProdCode) {
	
	var form = jQuery("#cartAlternatesItemForm");
	
	if(form.length > 0) {	
		
		var qty = jQuery("#replaceQty-"+originalProductCode+"-"+newProdCode).val();
		
		if(isValidQtyAvl("replaceQty-"+originalProductCode+"-"+newProdCode)){
			var reqParams = {};
			
			reqParams.newProdCode = newProdCode;
			
			var ordercode = jQuery("#alternatesItem-orderCode").val();
			
			if(ordercode != undefined && ordercode !=null && ordercode != ''){
				reqParams.ordercode = ordercode;
			}
			
			jQuery("#alternatesItem-quantity").val(qty);
				
			var actionPath = "/cart/replaceCartEntry?" + jQuery.param(reqParams);
			
			form.removeAttr('onsubmit');
			form.attr('action', actionPath);
			form.submit();
		}
	}
	return false;
}

function isMotormatch(){
	return jQuery.urlParam('sgAttributes' );
}

function buildCatalogPageUrl(pageNumber){
	var pdfCatalogURL=$(".pdfCatalogLinkTargetURL").text()+'&pdfName=';
	document.location.href= pdfCatalogURL+pad(pageNumber, 4) + '.pdf';
}

$(document).ready(function ()
{
	$(".quantity").keydown(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			return false;
		}
	});
});

function addFromAutoSuggestionToCart(itemNumber){
	var sessionOHTokenVal=$("#miniCartLinkForm input[name=_requestConfirmationToken]").val();
	var quantity = $('#quantity' + itemNumber).val();
	if(isValidQtyAvl('quantity' + itemNumber)){
		Grainger.Modals.waitModal("addToCart", "addToCart");
        var postData = {};
        postData['productCode'] = itemNumber;
        postData['quantity'] = quantity;
        postData['_requestConfirmationToken'] = sessionOHTokenVal;
        postData['pageZone'] = "Type Ahead";
        postData['CSRFToken'] = $('input[name="CSRFToken"]').val();

        jQuery.ajax({
            url : ACC.config.contextPath + "/cart/Add",
            data : postData,
            type : "POST",
            mimetype : "text/html",
            success : function(type, value, evt) {
                if (value.indexOf("refreshPage") == -1) {
                    val = value;

                    Grainger.Modals.createAndShowModal("addToCart", "addToCart", type);
                    populateAutoSugestionATCDataDom();

                    jQuery(".s7LazyLoad").unveil();

                } else {
                    setTimeout("location.reload(true);", 500);
                }
            },
            error : function(type, error) {
                console.log("Error  " + error);
                $('.modal').addClass('hide');
                Grainger.Modals.killWaitModal();
            }
        });
	}

}
