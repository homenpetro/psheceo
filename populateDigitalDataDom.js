// JS added to populate the digitalData for DTM adobe Analytics.

function createDigitalDataDOM(page_variables) {

	
	var digitalData = digitalData || {};
	var breadCrumbName = "";
	var breadCrumbValue = [];
	var x="\\";
	var searchPage=false;
	
	$('#breadcrumb').find('li').each(function() {
		breadCrumbValue.push($.trim($(this).text().replace(/[\n\r]+/g, '')));

	});
	
	if(isInternalSearch()) {
		
		searchPage=true;
        digitalData = {
            internalSearch : {
                results : {},
                filter : {},
                nlsVendor: {}
            },
            event : [ {
				eventInfo : {},
				primaryCategory : ""
			} ],
			internalPageInfo : {},
			internalCampaign : [ {
				  impression : {
					 id : ""
				  }
				} ]

        };
        
        if (breadCrumbValue.length > 0) {
        	
        	if(window.location.href.indexOf("searchRedirect=") > -1){
        		digitalData.internalSearch.internalSearchTerm=getSearchTermForRedirect();
        	} else {
        		digitalData.internalSearch.internalSearchTerm = breadCrumbValue[(breadCrumbValue.length) - 1];	
        	}
            
        } 
        else {
            digitalData.internalSearch.internalSearchTerm = $.trim($('.content-title-container').text().replace(/[\n\r]+/g, ''));
            digitalData.internalSearch.results.numTotalReturned = parseFloat(1);
            digitalData.internalSearch.results.numProductsReturned = parseFloat(1);
        }        
        digitalData.internalSearch.results.numTotalReturned = parseFloat(noOfResults);
        	
        digitalData.event[0].eventInfo.eventName = "keyword search";
        digitalData.event[0].primaryCategory = "internal search";	
        digitalData.internalSearch.skuBoost = "No";
        
        digitalData.internalSearch.results.numProductsReturned = parseFloat(noOfResults);
     
        if (page_variables.SEARCH_TERMS.AutoCrrctVal == null || page_variables.SEARCH_TERMS.AutoCrrctVal.toString()=="") {
        	digitalData.internalSearch.endecaSearchTerm = digitalData.internalSearch.internalSearchTerm;
        	digitalData.internalSearch.autoCrrctVal="";
        }
        else {
        	digitalData.internalSearch.endecaSearchTerm = page_variables.SEARCH_TERMS.AutoCrrctVal.toString();
            digitalData.internalSearch.autoCrrctVal=page_variables.SEARCH_TERMS.AutoCrrctVal.toString();
        }
        
        if (page_variables.SEARCH_TERMS.PageCount == null || page_variables.SEARCH_TERMS.PageCount.toString()=="" || page_variables.SEARCH_TERMS.PageCount < 0) {
        	digitalData.internalSearch.paginationValue = "Not Applicable";
        }
        else {
        	digitalData.internalSearch.paginationValue =(page_variables.SEARCH_TERMS.ResultsPgNum) +1;
        }
        
        digitalData.internalSearch.redirectedTerm=page_variables.SEARCH_TERMS.RedirectedTerm;
        if(window.location.href.indexOf("searchRedirect=") > -1){
        	digitalData.internalSearch.redirectedTerm=getSearchTermForRedirect();
        }
        
        readViewPreference(); // loads view from cache 
        if($(".gridOrList").hasClass("showList"))
        	{
        	digitalData.internalSearch.results.resultsView="List View";
        	}
        else if($(".gridOrList").hasClass("showGrid"))
        	{
        	digitalData.internalSearch.results.resultsView="Grid View";
        	}
        
        if(window.location.href.indexOf("searchBar") > -1 )
        	{
        	if(window.location.href.indexOf("auto") == -1)
        		{
        		digitalData.internalSearch.typeAheadScenario="6";
        		}
        	}
        
        if(page_variables.SEARCH_TERMS.isTieredSearch) {
        	digitalData.internalPageInfo.currentUrl = "/search/tiersearch";
        	digitalData.internalPageInfo.pageLabel = "tiersearch";
        	digitalData.internalPageInfo.pageType = "SEARCH";
        	digitalData.internalPageInfo.pageUid = "gmx_tiered_search_result";
        	
        	if(window.location.href.indexOf("searchRedirect=") > -1){
        		var searchTermRedirect = getSearchTermForRedirect();
        		digitalData.internalSearch.internalSearchTerm=searchTermRedirect;
        		digitalData.internalSearch.endecaSearchTerm = searchTermRedirect;
        	} else {
        		digitalData.internalSearch.endecaSearchTerm = $.trim($('#keyword-result-item').text());
        		digitalData.internalSearch.internalSearchTerm = $.trim($('#keyword-result-item').text());	
        	}
        	digitalData.internalSearch.tieredSearchTreatmentType="SFC";
        	if(isNotEmpty(getUrlParameter("text")) && getUrlParameter("text").length > 0){
				digitalData.internalSearch.nlsVendor.searchTerm = getInternalSearchTerm(getUrlParameter("text").replace(/\+/g, " "));
			}else if(isNotEmpty(getUrlParameter("q")) && getUrlParameter("q").length > 0){
				digitalData.internalSearch.nlsVendor.searchTerm = getInternalSearchTerm(getUrlParameter("q").replace(/\+/g, " "));
			}
			if($("#cidCode").val() != "") {
				digitalData.internalSearch.nlsVendor.statusCode = $("#cidCode").val() + "|" + $("#cidScore").val();
				if($("#cidCode").val() == "NLSAA_9-1" || $("#cidCode").val() == "NLSAA_9-2") {
					digitalData.internalSearch.skuBoost = "Yes";
				}
				digitalData.internalSearch.results.resultsView = "Not Applicable";
			}
        }
        
        else if(noOfResults==0) {
        	digitalData.internalPageInfo.currentUrl = "/search/noresultspageonecolumn";
        	digitalData.internalPageInfo.pageLabel = "noresultspageonecolumn";
        	digitalData.internalPageInfo.pageType = "SEARCH";
        	digitalData.internalPageInfo.pageUid = "gmx_no_results_one_column";
        	digitalData.internalSearch.endecaSearchTerm = $.trim($('#searchQuery').text());
           	digitalData.internalSearch.internalSearchTerm = $.trim($('#searchQuery').text());
           	digitalData.internalSearch.autoCrrctVal= $.trim($('#searchQuery').text());
        }
        
        else {
        	digitalData.internalPageInfo.currentUrl = "/search/search";
        	digitalData.internalPageInfo.pageLabel = "search";
        	digitalData.internalPageInfo.pageType = "SEARCH";
        	digitalData.internalPageInfo.pageUid = "gmx_search_result";
        }
        
        if(digitalData.internalPageInfo.pageUid === "gmx_search_result") {
			if(isNotEmpty(getUrlParameter("text")) && getUrlParameter("text").length > 0){
				digitalData.internalSearch.nlsVendor.searchTerm = getInternalSearchTerm(decodeURIComponent(getUrlParameter("text").replace(/\+/g, " ")));
			}else if(isNotEmpty(getUrlParameter("q")) && getUrlParameter("q").length > 0){
				digitalData.internalSearch.nlsVendor.searchTerm = getInternalSearchTerm(decodeURIComponent(getUrlParameter("q").replace(/\+/g, " ")));
			}
			digitalData.internalSearch.nlsVendor.statusCode = $("#cidCode").val() + "|" + $("#cidScore").val();
			if($("#cidCode").val() == "NLSAA_10-1") {
				digitalData.internalSearch.skuBoost = "Yes";
			}
		}
        
        if(page_variables.SEARCH_TERMS.FreeTextSearch!=null) {
    		digitalData.internalSearch.internalSearchTerm =page_variables.SEARCH_TERMS.FreeTextSearch.toString();
    	}
        
        // Search Navigation Banner category links
    	if($("#searchNavigationBanner a:visible").length > 0){
    		
    		digitalData.internalCampaign[0].impression.id="SearchResults-_-Navigation-_-CategoryNavigationBanner";
    	}
    }
		

	if (page_variables.PageId == 'Item Details Page') {

		digitalData = {
			internalSearch : {

				results : {

				}
			},

			event : [ {
				eventInfo : {}
			} ],
			product : [ {
				productInfo : {}
			} ]
		};

		if (breadCrumbValue.length > 0) {

			digitalData.internalSearch.internalSearchTerm = breadCrumbValue[(breadCrumbValue.length) - 1];

		}

		digitalData.internalSearch.results.numTotalReturned = parseFloat(1);

		digitalData.event[0].eventInfo.eventName = "product view";
		digitalData.event[0].primaryCategory = "product";
		digitalData.product[0].productInfo.sku = page_variables.product.ProductId;
		digitalData.product[0].productInfo.stockStatus = page_variables.product.ProductSalesSt;

		var priceValue = page_variables.product.ProductPrc.toString();
		if (priceValue.indexOf('.') == -1) {
			priceValue += '.00'
		}
		;
		digitalData.product[0].productInfo.basePrice = priceValue;
		
	} 
	else if (page_variables.PageId == 'Shopping Cart') {
		digitalData = {
			cart : {},
			event : [ {
				eventInfo : {},
				primaryCategory : ""
			} ],
			product : [],
			internalPageInfo : {}
		};
		
		digitalData.internalPageInfo.currentUrl = "/checkout/cart";
		digitalData.internalPageInfo.pageLabel = "cart";
		digitalData.internalPageInfo.pageType = "CHECKOUT";
		digitalData.internalPageInfo.pageUid = "gmx_cartpage";
		
		digitalData.cart.cartID = cartID;
		var total = page_variables.cartTotal;
		digitalData.cart.cartTotal = parseFloat(total.toFixed(2));
		digitalData.cart.lineItemsCount = page_variables.itemsCount;

		digitalData.event[0].eventInfo.eventName = "cart view";
		if (page_variables.hasOwnProperty("isCartQuantityModified") && page_variables.isCartQuantityModified) {
			digitalData.event[0].eventInfo.eventName = "Modify Cart Quantity";
		} else if (page_variables.hasOwnProperty("isCartItemRemoved") && page_variables.isCartItemRemoved) {
			digitalData.event[0].eventInfo.eventName = "Remove Item";
		}
		
		digitalData.event[0].primaryCategory = "checkout";
		var i;

		if (page_variables.hasOwnProperty("CartItems")) {
			
			if (page_variables.CartItems[0].hasOwnProperty("ProductChangedQty")){
				for (i = 0; i < page_variables.CartItems.length; i++) {
					var tempBasePrice  = ((page_variables.CartItems[i].ProductChangedQty) * (page_variables.CartItems[i].ProductPrc));
					var tempListPrice  = ((page_variables.CartItems[i].ProductChangedQty) * (page_variables.CartItems[i].ProductListPrc));
					var tempProduct = {
						productInfo : {
							basePrice : parseFloat(tempBasePrice.toFixed(2)),
							listPrice : parseFloat(tempListPrice.toFixed(2)),
							quantity : page_variables.CartItems[i].ProductChangedQty,
							sku : page_variables.CartItems[i].ProductId
						}
					};
		
					digitalData.product.push(tempProduct);
				}
			} else{
				for (i = 0; i < page_variables.CartItems.length; i++) {
					var tempBasePrice  = ((page_variables.CartItems[i].ProductQty) * (page_variables.CartItems[i].ProductPrc));
					var tempListPrice  = ((page_variables.CartItems[i].ProductQty) * (page_variables.CartItems[i].ProductListPrc));
					var tempProduct = {
						productInfo : {
							basePrice : parseFloat(tempBasePrice.toFixed(2)),
							listPrice : parseFloat(tempListPrice.toFixed(2)),
							sku : page_variables.CartItems[i].ProductId,
							brandName : page_variables.CartItems[i].BrandName,
							stockStatus : page_variables.CartItems[i].ProductSalesSt,
							saleStatus : page_variables.CartItems[i].saleStatus
							
						}
					};
		
					digitalData.product.push(tempProduct);
				}
			}
		}
	}
 	else if (page_variables.PageId == 'Checkout Payment Page') {
 		digitalData = {
 				event : [ {
 					eventInfo : {}
 				} ],
 				cart : {},
 				product : [],
 				internalPageInfo : {}
 			};

 			digitalData.cart.cartID = cartID;
 			digitalData.event[0].eventInfo.eventName = "checkout start";
 			digitalData.event[0].primaryCategory = "checkout";
 				
 			if (page_variables.approvalLimitCheck) {
 				digitalData.cart.checkoutFlowName = "OMS";
 			}
 			else {
 				digitalData.cart.checkoutFlowName = "standard";
 			}
 			
 			if (page_variables.CurrentURL == "Checkout - MX-EN - Standard Checkout" ||
 					page_variables.CurrentURL == "Checkout - MX-ES - Standard Checkout") {
 				digitalData.internalPageInfo.currentUrl="/checkout/orderpayment";
 	 			digitalData.internalPageInfo.pageLabel="order_payment";
 				digitalData.internalPageInfo.pageType="CHECKOUT";
 				digitalData.internalPageInfo.pageUid="gmx_checkout_start";
 			}
 			if (page_variables.CurrentURL == "Checkout - MX-EN - Quote Request" ||
 					page_variables.CurrentURL == "Checkout - MX-ES - Quote Request") {
 				digitalData.cart.checkoutFlowName = "quote";
 				digitalData.event[0].eventInfo.eventName = "quote start";
 				digitalData.internalPageInfo.currentUrl="/checkout/quotestart";
 	 			digitalData.internalPageInfo.pageLabel="quote_start";
 				digitalData.internalPageInfo.pageType="CHECKOUT";
 				digitalData.internalPageInfo.pageUid="gmx_quote_start";
 			}	
 			
 			var i;
 			for (i = 0; i < productData.length; i++) {
 				var tempProductInfo = {

 					productInfo : {

 						sku : ""
 					}
 				};
 				tempProductInfo.productInfo.sku = productData[i];
 				digitalData.product.push(tempProductInfo);
 			}
	}
 	else if (page_variables.PageId == "Checkout Order Confirmation Page") {
		digitalData = {
			cart : {

			},
			event : [ {
				eventInfo : {}
			} ],

			transaction : {
				item : [],

				total : {},

				attributes : {}

			}

		};
		digitalData.event[0].primaryCategory = "checkout";
		if (page_variables.approvalLimitCheck) {
			digitalData.cart.checkoutFlowName = "OMS";
			digitalData.event[0].eventInfo.eventName = "OMS Submission";
		}
		else {
			digitalData.cart.checkoutFlowName = "standard";
			digitalData.event[0].eventInfo.eventName = "purchase";
		}
		if (page_variables.CurrentURL == "Checkout - MX-EN - Quote Request" ||
					page_variables.CurrentURL == "Checkout - MX-ES - Quote Request") {
			digitalData.cart.checkoutFlowName = "quote";
			digitalData.event[0].eventInfo.eventName = "Quote Submission";
			digitalData.transaction.attributes.paymentMethod ='';
			digitalData.transaction.attributes.voucherCode='';
		}
		digitalData.transaction.transactionID = page_variables.OrderNum;
		digitalData.transaction.currency = "MXN";
		digitalData.transaction.total.shipping = page_variables.OrderShipAmt;
		if (page_variables.ShipMethod == 'branchPickUp'){
			digitalData.transaction.total.fulfillmentMethod = "Pickup";
		}
		else if ( page_variables.ShipMethod == 'Standard Delivery Mode'){
			digitalData.transaction.total.fulfillmentMethod = "Ship";
		}
		digitalData.transaction.total.tax = page_variables.TaxAmt;
		digitalData.transaction.total.orderSubTotal = page_variables.OrderTotal;
		digitalData.transaction.total.lineItemsCount = page_variables.NumberOfUniqueSKUs;
		if (page_variables.PymtTypeCode == 'C'){
			digitalData.transaction.attributes.paymentMethod = "Check";
		}
		else if (page_variables.PymtTypeCode == 'D'){
			digitalData.transaction.attributes.paymentMethod = "Debit Card";
		}
		else if (page_variables.PymtTypeCode == 'E'){
			digitalData.transaction.attributes.paymentMethod = "Cash";
		}
		else if (page_variables.PymtTypeCode == 'N'){
			digitalData.transaction.attributes.paymentMethod = "Not Identified";
		}
		else if (page_variables.PymtTypeCode == 'R'){
			digitalData.transaction.attributes.paymentMethod = "Credit Card";
		}
		else if (page_variables.PymtTypeCode == 'T'){
			digitalData.transaction.attributes.paymentMethod = "Wire Transfer";
		}
		else if (page_variables.PymtTypeCode == 'O'){
			digitalData.transaction.attributes.paymentMethod = "Other";
		}
		else if (page_variables.PymtType == 'Grainger Credit'){
			digitalData.transaction.attributes.paymentMethod = "Open Account";
		}
		var voucherCode='';
		if(page_variables.Promocode.length>0)
			voucherCode = page_variables.Promocode[0].voucherCode ;
		digitalData.transaction.attributes.voucherCode = voucherCode;
		var i;

		for (i = 0; i < page_variables.ItemsOrdered.length; i++) {
			var tempProductInfo = {

				productInfo : {

					sku : ""
				},

				price : { },

				quantity : ""

			};

			tempProductInfo.productInfo.sku = page_variables.ItemsOrdered[i].ProductId;
			tempProductInfo.quantity = page_variables.ItemsOrdered[i].ProductQty;
			var price = ((page_variables.ItemsOrdered[i].ProductQty) * (page_variables.ItemsOrdered[i].ProductPrc));
			tempProductInfo.price.basePrice = parseFloat(price.toFixed(2));
			digitalData.transaction.item.push(tempProductInfo);

		}
	}
 	else if (page_variables.PageId == 'Checkout Order Review Page') {
		digitalData = {
			event : [ {
				eventInfo : {}
			} ],
			cart : {},
			product : []
		};

		digitalData.cart.cartID = cartID;

		if (page_variables.approvalLimitCheck) {
			digitalData.cart.checkoutFlowName = "OMS";			
		}
		else {
			digitalData.cart.checkoutFlowName = "standard";			
		}
		if (page_variables.CurrentURL == "Checkout - MX-EN - Review Quote Request") {
			digitalData.cart.checkoutFlowName = "quote";
		}	
		
		digitalData.event[0].eventInfo.eventName = "order review";
		digitalData.event[0].primaryCategory = "checkout";
		
		for (i = 0; i < productData.length; i++) {
			var tempProductInfo = {

				productInfo : {

					sku : ""
				}
			};

			tempProductInfo.productInfo.sku = productData[i];
			digitalData.product.push(tempProductInfo);
		}
	}
	var commonData = {
			page : {
				pageInfo : {},
				category : {}
			}
			
		};
	if(page_variables.PageId == 'Homepage')
		commonData.page.pageInfo.pageType = "Home";
	if(page_variables.PageId == 'My Account')
		commonData.page.pageInfo.pageType = "My Account";
	if(page_variables.PageId == 'Account Management Pickup Locations Page')
		commonData.page.pageInfo.pageType = "My Account";
	if(page_variables.PageId == 'Account Management Settings Page')
		commonData.page.pageInfo.pageType = "My Account";
	if(page_variables.PageId == 'Account Management Quote History Page')
		commonData.page.pageInfo.pageType = "Quotes";
	if(page_variables.PageId == 'Account Order Management Info Page')
		commonData.page.pageInfo.pageType = "My Account";
	if(page_variables.PageId == 'Apply For Credit Page')
		commonData.page.pageInfo.pageType = "My Account";
	if(page_variables.PageId == 'Account Management Unapproved Orders Page')
		commonData.page.pageInfo.pageType = "Pending Orders";
	if(page_variables.PageId == 'Branch Listing')
		commonData.page.pageInfo.pageType = "Branches";
	if (page_variables.PageId == 'Item Details Page')
		commonData.page.pageInfo.pageType = "Product";
	if (page_variables.PageId == 'Sign In')
		commonData.page.pageInfo.pageType = "Authentication";
	if (page_variables.PageId == 'Contact Us')
		commonData.page.pageInfo.pageType = "Customer Support";
	if (page_variables.PageId == 'Frequently Asked Questions')
		commonData.page.pageInfo.pageType = "Help Center";
	if (page_variables.PageId == 'Account Management Order History Page')
		commonData.page.pageInfo.pageType = "Purchase History";
	if (page_variables.PageId == 'Checkout Payment Page')
		commonData.page.pageInfo.pageType = "Checkout";
	if (page_variables.PageId == 'Checkout Order Review Page')
		commonData.page.pageInfo.pageType = "Checkout";
	if (page_variables.PageId == 'Checkout Order Confirmation Page')
		commonData.page.pageInfo.pageType = "Checkout";
	if (page_variables.PageId == 'Product Segments')
		commonData.page.pageInfo.pageType = "Category";
	if (page_variables.PageId == 'Product Families')
		commonData.page.pageInfo.pageType = "Category";
	if (page_variables.PageId == 'Product Categories')
		commonData.page.pageInfo.pageType = "Category";
	if(window.location.href.indexOf("/search?text=") > -1)
		commonData.page.pageInfo.pageType = "Search Results";	
	if (window.location.href.indexOf("/search/?text=") > -1 || searchPage)
		commonData.page.pageInfo.pageType = "SEARCH";
	if(window.location.href.indexOf("/approvalDecision") > -1)
		commonData.page.pageInfo.pageType = "Checkout";

	for (var i = 0; i < breadCrumbValue.length; i++) {
	if (breadCrumbValue.length == 1)
		breadCrumbName += breadCrumbValue[i];
	else if ((breadCrumbValue.length) - (i + 1) != 0)

		breadCrumbName += breadCrumbValue[i] + x;
	else

		breadCrumbName += breadCrumbValue[i];
	}
	commonData.page.pageInfo.contentTitle = $.trim(document.getElementsByTagName("title")[0].innerHTML);
	commonData.page.pageInfo.language = language;
	commonData.page.pageInfo.pageUID = "";
	commonData.page.category.lineOfBusiness = "Grainger Mexico";
	commonData.page.category.generalCategory = "";
	commonData.page.category.context = breadCrumbName.replace(/[/]/g, '-');
	commonData.page.category.l1 = "";
	commonData.page.category.l2 = "";
	commonData.page.category.l3 = "";

	var length = breadCrumbValue.length;

	if(page_variables.PageId == 'Homepage') {
		digitalData = {
				event :{
					eventInfo :{}
				},
				internalPageInfo : {}
			};
		
		digitalData.event.eventInfo.eventName = 'home view';
		digitalData.event.primaryCategory = 'home';
		digitalData.internalPageInfo.currentUrl = '/content/homepage';
		digitalData.internalPageInfo.pageLabel = 'homepage';
		digitalData.internalPageInfo.pageType = 'CONTENT';
		digitalData.internalPageInfo.pageUid = 'gmx_homepage';
		commonData.page.pageInfo.contentTitle = 'homepage';
		commonData.page.pageInfo.pageType = 'HOMEPAGE';
		commonData.page.pageInfo.pageUID = 'gmx_homepage';
	}
	
	if (page_variables.PageId == 'Shopping Cart'){
		commonData.page.pageInfo.contentTitle = "My Cart";
		commonData.page.pageInfo.pageType = "CHECKOUT";
		commonData.page.pageInfo.pageUID = "gmx_cartpage";
	}
	
	if (breadCrumbValue.length > 0 && !searchPage) {
		
		digitalData = {
	            internalSearch : {
	                results : {},
	                filter : {},
	                nlsVendor : {}
	            },
	            page : {
	            	category : {},
	            	pageInfo : {}
	            },
				event : [ {
					eventInfo : {},
					primaryCategory : ""
				} ],
				product : [ {
					productInfo : {}
				} ],
				internalPageInfo : {}
	        };
		
		if(document.getElementsByTagName("h1") != null && document.getElementsByTagName("h1")[0] != null){
		commonData.page.pageInfo.contentTitle =$.trim(document.getElementsByTagName("h1")[0].innerHTML);
		}

		if (page_variables.PageId == 'Product Segments') {

			commonData.page.category.l1 = breadCrumbValue[length - 1].replace(/[/]/g, '-');
			commonData.page.category.l2 = "";
			commonData.page.category.l3 = "";
			digitalData.internalSearch.redirectedTerm = "";
			digitalData.internalSearch.endecaSearchTerm = breadCrumbValue[length - 1].replace(/[/]/g, '-');
			digitalData.internalSearch.internalSearchTerm=breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
			commonData.page.category.l1ID = page_variables.L1categoryid;
			commonData.page.category.leafCatID = page_variables.L1categoryid;
			commonData.page.category.leafCatName = page_variables.CategoryName;
			if(window.location.href.indexOf("searchBar") > -1)
	    	{        
				digitalData.internalSearch.typeAheadScenario="2";
	    	}
			digitalData.internalSearch.results.numProductsReturned=parseFloat(noOfResults);
			digitalData.internalSearch.results.numTotalReturned=parseFloat(noOfResults);
			digitalData.internalPageInfo.currentUrl="/catalog/GMX";
			digitalData.internalPageInfo.pageLabel="category";
			digitalData.internalPageInfo.pageType="CATEGORY";
			digitalData.internalPageInfo.pageUid="gmx_category";
			commonData.page.pageInfo.pageUID="gmx_category";
			
			readViewPreference(); // loads view from cache
	        if($(".gridOrList").hasClass("showList"))
	        	{
	        	digitalData.internalSearch.results.resultsView="List View";
	        	}
	        else if($(".gridOrList").hasClass("showGrid"))
	        	{
	        	digitalData.internalSearch.results.resultsView="Grid View";
	        	}
			
			if((window.location.href.indexOf("type=ts") > -1) ||
		            (window.location.href.indexOf("searchBar") > -1) ||
		            (window.location.href.indexOf("text=") > -1)||
		            (window.location.href.indexOf("searchRedirect=") > -1)) {
				
				digitalData.event[0].eventInfo.eventName="refine";
				digitalData.event[0].primaryCategory="filter search";
				
				if(window.location.href.indexOf("text=") > -1) {
					var q= window.location.search;
					var param = (q.substring(q.indexOf("text"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace('+', ' ');
					
					digitalData.internalSearch.endecaSearchTerm=searchTerm;
					digitalData.internalSearch.internalSearchTerm=searchTerm;
				}
				else if((window.location.href.indexOf("q=") > -1)) {
					var q= window.location.search;
					var param = (q.substring(q.indexOf("q"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					digitalData.internalSearch.endecaSearchTerm=searchTerm;
					digitalData.internalSearch.internalSearchTerm=searchTerm;
				}
				else if(window.location.href.indexOf("searchRedirect=") > -1){
					var q= window.location.search;
					var param = (q.substring(q.indexOf("searchRedirect"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					searchTerm = decodeURIComponent(searchTerm);
					digitalData.internalSearch.endecaSearchTerm=searchTerm;
					digitalData.internalSearch.internalSearchTerm=searchTerm;
					digitalData.internalSearch.redirectedTerm=searchTerm;
				}
				if(window.location.href.indexOf("type=ts") < 0){
					digitalData.internalSearch.redirectedTerm = digitalData.internalSearch.endecaSearchTerm;
				}
			}
			else {
				digitalData.event[0].eventInfo.eventName="keyword search";
				digitalData.event[0].primaryCategory="internal search";
				digitalData.internalSearch.internalSearchTerm = "nav";
			}

		}

		if (page_variables.PageId == 'Product Families') {

			commonData.page.category.l1 = breadCrumbValue[(breadCrumbValue.length) - 2].replace(/[/]/g, '-');
			commonData.page.category.l2 = breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
			commonData.page.category.l3 = "";
			digitalData.internalSearch.redirectedTerm = "";
			digitalData.internalSearch.endecaSearchTerm = breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
			digitalData.internalSearch.internalSearchTerm = breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
			commonData.page.category.l1ID = page_variables.L1categoryid;
			commonData.page.category.l2ID = page_variables.L2categoryid;
			commonData.page.category.leafCatID = page_variables.L2categoryid;
			commonData.page.category.leafCatName = page_variables.CategoryName;
			if(window.location.href.indexOf("searchBar") > -1)
	    	{        
				digitalData.internalSearch.typeAheadScenario="2";
				
	    	}
			digitalData.internalSearch.results.numProductsReturned=parseFloat(noOfResults);
			digitalData.internalSearch.results.numTotalReturned=parseFloat(noOfResults);
			digitalData.internalPageInfo.currentUrl="/catalog/GMX";
			digitalData.internalPageInfo.pageLabel="category";
			digitalData.internalPageInfo.pageType="CATEGORY";
			digitalData.internalPageInfo.pageUid="gmx_category";
			commonData.page.pageInfo.pageUID="gmx_category";
			
			readViewPreference(); // loads view from cache
	        if($(".gridOrList").hasClass("showList"))
	        	{
	        	digitalData.internalSearch.results.resultsView="List View";
	        	}
	        else if($(".gridOrList").hasClass("showGrid"))
	        	{
	        	digitalData.internalSearch.results.resultsView="Grid View";
	        	}
			
			if((window.location.href.indexOf("type=ts") > -1) ||
		            (window.location.href.indexOf("searchBar") > -1) ||
		            (window.location.href.indexOf("text=") > -1) ||
		            (window.location.href.indexOf("searchRedirect=") > -1)) {
				
				digitalData.event[0].eventInfo.eventName="refine";
				digitalData.event[0].primaryCategory="filter search";
				
				if(window.location.href.indexOf("text=") > -1) {
					var q= window.location.search;
					var param = (q.substring(q.indexOf("text"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					if(searchTerm != "") {
					        digitalData.internalSearch.endecaSearchTerm=searchTerm;
					        digitalData.internalSearch.internalSearchTerm=searchTerm;
					}
				}
				else if((window.location.href.indexOf("q=") > -1)) {
					var q= window.location.search;
					var param = (q.substring(q.indexOf("q"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					digitalData.internalSearch.endecaSearchTerm=searchTerm;
					digitalData.internalSearch.internalSearchTerm=searchTerm;
				}
				else if(window.location.href.indexOf("searchRedirect=") > -1){
					var q= window.location.search;
					var param = (q.substring(q.indexOf("searchRedirect"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					searchTerm = decodeURIComponent(searchTerm);
					digitalData.internalSearch.endecaSearchTerm=searchTerm;
					digitalData.internalSearch.internalSearchTerm=searchTerm;
					digitalData.internalSearch.redirectedTerm=searchTerm;
				}
				if(window.location.href.indexOf("type=ts") < 0){
					digitalData.internalSearch.redirectedTerm = digitalData.internalSearch.endecaSearchTerm;
				}
			}
			else {
				digitalData.event[0].eventInfo.eventName="keyword search";
				digitalData.event[0].primaryCategory="internal search";
			}

		}

		if (page_variables.PageId == 'Product Categories') {

			commonData.page.category.l1 = breadCrumbValue[(breadCrumbValue.length) - 3].replace(/[/]/g, '-');
			commonData.page.category.l2 = breadCrumbValue[(breadCrumbValue.length) - 2].replace(/[/]/g, '-');
			commonData.page.category.l3 = breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
			digitalData.internalSearch.redirectedTerm = "";
			digitalData.internalSearch.endecaSearchTerm = breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
			digitalData.internalSearch.internalSearchTerm = breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
			commonData.page.category.l1ID = page_variables.L1categoryid;
			commonData.page.category.l2ID = page_variables.L2categoryid;
			commonData.page.category.l3ID = page_variables.L3categoryid;
			commonData.page.category.leafCatID = page_variables.L3categoryid;
			commonData.page.category.leafCatName = page_variables.CategoryName;
			if(window.location.href.indexOf("searchBar") > -1)
	    	{        
				digitalData.internalSearch.typeAheadScenario="2";
				
	    	}
			
			digitalData.internalSearch.results.numProductsReturned=parseFloat(noOfResults);
			digitalData.internalSearch.results.numTotalReturned=parseFloat(noOfResults);
			digitalData.internalPageInfo.currentUrl="/catalog/GMX";
			digitalData.internalPageInfo.pageLabel="category";
			digitalData.internalPageInfo.pageType="CATEGORY";
			digitalData.internalPageInfo.pageUid="gmx_category";
			commonData.page.pageInfo.pageUID="gmx_category";
			
			readViewPreference(); // loads view from cache
	        if($(".gridOrList").hasClass("showList"))
	        	{
	        	digitalData.internalSearch.results.resultsView="List View";
	        	}
	        else if($(".gridOrList").hasClass("showGrid"))
	        	{
	        	digitalData.internalSearch.results.resultsView="Grid View";
	        	}
			
			if((window.location.href.indexOf("type=ts") > -1) ||
		            (window.location.href.indexOf("searchBar") > -1) ||
		            (window.location.href.indexOf("text=") > -1) ||
		            (window.location.href.indexOf("searchRedirect=") > -1)) {
				
				digitalData.event[0].eventInfo.eventName="refine";
				digitalData.event[0].primaryCategory="filter search";
				
				if(window.location.href.indexOf("text=") > -1) {
					var q= window.location.search;
					var param = (q.substring(q.indexOf("text"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					if(searchTerm != "") {
						digitalData.internalSearch.endecaSearchTerm=searchTerm;
						digitalData.internalSearch.internalSearchTerm=searchTerm;
					}
				}
				else if((window.location.href.indexOf("q=") > -1)) {
					var q= window.location.search;
					var param = (q.substring(q.indexOf("q"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					digitalData.internalSearch.endecaSearchTerm=searchTerm;
					digitalData.internalSearch.internalSearchTerm=searchTerm;
				}
				else if(window.location.href.indexOf("searchRedirect=") > -1){
					var q= window.location.search;
					var param = (q.substring(q.indexOf("searchRedirect"))).split("&");
					var searchTerm= (param[0].substring(param[0].indexOf("=")+1)).replace("+"," ");
					searchTerm = decodeURIComponent(searchTerm);
					digitalData.internalSearch.endecaSearchTerm=searchTerm;
					digitalData.internalSearch.internalSearchTerm=searchTerm;
					digitalData.internalSearch.redirectedTerm=searchTerm;
				}
				if(window.location.href.indexOf("type=ts") < 0){
					digitalData.internalSearch.redirectedTerm = digitalData.internalSearch.endecaSearchTerm;
				}
			}
			else {
				digitalData.event[0].eventInfo.eventName="keyword search";
				digitalData.event[0].primaryCategory="internal search";
			}

		}
		
		
		if (page_variables.PageId == 'Item Details Page') {

            commonData.page.category.l1 = breadCrumbValue[(breadCrumbValue.length) - 3].replace(/[/]/g, '-');
            commonData.page.category.l2 = breadCrumbValue[(breadCrumbValue.length) - 2].replace(/[/]/g, '-');
            commonData.page.category.l3 = breadCrumbValue[(breadCrumbValue.length) - 1].replace(/[/]/g, '-');
            commonData.page.category.l1ID = page_variables.product.L1categoryid;
            commonData.page.category.l2ID = page_variables.product.L2categoryid;
            commonData.page.category.l3ID = page_variables.product.L3categoryid;
            commonData.page.category.leafCatID = page_variables.product.L3categoryid;
            commonData.page.category.leafCatName = page_variables.product.CategoryName;
            commonData.page.pageInfo.pageUID = "st_item_page_default";
          
            if(window.location.href.indexOf("searchBar") > -1)
	    	{        
				digitalData.internalSearch.typeAheadScenario="15";
	    	}

       		digitalData.page.pageInfo.pageUID = commonData.page.pageInfo.pageUID;
   			digitalData.internalSearch.results.numTotalReturned = parseFloat(1);
   			digitalData.event[0].eventInfo.eventName = "product view";
   			digitalData.event[0].primaryCategory = "product";
   			digitalData.product[0].productInfo.sku = page_variables.product.ProductId;
   			digitalData.product[0].productInfo.stockStatus = page_variables.product.ProductSalesSt;
   			digitalData.product[0].productInfo.brandName = page_variables.product.BrandName;
   			digitalData.product[0].productInfo.saleStatus = page_variables.product.saleStatus;
   			
   			var listPriceValue = page_variables.product.ProductPrc;
   			var basePriceValue = page_variables.product.ProductBasePrc;
   			digitalData.product[0].productInfo.listPrice = Math.round(listPriceValue*100)/100;
   			digitalData.product[0].productInfo.basePrice = Math.round(basePriceValue*100)/100;
   			
   			digitalData.internalSearch.internalSearchTerm = (page_variables.hasOwnProperty("searchedTerm") === true) ? page_variables.searchedTerm : page_variables.product.ProductId;
   			if (breadCrumbValue.length > 0) {
   				digitalData.internalPageInfo.currentUrl = "/product/"+page_variables.product.BrandName+"-"+page_variables.product.ProductNm+"-"+page_variables.product.ProductId;
   	   		}
   	   		digitalData.internalPageInfo.pageLabel = "st_item_page_default";
   	   		digitalData.internalPageInfo.pageType = "PRODUCT";
   	   		digitalData.internalPageInfo.pageUid = "gmx_item_page_default";
   	   		var categorylevels = commonData.page.category.l1 + "/" + commonData.page.category.l2 + "/" + commonData.page.category.l3;
   	   		digitalData.internalSearch.autoCrrctVal = (page_variables.hasOwnProperty("searchedTerm") === true) ? "" : categorylevels;
   	   		digitalData.internalSearch.endecaSearchTerm = (page_variables.hasOwnProperty("searchedTerm") === true) ? page_variables.searchedTerm : categorylevels;
   	   		if(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "lists") {
   	   			digitalData.product[0].productInfo.findingMethod = "Lists";
   	   		}else if(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "replacementProduct"){
   	   			digitalData.product[0].productInfo.findingMethod = "Product Replacement";
   	   		}else if(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "alternateProducts"){
   	   			digitalData.product[0].productInfo.findingMethod = "Recommended Alternate";
   	   		}
        }
		
		if(getPageUID(page_variables.PageId) === "category") {
			var cidType = jQuery.urlParam("type"); // check if response is category prediction
			digitalData.internalSearch.skuBoost = "No";
			
			// exclusively for category prediction
			if(cidType != "" && cidType == "cp") {
				var searchTerm = (isNotEmpty(jQuery.urlParam("q"))) ? getInternalSearchTerm(decodeURIComponent(jQuery.urlParam("q").replace(/\+/g, " "))) : "";
				digitalData.event[0].eventInfo.eventName = "keyword search";
				digitalData.event[0].primaryCategory = "internal search";
				digitalData.internalSearch.internalSearchTerm = searchTerm;
				digitalData.internalSearch.redirectedTerm = (window.location.href.indexOf("searchRedirect=") > -1) ? getSearchTermForRedirect() : "";
				digitalData.internalSearch.autoCrrctVal = "";
				digitalData.internalSearch.tieredSearchTreatmentType = "Not Applicable";
				digitalData.internalSearch.nlsVendor.searchTerm = getInternalSearchTerm(decodeURIComponent(jQuery.urlParam("q").replace(/\+/g, " ")));
				digitalData.internalSearch.nlsVendor.statusCode = jQuery.urlParam("nls") + "|" + jQuery.urlParam("code").replace('%3E', '>');
				digitalData.internalSearch.skuBoost = "Yes";
				
			}

			if(window.location.href.indexOf("searchRedirect=") > -1){
				var searchRedirectTerm =getSearchTermForRedirect();
				digitalData.internalSearch.redirectedTerm=searchRedirectTerm;
				digitalData.internalSearch.endecaSearchTerm=searchRedirectTerm;
				digitalData.internalSearch.internalSearchTerm=searchRedirectTerm;
			}

		}
		
	}
	
	
	if (page_variables.PageId == 'Sign In') {
		digitalData = {
				event :{
					eventInfo :{}
				},
				internalPageInfo : {}
			};
		
		digitalData.event.eventInfo.eventName = "signin";
		digitalData.event.primaryCategory = "authentication";
		digitalData.internalPageInfo.currentUrl = "/myaccount/signin";
		digitalData.internalPageInfo.pageLabel = "signin";
		digitalData.internalPageInfo.pageType = "AUTHENTICATION";
		digitalData.internalPageInfo.pageUid = "signin";
		commonData.page.category.context = "";
		commonData.page.pageInfo.contentTitle = "Sign In";
		commonData.page.pageInfo.pageType = "AUTHENTICATION";
		commonData.page.pageInfo.pageUID = "signin";
	}
	
	if (page_variables.PageId == 'Checkout Login Page') {
		digitalData = {
				event :{
					eventInfo :{}
				},
				internalPageInfo : {}
			};
		
		digitalData.event.eventInfo.eventName = "signin";
		digitalData.event.primaryCategory = "authentication";
		digitalData.internalPageInfo.currentUrl = "/myaccount/checkoutsignin";
		digitalData.internalPageInfo.pageLabel = "checkoutsignin";
		digitalData.internalPageInfo.pageType = "AUTHENTICATION";
		digitalData.internalPageInfo.pageUid = "checkoutsignin";
		commonData.page.category.context = "";
		commonData.page.pageInfo.contentTitle = "Checkout Sign In";
		commonData.page.pageInfo.pageType = "AUTHENTICATION";
		commonData.page.pageInfo.pageUID = "checkoutsignin";
	}
	
	if(window.location.href.indexOf("/approvalDecision") > -1)
	{

digitalData = {
        cart : {
             },
        event : [ {
			eventInfo : {}
		} ],
        page : {
        	category : {},
        	pageInfo : {}
        },
        transaction : {
        	attributes : {},
        	item : [{}],
        	total : {},
        	owner : {
        		profile : {
        			profileInfo : {}
        		}
        	}
        },
        user : {
			profile : {
				attributes : {},
				profileInfo : {}
			}
		}
        
    };
	//to override digital data variable on jquery extend
	commonData.page.pageInfo.contentTitle =$.trim(document.getElementsByTagName("h1")[0].innerHTML);
	
	if(page_variables.ApprovedOrder.ApproverDecision== "APPROVE") {
		digitalData.cart.action = "Purchase";
		commonData.page.pageInfo.pageUID = "pending order approved confirmation";
	}
	else if(page_variables.ApprovedOrder.ApproverDecision== "CANCEL") {
		digitalData.cart.action = "Cancel Order";
		commonData.page.pageInfo.pageUID = "pending order cancelled confirmation";
	}
	else if(page_variables.ApprovedOrder.ApproverDecision== "REJECT") {
		digitalData.cart.action = "Deny Order";
		commonData.page.pageInfo.pageUID = "pending order denied confirmation";
	}
	if(page_variables.ApprovedOrder.ApproverDecision== "CANCEL" || page_variables.ApprovedOrder.ApproverDecision== "REJECT") {
		digitalData.cart.cartID = page_variables.ApprovedOrder.OrderID;
		digitalData.event[0].eventInfo.eventName = "OMS Action";
	}
	else {
		digitalData.cart.cartID = "";
		digitalData.event[0].eventInfo.eventName = "purchase";
	}
		
	digitalData.cart.checkoutFlowName = "OMS Action";
	digitalData.cart.checkoutProcessType = "Not Keepstock";
	digitalData.event[0].primaryCategory = "checkout";
	digitalData.page.category.context = "";
	digitalData.page.category.l1 = "";
	digitalData.page.category.l2 = "";
	digitalData.page.category.l3 = "";
	digitalData.page.category.lineOfBusiness = "Grainger Mexico";
	digitalData.page.pageInfo.contentTitle =$.trim(document.getElementsByTagName("h1")[0].innerHTML);
	digitalData.page.pageInfo.language = language;
	digitalData.page.pageInfo.pageType = "Checkout";
	digitalData.page.pageInfo.pageUID = "pending order approved confirmation";
	digitalData.transaction.attributes.paymentMethod = page_variables.ApprovedOrder.PaymentMode;
	digitalData.transaction.attributes.voucherCode = page_variables.ApprovedOrder.VoucherCode;
	digitalData.transaction.currency = "MXN";
	var OMEntries = page_variables.ApprovedOrder.OMEntries;
	if(OMEntries !=null)
		{
	for (i = 0; i < OMEntries.length; i++){

		var tempProduct = {
				price : {
					basePrice : ""
				},
				quantity : "",
				productInfo : {
					sku : ""
				}
			};
			var basePrice  = ((OMEntries[i].basePrice) * (OMEntries[i].quantity)).toString();            
            if (basePrice.indexOf('.') == -1) {
                basePrice += '.00'
            }
            else {   
                 
               basePrice = Math.floor(basePrice * 100) / 100;
                
            }
            tempProduct.price.basePrice = basePrice;
			tempProduct.quantity = OMEntries[i].quantity;
			tempProduct.productInfo.sku = OMEntries[i].code;
			digitalData.transaction.item.push(tempProduct);
		}
		
	}
	digitalData.transaction.total.fulfillmentMethod = page_variables.ApprovedOrder.DeliveryMethod;
	digitalData.transaction.total.lineItemsCount = page_variables.ApprovedOrder.NumberOfUniqueSKUs;
	digitalData.transaction.total.shipping = page_variables.ApprovedOrder.ShippingAmount;
	digitalData.transaction.total.tax = page_variables.ApprovedOrder.TaxAmount;
	digitalData.transaction.transactionID = page_variables.ApprovedOrder.OrderID;
	digitalData.transaction.owner.profile.profileInfo.profileID = "";
	digitalData.user.profile.profileInfo.profileID = "";
	digitalData.user.profile.attributes.accountNumber = accountNumber;
	digitalData.user.profile.attributes.communityType = page_variables.community;
	
	}
	
	if (page_variables.PageId == 'Checkout Payment Page') {
		if (page_variables.CurrentURL == "Checkout - MX-EN - Standard Checkout" ||
					page_variables.CurrentURL == "Checkout - MX-ES - Standard Checkout") {
			commonData.page.pageInfo.contentTitle = "Order Start";
			commonData.page.pageInfo.pageType = "CHECKOUT";
			commonData.page.pageInfo.pageUID = "gmx_checkout_start";
		}

		if (page_variables.CurrentURL == "Checkout - MX-EN - Quote Request" ||
					page_variables.CurrentURL == "Checkout - MX-ES - Quote Request") {
			commonData.page.pageInfo.contentTitle = "Quote Start";
			commonData.page.pageInfo.pageType = "CHECKOUT";
			commonData.page.pageInfo.pageUID = "gmx_quote_start";
		}
	}
	
	if (page_variables.PageId == "Checkout Order Confirmation Page") {
		
		commonData.page.pageInfo.contentTitle = $(document.getElementsByTagName("h1")[0]).text().trim();
		
		if (page_variables.CurrentURL == "Checkout - MX-EN - Quote Request" ||
				page_variables.CurrentURL == "Checkout - MX-ES - Quote Request") {
			commonData.page.pageInfo.pageUID = "Quote Confirmation";
		}
		else if(!page_variables.noRequireApprover) {
			commonData.page.pageInfo.pageUID = "Order Submitted for Approval Confirmation";
		}
		else {
			commonData.page.pageInfo.pageUID = "Order Confirmation";
		}
	}
	
	if((window.location.href.indexOf("/search?text=") > -1) ||
            (window.location.href.indexOf("/search/?text=") > -1) ||
            (window.location.href.indexOf("/search?q=") > -1) ||
            (window.location.href.indexOf("/search/?q=") > -1) ||
            (window.location.href.indexOf("/search?sort=") > -1) ||
            (window.location.href.indexOf("/search/?sort=") > -1)) {
		
		if(page_variables.SEARCH_TERMS.isTieredSearch) {
			commonData.page.pageInfo.pageUID = "gmx_tiered_search_result";
			commonData.page.category.context = $.trim($('#keyword-result-item').text());
			commonData.page.pageInfo.contentTitle= $.trim($('#keyword-result-item').text());
		}
		else if(noOfResults==0){
			commonData.page.pageInfo.pageUID="gmx_no_results_one_column";
		}
		else {
			commonData.page.pageInfo.pageUID="gmx_search_result";
		}
	}
	
	if(window.location.href.indexOf("/register") > -1){
		digitalData.event[0].primaryCategory = "Registration Start"; 
	}
	if(page_variables.PageId == 'My Account' && page_variables.registrationCompelete){
	    digitalData.event[0].primaryCategory = "Registration Complete";
	}

	var tempuser = {
			user : {
				profile : {
					attributes : {},
					profileInfo : {}
				}
			}
		};
	if (page_variables.isEproUser) {
		if (page_variables.eproUlpUserLoggedIn) {
			tempuser.user.profile.attributes.personalization = "Y";
		} else {
			tempuser.user.profile.attributes.personalization = "N";
		}
	}
	tempuser.user.profile.attributes.accountName = page_variables.accountName;
	tempuser.user.profile.attributes.UUID  = page_variables.UUID;
	tempuser.user.profile.attributes.multiAcct = page_variables.multiAcct;
	tempuser.user.profile.attributes.RMLState = page_variables.RMLState;
	tempuser.user.profile.attributes.accountNumber = page_variables.accountNumber;
	tempuser.user.profile.attributes.brandSegment = page_variables.brandSegment;
	tempuser.user.profile.attributes.communityType = page_variables.communityType;
	tempuser.user.profile.attributes.customCatalogIdentifier = page_variables.customCatalogIdentifier;
	tempuser.user.profile.attributes.hybrisAccountPK = page_variables.hybrisAccountPK;
	tempuser.user.profile.attributes.hybrisPKID = page_variables.hybrisPKID;
	tempuser.user.profile.attributes.loginState = page_variables.loginState;
	tempuser.user.profile.attributes.omsFlag = page_variables.omsFlag;
	tempuser.user.profile.attributes.subTrackCode  = page_variables.subTrackCode;
	tempuser.user.profile.attributes.trackCode = page_variables.trackCode;
	tempuser.user.profile.attributes.userRole = page_variables.userRole;
	tempuser.user.profile.profileInfo.profileID = page_variables.profileID;
	
	// extend digital data for Search / category pages filtering without overriding existing mappings
	if(searchPage || isCategoryPage()){

		var filterTypeApplied = decodeURI(jQuery.urlParam("filterType"));
		var filterNameApplied = getDecodedFilterValue(jQuery.urlParam("filterName"));
		var filterValueApplied = getDecodedFilterValue(jQuery.urlParam("filterValue"));
		var isFacetFilterApplied = isNotEmpty(filterTypeApplied) && isNotEmpty(filterValueApplied);
		var attributeTemplate = getInternalSearchAttributeTemplate();
		var isSortFilter = isSortFilterApplied(attributeTemplate);
		var isSearchWithinFilter = isSearchWithinApplied(attributeTemplate);
		var isPaginationFilter = isPaginationApplied(attributeTemplate);
		var internalSearchQuery = getDecodedFilterValue(jQuery.urlParam("q"));
		var cpTypeValue = getDecodedFilterValue(jQuery.urlParam("cptype"));

		if(isFacetFilterApplied && cpTypeValue != "cp"){
			//technical or navigational filter is applied
			digitalData.event[0].eventInfo.eventName = "refine";
			digitalData.event[0].primaryCategory = "filter search";
			digitalData.internalSearch.filter.attributeType = getInternalSearchAttributeType(filterTypeApplied);
			digitalData.internalSearch.filter.attributeTemplate = attributeTemplate;

			digitalData.internalSearch.filter.category = filterNameApplied; 
			digitalData.internalSearch.filter.filterValue = getDecodedFilterValue(filterValueApplied);


		} else if((isSortFilter || isPaginationFilter || isSearchWithinFilter) && cpTypeValue != "cp"){
			//Sort, pagination and Search within applied
			digitalData.event[0].eventInfo.eventName = "refine";
			digitalData.event[0].primaryCategory = "filter search";
			digitalData.internalSearch.filter.attributeType = attributeTemplate;
			digitalData.internalSearch.filter.attributeTemplate = attributeTemplate;

			digitalData.internalSearch.filter.category = attributeTemplate; 
			digitalData.internalSearch.filter.filterValue = getDecodedFilterValue(getInternalSearchFilterValue(
					internalSearchQuery, attributeTemplate));
			
		} else if(jQuery.urlParam("cptype") == "cp") { // exclusively for CID if not landing in TS page.
			var searchTerm = getInternalSearchFilterValue(decodeURIComponent(jQuery.urlParam("remove_token").replace('%7C', ' ').replace(/\+/g, " ")));
			digitalData.internalSearch.internalSearchTerm = searchTerm.trim().replace(/\|/g, " ");
			if(attributeTemplate != "keyword") {
				digitalData.internalSearch.filter.attributeTemplate = "keyword";
				digitalData.internalSearch.filter.attributeType = "keyword";
				if (filterTypeApplied === "category" && (attributeTemplate == "Text")) {
					digitalData.internalSearch.filter.category = filterTypeApplied;
					digitalData.internalSearch.filter.filterValue = isNotEmpty(filterValueApplied) ? filterValueApplied : page_variables.CategoryName;
				} else {
					digitalData.internalSearch.filter.category = (attributeTemplate == "Text") ? filterNameApplied
							: attributeTemplate;
					digitalData.internalSearch.filter.filterValue = getDecodedFilterValue(getInternalSearchFilterValue(
							internalSearchQuery, attributeTemplate));
				}
			} else if(attributeTemplate == "keyword"){
				digitalData.internalSearch.filter.attributeType = "keyword";
				digitalData.internalSearch.filter.attributeTemplate = "keyword";
				digitalData.internalSearch.filter.category = "keyword";
				digitalData.internalSearch.filter.filterValue =getInternalSearchTerm($("#search_keyword").val().split("+").reverse()[0]);
			} 
	}

		//bind list or grid view to update digital data mapping
		jQuery("div#gridOrList > a").on("click",function(){
			var isGridView = false;

			if($(".gridOrList").hasClass("showGrid"))	{
				isGridView = true;
			}
			digitalData.event[0].eventInfo.eventName = "refine";
			digitalData.event[0].primaryCategory = "filter search";
			digitalData.internalSearch.filter.attributeTemplate = "Result View"; 
			digitalData.internalSearch.filter.attributeType = "Result View";
			digitalData.internalSearch.filter.category = "Result View";
			digitalData.internalSearch.filter.filterValue = (isGridView)? "Grid View" : "List View";
			if(typeof _satellite != "undefined") {
				_satellite.track('Internal Search Filter');	
			}
			
		});
		

	}
	
	if(page_variables.PageId == 'Branch Location landing page'){
		commonData.page.pageInfo.pageType = "CONTENT";
		commonData.page.pageInfo.pageUID = "branch_detail";
		commonData.page.pageInfo.contentTitle = $.trim($("#branchHeader").text()) + " #" + $("#branchName").val();
		commonData.page.pageInfo.language = "es";
		
		commonData.page.category.lineOfBusiness = "Grainger Mexico";
	}
	
	if(page_variables.PageId == 'All Branch Locations page'){
		commonData.page.pageInfo.pageType = "CONTENT";
		commonData.page.pageInfo.pageUID = "find-branch-location";
		commonData.page.pageInfo.contentTitle = "Find a Grainger Branch";
		commonData.page.pageInfo.language = "es";
		
		commonData.page.category.lineOfBusiness = "Grainger Mexico";
	}
	
	return jQuery.extend(digitalData, commonData, tempuser);
}

function populateModalDataDom(cartId, code, qty, price, salesStatus) {
	digitalData.modal = {
			cart : {},
			product : []
	};
	digitalData.modal.cart.cartID = cartId;
	var i;
	for (i = 0; i < code.length; i++) {
		var tempProduct = {
				productInfo : {
					basePrice : "",
					quantity : "",
					sku : "",
					stockStatus : ""
				}
			};
		tempProduct.productInfo.basePrice = Math.round(price[i] * 100) / 100;
		tempProduct.productInfo.quantity = Number(qty[i]);
		tempProduct.productInfo.sku = code[i];
		tempProduct.productInfo.stockStatus = salesStatus[i];
		if (( $('#pageZone').val() == "productListComponent") ||
				(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "productGridComponent")){
			tempProduct.productInfo.addToCartMethod = window.page_variables.PageId + "_Product Grid";
		}
		else if( $('#pageZone').val() == "BOP"){
			tempProduct.productInfo.addToCartMethod = "Quick Order Form";
		}
		else if (((isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "lists")
				|| $('#pageType').val() == 'LISTDETAILS' || $(
				'#isListLandingPage').val() == "true")
				&& $('#pageZone').val() != 'BOP') {
			tempProduct.productInfo.findingMethod = "Lists";
			tempProduct.productInfo.addToCartMethod = "Lists";
		}
		else if( $('#isIdpPage').val() == "true") {
		//Zone wise split IDP Page
			if(( $('#pageZone').val() == "recommendedProducts") ||
					(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "recommendedProducts")){
				tempProduct.productInfo.addToCartMethod = "IDP_Customers Also Viewed";
			}else if(( $('#pageZone').val() == "alternateProducts") ||
					(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "alternateProducts")){
				var isDirectAlternateATC = ($('#pageZone').val() == "alternateProducts");
				tempProduct.productInfo.addToCartMethod = "Recommended Alternate";
				if(isDirectAlternateATC) {
					tempProduct.productInfo.findingMethod = "Recommended Alternate";
				}
			}else if(( $('#pageZone').val() == "relatedProducts") ||
					(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "relatedProducts")){
				tempProduct.productInfo.addToCartMethod = "Related Products";
			}else if(( $('#pageZone').val() == "replacementProduct") ||
					(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "replacementProduct")){
				var isDirectReplacementATC = ($('#pageZone').val() == "replacementProduct");
				tempProduct.productInfo.addToCartMethod = "Product Replacement";
				if(isDirectReplacementATC) {
					tempProduct.productInfo.findingMethod = "Product Replacement";
				}
			}else if( $('#pageZone').val() =="productAddtoCart" ){
				tempProduct.productInfo.addToCartMethod = "Product Details";
			}
		}
		else if(($('#isSearchPage').val() == "true")
				|| ((isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "searchResults"))){
			tempProduct.productInfo.addToCartMethod = "Search Results";
		}
		else if(($('#isSharedCartPage').val() == "true") ||  ((isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "sharedCart"))){
			tempProduct.productInfo.addToCartMethod = "Shared Cart";
		} 
		else if((page_variables.PageId == 'Account Management Order History Page') || (page_variables.PageId == 'Order Details Page')
				|| ( (isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "orderHistory"))){
			tempProduct.productInfo.addToCartMethod = "Order History";
		}
		else if( (page_variables.PageId == 'Account Management Quote History Page') ||  (page_variables.PageId == 'QuoteDetails Page')
				|| ( (isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "nPAQuotes"))){
			tempProduct.productInfo.addToCartMethod = "NPA Quotes";
		}
		else if($("#isHomePage").val() == 'true'){
			if(( $('#pageZone').val() == "productOnSale") ||
					(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "productOnSale")){
				tempProduct.productInfo.addToCartMethod = "Home_Products On Sale";
			}else if(( $('#pageZone').val() == "mostPopularProduct") ||
					(isNotEmpty(getUrlParameter("analytics")) && getUrlParameter("analytics") == "mostPopularProduct")){
				tempProduct.productInfo.addToCartMethod = "Home_Most Popular Products";
			}
		}
		
		$('#pageZone').val('');
		digitalData.modal.product.push(tempProduct);
	}
	 _satellite.track('Add to Cart');
}

function populateAutoSugestionATCDataDom() {
	digitalData = {
		modal : {
			product : [ {
			           productInfo : {}
			} ]
		}
	};
	digitalData.modal.product[0].productInfo.addToCartMethod = "Type Ahead";
	digitalData.modal.product[0].productInfo.findingMethod = "Type Ahead";
	 _satellite.track('Add to Cart');
}
function populateDataDomForEmailingIDP() {
    digitalData = {
		modal : {
		  page : {
			  category : {
			      lineOfBusiness : ""
			},
				pageInfo : {
					  contentTitle : "",
					  language : "",
					  pageType : "",
					  pageUID : ""
				  }
				
		  },
    socialShare :{
    	shareSite : ""
    	
    }
	  }
};

digitalData.modal.page.category.lineOfBusiness = "Grainger Mexico"
digitalData.modal.page.pageInfo.contentTitle = "Send Product via email"
digitalData.modal.page.pageInfo.language = "es"
digitalData.modal.page.pageInfo.pageType = "Share Content"
digitalData.modal.page.pageInfo.pageUID = "Share Product Success " 
digitalData.modal.socialShare.shareSite = "Email"
	_satellite.track('Social Share');
}
function populateDataDomOnModalDisplayForEmailingIDP() {
    digitalData = {
		modal : {
		  page : {
			  category : {
			      lineOfBusiness : ""
			},
				pageInfo : {
					  contentTitle : "",
					  language : "",
					  pageType : "",
					  pageUID : ""
				  }
				
		  }
	  }
};

digitalData.modal.page.category.lineOfBusiness = "Grainger Mexico"
digitalData.modal.page.pageInfo.contentTitle = "Send Product via email"
digitalData.modal.page.pageInfo.language = "es"
digitalData.modal.page.pageInfo.pageType = "Share Content"
digitalData.modal.page.pageInfo.pageUID = "Share Product " 
	_satellite.track('Content: Modal View');
}

function populateDataDomForEmailingSharedCart(){
digitalData = {
		modal : {
		  page : {	
			  category : {
			      lineOfBusiness : ""
			},
				pageInfo : {
					  contentTitle : "",
					  language : "",
					  pageType : "",
					  pageUID : ""
				  }
				
		  },
socialShare :{
	shareSite : ""
	
}
	
	  }
};
digitalData.modal.page.category.lineOfBusiness = "Grainger Mexico"
digitalData.modal.page.pageInfo.contentTitle = "Send Cart via email"
digitalData.modal.page.pageInfo.language = "es"
digitalData.modal.page.pageInfo.pageType = "Share Content"
digitalData.modal.page.pageInfo.pageUID = "Share Cart Success"
digitalData.modal.socialShare.shareSite = "Email"
_satellite.track('Social Share');
}
function populateDataDomOnModalDisplayForEmailingSharedCart(){
digitalData = {
		modal : {
		  page : {	
			  category : {
			      lineOfBusiness : ""
			},
				pageInfo : {
					  contentTitle : "",
					  language : "",
					  pageType : "",
					  pageUID : ""
				  }
				
		  }
	  }
};
digitalData.modal.page.category.lineOfBusiness = "Grainger Mexico"
digitalData.modal.page.pageInfo.contentTitle = "Send Cart via email"
digitalData.modal.page.pageInfo.language = "es"
digitalData.modal.page.pageInfo.pageType = "Share Content"
digitalData.modal.page.pageInfo.pageUID = "Share Cart"
_satellite.track('Content: Modal View');
}

function populateOrderListModalDataDom() {
	digitalData.modal = {
			page : {
				pageInfo : {
					  contentTitle : "",
					  language : "",
					  pageType : "",
					  pageUID : ""
				  }
				},				
           event : [ {
			  eventInfo : {
				 eventName : ""
				 
			  },
			  primaryCategory : ""
		} ]
	};
	
	digitalData.modal.page.pageInfo.contentTitle = "Add to Order List";
	digitalData.modal.page.pageInfo.language = language;
	digitalData.modal.page.pageInfo.pageType = "Lists - Modal";
	digitalData.modal.page.pageInfo.pageUID = "Add To List";
	 if ((window.location.href.indexOf("/search") > -1) || page_variables.PageId == "Product Segments"
			|| page_variables.PageId == "Product Categories"
			|| page_variables.PageId == "Product Families") {
		digitalData.modal.event[0].eventInfo.eventName = "Search Engagement";
		digitalData.modal.event[0].primaryCategory = "internal search";
	}	
	 _satellite.track('Content: Modal View');
}

function addItemToOrderListModalDataDom(tempObj) {
	if (tempObj=="addCartItemToList"){
	    if( page_variables.CartItems){
	        digitalData.modal.product=[];
	    	for (i = 0; i < page_variables.CartItems.length; i++) {
	    		var tempProduct = {
	    					productInfo : {
	    						sku : ""
	    					}
	    		};
	    		tempProduct.productInfo.sku = page_variables.CartItems[i].ProductId;
	    		digitalData.modal.product.push(tempProduct);
	    	}
	    }
	}
	else{

	    digitalData.modal.product=[]
	    Object.keys(tempObj).forEach(function(key){
	        var tempProduct = {
	        			productInfo : {
	        				sku : key
	        			}
	        };
	        digitalData.modal.product.push(tempProduct);
	    })
	    }
	    _satellite.track('Add to List');
	}


function getInternalSearchAttributeType(q) {
	switch (q.toLowerCase()){
		case "category":
		case "price" : 
		case "shopby" : 
		case "brand" : return "Navigation";
		default : return "Technical";
	}
}

function getInternalSearchAttributeTemplate(){
	if (jQuery.urlParam("sort").length) return "Sort";
	else if (jQuery.urlParam("page").length) return "Pagination";
	else if (jQuery.urlParam("filterType") == "keyword") return "keyword";

	else return "Text";
}

function getInternalSearchFilterValue(q,template) {
	switch (template) {
		case "Sort" : return jQuery.urlParam("sort");
		case "keyword" : var removeToken = decodeURIComponent(jQuery.urlParam("remove_token").replace(/\+/g, " ")).split("|");
		return removeToken[removeToken.length-1];
		case "Pagination" : return parseInt(jQuery.urlParam("page"))+1;
		case "Text" : return getDecodedFilterValue(jQuery.urlParam("filterValue"));
		
		default : return q.split(":").reverse()[0].split("+").join(" ");
	}
}

function getDecodedFilterValue(aValue){
	
	return isNotEmpty(aValue) ? decodeURIComponent(aValue.toString().replace(/\+/g, " ")) : "";
}

function isSortFilterApplied(attributeTemplate){
	
	return (attributeTemplate == 'Sort');
}

function isSearchWithinApplied(attributeTemplate){
	
	return (jQuery.urlParam("type") == 'si' && attributeTemplate == 'keyword');
}

function isPaginationApplied(attributeTemplate){
	
	return (attributeTemplate == 'Pagination');
}

function isInternalSearch() {
	
	return ((window.location.href.indexOf("/search?text=") > -1) || 
            (window.location.href.indexOf("/search/?text=") > -1) ||
            (window.location.href.indexOf("/search?q=") > -1) || 
            (window.location.href.indexOf("/search/?q=") > -1) ||
            (window.location.href.indexOf("/search?sort=") > -1) || 
            (window.location.href.indexOf("/search/?sort=") > -1));
}

function isCategoryPage(){
	return (window.location.href.match(/\/c\/\d+/g)) != null ? true : false;
	
}

function getSearchTermForRedirect() {

	var searchTerm = "";
	try {
		if (window.location.href.indexOf("searchRedirect=") > -1) {
			var qSearch = getUrlParameter("searchRedirect");
			if (isEmpty(qSearch)) {
				if (window.location.href.indexOf("#") > -1) {
					var q = window.location.hash;
					var param = (q.substring(q.indexOf("searchRedirect")))
							.split("&");
					searchTerm = (param[0].substring(param[0].indexOf("=") + 1))
							.replace("+", " ");
					qSearch = decodeURIComponent(searchTerm);

				}
			}
			searchTerm = isNotEmpty(qSearch) ? qSearch.replace("+", " ") : "";
		}
	} catch (err) {
		console.log(err);
	}

	return searchTerm;
}

function getInternalSearchTerm(searchTerm) {
	if (searchTerm.indexOf(":") >= 0) {
		return searchTerm.split(":")[0];
	} else {
		return searchTerm.replace(/\+/g, "");
	}

}

function getPageUID(pgVr){
	
	switch(pgVr){
	case 'Product Segments':
		return "category";
	case 'Product Families':
		return "category";
	case 'Product Categories':
		return "category";
	default:
		return pgVr;
	}
}

