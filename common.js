/*
 * This file is for functionality that exists in more than one place throughout the site.
 * Please do not put page specific / section specific functionality into this file. OR ELSE!
 */ 

/* setup the Grainger primary namespace */

$(function() { 
if (navigator.userAgent.toLowerCase().indexOf('msie 10') != -1 ) { 
$('.modal').removeClass('fade'); 
} 
});


var modal_variables,
	modal_item_variables,
	item_variables,
	io_add_to_cart=false;

	Grainger.lastestTotalRatings = 0;
	var googleMapLoaded = false;


/*
 * Used to return the value of a url param passed in
 * For example:
 * jQuery.urlParam("foo");
 * will return the value of foo as a string
 */
jQuery.urlParam = function(name){
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results != null) {
		return results[1];
	} else {
		return "";
	}
}

function getSearchParameter(name){
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return (results != null ? decodeURIComponent(results[1].replace(/\+/g, " ")) : "");
}

/* jQuery Document Ready Calls */
function readyFunctionCalls() {

	clickToChatCall();
	setUpTypeHead();
	jQuery(".s7LazyLoad").unveil();
	jQuery("input[placeholder]").placeholder();
	
	 $('#e_footercol8 a').attr('target', '_blank');
}

function validateSubscribeForm(){
	var EMAIL_REGEX = "\\b[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*"
		+ "@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.?)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\b";
	if(jQuery('#subscribeEmail').val().match(EMAIL_REGEX)){
		jQuery('.hs_firstname .input input[type="text"]').val(jQuery('#subscribeName').val())
		jQuery('.hs_email .input input[type="email"]').val(jQuery('#subscribeEmail').val());
		jQuery('.hs_submit .actions input[type="submit"]').click();
	}
	else{
		jQuery('#subscribeEmailError').removeClass('hidden');
	}
}

$(document).ready(function (){
	var height = $('#prd_ctg_for_nav_comps').height();	
	height = height + 30;
	$('#subscribe').attr('style', 'margin-top:'+height+'px');
	$('#subscribe').removeClass('hidden');
	
	$( 'a[title="Sucursales"]' ).click( function (event) {    
        $( 'a[title="Sucursales"]' ).attr("href", "javascript:void(0);");
        initializeGoogleMaps();
        branchSearch.fetchBranches(event);
        
    });	
	
	if( $('#isEproUser').val() == 'true' && $('#gCustomerLinks').children('ul').length > 0){
		$( 'a[title="Sucursales"]' ).parent('li').remove();
		$('#headerContent #gCustomerLinks #navNodeLinkIdServicios').parent().addClass('hide');
	}
	
	
});

jQuery(function() {

	AkamaiCookie.initCookie();
	AkamaiCookie.initDisplay();
	/*
	MJH - Commenting out call to get mini cart count as story not played yet
	*/
	AkamaiCookie.updateQuickCartCount();

	Grainger.lastestTotalRatings = jQuery("#averageRating").val();

	// dumping binding events, this should be refactored
	// replaces bindCloseModal() and closeModal()
	// cause why have two methods along with heaps of references to fire
	jQuery('body').on('click', '.modal .close, .modal .cancel, .modalInfo [data-rel="closeModal"], .modalInfo [data-rel="closeModalRefresh"]',function(e) {
		var refresh = jQuery(this).attr('data-rel') === 'closeModalRefresh' ? true : false;
		Grainger.Modals.killModal();
		if(refresh) location.reload();

		e.preventDefault();
	});

	jQuery('body').on('click', '.modal-static .cancel',function(e) {
		jQuery('.modal-static').addClass('hide');
		e.preventDefault();
	});

	// sort of replaces loadDropTabMenuInModals, loadDropTabMenu
	jQuery('body').on('click', '.drop-tab-menu > dt, .drop-tab-menu .cancelLink, .drop-tab-menu .availability-drop label.button input', function() {
		jQuery(this)
			.parents('.drop-tab-menu').toggleClass('active')
			.find('dd').toggleClass('hidden');
	});

	// bootstrap global bind event for tabs
	jQuery('body').on('click', '.nav-tabs:not([data-tabpageturn=true]) a', function(e) {
	  e.preventDefault();
	  jQuery(this).tab('show');
	});

	// boostrap global bind events for tooltip
	jQuery('body').tooltip({
		selector: '[data-toggle=tooltip]',
		delay : {
			show : 100,
			hide : 0
		},
		container: 'body',
		animation: false
	});



	// Toggles visibility of content based on user click
	// this is disgusting and should not be used, bad markup, prone to error with js traversal
	// maybe a kind soul will refactor every instance of markup to adhere to the boostrap collaspe
	// not me for now, I refactored the js method, is it you?
	jQuery("body").on('click', 'a.show-more, a.show-less', function(){
		var $el = jQuery(this),
			array = [$el, $el.siblings("[class*=show-]"), $el.parent().siblings(".show-more-content"), jQuery('.show-more-content-edit, .show-more-content-summary')];
		jQuery(array).toggleClass('hide');
		jQuery('.bordered-content').toggleClass('hide');
	});

	if( jQuery('#strength-text').doesExist()) {
		checkPasswordStrength("",0);
	}
	
	//I don't think you're signed in enough
	heyLookSignIn();
});

(function() {

	// setup the Grainger primary namespace
	if (typeof Grainger === "undefined") {
		var Grainger = {};
	};

	// ensure console is in namespace
	if (!window.console) {
		window.console = {};
	}
	// union of Chrome, FF, IE, and Safari console methods
	var m = [
		"log", "info", "warn", "error", "debug", "trace", "dir", "group",
		"groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
		"dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
	];
	// define undefined methods as noops to prevent errors
	for (var i = 0; i < m.length; i++) {
		if (!window.console[m[i]]) {
			window.console[m[i]] = function() {};
		}
	}

	// ensure Object.keys is in namespace
	if (!Object.keys) {
	  Object.keys = (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
			  'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
			  'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
		  if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

		  var result = []

		  for (var prop in obj) {
			if (hasOwnProperty.call(obj, prop)) result.push(prop)
		  }

		  if (hasDontEnumBug) {
			for (var i=0; i < dontEnumsLength; i++) {
			  if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i])
			}
		  }
		  return result
		}
	  })();
	};
})();

/*
 * Utility method to see if a string starts with a char
 * For example:
 * 'food'.startsWith('foo')
 * return true/false
 */
String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)}

/*
 * Returns true if the element selected exists.
 * For example:
 * jQuery("#foo").doesExist();
 * will return true if there is a dom element with the id "foo"
 */
jQuery.fn.doesExist = function(){
	return jQuery(this).length > 0;
};

function isAlphanumeric(str) {
	return /^[a-z0-9]+$/i.test(str);
}

// Returns true if the value passed in a positive Integer( >0)
function isPositiveInteger (str) {
	 /*
	  * Check if its a positive integer.
	  * [0]* : Any number of 0s in the front (To handle numbers starting with 0 {Ex: 010})
	  * [1-9]+ : one or more of the numbers 1-9
	  * [0-9]* : 0 or more of any numbers.
	  */
	return /^\s*[0]*[1-9][0-9]*\s*$/.test(str);
}

function hasWhiteSpace(s) {
	return /\s/g.test(s);
}

// Returns true if the string passed is blank or null.
function isBlank(str) {
	return (!str || /^\s*$/.test(str)); //Check for a blank string( only whitespace characters)
}

// Returns true iff the string passed is empty or null.
function isEmpty(str) {
	return (typeof str === "undefined" || !str || 0 === str.length);
}
function isNotEmpty(str) {
    return !isEmpty(str);
}

function isArray(obj) {
	return obj && (obj instanceof Array || typeof obj == "array");
}

function defaultIfEmpty(str, defaultString){
	if (isEmpty(str)) {
		return defaultString;
	} else {
		return str;
	}
}

// JQuery plug-in for getting cached scripts
jQuery.getCachedScript = function( url, options) {
	options = jQuery.extend( options || {}, {
		dataType: "script",
		cache: true,
		url: url
	});

	return jQuery.ajax(options);
};

function isValidZipcode(zipCode){
	var re = /^\d{5}([\-]\d{4})?$/;
	if(!re.exec(zipCode)){ //a zipcode with invalid sequence
		alert("Invalid zipcode - use format: ##### or #####-####.");
		return false;
	}
	return true;
}

/*
 * Used to unescape HTML entites.
 * For exaample:
 * htmlDecode("&lt;");
 * outputs: "<";
 */
function htmlDecode(input){
	var e = document.createElement('div');
	e.innerHTML = input;
	return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

/**
* $.parseParams - parse query string paramaters into an object.
*/
(function($) {
	var re = /([^&=]+)=?([^&]*)/g;

	var decode = function(str) {
		return decodeURIComponent(str.replace(/\+/g, ' '));
	};

	$.parseParams = function(query) {
		var params = {}, e;
		if (query) {
			if (query.substr(0, 1) == '?') {
				query = query.substr(1);
			}

			while (e = re.exec(query)) {
				var k = decode(e[1]);
				var v = decode(e[2]);
				if (params[k] !== undefined) {
					if (!$.isArray(params[k])) {
						params[k] = [params[k]];
					}
					params[k].push(v);
				} else {
					params[k] = v;
				}
			}
		}
		return params;
	};
})(jQuery);

/**
* $.scrollIntoView - parse query string paramaters into an object.
* @param: node - DOM object to scroll to with 10 pixels padding on top
* jQuery.scrollIntoView(jQuery("#topSellerResources"))
*/
(function($) {
	$.scrollIntoView = function(node) {
		if (node) {
			jQuery('html, body').animate({scrollTop: node.offset().top - 10}, 350)
		}
	};
})(jQuery);

/* TypeAhead setup */
function setUpTypeHead() {
	var search = jQuery('#search'),
		ajaxCall = null

	switch ( Number(search.attr('data-typeaheadversion')) ) {
		case 2: // disables only flyout functionality
			localHistory = true;
			typeLength = 0,
			flyout = false;
			typeaheadHistory.pullStorage();
			break;

		case 3: // old iteration
			localHistory = false;
			typeLength = 2,
			flyout = false;
			//make typeahead wider for lenghtened item paths
			jQuery('#searchContainer').addClass('old-typeahead');
			break;

		default: // full feature phase 1 TA
			localHistory = true;
			flyout = true;
			typeLength = 0;
			typeaheadHistory.pullStorage();
			break;
	}

	var getResults = function(query, process) {

		if( ajaxCall ) {
			ajaxCall.abort();
		}

		var url = '/gcom.suggestions.json?selectedText=' + query + '*';

	};

	var mouseOutBlur = function(searchTypeahead){
		var blurMenu = function(){
			search.blur();
			// remove search results class
			searchTypeahead.$menu.removeClass('search-results');

			// remove listener
			searchTypeahead.$menu.off('mouseleave', blurMenu);
		}

		searchTypeahead.$menu.on('mouseleave', blurMenu);
	};

	search.typeahead({
		items: 100,
		minLength: typeLength,
		source: function(query, process) {
			if(this.query.length >= 2) {
				getResults(query, process);
			} else if( this.query.length <= 0 && localHistory){
				this.process(typeaheadHistory.storageArray, 'history');
			} else if (this.query.length == 1 && localHistory) {
				this.$menu.hide();
			}
		},
		render: function(items, type) {
			var that = this,

			categoryCounter = 0; //interim code for Endeca data set
			categoryTypeCounter = 0, //for analytics purpose
			suggestionConfigId = 0;

			items = jQuery(items).map(function(i,item) {
				var searchString = '',
					mainText = '',
					subText = '';

				// text formatting for Endeca data set and local history items
				var formatResultText = function(item) {
					var wordArray = item.selectedText.split(' > ');

					mainText = wordArray[wordArray.length-1];

					if (wordArray.length >= 2){
						var returnChar = 50 - mainText.length;

						if ( returnChar <=0) {
							return;
						} else {
							subText = wordArray[0].slice(0, returnChar);

							if(wordArray[0].length > returnChar) {
								subText += '...';
							}
						}
					}
				}

				if (type === 'search'){
					if(item.clickable) {

					// set of rules for display if local history is enabled
						if (localHistory) {
						//interim code for Endeca data set category limit
							categoryCounter++;
							if (categoryCounter >= 7) {
								return null;
							}
						//end interim category

							formatResultText(item);

							//set link and path with main text
							searchString += '<a href="#"><span title="'+ item.selectedText +'" data-childkey="'+item.key+'" data-url="'+ item.linkURL + '&suggestConfigId=' + suggestionConfigId + '">'+ that.highlighter(mainText.toLowerCase());

							//include secondary text if it exists
							if (subText){
								if( Grainger.isSpanish ) {
									searchString += '<span class="sub-text"> en ' + subText.toLowerCase() +'</span>';
								} else {
									searchString += '<span class="sub-text"> in ' + subText.toLowerCase() +'</span>';
								}
							}

							//close link
							searchString += "</span></a>";

						} else {
							//unformatted text for ABTest
							searchString += '<a href="#"><span data-url="'+ item.linkURL + '&suggestConfigId=' + suggestionConfigId + '">'+ that.highlighter(item.selectedText.toLowerCase());
						}
					} else {
						searchString += '<span class="category"><em>'+ item.selectedText +'</em></span>';
						categoryCounter = 0;
						categoryTypeCounter++;
						if (categoryTypeCounter == 1) {
							suggestionConfigId = 2;
						} else if (categoryTypeCounter == 2) {
							suggestionConfigId = 4;
						}
					}
				}

				//only possible if localHistory is enabled
				if (type === 'history') {
					suggestionConfigId = 1;
					searchString += '<a href="#"><span class="history" data-url="/search?searchQuery=' + item.selectedText + '&suggestConfigId=' + suggestionConfigId + '">'+ item.selectedText+'</span></a>';
				}

				i = jQuery(that.options.item);
				i.html(searchString);

				return i[0];
			});

			// push items into typeahead
			this.$menu.html(items);

			// append either clear history link or flyout container
			if (type === 'history' && localHistory) {
				this.$menu.removeClass('search-results');
				this.$menu.append('<li><a href="#"><span class="clear-history"><span class="rule">Clear Search History</span></span></a></li>');
			} else  if (type === 'search' && flyout){
				this.$menu.append('<li class="flyout hide"></li>');
				this.$menu.removeClass('search-results');
			}

			return this;
		},
		process: function(items, type) {
			var that = this;

			//set up blur on mouse out for all versions of data return
			mouseOutBlur( this );

			if (!items.length) {
				return this.shown ? this.hide() : this
			}

			if (type === 'history') {
				return this.render(items.slice(0, 10), type).show();
			}

			if (type === 'search') {
				return this.render(items.slice(0, 22), type).show();
			}
		},
		hover: function(hoveredItem) {
			var itemSpan =  hoveredItem.find('span');

			if ( isNotEmpty(itemSpan.attr('title') ) && flyout ) {
				typeaheadFlyout.openFlyout( itemSpan );
			}
		},
		select: function() {
			var activeItem = this.$menu.find('.active'),
				linkInfo = activeItem.find('span');

			if(linkInfo.length === 0 && !activeItem.hasClass('flyout') ) {
				jQuery('#searchbarHeader').submit();
				return false;
			}

			if( linkInfo.hasClass('category') || activeItem.hasClass('flyout') ) {
				return false;
			} else if (linkInfo.hasClass('clear-history')) {
				typeaheadHistory.resetStorage();
				this.$menu.hide();
				return false;
			} else {
				if ( linkInfo.hasClass('history') ) {
					typeaheadHistory.unshiftInput(linkInfo.html());
				}

				window.location.href = linkInfo.attr('data-url');
			}
		}
	});

	//save submitted items to local history
	if (localHistory) {
		jQuery('#searchbarHeader').on('submit', function(){
			var inputValue = jQuery('#search').val();

			if ( 2 <= inputValue.length && inputValue.length <= 35 ) {
				typeaheadHistory.unshiftInput(inputValue);
			}
		});
	}
}

// form.submitted - this attribute is used here and also in the type-ahead widget, Typeahead.js, to indicate that a search was submitted
// This is needed to prevent a condition when a type-ahead selection is made and while the request is in flight the enter key
// is hit.  When this happens the type-ahead value that was put into the input box is treated as a keyword search and submitted.
// For example, if you type in power, then using your down arrow key select a value from the type-ahead options and hit enter twice.
// The first enter will submit the search as a type-ahead selection but the second enter would come here and take the value in the
// input box and re-submit it.  Technically this is correct since the user did hit enter twice however it's not what is expected
// and results in bad searches.  The use of the form.submitted mitigates this condition and only allows that data to post one time.
// I think an alternate to this would be to remove the submit button from the form and use an image with an onclick handler or something.
var verifySearchString = function (form, defaultText) {
	if (!form.submitted && null != form.search && form.search.value.length > 0 && form.search.value != defaultText) {
		// Trim leading and trailing whitespaces and submit the form
		form.search.value = form.search.value.replace(/^\s*|\s*$/g,'');
		if (form.search.value.length > 0) {
			form.submitted = true;
			form.submit();
			return true;
		}
	}
	if (!form.submitted) {
		alert('Please enter a search term prior to clicking search.');
	}
	return false;
};

/**
 * Grainger primary namespace. Use this instead of global scope whenever humanly possible to avoid collisions with other JS libraries, third party scripts, or poorly named global vars and functions injected into our site. KEEP IT CLEAN!
 * @namespace Grainger
*/
Grainger = jQuery.extend(Grainger, {
	Modals : {

		/**
		 * Launches a waiting modal so that the user knows we are processing things in the background. User feedback, ftw!
		 * @function waitModal
		 * @memberof Grainger.Modals
		 * @public
		 * @param {string} i - the id given to the modal wrapper in the dom
		 * @param {string} t - the title given to the modal wrapper in the dom
		*/
		waitModal : function(i, t) {
            Grainger.Modals.killWaitModal();
            jQuery("body").append("<div class='modal-backdrop loadingModal'></div>");
		},

		/**
		 * Hides only the waiting modal.
		 * @function killWaitModal
		 * @memberof Grainger.Modals
		 * @public
		*/
		killWaitModal : function() {
			jQuery(".loadingModal").remove();
		},

		/**
		 * Shows a modal and, if it doesn't yet exist as identified by the id, creates the markup for the modal.
		 * @function createAndShowModal
		 * @memberof Grainger.Modals
		 * @public
		 * @param {string} i - the id given to the modal wrapper in the dom
		 * @param {string} t - the title given to the modal wrapper in the dom
		 * @param {string} content - the html content injected into the modal as content
		 * @param {string} [classes] - the classes of the modal. Added as a modal class to the wrapper dom element. Possible values: smallModal mediumModal.
		 * @param {function} [callback] - a function callback to be performed after the modal is loaded and displayed.
		 */
		createAndShowModal : function(i, t, content, classes, callback) {
			var modalHTML = "",
				headerHeight, footerHeight, windowHeight;
			$('#productAvailabilityModal').hide();
			jQuery("#productAvailabilityModal").removeClass("modal");
            Grainger.Modals.killWaitModal();

			//only create the modal if it does not yet exist
			if (jQuery("#" + i).index() === -1) {
				/* if we didn't call the loading modal properly, no worries. This will kill it and build a new one for our content */
				jQuery('.modal, .modal-backdrop').remove();
				modalHTML = "<div id=" + i + " class=\"modal modal-window commerce\" role=\"dialog\" aria-labelledby=" + t + " aria-hidden=\"true\"></div>";
				jQuery(modalHTML).modal({'backdrop': 'static', 'keyboard':false}).removeClass('loadingModal');
			} else {
				/* if we called a loading modal properly, this one will fire */
				jQuery("#" + i).modal({'backdrop': 'static', 'keyboard':false}).removeClass('loadingModal');
			}

			if (typeof classes !== "undefined") {
				jQuery("#" + i).addClass(classes);
			}

			//if we have some content to put in the modal, do that
			if (typeof content !== "undefined") {
				jQuery("#" + i).html(content);
			}

			// set a max height based on viewport classes
			headerHeight = jQuery("#" + i).find('.modal-header').first().outerHeight(); //hack - need to get only the first modal-header in case there is more than one
			footerHeight = jQuery("#" + i).find('.modal-footer').last().outerHeight(); //hack - need to get only the LAST modal-footer in case there is more than one
			windowHeight = jQuery(window).height();

			jQuery("#" + i).find('.modal-body, .modal-content').css({
				"max-height" : windowHeight - jQuery("#" + i).position().top * 2 - headerHeight - footerHeight
			});

			//do the callback if it is a function
			if (typeof callback === "function") {
				callback();
			}

			//some analytics code that doesn't make sense
            // SRD-1640
            if(io_add_to_cart) {
                jQuery("body").trigger("grainger.directmerch.add");
                // reset it
                io_add_to_cart = false;
            } else {
                jQuery("body").trigger("grainger.modal.open");
            }
		},

		/**
		 * Completely remove all modals and backdrops from the dom
		 * @function killModal
		 * @memberof Grainger.Modals
		 * @public
		*/
		killModal : function() {
			jQuery('.modal, .modal-backdrop').remove();
		}
	},

	isSpanish: (document.URL.split('/')[2].split('.')[0] === 'espanol') ? true:false
});

function metricsEvent(event, action) {
	jQuery("window").trigger(event, action)
}

function createOrJoinItemVariables(pagevariables) {
	if(window.item_variables !=null && window.item_variables.length>0) {
		jQuery.extend(item_variables, pagevariables);
	} else {
		item_variables=pagevariables;
	}
}

function createOrJoinModalItemVariables(modalvariables) {
	if(window.modal_item_variables !=null && window.modal_item_variables.length>0) {
		jQuery.extend(modal_item_variables, modalvariables);
	} else {
		modal_item_variables=modalvariables;
	}
}

// remove/show default text upon clicking into/out of input fields
function removeDefaultInputText(element) {
	var el = jQuery(element),
		originalText = el.val();

	el.val("");

	el.on("blur", function() {
		el.val(originalText);
	})
}

/* Live Person / Click to Chat */
function clickToChatCall() {
	if(jQuery('#voiceLPButton a, #chatLPButton a').length > 0) {
		jQuery('#body').addClass('withClickCallChat');
	}
}

/*
 * Displays terms of access when Spanish banner is clicked
 * banner located under header
 */
function displayTermsOfAccessModal(){
	Grainger.Modals.waitModal("termsOfAccess", "termsOfAccess");

	jQuery.ajax({
		url: "/modal/termsofaccessmodalpage",
		dataType: "html",
		cache: false,
		success: function(data){
			Grainger.Modals.createAndShowModal("termsOfAccess", "termsOfAccess", data);
		},
		error: function() {
			console.log("An error has occurred.");
		}
	});
}

// on search drawers and oms, for show all, view less
// isCallToExpand is useless since refactored to toggle...
// DOM is silly with this method
function toggleShowAll(isCallToExpand,idToExpand) {
	var ulIdToExpand = '#' + idToExpand + "-showAll",
		showAllLinkId = '#' + idToExpand + "-showLink",
		hideAllLinkId = '#' + idToExpand + "-hideLink";
	jQuery(ulIdToExpand).toggleClass("show").toggleClass("hide");
	jQuery(showAllLinkId).toggleClass("hide").toggleClass("show");
	jQuery(hideAllLinkId).toggleClass("show").toggleClass("hide");
}

/* Loading Google Maps onDemand */
function loadMaps() {
	jQuery.getCachedScript('/js/egeoxml.js');
	jQuery.getCachedScript('/js/labeledmarker.js').done(function() {
		loadFindABranchModal();
	});
}
function bindGoogleMapsClick(zipCode, availabilityFlag) {
	findBranchNamespace.findBranchSearchParameters = zipCode;
	findBranchNamespace.availabilityFlag = availabilityFlag;

	loadGoogleMapMarkers();
}
function loadGoogleMapMarkers() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + "maps.googleapis.com/maps/api/js?client=gme-wwgraingerinc&sensor=false&async=2&callback=loadMaps";
	document.body.appendChild(script);
}
function loadGoogleMaps(){
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + "maps.googleapis.com/maps/api/js?client=gme-wwgraingerinc&sensor=false&async=2&callback=loadLabelsForMap";
	document.body.appendChild(script);
}
function loadLabelsForMap(){
	jQuery.getCachedScript('/js/egeoxml.js');
	jQuery.getCachedScript('/js/labeledmarker.js');
}
/* End google maps */

// Inject a style sheet into head of html document.
// This is a HACK, mostly to overwrite the print.css, which is used by default for all other pages.
// @param path: relative/full path to css file
// @param media: what to set media attribuet as (all, screen, print)
function injectCSSInHead(path, media) {
	// inject er in
	jQuery('head').append('<link type="text/css" rel="stylesheet" href="' + path + ' media="' + media + '/>')
}


/* Load Javascript files dynamically.*/
function loadJs(path){
	jQuery.getScript(path);
}

function validateQty(elem) {
	var element = jQuery('#' + elem)
	if(element) {
		if(isPositiveInteger(element.val()) ) {
			return true
		} else {
			element.val().replace(/[\D]/g,""); /* Strip all the non numeric characters in the field */
		}
	}
	return false;
}

function isNumberKey(evt) {
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}

function isValidQtyAvl(elem){
	if(!validateQty(elem)){ //a quantity with non-numeric characters
		alert("Invalid quantity.");
		return false;
	}
	return true;
}

function isValidZipcodeAvl(elem){
	var element = jQuery('#' + elem);
	if (element) {
		return isValidZipcode(element.val());
	} else {
		return false;
	}
}

// if coming from Lab Safety Supply or RandMH
// show modal stating they are now Grainger
// cant we make this specific to homepage...
function handleRedirectModal(param){
	var cookieName, redirectKey, redirectMaxCount = 3;

	switch(param) {
		case "l": // Lab Safety Supply
			cookieName = "lssWelcomeCount";
			redirectKey = "redirect_lss";
			break;
		case "randCookie": // RandMH
			cookieName = "randWelcomeCount";
			redirectKey = "redirect_rand";
			break;
	}

	var currentRedirectCount = !jQuery.cookie(cookieName) ? 0 : jQuery.cookie(cookieName);

	if(currentRedirectCount < redirectMaxCount){
		currentRedirectCount++;
		jQuery.cookie(cookieName, currentRedirectCount, {expires : 365});

		Grainger.Modals.waitModal("siteRedirectModal", "siteRedirectModal");

		jQuery.ajax({
			url: "/content/redirectmodalpage?" + redirectKey+ "=true",
			dataType: "html",
			cache: false,
			success: function(data){
				Grainger.Modals.createAndShowModal("siteRedirectModal", "siteRedirectModal", data);
			},
			error: function() {
				Grainger.Modals.killModal();
			}
		});
	}
}

/**
 * Namespace object for AkamaiCookie
 * There are two cookies one for Bulk Order Pad and other for Quick cart link.
 * If there isn't one ,the cookies are created and initialized to 0.
 * From then on quick cart cookie will be updated when 'add to cart' modal is closed
 * bulk order pad cookie will be updated on Add,Remove,Copy&Paste and AddTo cart actions from Bulk Order Pad
 *
 * We tell Akamai not to cache these cookies so that when Akamai returns cached content this cookie values are
 * reintialized to 0 again. This way a new user entering the site will not see the cached content belonging to a different user.
 */
var AkamaiCookie = new function() {

	/**//** BulkOrderPadCount Cookie Identifier *//*
*/	this.BOP_COUNT_COOKIE_ID="BulkOrderPadCountCookieId";
	this.BOP_COUNT_DIV_ID="bulkOrderPadCount";

	/* QuickCartCount Cookie Identifier **/	
	this.QUICK_CART_COUNT_COOKIE_ID = "QuickCartCountCookieId";
	this.QUICK_CART_COUNT_DIV_ID = "quickCartItemCount";

	this.PATH="/; sameSite=None; Secure";

/*	*//**
	 * Initializes the cookie if it is not already there
	 *//*
*/	this.newCookie = function(cookieId) {
		var count = jQuery.cookie(cookieId);
		if (count == undefined) {
			jQuery.cookie(cookieId, 0, { path:this.PATH, domain: Grainger.rootCookieDomain, secure: true});
		}
	};

	this.initCookie = function() {
		this.newCookie(this.BOP_COUNT_COOKIE_ID);
		this.newCookie(this.QUICK_CART_COUNT_COOKIE_ID);
	}

	/**//**
	 * Updates the DIV
	 *//*
*/	this.initDisplay = function() {
		this.updateDisplay(this.BOP_COUNT_COOKIE_ID,this.BOP_COUNT_DIV_ID);
		this.updateDisplay(this.QUICK_CART_COUNT_COOKIE_ID,this.QUICK_CART_COUNT_DIV_ID);
	}

	this.updateDisplay = function(cookieId,divId) {
		var count = AkamaiCookie.getCount(cookieId);
		var htmlElement = jQuery('#' + divId);
		if (htmlElement.length != 0 ) {
			if(cookieId == this.BOP_COUNT_COOKIE_ID) {
				if (count == 0 ) {
					htmlElement[0].innerHTML = '';
				} else {
					htmlElement[0].innerHTML = '('+ count + ')';
				}
			} else if (cookieId == this.QUICK_CART_COUNT_COOKIE_ID) {
				htmlElement[0].innerHTML = count;
			}
		}
	};

	/**//**
	 * Sets the cookie value
	 *//*
*/	this.setCount = function(cookieId,count) {
		jQuery.cookie(cookieId, count, {path: this.PATH, domain: Grainger.rootCookieDomain, secure: true});
	};

	/**
	 * Gets the cookie value
	*/	
	this.getCount = function(cookieId) {
		return jQuery.cookie(cookieId);
	};

	this.updateQuickCartCount = function() {
		var path = "/cart/CartQuantity";
		jQuery.ajax({
			url : path,
			type: 'GET',
			dataType : "text",
			cache: false,
			success : function(data) {
				AkamaiCookie.setCount(AkamaiCookie.QUICK_CART_COUNT_COOKIE_ID,data);
				AkamaiCookie.updateDisplay(AkamaiCookie.QUICK_CART_COUNT_COOKIE_ID,AkamaiCookie.QUICK_CART_COUNT_DIV_ID);
			},
			error : function(error) {
				console.log(error);
			}
		});
	}
}

/*
 * ported from current platform as requirements are the same
 * This javascript is a helper method to support SEO.
 * For SEO we want to avoid adding parameters to our anchor links and instead append
 * any parameters used for tracking, sorting or coremetrics.  By using the onclick handler
 * this crawlers do not see the appended parameters and therefore we mitigate duplicate
 * content issues.
 * Note that some crawlers will look at onclick handlers and read some of the javascript
 * to see what's going on.  If they decide you are trying to be "sneaky" you may get
 * dinged.  Per a blog post by Google, simply appending parameters is okay.
 * This approach was also verified with Covario as of 7/13/2010
 * changed from "document.location=" to "obj.href+=" so "return: false;" is no longer needed in the onclick handler
 * currently only being used for breadcrumbs on site, my account, ect...
 */
var seoLinkHandler = function(obj, params) {
	// Make sure we are given an anchor object to work with
	if (typeof obj == "object" && obj.tagName == "A") {
		// Since we don't know how the href is formatted, with params or not, we will strip
		// any starting separators from the given params before appending.
		params = params.replace(/^(\?|&)/, "");
		if (obj.href.indexOf("?") != -1) {
			obj.href += "&" + params;
		} else {
			obj.href += "?" + params;
		}
	}
};

// core metrics method that fires coremetrics method, weee
function manuallinkClickIO(href,linkname,modal){
	if(modal){
		cmCreateManualLinkClickTag(href,linkname,modal_variables.CurrentURL);
	}else{
		cmCreateManualLinkClickTag(href,linkname,page_variables.CurrentURL);
	}
}

/*
 * This script detects the following:
 * Flash
 * Java
 * Shockwave
 * RealPlayer
 * Acrobat Reader
 * SVG Viewer
 * used primarily for plugin detection for PDF when forming catalog link from header
*/
var agt=navigator.userAgent.toLowerCase();
var ie  = (agt.indexOf("msie") != -1);
var ns  = (navigator.appName.indexOf("Netscape") != -1);
var win = ((agt.indexOf("win")!=-1) || (agt.indexOf("32bit")!=-1));
var mac = (agt.indexOf("mac")!=-1);

if (ie && win) {    pluginlist = detectIE("rmocx.RealPlayer G2 Control.1","RealPlayer") + detectIE("PDF.PdfCtrl.5","Acrobat Reader") + detectIE("AcroPDF.PDF.1","Acrobat Reader") + detectIE("PDF.PdfCtrl.6","Acrobat Reader") + detectIE("PDF.PdfCtrl.1","Acrobat Reader"); }
if (ns || !win) {
		nse = ""; for (var i=0;i<navigator.mimeTypes.length;i++) nse += navigator.mimeTypes[i].type.toLowerCase();
		pluginlist = detectNS("image/svg-xml","SVG Viewer") + detectNS("audio/x-pn-realaudio-plugin","RealPlayer") + detectNS("video/quicktime","QuickTime") + detectNS("application/x-mplayer2","Windows Media Player") + detectNS("application/pdf","Acrobat Reader");
}

function detectIE(ClassID,name) { result = false; document.write('<SCRIPT LANGUAGE=VBScript>\n on error resume next \n result = IsObject(CreateObject("' + ClassID + '"))</SCRIPT>\n'); if (result) return name+','; else return ''; }
function detectNS(ClassID,name) { n = ""; if (nse.indexOf(ClassID) != -1) if (navigator.mimeTypes[ClassID].enabledPlugin != null) n = name+","; return n; }

pluginlist += navigator.javaEnabled() ? "Java," : "";
if (pluginlist.length > 0) pluginlist = pluginlist.substring(0,pluginlist.length-1);

function detectAdobe() {
	var adobeCompatable=false;
	if ((pluginlist.indexOf("Acrobat Reader")!=-1) || (pluginlist.indexOf("SVG Viewer")!=-1)) adobeCompatable=true;
	return adobeCompatable;
}

function detectForCatalog(catPage) {
	var urlString,
		adobeCompatable = (pluginlist.indexOf("Acrobat Reader")!=-1) || (pluginlist.indexOf("SVG Viewer")!=-1) ? true : false,
		urlParam ="?adobeCompatible="+adobeCompatable;
	urlParam += (catPage != null  && catPage!="") ? "&CatPage="+catPage : '';
	urlString = "/content/catalogPdf" + urlParam;
	window.location = urlString;
}

function createCatalogUrlString(catPage){
	var urlString, adobeCompatable = false;
	adobeCompatable = detectAdobe();
	var urlParamPrefix = "?";
	var urlParm ="adobeCompatible="+adobeCompatable;

	if (catPage != null  && catPage!="") {
	urlParm = urlParm+"&CatPage="+catPage;
	}
	urlString = "/content/catalogPdf"+ urlParamPrefix + urlParm;
	return urlString;
}

// ratings and reviews
var bzr = new function() {

	this.processRating = function(productCode, reviewsAPIurl, header) {
		jQuery.ajax({
			type: "GET",
			url: reviewsAPIurl,
			data: {
				Filter : "Id:"+productCode
			},
			success: function(data) {
				if(header) {
					bzr.buildHeaderForReviews(data) ;
				}

				bzr.populateRating(data, productCode);
			}
		});
	}

	this.populateRating = function(reviewsJson, productCode) {
		//Check the validity of the returned JSON
		if(!reviewsJson || (!jQuery.isArray(reviewsJson.Results)) || reviewsJson.Results.length == 0 || (!reviewsJson.Results[0].TotalReviewCount > 0)) {
			console.warn("There was a problem with the reviews JSON returned for the product "+ productCode);
			return false;
		}
		var totalReviewCount=reviewsJson.Results[0].TotalReviewCount;
		var ratingDistribution=reviewsJson.Results[0].ReviewStatistics.RatingDistribution;
		var fiveStarRatings=0;
		var fourStarRatings=0;
		var threeStarRatings=0;
		var twoStarRatings=0;
		var oneStarRatings=0;

		jQuery.forEach(ratingDistribution, function(entry, i){
			switch(entry.RatingValue){
				case  1:
					oneStarRatings=entry.Count;
					break;
				case  2:
					twoStarRatings=entry.Count;
					break;
				case  3:
					threeStarRatings=entry.Count;
					break;
				case  4:
					fourStarRatings=entry.Count;
					break;
				case  5:
					fiveStarRatings=entry.Count;
					break;
			}
		});

		var fiveStarSpan = jQuery("."+productCode+"_fiveStarSpan");
		fiveStarSpan.style("width", ((fiveStarRatings/totalReviewCount)*100)+"%")
		fiveStarSpan.attr("innerHTML", "("+fiveStarRatings+")");

		var fourStarSpan = jQuery("."+productCode+"_fourStarSpan");
		fourStarSpan.style("width", ((fourStarRatings/totalReviewCount)*100)+"%")
		fourStarSpan.attr("innerHTML", "("+fourStarRatings+")");

		var threeStarSpan = jQuery("."+productCode+"_threeStarSpan");
		threeStarSpan.style("width", ((threeStarRatings/totalReviewCount)*100)+"%")
		threeStarSpan.attr("innerHTML", "("+threeStarRatings+")");

		var twoStarSpan = jQuery("."+productCode+"_twoStarSpan");
		twoStarSpan.style("width", ((twoStarRatings/totalReviewCount)*100)+"%")
		twoStarSpan.attr("innerHTML", "("+twoStarRatings+")");

		var oneStarSpan = jQuery("."+productCode+"_oneStarSpan");
		oneStarSpan.style("width", ((oneStarRatings/totalReviewCount)*100)+"%")
		oneStarSpan.attr("innerHTML", "("+oneStarRatings+")");

		jQuery("."+productCode+"_drop-tab-wrapper").removeClass("hidden");
	}

	this.buildHeaderForReviews = function(data) {
		var totalRatings = 0 ;
		var averageRating = 0 ;
		var starCountDecimal = 0 ;
		var starCount = 0 ;
		var overallRating = 5 ;
		var recommendCount = 0;
		var recommendAvg = 0 ;
		if(data.Results[0] != null) {
			if (data.Results[0].TotalReviewCount != null) {
				totalRatings = data.Results[0].TotalReviewCount ;
			}
			if(data.Results[0].ReviewStatistics.AverageOverallRating != null) {
				averageRating = JSON.stringify(data.Results[0].ReviewStatistics.AverageOverallRating) ;
			   if(averageRating.length >= 3) {
				   averageRating = averageRating.substring(0,3) ;
				   starCountDecimal = averageRating.substring(2,3) ;
				   starCount = averageRating.substring(0,1) ;
			   }
			   else if(averageRating.length >= 1) {
				   starCount = averageRating.substring(0,1) ;
			   }
			}
			if (data.Results[0].ReviewStatistics.OverallRatingRange != null) {
				overallRating = data.Results[0].ReviewStatistics.OverallRatingRange ;
			}
			if(data.Results[0].ReviewStatistics.RecommendedCount != null && totalRatings > 0) {
				recommendCount = data.Results[0].ReviewStatistics.RecommendedCount ;
				recommendAvg = parseInt((recommendCount/totalRatings)*100) ;
			}

			if(recommendAvg > 0) {
				jQuery("#reviews-percent-span").html("<span class='reccomendAvg'><h5>" + recommendAvg + "%</h5> <span class='recommendation'>Recommend this product</span></span>");
			}
		}

		Grainger.lastestTotalRatings = totalRatings;
		jQuery("#reviews-header-span-content").html("<h5>"+ totalRatings +" Reviews</h5><img  src='//"+ document.domain + "/images/ratings/rating-" + starCount + "_" + starCountDecimal + ".gif' class='ratingStars' /><span class='ratingValue'>" + averageRating + " out of " +  overallRating + "</span>");
	}
};

// canada modal
(function($, Grainger){

	var supportedCountries = ['CA']; //Countries with available selectors

	$(document).ready(function() {
		var country = $.trim($.cookie("country")),
			siteSelectModalShown = $.cookie("siteSelectModalShown");

		if(country && $.inArray(country.toUpperCase(),supportedCountries) !== -1 && typeof siteSelectModalShown === 'undefined'){
			$.ajax({
				url: '/content/siteselect?select_'+country.toLowerCase()+'=true',
				dataType: "html",
				success: function(data){
					var modal = new Grainger.ui.Modal({
						content : data,
						id : 'siteSelect',
						modal : { width : 'auto' },
						template : '<div id="${id}Window" class="grainger-modal-window" style="display:none"><div id="${id}Header" class="grainger-modal-header"><span style="display:none" id="${id}Title" class="grainger-modal-title"></span><button id="${id}Close" class="grainger-modal-close"></button></div><div id="${id}Toolbar" class="grainger-modal-toolbar"></div><div class="grainger-modal-content" id="${id}Content"></div><div id="${id}Footer" class="grainger-modal-footer"></div></div>'
					});
					modal.open();
					$('#siteSelectContent .site-select').first().click(function(e){
						modal.close();
						return false;
					});
					$.cookie("siteSelectModalShown",1);
				},
				error: function() {
					console.log("An error has occurred.");
				}
			});
		}
	});

})(jQuery, Grainger);

function postwith(to,p) {
	var myForm = document.createElement("form");
	myForm.method="post" ;
	myForm.action = to ;
	for (var k in p) {
		var myInput = document.createElement("input") ;
		myInput.setAttribute("name", k) ;
		myInput.setAttribute("value", p[k]);
		myForm.appendChild(myInput) ;
	}
	document.body.appendChild(myForm) ;
	myForm.submit() ;
}

/*certificate of compliance icon*/
function loadCoC(itemNo) {
	var host = location.host;
	var np_image_prefix = location.protocol + "//";
	np_image_prefix += host;
	var complianceFile = np_image_prefix + "/compliance/" + itemNo + "_CPSC_COC.pdf";
	if (window.XMLHttpRequest) {
	  /* code for IE7+, Firefox, Chrome, Opera, Safari */
	  var client = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
	  /* code for IE6, IE5 */
	  var client = new ActiveXObject("Microsoft.XmlHttp");
	}
	client.onreadystatechange = function(){
	/*IE 6 and FF2 do not recognize this.readyState.*/
	/*readyState check is needed to prevent errors*/
	if (client.readyState == 4) {
		/*check request status, using hardcoded style.display due to browser bugs*/
		if (client.status == 200) {
			var complianceSection = jQuery('#complianceSection');
			/*icon*/
			iconDivToSet = jQuery(".coc_icon");
			iconDivToSet.removeClass("hide");
			/*notes text and link*/
			textDivToSet = jQuery("#coc");
			textDivToSet.removeClass("hide");
			textDivToSet.html("<a href='" + complianceFile + "' name='showCompliancePDF' target='_blank' rel='nofollow'>View the <strong>Certificate of Conformity</strong></a> for this item. (PDF)");
			if(complianceSection.length > 0  && complianceSection.hasClass('hide') ) {
				complianceSection.removeClass('hide');
			}
			}
		  }
	  }
	client.open("GET",complianceFile , true);
	client.send(null);
}

/*Before showing cart check for persisted items that may have become discontinued*/
function discontinuedItemModal(checkoutPage) {
	 var orderCode = jQuery.urlParam("ordercode");
	 var isOrderCodeNotNull = (orderCode != null && orderCode != "") ? true : false;
	var bindArgs = {
		url: contextPath +"/modal/discontinuedproductmodalpage",
		method: "POST",
		form: "senstiveItems",
		sync: true,
		mimetype: "text/html",
		orderCode: orderCode,
		isOrderCodeNotNull: isOrderCodeNotNull,
		success: function(type, value, evt) {
			if (value.indexOf("goToCart") != -1){
				if(isOrderCodeNotNull){
					renderCheckoutPage(checkoutPage,orderCode);
				} else {
					window.location.href='/cart'
				}
			} else if (value.indexOf("refreshPage") != -1){
				if(isOrderCodeNotNull){
					renderCheckoutPage(checkoutPage,orderCode);
				} else {
				   setTimeout("location.reload(true);",500);
				}
			} else {
				createModal("DiscontinuedItems", "DiscontinuedItems");
				dlg.set('content', value );
				showDlgAndExecute();
			}
		},
		error: function(type, error) {
		  alert("Error  " + error);
		 }
		};
	bindArgs.sendTransport = true;
}

// don't like this at all, use bootstrap popovers
function getElementTopLeft(e) {
	var topP = 0;
	var leftP = 0;
	var eOffSet = e;

	while(e.tagName != "BODY") {
		topP += e.offsetTop;
		leftP += e.offsetLeft;
		e = e.offsetParent;
	}

	if (leftP >= 700) {
		eOffSet.className += ' tooltip position-left';
	}

	var tooltips = document.getElementsByName("tooltip");

	for(var i = 0; i < tooltips.length; i++) {
		tooltips[i].style.top = "-" + ((tooltips[i].offsetHeight/2) - 10) + 'px';
	}

	return { top: topP, left: leftP };
}
// quickview button on gallery globally.
function quickitemview(prodcode,buttonType) {
	pcode = prodcode;
	btype = buttonType;
	var url = '';

	Grainger.Modals.waitModal("quickitemview", "quickitemview");

	if(btype=='update'){
		url = "/product/quickview/"+ pcode +"?buttonType="+btype;
	} else {
		url = '/product/quickview/'+ pcode;
	}

	jQuery.ajax({
		url: url,
		cache: false,
		success: function(data) {
			Grainger.Modals.createAndShowModal("quickitemview", "quickitemview", data);
		},
		error: function() {
			Grainger.Modals.killModal();
		}
	});
}

function getRegionByCountry(pageType) {
	var toUrl = "/GenericController/regionsByCountry",
		regionList = jQuery("#checkout-new-state"),
		regionInput = jQuery("#checkout-new-region"),
		countryCode = jQuery("#checkout-new-country option:selected").val(),
		stateProvRegionArea = jQuery("#stateprovregion-new-area"),
		currentRegion;

	if(pageType == 'paymentNew'){
		regionList = jQuery("#checkout-select-state");
	}

	if (pageType == 'addressEdit') {
		regionList = jQuery("#state");
		regionInput = jQuery("#region");
		countryCode = jQuery("#country option:selected").val();
		stateProvRegionArea = jQuery("#stateprovregion-area");
	}

	if (regionList.length > 0) {
		currentRegion = regionList.val();
	}

	switch (countryCode) {
		case "US":
		case "CA":
		case "MX":
			jQuery("#zip-label").text("*Zip/Postal Code");
			break;

		default:
			jQuery("#zip-label").text("Zip/Postal Code");
			break;
	}

	jQuery.ajax({url: toUrl, type: "POST", data: {countryCode: countryCode}, dataType: "json"}).done(function(data) {
		if (data.length > 0) {
			stateProvRegionArea.removeClass('hide');
			regionList.empty();
			jQuery.each(data, function(index, val) {
				if (val.isocode == currentRegion) {
					regionList.append('<option value="' + val.isocode + '" selected="selected">' + val.name + '</option>')
				} else {
					regionList.append('<option value="' + val.isocode + '">' + val.name + '</option>');
				}
			});

			regionList.parentsUntil('.styledSelect').removeClass("hide");
			regionInput.addClass("hide");
		} else {
			stateProvRegionArea.addClass('hide');
			regionInput.val("");
			regionList.val('');
		}
	}).error(function(jqXHR, textStatus, errorThrown) {
		console.log(textStatus);
	}).complete(function(jqXHR, textStatus) {
		console.log(textStatus);
	});
	
}

// more dumping ground, used in checkout and my account, edit address really
//PageType - "addressNew", "addressEdit", and "paymentNew"
copyStateToRegion = function(pageType) {
    var regionList = jQuery("#checkout-new-state"),
        regionInput = jQuery("#checkout-new-region");

    if(pageType == 'paymentNew'){
        regionList = jQuery("#checkout-select-state");
    }

    if (pageType == 'addressEdit') {
        regionList = jQuery("#state");
    }

    regionInput.val(regionList.val());

}

//added code for account catalog options population

function validateCatalogSelection()
{
		
		if(localStorage) {
			var zipCode = localStorage.getItem("lastSearchedRTAZipcode");
			var pickUpBranchId=localStorage.getItem("lastSearchedRTAPickupBranchId");
			var deliveryMethod=	localStorage.getItem("lastSearchedRTADeliveryMode");
			jQuery("#lastRtaZipCode").val(zipCode);
			jQuery("#lastRtaBranchId").val(pickUpBranchId);
			jQuery("#lastRtaDeliveryMode").val(deliveryMethod);
		}		
		jQuery("#LoginAccountSelectForm").submit();
}

function checkPasswordStrength(pwd, userID) {

	var  strength_text = jQuery('#strength-text'),
	     strength_id = jQuery('#strength-id'),
		 progress_bar = jQuery('#strength-progress-bar'),
		 strengthContainer = jQuery('.strength-container'),
		 passwordStrengthLabelValue = null,
		 defaultBarClass = "",
		 progressClass = "",
		 reserveWord1 = "grainger",
		 reserveWord2 = "gra1nger",
		 width = 0,
	/*var strong = new RegExp('^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$', 'g');
	var medium = new RegExp('^(?=.{6,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$', 'g');
	var enough = new RegExp('(?=.{6,}).*', 'g');*/

	/*Strong Status bar: green
	** a) 8 - 20 chars, and consists of a mixture of lower case letters, at least 1 special character (use only !@#$%^*) and at least 1 number.
	** b) 8 - 20 chars, and consists of a mixture of upper and lower case letters and at least 1 number.
	*/
		 strong1 = RegExp('^((?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^*]).{8,20})', 'g'),
		 /*strong2 = RegExp('^(?=.{8,20})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])', 'g'),*/

	/*Good Status bar: yellow
	** a)8-20 lower case letters with at least 1 number
	** b)8-20 upper case letters with at least 1 number
	*/
		 medium1 = RegExp('^(?=.{8,20})(?=.*[A-Za-z])(?=.*[0-9])', 'g'),

	/*var medium2 = new RegExp('^(?=.{8,20})(?=.*[A-Z])(?=.*[0-9])', 'g');*/
	/*Invalid status bar : red
	**1-8 characters ,More than 20 characters,  8-20 letters only, 8-20 numbers only ,8-20 symbols only,PW contains space
	**  PW contains user ID,PW contains "grainger" or "gra1nger"
	*/
		 enough1 = RegExp('(?=.{8,}).*', 'g'),
		 enough3 = RegExp('^[A-Za-z]\w{8,20}'),
		 enough4 = RegExp('^[0-9]\w{8,20}'),

	enough5 =  new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])\w{8,20}');
		 /*enough5 =  RegExp('^[!@#$%^&amp;*()_+}{&quot;:;?/&gt;.&lt;,]\w{6,20}');*/
	spaceandgrainger = new RegExp('^.*(grainger|gra1nger).*$');
	reWhiteSpace = new RegExp('([^\s]([ ])[^\s])|([ ]([^\s])[^\s])|([^\s]([^\s])[ ])');

	strength_id.val(0);
	width = pwd.length * 10;
	var strongPwd = jQuery('#strongPwd').val();
	var goodPwd   = jQuery('#goodPwd').val();
	var weakPwd   = jQuery('#weakPwd').val();
	var mediumPwd = jQuery('#mediumPwd').val();
	
	if (strength_text == null) {
		return;
	} else if (width > 100) {
		width = 100;
	}
	if (!pwd.length) {
		defaultBarClass = 'default';

	} else if (strong1.test(pwd) && (spaceandgrainger.test(pwd)!=true) && (!reWhiteSpace.test(pwd))) {
		
		passwordStrengthLabelValue = strongPwd;
		progressClass = 'strong';
		strength_id.val(3);
	} else if (medium1.test(pwd) && (spaceandgrainger.test(pwd)!=true) && (!reWhiteSpace.test(pwd))) {
		passwordStrengthLabelValue = goodPwd;
		progressClass = 'medium';
		strength_id.val(2);
	}else if (!enough5.test(pwd)) {
		
		passwordStrengthLabelValue = weakPwd;
		progressClass = 'weak';

	} 
	if (passwordStrengthLabelValue) {
		strength_text.html(passwordStrengthLabelValue);
		progress_bar.attr('class', progressClass);
		strengthContainer.attr('class', 'strength-container '+defaultBarClass)
	}
	progress_bar.width(width+'%');
}

/*! http://mths.be/placeholder v2.0.7 by @mathias */
;(function(window, document, $) {

	// Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var prototype = $.fn;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = prototype.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		placeholder = prototype.placeholder = function() {
			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.placeholder')
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value == '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass('placeholder')) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.placeholder', this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.placeholder').each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass('placeholder');
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value == '') {
			if (input.type == 'password') {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass('placeholder');
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass('placeholder');
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (err) {}
	}

}(this, document, jQuery));


/*
 * Here we're adding a custom validation method, emailhygiene, to the jQuery.validate plugin.
 * This is a modified version of the stock remote method. See the original source
 * of the remote method here: https://github.com/jzaefferer/jquery-validation/blob/1.11.0/jquery.validate.js#L997
 *
 * The emailhygiene method will send an email to the server, where it is sent to a third-party
 * API to verify the email is not SPAM. The email is only sent to the server if the feature is enabled
 * and the value is already determined to match an email pattern.
 *
 * Docs to adding a method can be found at http://jqueryvalidation.org/jQuery.validator.addMethod
 */
jQuery.validator.addMethod('emailhygiene',function(value,element, param) {
    if ( this.optional(element) ) {
        return "dependency-mismatch";
    }
    var isEmail = this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);

    //Note: Validation initially fires when a field loses focus. Then whenever the
    //user makes a change to the value. We only want to execute email hygiene validation
    //if the following is true:
    //
    // 1) Email validation is enabled
    // 2) The value is known to conform to an email pattern
    // 3) We can reasonably assume the use has finished entering their email. We will only
    //    send the email to the server for validation when the field loses focus.
    if(!Grainger.emailValidationEnabled || !isEmail || jQuery(element).is(':focus')) {
        return isEmail;
    }

    var previous = this.previousValue(element);
    if (!this.settings.messages[element.name] ) {
        this.settings.messages[element.name] = {};
    }
    previous.originalMessage = this.settings.messages[element.name].emailhygiene;
    this.settings.messages[element.name].emailhygiene = previous.message;

    if ( previous.old === value ) {
        return previous.valid;
    }

    previous.old = value;
    var validator = this;
    this.startRequest(element);
    var data = {};
    data[element.name] = value;
    jQuery.ajax(jQuery.extend(true, {
        url: '/emails/validate',
        mode: "abort",
        method: 'post',
        port: "validate" + element.name,
        dataType: "json",
        data: {email: value, sourceId: (typeof param === 'string' ? param : '')},
        success: function( response ) {
            validator.settings.messages[element.name].emailhygiene = previous.originalMessage;
            var valid = response === true || response === "true";
            if ( valid ) {
                var submitted = validator.formSubmitted;
                validator.prepareElement(element);
                validator.formSubmitted = submitted;
                validator.successList.push(element);
                delete validator.invalid[element.name];
                validator.showErrors();
            } else {
                var errors = {};
                var message = response || validator.defaultMessage( element, "emailhygiene" );
                errors[element.name] = previous.message = jQuery.isFunction(message) ? message(value) : message;
                validator.invalid[element.name] = true;
                validator.showErrors(errors);
            }
            previous.valid = valid;
            validator.stopRequest(element, valid);
        }
    }, param));
    return "pending";
}, 'Please enter a valid email');

//The jQuery.validate.addMethod function won't create a class for us if there's a third argument in
//the method callback (see https://github.com/jzaefferer/jquery-validation/blob/1.11.0/jquery.validate.js#L972).
//We use the third argument as the sourceId, so the following line is added to configure the class.
//By configuring the class, input fields will be validated against the emailhygiene validator if they
//include an emailhygiene class.
jQuery.validator.addClassRules('emailhygiene', jQuery.validator.normalizeRule('emailhygiene'));

/**
 * Scroll to an element if the top of it is out of view. Usage: jQuery('#someelement').scrollTo();. Author: Grainger UX FED
 * @function scrollTo
 * @param {object} [options] - options for scrollTime and offset
 * @returns {objcet} el - the jQuery object for the dom element you pass in first to maintain chainability
 */
(function ($) {
	$.fn.scrollTo = function (options) {

		/* Let us set some defaults */
		var settings = $.extend({
			'scrollTime' : 700, //700ms scroll time
			'offset' : 20 //default offset of 20px from the top of the screen because visual usability
		}, options),

			el = this, //the thing you want to scroll to
			elTop = el.offset().top, //top of the element
			screenTop = jQuery(window).scrollTop(); //top of the window

		if (elTop <= screenTop) {
			$('html,body').animate({scrollTop : elTop - settings.offset}, settings.scrollTime)
		}

		//maintain chainability
		return el;
	}
})(jQuery);

/*it defines on click (show/hide) of phone hours in default and new locations*/
function showHidePhoneHours() {
	var count;
	jQuery("#hasPhoneHoursLink .phoneHoursLink").off(".NSbranchMapPhoneContainer").on("click.NSbranchMapPhoneContainer", function(e) {
		count = jQuery(this).data('count');
		jQuery("#phoneHoursList"+count).toggleClass("hide");
		jQuery(this).toggleClass("active");
	});
}

function showRTADisclaimerDlg(){
	Grainger.Modals.waitModal("showDisclaimerDlg", "showDisclaimerDlg");
	var data = jQuery("#availabilityPopup").html();
	Grainger.Modals.createAndShowModal("showDisclaimerDlg", "showDisclaimerDlg", data);
}

function showImagesInfoTooltip(){
	Grainger.Modals.waitModal("showDisclaimerDlg", "showDisclaimerDlg");
	var data = jQuery("#aboutImagesPopup").html();
	Grainger.Modals.createAndShowModal("showDisclaimerDlg", "showDisclaimerDlg", data);
}

function showVendorInfoTooltip(){
	Grainger.Modals.waitModal("showDisclaimerDlg", "showDisclaimerDlg");
	var data = jQuery("#vendorInfoPopup").html();
	Grainger.Modals.createAndShowModal("showDisclaimerDlg", "showDisclaimerDlg", data);
}

function showAvailabilityDisclaimerDlg(){
	Grainger.Modals.waitModal("showDisclaimerDlg", "showDisclaimerDlg");
	var data = jQuery("#availabilityDisclaimer").html();
	Grainger.Modals.createAndShowModal("showDisclaimerDlg", "showDisclaimerDlg", data);
}

function validateAndSubmitCustomForm(formId,ajaxPostUrl){
	
	//var customFormId = formId;
	$('#formId .errorMsg').addClass('hide');
	$.ajax({
           type : "POST",
           url : ajaxPostUrl,
           dataType : "text",
           data : $("#"+formId).serialize(),
           cache: false,
           success : function(data) {
          	   var err=false;
                 if(data!=""){
                        var json = $.parseJSON(data);
                        err=$(json).attr("errors");
                 }
                 if(err) {
                	 displayFormErrors(json);
                 }
                 else{
               		$("#"+formId).submit();
                 }
           }
    });
}

function displayFormErrors(data) {
	$('.inputType').removeClass('errorField');
	$('.errorMsg').addClass("hide");
	$.each(data, function(id, value) {
		$("#" + id).addClass("errorField");
	  	var idArr = id.replace(/\./g, '\\.');
		var field = $("#" + idArr + "Error");
		field.html(value).removeClass('hide');
	});
       
} 

//Used to pad a number with leading zeroes based on a max length needed 
//in the desired format.
function pad (str, max) {
	  str = str.toString();
	  return str.length < max ? pad("0" + str, max) : str;
	}

//Returns true if Internet Explorer version is less than 9 otherwise return false
function msieversion() 
{
	try{
	    var ua = window.navigator.userAgent;
	    var msie = ua.indexOf("MSIE ");
	
	    if (msie > 0) // Check for Internet Explorer
	    {
	    	var version = parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
	    	if (version < 9) {
	    		return true;
	    	}
	    }
	} catch (err) {
		//ignore any error
	}
    return false;
}


function setLastSearchedRTAInfo(zipCode, pickUpBranchId, deliveryMethod){
	$.ajax({
		 cache : false,
         type : "POST",
         url : contextPath+"/rta/set-last-searched-RTA-info",
         data: { zipCode: zipCode, branchId: pickUpBranchId, deliveryMode: deliveryMethod},
         success : function(response) {
        	if(response.status){
        		 if(localStorage){
         			if (zipCode) {
         				localStorage.setItem("lastSearchedRTAZipcode", zipCode);
         			}
         			if (pickUpBranchId) {
         				localStorage.setItem("lastSearchedRTAPickupBranchId", pickUpBranchId);
         			}
         			if (deliveryMethod) {
         				localStorage.setItem("lastSearchedRTADeliveryMode", deliveryMethod);
         			}		
         		}
        	}
         },
         error : function(errorThrown){	
     	
 			console.log(errorThrown);
 		}
         
     });
	
	
}

function getLastSearchedRTAInfo(){
	var zipCode = null;
	var pickUpBranchId=null;
	var deliveryMethod=	null;
	$.ajax({
		 cache : false,
         type : "GET",
         url : contextPath+"/rta/get-last-searched-RTA-info",
         success : function(response) {
        	 if( response.status){
        			if(response.anonymous=="false"){
        		 		zipCode=response.zipCode;
        		 		pickUpBranchId=response.branchId;
        		 		deliveryMethod=response.deliveryMode;
        			 } else {
        				if(localStorage) {
        					zipCode = localStorage.getItem("lastSearchedRTAZipcode");
        					pickUpBranchId=localStorage.getItem("lastSearchedRTAPickupBranchId");
        					deliveryMethod=	localStorage.getItem("lastSearchedRTADeliveryMode");		
        				}
        			}
        			if (zipCode) {
        				$('#lastSearchedRTAZipcode').val(zipCode);
        			}
        			if (pickUpBranchId) {
        				$('#lastSearchedRTAPickupBranchId').val(pickUpBranchId);
        			}
        			if (deliveryMethod) {
        				$('#lastSearchedRTADeliveryMode').val(deliveryMethod);
        			}
         	}
		},
		error : function(errorThrown){			
			console.log(errorThrown);
		}
	});
}

function validateQuantity(dom){
	if (dom.value != dom.value.replace(/[^0-9\.]/g, '')) {
		dom.value = removeNonNumbericValuesForQuanity(dom.value);
	}
}

function htmlEncode(input) {
	return input
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/*
 * Used to unescape HTML entites.
 * For exaample:
 * htmlDecode("&lt;");
 * outputs: "<";
 */
function htmlDecode(input){
	var e = document.createElement('div');
	e.innerHTML = input;
	return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function removeNonNumbericValuesForQuanity(val){
	if(!val || $.trim(val) == '')
		return '';
	if(val.length == 1 && val == '0')
		return '';
	// remove non-numerics
	val = val.replace(/\D/g,'');
	// remove leading zeros
	if(val)
		val = val.replace(/\b0+/g, '');
	// only 5 digits allowed
	if(val.length > 5){
		val = val.substring(0,5);
	}
	return val;
}

function escapeProdSpecialCharacters(val){
	if(!val || $.trim(val) == '')
		return '';
	val = val.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
	return val;
}

function clearRtaInfo() {
	
	localStorage.removeItem("lastSearchedRTAZipcode");
	localStorage.removeItem("lastSearchedRTAPickupBranchId");
	localStorage.removeItem("lastSearchedRTADeliveryMode");
	localStorage.removeItem("lastSearchedLocationTaxRate");
}

function getUrlParameter(sParam) {
	try {
	    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	        sURLVariables = sPageURL.split('&'),
	        sParameterName,
	        i;
	
	    for (i = 0; i < sURLVariables.length; i++) {
	        sParameterName = sURLVariables[i].split('=');
	
	        if (sParameterName[0] === sParam) {
	            return sParameterName[1] === undefined ? true : sParameterName[1];
	        }
	    }
	} catch(err) {
		console.log(err);
	}
};

/*
// This was used to display messaging to the user after the US site redesign
var vrwnModal = {
	// Initialize Everything and figure out what type of method to display the modal
	init: function(){
		var us = this,
			trigger = jQuery('#body-main .vr_wn_modal_trigger');
		if(typeof vr_wn_modal !== 'undefined'){
			switch(vr_wn_modal){
				case 'inter':
					if(!jQuery.cookie('vr_wn_modal_dismiss')){
						vrwnModal.build();
					}
					trigger.show().click(function(){
						vrwnModal.build();
					});
					break;
				case 'link':
					trigger.show().click(function(){
						vrwnModal.build();
					});
					break;
				default:
					trigger.remove()
			}
		}else{
			trigger.remove();
		}
	},
	// Build and show the modal contents
	build: function(){
		var us = this;

		if(us.eprouser()){
			var cont = Grainger.templates.vrwnModal(us.modalData.epro);
		}else if(us.custcatuser()){
			var cont = Grainger.templates.vrwnModal(us.modalData.customcat);
		}else{
			var cont = Grainger.templates.vrwnModal(us.modalData.regular);
		}

		Grainger.Modals.createAndShowModal('vrwnModal', 'You asked. We listened.', cont, null, function(){
			jQuery('#vrwnModal .modal-content').css({ 'max-height': 385 });
			jQuery('#vrwnModal .btn').click(function(){
				jQuery.cookie('vr_wn_modal_dismiss', true, { expires: 100 });
			});
		});
	},
	// Check if EPRO
	eprouser: function(){
		if(jQuery('html').data('epro-user') == true) return true;
		return false;
	},
	custcatuser: function(){
		if(jQuery('html').data('custom-catalog-user') == true) return true;
		return false;
	},
	modalData: {
		regular:{
			image: '//static.grainger.com/images/cm_anon2.png',
			sections: [{
				sectionClass: "firstSection",
				title: "You asked. We listened.",
				paragraph: "We put your feedback and suggestions to work and made improvements to the site for a better experience."
			},{
				title: "Improved site navigation",
				paragraph: "We redesigned the top navigation bar to make it faster and easier to browse the site, access your order history, find your personal lists and manage your account. Now you’ll find links to these commonly used account features at the very top of the page."
			},{
				title: "Cleaner look and feel",
				paragraph: "We made subtle visual enhancements that make pages easier to read and important elements easier to find–all without changing the content or functionality you need."
			},{
				sectionClass: "lastSection",
				paragraph: "Tell us what you think. Use the feedback button up top to send us your comments and suggestions. Thanks for helping us make your experience even better."
			}]
		},
		customcat:{
			image: '//static.grainger.com/images/cm_customcat2.png',
			sections: [{
				sectionClass: "firstSection",
				title: "We've made a few improvements ...",
				paragraph: "We put your feedback and suggestions to work and made improvements to the site for a better experience."
			},{
				title: "Improved site navigation",
				paragraph: "We redesigned the top navigation bar to make it faster and easier to browse the site, access your order history, find your personal lists and manage your account. Now you’ll find links to these commonly used account features at the very top of the page."
			},{
				title: "Cleaner look and feel",
				paragraph: "We made subtle visual enhancements that make pages easier to read and important elements easier to find–all without changing the content or functionality you need."
			},{
				sectionClass: "lastSection",
				paragraph: "Tell us what you think. Use the feedback button up top to send us your comments and suggestions. Thanks for helping us make your experience even better."
			}]
		},
		epro:{
			image: '//static.grainger.com/images/cm_epro2.png',
			sections: [{
				sectionClass: "firstSection",
				title: "We've made a few improvements ...",
				paragraph: "We put your feedback and suggestions to work and made improvements to the site for a better experience."
			},{
				title: "Improved site navigation",
				paragraph: "We redesigned the top navigation bar to make it faster and easier for you to browse the site."
			},{
				title: "Cleaner look and feel",
				paragraph: "We made subtle visual enhancements that make pages easier to read and important elements easier to find–all without changing the content or functionality you need."
			},{
				sectionClass: "lastSection",
				paragraph: "Tell us what you think. Use the feedback button up top to send us your comments and suggestions. Thanks for helping us make your experience even better."
			}]
		}
	}
};

//DOM READY
var vr_wn_modal = 'inter';
jQuery(vrwnModal.init);
*/

	function redirectPath(){
        var pathName = location.pathname;
        pathName = pathName.replace(ACC.config.contextPath,"");

        // don't turn login error into a forward parameter
        var search = location.search;
        if (pathName === "/login" && search.indexOf("?error=true") == 0) {
            search = "";
        }

        // prevent nested login page forwarding
        pathName = pathName.replace("/login", "");
        if (search.indexOf("?frwdUrlPath=") !== -1) {
            search = search.replace("?frwdUrlPath=", "");
            search = unescape(search); // unescape the previous forward destination for reuse
        }
        return pathName+ search;
	}
	
	$(document).ready(function (){
		$('.char-ctr, .char-ctr-alt').keyup(function() {
			if($(this).is('textarea') && $(this).val().match(/\n+/g)){
				$(this).val($(this).val().replace(/\n+/g, ''));
			}		
			$(this).hasClass('char-ctr') ? ($(this).parent().find('.char-ctr-display').html($(this).attr('maxlength') - $(this).val().length)) : ($(this).parent().parent().find('.char-ctr-display').html($(this).attr('maxlength') - $(this).val().length));		
		});
// Uncomment this script when gmx mini cart implementation
//		var tid = 0;
//		$('#miniCartLinkForm').on({
//		    mouseenter: function() {
//		    	if(!$('#miniCartDisplay').hasClass('hide') || $('body').hasClass('page-cartPage') || $('body').hasClass('page-checkoutOrderReviewPage') || parseInt($('#quickCartItemCount').val()) == 0){
//					return false;
//				}			
//				$('#miniCartContent').empty();
//				
//			    $.ajax({
//			    	type : "POST",
//			        dataType : "json",
//			        url : contextPath+"/view/MiniCartComponentController/getMiniCart",
//			        cache: false,
//			        async : false,
//			        success : function(data) {
//			        	var miniCartItems = jQuery.parseJSON(data);
//			        	$.each(miniCartItems.cartItems, function (i, item){
//			        		var obj = $('#miniCartClone').clone();
//			        		obj.find('.minicart-name').html(item.productNm);
//			        		obj.find('a').attr('href', item.pdpUrl);
//			        		obj.find('.minicart-image img').attr('alt', item.productNm).attr('src', item.images[0].url);
//			        		if(item.salesStatus != 'DV' && item.salesStatus != 'DG') {
//				        		obj.find('.minicart-price').html(item.totalPrice);
//				        		obj.find('.minicart-qty').html(item.productQty);
//			        		}
//			        		obj.find('.minicart-item-number').html(item.productCode);
//			        		
//			        		$('#miniCartContent').append(obj.html());
//		                });	
//		        		if(miniCartItems.cartItems.length > 3) {
//			        		$('#miniCartDisplay .header').addClass('alt');
//			        	}
//		        		$('#quickCartItemCount').html(miniCartItems.cartItems.length);
//		        		$('#miniCartDisplay .minicart-subtotal').html(miniCartItems.subTotal);
//			        	$('#miniCartDisplay').removeClass('hide');
//			        	tid = setTimeout(function () {
//			        	    populateMiniCartModalDataDom();
//                            }, 4000);
//
//			        }
//			    });
//		    },
//		    mouseleave: function() {
//		    	$('#miniCartDisplay').addClass('hide');
//		    	clearTimeout(tid);
//		    }
//		});
		
		$(".orderHistoryStartDate, .orderHistoryEndDate").on('keydown keyup',function(e) {
			if (jQuery('#ui-datepicker-div').is(":visible")) {
				jQuery(this).datepicker('hide').datepicker('show');
			}
			
			var orderHistoryStartDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val(),
				orderHistoryEndDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val(),
	    	    orderHistoryDateMatch = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{2})$/;
			
	    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==false || orderHistoryDateMatch.test(orderHistoryEndDateStr)==false || orderHistoryStartDateStr > orderHistoryEndDateStr){
	        	$("#" + $('#oh_activeTab').val() + " .date-picker-apply").attr('disabled', 'disabled');
	        	$("#" + $('#oh_activeTab').val() + " .date-picker-apply").addClass('disabledClick').attr('disabled', 'disabled');
	        }
	    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==true && orderHistoryDateMatch.test(orderHistoryEndDateStr)==true && orderHistoryStartDateStr <= orderHistoryEndDateStr){
	    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").removeClass('disabledClick').removeAttr('disabled');
	        }
	    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==true && orderHistoryDateMatch.test(orderHistoryEndDateStr)==true && orderHistoryStartDateStr > orderHistoryEndDateStr){
	    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").removeClass('disabledClick').removeAttr('disabled');
	        	jQuery('#tab_oh .date-picker-apply').removeClass('disabled').removeAttr('disabledClick');
	        }
	    });
		
	 });
	
	if(contextPath == '/fr'){
		nameOfMonths = ["janvier","fÃ©vrier","mars","avril","mai","juin","juillet","aoÃ»t","septembre","octobre","novembre","dÃ©cembre"];
		nameOfDays = ["lun","mar","mer","jeu","ven","sam","dim"];
	}
	else {
		nameOfMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		nameOfDays = ["Su","Mo","Tu","We","Th","Fr","Sa"];
	}
	
	jQuery(function() {
		function getCalDate(tabId){
			var selectedDate = new Date($('#' + tabId + ' .orderHistoryStartDate').val());
			selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
			return selectedDate;
		}
		function appendApplySection(tabId) {
			// Add the apply and cancel button section to the datepicker so that it will not be misaligned
			if ($('#ui-datepicker-div .date-picker-apply-wrap').length == 0) {
				var applyWrapper = $('#' + tabId + ' .date-picker-apply-wrap').clone();
				applyWrapper.appendTo('#ui-datepicker-div');
				applyWrapper.removeClass('hide');
			}
		}
		function toggleApplySection(tabId, show){
			show == 'show' ? jQuery('#' + tabId + ' .date-picker-apply-wrap').addClass('alt') : jQuery('#' + tabId + ' .date-picker-apply-wrap').removeClass('alt');
			setTimeout(function(){
				appendApplySection(tabId);
				if($("#ui-datepicker-div").offset().top < $('#' + tabId + ' .orderHistoryStartDate').offset().top){					
					$('#ui-datepicker-div').css('top', $('#' + tabId + ' .orderHistoryStartDate').offset().top + 42);
					$('html,body').animate({
				          scrollTop: $('#' + tabId + ' .orderHistoryStartDate').offset().top
			        }, 1000);
				}	
			}, 5);					
		}
		
		function getMinDate(tabId,selected) {
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf("MSIE ");
			var selectedTab = '#'+tabId; 
		    if(msie > 0 && (/msie\ [0-9]{1}/i.test(navigator.userAgent) == true)){
				var dd = selected.substr(8,2);
				var mm = selected.substr(5,2);
				var yy = selected.substr(0,4);
	            var startdtFormatted = yy + '-'+ mm + '-'+ dd;
	            
	            jQuery(selectedTab).find('.orderHistoryEndDate').datepicker("option", "minDate", startdtFormatted);
			}
		    else{
		    	jQuery(selectedTab).find('.orderHistoryEndDate').datepicker('option', 'minDate', getCalDate(tabId));
		    }
		}
		
		ohFrom = jQuery('#tab_oh .orderHistoryStartDate').datepicker({
			dateFormat: "yy-mm-dd",
			numberOfMonths: 1,
	      	maxDate: 'd',
	      	monthNames: nameOfMonths,
	      	dayNamesMin: nameOfDays,
	      	prevText: '',
	        nextText: '',
	      	minDate: new Date('02/01/2016'),
	      	showAnim: '',
	      	beforeShow: function(date) { 
	      		toggleApplySection('tab_oh', 'hide'); 	 
	      		if($('#tab_oh .dropdowns-oh-filter').hasClass('alt')){
	      			$('#ui-datepicker-div').removeClass('alt');
	      		}
  			}, 
  			onSelect: function(selected) {
  				
  				getMinDate('tab_oh',selected);
  			    
  				if(jQuery('#tab_oh .orderHistoryStartDate').val() != '' && jQuery('#tab_oh .orderHistoryEndDate').val() != '') {
					
					var orderHistoryStartDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val(),
						orderHistoryEndDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val(),
			    	    orderHistoryDateMatch = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{2})$/;
					
			    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==false || orderHistoryDateMatch.test(orderHistoryEndDateStr)==false || orderHistoryStartDateStr > orderHistoryEndDateStr){
			    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").attr('disabled', 'disabled');
			        }
			    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==true && orderHistoryDateMatch.test(orderHistoryEndDateStr)==true && orderHistoryStartDateStr <= orderHistoryEndDateStr){
			    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").removeAttr('disabled');
			        	jQuery('#tab_oh .date-picker-apply').removeAttr('disabled');
			        	if($('#tab_oh .date-picker-apply').hasClass('disabledClick')){
			    			jQuery('#tab_oh .date-picker-apply').removeClass('disabledClick');
						}
			        }
			    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==true && orderHistoryDateMatch.test(orderHistoryEndDateStr)==true && orderHistoryStartDateStr > orderHistoryEndDateStr){
			    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").removeAttr('disabled');
			        	jQuery('#tab_oh .date-picker-apply').removeAttr('disabled');
			        	if($('#tab_oh .date-picker-apply').hasClass('disabledClick')){
			    			jQuery('#tab_oh .date-picker-apply').removeClass('disabledClick');
						}
			        	
			        }
				}

				setTimeout(function() { appendApplySection('tab_oh'); }, 5);
			},
			onChangeMonthYear: function() {
        		setTimeout(function() { appendApplySection('tab_oh'); }, 5);
        	}
	    })
		ohTo = jQuery('#tab_oh .orderHistoryEndDate').datepicker({
			dateFormat: "yy-mm-dd",
			numberOfMonths: 1,
	        maxDate: 'd',
	        monthNames: nameOfMonths,
	        dayNamesMin: nameOfDays,
	        prevText: '',
	        nextText: '',
	        showAnim: '',
	        beforeShow : function(date) { 
        		toggleApplySection('tab_oh', 'show'); 
        		if($('#tab_oh .dropdowns-oh-filter').hasClass('alt')){
        			$('#ui-datepicker-div').addClass('alt');
        		}
    		},
	        onSelect: function(dateText, inst) {
	        	if(jQuery('#tab_oh .orderHistoryStartDate').val() != '' && jQuery('#tab_oh .orderHistoryStartDate').val() != '') {
	        		
	        		var orderHistoryStartDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val(),
						orderHistoryEndDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val(),
			    	    orderHistoryDateMatch = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{2})$/;
					
			    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==false || orderHistoryDateMatch.test(orderHistoryEndDateStr)==false || orderHistoryStartDateStr > orderHistoryEndDateStr){
			    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").attr('disabled', 'disabled');
			        }
			    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==true && orderHistoryDateMatch.test(orderHistoryEndDateStr)==true && orderHistoryStartDateStr <= orderHistoryEndDateStr){
			    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").removeAttr('disabled');
			    		jQuery('#tab_oh .date-picker-apply').removeAttr('disabled');
			    		if($('#tab_oh .date-picker-apply').hasClass('disabledClick')){
			    			jQuery('#tab_oh .date-picker-apply').removeClass('disabledClick');
						}
			    		
			        }
			    	if(orderHistoryDateMatch.test(orderHistoryStartDateStr)==true && orderHistoryDateMatch.test(orderHistoryEndDateStr)==true && orderHistoryStartDateStr > orderHistoryEndDateStr){
			    		$("#" + $('#oh_activeTab').val() + " .date-picker-apply").removeAttr('disabled');
			    		jQuery('#tab_oh .date-picker-apply').removeAttr('disabled');
			    		if($('#tab_oh .date-picker-apply').hasClass('disabledClick')){
			    			jQuery('#tab_oh .date-picker-apply').removeClass('disabledClick');
						}
			        }
	        	}
	        	setTimeout(function() { appendApplySection('tab_oh'); }, 5);
        	},
        	onChangeMonthYear: function() {
        		setTimeout(function() { appendApplySection('tab_oh'); }, 5);
        	}
	  	})
	  	ohDownloadFrom = jQuery('#tab_oh_downloads .orderHistoryStartDate').datepicker({
	  		dateFormat: "yy-mm-dd",
	  		numberOfMonths: 1,
	      	maxDate: 'd',
	      	monthNames: nameOfMonths,
	      	dayNamesMin: nameOfDays,
	      	prevText: '',
	        nextText: '',
	        minDate: new Date('02/01/2016'),
	      	showAnim: '',
	      	beforeShow : function(date) { toggleApplySection('tab_oh_downloads', 'hide'); },
	      	onSelect: function(selected) {
	      		
	      		getMinDate('tab_oh_downloads',selected);
  			    
	      		if(jQuery('#tab_oh_downloads .orderHistoryStartDate').val() != '' && jQuery('#tab_oh_downloads .orderHistoryEndDate').val() != '') {
					jQuery('#tab_oh_downloads .date-picker-apply').removeAttr('disabled');
				}
	      		
	      		setTimeout(function() { appendApplySection('tab_oh_downloads'); }, 5);
	      	},
	      	onChangeMonthYear: function() {
        		setTimeout(function() { appendApplySection('tab_oh_downloads'); }, 5);
        	}
	    })
	    ohDownloadTo = jQuery('#tab_oh_downloads .orderHistoryEndDate').datepicker({
	    	dateFormat: "yy-mm-dd",
	    	numberOfMonths: 1,
	        maxDate: 'd',
	        monthNames: nameOfMonths,
	        dayNamesMin: nameOfDays,
	        prevText: '',
	        nextText: '',
	        showAnim: '',
	        beforeShow : function(date) { toggleApplySection('tab_oh_downloads', 'show'); },
	        onSelect: function(dateText, inst) { 
	        	if(jQuery('#tab_oh_downloads .orderHistoryStartDate').val() != '' && jQuery('#tab_oh_downloads .orderHistoryEndDate').val() != '') {
					jQuery('#tab_oh_downloads .date-picker-apply').removeAttr('disabled');
				}
	        	setTimeout(function() { appendApplySection('tab_oh_downloads'); }, 5);
        	},
        	onChangeMonthYear: function() {
        		setTimeout(function() { appendApplySection('tab_oh_downloads'); }, 5);
        	}
	  	})
		
		ppiFrom = jQuery('#tab_ppi .orderHistoryStartDate').datepicker({
			dateFormat: "yy-mm-dd",
			numberOfMonths: 1,
	      	maxDate: 'd',
	      	monthNames: nameOfMonths,
	      	dayNamesMin: nameOfDays,
	      	prevText: '',
	        nextText: '',
	        minDate: new Date('02/01/2016'),
	      	showAnim: '',
	      	beforeShow : function(date) { toggleApplySection('tab_ppi', 'hide'); },
	      	onSelect: function(selected) {
	      		
	      		getMinDate('tab_ppi',selected);
  			    
      			if(jQuery('#tab_ppi .orderHistoryStartDate').val() != '' && jQuery('#tab_ppi .orderHistoryEndDate').val() != '') {
					jQuery('#tab_ppi .date-picker-apply').removeAttr('disabled');
				}
      			
      			setTimeout(function() { appendApplySection('tab_ppi'); }, 5);
	      	},
	      	onChangeMonthYear: function() {
        		setTimeout(function() { appendApplySection('tab_ppi'); }, 5);
        	}
	    })
	    ppiTo = jQuery('#tab_ppi .orderHistoryEndDate').datepicker({
	    	dateFormat: "yy-mm-dd",
	    	numberOfMonths: 1,
	        maxDate: 'd',
	        monthNames: nameOfMonths,
	        dayNamesMin: nameOfDays,
	        prevText: '',
	        nextText: '',
	        showAnim: '',
	        beforeShow : function(date) { toggleApplySection('tab_ppi', 'show'); },
	        onSelect: function(dateText, inst) {
	        	if(jQuery('#tab_ppi .orderHistoryStartDate').val() != '' && jQuery('#tab_ppi .orderHistoryEndDate').val() != '') {
					jQuery('#tab_ppi .date-picker-apply').removeAttr('disabled');
				}
	        	setTimeout(function() { appendApplySection('tab_ppi'); }, 5);
        	},
        	onChangeMonthYear: function() {
        		setTimeout(function() { appendApplySection('tab_ppi'); }, 5);
        	}
	  	})
		$('#ui-datepicker-div').on('click', '.date-picker-apply', function(e){
			if($('#tab_oh-content .date-picker-apply').hasClass('disabledClick')){
				return false;
			}
				
			var orderHistoryStartDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val(),
		    	orderHistoryEndDateStr = $('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val();
			
			if ($('#oh_activeTab').val() != 'tab_oh_downloads'){			
				$('#select-order-history-date-range').val("SPECIFIC_DATE_RANGES");
				$('#select-order-history-date-range option[value="SPECIFIC_DATE_RANGES"]').attr('selected', 'selected');
			}
			$('#dateRangeSelected').val('true');
			$('#' + $('#oh_activeTab').val() + ' .date-filter-container').addClass('hide');
			$('#' + $('#oh_activeTab').val() + ' .date-filter-container a').removeClass('selected');
			$('#' + $('#oh_activeTab').val() + ' .date-picker-fields').addClass('selected');			
					
			if(orderHistoryStartDateStr <= orderHistoryEndDateStr){
				$('#' + $('#oh_activeTab').val() + ' .date-filter-menu').html($('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val() + ' ' + $('#datePickerTo').val() + ' ' + $('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val());
			}
			if(orderHistoryStartDateStr > orderHistoryEndDateStr){
				$('#' + $('#oh_activeTab').val() + ' .date-filter-menu').html($('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val() + ' ' + $('#datePickerTo').val() + ' ' + $('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val());
				$('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val(orderHistoryStartDateStr);
			}
						
			if ($('#oh_activeTab').val() == 'tab_oh'){
				orderHistorySolr.handleFilterChange(null, 'select-order-history-date-range');
			}
			else if ($('#oh_activeTab').val() == 'tab_ppi'){
				purchasedItemSolr.handleFilterChange(null, 'select-order-history-date-range');
			}
			$('#ui-datepicker-div').hide();
	    });
		
		$('#ui-datepicker-div').on('click', '.ui-datepicker-close', function(e){
			$('#' + $('#oh_activeTab').val() + ' .date-picker-apply-wrap').addClass('hide');
			$('#' + $('#oh_activeTab').val() + ' .date-filter-container').addClass('hide');
			$('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val(sessionStorage.getItem(fldPrefix + 'ohDateRageStartDate'));
	    	$('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val(sessionStorage.getItem(fldPrefix + 'ohDateRageEndDate'));
	    	if(jQuery('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val() == '' && jQuery('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val() == '') {
				jQuery('#' + $('#oh_activeTab').val() + ' .date-picker-apply').attr('disabled', 'disabled');
			}
			$('#ui-datepicker-div').hide();
	    });
		
		if($('#oh_activeTab').val() != 'tab_oh_downloads'){ 
		    $('#' + $('#oh_activeTab').val() + ' .date-filter-container a, #' + $('#oh_activeTab').val() + ' .date-picker-fields').removeClass('selected');
		    var fldPrefix = $('#oh_activeTab').val() == 'tab_oh' ? '' : 'pi-';
		    
		    if(sessionStorage.getItem(fldPrefix + 'select-order-history-date-range') == 'SPECIFIC_DATE_RANGES'){
		    	$('#' + $('#oh_activeTab').val() + ' .date-picker-fields').addClass('selected');
		    	$('#' + $('#oh_activeTab').val() + ' .date-filter-menu').html(sessionStorage.getItem(fldPrefix + 'ohDateRageStartDate') + ' ' + $('#datePickerTo').val() + ' ' + sessionStorage.getItem(fldPrefix + 'ohDateRageEndDate'));
		    	$('#' + $('#oh_activeTab').val() + ' .orderHistoryStartDate').val(sessionStorage.getItem(fldPrefix + 'ohDateRageStartDate'));
		    	$('#' + $('#oh_activeTab').val() + ' .orderHistoryEndDate').val(sessionStorage.getItem(fldPrefix + 'ohDateRageEndDate'));
		    	$('#' + $('#oh_activeTab').val() + ' .date-picker-apply').removeAttr('disabled');
		    }
		    else {
		    	$("#" + $('#oh_activeTab').val() + " .date-filter-container a[href=" + sessionStorage.getItem(fldPrefix + "select-order-history-date-range") + "]").addClass('selected');
		    	$('#' + $('#oh_activeTab').val() + ' .date-filter-menu').html( $("a[href=" + sessionStorage.getItem(fldPrefix + "select-order-history-date-range") + "]").html());
		    }
	    }
	    else {
	    	$('#tab_oh_downloads .orderHistoryStartDate', '#tab_oh_downloads .orderHistoryEndDate').val('');
	    }	
				
		$('#tab_oh .orderHistoryEndDate').on('click', function(e){
			$('#tab_oh td[data-handler]:first').find('a').addClass('ui-state-active');					
	    });
		$('#tab_oh_downloads .orderHistoryEndDate').on('click', function(e){
			$('#tab_oh_downloads td[data-handler]:first').find('a').addClass('ui-state-active');					
	    });
		$('#tab_ppi .orderHistoryEndDate').on('click', function(e){
			$('#tab_ppi td[data-handler]:first').find('a').addClass('ui-state-active');					
	    });
		$('#tab_oh .date-picker-icon, #tab_oh_downloads .date-picker-icon, #tab_ppi .date-picker-icon').on('click', function(e){
			$(this).next().focus();					
	    });
		$('.ui-datepicker-close').on('focus', function(e){
			$('#ui-datepicker-div').show();
	    });
		$(window).resize(function() {
			jQuery(".hasDatepicker").each(function() {
				// Attempt to keep the open datepicker (if any) aligned to its element
				// when the window is resized
				if (jQuery(this).is(":focus") && jQuery('#ui-datepicker-div').is(":visible")) {
					jQuery(this).datepicker('hide').datepicker('show');
				}
			});
		});
	});
	// adjust placement of action buttons based on calendar height	
	$(document).on('click', '.ui-datepicker-next, .ui-datepicker-prev', function () {
		if(($('#ui-datepicker-div').offset().top + $('#ui-datepicker-div').outerHeight(true) - 1) > $('#' + $('#oh_activeTab').val() + ' .date-picker-apply-wrap').offset().top + $('.date-picker-apply-wrap').outerHeight(true)){
			$('#' + $('#oh_activeTab').val() + ' .date-picker-apply-wrap').css('bottom', '-292px');
		}
		else {
			$('#' + $('#oh_activeTab').val() + ' .date-picker-apply-wrap').css('bottom', '-264px');
		} 
	})
	$(document).on('click', 'body', function(e) { 
		 var selectedTab = $('#oh_activeTab').val();
		 var container = $('#' + selectedTab + ' .date-filter-container, #' + selectedTab + ' .date-filter-menu, .ui-datepicker');
		 if (!container.is(e.target) && container.has(e.target).length === 0) {
			 $('#' + selectedTab + ' .date-filter-container').addClass('hide');
			 if($('#dateRangeSelected').val() == 'false') {
				 $('#' + selectedTab + ' .orderHistoryStartDate, #' + selectedTab + ' .orderHistoryEndDate').val('');
				 $('#' + $('#oh_activeTab').val() + ' .date-picker-apply').attr('disabled', 'disabled');
			 }
			 $('#ui-datepicker-div').hide();
	    }
		 
	}); 

	$(document).on('keyup', '.date-filter-menu, .date-filter-container', function(e) { 
		 if(e.which == 13) { 
		 	$(this).trigger('click');
		 }
		 if (e.keyCode == 27) { 	    	
			$('#' + $('#oh_activeTab').val() + ' .date-filter-container').addClass('hide');
	    }
	});
	
	function isValidZipcodeAddress(zipCode) {
		return jQuery.trim(zipCode) !== ""
				&& zipCode.match("^[\\d]{5}([-\\s][\\d]{4})?$");
	}
	
	// Pagination, next / previous action for Product List component
	function showPagedList(pageSize, pageNo) {
		
		var url = addURLParameter(location.href, 'page', pageNo);
		
		url = addURLParameter(url, 'pagesize', pageSize);
		$('#pagesize').val(pageSize);
		location.href = url;
	}
	
	//add URL param without duplicacy to existing ones
	function addURLParameter(url, param, value){
		try {
			var hash       = {};
		    var parser     = document.createElement('a');

		    parser.href    = url;

		    var parameters = parser.search.split(/\?|&/);

		    for(var i=0; i < parameters.length; i++) {
		        if(!parameters[i])
		            continue;

		        var ary      = parameters[i].split('=');
		        hash[ary[0]] = ary[1];
		    }

		    hash[param] = value;

		    var list = [];  

		    $.each(Object.keys(hash), function(index, key){
	    		 list.push(key + '=' + hash[key]);
	    	});
		    
		    parser.search = '?' + list.join('&');
		    return parser.href;
		    
		} catch(err) {
			console.log("Operation not supported on older browser " + err);
		}
	    return null;
	}
	
	$(document).ready(function(){
		var txtVal = $('.adaptive').val();
		
	    $("#adaptText").click(function(){
	        $("#adaptText").hide();
			$("#adaptiveText").show();
			$( ".adaptive" ).focus();
	    });
	    $(document).click(function(e) {
		if( e.target.id != 'adaptText'&&e.target.id != 'adaptiveText') {
		if(txtVal=="")
		{
			$("#adaptiveText").hide();
			$("#adaptText").show();
		}
	  }
	});

	});
	
	function showNomProductRestrictionMessageModal(){
		Grainger.Modals.waitModal("showProductRestrictionModal", "showProductRestrictionModal");
		var data = jQuery("#productRestrictionModalSection").html();
		Grainger.Modals.createAndShowModal("showProductRestrictionModal", "showProductRestrictionModal", data);
	}
	
	
	function fnFilterSelect(thisElement){
		
		if(!thisElement.checked){
			//upon un-selecting applied filter facet
			var jForm =$(thisElement).closest('form');
			jForm.find("input[name=filterName]").prop("disabled", true);
			jForm.find("input[name=filterType]").prop("disabled", true);
			jForm.find("input[name=filterValue]").prop("disabled", true);
		}
		
		$(thisElement).closest('form').submit();
		
	}
	
	function updateCSRFToken() {
		 $.ajax({
				type : "POST",
				url : contextPath+"/getCSRFToken",
				async: true,
				cache: false,
				success : function(data) {
					$("#CSRFToken").val(data);
					$('input[name="CSRFToken"]').val(data);
				}
	     });
		
	}
	
	$(window).bind('beforeunload', function() {
		$("#searchDrawerNavigation form").trigger("reset");
	});
	
	//initialize Google Maps API for Branch Modal
	var initializeGoogleMaps = function(e){
		  if(!googleMapLoaded){
			  
			  // call back for branch modal initialize for user location
			  $.getScript( "https://maps.googleapis.com/maps/api/js?key="+$("#googleApiKey").val()+"&v="+ $("#googleApiVersion").val() +"&libraries=geometry&async=2&callback=branchLocationModal.initCurrentUserLocation")
				.done(function( script, textStatus ) {
					console.log('Google Maps API loaded');
					
			})
		  .fail(function( jqxhr, settings, exception ) {
			console.log('Error loading Google Maps API');
			
		  });
			 googleMapLoaded = true;
		  } else {
			  //find branches for last current location for returning user on modal
			  branchLocationModal.findBranchesByUserLocation();
		  }
			
	 }
	
	var isNotEmptyData = function(data){
		return data!=null &&  !$.isEmptyObject(data);
	 }

  