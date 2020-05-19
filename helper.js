(function($,Grainger){
    "use strict";    
    if(typeof Grainger !== 'object'){
        throw new Error('Grainger.helper requires initialized Grainger namespace.');
    }
    
    if(typeof Grainger._messages !== 'object'){
        throw new Error('Grainger.helper requires Grainger._messages.');
    }
    
    if(typeof Grainger.rootJsUrl === 'undefined') {
        throw new Error('Grainger.helper requires Grainger.rootJsUrl to be set.');
    }
    
    if(typeof Grainger.helper !== 'object'){
        Grainger.helper = {};
    }
    
    if(typeof $ === 'undefined'){
        throw new Error('Grainger.helper requires jQuery.');
    }
    
    var SalesStatus = Grainger.enums.SalesStatus;
    
    /*
     * Grainger.helper.MessageHelper is a globally available helper object
     * that emulates Spring's MessageSource interface. The purpose of this
     * object is to provide client-side JS code access to messages defined
     * in message property files.
     *  
     */
    var MessageHelper = {
        getMessage : function(messageCode,args) {
            if(typeof args === 'undefined') {
                args = [];
            } else if(!$.isArray(args)) {
                args = [args];
            }
            
            var msg = '';
            if(Grainger._messages[messageCode]) {
                msg = Grainger._messages[messageCode];
                
                //Java properties containing a single quote and args
                //are escaped by Java code. These properties will contain
                //two single quotes. We need to removed the extra quote.
                msg.replace("''","'");
                $.each(args,function(i,v){
                    msg = msg.replace('{' + i + '}',v);
                });
            } else {
                console.warn('Message code ' + messageCode + ' not found.');
            }
            return msg;
        }
    };
    
    var UomFormatter = {
        format : function(product) {           
            if(!$.isPlainObject(product) || !$.isPlainObject(product.contentUnitData)) {
                console.warn('Product content unit not found. Cannot render UOM');
                return '';
            }        
            var messageCode = 'product.price.' + product.contentUnitData.code;
            return ' / ' + MessageHelper.getMessage(messageCode,product.contentUnitData.quantity);
        }
    };
    
    /*
     * The Grainger.helper.PriceRenderer can be used in cases that require
     * product price to be rendered from javascript. It follows the same general
     * logic of the price formatter JSP tag that is used server-side.
     * 
     * The PriceRenderer provides a single method 'render' that expects a JSON-encoded
     * ProductData DTO (or subset of it). The example below shows the minimal amount of data
     * that should be provided for a mostly correct rendering:
     * 
     * var html = Grainger.helper.PriceRenderer.render({
     *    priceData : {        //Price data is required
     *      currencyIso : "USD",
     *      extendedPrice : 23.52,
     *      listPrice : 23.52,
     *      invoicePrice : 0,
     *      onSale : false,
     *      csp : false,
     *      isResellerPrice: false     *      
     *    },
     *    salesStatus : "ST",  //Required
     *    refrigerant : false, //Defaults to false
     *    contentUnitData : {  //Required if you need to show UOM
     *      code : "EA",
     *      quantity : 10
     *    }
     * });
     */
    var PriceRenderer = {
            
            _formatPrice : function (price) {
                if(typeof price === 'undefined' || price === null) {
                    console.warn('Price argument empty');
                    return '';
                }
                price = price.toFixed(2);
                return '$' + price;
            },
            render : function(product,showLabel) {
                
                if(!$.isPlainObject(product)) {
                    throw new Error('Grainger.helper.PriceRenderer.render expects an object.');
                }
                
                if(!$.isPlainObject(product.priceData)) {
                    throw new Error('Price data missing from argument. Cannot render price.');
                }
                
                if(typeof product.salesStatus === 'undefined') {
                    throw new Error('Sales status missing from argument. Cannot render price.');
                }
                
                showLabel = (typeof showLabel === 'undefined') ? true : showLabel;
                
                var html = '';
                if(SalesStatus.isDiscontinued(product.salesStatus)) {
                    html += '<p class="regularPrice discontinued">';
                    
                    if(showLabel) {
                        html += MessageHelper.getMessage('product.priceLabelWithColon');
                        html += '<span class="price>' + MessageHelper.getMessage('product.noPriceApplicable') + '</span>';
                    }
                    html += UomFormatter.format(product);
                    html += '</p>';
                    
                } else if(product.refrigerant) {
                    
                    html += '<p class="productPrice">';
                    
                    if(showLabel) {
                        html += '<span class="priceLabel">' + MessageHelper.getMessage('product.priceLabelWithColon') + '</span>';
                    }
                    
                    html += '<span class="callForPrice">' + MessageHelper.getMessage('product.callforprice') + '</span>';
                    html +=   '<a data-placement="right" data-toggle="tooltip" href="#" data-html="true" data-original-title="' + 
                                        MessageHelper.getMessage('product.callForPrice.info') + '">';
                    html +=   '</a>';
                    html += '</p>';
                       
                } else {
                    if(product.priceData.csp) {
                        html += '<p class="csp-price productPrice">';
                        
                        if(showLabel) {
                            html+= MessageHelper.getMessage('product.cspPriceLabelWithColon') + ' ';
                        }
                        
                        html += '<span class="priceRow">';
                        html +=    '<span class="price">' + this._formatPrice(product.priceData.extendedPrice) + '</span>';
                        html += UomFormatter.format(product);
                        html += '</span>';
                        html += '</p>';
                        
                    } else {
                        if(SalesStatus.isClearance(product.salesStatus) && product.priceData.extendedPrice == product.priceData.listPrice) {
                            html += '<p class="regularPrice">';
                            
                            if(showLabel) {
                                html += '<span class="priceLabel">'+ MessageHelper.getMessage('product.priceLabelWithColon') + '</span><br />';
                            }
                            
                            html += '<span class="price">' + this._formatPrice(product.priceData.extendedPrice) + '</span>';
                            html += UomFormatter.format(product);
                            html += '</span>';
                            html += '</p>';
                            
                        } else if(SalesStatus.isClearance(product.salesStatus) || product.priceData.onSale){
                            html += '<p class="sale-price">';
                            if(showLabel) {                            	
                            	if(SalesStatus.isClearance(product.salesStatus)){
                            		html += MessageHelper.getMessage('product.clearancePriceLabelWithColon') +'<br />';                                         
                            	}else if(product.priceData.onSale){
                            		html += MessageHelper.getMessage('product.salePriceLabelWithColon') + '<br />';
                            	} 
                            }
                            
                            html += '<span class="priceRed">' + this._formatPrice(product.priceData.extendedPrice) + '</span>';
                            html += '<span class="forEach">' + UomFormatter.format(product) + '</span>';
                            html += '</span>';
                            html += '</p>';
                            
                            html += '<div class="reducedPriceLabel">';
                            
                            if(showLabel) {
                                html += MessageHelper.getMessage('product.priceLabelWithColon') + ' ';
                            }
                            
                            html += '<span class="strikedPrice">' + this._formatPrice(product.priceData.listPrice) + '</span>';
                            html += '<span class="forEach">' + UomFormatter.format(product) + '</span>';
                            html += '</div>';
                            
                        } else {
                            html += '<p class="regularPrice">';
                            
                            if(showLabel) {
								html += '<span class="priceLabel">';
                                html += MessageHelper.getMessage('product.priceLabelWithColon') + ' ';
								html += '</span>';
                            }
                            html += '<span class="price">' + this._formatPrice(product.priceData.extendedPrice) + '</span>';
                            html += UomFormatter.format(product);
                            html += '</p>';
                            
                        }
                    }
                        
                }
                return html;
            }
        };
    
	var UserHelper = {

		_data : {},

		_getData : function(key) {
			
			if ($.isEmptyObject(this._data)) {
				// load data from local storage if available, else load from server.
				$.ajax({
					url : '/UserInfoController/getUserInfo',
					async : false,
					dataType : 'json',
					success : function(data) {
						UserHelper._data = data;
					},
					error : function(jqXHR, statusText, error){
						console.log(error);
	                }
				});
				
			}
			return typeof this._data[key] !== 'undefined' ? this._data[key] : null;			
		},
		
		getIpAddress : function() {
			var ipAddress = this._getData('ipAddress');
			return ipAddress;
		},
		
		isLoggedIn : function() {
			return $.cookie('logged_in') === 'Yes';
		}
	};
	
    Grainger.helper.PriceRenderer = PriceRenderer;
    Grainger.helper.MessageHelper = MessageHelper;
    Grainger.helper.UomFormatter = UomFormatter;
	Grainger.helper.UserHelper = UserHelper;
    
})(jQuery,Grainger);
