jQuery('document').ready(function() {

	//look-up and set Tax rate for non-Checkout pages
	if (Session.isNonCheckoutPageForTaxRate()) {
		Session.setTaxRateOnPostalLookupForNonCheckout(null, null, null, true);
		Session.refreshPageOnTaxChange();
	}
});

var Session = {
	
	isTaxRateRefresh : false,	
		
	updateDeliveryMode : function(delivermode, successCallback, failureCallback) {
		$.ajax({
			cache : false,
			type : 'GET',
			url : "/rta/setDeliveryMode?deliveryMode="+delivermode,
			async: false,
			success : function() {
				if (successCallback) {
					successCallback();
				}
			},
			failure : function() {
				if (failureCallback) {
					failureCallback();
				}
			}
		});
	},


  getRtaAvailability : function(deliveryMethod, id,qtyChange) {
	  var pdpAvailabilityUrl = "/rta/" + deliveryMethod + "/" + id;
	  if (typeof products == "undefined"
		  || typeof products.itemsToAdd == "undefined") {
		  products = {};

	  }

	  var pageType = jQuery('#pageType').val();
	  var isLineLevel = "";
		  if ((pageType == 'LISTDETAILS') || Session.isSharedCartPage()
				|| Session.isSearchPage() || Session.isProductListComponent()) {
			isLineLevel = "Y";
		}
	  pdpAvailabilityUrl = pdpAvailabilityUrl +'?lineLevel=' + isLineLevel;
	  
	  var prodcode = '';
	  $(".productAvailabilityMessage").addClass("hide");
	  var noOfItems = $(".prodCode").length;
	  var noDiscontinuedItems =$(".dgdvItem").length; // DG/DV + not online
	  var noOfWgWvLimitedQtyItems =$(".wgwvItem").length;
	  
	  if( (pageType == 'LISTDETAILS') || Session.isSharedCartPage()){
		  $(".prodCode").each(function() {
			  prodQty = $("#product-desired-qty-" + escapeProdSpecialCharacters( $(this).val())).val();
			  if (!jQuery.isEmptyObject(prodQty) && prodQty != ''){
				  products[$(this).val()] = prodQty;
			  }
		  });
	  } else {
		  $(".prodCode").each(function() {
			  prodcode = escapeProdSpecialCharacters( $(this).val());
			  products[$(this).val()] = $("#qty" + prodcode).val();
		  });

	  }
	  //data excludes Discontinued + online not available products
	  var data = JSON.stringify(products);
	  $.ajax({
		  cache : false,
		  type : 'POST',
		  url : pdpAvailabilityUrl,
		  data : data,
		  contentType : "application/json",
		  success : function(data) {
			  if (null != data && !jQuery.isEmptyObject(data)) {
				  var isNoneAvailable = true;
				  var noWSLItemsWithoutInv = 0;
				  var noWSLWithInv = 0;
				  
				  
					  $.each(data, function(index, result) {
						  var prodcodeIndex = escapeProdSpecialCharacters(index);
						 var productData =  JSON.parse(result);
						 var avlDate = Session.checkAvailDate(productData.availabilitydate);
						if (isEmpty(avlDate)) {
							if (Session.isSearchPage() || Session.isProductListComponent()) {
								 $("span#pickupAvailDate" + prodcodeIndex).each(function()
										 {
				    						$(this).html(
													$("#rtaItemUnavailable")
													.val());
										});
							} else {
								$("#pickupAvailDate" + prodcodeIndex + ':visible').html(
									$("#rtaItemUnavailable")
										.val());
							}
						}
						else if ('ship' === deliveryMethod) {
							 if( (pageType == 'LISTDETAILS') || Session.isSharedCartPage() ){
								 
								 $("#pickupAvailDate" + prodcodeIndex).html(
										  $("#rtaShippingAvailabilityDatesMsg")
										  .val()
										  + " <br>" + Session.checkAvailDate(productData.availabilitydate));
							 }else if (Session.isSearchPage() || Session.isProductListComponent()) {
								 
								 $("span#pickupAvailDate" + prodcodeIndex).each(function()
										 {
				    						$(this).html(
													  $("#rtaShippingAvailabilityDatesMsg")
													  .val()
													  + " " + Session.checkAvailDate(productData.availabilitydate));
										});
							 } else {
								
								 $("#pickupAvailDate" + prodcodeIndex).html(
										  $("#rtaShippingAvailabilityDatesMsg")
										  .val()
										  + " " + Session.checkAvailDate(productData.availabilitydate));
							 }

						  } else {
							  if( (pageType == 'LISTDETAILS') || Session.isSharedCartPage()){
								 								  
								  $("#pickupAvailDate" + prodcodeIndex).html(
										  $("#rtaPickUpAvailabilityDatesMsg")
										  .val()
										  + " <br>" + Session.checkAvailDate(productData.availabilitydate));
							  }else if(Session.isSearchPage() || Session.isProductListComponent()) {
								  $("span#pickupAvailDate" + prodcodeIndex).each(function()
											 {
					    						$(this).html(
														  $("#rtaPickUpAvailabilityDatesMsg")
														  .val()
														  + " " + Session.checkAvailDate(productData.availabilitydate));
					   
											});
							  }else {
								  
								  $("#pickupAvailDate" + prodcodeIndex).html(
										  $("#rtaPickUpAvailabilityDatesMsg")
										  .val()
										  + " " + Session.checkAvailDate(productData.availabilitydate));
							  }

						  }
						 $(".manageAvailability").removeClass("hide");
						 if(productData.salesStatus == 'WG' || productData.salesStatus == 'WV') {
							 (productData.availableQty == 0) ? noWSLItemsWithoutInv = noWSLItemsWithoutInv + 1
															: noWSLWithInv = noWSLWithInv + 1;
						 }
						 if (Session.isSearchPage() || Session.isProductListComponent()) {
							  if(productData.salesStatus == 'WG' || productData.salesStatus == 'WV') {
								  if(productData.availableQty == 0){
									  $(".pickupAvailDate#pickupAvailDate" + prodcodeIndex).html(" ");
									  $(".componentpickupAvailDate#pickupAvailDate" + prodcodeIndex).html(" ");
									  $("#noInventoryWSLMsg_"+ prodcodeIndex).removeClass('hide');
									  $("#limitedWSLMsg_"+ prodcodeIndex).addClass('hide');
								  }else {
									  //reset on inventory 
									  $("#cartButton" + prodcodeIndex).removeClass('disabled');
									  $("#cartButton" + prodcodeIndex).removeAttr('disabled');
									  $("#qty" + prodcodeIndex).removeAttr('disabled');
									  $("#qty" + prodcodeIndex).removeClass('disabled');
									  $("#noInventoryWSLMsg_"+ prodcodeIndex).addClass('hide');
									  $("#limitedWSLMsg_"+ prodcodeIndex).removeClass('hide');
									  $("#addtoList" + prodcodeIndex).removeClass('disabled');
									  $("div#rtaLink" + prodcodeIndex).removeClass('hide');
								  }
								  if($("#isEproUser").val() == 'true'){
									  	if(!Session.isAllowPhaseOutItemsGroup()){
										  $("#cartButton" + prodcodeIndex).attr("disabled","disabled");
									  	}
								  }
								  else if(Session.isNoPhaseOutItemsGroup()){
									  $("#cartButton" + prodcodeIndex).attr("disabled","disabled");
								  }
							  }
						  }
						  if (pageType == 'LISTDETAILS' || Session.isSharedCartPage()){
					  		  if(productData.salesStatus == 'WG' || productData.salesStatus == 'WV') {
					  			 if(productData.availableQty == 0 ){
					  				  $('#wslLimitedInventory_' + prodcodeIndex + ', #pickupAvailDate' + prodcodeIndex + ', #addCheckbox' + prodcodeIndex + ', #product-desired-qty-' + prodcodeIndex).addClass('hide');
					  				  $('#list-item-pricing_' + prodcodeIndex + ', #list-item-uom_' + prodcodeIndex).addClass('hide');
					  				  $('#itemTotalPrice_' + prodcodeIndex).addClass('hide');
					  				  $('#wslNoInventory_' + prodcodeIndex).removeClass('hide');									  
								  }
								  else {
									  $('#wslLimitedInventory_' + prodcodeIndex + ', #pickupAvailDate' + prodcodeIndex + ', #addCheckbox' + prodcodeIndex + ', #product-desired-qty-' + prodcodeIndex).removeClass('hide');
									  $('#list-item-pricing_' + prodcodeIndex + ', #list-item-uom_' + prodcodeIndex).removeClass('hide');
									  $('#wslNoInventory_' + prodcodeIndex).addClass('hide');
									  $('#itemTotalPrice_' + prodcodeIndex).removeClass('hide');
									  $('#selectAll, #shareCartSelectAll').removeClass('hide');
									  if($('#addCheckbox'+ prodcodeIndex).prop('checked')){
										  $(".addtocartbuttontop, .addtocartbuttonbottom").removeClass("disabled");
									  }
									  isNoneAvailable = false;
								  }
							  }
					  		  else {
					  			  if($('#isAllNomOrDiscontinuedItems').val() !== 'true'){
					  				  // if not all discontinued, online available or NOM/Sedena requiring doc
					  				  $('#wslLimitedInventory_' + prodcodeIndex + ', #wslNoInventory_' + prodcodeIndex).addClass('hide');
									  $('#pickupAvailDate' + prodcodeIndex + ', #product-desired-qty-' + prodcodeIndex + ', #addCheckbox' + prodcodeIndex).removeClass('hide');
									  $('#list-item-pricing_' + prodcodeIndex + ', #list-item-uom_' + prodcodeIndex).removeClass('hide');
									  $('#selectAll, #shareCartSelectAll').removeClass('hide');
									  if($('#addCheckbox'+ prodcodeIndex).prop('checked')){
										  $(".addtocartbuttontop, .addtocartbuttonbottom").removeClass("disabled");
									  }  
					  			  }
								  isNoneAvailable = false;
					  		  }
						  }	
					  });
					  if (pageType == 'LISTDETAILS' ){
						  //disable ATC and hide select All if all WSL items unavailable 
						  if(isNoneAvailable && $('#isAllLimitedQty').val() === 'true' ){
								  $('#selectAll').addClass('hide');
								  $(".addtocartbuttontop, .addtocartbuttonbottom").addClass("disabled"); 
						  }
						  else if( $('#allWSLWithoutInvOrDiscontinued').val() === 'true' ){
							  $('#selectAll').addClass('hide');
							  $(".addtocartbuttontop, .addtocartbuttonbottom").addClass("disabled"); 
						  }
						  
						  if ($('input[class=listItemCheckbox]:checked').length == 0) {
							  $(".addtocartbuttontop, .addtocartbuttonbottom").addClass("disabled");

						  }
					  }
					  var isAllLimitedQty = parseInt(noOfWgWvLimitedQtyItems) == noOfItems ? true : false;
					  var isAllWSLWithoutInvOrDiscontd = parseInt(noWSLItemsWithoutInv) + parseInt(noDiscontinuedItems) == noOfItems ? true : false;
					  var hasLimitedOrDiscontdItemsInList = parseInt(noOfWgWvLimitedQtyItems) + parseInt(noDiscontinuedItems) > 0 ? true : false;
					  if (Session.isSharedCartPage()){
						  //disable ATC and hide select All if all WSL items unavailable 
						  $('.discontd-item-in-list-msg').addClass('hide');
						  if(isAllWSLWithoutInvOrDiscontd){
								  $('#shareCartSelectAll').addClass('hide');
								  $(".addtocartbuttontop, .addtocartbuttonbottom").addClass("disabled");
								  $('.discontd-item-in-list-msg').removeClass('hide');
								  
						  }
						  //show list level message for any limited items
						  if( hasLimitedOrDiscontdItemsInList){
							  $('.discontd-item-in-list-msg').removeClass('hide'); 
						  }
						  
						  if ($('input[class=listItemCheckbox]:checked').length == 0) {
							  $(".addtocartbuttontop, .addtocartbuttonbottom").addClass("disabled");

						  }
					  }
			  }
		  },
		  failure : function(date) {
			  console.log(" RTA service call failed");

		  }
	  });
  },

   initializeForNoLastRTA : function() {
		if (Session.isSharedCartPage()) {

			var noOfItems = $(".prodCode").length;
			// count discontinued +  online not available items below for Shared Cart
			var noDiscontinuedItems = $(".dgdvItem").length;
			var noOfWgWvLimitedQtyItems = $(".wgwvItem").length;
			var hasLimitedOrDiscontdItemsInList = parseInt(noOfWgWvLimitedQtyItems)
					+ parseInt(noDiscontinuedItems) > 0 ? true : false;
			var isAllDiscontinuedItems = parseInt(noDiscontinuedItems) == noOfItems ? true
					: false;
			var rtaData = Session.fetchLastRtaValues();
			if (null == rtaData || jQuery.isEmptyObject(rtaData)) {
				$('span.wgWvLimitedInvMsg').removeClass('hide');
			}
			// show list level message for any limited items
			if (hasLimitedOrDiscontdItemsInList) {
				$('.discontd-item-in-list-msg').removeClass('hide');
			}
			if (isAllDiscontinuedItems) {
				$('#shareCartSelectAll').addClass('hide');
				$(".addtocartbuttontop, .addtocartbuttonbottom").addClass(
						"disabled");
				$('.discontd-item-in-list-msg').removeClass('hide');
			}
			if ($('input[class=listItemCheckbox]:checked').length == 0) {
				$(".addtocartbuttontop, .addtocartbuttonbottom").addClass(
						"disabled");

			}
		}

  },
  
  showNoRtaAvailabilityMsg : function(deliveryMethod) {
	  $(".prodCode").each(
			  function() {
				  var prodcodeIndex = escapeProdSpecialCharacters($(this).val());
				  if ('ship' === deliveryMethod) {
					  $("#pickupAvailDate" + prodcodeIndex).html(
							  $("#rtaNoShippingLocationSelectedMsg").val());
				  } else {
					  $("#pickupAvailDate" + prodcodeIndex).html($("<a>").attr("href", "javascript:void(0)").attr("class", "selectbranchAvailability").text( $("#rtaNoPickUpAvailabilityMsg").val()));
					  $(".manageAvailability").addClass("hide");
				  }
			  });
  },
  showNoDataRtaAvailabilityMsg : function(deliveryMethod) {
	  $(".prodCode").each(
			  function() {

				  if ('ship' === deliveryMethod) {
					  $("#pickupAvailDate" + $(this).val()).html(
							  $("#rtaShippingAvailabilityDatesMsg").val());
				  } else {
					  $("#pickupAvailDate" + $(this).val()).html(
							  $("#rtaPickUpAvailabilityDatesMsg")
							  .val());
				  }


			  });
	  $("#rtaNoPickupLocationSelected").removeClass("hide");
  },

  getRtaAvailabilityForPostalCode : function(deliveryMethod, postalcode) {
	  var pdpAvailabilityUrl = "/rta/" + deliveryMethod + "/" + postalcode;

	  if (typeof products == "undefined"
		  || typeof products.itemsToAdd == "undefined") {
		  products = {};

	  }

	  var pageType = jQuery('#pageType').val();
	  var prodcode = '';
	  if ((pageType == 'CATEGORY') || (pageType == 'PRODUCTSEARCH')) {
		  $(".prodCode").each(function() {
			  prodcode = escapeProdSpecialCharacters( $(this).val());
			  products[$(this).val()] = $("#qty" + prodcode).val();
		  });
	  }else if( (pageType == 'LISTDETAILS')){
		  $(".prodCode").each(function() {
			  products[$(this).val()] = $("#product-desired-qty-hidden-" + escapeProdSpecialCharacters( $(this).val())).val();
		  });
	  } else if((pageType == 'CART')){
		  pdpAvailabilityUrl = "/rta/" + deliveryMethod + "/cart/" + postalcode;
	  } else {
		  var prodcode = jQuery('#productCode').val();
		  var productQty = jQuery('#quantity' + escapeProdSpecialCharacters(prodcode)).val();

		  var alreadyExists = false;

		  if (productQty && !isNaN(productQty) && productQty > 0) {

			  jQuery.map(products, function(item, index) {

				  if (item.code == prodcode) {
					  item.quantity = productQty;
					  alreadyExists = true;
				  }
			  });

			  if (!alreadyExists) {
				  products[prodcode] = productQty;
			  }
		  }
	  }
	  var data = JSON.stringify(products);
	  $.ajax({
		  cache : false,
		  type : 'POST',
		  url : pdpAvailabilityUrl,
		  data : data,
		  contentType : "application/json",
		  success : function(data) {
			  if (null != data && !jQuery.isEmptyObject(data)) {
					  $.each(data, function(index, result) {
						  var prodcodeIndex = escapeProdSpecialCharacters(index);
							  $("#availabilityDate" + prodcodeIndex).html(
									  $("#rtaShippingAvailabilityDatesMsg")
									  .val()
									  + " " + result);
					  });

			  } else {
				  if (pageType !=  'PRODUCT') {
					 Session.showDeliveryDateUnAvailabilityMsg();
				  }else{
					  $("#availabilityDate" +jQuery('#productCode').val()).html(
							  $("#rtaDeliveryDateUnavailableMsg").val());
				  }
			  }
		  },
		  failure : function(date) {
			  if (pageType !=  'PRODUCT') {
				  Session.showDeliveryDateUnAvailabilityMsg();
			  } else {
				  $("#availabilityDate" +jQuery('#productCode').val()).html(
						  $("#rtaDeliveryDateUnavailableMsg").val());
			  }
		  }
	  });
  },

  showDeliveryDateUnAvailabilityMsg : function() {
	  $(".prodCode").each(
			  function() {
					  $("#availabilityDate" + $(this).val()).html(
							  $("#rtaDeliveryDateUnavailableMsg").val());
			  });
  },

	displayPostalCodeLink : function(postalcode) {
		$(".eproUserSelectedPostalCodeForAvailability").html($("<a>").attr("href", "javascript:void(0)").attr("class", "eproUserSelectedPostalCodeForAvailability").text( postalcode));
		$(".prodCode").each(
				function() {
					var prodcodeIndex = escapeProdSpecialCharacters($(this).val());
					$("#eproUserSelectedPostalCode"+prodcodeIndex).html($("<a>").attr("href", "javascript:void(0)").attr("class", "eproUserSelectedPostalCodeForAvailability").text( postalcode));
				});

	},

	checkPostalCode : function(postalcode) {
		var regEx = /^[A-Z]\d[A-Z]( )?\d[A-Z]\d$/i;
	    if (regEx.test(postalcode)){
	    	return true;
	    }
     return false;
	},
	


	setTaxRateToDisplay : function(zipCode, pickUpBranchId, deliveryMethod) {
		
		try {
			if ($("#isBorderTaxEnabled").val() === 'true') {
				if (Session.isCartPageForTaxRate()) {
					zipCode = isNotEmpty(zipCode) ? zipCode : localStorage
							.getItem("lastSearchedRTAZipcode");
					pickUpBranchId = isNotEmpty(pickUpBranchId) ? pickUpBranchId
							: localStorage
									.getItem("lastSearchedRTAPickupBranchId");
					if (deliveryMethod == 'branchPickUp') {
							var lastSearchedLocationTaxRate = Session
									.checkTaxForPostalLocation(null,
											pickUpBranchId);
							localStorage.setItem("lastSearchedLocationTaxRate",
									lastSearchedLocationTaxRate);
					} else {
						var taxRateToDisplay = Session
								.checkTaxForPostalLocation(zipCode, null);
						localStorage.setItem("lastSearchedLocationTaxRate",
								taxRateToDisplay);
					}
				}
			}
		} catch (err) {
			console.log("Unable to set Tax Rate in localStorage :" + err);
		}
	},

	checkAvailDate : function(avlDate) {

	    return (typeof avlDate === "undefined" || !avlDate || 0 === avlDate.length) ? "" : avlDate;
	    },

	    updateLastRtaValues : function(zipCode, pickUpBranchId, deliveryMethod) {
	    	//update local storage for last RTA
	    	Session.updateLastRtaForSession (zipCode, pickUpBranchId, deliveryMethod);
	    	
	    	
	    	// update last RTA for Customer account preferences and Session
	    	Session.updateLastRtaForLoggedInUser (zipCode, pickUpBranchId, deliveryMethod);
	    	
	    	//look-up and set Tax rate for non-Checkout pages
	    	if (Session.isNonCheckoutPageForTaxRate()) {
	    		Session.setTaxRateOnPostalLookupForNonCheckout(zipCode, pickUpBranchId, deliveryMethod);
	    	}
	    },
	    
	    checkTaxForPostalLocation : function(zipCode, pickUpBranchId){
	    	var taxRateToDisplay = '';
	    	var postalLocationUrl = "/location/check-tax-for-postal-location";
	    	$.ajax({
	    		cache : false,
	    		type : "POST",
	    		url : contextPath+ postalLocationUrl,
	    		data: { zipCode:zipCode, branchId:pickUpBranchId},
	    		dataType: "json",
	    		async: false,
	    		success : function(response) {
	    			if(response != null){
	    				taxRateToDisplay = response;
	    			}
	    		},
	    		error : function(errorThrown){
	    			console.log(errorThrown);
	    		}
	    	});
	    	return taxRateToDisplay;
	    },
	    
	   

	    updateLastRtaForLoggedInUser : function(zipCode, pickUpBranchId, deliveryMethod){

	    	var setLastRtaUrl = "/set-last-searched-RTA-info-from-session";
	    	
	    	$.ajax({
	    		cache : false,
	    		type : "POST",
	    		url : contextPath+"/rta/set-last-searched-RTA-info-from-session",
	    		data: { zipCode:zipCode, branchId:pickUpBranchId, deliveryMode:deliveryMethod
	    		},
	    		dataType: "json",
	    		success : function(response) {
	    			if(response){
	    				console.log("Last Search RTA info set");
	    			}
	    		},
	    		error : function(errorThrown){
	    			console.log(errorThrown);
	    		}
	    	});

	    },

	    updateLastRtaForSession : function(zipCode, pickUpBranchId, deliveryMethod){

	    	if(typeof localStorage != "undefined" && localStorage){
	    		if (isNotEmpty(zipCode)) {
	    			localStorage.setItem("lastSearchedRTAZipcode", zipCode);
	    		}
	    		
	    		if (isNotEmpty(pickUpBranchId)) {
	    			localStorage.setItem("lastSearchedRTAPickupBranchId", pickUpBranchId);
	    		}
	    		if (isNotEmpty(deliveryMethod)) {
	    			localStorage.setItem("lastSearchedRTADeliveryMode", deliveryMethod);
	    		}
	    		
	    	}

	    },

	    isNonCheckoutPageForTaxRate : function() {
	    	return (Session.isProductDetailsPage() || Session.isSharedCartPage()
				|| Session.isSearchPage() || Session.isProductListComponent() || 
				Session.isMyListDetailsPage());
	    },
	    
	    isPageEnabledForAjaxPricing: function() {
	    	//To be enabled page wise 
	    	return Session.isNonCheckoutPageForTaxRate() ; 
		},
	    isProductDetailsPage : function (){
	    	return ($('#isIdpPage').val() == "true");
	    },
	    
	    isMyListDetailsPage : function (){
	    	return (jQuery('#pageType').val() == 'LISTDETAILS');
	    },
	    
	    isAnonymousUser : function (){
	    	return ($("#isAnonymousUser").val() === 'true');
	    },

	    isSearchPage : function (){
	    	return ($("#isSearchPage").val() === 'true');
	    },

	    isSharedCartPage : function (){
	    	return ($("#isSharedCartPage").val() === 'true');
	    },
	    isProductListComponent : function (){
	    	return ($("#isProductListComponent").val() === 'true');
	    },
	    
	    isCartPageForTaxRate : function (){
	    	return ($("#isCartPage").val() === 'true') || ($("#isOrderreviewPage").val() === 'true');
	    },
	    	    
	    fetchLastRtaValues : function(){

	    	var lastRtaData = Session.getLastRtaFromSession();
	    	try{
		    	if(null == lastRtaData || jQuery.isEmptyObject(lastRtaData) || !localStorage || isEmpty(lastRtaData.lastSearchedRTADeliveryMode)){
		    		if(!Session.isAnonymousUser()){
		    			lastRtaData = Session.getLastRtaForLoggedInUser();

			    	}
		    	}
	    	} catch(error){
	    		console.log(error);
	    	}

	    	return lastRtaData;
	    },

	    getLastRtaFromSession : function (){

	    	var result={};
	    	var zipCode = null;
	    	var pickUpBranchId=null;
	    	var deliveryMethod=	null;
	    	var taxRateToDisplay=null;

	    	if(typeof localStorage != "undefined" && localStorage){
	    		zipCode = localStorage.getItem("lastSearchedRTAZipcode");
	    		pickUpBranchId=localStorage.getItem("lastSearchedRTAPickupBranchId");
	    		deliveryMethod=	localStorage.getItem("lastSearchedRTADeliveryMode");
	    		taxRateToDisplay=localStorage.getItem("lastSearchedLocationTaxRate");
	    	}

	    	if (isNotEmpty(zipCode)) {
	    		result.lastSearchedRTAZipcode=zipCode;
	    	}
	    	if (isNotEmpty(pickUpBranchId)) {
	    		result.lastSearchedRTAPickupBranchId=pickUpBranchId;
	    	}
	    	if (isNotEmpty(deliveryMethod)) {
	    		result.lastSearchedRTADeliveryMode=deliveryMethod;
	    	}
	    	if (isNotEmpty(taxRateToDisplay)) {
	    		result.lastSearchedLocationTaxRate=taxRateToDisplay;
	    	}
	    	return result;
	    },

	    getLastRtaForLoggedInUser : function(){

	    	var result={};
	    	var zipCode = null;
	    	var pickUpBranchId=null;
	    	var deliveryMethod=	null;
	    	var anonymous=null;
	    	$.ajax({
	    		 cache : false,
	             type : "GET",
	             async : false,
	             url : contextPath+"/rta/get-last-searched-RTA-info",
	             success : function(response) {
	            	 if(response && response != "" && response.status){

	            			if(response.anonymous=="false"){
	            		 		zipCode=response.zipCode;
	            		 		pickUpBranchId=response.branchId;
	            		 		deliveryMethod=response.deliveryMode;

	            		 		if (isNotEmpty(zipCode)) {
	            		    		result.lastSearchedRTAZipcode=zipCode;
	            		    	}
	            		    	if (isNotEmpty(pickUpBranchId)) {
	            		    		result.lastSearchedRTAPickupBranchId=pickUpBranchId;
	            		    	}
	            		    	if (isNotEmpty(deliveryMethod)) {
	            		    		result.lastSearchedRTADeliveryMode=deliveryMethod;
	            		    	}
	            		    	
	            		    	Session.updateLastRtaForSession (zipCode, pickUpBranchId, deliveryMethod);
	            			 }
	             	}
	    		},
	    		error : function(errorThrown){

	    			console.log(errorThrown);
	    		}
	    	});
	    	return result;
	    },

	    refreshCartPageOnFulfillment : function(){
	    	try {
	    		if($("#isCartPage").val() === 'true'){
	    			var id =$("input[name='shipPack']:checked").attr('id');
	    			var url = addURLParameter(location.href, 'cartRefresh', true);
	    			url = isNotEmpty(url) ? url : location.href; 
	    			if(id=='pickupradio'){
	    	    		setTimeout(function(){
	    	    			location.href = url;
	    	    		},500);
	    	    	}else{
	    	    		location.href = url;
	    	    	}
	    		}else if( Session.isSharedCartPage()){
	    			setTimeout(function(){
    	    		    location.reload();
    	    		},500);
	    		}

	    	} catch(err){
	    		console.log(err);
	    	}

	    },

	    isNoPhaseOutItemsGroup : function (){
	    	return ($("#isNoPhaseOutItemsGroup").val() === 'true');
	    },
	    isAllowPhaseOutItemsGroup : function (){
	    	return ($("#isAllowPhaseOutItemsGroup").val() === 'true');
	    },
	    updateCartDeliveryMode : function(deliveryMode){
	    	try {
	    		$.ajax({
	    			cache : false,
	    			type : 'GET',
	    			url : contextPath + "/cart/updateCartDeliveryMode?deliveryMode="+deliveryMode,

	    			success : function(result) {

	    			}
	    		});		
	    	} catch(err){
	    		console.log(err);
	    	}

	    },
	    


	
		setTaxRateOnPostalLookupForNonCheckout : function(zipCode, pickUpBranchId,
				deliveryMethod, callOnLoad) {
	
			Session.isTaxRateRefresh = false;
			var taxRateToDisplay = '';
			try {
				if (Session.isNonCheckoutPageForTaxRate()) {
	
					var lastRTATax = localStorage
							.getItem("lastSearchedLocationTaxRate");
					var previousTaxRate = isNotEmpty(lastRTATax) ? lastRTATax : $(
							"#defaultTaxRateValue").val();
					zipCode = isNotEmpty(zipCode) ? zipCode : localStorage
							.getItem("lastSearchedRTAZipcode");
					pickUpBranchId = isNotEmpty(pickUpBranchId) ? pickUpBranchId
							: localStorage.getItem("lastSearchedRTAPickupBranchId");
					deliveryMethod = isNotEmpty(deliveryMethod) ? deliveryMethod
							: localStorage.getItem("lastSearchedRTADeliveryMode");
					var initTaxRate = (typeof callOnLoad != "undefined" && callOnLoad === true) ? true :false;
	
					var taxRateLookupUrl = "/location/set-tax-for-postal-lookup";
					$.ajax({
						cache : false,
						async : false,
						type : "POST",
						url : contextPath + taxRateLookupUrl,
						data : {
							zipCode : zipCode,
							branchId : pickUpBranchId,
							deliveryMode : deliveryMethod,
							callOnLoad : initTaxRate
						},
						dataType : "json",
						success : function(response) {
							if (response != null && $.isNumeric(response)) {
								taxRateToDisplay = response;
								
							}
						},
						error : function(errorThrown) {
							console.log(errorThrown);
						}
					});
					
					if($.isNumeric(taxRateToDisplay)){
						localStorage.setItem("lastSearchedLocationTaxRate",
								taxRateToDisplay);
						$("#taxRateToDisplay").val(taxRateToDisplay);
						if(initTaxRate === true){
							//tax in session not found
							Session.isTaxRateRefresh = true;
						} else {
							Session.isTaxRateRefresh = ($.isNumeric(previousTaxRate) && previousTaxRate != taxRateToDisplay) ? true
							: false;
						}
					}
				}
				
			} catch (err) {
				console.log("Error setting Tax rate: " + err);
			}
	
			return taxRateToDisplay;
		},
		
	    refreshPageOnTaxChange : function(){
	    	try {
			    if (Session.isNonCheckoutPageForTaxRate() && Session.isTaxRateRefresh == true
					&& !Pricing.isPriceWithoutTaxGroup()) {
			    	if(Session.isPageEnabledForAjaxPricing()){
			    		//Ajax to apply updated pricing and tax rates
			    		Pricing.getProductPricing();	
			    	}else {

		    			setTimeout(function(){
	    	    		    location.reload();
	    	    		},500);			    		
			    	}
	    		}

	    	} catch(err){
	    		console.log(err);
	    	}
	    }

	    
}

var nomOrSedenaMoreInfoPopUp= {

		open: function(restrictedSalesCode){
			$('#nomOrSedenaMoreInfoModal').addClass('modal modal-window commerce');
			$("#nomOrSedenaMoreInfoModal").removeClass("hide");
			$("#nomOrSedenaMoreInfoModal").show();
			$('<div class="modal-backdrop"></div>').insertBefore('#nomOrSedenaMoreInfoModal');
			$('#sedenaMessageinModal').addClass("hide");
			$('#nomMessageinModal').addClass("hide");
			if(restrictedSalesCode=='B2'){
				$('#nomMessageinModal').removeClass("hide");
			} else {
				$('#sedenaMessageinModal').removeClass("hide");
			}
		},
		close: function(){
			$('#nomOrSedenaMoreInfoModal').hide();
			$('#nomOrSedenaMoreInfoModal').removeClass('modal modal-window commerce');
		    $('.modal-backdrop').remove();
		}
	}
