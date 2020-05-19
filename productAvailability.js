

var ProductAvailability = {


		showPickUpBranchLink: function(branchName){
			if(isNotEmpty(branchName)) {
				$(".manageAvailability").each(function() {
					$(".manageAvailability").html("");
					$(".manageAvailability").html($("#rtaPickUpBranchLink").val() + " "+ branchName);
				});
			}

		},


		showShipPostalCodeLink : function(postalCode) {
			if (isNotEmpty(postalCode)) {
				$(".manageAvailability").each(function() {
					$(".manageAvailability").html("");
					var postalLink = $("#rtaShipPostalCodeLink").val();
					$(".manageAvailability").html(postalLink + " " + postalCode);
				});
			}
		},


		showPostalCodeChangeLink : function(postalCode) {
			if (isNotEmpty(postalCode)) {
				$("#zipcodeAvl").addClass("hide");
				$("#shipToMessage").removeClass("hide");
				$("#shipToMessage").html("<b>"+postalCode+"</b>");
				$("#changeZipCode").removeClass("hide");
				if (Session.isSearchPage() || Session.isProductListComponent()) {
					$("#zipcodeAvl").val(postalCode);
				}
			}
		},


		updateShipAvailability: function() {
			ProductAvailability.toggleProductAvaliabilitySection();
			var rtaData = Session.fetchLastRtaValues();
			if(null != rtaData && !jQuery.isEmptyObject(rtaData)){
				var postalCode = rtaData.lastSearchedRTAZipcode;
				if(!isEmpty(postalCode)){
					ProductAvailability.showShipPostalCodeLink(postalCode);
					Session.getRtaAvailability("ship", postalCode);
					ProductAvailability.showPostalCodeChangeLink(postalCode);
				}

			}

		},

		displayDefaultPickupBranch: function(){

			ProductAvailability.toggleProductAvaliabilitySection();
			var rtaData =  Session.fetchLastRtaValues();
			if(null != rtaData && !jQuery.isEmptyObject(rtaData)){
				var branchId = rtaData.lastSearchedRTAPickupBranchId;
				if(!isEmpty(branchId)){
					ProductAvailability.getPickupAddress(branchId);
				} else{
					ProductAvailability.toggleNoBranchDisplay();
				}
			}

		},

		 closepickupmodal: function(){
			$('#productAvailabilityModal').hide();
			jQuery("#productAvailabilityModal").removeClass("modal");
		},

		clearErrorMessages: function(){
			$("#rtaZipEmptyMsg").addClass("hide");
			$("#rtaZipInvalidMsg").addClass("hide");
		},

		getPickupAddress : function (branchId){

			$.ajax({
		        type : "GET",
		        async : false,
		        url : "/rta/getDefaultPickUp",
		        data : {"branchId" : branchId},
		        success : function(response) {

		        	if(response && response.defaultBranch){
			        	var result = response.defaultBranch;
			        	$("#currentSelectionBranchName").val(response.defaultBranch.displayName);
			        	$("#currentSelectionBranchId").val(response.defaultBranch.name);
			        	var pickupBranchLabel = response.branchLabel;
			        	var pageType = jQuery('#pageType').val();
			    		if( (pageType == 'LISTDETAILS') || Session.isSharedCartPage()){
			    			pickupBranchLabel = response.pickupBranchLabel;
			    		}
			        	var resultContent = ProductAvailability.setBranchContentInHtml(result,pickupBranchLabel);
			        	$("#productAvailabilityPickupAddress").html(resultContent);
			        	ProductAvailability.showPickUpBranchLink(response.defaultBranch.displayName);
			        	$("#chooseBranchLocation").addClass("hide");
			        	$("#productAvailabilityPickupAddress").removeClass("hide");
			        	$("#changeBranchLocation").removeClass("hide");
			        	$("#applyShippingLocation").addClass("hide");
			        	Session.getRtaAvailability("pickup", response.defaultBranch.name);
		        	} else {
		        		ProductAvailability.toggleNoBranchDisplay();
		        	}
		        },
		        failure : function(response) {
		        	console.log(response);
		        	ProductAvailability.toggleNoBranchDisplay();
		        }
			});
		},

		setBranchContentInHtml : function(branch, branchLabel){
			var resultContent = "";
			if(!isEmpty(branchLabel)){
				resultContent += "<span class='pickupbranchLabel'><b>" + branchLabel + "</b></span>";
			}
			var pageType = jQuery('#pageType').val();
    		resultContent += (pageType == 'LISTDETAILS' || Session.isSharedCartPage()) ? " " : "<br>";
			resultContent += "<span class='pickupaddressdisplayname'><b>" + branch.displayName + "</b></span><br>";
			if(pageType == 'LISTDETAILS' || Session.isSharedCartPage()){
				resultContent += "<br>";
			}
    	    if (branch.address != null) {
    	        resultContent += "<span class='pickupaddressresults'>" + ((null != branch.address.line1)? (branch.address.line1 + "</span><br>") : '');// + "</span><br>";
    	        resultContent += "<span class='pickupaddressresults'>" + ((null != branch.address.line2)? (branch.address.line2 + ",</span><br>") : '');// + "</span><br>";
    	        resultContent += "<span class='pickupaddressresults'>" + ((null != branch.address.colony)? (branch.address.colony + "</span><br>") : ''); //+ "</span><br>";
    	        resultContent += "<span class='pickupaddressresults'>" + ((null != branch.address.postalCode)? (branch.address.postalCode + "</span>") : '');// + "</span><br>";
    	        var aRegion = branch.address.region;
    	        if(null != aRegion){
    	        	resultContent += "<span class='pickupaddressresults'>" + ((null != aRegion.name)? ("&nbsp;&nbsp;" + aRegion.name + "&nbsp;&nbsp;</span>") : '');
        	        resultContent += "<span class='pickupaddressresults'>" + ((null != aRegion.isocodeShort)? (aRegion.isocodeShort + "</span><br>") : '');

    	        }
    	         resultContent += "<span class='pickupaddressresults'>" + ((null != branch.address.country && null != branch.address.country.name )? (branch.address.country.name + "</span><br>") : '');// + "</span><br>";
    	        }
    	    return resultContent;

		},
		isSearchListView: function() {			
			return $('#resultsView').hasClass('list');
		},

		toggleProductAvaliabilitySection: function() {
			var deliveryMode = $("input:radio[name='product-available']:checked").prop("id");
			if(deliveryMode === 'pickupradio') {
				$(".productAvailabilityPickupSection, .pickUpProductAvailabilityMessage").removeClass("hide");
				$(".productAvailabilityShippingSection, .shippingProductAvailabilityMessage").addClass("hide");

				$("#applyShippingLocation").addClass("hide");
				$("#changeBranchLocation").removeClass("hide");
				$("#chooseBranchLocation").addClass("hide");
				$('.productAvailabilityMessage').show();
			} else if(deliveryMode === 'shipradio'){

				$(".productAvailabilityShippingSection, .shippingProductAvailabilityMessage").removeClass("hide");
				$(".productAvailabilityPickupSection, .pickUpProductAvailabilityMessage").addClass("hide");
				$("#changeBranchLocation").addClass("hide");
				$("#applyShippingLocation").removeClass("hide");
				$("#chooseBranchLocation").addClass("hide");
				$('.productAvailabilityMessage').show();
			}

		},

		toggleNoBranchDisplay : function(){
			$("#productAvailabilityPickupAddress").addClass("hide");
			$("#chooseBranchLocation").removeClass("hide");
			$("#changeBranchLocation").addClass("hide");
			$("#applyShippingLocation").addClass("hide");
			$('.productAvailabilityMessage').hide();
		},

		 validZipCode : function(zipCode) {
			return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
		},

		getLastRtaDeliveryMode : function(){
			var lastRtaDM = null;
			try {
				var rtaData =  Session.fetchLastRtaValues();
				if(null != rtaData && !jQuery.isEmptyObject(rtaData)){
					lastRtaDM = rtaData.lastSearchedRTADeliveryMode;
				}
			} catch(error){
				//error to fetch last RTA delivery mode
			}
			return 	lastRtaDM;
		},
		
		wgWvItemsWithInsufficientInventory : function() {
			if (Session.isSearchPage()) {
				$(".prodCode").each(function() {
					var prodCodeIndex = escapeProdSpecialCharacters( $(this).val());
					if($("#isWgWvProduct_" + prodCodeIndex).val() == 'true') {
						var totalInventory = $("#totalInventory_" + prodCodeIndex).val();
						var requestedQty = parseInt($('#qty' + prodCodeIndex).val());
						  if($.isNumeric(requestedQty)) {
							  if($.isNumeric(totalInventory) && 
										((totalInventory == 0) || (totalInventory < requestedQty))) {
								  	  $(".pickupAvailDate#pickupAvailDate" + prodCodeIndex).addClass("hide");
									  $("#noInventoryWSLMsg_"+ prodCodeIndex).removeClass('hide');
									  $("#limitedWSLMsg_"+ prodCodeIndex).addClass('hide');
									  $("#cartButton" + prodCodeIndex).addClass('disabled');
									  $("#cartButton" + prodCodeIndex).attr("disabled","disabled");									  
									  $("#addtoList" + prodCodeIndex).addClass('disabled');
									  $("div#rtaLink" + prodCodeIndex).addClass('hide');
									  if(totalInventory == 0) {
										  $("#qty" + prodCodeIndex).attr("disabled","disabled");
										  $("#qty" + prodCodeIndex).addClass('disabled'); 
									  }
								} else {
									//reset on inventory 
									  $(".pickupAvailDate#pickupAvailDate" + prodCodeIndex).removeClass("hide");
									  $("#cartButton" + prodCodeIndex).removeClass('disabled');
									  $("#cartButton" + prodCodeIndex).removeAttr('disabled');
									  $("#qty" + prodCodeIndex).removeAttr('disabled');
									  $("#qty" + prodCodeIndex).removeClass('disabled');
									  $("#noInventoryWSLMsg_"+ prodCodeIndex).addClass('hide');
									  $("#limitedWSLMsg_"+ prodCodeIndex).removeClass('hide');
									  $("#addtoList" + prodCodeIndex).removeClass('disabled');
									  $("div#rtaLink" + prodCodeIndex).removeClass('hide');
								}
						  }
					}
					  
				  });
			}
		}

}

/// on Ready functions - Start ////

jQuery('document').ready(function() {

	var deliveryMode = ProductAvailability.getLastRtaDeliveryMode();
	if(deliveryMode =='branchPickUp'){
		ProductAvailability.displayDefaultPickupBranch();
		$('#pickupradio').prop('checked', true);
	}
	else {
		ProductAvailability.updateShipAvailability();
		$('#shipradio').prop('checked', true);
	}
	ProductAvailability.wgWvItemsWithInsufficientInventory();
	Session.initializeForNoLastRTA();	
	//prepare for list view only

	$("input:radio[name='product-available']").on("change", function(){
		var deliveryMode = $("input:radio[name='product-available']:checked").prop("id");
    	var changeDeliveryMode = "branchPickUp";
    	if(deliveryMode =='shipradio') {
    		changeDeliveryMode = "standard-net";
    		ProductAvailability.updateShipAvailability();
    		ProductAvailability.toggleProductAvaliabilitySection();
    	}else if(deliveryMode =='branchPickUp' || deliveryMode =='pickupradio') {
    		 changeDeliveryMode = "branchPickUp";
    		 if(!($(".productAvailabilityAddShippingSection").is(":hidden"))){
     			$(".productAvailabilityAddShippingSection").addClass("hide");
     		}
    		 ProductAvailability.displayDefaultPickupBranch();
    	}

    	Session.updateDeliveryMode(changeDeliveryMode,console.log, console.log);
    	Session.updateLastRtaValues(null,null, changeDeliveryMode);
    });

	jQuery("a.manageAvailability, #listAvailability, a.componentmanageAvailability").on("click", function(anEvent){
		jQuery("#productAvailabilityModal").addClass("modal");
		jQuery("#productAvailabilityModal").removeAttr("style").show();
		jQuery("#productAvailabilityModal").removeClass("hide");
		jQuery("#productAvailabilityModal").show();
		var pageType = jQuery('#pageType').val();
		var elem = anEvent.target;
		if(null != elem && $(elem).hasClass('componentmanageAvailability')){
			// Product List Component
			jQuery("#productAvailabilityModal").css("top", (jQuery(this).position().top + 20) + "px");
			jQuery("#productAvailabilityModal").css("left", (jQuery(this).position().left + 356) + "px");
		}
		else if( (pageType == 'LISTDETAILS')){
			jQuery("#productAvailabilityModal").css("top", (jQuery('#listAvailability').offset().top - 154)+"px");
		}else if (Session.isSharedCartPage()){
			jQuery("#productAvailabilityModal").css("top", (jQuery('#listAvailability').offset().top - 154)+"px");
			jQuery("#productAvailabilityModal").css("left", "110.66667%");
		}else {
			if (ProductAvailability.isSearchListView()) {
				//list view
				jQuery("#productAvailabilityModal").css("top", (jQuery(this).position().top + 25) + "px");
			} else {
				//grid view
				jQuery("#productAvailabilityModal").css("top", (jQuery(this).position().top + 20) + "px");
				jQuery("#productAvailabilityModal").css("left", (jQuery(this).position().left + 356) + "px");
			}
		}
		var deliveryMode = ProductAvailability.getLastRtaDeliveryMode();
		if(deliveryMode =='branchPickUp'){
			ProductAvailability.displayDefaultPickupBranch();
		}
		else {
			ProductAvailability.updateShipAvailability();
		}
	});

	ProductAvailability.toggleProductAvaliabilitySection();


	$('#pickupradio').on("click", function(){
		Session.updateLastRtaValues(null,null, "branchPickUp");
		Session.updateCartDeliveryMode("branchPickUp");
		ProductAvailability.clearErrorMessages();
		ProductAvailability.displayDefaultPickupBranch();
		Session.refreshPageOnTaxChange();
	});

	$('#shipradio').on("click", function(){
		Session.updateLastRtaValues(null,null, "standard-net");
		Session.updateCartDeliveryMode("standard-net");
		ProductAvailability.clearErrorMessages();
		ProductAvailability.toggleProductAvaliabilitySection();
		ProductAvailability.updateShipAvailability();
		Session.refreshPageOnTaxChange();
	});


	$('#changeBranchLocation').on("click", function(){

		branchSearch.fetchBranches();
		ProductAvailability.closepickupmodal();
	});
	$('#chooseBranchLocation').on("click", function(){

		branchSearch.fetchBranches();
		ProductAvailability.closepickupmodal();
	});




	$('#applyShippingLocation').on("click", function() {
		ProductAvailability.clearErrorMessages();
		var zipCode = jQuery.trim(jQuery("#zipcodeAvl").val());
		if (isEmpty(zipCode)) {
			// display errors
			$("#rtaZipEmptyMsg").removeClass("hide");
			$("#rtaZipInvalidMsg").addClass("hide");

			$("#zipcodeAvl").removeClass("hide");
			$("#shipToMessage").addClass("hide");
			$("#changeZipCode").addClass("hide");
		} else if (!ProductAvailability.validZipCode(zipCode) || !isPositiveInteger(zipCode)) {
			// display format error
			$("#rtaZipEmptyMsg").addClass("hide");
			$("#rtaZipInvalidMsg").removeClass("hide");
		} else {
			ProductAvailability.clearErrorMessages();
			ProductAvailability.showShipPostalCodeLink(zipCode);
			Session.updateLastRtaValues(zipCode,null, "standard-net");
			Session.refreshPageOnTaxChange();
			Session.getRtaAvailability("ship", zipCode);
			ProductAvailability.showPostalCodeChangeLink(zipCode);
			if(!($("#changeZipCode").is(":hidden"))){
				ProductAvailability.closepickupmodal();
			}
		}

	});

	$('#changeZipCode').on("click", function() {

		$("#zipcodeAvl").removeClass("hide");
		$("#shipToMessage").addClass("hide");
		$("#shipToMessage").html('');
		$("#changeZipCode").addClass("hide");
	});

	$('#close-rta-modal').on("click", function(){
		ProductAvailability.clearErrorMessages();
		ProductAvailability.closepickupmodal();
	});
	$( 'a[title="gridView"]' ).click( function () {
        ProductAvailability.clearErrorMessages();
		ProductAvailability.closepickupmodal();
    });

});

function enterPressed(e){
	var code = (e.keyCode ? e.keyCode : e.which);
	if(code == 13) {
		$("#applyShippingLocation").trigger("click");
	}
}