var Pricing = {

		urls: {
			getProductPricingUrl: "/location/getProductPricing",
			getCartProductPricingUrl : "/checkout/single/getCartProductPricing"
		},

		isPriceWithoutTaxGroup : function() {
			return ($("#priceWithoutTAX").val() === 'true');
		},
		
		
		getProductPricing : function() {

			var products = Pricing.getProductListForPricingUpdates();
		

			if(typeof products == "undefined" || $.isEmptyObject(products) || !Session.isPageEnabledForAjaxPricing()){
				return;
			}
			//data may exclude Discontinued / online not available products
			var data = JSON.stringify(products);
			$.ajax({
				cache : false,
				type : 'POST',
				url :  contextPath + Pricing.urls.getProductPricingUrl,
				data : data,
				contentType : "application/json",
				success : function(data) {
					if (null != data && !jQuery.isEmptyObject(data)) {
						
						var taxRateToDisplay = localStorage.getItem("lastSearchedLocationTaxRate");
						
						//refresh tax rate labels at headers
						var prevTaxRateHeaders = $(".pricingHeaderDivision").find("span.taxRateValueToDisplay").text();
						if($.isNumeric(taxRateToDisplay) && $.isNumeric(prevTaxRateHeaders)){
							$(".pricingHeaderDivision").find("span.taxRateValueToDisplay").html(taxRateToDisplay);
						}
						
						//update pricing / tax at each item level
						$.each(data, function(index, result) {
							var prodcodeIndex = escapeProdSpecialCharacters(index);
							try {
								
								if($.isEmptyObject(result) ||$.isEmptyObject( result.price) ){
									return;	 
								}
								var productPriceData = result.price;
								var clearance = result.clearance;
								var onSale = productPriceData.onSale;
								var specialPrice = productPriceData.specialPrice;
								var savingPercentToDisplay = productPriceData.percentageSaving;
								var fmtSavingsValue = productPriceData.formattedSaving;

								var priceVal=Pricing.formatPriceForDisplay(productPriceData, productPriceData.formattedValue);
								var fmtListPrice = Pricing.formatPriceForDisplay(productPriceData, productPriceData.formattedListPrice);
								
								var catalogQuantity = productPriceData.catalogQuantity;
								var fmtSellPricePerCatQty = productPriceData.formattedSellPricePerCatQty;
								var rawPriceValue = Pricing.getRawPriceValue(priceVal);

								if (isNotEmpty(priceVal)) {
									
									//uniquely identify pricing element by classes 'pricingDivision' and 'prodPriceRender' 
									var origVal = $(".pricingDivision" + prodcodeIndex).find("span.prodPriceRender").text();
									if(isNotEmpty(origVal)){
										$(".pricingDivision" + prodcodeIndex).find("span.prodPriceRender").html(priceVal);	
									}

									//refresh striked prices for special priced items on formatted List prices
									if(onSale == true || clearance == true || specialPrice == true){
										$(".pricingDivision" + prodcodeIndex).find("span.strikedPriceRender").html(fmtListPrice);
									}

									var previousTaxDisplay = $(".pricingDivision" + prodcodeIndex).find("span.taxRateValueToDisplay").text();
									//refresh tax rate labels (both regular and striked Sale price labels)
									if($.isNumeric(taxRateToDisplay) && $.isNumeric(previousTaxDisplay)){
										$(".pricingDivision" + prodcodeIndex).find("span.taxRateValueToDisplay").html(taxRateToDisplay);
									}

									var previousSavingRate = $(".pricingDivision" + prodcodeIndex).find("div.saleTotal").find("span.percentSavingRender").text();
									//refresh savings value and percentage
									if($.isNumeric(savingPercentToDisplay) && savingPercentToDisplay > 0 &&  $.isNumeric(previousSavingRate)){
										$(".pricingDivision" + prodcodeIndex).find("div.saleTotal").find("span.percentSavingRender").html(savingPercentToDisplay);
									}

									var previousSavingValue = $(".pricingDivision" + prodcodeIndex).find("div.saleTotal").find("span.savingValueRender").text();
									if($.isNumeric(fmtSavingsValue) && fmtSavingsValue > 0 &&  $.isNumeric(previousSavingValue)){
										$(".pricingDivision" + prodcodeIndex).find("div.saleTotal").find("span.savingValueRender").html(fmtSavingsValue);
									}
									
									//update formatted Sell Price Per Catalog Qty
									var prevSellPricePerCatQty = $(".pricingDivision" + prodcodeIndex).find("span.prodSellPricePerCatQtyRender").text();
									if(catalogQuantity > 1 && isNotEmpty(prevSellPricePerCatQty) && isNotEmpty(fmtSellPricePerCatQty) ){
										$(".pricingDivision" + prodcodeIndex).find("span.prodSellPricePerCatQtyRender").html(fmtSellPricePerCatQty);	
									}
									
									if(Session.isSharedCartPage()){
										//update shared cart hidden item prices,then calculate totals for each line item
										$("#item-unit-price-" + prodcodeIndex).val(rawPriceValue);
										var qtySelector = 'input#product-desired-qty-'+ prodcodeIndex;
										updateItemQuantity(null, qtySelector );	
										
									}

								}
							}catch(e){
								console.log("Error to update Product Pricing and tax values " + e);
							}

						});
					}
				},
				failure : function(date) {
					console.log("Fetching of updated Pricing values failed");

				}
			});
		},
		
		//prepare list of product codes specific to each page needing pricing updates
		getProductListForPricingUpdates : function () {
			
			var products = {};

			var prodcode = '';

			if(Session.isSearchPage()){
				$(".prodCode").each(function() {
					prodcode = escapeProdSpecialCharacters( $(this).val());
					products[$(this).val()] = $("#qty" + prodcode).val();
				});
			} else if(Session.isMyListDetailsPage()  || Session.isSharedCartPage()){
				
				$(".prodCode").each(function() {
					
					  var pdQty = $("#product-desired-qty-" + escapeProdSpecialCharacters( $(this).val())).val();
					  if (!jQuery.isEmptyObject(pdQty) && pdQty != ''){
						  products[$(this).val()] = pdQty;
					  }
				  });
			} else if(Session.isProductListComponent()){
				
				$(".prodCode").each(function() {
					  prodcode = escapeProdSpecialCharacters( $(this).val());
					  products[$(this).val()] = $("#qty" + prodcode).val();
				  });
				
			}  else if(Session.isProductDetailsPage()){
				
				$(".pricingProdCode").each(function() {
					  prodcode = escapeProdSpecialCharacters( $(this).val());
					  products[$(this).val()] = 1;
				  });
				
			} 
			
			return products;
		},
		
		getValueOrBlank : function(aValue) {

			return (typeof aValue === "undefined" || !aValue || 0 === aValue.length) ? "" : aValue;
		},


		formatPriceForDisplay : function(aPriceData,aValue ) {

			var isoCurrency = Pricing.getValueOrBlank(aPriceData.currencyIso);
			var priceVal = Pricing.getValueOrBlank(aPriceData.value);
			var formatPrice = Pricing.getValueOrBlank(aValue);

			if(priceVal >0){

				if(isoCurrency == 'USD'){
					formatPrice = formatPrice + isoCurrency;
				}  
			} else {
				//display for FREE
				formatPrice = $("#freeTextPrice").val();

			}
			return formatPrice;
		},
		
		getRawPriceValue : function (aValue){
			
			return isNotEmpty(aValue) ? aValue.replace(/[\$,]/g,'') : '';
			
		},
		
		/**
		 * Updates middle Checkout and Delivery Payment page for Cart totals, sub-totals, Pricing and calculated Taxes. 
		 * Also toggles messaging / checkout button for unavailable items.
		 * 
		 * Note : Base item sell price from SAP Pricing service as well as Cart / entry level taxes 
		 * from Tax Paftlite service may change for border locations.
		 *  
		 ***/
		getCartProductPricing : function(zipCode,pickUpBranchId, deliveryMode,shipAddressId, callOnLoad) {

			var isCheckoutTaxRateRefresh = false;
			var lastRTATax = localStorage.getItem("lastSearchedLocationTaxRate");
			var previousTaxRate = isNotEmpty(lastRTATax) ? lastRTATax : $("#defaultTaxRateValue").val();
			var onLoad = (typeof callOnLoad != "undefined" && callOnLoad === true) ? true :false;
			
			$.ajax({
				cache : false,
				type : 'POST',
				url :  contextPath + Pricing.urls.getCartProductPricingUrl,
				data: { zipCode:zipCode, branchId:pickUpBranchId, deliveryMode:deliveryMode, shipAddressId: shipAddressId},
				dataType: "json",
				success : function(data) {

					if (null != data && !jQuery.isEmptyObject(data)) {

						var taxRateToDisplay = data['calcTaxRate'];

						if($.isNumeric(taxRateToDisplay)){
							localStorage.setItem("lastSearchedLocationTaxRate",
									taxRateToDisplay);
							$("#taxRateToDisplay").val(taxRateToDisplay);
							isCheckoutTaxRateRefresh = ($.isNumeric(previousTaxRate) && previousTaxRate != taxRateToDisplay) ? true
									: false;

						}

						
						//refresh tax rate labels at headers
						var prevTaxRateHeaders = $(".cartPricingTaxRate").find("span.taxRateValueToDisplay:first").text();
						if($.isNumeric(taxRateToDisplay) && $.isNumeric(prevTaxRateHeaders)){
							$(".cartPricingTaxRate").find("span.taxRateValueToDisplay").html(taxRateToDisplay);
						}
						Pricing.applyCartPricingUpdates(data);
						console.log("Applied pricing / tax updates");
					}
				},
				failure : function(e) {
					console.log("Failed to update Pricing values/ RTA on Cart Checkout");

				}
			});
		},

		//middle Checkout-Payment Delivery page updates
		applyCartPricingUpdates: function (data){

			if(Pricing.isPriceWithoutTaxGroup()){
				return;
			}
			$(".checkout-cartCustomProductDiscounts").addClass("hide");
			//update pricing / tax at each item level
			$.each(data, function(index, result) {
				var prodcodeIndex = escapeProdSpecialCharacters(index);
				try {

					if($.isEmptyObject(result) ){
						return;	 //loop next
					}

					if(prodcodeIndex.indexOf('cart') != -1){
						var cartPriceData = result;
						
						//update cart sub-totals, Freight, Taxes, Discounts and Totals with Tax included
						var cartValueFormatted = Pricing.formatPriceForDisplay(cartPriceData, cartPriceData.formattedValue);
						var cartPriceRawValue = cartPriceData.value;
						if (isNotEmpty(cartValueFormatted) && $.isNumeric(cartPriceRawValue) && cartPriceRawValue > 0) {
							$(".cartPricingSummary").find("span.cartPricing-"+prodcodeIndex).html(cartValueFormatted);
							if(Pricing.isCustomProductPromotionApplied(data)){
							$(".cartPricingSummary").find("div.checkout-"+prodcodeIndex).removeClass("hide");
							}
						}else if(prodcodeIndex == 'cartDeliveryCost' && isNotEmpty(cartValueFormatted) && cartPriceRawValue == 0) {
							$(".cartPricingSummary").find("span.cartPricing-"+prodcodeIndex).html($("#freeTextPrice").val());
						}
						return;
						
					} else if(prodcodeIndex.indexOf('item') != -1) {

						//Cart Item level updates - entry pricing, totals
						prodcodeIndex = prodcodeIndex.replace('item','');

						var orderItemBasePrice = result.basePrice; 
						var orderEntryTotal = result.totalPrice;
						var orderItemGiveAwayPrice = result.giveAwayPrice;

						if($.isEmptyObject(orderItemBasePrice) || $.isEmptyObject(orderEntryTotal)){
							return;	 
						}
						//update Order entry - item prices (base prices / giveAway prices)
						var entryBasePriceFmt = Pricing.formatPriceForDisplay(orderItemBasePrice, orderItemBasePrice.formattedValue);
						var oEntryBasePriceRawValue = orderItemBasePrice.value;
						var origBaseVal = $(".cartEntryPricing-" + prodcodeIndex).find("span.cartItemPricing").text();
						if (isNotEmpty(origBaseVal) && isNotEmpty(entryBasePriceFmt) && $.isNumeric(oEntryBasePriceRawValue) 
								&& oEntryBasePriceRawValue > 0) {
							$(".cartEntryPricing-" + prodcodeIndex).find("span.cartItemPricing").html(entryBasePriceFmt);
						}
						
						if(Pricing.isCustomProductPromotionApplied(data)){
							var entryGiveAwayPriceFmt = Pricing.formatPriceForDisplay(orderItemGiveAwayPrice, orderItemGiveAwayPrice.formattedValue);
							var oEntryGiveAwayPriceRawValue = orderItemGiveAwayPrice.value;
							var origGiveAwayVal = $(".cartEntryPricing-" + prodcodeIndex).find("span.cartItemPricing").text();
							if (isNotEmpty(origGiveAwayVal) && isNotEmpty(entryGiveAwayPriceFmt) && $.isNumeric(oEntryGiveAwayPriceRawValue) 
									&& oEntryGiveAwayPriceRawValue > 0 && oEntryGiveAwayPriceRawValue < oEntryBasePriceRawValue) {
								$(".cartEntryPricing-" + prodcodeIndex).find("span.cartItemPricing").html(entryGiveAwayPriceFmt);
							}
						}
						
						//update Order entry product totals 
						var orderEntryTotalFmt = Pricing.formatPriceForDisplay(orderEntryTotal, orderEntryTotal.formattedValue);
						var oEntryTotalRawValue = orderEntryTotal.value;
						var origTotalVal = $(".cartEntryPricing-" + prodcodeIndex).find("span.cartEntryTotalPricing").text();
						if (isNotEmpty(origTotalVal) && isNotEmpty(orderEntryTotalFmt) && $.isNumeric(oEntryTotalRawValue)
								&& oEntryTotalRawValue > 0) {
							$(".cartEntryPricing-" + prodcodeIndex).find("span.cartEntryTotalPricing").html(orderEntryTotalFmt);
						}

						return;
					}

				} catch(e){
					console.log("Error to update Cart Order totals / Entry Items Pricing and tax values " + e);
				}
			});

		},
		
		isCustomProductPromotionApplied : function(data) {
			var customPromotion = data.cartCustomProductDiscounts;
			return (!$.isEmptyObject(customPromotion)
				&& $.isNumeric(customPromotion.value) && customPromotion.value > 0) ? true
				: false;

		}
		
};


