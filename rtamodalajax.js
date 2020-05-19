var val;

var rta_itemcode;
var rta_qtyElement;
var rta_zipcodeElement;
var rta_shipPack;
var rta_ismodal;
var rtaMap;
var markersMap = {};
var branchMap = {};
var firstBranch;
var rta_pag_currentpage = 1;
var jq = jQuery.noConflict();

jQuery(document).ready(function (){
});

function isValidZipCode(zipCode){
	return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
}

function formatRtaDate(unformatDate){
	var formattedDate = new Date(unformatDate);
	var d = formattedDate.getDate();
	var m =  formattedDate.getMonth();
	m += 1;  // JS months are 0-11
	var y = formattedDate.getFullYear();
	return (d + "/" + m + "/" + y);
}

function cleanZipCodeData(){
	// clear all previous data
	jQuery("#branchDetails").empty();
	jQuery("#branchAddress").val("");
	jQuery("#branchDeliveryDate").val("");
	jQuery("#branchQuantity").val("");
	jQuery("#generalStatusResult").val("");
	jQuery("#shipMessageResult").val("");
	jQuery("#shipToMessage").val("");
	jQuery("#idpShipMessageResult").val("");
	
	jQuery("#generalStatusResult").hide();
	jQuery("#idpShipMessageResult").hide();
	jQuery("#shipMessageResult").hide();
	jQuery("#shipTo").hide();
	jQuery("#shipNoResults").hide();
	jQuery("#zipError").addClass('hide');
	jQuery("#shipUnavailable").hide();
	jQuery("#productUnavailable").hide();
	jQuery("#changeBranch").hide();
	jQuery("#branchDetails").hide();
	jQuery("#errorMessage").hide();
	
	jQuery("#rta-results-ship").hide();
	jQuery("#inner-map-container").show();
}

function getDefaultZipCode(){
	
	jQuery(document).keypress(function(e) {
	    if(e.which == 8 || e.which == 46) {
			setTimeout(function(){
			}, 1000);
	    	return;
	    }
	});
	
	var pathname = window.location.pathname; // Returns path only
	var itemNumber =   $('#productCode').val();
	var finalQuantity = jQuery("#quantity" + itemNumber).doesExist() ? jQuery("#quantity" + itemNumber).val() : "1";
	var zipValSession =  jQuery.trim(jQuery("#sessionZipCode").val());
	
    var yetVisited = localStorage['sessionZipcode'];

	jQuery.ajax({
		type : "GET",
		url : contextPath+"/cart/defaultShippingAddress",
		cache: false,
		success : function(data) {
			if(data!=null && data.postalCode!=null) {
				
				if (yetVisited != null && yetVisited != "" && yetVisited == zipValSession && data.postalCode != yetVisited){
					jQuery("#zipcodeAvl").val(yetVisited);
					rtaLocal(itemNumber, finalQuantity, yetVisited);
					
				} else {
					jQuery("#zipcodeAvl").val(data.postalCode);
					rtaLocal(itemNumber, finalQuantity, data.postalCode);
				}
				
			} else if (yetVisited != null && yetVisited != "") {
				jQuery("#zipcodeAvl").val(yetVisited);
				rtaLocal(itemNumber, finalQuantity, yetVisited)
				
			} else if (zipValSession != null && zipValSession != "") {
				jQuery("#zipcodeAvl").val(zipValSession);
				rtaLocal(itemNumber, finalQuantity, zipValSession)
			}
			
		},
        error: function(jqXHR, textStatus, errorThrown) {
        	console.log('error: jqXHR: '+jqXHR+' ; textStatus: '+textStatus+' ; errorThrown: '+errorThrown);
        },
        complete: function() {
        }
	});
}

function rtaLocal(itemNumber, quantity, zipcode){

	var zipVal = jQuery.trim(jQuery("#zipcodeAvl").val());
	rta_itemcode = itemNumber;
	rta_qtyElement = jQuery.isNumeric(quantity) ? quantity : jQuery.trim(jQuery("#" + quantity).val());
	rta_zipcodeElement = jQuery("#zipcodeAvl").doesExist() ? zipVal : zipcode;

	rta_shipPack= 'Y';
	// Uncomment this when use Pickup in future and comment above line
	/*
		rta_shipPack= $('input:radio[name=isShip]:checked').val();
		rta_shipPack=(rta_shipPack===undefined) ? 'Y' : rta_shipPack;
	*/
	
    var yetVisited = localStorage['sessionZipcode'];
    if (!yetVisited) {
        localStorage['sessionZipcode'] = rta_zipcodeElement;
    
    } else if (yetVisited && rta_zipcodeElement != "" &&  (yetVisited != rta_zipcodeElement)) {
    	localStorage['sessionZipcode'] = rta_zipcodeElement;
    
    } else {
    	rta_zipcodeElement = localStorage['sessionZipcode'];
    }
	
	if(!isValidZipCode(rta_zipcodeElement) || rta_zipcodeElement==""){
		jQuery("#errorMessage").show();
		return;
	}
	
    var inpuyqty = jQuery("quantity"+itemNumber).val();
	if( rta_qtyElement == null || rta_qtyElement == "" ){
		cleanZipCodeData();
		return;
	}
	
	Grainger.Modals.killModal();
	jQuery.ajax({
        url: "/modal/rtalocalpage",
        type: "GET",
        data : { 	modal : rta_ismodal,
        			itemNumber : rta_itemcode,
        			quantity : rta_qtyElement,
        			zipCode : rta_zipcodeElement,
        			shipPack : rta_shipPack
        },
        success : function(data){
        	if(data!=""){
        		cleanZipCodeData();
        		var pickAllResults = jQuery(data).attr("pickAllResults");
        		var defaultRtaView = jQuery(data).attr("defaultRtaView");
        		var avlItemInfo = jQuery(data).attr("avlItemInfo");
        		var productData = jQuery(data).attr("productData");
        		var shipResults = jQuery(data).attr("shipResults");
        		var pickup = jQuery(data).attr("pickup");
        		var shipMessage = jQuery(data).attr("shipMessage");
        		var generalStatus = jQuery(data).attr("generalStatus");
        		var fulfillmentCode = jQuery(data).attr("fullfillmentCode");
        		var rtaLocationLabel = jQuery(data).attr("rtaLocationLabel");
        		var rtaDateLabel = jQuery(data).attr("rtaDateLabel");
        		var rtaQuantityLabel = jQuery(data).attr("rtaQuantityLabel");
        		var quantityAvailable = jQuery(data).attr("quantityAvailable");
        		
        		jQuery("#inner-map-container").hide();
        		jQuery("#rta-results-ship").show();
        		
        		$('#availQty').val(quantityAvailable);
        		
        		if(shipMessage == null){
        			shipMessage = "";
        		}
        		
        		// Shipping
        		if(avlItemInfo != null && avlItemInfo.shipPack=="Y"){

        			if (shipResults != null){
        				if(shipResults.fulfillmentCode != null && shipResults.fulfillmentCode == 'S_BO'){
               				jQuery("#generalStatusResult").show();
            				jQuery("#generalStatusResult").html("<h5 class='alert confirm' style='padding: 0px; height: 0px; border: 0px; text-align: left;'>"+generalStatus+"</h5>");
            				jQuery("#shipMessageResult").show();
            				jQuery("#shipMessageResult").html("<p>"+shipMessage+"</p>");
            				jQuery("#idpShipMessageResult").show();
            				jQuery("#idpShipMessageResult").html("<p>"+shipMessage+"</p>");
            				jQuery("#shipNoResults").hide();
        				
        				} else if (shipResults.quantityAvailable <= 0) {
            				jQuery("#shipNoResults").show();
            				$("#zipError").removeClass("hide");
            				jQuery("#shipMessageResult").hide();
            				jQuery("#idpShipMessageResult").hide();
            				jQuery("#generalStatusResult").hide();
 
        				} else {
            				jQuery("#generalStatusResult").show();
            				jQuery("#generalStatusResult").html("<h5 class='alert confirm' style='padding: 0px; height: 0px; border: 0px; text-align: left;'>"+generalStatus+"</h5>");
                			jQuery("#shipNoResults").hide();
        				}
            			jQuery("#shipMessageResult").show();
            			jQuery("#shipMessageResult").html("<p>"+shipMessage+"</p>");
            			jQuery("#idpShipMessageResult").show();
        				jQuery("#idpShipMessageResult").html("<p>"+shipMessage+"</p>");
            			
        			} else {
        				if($('#isAvailableOnlineIDP').val() == "true"){
        					jQuery("#shipNoResults").show();
        					$("#zipError").removeClass("hide");	
        				}
        				jQuery("#shipMessageResult").hide();
        				jQuery("#idpShipMessageResult").hide();
        				jQuery("#generalStatusResult").hide();
        			} 

        			jQuery("#shipTo").show();
        			jQuery("#shipToMessage").html("<strong>"+rta_zipcodeElement+"</strong>");
        			jQuery("#sessionZipCode").attr("value", rta_zipcodeElement);

        		} else if(fulfillmentCode){
       				if(fulfillmentCode == 'S_BO'){
        				jQuery("#generalStatusResult").show();
        				jQuery("#generalStatusResult").html("<h5 class='alert confirm' style='padding: 0px; height: 0px; border: 0px; text-align: left;'>"+generalStatus+"</h5>");
	        				
        				jQuery("#shipMessageResult").show();
        				jQuery("#shipMessageResult").html("<p>"+shipMessage+"</p>");
        				jQuery("#idpShipMessageResult").show();
        				jQuery("#idpShipMessageResult").html("<p>"+shipMessage+"</p>");
	        				
            			jQuery("#shipTo").show();
            			jQuery("#shipToMessage").html("<strong>"+rta_zipcodeElement+"</strong>");
            			jQuery("#sessionZipCode").attr("value", rta_zipcodeElement);
        			} else {
        				jQuery("#shipUnavailable").show();
        			}
            	// Pickup
        		} else if(pickAllResults){
        			var branchesCount = 0;
        			var branchPickup = "";
        			var pickupAddrVal = "";
        			
        			if(pickAllResults.branches != null){
            			branchesCount = pickAllResults.branches.length;
        			}

        			if(pickAllResults.outOfStockFlag || branchesCount == 0){
        				jQuery("#productUnavailable").show();
        			} else {
        				jQuery("#branchDetails").show();
        				var inittable = "<table id='branchDetailsTable' width='100%' cellpadding='0' cellspacing='0'><thead><tr class='first'>" +
        						"<th width='45%' class='labelLocation' scope='col'>"+rtaLocationLabel+"</th>" +
        						"<th width='35%' class='labelAvailDate' scope='col'>"+rtaDateLabel+"</th>" +
        						"<th width='10%' class='labelAvailQty' scope='col'>"+rtaQuantityLabel+"</th></tr></thead><tbody>";
        				var endtable = "</tbody></table>";
        				var bodytable = "";
        				var formattedDate = "";
        				for(var j=0; j<branchesCount; j++){
        					branchPickup = pickAllResults.branches[j];
        					if(branchPickup.branchAddress && branchPickup.availableQty != 0){
        						pickupAddr = branchPickup.branchAddress;
        						pickupAddrVal = pickupAddr.line1 +"&nbsp;"+ pickupAddr.postalCode +"&nbsp;"+ pickupAddr.town +"&nbsp;"
        												+ pickupAddr.region.isocodeShort +"&nbsp;"+ pickupAddr.country.name;
        						formattedDate = formatRtaDate(branchPickup.pickupDate);
        						
        						bodytable += "<tr><td width='45%' headers='labelLocation' class='branchInformation'><div class='branchInformation'>";
        						bodytable += "<div><strong>"+branchPickup.branchName+"</strong></div>"+pickupAddrVal+"</div></td>";
        						
        						bodytable += "<td width='35%' headers='labelAvailDate' class='dataAvailability'><div id='branchDeliveryDate' class='requestedInfo alert confirmation'>"
        						bodytable += "<spring:theme code='rta.pickup.avail.msg'></spring:theme>&nbsp;"+formattedDate+"</div></td>";
        						
        						bodytable += "<td width='10%' headers='labelAvailQty' class='dataAvailability'><div id='branchQuantity'>";
        						bodytable += branchPickup.availableQty+"</div></td></tr>";
        					}
        				}
        				jQuery("#branchDetails").append(inittable + bodytable + endtable);
        			}
        			jQuery("#changeBranch").show();
        			
        		} else {
    				jQuery("#productUnavailable").show();
    				jQuery("#changeBranch").show();
        		}
        		
        		if($('#isIdpPage').val()=="true"){
        			try {
        				productAvail.wgWvItemsWithZeroQty(quantityAvailable);
    				}catch(err){
    					console.log("Error checking available qty");
    				}
        		}
        	}
        },
        error: function(jqXHR, textStatus, errorThrown) {
        	console.log('error: jqXHR: '+jqXHR+' ; textStatus: '+textStatus+' ; errorThrown: '+errorThrown);
            Grainger.Modals.killModal();
        },
        complete: function() {
        }
	});
	
	jq(".s7LazyLoad").unveil();
}

function rtamodal(itemNumber, quantity, zipcode, isModal){

	var zipVal = jQuery.trim(jQuery("#" + zipcode).val());

	rta_itemcode = itemNumber;
	rta_shipPack= $('input:radio[name=isShip]:checked').val();
	rta_ismodal = isModal;
	
	
	rta_shipPack=(rta_shipPack===undefined) ? '' : rta_shipPack;
	
	rta_qtyElement = jQuery("#" + quantity).doesExist() ? jQuery("#" + quantity).val() : '1';
	rta_zipcodeElement = jQuery("#" + zipcode).doesExist() ? zipVal : 'newPopUp';

	if(typeof google === 'object' && typeof google.maps === 'object') {
		rtamodalLaunch();
	} else {
		//loadGoogleMaps();
		setTimeout(function() {
			rtamodalLaunch();
		}, 500);

	}
	jq(".s7LazyLoad").unveil();
}

function rtamodalLaunch(){

	Grainger.Modals.killModal();

    Grainger.Modals.waitModal("rtamodal", "rtamodal");
	jQuery.ajax({
        url: "/modal/rtamodalpage",
        type: "GET",
        data : { findAvailability : "",
        			modal : rta_ismodal,
        			itemNumber : rta_itemcode,
        			quantity : rta_qtyElement,
        			zipCode : rta_zipcodeElement,
        			shipPack : rta_shipPack
        },
        success : function(data){
            Grainger.Modals.createAndShowModal("rtamodal", "rtamodal", data, function() {
                jQuery('body').on('click', '#returnToBranchesTab', function(e) {
                    e.preventDefault();
                    jQuery('[rel=pick-it-up]').trigger('click');
                });
            });
        	jq(".s7LazyLoad").unveil();
        },
        error: function() {
        	alert('error');
            Grainger.Modals.killModal();
        },
        complete: function() {
              window.modal_url_override = "modal/rta/ship";

              if(jQuery('#2ts') !== null){
                  var defaultFulfillmentMethod = jQuery('#defaultFulfillmentMethod').val();
                  var pickup = jQuery('#pickup').val();

                  if(defaultFulfillmentMethod == pickup){
                      showPickItUpTab();
                  }
              }
        }
	});
}

var rtaMapNamespace = {
	    markersMap : {},
	    branchMap : {},
	    infowindow : null,

	    drawRTAMap : function () {
			var mapplet = jQuery('#mapplet');
			var mapElement = jQuery('#map_canvas');
			var json = mapplet.html();
			var branches;
			var selectedMarker;
			var selectedBranch;

			try{
				branches = jQuery.parseJSON(json);
			}catch(e){
			}
			this.clearOverlays();

			if (typeof branches != 'undefined' && branches != null &&
					branches.mapplet.length != 0) {

				var lat = branches.mapplet[0].branchLatitudeKey;
				var lng = branches.mapplet[0].branchLongitudeKey;
				firstBranch = branches.mapplet[0];

				var latlng = new google.maps.LatLng(lat, lng);

				var myOptions = {
					zoom : 9,
					center : latlng,
					mapTypeId : google.maps.MapTypeId.ROADMAP
				};

				rtaMap = new google.maps.Map(document.getElementById('map_canvas'), myOptions);

				var image = new google.maps.MarkerImage(contextPath
						+ "/images/map-marker.png", new google.maps.Size(60, 30), //Size
				null, //Origin
				new google.maps.Point(16, 16), //Anchor
				new google.maps.Size(60, 30)); //Scaled size

				var label = 0;
				var index = 0;
				this.infowindow = new google.maps.InfoWindow();

				for ( var i = 0; i < branches.mapplet.length; i++) {
					var branch = branches.mapplet[i];

					label++;
					index++;

					var point = new google.maps.LatLng(branch.branchLatitudeKey,
							branch.branchLongitudeKey);

					var marker = new LabeledMarker({
						position : point,
						map : rtaMap,
						draggable : false,
						zIndex : index,
						labelText : label,
						labelClass : "map_labels", // the CSS class for the label
						labelStyle : {
							top : "-15px",
							left : "-5px"
						},
						labelZIndex : ++index,
						icon : image
					});

					this.markersMap[branch.branchCode] = marker;
					this.branchMap[branch.branchCode] = branch;

					google.maps.event.addListener(marker, 'click',
							this.makeInfoWindowListener(rtaMap, marker, branch));
				}
			} else {
				var latlng = new google.maps.LatLng(41.893077,-87.6297);
				var myOptions = {
					zoom : 9,
					center : latlng,
					mapTypeId : google.maps.MapTypeId.ROADMAP
				};
				if(jQuery('#map_canvas').doesExist()) {
					rtaMap = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
				}
			}
		},

		showMapTab : function(branchCode, lat, lng) {
			document.getElementById('map').style.display = "block";

			google.maps.event.trigger(rtaMap, 'resize');

			jQuery('#map').removeAttr('style');

			if(branchCode != -1){
				var selectedMarker = this.markersMap[branchCode];
				var selectedBranch = this.branchMap[branchCode];

				this.infowindow.close();
				this.populateInfowindow(selectedBranch);
				this.infowindow.open(rtaMap, selectedMarker);
			} else{
				this.infowindow.close();
				lat = firstBranch.branchLatitudeKey;
				lng = firstBranch.branchLongitudeKey;
			}

			var latlng = new google.maps.LatLng(lat, lng);

			rtaMap.setCenter(latlng);

			try
			{
				modal_variables.CurrentURL = "modal/rta/map";
				modal_url_override="";
			}catch(err){
				console.log("Error publishing the event for Bright Tag");
			}
		},

		//Creates a marker whose info window displays the letter corresponding
		makeInfoWindowListener : function(rtaMap, pmarker, branch) {
			return function() {
				rtaMapNamespace.infowindow.close();
				rtaMapNamespace.populateInfowindow(branch);
				rtaMapNamespace.infowindow.open(rtaMap, pmarker);
			};
		},

		populateInfowindow : function(branch) {
			var bubbleInfo = "<strong>" + branch.branchLocation + " Branch #"
					+ branch.branchCode + "</strong> <br /> ";

			bubbleInfo += branch.branchFullAddress + "<br /><br />";

			bubbleInfo += "<a href=\"javascript:drivingDirections(" + branch.branchCode + ")\">Driving Directions </a> <br /> <br />";
			bubbleInfo += "Phone: " + branch.branchTelephone + "<br />";

			if (branch.branchFax.length != 0) {
				bubbleInfo += "Fax: " + branch.branchFax + "<br /><br />";
			}

			if (branch.branchWeekdayHours.length != 0) {
				bubbleInfo += "<strong>Branch Hours</strong><br />Monday-Friday "
						+ branch.branchWeekdayHours + " " + branch.branchTimezone;

				if (branch.branchSaturdayHours.length != 0) {
					bubbleInfo += "Sat: " + branch.branchSaturdayHours + " " + branch.branchTimezone;
				}
			}

			bubbleInfo +="<br/>Hours may vary, call ahead"

			bubbleInfo += "<br/><br/><strong>Availabilty</strong><br />";
			bubbleInfo += branch.pickupMessage;

			this.infowindow.setContent(bubbleInfo);
		},

		clearOverlays : function() {
			   this.markersMap = {};
			   this.branchMap = {};
		},

		cleaningMarkersAndClose : function() {
			this.clearOverlays();
            Grainger.Modals.killModal();
		}
};

function drivingDirections(branchCode){
	branch = rtaMapNamespace.branchMap[branchCode];
	showDirections(branch.branchLatitudeKey, branch.branchLongitudeKey, branch.branchCode, branch.addressLine1, branch.city, branch.state, branch.country);
}

function showDirections(lat, lng, branchCode, address1, city, state, country){
	rtaMapNamespace.cleaningMarkersAndClose();

	findBranchNamespace.loadFindABranchModalWithBranch(lat, lng, branchCode,address1, city, state, country);
}

function showPage(page, pagenumber, size) {

	rta_page_currentpage = page;
	var pageval = "page" + page;
	var currpage = "currpage" + page;

	jQuery("#currentpage").val(page);

	var maxResults = parseInt(page) * 3;

	if (parseInt(maxResults) > size)
		maxResults = size;

	var minResults = parseInt(page);

	if (parseInt(minResults) > 1)
		minResults = (parseInt(page) * 3) - 2;

	for ( var x = 1; x < pagenumber + 1; x++) {
		var pagetoset = parseInt(page);
		if (x == pagetoset) {
			jQuery('#' + pageval).show();
		} else {
			var nonepageval = "page" + x;
			jQuery('#'+nonepageval).hide();
		}
	}

	//If it's the first page, don't show 'Prev' link
	if (parseInt(page) > 1)
		jQuery("#previous").show();
	else
		jQuery("#previous").hide();

	//If it's the last page, don't show 'Next' link
	if (parseInt(page) < parseInt(pagenumber)) {
		jQuery("#viewmore").show();
	} else {
		jQuery("#viewmore").hide();
    }

}

function showHaveItShippedTab() {
	try
	{
		modal_variables.CurrentURL =  "modal/rta/ship";
		modal_url_override="";
	}catch(err){
		console.log("Error publishing the event for Bright Tag");
	}
}

function showPickItUpTab() {
	showRtaPickupTabAllResults();
	try
	{
		modal_variables.CurrentURL = "modal/rta/pickup";
		modal_url_override="";
	}catch(err){
		console.log("Error publishing the event for Bright Tag");
	}
	
	jQuery("#pick-it-up .mapLink").on("click", function(){
		
		var mapData = jQuery(this).data("map").split(":");
		rtaMapNamespace.showMapTab(mapData[0],mapData[1],mapData[2]);
		jQuery("#3ts > a").tab('show');

	});

}

function showPickupTabs(tabName, index) {
	if (tabName == 'branchHours' || 'branchHoursAll') {
		jQuery('#' + tabName + index).toggleClass('hide');
	} else if (tabName = 'map') {
		showTabs('map');
	} else {
		jQuery('#'+tableName+index).addClass('hide');
	}
}

function showRtaPickupTabAllResults() {
	var rtaPickupAllResults = jQuery('#allPickupResults'),
		rtaPickupAvailableTodayResults = jQuery('#availableTodayPickupResults');

	rtaPickupAllResults.show();
	rtaPickupAvailableTodayResults.hide();

	// what is this? just toggle class and place styles in css file
	if (rtaPickupAllResults.length) {
		rtaPickupAllResults.css({
			'font-weight' : 'bold',
			'text-decoration' : 'none'
		});
	}

	// what is this? just toggle class and place styles in css file
	if (rtaPickupAvailableTodayResults.length) {
		rtaPickupAvailableTodayResults.css({
			'font-weight' : 'normal',
			'text-decoration' : 'underline'
		});
	}
}


function showRtaPickupTablAvailableTodayResults() {
	var rtaPickupAllResults = jQuery('#allPickupResults'),
		rtaPickupAvailableTodayResults = jQuery('#availableTodayPickupResults');

	rtaPickupAllResults.hide();
	rtaPickupAvailableTodayResults.show();

	if (rtaPickupAllResults) {
		rtaPickupAllResults.css({
			'font-weight' : 'normal',
			'text-decoration' : 'underline'
		});
	}
	if (rtaPickupAvailableTodayResults) {
		rtaPickupAvailableTodayResults.css({
			'font-weight' : 'bold',
			'text-decoration' : 'none'
		});
	}

	try
	{
		modal_variables.SortValue = "AvailableToday";
	}catch(err){
		console.log("Error publishing the event for Bright Tag");
	}
}

function rtaCallForPickup(itemNumber, quantity, branchId){
	var products={};
	var pdpAvailabilityUrl = "/rta/pickup"+ "/" + branchId;
	products[itemNumber] = quantity;
	var data = JSON.stringify(products);
	$.ajax({
		  cache : false,
		  type : 'POST',
		  url : pdpAvailabilityUrl,
		  data : data,
		  contentType : "application/json",
		  success : function(data) {
			  cleanZipCodeData();
			  if (null != data && !jQuery.isEmptyObject(data)) {
					  $.each(data, function(index, result) {
						 var productData =  JSON.parse(result);
						 var avlDate = Session.checkAvailDate(productData.availabilitydate);
						 $('#availQty').val(productData.availableQty);						 
						 if( isEmpty(avlDate)){
							 if(!productAvail.isHideAvailabilityMsg()){
								 jQuery("#shipNoResults").show();
								 $("#zipError").removeClass("hide");	 
							 }
						 }
						 else {
							 jQuery("#idpShipMessageResult").show();
							 jQuery("#idpShipMessageResult").html("<p>"+
									  $("#rtaPickUpAvailabilityDatesMsg")
									  .val()
									  + " <b>" + avlDate + "</b></p>");
							 jQuery("#shipNoResults").hide();
							 $("#zipError").addClass("hide");
						 }
						 if($('#isIdpPage').val()=="true"){
			        			try {
			        				productAvail.wgWvItemsWithZeroQty(productData.availableQty);
			    				}catch(err){
			    					console.log("Error checking available qty");
			    				}
			        	}
					  });
				
			  } 
		  },
		  failure : function() {
			  console.log("Error Fetching PickUp Branch");

		  }
	  });
	
}