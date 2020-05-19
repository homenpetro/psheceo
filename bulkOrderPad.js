/*********************************************
* @File: bulkOrderPad.js**********************
* @Description: functionality for bulk order *
* pad on hybris platform. Code is in new *****
* Grainger namespace and all bulk order ******
* code then is in bulkOrderPad public ********
* method. ************************************
* Only public method is bulkOrderPad. All ****
* others private to the namespace. ***********
*********************************************/

$(document).ready(function (){

	$('#showCopyPasteLink').click(function(){

	showWindowdiv('bulkCopyPasteAdd');

	$("#showSeparateLabelText").toggleClass("hide");

	$("#showCopyPasteLabelText").toggleClass("hide");

	$("#currentTab").val("copyPaste");

	return false;

	});

	$('#showSeparateLink').click(function(){
		showWindowdiv('bulkSeperateAdd');
		$("#showSeparateLabelText").toggleClass("hide");
		$("#showCopyPasteLabelText").toggleClass("hide");
		$("#currentTab").val("lineByLine");
		return false;
	});

	$('#bulkOrderModelAddToCart').click(function() {
		bulkAddItemsToCart();
	});

	$('#bulk-order .dropdown').click(function() {
		$('#searchHistory, #autoComplete').addClass('hide');
	});


});

function bulkAddItemsToCart() {
	if(jQuery("#currentTab").val() == "lineByLine"){
		bulkAddItemsLineByLine();
	}else{
		bulkAddItemsCopyPaste();
	}
}
function showWindowdiv (divName) {
	var bulkAddSingle = $("#bulkSeperateAdd"),
		bulkAddMultiple = $("#bulkCopyPasteAdd");

	bulkAddSingle.addClass("hide");
	bulkAddMultiple.addClass("hide");

	$("#"+divName).removeClass("hide");

	if($("#isPendingOrder").val() == 'true'){
		/* toggle the copy-paste and separate line input buttons */
		$("#bulk-order .modal-footer label").toggle();
	}

}

function bulkAddItemsLineByLine() {
	var productCodes = new Array();
	var prodQtyEntries = [];
	var prodcode;
	var isErr = false;
	var sessionTokenVal = $("#showMoreFieldsForm input[name=_requestConfirmationToken]").val();
	$("input:text[name=productItemNumber]").each(function(){
	   productCodes.push($(this).val());
	});
	var i =0;
	$("input:text[name=productQuantity]").each(function(index){

		if(jQuery.trim(productCodes[index]) !== ''){
			var prodQtyLine = {};
			prodQtyLine.code = productCodes[index];
			if(jQuery.trim($(this).val()) == ''){
				$(this).val(1);
			}

			else if(isNaN(jQuery.trim($(this).val())) || jQuery.trim($(this).val()) ==0){
				isErr= true;
				}
			else if(!isNaN(jQuery.trim($(this).val())) && jQuery.trim($(this).val()) % 1 != 0){
				 isErr= true;
				 return false;
			   }
			else{
				if(!isNaN(jQuery.trim($(this).val())) && jQuery.trim($(this).val()) <0){
					isErr= true;
				}
			}
			prodQtyLine.quantity = $(this).val();
			prodQtyEntries[i++]=prodQtyLine;
			prodcode = prodQtyLine.code;
		}
	});

	$('#pageZone').val('');
	if(isErr){
		jQuery("#errorDivDropDownLineAdd").removeClass("hide");
	}
	if(prodQtyEntries.length>0 && !isErr){
		jQuery("#errorDivDropDownLineAdd").addClass("hide");
		var posturl = contextPath+"/view/BulkOrderComponentController/bulkAddItems?_requestConfirmationToken="+sessionTokenVal;
		Grainger.Modals.waitModal("bulkorderadd", "bulkorderadd");
		jQuery.ajax({
			url: posturl,
			type: "POST",
			cache: false,
			data: JSON.stringify(prodQtyEntries),
			success: function (data) {
					try {
						$("#bulk-order .bulk-order-content").addClass("hide");
						if(pdfContainer != null){
							pdfContainer.removeClass("move-pdf-down");
						}
					} catch(err) {
						console.log("Error in bulk-order");
					}

					/* set global val to data returned */
					bulkOrderAddVal = data;
					/* add the item to the cart */
					intelligentOfferAddtoCart(prodcode);
					$('#pageZone').val('BOP');
					/* then pop the dialog window */
					Grainger.Modals.createAndShowModal("bulkorderadd", "bulkorderadd", data);
					$("input:text[name=productItemNumber]").each(function(){
						   $(this).val('');
						});

					$("#bulk-order .bulk-order-content").addClass("hide");
					if(typeof pdfContainer !== 'undefined' && pdfContainer != null){
						pdfContainer.removeClass("move-pdf-down");
					}
					$('#bulkSeperateAdd .table').addClass("hide");
					$("#sub-total-text").addClass("hide");
					$("#add-to-list").addClass("hide");
					$("#bulkError").addClass("hide");
					$("#countForBulkOrderPad").attr("value",0);
					$(".s7LazyLoad").unveil();
			},
			error: function (xhr,error) {
				if(xhr.status==401||xhr.status==404){
					document.location.href='/login?frwdUrlPath="/"';
				}
				else if(xhr.status==403){
					window.location.reload();
				}
				else{
				$("#bulk-order-content").html(error);
				Grainger.Modals.killModal();
				}
			}
		});
	}
}

function bulkAddItemsCopyPaste() {

	var copyPasteText  = $("#modal-bulkCopyPasteArea");
	if(copyPasteText.val()!='')
		{
	if(jQuery.trim(copyPasteText) !== ''){
		$("#errorDiv").addClass("hide");
		var posturl = contextPath+"/view/BulkOrderComponentController/bulkAddCopyPasteItems";

		var bulkOrderCopyPasteSer = $("#bulkCopyPasteCreate").serialize();
		$('#pageZone').val('');
		Grainger.Modals.waitModal("bulkorderadd", "bulkorderadd");
		jQuery.ajax({
				url: posturl,
				type: "POST",
				cache: false,
				data: bulkOrderCopyPasteSer,
				success: function (data) {
						try {
							$("#bulk-order .bulk-order-content").addClass("hide");
							if(pdfContainer != null){
								pdfContainer.removeClass("move-pdf-down");
							}
						} catch(err) {
							console.log("Error in bulk-order");
						}

						/* set global val to data returned */
						bulkOrderAddVal = data;
						intelligentOfferAddtoCart($(data).find("#lastItem").val());
						$('#pageZone').val('BOP');
						/* then pop the dialog window */
						Grainger.Modals.createAndShowModal("bulkorderadd", "bulkorderadd", data);
						$("#errorDivDropDown").addClass("hide");
						$('#bulkCopyPasteCreate').find('#modal-bulkCopyPasteArea').val('');
						$("#bulk-order .bulk-order-content").addClass("hide");
						if(pdfContainer != null){
							pdfContainer.removeClass("move-pdf-down");
						}

						$('#bulkSeperateAdd .table').addClass("hide");
						$("#sub-total-text").addClass("hide");
						$("#add-to-list").addClass("hide");
						$("#bulkError").addClass("hide");
						$("#countForBulkOrderPad").attr("value",0);
						$(".s7LazyLoad").unveil();
				},
				error: function (xhr,error) {
					if(xhr.status==401||xhr.status==404){
						document.location.href='/login?frwdUrlPath="/"';
					}
					else if(xhr.status==403){
						window.location.reload();
					}
					else{
					Grainger.Modals.killModal();
					$('#errorDivDropDown').removeClass('hide');
					$("#errorContentDropDown").html(xhr.responseText);

					}
				}
		});
	}
		}
	else
		{
		return false;
		}
}
/* I want to use the $ as an alias for jQuery in no-conflict mode, so pass it as an argument in an immediate function...around EVERYTHING. */
(function($){

Grainger = $.extend(Grainger, {
/* Bulk order pad js code, namespace is 'bulkOrderPad' */
	bulkOrderPad: function () {

		/* declare local vars for bulkOrderPad functionality */
		var bulkOrderContent = $('#bulk-order .bulk-order-content'),
			bulkOrderItemSingleInput = $('#bulkorderItem'),
			pdfContainer = $("#pdf-container"),
		    isPendingOrder;

		/* singleton to init event handlers for bulk order cart */
		(function () {
			Grainger.bulkOrderPad.isPendingOrder = $("#ispendingorder").val();
			/* Toggle the bulk order pad with trigger */
			/*$("#show-bulk-order-link").click(function () {
				bopAjax();
			});*/

			$("#bulk-order").on("click", "span", function () { /* delegate event listener to child span elements */
				var el = $(this);

				/* Close the bulk order pad with close button */
				if (el.hasClass("close")) {
					$('#bulk-order .bulk-order-content').addClass("hide");
					pdfContainer.removeClass("move-pdf-down");
				}
			});

			/* close other elements (drop tabs, bulk order, select menus) */
			$(document).on("click", "#persistent-cart", function () {
				bulkOrderContent.addClass("hide");
				$("#body dl.drop-tab-menu dt").removeClass("active");
				$("#body dl.drop-tab-menu dd").addClass("hidden");
				$("#user-actions").children("#email-page").toggleClass("negative-zindex");
			});


			$(document).on("click", "#bulkOrderModelFullPageAddToCart", function () {
				bulkPageAddItemsCopyPaste();
			});



			/* remove from bulk order pad */
			$(document).on("click", "#bulkorderTableBody a.deleteItemBulkorder", function () {
				var el = $(this),
					itemID = el.parents("#bulkorderTableBody").find(".bulkPartID").html(); /* get the part id to remove from cart. Not a great way of doing this. */

				removeFromBulkcart(itemID);
			});

			/* show copy and paste pad */
			$(document).on("click", "#showCopyPaste", function () {
				showWindowdiv('bulkCopyPasteAdd');

				$("#showSeparateLabelText").toggleClass("hide");
				$("#showCopyPasteLabelText").toggleClass("hide");
				/* return false as a prevent-default method */
				return false;
			});

				/* toggle back to separate add bulk order pad */
			$(document).on("click", "#bulkSeparateBack, #showSeparate", function () {
				showWindowdiv('bulkSeperateAdd');
			});

			/* add copy-paste list to bulk order cart */
			$(document).on("click", "#bulkCopyPasteAddToCart", function () {
				addCopyPasteTextToBulkcart();

				/* return false as a prevent-default method */
				return false;
			});

			/* validate the qty field in bulk order pad on keyup */
			$(document).on("keyup", "#bulkorderQuantity", function () {
				var el = $(this),
					bulkOrderQtyFld = el.val();

				validateQtyBulk(bulkOrderQtyFld, el);
			});

			$(document).on("click", "#bulkOrderAddToCart", function () {
				additemstocart();
				/* return false as a prevent-default method */
				return false;
			});

			/* capture tab in the copy-paste input */
			$(document).on("keydown", "#modal-bulkCopyPasteArea", function (event) {
				var el = $(this);
				return catchTab(el,event);
			});

			/* escapes out of bulk order pad  */
			$(document).on("keydown", "body", function (e) {
				escapeKeyAndHideElement(e,"#bulk-order-content");
			});

			/* TODO: refactor show list order pad (true toggle between) */

		}()); /* run the initializations as an immediate function when Grainger.bulkOrderPad(); is called in this file on docready (eof) */


		function showBulkHideWindow () {
			$('#bulk-order .bulk-order-content').removeClass("hide");
		}

		/* validate the quantity field on keypress */
		function validateQtyBulk (qty,fieldId) {
			var re = /^\d{1,4}$/,
				replaced;
			if (!re.exec(qty)){
				replaced = fieldId.val().replace(/[\D*]/g,"").substring(0,4);
				fieldId.val(replaced);
				return false;
			}
			return true;
		}

		// We are going to catch the TAB key so that we can use it, Hooray!
		function catchTab (item,e) {
			var c;
			var cDom=e.target;

			if (navigator.userAgent.match("Gecko")) {
				c = e.which;
			} else {
				c = e.keyCode;
			}

			if (c===9) {
                replaceSelection(cDom,String.fromCharCode(9));
				setTimeout(function(){cDom.focus();},0);
				// prevent the focus lose
				return false;
			}
		}

		function setSelectionRange (input, selectionStart, selectionEnd) {
			if (input.setSelectionRange) {
				input.focus();
				input.setSelectionRange(selectionStart, selectionEnd);
			} else if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			}
		}

		function replaceSelection (input, replaceString) {
			if (input.setSelectionRange) {
				var selectionStart = input.selectionStart,
					selectionEnd = input.selectionEnd,
					range = "",
					isCollapsed = "";

				input.value = input.value.substring(0, selectionStart) + replaceString + input.value.substring(selectionEnd);

				if (selectionStart !== selectionEnd) {
					setSelectionRange(input, selectionStart, selectionStart + 	replaceString.length);
				} else {
					setSelectionRange(input, selectionStart + replaceString.length, selectionStart + replaceString.length);
				}

			} else if (document.selection) {
				range = document.selection.createRange();

				if (range.parentElement() === input) {
					isCollapsed = range.text === '';
					range.text = replaceString;

					 if (!isCollapsed) {
						range.moveStart('character', -replaceString.length);
						range.select();
					}
				}
			}
		}

		/* Hide Element : appends hide class to an element */
		function escapeKeyAndHideElement(e,element) {
			if (e.which == "27")
				$(element).addClass("hide");
		}



	}
});

/* on doc ready, initialize the bulk order pad */
$(function () {
	/* run bulk order init code */
	if ($('#bulk-order').length > 0) {
		Grainger.bulkOrderPad();
	}
	if (jQuery.urlParam("launchBulkOrderPad") == "true") {
		bopAjax(); //Launch it!
	} else {
		updateBulkOrderPadCookie($("#countForBulkOrderPad").val());
		copyOverBOPEntries();
		setTabIndexForBulkOrderPage();
	}
});


function updateBulkOrderPadCookie(data) {
	AkamaiCookie.setCount(AkamaiCookie.BOP_COUNT_COOKIE_ID,data);
	AkamaiCookie.updateDisplay(AkamaiCookie.BOP_COUNT_COOKIE_ID,AkamaiCookie.BOP_COUNT_DIV_ID);
}

/*
 *  On click of Bulk Order Pad header, fetch bulk order pad content from the users session
 *  and redraw the pad.
 *  This is required to prevent Akamai cache content from being displayed.
 */
function bopAjax(){
	var callBeingFired;
	//var showSpotBuy = $("#showSpotBuy").val();
	// don't make the call if it's being fired, or if it has already been called
	if(callBeingFired != true && $('#bulkOrderModelAddToCart').doesExist() == false) {
		callBeingFired = true;
		jQuery.ajax({
			//alert("foot");
			//url: "/BulkOrderComponentController?action=copyPasteText",
			url: contextPath+"/BulkOrderComponentController/bopAjax?ordercode=hey",
			dataType: "text",
			type: "GET",
			cache:false,
			success: function (data) {
				if (data === null || data === "") {
					setTimeout(function(){location.reload(true);},500);
				} else {
					$("#bulk-order-content").html(data).removeClass('loading');
					updateBulkOrderPadCookie($("#countForBulkOrderPad").val());
					callBeingFired = false;
				}
			},
			 error: function(error) {
	                //do nothing
		        }
		}

		);
	}
}

/* end define $ as jquery in immediate function */
}(jQuery));

function bulkPageAddItems() {
	var productCodes = [],
		prodQtyEntries = [],
		prodcode;
	var isErr = false;

	jQuery("input:text[name=productItemNumber]").each(function(){
		productCodes.push(jQuery(this).val());
		//jQuery(this).val("");
	});
	var i =0;
	jQuery("input:text[name=productQuantity]").each(function(index){

		if(jQuery.trim(productCodes[index]) !== ''){
			var prodQtyLine = {};
			prodQtyLine.code = productCodes[index];
			if(jQuery.trim(jQuery(this).val()) == ''){
				jQuery(this).val(1);
			}
			else if(isNaN(jQuery.trim($(this).val())) || jQuery.trim($(this).val()) ==0){
				isErr= true;

				}
			else{
				if(!isNaN(jQuery.trim($(this).val())) && jQuery.trim($(this).val()) <0){
					isErr= true;

				}
			}
			prodQtyLine.quantity = jQuery(this).val();
			prodQtyEntries[i++]=prodQtyLine;
			prodcode = prodQtyLine.code;
		}
		//jQuery(this).val(1);
	});
	if(isErr){
		jQuery("#errorDivFullPageLineAdd").removeClass("hide");
		//alert("Invalid Quantity - Please enter valid quantity");
	}
	if(prodQtyEntries.length>0 && !isErr){
		jQuery("#errorDivFullPageLineAdd").addClass("hide");
		var sessionBopTokenVal=$("#miniCartLinkForm input[name=_requestConfirmationToken]").val();
		var posturl = contextPath+"/view/BulkOrderComponentController/bulkAddItems?_requestConfirmationToken="+sessionBopTokenVal;
		Grainger.Modals.waitModal("bulkorderadd", "bulkorderadd");
		var xhrArgs = { //adding to var list to make this local scope
			url: posturl,
			type: "POST",
			cache: false,
			data: JSON.stringify(prodQtyEntries),
			success: function (data) {
				try {
					jQuery("#bulk-order .bulk-order-content").addClass("hide");
					jQuery("#pdf-container").removeClass("move-pdf-down");
				} catch(err) {
					console.log("Error in bulk-order");
				}

				$("input:text[name=productItemNumber]").each(function(){
					   $(this).val('');
					});
				/* set global val to data returned */
				bulkOrderAddVal = data;

				/* then pop the dialog window */
				Grainger.Modals.createAndShowModal("bulkorderadd", "bulkorderadd", data);
				jQuery("#errorDivFullPageLineAdd").addClass("hide");
				jQuery("#bulk-order .bulk-order-content").addClass("hide");
				jQuery("#pdf-container").removeClass("move-pdf-down");
				jQuery('#bulkSeperateAdd .table').addClass("hide");
				jQuery("#sub-total-text").addClass("hide");
				jQuery("#add-to-list").addClass("hide");
				jQuery("#bulkError").addClass("hide");
				jQuery("#countForBulkOrderPad").attr("value",0);
				jQuery(".s7LazyLoad").unveil();
				jQuery("#modal-bulkCopyPasteArea").val("");
				},
			error: function (error) {
					jQuery("#bulk-order-content").html(error);
			}
		};
		deferred = jQuery.ajax(xhrArgs);
	}

};

/**
 * Adds items to the cart when using Buld Order Copy/Paste area
 * @function bulkPageAddItemsCopyPaste
 */
function bulkPageAddItemsCopyPaste() {

	var copyPasteText = jQuery("#modal-bulkCopyPasteArea").val();
	jQuery("#errorDiv").addClass("hide");
	Grainger.Modals.waitModal();
	var posturl = contextPath+"/view/BulkOrderComponentController/bulkAddCopyPasteItems";
	var bulkOrderFullPageCopyPasteSer = jQuery("#bulkCopyPasteFullPageCreate").serialize();
	var xhrArgs = { //adding to var list to make this local scope
		url: posturl,
		type: "POST",
		cache: false,
		data: bulkOrderFullPageCopyPasteSer,
		success: function (data) {
						try {
							jQuery("#bulk-order .bulk-order-content").addClass("hide");
							jQuery("#pdf-container").removeClass("move-pdf-down");
							$('#bulkCopyPasteFullPageCreate').find('#modal-bulkCopyPasteArea').val();
						} catch(err) {
							console.log("Error in bulk-order");
						}

						/* set global val to data returned */
						bulkOrderAddVal = data;
						intelligentOfferAddtoCart(jQuery(data).find("#lastItem").val());
						/* then pop the dialog window */
						Grainger.Modals.createAndShowModal("bulkorderadd", "bulkorderadd", data);
						jQuery("#errorDivFullPage").addClass("hide");
						jQuery("#bulk-order .bulk-order-content").addClass("hide");
						jQuery("#pdf-container").removeClass("move-pdf-down");
						jQuery('#bulkSeperateAdd .table').addClass("hide");
						jQuery("#sub-total-text").addClass("hide");
						jQuery("#add-to-list").addClass("hide");
						jQuery("#bulkError").addClass("hide");
						jQuery("#countForBulkOrderPad").attr("value",0);
						jQuery(".s7LazyLoad").unveil();
						$('#bulkCopyPasteFullPageCreate').find('#modal-bulkCopyPasteArea').val('');
		},
		error: function (error) {
				jQuery("#errorContentFullPage").html(error.responseText);
				jQuery("#errorDivFullPage").removeClass("hide");
				Grainger.Modals.killModal();
		}
	};

	deferred = jQuery.ajax(xhrArgs);
};


function bulkOrderCarryOverItemsToPage() {

		var productCodes = new Array();
		var prodQtyEntries = [];
		var prodcode;
		jQuery("input:text[name=productItemNumber]").each(function(){
			if(jQuery(this).val() != ""){
			productCodes.push(jQuery(this).val());
			}
		});
		var i =0;
		jQuery("input:text[name=productQuantity]").each(function(index){

			if(productCodes.length > 0){
				var prodQtyLine = {};
				prodQtyLine.code = productCodes[index];
				if(prodQtyLine.code!="" && prodQtyLine.code != undefined) {
					prodQtyLine.qty = jQuery(this).val();
					prodQtyEntries[i++]=prodQtyLine;
					prodcode = prodQtyLine.code;
				}
			}

		});


		var encodedparam = encodeURIComponent(JSON.stringify(prodQtyEntries));
		$('#showMoreFieldsForm').find('#entries').val(encodedparam);
		//$('#showMoreFieldsForm').find('#entries').val(prodQtyEntries);
		$('#showMoreFieldsForm').submit();

};

/* These have to be in the global namespace because they are called from the window and other methods use same constructor functions. bleh. */
var bulkOrderAddVal = "";

function bulkorderaddCreate () {
	createModal("bulkorderadd", "bulkorderadd");
};

function bulkorderaddContent () {
	dlg.set('content', bulkOrderAddVal );
};

function copyOverBOPEntries() {
	if (jQuery("#carryOverItems").val() != undefined && jQuery("#carryOverItems").val() !== '') {
			if (jQuery("#bopitem1").val() != undefined) {
					jQuery("#bulkorderFItemA0").val(jQuery("#bopitem1").val());
			}
			if (jQuery("#bopqty1").val() != undefined) {
					jQuery("#bulkorderFQuantityA0").val(jQuery("#bopqty1").val());
			}
			if (jQuery("#bopitem2").val() != undefined) {
					jQuery("#bulkorderFItemA1").val(jQuery("#bopitem2").val());
			}
			if (jQuery("#bopqty2").val() != undefined) {
					jQuery("#bulkorderFQuantityA1").val(jQuery("#bopqty2").val());
			}
			if (jQuery("#bopitem3").val() != undefined) {
					jQuery("#bulkorderFItemA2").val(jQuery("#bopitem3").val());
			}
			if (jQuery("#bopqty3").val() != undefined) {
					jQuery("#bulkorderFQuantityA2").val(jQuery("#bopqty3").val());
			}
			if (jQuery("#bopitem4").val() != undefined) {
					jQuery("#bulkorderFItemA3").val(jQuery("#bopitem4").val());
			}
			if (jQuery("#bopqty4").val() != undefined) {
					jQuery("#bulkorderFQuantityA3").val(jQuery("#bopqty4").val());
			}
			if (jQuery("#bopitem5").val() != undefined) {
					jQuery("#bulkorderFItemA4").val(jQuery("#bopitem5").val());
			}
			if (jQuery("#bopqty5").val() != undefined) {
					jQuery("#bulkorderFQuantityA4").val(jQuery("#bopqty5").val());
			}
	}

};

function setTabIndexForBulkOrderPage() {
	/* this is awesome. let's hope we don't have to add a field or anything */
	jQuery("#bulkorderItemA0").attr("tabindex","1");
	jQuery("#bulkorderQuantityA0").attr("tabindex","2");
	jQuery("#bulkorderItemA1").attr("tabindex","3");
	jQuery("#bulkorderQuantityA1").attr("tabindex","4");
	jQuery("#bulkorderItemA2").attr("tabindex","5");
	jQuery("#bulkorderQuantityA2").attr("tabindex","6");
	jQuery("#bulkorderItemA3").attr("tabindex","7");
	jQuery("#bulkorderQuantityA3").attr("tabindex","8");
	jQuery("#bulkorderItemA4").attr("tabindex","9");
	jQuery("#bulkorderQuantityA4").attr("tabindex","10");
	jQuery("#bulkorderItemA5").attr("tabindex","11");
	jQuery("#bulkorderQuantityA5").attr("tabindex","12");
	jQuery("#bulkorderItemA6").attr("tabindex","13");
	jQuery("#bulkorderQuantityA6").attr("tabindex","14");
	jQuery("#bulkorderItemA7").attr("tabindex","15");
	jQuery("#bulkorderQuantityA7").attr("tabindex","16");
	jQuery("#bulkorderItemA8").attr("tabindex","17");
	jQuery("#bulkorderQuantityA8").attr("tabindex","18");
	jQuery("#bulkorderItemA9").attr("tabindex","19");
	jQuery("#bulkorderQuantityA9").attr("tabindex","20");
	jQuery("#bulkorderItemA10").attr("tabindex","21");
	jQuery("#bulkorderQuantityA10").attr("tabindex","22");
	jQuery("#bulkorderItemA11").attr("tabindex","23");
	jQuery("#bulkorderQuantityA11").attr("tabindex","24");
	jQuery("#bulkorderItemA12").attr("tabindex","25");
	jQuery("#bulkorderQuantityA12").attr("tabindex","26");
	jQuery("#bulkorderItemA13").attr("tabindex","27");
	jQuery("#bulkorderQuantityA13").attr("tabindex","28");
	jQuery("#bulkorderItemA14").attr("tabindex","29");
	jQuery("#bulkorderQuantityA14").attr("tabindex","30");
	jQuery("#bulkorderItemB0").attr("tabindex","31");
	jQuery("#bulkorderQuantityB0").attr("tabindex","32");
	jQuery("#bulkorderItemB1").attr("tabindex","33");
	jQuery("#bulkorderQuantityB1").attr("tabindex","34");
	jQuery("#bulkorderItemB2").attr("tabindex","35");
	jQuery("#bulkorderQuantityB2").attr("tabindex","36");
	jQuery("#bulkorderItemB3").attr("tabindex","37");
	jQuery("#bulkorderQuantityB3").attr("tabindex","38");
	jQuery("#bulkorderItemB4").attr("tabindex","39");
	jQuery("#bulkorderQuantityB4").attr("tabindex","40");
	jQuery("#bulkorderItemB5").attr("tabindex","41");
	jQuery("#bulkorderQuantityB5").attr("tabindex","42");
	jQuery("#bulkorderItemB6").attr("tabindex","43");
	jQuery("#bulkorderQuantityB6").attr("tabindex","44");
	jQuery("#bulkorderItemB7").attr("tabindex","45");
	jQuery("#bulkorderQuantityB7").attr("tabindex","46");
	jQuery("#bulkorderItemB8").attr("tabindex","47");
	jQuery("#bulkorderQuantityB8").attr("tabindex","48");
	jQuery("#bulkorderItemB9").attr("tabindex","49");
	jQuery("#bulkorderQuantityB9").attr("tabindex","50");
	jQuery("#bulkorderItemB10").attr("tabindex","51");
	jQuery("#bulkorderQuantityB10").attr("tabindex","52");
	jQuery("#bulkorderItemB11").attr("tabindex","53");
	jQuery("#bulkorderQuantityB11").attr("tabindex","54");
	jQuery("#bulkorderItemB12").attr("tabindex","55");
	jQuery("#bulkorderQuantityB12").attr("tabindex","56");
	jQuery("#bulkorderItemB13").attr("tabindex","57");
	jQuery("#bulkorderQuantityB13").attr("tabindex","58");
	jQuery("#bulkorderItemB14").attr("tabindex","59");
	jQuery("#bulkorderQuantityB14").attr("tabindex","60");
	jQuery("#bulkorderItemC0").attr("tabindex","61");
	jQuery("#bulkorderQuantityC0").attr("tabindex","62");
	jQuery("#bulkorderItemC1").attr("tabindex","63");
	jQuery("#bulkorderQuantityC1").attr("tabindex","64");
	jQuery("#bulkorderItemC2").attr("tabindex","65");
	jQuery("#bulkorderQuantityC2").attr("tabindex","66");
	jQuery("#bulkorderItemC3").attr("tabindex","67");
	jQuery("#bulkorderQuantityC3").attr("tabindex","68");
	jQuery("#bulkorderItemC4").attr("tabindex","69");
	jQuery("#bulkorderQuantityC4").attr("tabindex","70");
	jQuery("#bulkorderItemC5").attr("tabindex","71");
	jQuery("#bulkorderQuantityC5").attr("tabindex","72");
	jQuery("#bulkorderItemC6").attr("tabindex","73");
	jQuery("#bulkorderQuantityC6").attr("tabindex","74");
	jQuery("#bulkorderItemC7").attr("tabindex","75");
	jQuery("#bulkorderQuantityC7").attr("tabindex","76");
	jQuery("#bulkorderItemC8").attr("tabindex","77");
	jQuery("#bulkorderQuantityC8").attr("tabindex","78");
	jQuery("#bulkorderItemC9").attr("tabindex","79");
	jQuery("#bulkorderQuantityC9").attr("tabindex","80");
	jQuery("#bulkorderItemC10").attr("tabindex","81");
	jQuery("#bulkorderQuantityC10").attr("tabindex","82");
	jQuery("#bulkorderItemC11").attr("tabindex","83");
	jQuery("#bulkorderQuantityC11").attr("tabindex","84");
	jQuery("#bulkorderItemC12").attr("tabindex","85");
	jQuery("#bulkorderQuantityC12").attr("tabindex","86");
	jQuery("#bulkorderItemC13").attr("tabindex","87");
	jQuery("#bulkorderQuantityC13").attr("tabindex","88");
	jQuery("#bulkorderItemC14").attr("tabindex","89");
	jQuery("#bulkorderQuantityC14").attr("tabindex","90");
};

window.onbeforeunload = function() {
	if (window.location.pathname == '/content/bulkorderpad') {
		var	xhrArgs = {
			url: "/BulkOrderComponentController?clearCarryOverItems",
			dataType: "HTML",
			type: "GET",
			cache:false
		};

		jQuery.ajax(xhrArgs);
	}
};
jQuery(document).keyup(function(e) {
	if (e.keyCode == 27) {
		jQuery(".bulkOrderBody").removeClass('open');
		jQuery(".dropdown-menu ").removeClass('hide');
	}

	});
