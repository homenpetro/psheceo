var ACC = ACC || {};
ACC.autocomplete = {

	bindAll: function ()
	{
		this.bindSearchAutocomplete();
		this.searchHistory.bindSearchHistory();
	},

	bindSearchAutocomplete: function ()
	{
		var $search = $("#search");
		var option  = $search.data("options");
		var cache   = {};

		if (option)
		{
		
			jQuery("#search").autocomplete({
                minLength: option.minCharactersBeforeRequest,
                delay:     option.waitTimeBeforeRequest,
                appendTo:  ".siteSearch",
                source:    function(request, response) {

                    var term = request.term.toLowerCase();

                    if (term in cache) {
                        return response(cache[term]);
                    }

                    $.getJSON(option.autocompleteUrl, {term: request.term}, function(data) {
                        var autoSearchData = [];
                        if(data.suggestions != null){
                            $.each(data.suggestions, function (i, obj)
                            {
                                autoSearchData.push(
                                        {value: obj.term.replace(/"/g,"&quot;"),
                                            url: ACC.config.contextPath + "/search?text=" + encodeURIComponent(obj.term)+"&"+ACC.suggestLeftSuggestion,
                                            type: "autoSuggestion"});
                            });
                        }
                        if(data.prdCategories != null){
                        	$.each(data.prdCategories, function (i, obj)
                            {
                        		autoSearchData.push(
                                        {value: obj.name.replace(/"/g,"&quot;"),
                                            url: ACC.config.contextPath + obj.url.replace(/"/g,"%22").replace(/#/g,"%23").replace(/&/g,"%26")+"?"+ACC.suggestLeftProdCategories,
                                            type: "prdCategories"});
                            });
                        }
                        if(data.brands != null){ 
                            $.each(data.brands, function (i, obj)
                            {
                                autoSearchData.push(
                                        {value: obj.name!=null ? obj.name.replace(/"/g,"&quot;"): "",
                                            url: obj.name!=null ? ACC.config.contextPath + "/search?text="+encodeURIComponent(obj.name)+"&"+ACC.suggestLeftBrand: "",
                                            type: "brandResult"});
                            });
                        }
                        if(data.products != null){
                            $.each(data.products, function (i, obj)
                            {
                                autoSearchData.push(
                                        {
                                        	value: obj.name!=null?obj.name.replace(/"/g,"&quot;"):"",
                                            code: obj.code!=null?obj.code:"",
                                            desc: obj.description!=null?obj.description:"",
                                            manufacturer: obj.manufacturer!=null? obj.manufacturer:"",
                                            pbc: obj.onlineAvailabilityStatus,
                                            url: obj.url!=null?ACC.config.contextPath + obj.url.replace(/"/g,"%22").replace(/#/g,"%23").replace(/&/g,"%26"):"",
                                            price: obj.price!=null?obj.price.formattedValue:"",
                                            type: "productResult",
                                            salesStatus:obj.salesStatus!=null?obj.salesStatus:"",
                                            minOrderQty: obj.pricerMinimumPurchaseQty!=null?obj.pricerMinimumPurchaseQty : 1,
                                            image: obj.images!=null?obj.images[0].url:"",
                                            isProductReferences: obj.isProductReferences!=null?obj.isProductReferences:false});
                                 
                            		
                            });
                        }
                        
                        if(data.categories != null){
                            $.each(data.categories, function (i, obj)
                            {
                            	
                                autoSearchData.push(
                                        {value: obj.name!=null ? obj.name.replace(/"/g,"&quot;"):"",
                                            code: obj.code!=null? obj.code: "",
                                            desc: obj.description!=null ?obj.description : "",
                                            url: obj.url!=null ? ACC.config.contextPath + obj.url.replace(/"/g,"%22").replace(/#/g,"%23").replace(/&/g,"%26"):"",
                                            type: "categoryResult",
                                            image: obj.images!=null?obj.images[0].url:""});
                            });
                        }
                        cache[term] = autoSearchData;
                        return response(autoSearchData);
                    });
                },
                focus: function (event, ui)
                {
                    return false;
                },
                select: function (event, ui)
                {
                	if(ui.item.url.indexOf("?") > -1)
                		window.location.href = ui.item.url+"&searchBar=true";
                	else
                		window.location.href = ui.item.url+"?searchBar=true";
                }
            }).focus(function(){
                jQuery("#search").autocomplete("search");
            });
		}
	},
	
	getLanguage : function() {
		var lang = ACC.config.currentLanguage;
        if (lang == null || isBlank(lang)) {
                 lang = "es";
         }
         return lang;
	},
	
	isLoggedIn : function() {
		return ($('#isLoggedIn') ? $('#isLoggedIn').val() : false);
	},
	
	isSearchTermEmpty : function() {
		return ($('#search').val() == '' || $.trim( $('#search').val() ) == '');
	},
	
	searchHistory : {
		COOKIE_NAME : 'searchTerms_',
		FOCUS_PREVIOUS : 0,
		FOCUS_NEXT : 1,
		
		searchTermsCount : 0,
		focusedItem : -1,
		
		bindSearchHistory : function() {
			$(document).on('click', '#autoComplete li.autoSuggestion, #searchHistory li.previousSearchTerm', function (e) {
				e.preventDefault();
				var link = $(this).find('a');
				var term = link.attr('title');
				if (term != undefined && term != '') {
					ACC.autocomplete.searchHistory.saveSearchTerm(term);
					window.location = link.attr('href');
				}
			});
			$('#search').on('input', function(e) {
				if (ACC.autocomplete.isSearchTermEmpty()) {
					ACC.autocomplete.searchHistory.showSearchHistory();
				}
			 	else { 
			 		ACC.autocomplete.searchHistory.hideSearchHistory();
			 	}
			});
			$(document).on('mouseenter', '.previousSearchTerm', function(e) {
				ACC.autocomplete.searchHistory.setFocusedItem($(e.target).parent().data('index'));
			});
			$(document).on('click', 'li.clearHistory a', function(e) {
				e.preventDefault();
				ACC.autocomplete.searchHistory.clearSearchTerms();
			});
			$('#search').on('keydown', function(e) {
				if (ACC.autocomplete.searchHistory.searchTermsCount > 0
						&& $('#searchHistory').is(':visible')) {
					if (e.which == 38) {
						ACC.autocomplete.searchHistory.moveFocus(ACC.autocomplete.searchHistory.FOCUS_PREVIOUS);
					}
					else if (e.which == 40) {
						ACC.autocomplete.searchHistory.moveFocus(ACC.autocomplete.searchHistory.FOCUS_NEXT);
					}
					else if (e.which == 13) {
						if (ACC.autocomplete.searchHistory.focusedItem != -1) {
							var link = ACC.autocomplete.searchHistory.getFocusedItemLink();
							var term = link.attr('title');
							if (term != undefined && term != '') {
								e.preventDefault();
								ACC.autocomplete.searchHistory.saveSearchTerm(term);
								window.location = link.attr('href');
							}
							else if (ACC.autocomplete.searchHistory.getFocusedItem().hasClass('clearHistory')) {
								e.preventDefault();
								ACC.autocomplete.searchHistory.clearSearchTerms();
							}
						}
					}
				}
			});
		},
		
		getSearchTermsFromCookie : function() {
			var language = ACC.autocomplete.getLanguage();
			var searchTerms = [];
			var searchTermsCookie = jQuery.cookie(ACC.autocomplete.searchHistory.COOKIE_NAME + language);
			if (searchTermsCookie != undefined && searchTermsCookie != "") {
				searchTerms = searchTermsCookie.split("||");
			}
			return searchTerms;
		},
		
		saveSearchTermsToCookie : function(searchTerms) {
			var language = ACC.autocomplete.getLanguage();
			jQuery.cookie(
					ACC.autocomplete.searchHistory.COOKIE_NAME + language,
					searchTerms.join("||"), {
						path : "/",
						expires : 30,
						secure : true
					});
		},
		
		saveSearchTerm : function(searchTerm) {
			if (ACC.autocomplete.isLoggedIn()) {
				this.saveLoggedInUserSearchTerm(searchTerm);
			}
			else {
				this.saveAnonymousUserSearchTerm(searchTerm);
			}
		},
		
		saveLoggedInUserSearchTerm : function(searchTerm) {
			$.ajax({
				cache : false,
				type : "GET",
				url : "/search/saveSearchTerm",
				data : {term: searchTerm}
			});
		},
		
		saveAnonymousUserSearchTerm : function(searchTerm) {
			if($("#search").length > 0) {
				var options  = $("#search").data("options");
				var maxTerms = options.searchHistoryMaxTerms;
				var maxLength = options.searchHistoryTermMaxLength;
				
				if (searchTerm.length > maxLength) {
					return;
				}
				
				var searchTerms = this.getSearchTermsFromCookie();
				var i;
				for (i=0; i<searchTerms.length; i++) {
					if (searchTerms[i].toUpperCase() == $.trim(searchTerm).toUpperCase()) {
						searchTerms.splice(i, 1);
						break;
					}
				}
				
				searchTerms.unshift(searchTerm);
				this.removeEarliestSearchTerms(searchTerms, maxTerms);
				this.saveSearchTermsToCookie(searchTerms);
			}
		},
		
		checkAndRemoveEarliestSearchTerms : function() {
			if($("#search").length > 0) {
				var maxTerms  = $("#search").data("options").searchHistoryMaxTerms;
				var searchTerms = this.getSearchTermsFromCookie();
				var modified = this.removeEarliestSearchTerms(searchTerms, maxTerms);
				if (modified) {
					this.saveSearchTermsToCookie(searchTerms);
				}
			}
		},
		
		removeEarliestSearchTerms : function(searchTerms, maxTerms) {
			if (searchTerms.length > maxTerms) {
				var count = searchTerms.length - maxTerms;
				for (i=0; i<count; i++) {
					searchTerms.pop();
				}
				return true;
			}
			return false;
		},
		
		populatePreviousSearchTerms : function() {
			if (ACC.autocomplete.isLoggedIn()) {
				this.populateLoggedInUserSearchTerms();
			}
			else {
				this.populateAnonymousUserSearchTerms();
			}
		},
		
		populateLoggedInUserSearchTerms : function() {
			$.ajax({
				cache : false,
				type : "GET",
				url : "/search/previousSearchTerms",
				success : this.populateSearchHistory
			});
		},
		
		populateAnonymousUserSearchTerms : function() {
			var terms = this.getSearchTermsFromCookie();
			this.populateSearchHistory(terms)
		},
		
		populateSearchHistory : function(terms) {
			if (terms == undefined || terms.length == 0) {
				return;
			}
			var ul = $('#previousTerms');
			if (ul.length > 0) {
				var i;
				for (i=0; i<terms.length; i++) {
					var url = contextPath + '/search?text=' + encodeURIComponent(terms[i]) + '&' + ACC.suggestHistory;
					ul.append(
							'<li class="previousSearchTerm ui-menu-item"'
							+ ' id="searchHistory-item-' + i + '" data-index="' + i + '">'
							+ '<a href="' + url + '" title="' + htmlEncode(terms[i]) + '" class="no-underline bold">'
							+ htmlEncode(terms[i]) + '</a></li>'
						);
				}
				var clearHistoryMsg = $('#searchmsg_clearhistory').val();
				ul.append(
						'<li class="previousSearchTerm ui-menu-item clearHistory"'
						+ ' id="searchHistory-item-' + i + '" data-index="' + i + '">'
						+ '<a href="#" class="no-underline bold">'
						+ '<span>' + clearHistoryMsg + '</span></a></li>'
					);
				//$('#searchHistory').append(ul);
				if (terms)
				ACC.autocomplete.searchHistory.searchTermsCount = terms.length + 1;
			}
		},
		
		showSearchHistory : function() {
			if (ACC.autocomplete.searchHistory.searchTermsCount > 0) {
				$('#autoComplete').addClass('hide');
				$('#previousTerms').show();
				$('#searchHistory').removeClass('hide');
				//$('#searchHistory').css('height', $('#previousTerms').outerHeight());
			}
		},
		
		hideSearchHistory : function() {
			ACC.autocomplete.searchHistory.setFocusedItem(-1);
			$('#searchHistory').addClass('hide');
		},
		
		setFocusedItem : function(index) {
			ACC.autocomplete.searchHistory.focusedItem = index;
			$('.previousSearchTerm').removeClass('ui-state-focus');
			$('#searchHistory-item-' + index).addClass('ui-state-focus');
		},
		
		moveFocus : function(direction) {
			var index = ACC.autocomplete.searchHistory.focusedItem;
			var maxIndex = ACC.autocomplete.searchHistory.searchTermsCount - 1;
			if (direction == ACC.autocomplete.searchHistory.FOCUS_PREVIOUS) {
				index = (index == 0) ? maxIndex : index - 1;
			}
			else if (direction == ACC.autocomplete.searchHistory.FOCUS_NEXT) {
				index = (index == maxIndex) ? 0 : index + 1;
			}
			ACC.autocomplete.searchHistory.setFocusedItem(index);
		},
		
		getFocusedItem : function() {
			return $('#searchHistory-item-' + ACC.autocomplete.searchHistory.focusedItem);
		},
		
		getFocusedItemLink : function() {
			var item = this.getFocusedItem();
			return $(item).find('a');
		},
		
		clearSearchTerms : function() {
			if (ACC.autocomplete.isLoggedIn()) {
				this.clearLoggedInUserSearchTerms();
			}
			else {
				this.clearAnonymousUserSearchTerms();
			}
		},
		
		clearLoggedInUserSearchTerms : function() {
			this.hideSearchHistory();
			$.ajax({
				cache : false,
				type : "GET",
				url : "/search/clearSearchTerms",
				success : function() {
					$('#previousTerms').empty();
				}
			});
		},
		
		clearAnonymousUserSearchTerms : function() {
			this.hideSearchHistory();
			this.saveSearchTermsToCookie([]);
			$('#previousTerms').empty();
		}
	}

};

$(document).ready(function ()
{
	ACC.autocomplete.bindAll();
	$('#quick-search-submit').click(function(event) 
			{
		 event.preventDefault();
			if(ACC.autocomplete.isSearchTermEmpty())
			{
				
				alert($('#searchErrorMsg').val());
				$('#search').val('');
			}
			else
			{
				ACC.autocomplete.searchHistory.saveSearchTerm($('#search').val());
			 $('#searchbarHeader').submit();
			}
			});
	ACC.autocomplete.searchHistory.checkAndRemoveEarliestSearchTerms();
	ACC.autocomplete.searchHistory.populatePreviousSearchTerms();
	if($('#search').val()!='') {
        $('.control-group .search-icon').removeClass('hide');
    }
});
$(document).click(function(e) {
 	if ($(e.target).is('#autoComplete, #searchHistory, #searchbarHeader #search, #autoComplete *, #searchHistory *')) {
 		$('#bulk-order .dropdown').removeClass('open');
 		if ($(e.target).is('#search') && (ACC.autocomplete.isSearchTermEmpty())) {
 			ACC.autocomplete.searchHistory.showSearchHistory();
 	 	}
 		return;
 	}
 	else { 
 		$('#autoComplete').addClass('hide');
 		ACC.autocomplete.searchHistory.hideSearchHistory();
 		if ($(e.target).is('#searchbar-icon')) {
 	        $('.control-group #search').val('');
 	        $('.control-group .search-icon').addClass('hide');
 	    }
 	}
});