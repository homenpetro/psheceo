/*********************************************
* @File: eQuotes.js     **********************
* @Description: functionality for eQuotes    *
* on hybris platform. Code is in new     *****
* Grainger namespace and all eQuotes    ******
* code then is in eQuotes public      ********
* method. ************************************
* Only public method is eQuotes. All      ****
* others private to the namespace. ***********
* @jQuery refactor from do jo. ****************
*********************************************/

/* I want to use the $ as an alias for jQuery in no-conflict mode, so pass it as an argument in an immediate function...around EVERYTHING. */
(function($){

Grainger = $.extend(Grainger, {
/* eQuotes code, namespace is 'eQuotes' */
	eQuotes: function () {
		
		var UP_ARROW_KEY = 38,
			DOWN_ARROW_KEY = 40,
			linkBottomMargin = 100,
			linkTopCutOffPoint = 450,
		    linkBottomCutOffPoint = $("#container").offset().top + $("#container").outerHeight() - linkBottomMargin;

		/* singleton to init event handlers for equotes */
		(function () {
			/* Toggle the equotes with trigger */
			$(window).on("scroll", function () {		
				
				showHideLink();
				fixPositionLink();				
				
			});		
			
			$("body").on("click", '.eQuoteItemRow', function (e) {	
				
				showHideEquoteModal(e);
				
			});	
			
			$("body").on("keydown", function (e) {	
				
				navShowHideEquoteModal(e);
			   
			});
			
			if ($('#eQuoteItemFirstItemList').length > 0) {
				populateQuoteItemModalData($("#eQuoteItemFirstItemList"));
			}			
	 
		}()); /* run the initializations as an immediate function when Grainger.eQuotes(); is called in this file on docready (eof) */

		/* When a user clicks on a row that contains the class 'eQuoteItemData', the modal appears (not all columns contain this class).  
		 * When a user clicks on a different row, the modal changes to match the appropriate row.  
		 * If the user clicks anywhere on the page, as long as it's not the modal or the row, it will close. */		
		function showHideEquoteModal(e) {
			var parentNode,
				itemID;
			
			if ($(e.target).closest(".eQuoteItemSelected").hasClass('eQuoteItemSelected')) {
				// Catch all items that have eQuoteItemSelected as a parent class and do nothing.
			} else if ( $(e.target).closest(".eQuoteItemData").hasClass('eQuoteItemData') ) {
				$("#eQuotesItemList .eQuoteItemRow").removeClass("eQuoteItemSelected");				
				parentNode = $(e.target).closest(".eQuoteItemData").parent();		
				parentNode.addClass("eQuoteItemSelected");		
				populateQuoteItemModalData(parentNode);
				 
			} 
		}
		
		function navShowHideEquoteModal(e) {
			
			var keyCode = e.keyCode || e.which,
		        currRow = $("#eQuotesItemList .eQuoteItemSelected"),
		    	nextRow = 0;
		 
		    if (keyCode == UP_ARROW_KEY) { 
		    	nextRow = $("#eQuotesItemList .eQuoteItemSelected").prev("tr");
		    }
		 
		    if (keyCode == DOWN_ARROW_KEY) { 			    	
		    	nextRow = $("#eQuotesItemList .eQuoteItemSelected").next("tr");
		    }
		    
		    if (nextRow.length > 0 && nextRow.attr('tabindex')) {			   
		    	currRow.removeClass("eQuoteItemSelected");
		    	nextRow.addClass("eQuoteItemSelected");
		    	populateQuoteItemModalData(nextRow);
			}
		    
		}
				
		/* private functions to Grainger.eQuotes namespace */
		function showHideLink() {
			
			   if ($(window).scrollTop() > linkTopCutOffPoint) {			 
					$("#backToToplink").removeClass("hidden");
				} else {
					$("#backToToplink").addClass("hidden");
				}   		
			   
		}
		
		function fixPositionLink() {
			
			scrollFromBottom = $(window).height() + $(window).scrollTop(); 			 
            if ( scrollFromBottom > linkBottomCutOffPoint ) {	
            	$("#backToToplink").removeClass("backToToplinkFixed");				
			} else {
				$("#backToToplink").addClass("backToToplinkFixed");
			}			
			
		}
		
		function populateQuoteItemModalData(quoteRowElement) {

			var urlLink, quoteID;

			urlLink = quoteRowElement.attr("data-link");
			if (typeof urlLink === 'undefined' || urlLink === false) {
				urlLink = contextPath+ "/my-account/quoteItemsModal?quoteId=";
			}
			quoteID = quoteRowElement.attr("rel");
            $thisRow = quoteRowElement
			// get size of table
			var quotetable = $("#eQuotesItemList"),
				quotetableHeight = quotetable.height(),
				quotetableFromTop = quotetable.scrollTop();
			
			jQuery.ajax({
				url: urlLink + quoteID,
				async: false,
				type: "GET",
				contentType: "application/html",
				dataType: "html",
				success: function(response) {
					if (typeof(response) != "undefined" && response != null) {				
						$("#quoteItemModalDisplay_"+quoteID).html(response);

                        // jank jank jank jank, but so is the markup
                        // screen dection, set to bottom if the bottom goes under the table
                        // if there is a JS error occuring, it is probably here :P
                        if( ($("#eQuotesItemList").height() - $thisRow.position().top + $thisRow.height()) < ($("#quoteItemModalDisplay_"+quoteID).parentsUntil('.eQuoteModal').parent().height()) ) {
                            $(".eQuoteModal").css({
                                "bottom": $("#eQuotesItemList tfoot").height(),
                                "top": "auto"
                            });
                        } else {
                            $(".eQuoteModal").css({
                                "top": $thisRow.position().top - $("#quoteItemModalDisplay_"+quoteID).parentsUntil('.eQuoteModal').siblings('.eQuoteDetailsHeader').height(),
                                "bottom": "auto"
                            });
                        }
                        var noOfSedenaItems=parseInt($("#noOfNomSedenaItems"+quoteID).val()),
                        noOfDgDvItems=parseInt($("#noOfDgDvItems"+quoteID).val()),
                        totalProducts=parseInt($("#totalProducts"+quoteID).val());
                        
                        if(noOfSedenaItems == totalProducts || ((noOfSedenaItems + noOfDgDvItems) == totalProducts)) {
                        	$("#addQuoteToList"+quoteID).addClass('disabled');
                        }
                        if(noOfDgDvItems == totalProducts) {
                        	$("#addQuoteToList"+quoteID).addClass('hide');
                        }
					}
				},
				error: function(error) {
					
				}
			
			});			
				

		}

	}

});


/* on doc ready, initialize the equotes */
$(function () {
/* run equotes init code */
	if ($('#equotesTab').length > 0) {
		Grainger.eQuotes();
	}
});

/* end define $ as jquery in immediate function */
}(jQuery));

