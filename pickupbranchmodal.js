// Branch retrieval using branch name or geolocation

$(document).ready(function() {
	branchSearch.currentDefaultButtonText=$("#defaultLocationText").val();
	branchSearch.setDefaultButtonText=$("#setAsDefaultText").val();
	branchSearch.setLocationButtonText=$("#selectLocationText").val();
	branchSearch.currentSelectedLocationButtonText=$("#currentSelectedLocationText").val();
	branchSearch.branchHoursText = $("#branchHoursText").val();
	branchSearch.phoneText = $("#pickupPhoneNumberMsg").val();
	branchSearch.hoursText = $("#pickupHoursMsg").val();
	branchSearch.closedText = $("#pickupBranchClosedMsg").val();
	branchSearch.defaultText = $("#pickupDefaultMsg").val();
	branchLocationModal.isValidZipCodeEntered();
	branchLocationModal.isValidBranchEntered();
	branchLocationModal.bindAll();

	
});

var branchSearch = {
	currentDefaultBranch : null,
	currentSelectionBranch : null,
	isLoggedIn:false,
	setDefaultButtonText : null,
	setLocationButtonText : null,
	currentDefaultButtonText : null,
	branchHoursText : null,
	phoneText : null,
	hoursText : null,
	closedText : null,
	defaultText: null,
	
	
	// methods
	
	fetchBranches : function(event) {
		var branchName=null;
		var rtaData = Session.fetchLastRtaValues();
		if(null !=  rtaData && (!jQuery.isEmptyObject(rtaData)) && isNotEmpty(rtaData.lastSearchedRTAPickupBranchId)){
			branchName=rtaData.lastSearchedRTAPickupBranchId;
		}
		$.ajax({
	        type : "GET",
	        url : "/rta/pickup-locations-allBranches-forModal", 
	        data : {"branchName" : branchName},
	        success : function(response) {
	        if(null!=response){
	        	if (response.defaultBranch) {
	        		branchSearch.currentDefaultBranch=response.defaultBranch.name;
	        	}
	        	if (response.selectedBranch) {
	        		branchSearch.currentSelectionBranch=response.selectedBranch.name;
	        	}
	        	branchSearch.isLoggedIn=response.isLoggedinUser;
	        	
	        	var branches = response.allBranches.length;
	        	
	        	var tableRow = "";
	        	var defaultTableRow ="";
	        	$("#pickupResultTable").empty();
	        	if(isAccountPickupLocation() && event==null){
	        		$("#pickupbranchlist").empty();	
		        	$("#defaultpickupbranchlist").empty();
		        	$("#defaultlocationpickupbranchlist").empty();
	        	}
	        	tableRow ="";
	        	$.each(response.allBranches, function(index, result) {
	        		
	        			var cellContent = branchSearch.createCellContent(index, result, response.length,event);
	        			defaultTableRow = ""    			
	        			if(isAccountPickupLocation() && event==null){
	        				if(branchSearch.currentDefaultBranch == result.name){
		        				defaultTableRow = "<td class=\"td-half-width\">" + cellContent + "</td>";
		        				$("#defaultpickupbranchlist").append("<tr>" + defaultTableRow + "</tr>");
		        				$("#defaultlocationpickupbranchlist").append("<tr>" + defaultTableRow + "</tr>");
		        			}else{
		        				tableRow += "<td class=\"td-half-width\">" + cellContent + "</td>";
		        			}
	        				$("#pickupbranchlist").append("<tr>" + tableRow + "</tr>");	
	        				tableRow ="";
	        			}
	        			else{
	        				if (branchSearch.currentSelectionBranch == result.name){
		        				tableRow += "<td class=\"td-half-width selected\">" + cellContent + "</td>";
		        				}
		        			else{
		        				tableRow += "<td class=\"td-half-width\">" + cellContent + "</td>";
		        			}
	        				if ((index % 2 == 1) || (index === (branches -1))) {
		        				$("#pickupResultTable").append("<tr>" + tableRow + "</tr>");	
	        					tableRow ="";
	        					}
	     				}
        				defaultTableRow = ""    	
	        		
	        	});
	        		if(!(isAccountPickupLocation() && event==null) ){ 
		        		$('#pickupbranchModal').addClass('modal modal-window commerce');
		        		$('#pickupbranchModal').removeClass('hide');
		        		$('#pickupbranchModal').show();
		        		$('<div class="modal-backdrop"></div>').insertBefore('#pickupbranchModal');
	        		}
	        	}
			},
			error : function(errorThrown){
				console.log(errorThrown);
			}
		});
	},
	
	
	createCellContent : function(index, result, total,event) {
		var isDefault;
		if (branchSearch.currentDefaultBranch == result.name) {
			isDefault= " ("+branchSearch.defaultText+")";
		   }
		else{
			isDefault="";
		}
	   var resultContent = "<span class='pickupaddressdisplayname'><b>" + result.displayName + isDefault + "</b></span><br>";
	   
	    if (result.address !== null) {
	        resultContent += "<span class='pickupaddressresults'>" + ((null != result.address.line1)? (result.address.line1 + "</span><br>") : '');// + "</span><br>";
	        resultContent += "<span class='pickupaddressresults'>" + ((null != result.address.line2)? (result.address.line2 + ",</span><br>") : '');// + "</span><br>";
	        resultContent += "<span class='pickupaddressresults'>" + ((null != result.address.colony)? (result.address.colony + "</span><br>") : ''); //+ "</span><br>";
	        resultContent += "<span class='pickupaddressresults'>" + ((null != result.address.region.name)? (result.address.region.name + ",</span><br>") : '');// + "</span><br>";
	        resultContent += "<span class='pickupaddressresults'>" + ((null != result.address.postalCode)? (result.address.postalCode + "</span><br>") : '');// + "</span><br>";
	        }

	    // phone & hours
	    resultContent += "<span class=\"branchHoursLabel\" onclick=\"branchSearch.toggleHours(this);\"><b>+&nbsp;" + branchSearch.branchHoursText + "</b></span><table id=\"branchHoursTable\" class=\"branchHoursTable\" style=\"display:none;\">";
	    if (result.address !== null && result.address.phone !== null) {
	        resultContent += "<tr><td>" + branchSearch.phoneText + "</td><td class='no-padding'>&nbsp;:&nbsp;</td><td class='no-padding'>" + result.address.phone + "</td></tr>";
	    } else {
	    	resultContent += "<tr><td>" + branchSearch.phoneText + "</td><td class='no-padding'>&nbsp;:&nbsp;</td><td class='no-padding'>" + " "+ "</td></tr>";
	    }
	    if (result.openingHours !== null && result.openingHours.weekDayOpeningList.length > 0) {
	        resultContent += "<tr><td>" + branchSearch.hoursText + "</td><td class='no-padding'>&nbsp;:&nbsp;</td><td class='no-padding'><table>";

	        var prevWeekDay = "", prevOpenTime = "", prevCloseTime = "";
	        $.each(result.openingHours.weekDayOpeningList, function(index, openingDaysEntry) {
	        	
	        	if(openingDaysEntry.openingTime.formattedHour==null && openingDaysEntry.closingTime.formattedHour==null) {
	        		openingDaysEntry.closed=true;
	        	}
	        	if (prevWeekDay === "") {
	        		// no (or closed) previous day, start a new row
	        		resultContent += "<tr><td class='no-padding'>" + openingDaysEntry.weekDay;
	        		if (openingDaysEntry.closed) {
	        			// close out the row if closed
	        			resultContent += " - " + branchSearch.closedText + "</td></tr>";
	        		}
	        	} else if (openingDaysEntry.closed) {
	    			// close out the previous non-closed day range's row and its hours row
	    			resultContent += " <span class='hours-timezone'>" + prevOpenTime + " - " + prevCloseTime + " " + isNull(result.timezone) + "</span></td></tr>";
	        		// create a closed row
	        		resultContent += "<tr><td class='no-padding'>" + openingDaysEntry.weekDay + " - " + branchSearch.closedText + "</td></tr>";
	        		// mark the current date as closed
	                prevWeekDay = "";
	                prevOpenTime = "";
	                prevCloseTime = "";
	        	} else if (openingDaysEntry.openingTime.formattedHour !== prevOpenTime || openingDaysEntry.closingTime.formattedHour !== prevCloseTime) {
	        		// new open day with a different schedule from the previous
	    			// close out the previous non-closed day range's row and its hours row
	    			resultContent += " - " + prevWeekDay + ": ";
	    			resultContent += "<span class='hours-timezone'>" + prevOpenTime + " - " + prevCloseTime + " " + isNull(result.timezone) + "</span></td></tr>";
	        		// start a new row
	        		resultContent += "<td class='no-padding'>" + openingDaysEntry.weekDay;
	        	} else if (index == result.openingHours.weekDayOpeningList.length-1) {
	        		// close the open row if we're on the last entry
	    			resultContent += " - " + openingDaysEntry.weekDay;
	    			resultContent += "<tr><td class='no-padding'><span class='hours-timezone'>" + openingDaysEntry.openingTime.formattedHour + " - " + openingDaysEntry.closingTime.formattedHour + " " + isNull(result.timezone) + "</span></td></tr>";
	        	}

	        	if (!openingDaysEntry.closed) {
	        		// store the current open day's details for the next pass
	                prevWeekDay = openingDaysEntry.weekDay;
	                prevOpenTime = openingDaysEntry.openingTime.formattedHour;
	                prevCloseTime = openingDaysEntry.closingTime.formattedHour;
	        	}
	        });
	        resultContent += "</td></table>";
	    } else {
	    	resultContent += "<tr><td>" + branchSearch.hoursText + "</td><td class='no-padding'>&nbsp;:&nbsp;</td><td class='no-padding'><table>";
	    	resultContent += "</td></table>";	    	
	    }
	    resultContent += "</table>";
	    
	    // buttons
	    var resultButtons = "";	    
	    
		if (branchSearch.currentSelectionBranch == result.name) {
			resultButtons += "<input type=\"radio\" class=\"\" id=\"currentdefaultid\" checked=\"checked\" disabled=\"disabled\" />";
		}
		else {
			resultButtons += "<input type=\"radio\" class=\"\" id=\""
			+ result.name + "_btn\"  onclick=\"branchSearch.setPickupLocation('" + result.name + "')\" />";
		}
		var resultContainer="";
	    if(isAccountPickupLocation() && event==null){
	    	
	     if(branchSearch.currentDefaultBranch == result.name){
	    	 resultContainer = "<tr class=\""
	            	+ (index % 4 < 2 ? "tr-background" : "")
	            	+ "\"><td class=\"td-half-width2\">" 
	            	+ "</td><td class=\"td-half-width3\">" + resultContent
	            	+ "</td><td class=\"width-180\"> "+ "<input type=\"button\" class=\"btn setAsDefaultButton hide\" branch=\""+result.name + "\" value=\""+branchSearch.setDefaultButtonText+"\"   />"
	            	+ "</td></tr>";
	     }
	     else{
	    	resultContainer = "<tr class=\""
            	+ (index % 4 < 2 ? "tr-background" : "")
            	+ "\"><td class=\"td-half-width2\">" 
            	+ "</td><td class=\"td-half-width3\">" + resultContent
            	+ "</td><td class=\"width-180\"> "+ "<input type=\"button\" class=\"btn setAsDefaultButton\" branch=\""+result.name + "\" value=\""+branchSearch.setDefaultButtonText+"\"   />"
            	+ "</td></tr>";
	    	
	     } }else{
	    	 resultContainer = "<tr class=\""
	            	+ (index % 4 < 2 ? "tr-background" : "")
	            	+ "\"><td class=\"td-half-width2\">" + resultButtons
	            	+ "</td><td class=\"td-half-width3\">" + resultContent
	            	+ "</td></tr>";
	    }
	    return "<table id='infowindowTable'><tbody>" + resultContainer + "</tbody></table>";

	},


	toggleHours : function(element) {

		var obj=$(element);
		var table = obj.next('table');
		table.toggle();
		if(element.innerHTML.indexOf('+')!=-1){
			element.innerHTML=(element.innerHTML).replace("+","-");
	    }
	    else{
	    	element.innerHTML=(element.innerHTML).replace("-","+");
	    }
	   },
	
	setPickupLocation : function(branchName) {
		$.ajax({
    		cache : false,
    		type : "GET",
    		url : "/rta/pickup-locations-setDefault",
    		data : {"branchName" : branchName},
    		success : function(data) {
    			branchSearch.currentSelectionBranch=branchName;
    			window.location.reload(data.status);
    		}
    	});
		try {
			Session.updateLastRtaValues(null, branchName, "branchPickUp");
			Session.refreshCartPageOnFulfillment();
		} catch(err){
			console.log("Error in setting pickup branch in last rta", err);
		}
		
    },
	
	makeScrolable : function makeTableScroll() {
	    // Constant retrieved from server-side via JSP
	    var maxRows = 3;

	    var table = document.getElementById('pickupResultTable');
	    var wrapper = table.parentNode;
	    var rowsInTable = table.rows.length;
	    var height = 0;
	    if (rowsInTable > maxRows) {
	        for (var i = 0; i < maxRows; i++) {
	        	height += $('tr').eq(i).height();
	        }
	        //wrapper.style.height = height + "px";
	        $(wrapper).css({'height': height+'px'});
	    }
	}
	
};

var branchLocationModal = {
		
		branchModalPopup : function() {
			Grainger.Modals.waitModal("gwwBranchSearchModal", "gwwBranchSearchModal");
			var data = jQuery("#gwwBranchSearchModal").html();
			Grainger.Modals.createAndShowModal("gwwBranchSearchModal", "gwwBranchSearchModal", data);
			$('.modal-backdrop').hide();
			branchLocationModal.bindAll();
			branchLocationModal.clearResults();
			branchLocationModal.showBranchInfoTab();
			branchLocationModal.cleareBranchLocationModalErrors();
		},
		
		showBranchInfoTab : function() {
			$('#shippingDetailsTab').addClass('hide');
			$('#branchDetailsTab').removeClass('hide');
			$('#branchInfoTab').attr('class','active');
			$('#shippingInfoTab').attr('class','');
			$('.branchModalUpdateBtn').addClass('hide');
		},
		
		showShippingInfoTab : function() {
			$('#branchDetailsTab').addClass('hide');
			$('#shippingDetailsTab').removeClass('hide');
			$('#shippingInfoTab').attr('class','active');
			$('#branchInfoTab').attr('class','');
			$('.branchModalUpdateBtn').removeClass('hide');
		},
		
		validZipCode : function(zipCode) {
			return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
		},
		
		isValidZipCodeEntered : function() {
			$(document).on('keypress', "#branchModalZipCode", function(event){
				var keycode = (event.keyCode ? event.keyCode : event.which);
			    if(keycode == '13'){
			    	event.preventDefault();
			    	branchLocationModal.isValidZipCode();
			    }
			});
		},
		
		isValidZipCode : function() {
    		var urlCheckPostal = "/location/validateAddressForPostalCode";
    		branchLocationModal.cleareBranchLocationModalErrors();
    		var zipCode = $("#branchModalZipCode").val();
    		if (isEmpty(zipCode)) {
    			// display errors
    			$("#zipCodeError").removeClass("hide");
    			$("#zipCodeInvalidMatchError").addClass("hide");
    		} else if (!branchLocationModal.validZipCode(zipCode) || !isPositiveInteger(zipCode)) {
    			// display format error
    			$("#zipCodeError").removeClass("hide");
    			$("#zipCodeInvalidMatchError").addClass("hide");
    		} else {
    			$.ajax({
    	    		cache : false,
    	    		type : "POST",
    	    		url : contextPath+ urlCheckPostal,
    	    		data: { zipCode:zipCode},
    	    		dataType: "json",
    	    		async: false,
    	    		success : function(response) {
    	    			if(response != null && response === true){
    	    				//update last RTA
    	    				Session.updateLastRtaValues(zipCode,null, "standard-net");
    	    				branchLocationModal.closeBranchLocationModal();
    	    				var url = addURLParameter(location.href, 'cartRefresh', true);
    		    			url = isNotEmpty(url) ? url : location.href;
    	    				setTimeout(function(){
    	    	    			location.href = url;
    	    	    		},500);
    	    			} else {
    	    				//errors on postal address not found
    	    				$("#zipCodeError").addClass("hide");
    	        			$("#zipCodeInvalidMatchError").removeClass("hide");
    	    			}
    	    		},
    	    		error : function(errorThrown){
    	    			console.log(errorThrown);
    	    		}
    	    	});
    		}
    	},
    	
    	closeBranchLocationModal : function() {
    		$('#gwwBranchSearchModal').hide();
    		$('#gwwBranchSearchModal').removeClass('modal modal-window commerce');
    	    $('.modal-backdrop').hide();
    	    branchLocationModal.clearResults();
    	    branchLocationModal.cleareBranchLocationModalErrors();
    	},
    	cleareBranchLocationModalErrors : function() {
    		$(".brPostalErrors").addClass("hide");
    		$("#zipCodeError").addClass("hide");
    		$("#zipCodeInvalidMatchError").addClass("hide");
    	},
    	
    	isValidBranchEntered : function() {
			$(document).on('keypress', "#branchSearchInput", function(event){
				var keycode = (event.keyCode ? event.keyCode : event.which);
			    if(keycode == '13'){
			    	event.preventDefault();
			    }
			});
		},
    	
		defaultRadius : 500,
		findBranchesUrl : contextPath + "/store-finder/findbranches",
		userLocationSearch : false,

		// bind methods
		bindAll : function() {
			branchLocationModal.bindModalSearch();
			branchLocationModal.bindSelectDeliveryLink();
		},

		bindModalSearch : function() {
			$("#branchModalPickupSearchBtn").on("click", function() {
				branchLocationModal.internalSearch();
				return false;
			});

			$("#branchSearchInput").on("keydown", function (e) {
				if(e.keyCode == 13){
					e.preventDefault();
					branchLocationModal.internalSearch();
					return false;
				}
			});

		},
		bindSelectDeliveryLink : function() {
			$("a.branchSelectDelivery").on("click", function() {
				branchLocationModal.showShippingInfoTab();
				return false;
			});


		},
		internalSearch : function() {
			// handle searches performed from within the modal
			branchLocationModal.userLocationSearch=false;
			var query = $('#branchSearchInput').val();
			var radius = branchLocationModal.defaultRadius;
			branchLocationModal.geocodeAddress(query, radius);
		},

		geocodeAddress : function(query, radius) {
			$(".clearBranchMsgs").addClass("hide"); //clear msgs
			if (isNotEmpty(query)) {
				branchLocationModal.clearResults();
				var geocoder = new google.maps.Geocoder();

				geocoder.geocode({
					"address" : query,
					componentRestrictions : {
						country : "MX"
					}
				}, function(results, geostatus) {
					var lat = 0, lng = 0;
					if (geostatus === google.maps.GeocoderStatus.OK) {
						lat = results[0].geometry.location.lat();
						lng = results[0].geometry.location.lng();
					}
					if ((jQuery.urlParam("lat") != "" && jQuery.urlParam("lat").length)
							&& (jQuery.urlParam("long") != "" && jQuery.urlParam("long").length)) {
						lat=jQuery.urlParam("lat");
						lng=jQuery.urlParam("long");
					}
					branchLocationModal.lookupBranches(query, radius, lat, lng);
				});
			} 
			else if (branchLocationModal.userLocationSearch) {
				var currentLat = $('#currentLatitude').val();
				var currentLong = $('#currentLongitude').val();

				branchLocationModal.lookupBranches('', radius, currentLat, currentLong);

			}
			else {
				//clear previous results & messages
				branchLocationModal.clearResults();
				//display message after content cleared
				$(".invalid-branch-search-msg").removeClass("hide");

			}
		},

		lookupBranches : function(query, radius, latitude, longitude, isGuestCheckout) {
			var helpers = {

					branchHoursText : $("#branchHoursText").val(),
					phoneText : $("#pickupPhoneNumberMsg").val(),
					hoursText : $("#pickupHoursMsg").val(),
					closedText : $("#pickupBranchClosedMsg").val(),
					isProductInventoryModalEnabled : false,
					defaultInventoryOnLookupError : 0,
					branchModal : true,
					lower: function(val) { return val.toLowerCase(); }
			};
			//set branch template for rendering results
			var branchTemplate = jQuery.templates("#branchAvailabilityDetails");
			$.ajax({
				cache : false,
				type : "GET",
				url : branchLocationModal.findBranchesUrl,
				data : {
					"latitude" : latitude,
					"longitude" : longitude,
					"q" : query,
					"radius" : radius,
					"currentLatitude" : $('#currentLatitude').val(),
					"currentLong" : $('#currentLongitude').val()
				},
				success : function(resData) {

					var brSearchResults = resData.branchSearchResults;
					var userData = resData.userLocationResults;

					var data = (isNotEmptyData(brSearchResults)) ? brSearchResults : userData;

					if(data!=null &&  !$.isEmptyObject(data)) {

						$(".branchSearchResults").removeClass("hide");
						var branchResults = branchTemplate.render({"branchData":data}, helpers);
						$(".branchSearchResults").html(branchResults);

						$(".clearBranchMsgs").addClass("hide"); //clear msgs
						if (branchLocationModal.userLocationSearch) {
							//display message for User nearby locations on load
							$(".user-nearby-msg").removeClass("hide");
						}else if(isNotEmptyData(brSearchResults)){
							//display message for branch search results found
							$(".branch-search-results-msg").removeClass("hide");
						}else if(isNotEmptyData(userData)){
							//display user nearby location instead
							$(".no-branch-show-user-nearby-msg").removeClass("hide");
							$(".no-branch-select-delivery-msg").removeClass("hide");
						}


					} 
					else if (branchLocationModal.userLocationSearch) {
						//no message on load for User locations
						$(".user-nearby-msg").addClass("hide");
					}
					else if(!branchLocationModal.isUserLocationFound()){
						//no search results, no user location 
						$(".no-branch-no-user-location-msg").removeClass("hide");
						$(".no-branch-select-delivery-msg").removeClass("hide");
					}
					else {
						// no branch results by search term or close to user 
						$(".no-branch-no-user-nearby-msg").removeClass("hide");
						$(".no-branch-select-delivery-msg").removeClass("hide");

					}
				}
			});
		},

		clearResults : function() {
			$(".branchSearchResults").html("");
			$(".branchSearchResults").addClass("hide");
			$(".clearBranchMsgs").addClass("hide"); //clear msgs

		},

		initCurrentUserLocation:  function() { 

			if(branchLocationModal.isUserLocationFound()){
				branchLocationModal.findBranchesByUserLocation();
				return;
			}

			// Try HTML5 geolocation.
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					var pos = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
					};

					$('#currentLatitude').val(pos.lat);
					$('#currentLongitude').val(pos.lng);

					branchLocationModal.findBranchesByUserLocation();

				}, function() {
					console.log("Browser has GeoLocation, but Geolocation service failed");
				});
			} else {
				// Browser doesn't support Geolocation
				console.log("Browser doesn't support GeoLocation");
			}
		},

		isUserLocationFound: function() {

			return isNotEmpty( $('#currentLatitude').val()) && isNotEmpty( $('#currentLongitude').val());
		},

		findBranchesByUserLocation: function() {
			if(branchLocationModal.isUserLocationFound()){

				branchLocationModal.userLocationSearch=true;
				var radius = branchLocationModal.defaultRadius;
				branchLocationModal.geocodeAddress('', radius);
			}
		}



};

function closepickupmodal(){
	$('#pickupbranchModal').hide();
	$('#pickupbranchModal').removeClass('modal modal-window commerce');
    $('.modal-backdrop').hide();
    Session.refreshCartPageOnFulfillment();
}

function isNull(value){
	
	return value == null ? "" : value;
}


function isAccountPickupLocation() {
	
	return ($("#isAccountPickupLocation").val() === 'true');
}
