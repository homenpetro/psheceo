var dlg;
var val;
var mmap;  
var currentpage = 1;
var address = "";
var defaultMiles = 50;
var findABranchModalCreated = false;

var findBranchNamespace = {
		def : null, 
		geocoder : null,
		infowindow : null,
		markersArray : [],
		findBranchDialog : null,
		findBranchSearchParameters : null,
		findBranchType : null,
		findBranchCountryFlag : false,
		availabilityFlag : false,	
		BRANCH_INCREMENT : 12,
		branchIndex : 0,
		latitude : 0,
		longitude : 0,
		mappletArray : [],
		loadFindABranchModalWithBranch : function(lat, lng, branchcode, address1, city, state, country){
			findBranchNamespace.findBranch(lat, lng, branchcode, true, true);
			findBranchNamespace.def.then(function(userdata){
					wipeDirections(branchcode, address1, city, state, country);
				});
		},
		
		findBranch : function(lat, lng, location, ismodal, maponebranch) {
		 var distance,
			    count,
			    url = contextPath + "/modal/defaultBranch?findbranch",
			    drivingDirectionsLink,
			    locfirst,
			    locend,
			    updatedata;
			
			
			// Set lat and long for Show More feature
			findBranchNamespace.latitude = lat;
			findBranchNamespace.longitude = lng;
			findBranchNamespace.branchIndex = 0;
			findBranchNamespace.mappletArray = [];
			
			if (!ismodal) {
				url = contextPath + "/myaccount/branchpickup?pickup";
			} else {
				ismodal = true;
			}
			
			if (!maponebranch){
				maponebranch = false;
			}
			if(jQuery('#findBranchMiles').doesExist()){
				distance = jQuery('#findBranchMiles').val();				
			} else if(jQuery('#miles') != null){
				distance = jQuery('#miles').val();
			} else{
				distance = "50";
			}

			var data = {
				currentpage: jQuery('#currentpage').val(),
				selectedAddress: jQuery('#selectedAddress').val(),
				searchbox: jQuery('#enterAddress').val(),
				initialFindBranchRender : false,
				availabilityFlag : findBranchNamespace.availabilityFlag,
				searchbox : location,
				miles : distance,
				latitude : lat,
				longitude : lng,
				maponebranch: maponebranch,
				checkoutFAB: true
			}

			Grainger.Modals.killModal();
			Grainger.Modals.waitModal();

			jQuery.ajax({
				url : url,
				timeout: 5000,
				data : data,
				dataType : "text",
				type: "POST",
				success : function(data) {
					Grainger.Modals.killModal();
					if (data == null || data == "") {
						jQuery("#suggestions").html("An error has occurred:<br>No data available. Try again later.");
						findBranchNamespace.drawMap('',41.893077,-87.6297);
					} else {

						if (ismodal) {

							Grainger.Modals.createAndShowModal(null, null, data);

							jQuery(document).on("click", "#drivingDirectionsLink", function () {
								try {
									modal_variables.CurrentURL =  "modal/branchlocator/getdirections";
								}catch(err){
									console.log("Error publishing the event for modal_variables");
								}
							})
							
							// This will eventually be removed when the findabranchmodal.jsp is refactored removing all hidden json from html.
							findBranchNamespace.mappletArray = jQuery.parseJSON( jQuery("#mapplet").html() ).mapplet;

						} else {
							locfirst = data.indexOf("<div id='branchliststart'></div>");
							locend = data.indexOf("<div id='branchlistend'></div>");
							updatedata = data.substr(locfirst, locend - locfirst);

							jQuery("#pickupbranchlist").html(updatedata);
						}
					}
					findBranchNamespace.findBranchCountriesInit();
					
				},
				error : function(type, error) {
					Grainger.Modals.killModal();
					console.log("An unknown error has occurred: " + error);
				}
			});
					
			if(ismodal){
				try {
					modal_variables.CurrentURL = "/modal/Branch_results";
				}catch(err){
					console.log("Error publishing the event for modal_variables");
				}
			}
		},
		
		findBranchCountriesInit : function() {
			var dataLink;
			
			jQuery("#findBranchCountries .countryLink").on("click", function() {
			    dataLink = jQuery(this).attr("data-code");
				getAddressLocation(dataLink, true);
			});
			
			jQuery("#searchheader .findABranchCountry").on("click", function() {
				jQuery("#findBranchCountries").removeClass("hidden");
			}) 
			
			jQuery("#searchheader .closeButton").on("click", function() {
				jQuery("#findBranchCountries").addClass("hidden");
			}) 
			 
		},
		
		drawMap : function(kml, lat, lng) {

			this.clearOverlays();
			var zoom = 8;
			
			if ( findBranchNamespace.findBranchCountryFlag ) {
				lat = 0;
				lng = 0;
				zoom = 1;
				findBranchNamespace.findBranchCountriesInit();
				jQuery("#findBranchCountries").removeClass("hidden");
				findBranchNamespace.findBranchCountryFlag = false;
			}
			
			var fMapBounds = new google.maps.LatLngBounds(),
			    mapElement = jQuery("#map_canvas"),
			    myOptions = {
		  	      zoom: zoom,
		  	      center: new google.maps.LatLng(lat, lng),
		  	      mapTypeId: google.maps.MapTypeId.ROADMAP
		  	    }, 
		  	    mmap = new google.maps.Map(mapElement[0], myOptions);
			
			if (kml != '') {			    
			    var image = new google.maps.MarkerImage(contextPath + "/images/map-marker.png",
			    		new google.maps.Size(60, 30),  //Size 
			    		null, 						   //Origin	
			    		new google.maps.Point(16, 16), //Anchor
			    		new google.maps.Size(60, 30)), //Scaled size
			    	label = 0,
				    index = 0,
				    branches = kml.mapplet,
				    branch = null,
				    point = null,
				    marker = null;
	
			    this.infowindow = new google.maps.InfoWindow();
				
				for ( var i = 0; i < branches.length; i++) {
				    branch = branches[i];
					label++;
					index++;
					point = new google.maps.LatLng(branch.branchLatitudeKey, branch.branchLongitudeKey);
					marker = new LabeledMarker({
				         position: point,
				         map: mmap,
				         draggable: false,
				         zIndex: index,
				         labelText: label,
				         labelClass: "map_labels", // the CSS class for the label
				         labelStyle: {top: "-15px", left: "-5px"},
				         labelZIndex: ++index,
				  	   icon: image
				       });			
					
				    this.markersArray.push(marker);
				    fMapBounds.extend(point);
					google.maps.event.addListener(
						    marker, 
						    'click', 
						    this.makeInfoWindowListener(mmap, marker, label, branch)
						  );	
					
				}
				
				if (branches.length> 1){
					mmap.fitBounds(fMapBounds);
				}
				
			}
		},
		
		//Creates a marker whose info window displays the letter corresponding
		//to the given index.
		makeInfoWindowListener : function(mmap, pmarker, index, branch) {
			return function() {
			    findBranchNamespace.infowindow.close();
			    
			    var bubbleInfo = "<strong> #" + index + "</strong><br /><br />Branch " + branch.branchCode	+ "<br /> " + branch.branchFullAddress;
			    
				if (branch.branchWeekdayHours.length != 0) {
					bubbleInfo = bubbleInfo
							+ "<br /><br /><strong>Hours of operation</strong><br />Mon-Fri: " + branch.branchWeekdayHours + " " + branch.branchTimezone;
					
					if (branch.branchSaturdayHours.length != 0) {
						bubbleInfo = bubbleInfo + "<br />Sat: " + branch.branchSaturdayHours + " " + branch.branchTimezone;
					}
					
					bubbleInfo = bubbleInfo + "<br />Hours may vary, call Ahead<br /><br />";
				}	    
				
				findBranchNamespace.infowindow.setContent(bubbleInfo);
				findBranchNamespace.infowindow.open(mmap, pmarker);		
			};
		},
		
		clearOverlays : function() {
		  if (this.markersArray) {
		    for (i in this.markersArray) {
		    	if(!isNaN(i))
		    		this.markersArray[i].setMap(null);
		    }
		  }
		},

		cleaningMarkersAndClose : function(){
			this.clearOverlays();
			Grainger.Modals.killModal();
			findABranchModalCreated = true;
			window.location.reload();
		}
	};

var branchLocationSearch = {
		 markers : [],
		
		initBranchLandingMap : function() {
			var latitude = parseFloat($("#branchLatitude").val());
			var longitude = parseFloat($("#branchLongitude").val());
			
			if(latitude != '' && longitude != '') {
				var branchLocation = {lat: latitude, lng: longitude};
				  
				  var branchMap = new google.maps.Map(
				      document.getElementById('branch-map-inline'), {
				    	  zoom: 14, 
				    	  center: branchLocation,
				    	  mapTypeId: google.maps.MapTypeId.ROADMAP,
				    	  streetViewControl: false
				     });
				    
				  branchLocationSearch.displayBranchMap(branchLocation, branchMap);
			}
		},
		
		displayBranchMap : function(branchLocation, branchMap) {
			branchLocationSearch.clearMarkers();
			branchLocationSearch.getUserLocation(branchLocation, branchMap);
			branchLocationSearch.addLocationToMap(branchLocation, branchMap);
		},
		
		getUserLocation : function(branchLocation, branchMap) {
			var infoWindow = new google.maps.InfoWindow;
			if (navigator.geolocation) {
		          navigator.geolocation.getCurrentPosition(function(position) {
			            var pos = {
			              lat: position.coords.latitude,
			              lng: position.coords.longitude
			            };
			            
			            $('#currentLatitude').val(pos.lat);
			            $('#currentLongitude').val(pos.lng);
			            
			            var marker = new google.maps.Marker({
			            	  position: pos,
			            	  map: branchMap,
			            	  icon: {
			            	    path: google.maps.SymbolPath.CIRCLE,
			            	    fillColor: "#4285f4",
			            	    fillOpacity: 1.0,
			            	    strokeColor: "#ffffff",
			            	    strokeOpacity: 10,
			            	    strokeWeight: 3,
			            	    scale: 8
			            	  },
			            	});
		          });
			} else {
	          // Browser doesn't support Geolocation
				branchLocationSearch.handleLocationError(false, infoWindow, branchMap.getCenter(), branchMap);
		    }
		},
		
		handleLocationError : function(browserHasGeolocation, infoWindow, pos, branchMap) {
	        infoWindow.setPosition(pos);
	        infoWindow.setContent(browserHasGeolocation ?
	                              'Error: The Geolocation service failed.' :
	                              'Error: Your browser doesn\'t support geolocation.');
	        infoWindow.open(branchMap);
	    },
		
		addLocationToMap : function(branchLocation, branchMap) {
			var marker = new google.maps.Marker({position: branchLocation, map: branchMap});
			branchLocationSearch.markers.push(marker);
			branchLocationSearch.setMapOnAll(branchMap);
		},
		
		setMapOnAll : function(map) {
	        for (var i = 0; i < branchLocationSearch.markers.length; i++) {
	        	branchLocationSearch.markers[i].setMap(map);
	        }
	     },
		
		clearMarkers : function() {
			branchLocationSearch.setMapOnAll(null);
			branchLocationSearch.markers = [];
	    },
	    
	    openDirectionsMap : function() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(successCallback,errorCallback);
			}else {
	          // Browser doesn't support Geolocation
				branchLocationSearch.handleLocationError(false, infoWindow, null);
		    }
		}
};

function successCallback(success) {
    var address = $("#branchAddress").val();
    var pos = {
            lat: success.coords.latitude,
            lng: success.coords.longitude
   };
    var url = "https://www.google.com/maps/dir/?api=1&origin="+pos.lat+","+pos.lng+"&destination=Grainger"+address;
    window.open(url, '_blank');
}

function errorCallback(error) {
	var address = $("#branchAddress").val();
	var url = "https://www.google.com/maps/dir/?api=1&destination=Grainger"+address;
    window.open(url, '_blank');
}

	function wipeDirections (location, building, street, city, country) {
		jQuery('#searchheader, #getdirectionsfromto, #route_canvas').hide();

		jQuery('#selectedAddress').val(building + " " + street + " " + "," + city);
		jQuery('#selectedLocation').val("");
		jQuery('#getaddress').show();
	}
	
	function branchlistshow(page, pagenumber) {
		jQuery("#currentpageval").val(page);
		var pageval = "page" + page;
		var currpage = "currpage" + page;
		var pagetoset = parseInt(page);
		
		if(pagetoset == 1){
			jQuery('#branchesPrevLink').addClass('hide');
		} else {
			jQuery('#branchesPrevLink').removeClass('hide');
		}
		if(pagetoset == pagenumber-1){
			jQuery('#branchesNextLink').addClass('hide');
		} else {
			jQuery('#branchesNextLink').removeClass('hide');
		}
		for (var x=1; x < pagenumber; x++){
			var currpagenbr = "pageid" + x;
			var nolinkpagenbr = "nolinkpageid" + x;
		
			if (x == pagetoset) {
	            jQuery("#" + pageval).removeClass("hide");
	            jQuery("#" + nolinkpagenbr).removeClass("hide");
	            jQuery("#" + currpagenbr).addClass("hide");
	        } else {
	            var nonepageval = "page" + x;
	            jQuery("#" + nonepageval).addClass("hide");
	            jQuery("#" + nolinkpagenbr).addClass("hide");
	            jQuery("#" + currpagenbr).removeClass("hide");
	        }
		}
	}

	 
	 function branchlistprior(pagenumber) {
		var pagetoset = parseInt(jQuery("#currentpageval").val()) - 1;
		if (pagetoset > 0) {
				branchlistshow(pagetoset, pagenumber)
		}
	  
	 }
	 function branchlistnext(pagenumber) {
		var pagetoset = parseInt(jQuery("#currentpageval").val()) + 1;
		if (pagetoset < pagenumber) {
				branchlistshow(pagetoset, pagenumber)
		}
	  
	 }

function loadFindABranchModal() {	
	getDefaultBranch();
}

function submitDirections(selectedLocation) {

	var address = jQuery("#selectedAddress").val();
	var directionsPanel = jQuery("#route_canvas");
	
	jQuery("#route_canvas").html("");
	
	var mmap = new google.maps.Map(document.getElementById('map_canvas'), {
		mapTypeId: google.maps.MapTypeId.ROADMAP
		});

		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();

		directionsDisplay.setMap(mmap);
		directionsDisplay.setPanel(directionsPanel[0]);

		var request = {
			origin: selectedLocation, 
			destination: address,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};

		directionsService.route(request, function(response, status) {
			
		if (status == google.maps.DirectionsStatus.OK) {
		  directionsDisplay.setDirections(response);
		  jQuery("#searchheader, #getaddress").hide();
		  jQuery("#getdirectionsfromto, #route_canvas").show();
		  jQuery("#getdirectionsfrom").html(selectedLocation);
		  jQuery("#getdirectionsto").html(address);
		  jQuery("#selectedAddress").val(address);
		}else{
			jQuery('#hasErrorGetAddress').show();
			showSuggestions(selectedLocation, 2);	
			findBranchNamespace.drawMap('', 41.893077, -87.6297);
		}
		});
		
		try {
			modal_variables.CurrentURL =  "modal/branchlocator/map";
		}catch(err){
			console.log("Error publishing the event for modal_variables");
		}
}

function getDefaultBranch() {

	Grainger.Modals.waitModal("findbranch", "findbranch");

	jQuery.ajax({
		url : contextPath + "/modal/defaultBranch?findbranch",
		data : {
			initialFindBranchRender : true
		},
		dataType : "HTML",
		type: "GET",
		success : function(data) {
			if (data == null || data == "") {
				jQuery("#suggestions").html("An error has occurred:<br>No data available. Try again later.");
				findBranchNamespace.drawMap('',41.893077,-87.6297);
			} else {
				Grainger.Modals.createAndShowModal("findbranch", "findbranch", data);
			}

			if(findBranchNamespace.findBranchSearchParameters) {
				getAddressLocation(findBranchNamespace.findBranchSearchParameters, true);
			}

			findBranchNamespace.findBranchCountriesInit();
		},
		error : function(type, error) {
			console.log("An unknown error has occurred: " + error);
		}
	});
}

function setDefaultBranch(branch) {

	jQuery.ajax({
		url : contextPath + "/myaccount/deliverypickup?setDefault",
		form: jQuery('#findBranch').serialize(),
		type: "POST",
		data : {
			searchbox : branch
		},
		handleAs : "text",
		success : function(data) {
				window.location.replace(contextPath + "/myaccount/branchpickup");
		},
		error : function(type, error) {
			console.log("An unknown error has occurred: " + error);
		}
	});
}

function wipeDirections(location, building, street, city, country) {
	jQuery('#searchheader, #getdirectionsfromto, #route_canvas, #hasErrorGetAddress').hide();
	jQuery("#selectedAddress").val(building + " " + street + " " + "," + city);
	jQuery("#selectedLocation").val("");
	jQuery('#getaddress').show();
}

function getAddressLocation(searchbox, ismodal, maponebranch) {
	
	try {
		findBranchNamespace.clearOverlays();
	} catch (err) {

	}

	var location = searchbox;
	if (!findBranchNamespace.geocoder) {
		findBranchNamespace.geocoder = new google.maps.Geocoder(); 
		
	}
	

	if (findBranchNamespace.geocoder) {
		try {
			findBranchNamespace.geocoder.geocode({address: location}, function(locResult, status) {
		
			if(status == google.maps.GeocoderStatus.OK){
				point = locResult[0].geometry.location;
				if (!point) {
					findBranchNamespace.findBranch(null, null, location, ismodal, maponebranch);
				} else {
					findBranchNamespace.findBranch(point.lat(), point.lng(), location, ismodal, maponebranch);
				}				
			}else{
				findBranchNamespace.findBranch(null, null, location,ismodal, maponebranch);
			}
		});
	}
		catch(error) {
			 
		}
	}
	
}

function appendBranches() { 
	
	findBranchNamespace.branchIndex += findBranchNamespace.BRANCH_INCREMENT;
	
	var BRANCH_ROW_TEMPLATE = '<tr><td class="locationCount">{index}.</td><td class="locationAddress"><p><strong>{branchLocation} Branch #{branchCode}</strong></p><p>{addressLine1}, {city}, {state} {postalCode}</p></td><td class="locationDistance">{distance} mi {BRANCH_ROW_PICKUP_TEMPLATE}</td></tr><tr class="phonehoursnsuch"><td class="locationCount"></td><td colspan="3" class="branch-directions"><div class="branchMapPhoneBlock findABranchBlock locationAddress"><ul class="nav"><li><a href="javascript:void(0)" data-count="{type}{index}" class="phoneHoursLink">Phone &amp; Hours</a></li><li><a id="drivingDirectionsLink" href="javascript:void(0);" onclick="wipeDirections(\'{branchCode}\',\'{addressLine1}\',\'{city}\',\'{state}\',\'{country}\');return false;">Driving Directions</a></li></ul><dl id="phoneHoursList{type}{index}" class="phoneHoursList hide"><dt class="fieldHeader">Phone</dt><dd class="field">{branchTelephone}</dd><dt class="fieldHeader">Fax</dt><dd class="field">{branchFax}</dd><dt class="fieldHeader">Hours</dt><dd class="field">{branchWeekdayHours} {branchTimezone}</dd><dt class="fieldHeader"></dt><dd class="field fieldMessage">Hours may vary, call ahead</dd></dl></div></td></tr>',
	    BRANCH_ROW_PICKUP_TEMPLATE = '<a href="javascript:void(0);" class="btn btnSmall"onclick="updatePickupAvailability(\'{postalCode}\', \'{branchCode}\', \'{searchTerm}\')">Select</a>',
		branchRowTemplate = null,
		searchTerm = jQuery("#branchButtonShowMore").val(),
	    branchButtonShowMore = jQuery("#branchButtonShowMore"),
		branchShowMoreSpinner = jQuery("#branchShowMoreSpinner"),
		searchTerm = jQuery("#zipcode").val(),
		jsonObject = {},
		mapObject = {},
		HTMLbranchRows = [],
	    branches = [],
	    moreButtonFlag = false,
	    dataParam = jQuery("#findBranch").serialize()+"&latitude="+findBranchNamespace.latitude+"&longitude="+findBranchNamespace.longitude+"&branchIndex="+findBranchNamespace.branchIndex;

    jQuery.ajax({
			type : "POST",
			url : "/FindBranchComponentController/findABranchModal/showMore",
			beforeSend : function() {
				//Enable Spinner
				branchButtonShowMore.addClass("hidden");
				branchShowMoreSpinner.removeClass("hidden");
			},
			data : dataParam,
			dataType : "json",
			success : function(data) {

				try{
					jsonObject = data;
					moreButtonFlag = jsonObject[0].meta.nextButtonFlag;
					branches = jsonObject[1].branches;
				}
				catch(error){
					jQuery("#branchShowMoreErrorMessage").removeClass("hide");
					branchShowMoreSpinner.addClass("hidden");
					return false;
				}

				if ( findBranchNamespace.availabilityFlag ) {
					branchRowTemplate = BRANCH_ROW_TEMPLATE.replace("{BRANCH_ROW_PICKUP_TEMPLATE}", BRANCH_ROW_PICKUP_TEMPLATE);
				} else {
					branchRowTemplate = BRANCH_ROW_TEMPLATE.replace("{BRANCH_ROW_PICKUP_TEMPLATE}", "");
				}

				for (var i = 0, len = branches.length; i < len; i++) {

					HTMLbranchRows[i] = branchRowTemplate.replace(/{index}/g, i+findBranchNamespace.branchIndex+1)
										.replace(/{type}/g, findBranchNamespace.findBranchType)
										.replace("{searchTerm}", searchTerm)
										.replace("{branchLocation}", branches[i].branchLocation)
										.replace(/{branchCode}/g, branches[i].branchCode)
										.replace("{addressLine1}", branches[i].addressLine1)
										.replace("{city}", branches[i].city)
										.replace("{state}", branches[i].state)
										.replace(/{postalCode}/g, branches[i].postalCode)
										.replace("{country}", branches[i].country)
										.replace("{branchTelephone}", branches[i].branchTelephone)
										.replace("{branchFax}", branches[i].branchFax)
										.replace("{branchWeekdayHours}", branches[i].branchWeekdayHours)
										.replace("{branchTimezone}", branches[i].branchTimezone)
								    	.replace("{distance}", branches[i].distance);
				}

				// Append new branches to branch table
				jQuery("#results-table").append( HTMLbranchRows.join("") ); 

				// Google Maps Update
				findBranchNamespace.mappletArray = jQuery.merge(findBranchNamespace.mappletArray, branches); 	
				mapObject.mapplet = findBranchNamespace.mappletArray;
				findBranchNamespace.drawMap(mapObject, findBranchNamespace.latitude, findBranchNamespace.longitude);	

				// Hide button if there are no more branches to show.
				if(moreButtonFlag) {
					branchButtonShowMore.removeClass("hidden");
				} else {
					branchButtonShowMore.addClass("hidden");
				}

				// Disable Spinner
				branchShowMoreSpinner.addClass("hidden");

			},
			error : function() {
				jQuery("#branchShowMoreErrorMessage").removeClass("hide");
				branchShowMoreSpinner.addClass("hidden");
			}
	});
}

// jank jank jank jank jank
jQuery(function() {
	/*it defines on click (show/hide) of phone hours in default and new locations*/
	jQuery("body").on("click", ".phoneHoursLink", function(e) {
		var count = jQuery(this).data('count');
		jQuery("#phoneHoursList"+count).toggleClass("hide");
		jQuery(this).toggleClass("active");
	});
});

function backToResults() {
	jQuery('#searchheader').show();
	jQuery('#enterAddress').val('');
	jQuery('#getaddress, #getdirectionsfromto, #route_canvas, #hasErrorGetAddress').hide();
	
	var mapplet = jQuery('#mapplet');
	var json = mapplet.html();
	var branches = jQuery.parseJSON(json);
	
	var lat = 0;
	var lng = 0;
	
	if(branches.mapplet.length != 0){
		var lat = branches.mapplet[0].branchLatitudeKey;
		var lng = branches.mapplet[0].branchLongitudeKey;
	}
	
	findBranchNamespace.drawMap(branches, lat, lng);
}

function doSuggestions(address, point1, point2) {
	jQuery('#enterAddress').val("");
	jQuery('#enterAddress').val(address);
	findBranchNamespace.findBranch(point1, point2, '');
}

//====== Geocoding ======
function showSuggestions(search, page) {
	
	var geo = new google.maps.Geocoder(),
		address = "",
		strAddress = "",
		suggestions = jQuery("#suggestions"),
		innerHTML = "",
		innerHTMLTitle = "Did you mean:";

	// ====== Perform the Geocoding ======
	return geo.geocode(
					{address: search},
					function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							// ===== If there was more than one result, "ask did
							// you mean" on them all =====
							if (results.length > 0) {
								
								for (var i = 0; i < results.length; i++) {
									address = results[i].address_components;
									strAddress = "";

									innerHTML += "<br/>" + (i + 1);

									if (page == 1) {
										innerHTML += ": <a href=\"javascript:doSuggestions('";
									}else{
										innerHTML += ": <a href=\"javascript:submitDirections('";
									}
										
									for (var j = 0; j < address.length; j++) {
										strAddress += address[j].short_name + " "; 	
									}
										
									innerHTML += strAddress + "'," + point.lng() + "," + point.lat() + ")\">" + strAddress + "<\/a>";
								}
								
								suggestions.html("<hr/>"+innerHTMLTitle+"<br/>"+innerHTML);

							} else {
								 suggestions.html("");
							}
						}
						// ====== Decode the error status ======
						else {
							suggestions.html("");
						}
					});
}

function loadGetAddress(value) {
	loadGetDisplayBranchList(value, true, false);
}	

function loadGetDisplayBranchList(value, showmodal, maponebranch) {
	 	var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + "maps.googleapis.com/maps/api/js?client=gme-wwgraingerinc&sensor=false&async=2&callback=loadLabelsForMap";
		document.body.appendChild(script);

		setTimeout(displayBranchList, 500);

	function displayBranchList() {

		if(showmodal){
			getDefaultBranch();
		}

		var address = function(){getAddressLocation(value, showmodal, maponebranch) };
		address();
	}
}

var printDirections = {
		selectedAddress: null,
		selectedLocation: null,
		response: {},
		
		init: function() {
			jQuery('#map-include').on('click', printDirections.drawMap);
			
			var directionsPanel = jQuery("#route");

			var directionsService = new google.maps.DirectionsService();
			var directionsDisplay = new google.maps.DirectionsRenderer();

			var request = {
				origin: window.opener.printDirections.selectedLocation, 
				destination: window.opener.printDirections.selectedAddress,
				travelMode: google.maps.DirectionsTravelMode.DRIVING
			};
			
			directionsDisplay.setPanel(directionsPanel[0]);

			directionsService.route(request, function(response, status) {
					
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response); 
					printDirections.response = response;
					jQuery("#route").show();
					jQuery("#getdirectionsfrom").html(response.routes[0].legs[0].start_address);
					jQuery("#getdirectionsto").html(response.routes[0].legs[0].end_address);
				}
			});
		},
		
		create: function() {
			var selectedAddress = jQuery('#selectedAddress'), 
			selectedLocation = jQuery('#selectedLocation');
			
			printDirections.selectedAddress = jQuery("#selectedAddress").val();
			printDirections.selectedLocation = jQuery("#selectedLocation").val();
			
			var mapElement = jQuery('#inner-map-container');
			var mapHTML = mapElement.html();
			var p = window.open('/pages/directionsPopUp.html','printDrivingDirectionsWindow','');
		},
		
		drawMap: function() {
			if(jQuery('#map-include').is(':checked')){
				jQuery('#map').addClass('map-visible');
				 
				var startLat = printDirections.response.routes[0].legs[0].start_location.Ra;
				var startLng = printDirections.response.routes[0].legs[0].start_location.Sa;
				var endLat = printDirections.response.routes[0].legs[0].end_location.Ra;
				var endLng = printDirections.response.routes[0].legs[0].end_location.Sa;
				var path = printDirections.response.routes[0].overview_polyline.points;
				
				var imgSrc = '//maps.googleapis.com/maps/api/staticmap?size=700x700&maptype=roadmap&markers='+startLat+','+startLng+'&markers='+endLat+','+endLng+'&path=color:0x0000ff%7Cweight:5%7Cenc:'+path+'&sensor=false';
				var imgNode = '<img border="0" alt="Grainger Driving Directions" src="'+imgSrc+'" />';
				
				jQuery("#map").html(imgNode);

			} else {
				jQuery('#map').html('').removeClass('map-visible');
			}			
		}
};

jQuery(document).ready(function() {

    // Added onclick event to find a branch modal link.
	jQuery(document).on("click", "#findABranchModalLink", function () {
		findBranchNamespace.cleaningMarkersAndClose();
	});

    jQuery('body').on('keypress', '#enterAddress', function(e) {
        // if enter key
       if(e.keyCode === 13) {
          jQuery('#findBranchSubmit').trigger('click');
       };
    });

});


 
