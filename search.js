//extent the Grainger namespace to contain this code

Grainger = jQuery.extend(Grainger, {

	//search accordion and read more persistence code
	searchAccordionsPersist : {

		//initialize the event listeners for drawers
		init : function() {
			var accordionID = "";

			jQuery("#searchDrawerNavigation .collapse").on("shown", function() {
				accordionID = jQuery(this).attr("ID").split("_");
				setAccordionStates(accordionID[0], 1);
			});

			jQuery("#searchDrawerNavigation .collapse").on("hidden", function() {
				accordionID = jQuery(this).attr("ID").split("_");
				setAccordionStates(accordionID[0], 0);
			});

			//private function to set the accordion state cookie
			function setAccordionStates(accordionID, state) {
				var NAVIGATION_DRAWER_STATE_COOKIE = "nds",
					navDrawers = (jQuery.cookie(NAVIGATION_DRAWER_STATE_COOKIE) || new String()),
				 	pat = "";

			    if (navDrawers.search(accordionID) >= 0) {
			        pat = new RegExp("(" + accordionID + ":)[^,]+");
			        navDrawers = navDrawers.replace(pat, "$1" + state);
			    } else {
			        navDrawers += (navDrawers.length > 0 ? "," : "") + accordionID + ":" + state;
			    }

			    jQuery.cookie(NAVIGATION_DRAWER_STATE_COOKIE, navDrawers, { path: "/", secure: true });
			}
		},

		//public function to read the accordion state cookie
		readAccordionStates : function() {
			var NAVIGATION_DRAWER_STATE_COOKIE = "nds",
				FilterNavStatesObj = (jQuery.cookie(NAVIGATION_DRAWER_STATE_COOKIE) || new String()),
				filterNavItems = {},
				i = 0,
				filterNavCount = 0;

			filterNavItems = FilterNavStatesObj.split(",");
			filterNavCount = filterNavItems.length;

			for (i; i < filterNavCount; i++) {
				var filterNavPairs = filterNavItems[i].split(":");
				if (filterNavPairs[1] == 0) {
					jQuery("#" + filterNavPairs[0]).addClass("collapsed");
					jQuery("#" + filterNavPairs[0] + "_pane").removeClass("in");
				} else if (filterNavPairs[1] == 1) {
					jQuery("#" + filterNavPairs[0]).removeClass("collapsed");
					jQuery("#" + filterNavPairs[0] + "_pane").addClass("in");
				}
			}
		},

		showAllState : function(isShowAllOpen, showAllDrawerID) {
			var NAVIGATION_DRAWER_STATE_COOKIE = "ndsViewAll",
				navDrawers = (jQuery.cookie(NAVIGATION_DRAWER_STATE_COOKIE) || new String()),
				flag = (isShowAllOpen ? "1" : "0"),
				pat = "";

			if (navDrawers.search(showAllDrawerID) >= 0) {
				pat = new RegExp("(" + showAllDrawerID + ":)[^,]+");
				navDrawers = navDrawers.replace(pat, "$1" + flag);
			} else {
				navDrawers += (navDrawers.length > 0 ? "," : "") + showAllDrawerID + ":" + flag;
			}

			jQuery.cookie(NAVIGATION_DRAWER_STATE_COOKIE, navDrawers, { path: "/", secure: true });
		},

		readShowAllStates : function(){
			var NAVIGATION_DRAWER_STATE_COOKIE = "ndsViewAll",
				ShowAllStatesObj = (jQuery.cookie(NAVIGATION_DRAWER_STATE_COOKIE) || new String()),
				ShowAllItems = {},
				i = 0,
				showAllNavCount = 0;

			ShowAllItems = ShowAllStatesObj.split(",");
			showAllNavCount = ShowAllItems.length;

			for (i; i < showAllNavCount; i++) {
				var showAllNavPairs = ShowAllItems[i].split(":");
				if (showAllNavPairs[1] == 0) {
					return true; //do nothing
				} else if (showAllNavPairs[1] == 1) {
					jQuery("#" + showAllNavPairs[0] + "-showLink").click(); //simulate a click on the show all link
				}
			}
		},

		readShowChildTable : function(){
			var SHOW_CHILD_TABLE_COOKIE = "ndsShowChildTable";
			var	showChildTableID = jQuery.cookie(SHOW_CHILD_TABLE_COOKIE);
			if (typeof(showChildTableID) != 'undefined' && jQuery("#href"+showChildTableID).length > 0) {
				jQuery("#href" + showChildTableID).click(); //simulate a click on the show all link
			}
		}
	}
});

/*
 * Ajax call to fetch the pricing for parents.
 * TODO: The response needs to be processed once Mid tier parent pricing is done
 */
function fetchParentPricing() {

	if (!jQuery("#allParentTokens").val()) {
		return;
	}

	var url = "/search/searchParentPricing";

	jQuery.ajax({
    	url: url,
    	type: 'POST',
    	cache: false,
    	data: {
            'allParentTokens': jQuery('#allParentTokens').val(),
            'timeoutValue': jQuery("#parentTimeout").val(),
            'delayValue': jQuery("#parentDelay").val()
        },
    	success: function(data) {
    		if(data) {
    			var newData = jQuery.parseJSON(data),
    				dataPricing = newData.pricingSummary,
                    i = 0,
                    priceObjectLength = dataPricing.length;

    			for(i; i < priceObjectLength; i++) {
    				if( dataPricing[i].jobStatus === 'COMPLETED' ) {
    					productId = '#productPrice_' + dataPricing[i].groupItemNumber;

   						if(dataPricing[i].lowestPrice !== dataPricing[i].highestPrice) {
   							jQuery(productId).html('<span class=\"price\">' + dataPricing[i].lowestPrice + ' - ' + dataPricing[i].highestPrice + '</span>');
   						} else {
   							jQuery(productId).html('<span class=\"price\">' + dataPricing[i].lowestPrice + '</span>');
   						}
    				}
    			}

    		}
    	},
    	error: function(data) {
    	},
    	complete: function() {
    		jQuery('#resultsView .loadingGif').remove();
    	}
    });

}

function showSummary(toggleEle) {
	var title = toggleEle.id + "-sub";
	var summaryEle = jQuery('#' + title);
	if (summaryEle){
		if(toggleEle.open) {
			summaryEle.addClass("hide").removeClass("show");
		}
		else {
			summaryEle.addClass("show").removeClass("hide");
		}
	}
}

function changePageSize(pageSize)
{
	
	$('#pagesize').val(pageSize);
	$('#pageSizeForm').submit();
}



// Add something useful here
var navFragment = {

    updateFromHash: true,

    updateMessage: "Please wait",

    baseNavContext: (window.location.pathname + window.location.search),

    hashChangeHandler: function(fragment) {
        if (this.updateFromHash) {
            var fragObj = fragment;
            if (fragObj) {
            	updateNavigation(fragObj.nav, this.updateMessage, false, '', ''); 
            }

            // Reload the base search context if the hash was cleared but only if it's not set to an empty
            // hash fragment, e.g. # only
            if (fragment.length == 0 && dojo.doc.location.href.indexOf("#") == -1) {
            	updateNavigation(this.baseNavContext, this.updateMessage, false, '', '');
            }
        }

        // Reset state after each call to support browser back / forward handling
        this.updateFromHash = true;
    },

    readyHandler: function() {
        // Page was loaded with a fragment
        var fragObj = jQuery.parseParams(window.location.hash.split('#')[1]);
        if (fragObj.nav) {
        	updateNavigation(decodeURIComponent(fragObj.nav), navFragment.updateMessage, false, '', ''); 
        }
    }
};
jQuery(function() {
	navFragment.readyHandler();
})

function addToCompareBox(checkbox,style,productCode, url, shortdesc) {	
	var checkboxId = checkbox.id;
	var checkboxLabel = jQuery("#" + checkboxId).next();

	if(checkbox.checked == false){
		deleteFromCompareBox(productCode);

		checkboxLabel.addClass('no-button');
		checkboxLabel.removeClass('button');
	}else{
		checkboxLabel.addClass('button');
		checkboxLabel.removeClass('no-button');
	
	var nodelist = jQuery('#carouselscrollHeader div[class=carouselscrollbox thumbnail]');
	if(nodelist.length == 5){
		jQuery("#" + checkboxId).attr("checked", false);
		alert('You have selected too many items to compare, please select up to 5 items.');
		
	}else{
		jQuery.ajax({
			type: "POST",
			url: "/CompareProductCarouselController?addToComparebox=true&productCode=" +productCode+"&url="+url+"&shortdesc="+encodeURIComponent(shortdesc)+"&fieldId="+productCode,
			dataType: "text",
			success: function(data){
				if(data == null || data == ""){
					setTimeout("location.reload(true);",500);
				}else{
					jQuery("#compareCarouselHeader").html(data);
					refreshFooter();
					
				}
			}
		});
	
}}}

function refreshFooter(){
	jQuery.ajax({
			type: "POST",
			url: "/CompareProductCarouselController?refreshFooter=true",
			dataType: "text",
			success: function(data){
				if(data == null || data == ""){
					setTimeout("location.reload(true);",500);
				}else{
					jQuery("#compareCarouselFooter").html(data);
					//dojo.require("grainger.carouselComponent"); - don't know what to replace this with with jQuery
					/*intCarousel only accepts one param, so intCarousel('uniqueHeader','uniqueFooter'); had the footer ignored   */
					intCarousel('uniqueHeader');
					intCarousel('uniqueFooter');
					
				}
			}
		});
	}

function deleteFromCompareBox(fieldId) {
	var checkboxId = "cb2" + fieldId;
	if(jQuery("#" + checkboxId).length > 0){
		jQuery("#" + checkboxId).attr("checked", false);
	}else {
		checkboxId = "gridcb" + fieldId;
		if(jQuery("#" + checkboxId).length > 0){
			jQuery("#" + checkboxId).attr("checked", false);
		}
	}
	jQuery.ajax({
			type: "POST",
			url: "/CompareProductCarouselController?deleteFromComparebox=true&fieldId="+fieldId,
			dataType: "text",
			success: function(data){
				if(data == null || data == ""){
					setTimeout("location.reload(true);",500);
				}else{
					jQuery("#compareCarouselHeader").html(data);
					refreshFooter();
					
				}
			}
	});
} 

function refreshAll(){
	if(jQuery("#compareCarouselHeader").length > 0)
	{
		jQuery.ajax({
				type: "POST",
				url: "/CompareProductCarouselController?refreshHeader=true",
				dataType: "text",
				success: function(data){
					if(data == null || data == ""){
						setTimeout("location.reload(true);",500);
					}else{
						jQuery("compareCarouselHeader").html(data);
						refreshFooter();
						
					}
				}
		});
	}
}

function setUrlPagination(element, perPage, requestedPage, paginationUrl) {

	  var params = "perPage=" + encodeURIComponent(perPage) + "&" + "requestedPage=" + encodeURIComponent(requestedPage);
	  var PAGENO_VIEW_COOKIE = "pnv";
	  var currentCookie = (jQuery.cookie(PAGENO_VIEW_COOKIE) || new String());
	
	  if (perPage != currentCookie){
	  //cookie is empty or equal to otherView so update it
	  jQuery.cookie(PAGENO_VIEW_COOKIE, perPage, { path: "/", expires: 1825, secure: true });
	   }

      if (paginationUrl.indexOf("?") != -1) {
          paginationUrl += "&" + params;
      } else {
          paginationUrl += "?" + params;
      }

      jQuery(element).attr("href",paginationUrl);
}

function putSearchUrlForCompare(){
	var currentUrl = document.location.href;
	currentUrl = currentUrl.replace("#","");
	var i = 0;
	var parameters = "";
	var hiddenfields = jQuery("#compareProductsFormHeader input[type=\"hidden\"]");

	for(i = 0;i<hiddenfields.length;i++){
		var field  = hiddenfields[i];
		if(field.value != "currentSearchUrl" && field.value != "" && field.getAttribute('id').indexOf('compareHeader') == -1  && field.getAttribute('id').indexOf('compareFooter') == -1){
			if(parameters == ""){
				var value = field.getAttribute('value');
				if(field.getAttribute('id') == "Ntt"){
					var nttValue = field.value;
					if(nttValue.indexOf('|') != -1){
						var lastIndex = nttValue.lastIndexOf("|");
						value = nttValue.substring(0,lastIndex);
					}
				}
				parameters = "?" + field.getAttribute('id') + "=" + value;
			}else{
				var value = field.getAttribute('value');
				if(field.getAttribute('id') == "Ntt"){
					var nttValue = field.value;
					if(nttValue.indexOf('|') != -1){
						var lastIndex = nttValue.lastIndexOf("|");
						value = nttValue.substring(0,lastIndex);
					}
				}
				parameters = parameters + "&" + field.getAttribute('id') + "=" + value;
			}
			if(field.getAttribute('id') == "Ntt"){
				var nttValue = field.value;
				if(nttValue.indexOf('|') != -1){
					var lastIndex = nttValue.lastIndexOf("|");
					var refineSearch = nttValue.substring(lastIndex+1,nttValue.length);
					parameters = parameters + "&refineSearchString" + "=" + refineSearch;
				}
			}
		}
	}
	if(parameters != ""){
		currentUrl = currentUrl + parameters;
	}
	jQuery("#currentSearchUrlHeader").val(currentUrl);
	jQuery("#currentSearchUrlFooter").val(currentUrl);
	return true;
}

//support for multi-select
var updateNavigation = function(selectedInput, standbyText, updateHash, filterType, filterValue) {
    updateHash = (updateHash != undefined ? updateHash : true);

    Grainger.Modals.waitModal(standbyText, standbyText);

    // sure let's just ajax in an entire page, what could go wrong...
	jQuery.ajax({
		url: contextPath + selectedInput,
		cache: false,
        type: 'GET',
        dataType: 'html',
		success: function(data){

            //rebind lazy load of images after ajax call and repaint
            jQuery(".s7LazyLoad").unveil();

            //some dynamic mbox implementation for search results
            if (typeof Grainger.mboxEnabled !== "undefined") {
                mboxUpdate("hybris_searchresults_mbox");
            }

			if(data != null) {
				page_variables.SEARCH_TERMS=search_variables.SEARCH_TERMS;
				//this will fire an event that bright tag will look for (once configured)
				try {
                    jQuery("body").trigger("grainger.search.refine", {FilterType:filterType, FilterValue:filterValue});
				} catch (err) {
					console.log("Error publishing the event for Bright Tag");
				}

                Grainger.Modals.killModal();

                // replace the outmost wrapper div with new content
                // filter data response since it's the entire page...
                // using innerHTML so it does not execute the heaps of script elements
                document.getElementById('container').innerHTML = jQuery(data).find('#container').html();

				//rebind unveil for unloaded images
				jQuery(".s7LazyLoad").unveil();

				// next 3 lines are inherited methods from refactor...
                jQuery(document).trigger('navigation_update',[jQuery('#body-main')]);

                if (updateHash) {
                    navFragment.updateFromHash = false;
                    window.location.hash = jQuery("#navFragmentUrl").html();
                }
			}


			//refire the accordion states
			Grainger.searchAccordionsPersist.init();
			Grainger.searchAccordionsPersist.readAccordionStates();
			Grainger.searchAccordionsPersist.readShowAllStates();
			Grainger.searchAccordionsPersist.readShowChildTable();

			if (Grainger.helper.UserHelper.isLoggedIn() || ( Grainger.midTierPricing && Grainger.midTierPricing() ) ) {
				fetchParentPricing();
			}

			jQuery('#resultsView .showDesc').on('click', function() {
				showDesc(this);
			});

			handleSelectionGuideWidget();

			if(data != null) {
				//intCarousel("pagebuildercarousel"); /* this method errrors out, let us find out what this does exactly...*/
			}
		},
		error: function(error){
            Grainger.Modals.killModal();
		}
    });
};

function handleSelectionGuideWidget() {
	
	try {
		
		/*
		 * The IGO script is rendered on the page after the ajax response but is not registered as a script
		 * The script attributes are copied and a new script element is created and appended to tbe body
		 */
		if (document.getElementById('igd_gst')) {
			var src = jQuery('#igd_js').attr('src');
			var id = jQuery('#igd_js').attr('id');
			var type = jQuery('#igd_js').attr('type');
			
			jQuery('#igd_js').remove();
			
			var scriptTag = document.createElement('script');
			scriptTag.type = type;
			scriptTag.src = src;
			scriptTag.id = id;
		    
		    document.body.appendChild(scriptTag);
		    
		}
	
	} catch(err) {
		console.log("Error appending selection guide script");
		// Log and ignore
	}
}

//moved to application.js toggleShowAll
function setViewPreference(view){
	// Do nothing if user clicks on active layout
	if( jQuery('#resultsView').hasClass(view) ){
		return;
	}

	
	url_override = "/search/" + view;
	//page_variables.CurrentURL=url_override;

    var PREFERRED_VIEW_COOKIE = "pv";
    var currentCookie = (jQuery.cookie(PREFERRED_VIEW_COOKIE) || new String());

	if (view != currentCookie){
		//cookie is empty or equal to otherView so update it
		jQuery.cookie(PREFERRED_VIEW_COOKIE, view, { path: "/", expires: 1825, secure: true  });
	}

	switch(view) {
		case "grid":
			jQuery('#resultsView').addClass('grid').removeClass('list');
			jQuery('.gridOrList').addClass('showGrid').removeClass('showList');

			//LOS-5458: do not display child long description and only disply
			//default wp long description, when toggled to the gridView
			jQuery('.wpLongDesc').addClass('hidden');
			jQuery('.defaultWpLongDesc').removeClass('hidden');
			break;

		case "list":
			jQuery('#resultsView').addClass('list').removeClass('grid');
			jQuery('.gridOrList').addClass('showList').removeClass('showGrid');
			
			//LOS-5458: do display parent or child long description when toggled to the listView
			jQuery('.wpLongDesc').removeClass('hidden');
			jQuery('.defaultWpLongDesc').addClass('hidden');
			break;

		default:
			break;
	}

}

function readViewPreference() {
	var PREFERRED_VIEW_COOKIE = "pv",
		view = (jQuery.cookie(PREFERRED_VIEW_COOKIE) || new String());

	switch(view) {
		case "grid":
			jQuery('#resultsView').addClass('grid').removeClass('list');
			jQuery('.gridOrList').addClass('showGrid').removeClass('showList');
			
			//LOS-5458: do not display parent or child long description when 'backbutton' to the gridView
			jQuery('.wpLongDesc').addClass('hidden');
			jQuery('.defaultWpLongDesc').removeClass('hidden');
			break;

		case "list":
			jQuery('#resultsView').addClass('list').removeClass('grid');
			jQuery('.gridOrList').addClass('showList').removeClass('showGrid');

			//LOS-5458: do display parent or child long description when 'backbutton' to the listView
			jQuery('.wpLongDesc').removeClass('hidden');
			jQuery('.defaultWpLongDesc').addClass('hidden');
			break;

		default:
			break;
	}
}

function submitPPSearchRequest(isLoggedIn,alertMessage) {

	var currentPageURL = unescape(window.location.href);

	if( isLoggedIn ) {
		document.forms.previouslyPurchasedForm.submit();
	} else {
		document.forms.previouslyPurchasedForm.previouslyPurchasedChbx.checked=false;
		var frwdUrlPath = currentPageURL.substring(currentPageURL.indexOf('/category'));

        var data = '<div class="modal-content"><p class="alert alert-block error">' + alertMessage + '</p></div>'
        + '<form id="prevPurchasedSignIn" name="signIn" method="get" action="/myaccount/signin" style="display: inline;"><input id="frwdUrlPath" type="hidden" name="frwdUrlPath" value="'+ frwdUrlPath +'" /></form>'
        + '<div class="modal-footer"><a href="#" class="cancel">Close</a></div>';

        Grainger.Modals.createAndShowModal(null, null, data);

		jQuery('#prevPurchasedSignInLink').on('click',function(){
			jQuery("#prevPurchasedSignIn").submit();
		});
	}
}

function updateSortDropdown(el) {
	var form = jQuery(el).closest('form');
	form.submit();
}

function showSKUPreview(hrefObj, skuPreviewID) {
	jQuery('#' + skuPreviewID).toggle();

	if (jQuery('#' + skuPreviewID).is(':visible')) {
		jQuery(hrefObj).addClass('collapse').removeClass('expand');
	} else {
		jQuery(hrefObj).addClass('expand').removeClass('collapse');
	}

	//rebind unveil for unloaded images
	jQuery('.s7LazyLoad').unveil();

}

function showDisclaimerDlg(){
    var url = "/ItemDetailRightComponentController?showDisclaimer";

    Grainger.Modals.waitModal("showDisclaimerDlg", "showDisclaimerDlg");

    jQuery.ajax({
        url: url,
        cache: false,
        success: function(data) {
            Grainger.Modals.createAndShowModal("showDisclaimerDlg", "showDisclaimerDlg", data);
        },
        error: function() {
            Grainger.Modals.killModal();
        }
    });
}

/**
 * changes for displaying child grid in search screen
 */
var currentOpenParent;
function showChildGrid(hrefObj, childGridWrapperID, parentDetailChildrenID, productUrlRoot, productCode)
{
	var childGridObj = jQuery('#'+childGridWrapperID),
		productPos = '';

	var SHOW_CHILD_TABLE_COOKIE = "ndsShowChildTable",
		SHOW_MINI_CIDP_COOKIE = "ndsShowMiniCidp",
		childTableCookieValue = jQuery.cookie(SHOW_CHILD_TABLE_COOKIE),
		miniCidpCookieValue = jQuery.cookie(SHOW_MINI_CIDP_COOKIE);

	if(childGridObj.is(':visible')) {
		childGridObj.hide();
		jQuery(hrefObj).removeClass('collapse');
		jQuery(hrefObj).addClass('expand');
		jQuery.cookie(SHOW_CHILD_TABLE_COOKIE, childTableCookieValue, { expires: -1, path: "/", secure: true });
		jQuery.cookie(SHOW_MINI_CIDP_COOKIE, miniCidpCookieValue, { expires: -1, path: "/", secure: true });
	} else {
		// Check if the child grid is already populated
		// and fire ajax call only if the child grid is empty.
		if( !jQuery.trim( jQuery('#'+parentDetailChildrenID).html() ).length) {
			closePrevChildGrid();
			// get the parent item selector
			productPos = jQuery(hrefObj).parents('.product')
			//fire the ajax call to update the grid
			updateChildGrid('Finding Matching Items', productUrlRoot, parentDetailChildrenID, productPos);
			currentOpenParent = productCode;
		}
		childGridObj.show();
		jQuery(hrefObj).removeClass('expand');
		jQuery(hrefObj).addClass('collapse');
		jQuery.cookie(SHOW_CHILD_TABLE_COOKIE, productCode, { path: "/", secure: true });

		if (typeof(childTableCookieValue) != 'undefined'
			&& childTableCookieValue.length > 0
			&& childTableCookieValue != productCode) {
			jQuery.cookie(SHOW_MINI_CIDP_COOKIE, miniCidpCookieValue, { expires: -1, path: "/",secure: true });
		}

	}
}

function closePrevChildGrid() {
	if(currentOpenParent) {
		jQuery('#parentDetailChildren'+currentOpenParent).html("");
		jQuery('#childGridWrapper'+currentOpenParent).hide();
		jQuery('#href'+currentOpenParent).removeClass('collapse');
		jQuery('#href'+currentOpenParent).addClass('expand');
	}
}

/**
 * Ajax call fetches the whole parent IDP
 * Pick only the child grid fragment and replace it in the search screen
 * The view all product link needs to be set here because it will
 * not be available in the parent IDP flow from search screen.
 * The number of children per page is set to 10 in the ajax request.
 * SHOP-2172 Added argument productPos as the parent item selector.
 */
function updateChildGrid(standbyText, productUrlRoot, parentDetailChildrenID, productPos) {

    Grainger.Modals.waitModal('standbyModal', standbyText);

	var url = productUrlRoot+"&isSearchPage=true",
		productChildren = jQuery('#'+parentDetailChildrenID);

    jQuery.ajax({
    	url: url,
    	type: 'GET',
    	cache: false,
    	success: function(data) {
    		if(data) {
    			productChildren.html(jQuery(data).find('#parentDetailChildren').html());

    			jQuery(document).trigger('search_childgrid_loaded',[productChildren]);

    			var SHOW_MINI_CIDP_COOKIE = "ndsShowMiniCidp",
    				showMiniCidpStr = (jQuery.cookie(SHOW_MINI_CIDP_COOKIE) || new String()),
    			    showAllItems = {};
    			if (showMiniCidpStr.length > 0) {
    				showAllItems = showMiniCidpStr.split(",");
    				var childPreview, row, link;
	    			for (var i = 0; i < showAllItems.length; i++) {
	    				childPreview = jQuery(productChildren).find('#'+ showAllItems[i]);
	    				row = jQuery(childPreview).closest('tr').prev('tr');
	    				link = row.children('td:first').children('a:first');
	    				childPreview.show();
	    				jQuery(link).addClass('collapse');
	    				row.addClass('expanded');
	    				//rebind unveil for unloaded images
	    				jQuery('.s7LazyLoad').unveil();
	    			}
    			}
    			// Bind the qty boxes and the add to cart/list buttons in the new grid
    			// And clear the product array that may contain items from the previous grid
    			bindParentQtyChange(parentDetailChildrenID, true);
    			jQuery("a#ViewAllProdLink").attr('href', productUrlRoot);
    		}

    		//epro - remove columns which don't fit - only fire on epro and when the screen is small
    		if (jQuery("#body-main").hasClass("eProSite") && jQuery('html').width() < 775) {
	    		jQuery(productChildren).find("tr").each(function(){
	    			jQuery(this).children(".childTableSpec:gt(2)").hide();
	    		});
	    	}

    		//SHOP-2172 scroll to the top of the parent item
			jQuery('html, body').animate({
				scrollTop : productPos.offset().top
			}, 100);

			Grainger.Modals.killModal();
    	},
    	error: function(data) {
    		alert(error);
    	}
    });
}

// Subscribe to the hash change and page ready events for search navigation context reloading
jQuery(window).bind("hashchange", function() {
	navFragment.hashChangeHandler
});

function handleSGResponse(result) {
	var sgAttributes = '';
	jQuery.each(result.attributes, function(i, item) {
	    sgAttributes = sgAttributes + item.attribute + ":" + item.value + "|";
	});
	sgAttributes = sgAttributes.slice(0,-1)

	var customSearchURL = "/search?searchSKUs="+result.products+"&source="+encodeURIComponent(result.source)+"&sgAttributes="+sgAttributes;

	window.location.assign(customSearchURL);
}

function showDesc(el) {
	var elem = jQuery(el),
		truncDesc = elem.closest('.tLD'),
		longDesc = truncDesc.siblings('.LD');

	longDesc.toggleClass('hidden');
	truncDesc.toggleClass('hidden');
}


/* DOCUMENT READY */

jQuery(document).ready(function() { 
	updateCSRFToken();
	//bind event listeners to accordions and read states of accordions
	Grainger.searchAccordionsPersist.init();
	Grainger.searchAccordionsPersist.readAccordionStates();
	Grainger.searchAccordionsPersist.readShowAllStates();
	Grainger.searchAccordionsPersist.readShowChildTable();

	if (typeof populateTieredSearchCategories !== "undefined") {
		populateTieredSearchCategories();
	}
	
	//persist the view too on click of the back button
	readViewPreference();
	if (Grainger.helper.UserHelper.isLoggedIn() || ( Grainger.midTierPricing && Grainger.midTierPricing() ) ) {
		fetchParentPricing();
	}

	jQuery('.shortDescLess').hide();
	jQuery('.shortDescMore').click(function() {
		jQuery(this).hide();
		jQuery(this).siblings('.longDesc').find('.tLD').removeClass('hidden');
		jQuery(this).siblings('.longDesc').find('.LD').addClass('hidden');
		jQuery(this).siblings('.shortDescLess').show();
	});
	jQuery('.shortDescLess').click(function() {
		jQuery(this).hide();
		jQuery(this).siblings('.longDesc').find('.tLD').addClass('hidden');
		jQuery(this).siblings('.longDesc').find('.LD').removeClass('hidden');
		jQuery(this).siblings('.shortDescMore').show();
	});

	jQuery('.prdDesc').each(function(index, currentElement) {
	   var content = jQuery(currentElement).find('.longDesc').find('.LD').text();
	   var contentLen = content.length;
	   if(contentLen < 235)		// 116 before Tiered Search
	   {
		   jQuery(currentElement).find('.shortDescMore').addClass('hide');
		   jQuery(currentElement).find('.shortDescLess').addClass('hide');
	   }
	   else
	   {
		   jQuery(currentElement).find('.longDesc').find('.LD').text($(this).text().substr(0,235)+'...');	// 123 before Tiered Search
		   jQuery(currentElement).find('.shortDescMore').removeClass('hide');
		   jQuery(currentElement).find('.shortDescLess').removeClass('hide');
	   }
	});

	jQuery('#resultsView .showDesc').on('click',function() {
		showDesc(this);
	});
	
	if(typeof page_variables != 'undefined' && page_variables.SEARCH_TERMS){
		page_variables.SEARCH_TERMS.RedirectedTerm = getSearchParameter( 'redirect' );
	}
});

//support for multi-select
var updateTierSearchNavigation = function(selectedInput) {

    jQuery.ajax({
        url: contextPath + selectedInput,
        cache: false,
        type: 'GET',
        success: function(data){
	
		if(data != null) {

                // replace the outmost wrapper div with new content
                // filter data response since it's the entire page...
                // using innerHTML so it does not execute the heaps of script elements
                document.getElementById('container').innerHTML = jQuery(data).find('#container').html();

		populateTieredSearchCategories();

		}
	},
	error: function(error){
            console.log("Error");
	}
    
    });
};

