
var customCatalog = {
	// URLs
	setCatalogUrl : contextPath + "/customCatalog/setCatalog",

	// bind methods

	bindSelectCatalog : function() {
		$("#customCatalogSelect").change(function() {
			customCatalog.selectCatalog(this.value);
			return false;
		});
	},
	isHomePage : function(){
		 return ($("#isHomePage").val() === 'true');
	},
	
	// methods
	selectCatalog : function(catalogId) {
		$.ajax({
			cache : false,
			type : "GET",
			url : customCatalog.setCatalogUrl,
			data : {
				"catalogId" : catalogId
			},
			success : function(data) {
				if(customCatalog.isHomePage()){
					window.location.href = contextPath;	
				}else {
					//refresh on current page
					setTimeout(function(){
    	    		    location.reload();
    	    		},500);
				}
				
			}
		});
	}
};

function bindCatalogSelectionLink(aValue) {
		customCatalog.selectCatalog(aValue);
		return false;
}



function showSearchDropdown() {
	var searchLabel = jQuery('#searchLabel'),
		searchDropdown = jQuery('#searchDropdown');
	
	if(searchDropdown.is(':visible')) {
		searchDropdown.hide();
		return;
	}
	
	searchDropdown.show();
}

function setSearchOption(elem) {
	var el = jQuery(elem),
		searchOption = el.attr('data-searchoption'),
		searchOptionLabel = el.html();
	
	var ajaxCall = {
			type: "POST",
			url: "/customCatalogSelectOption",
			data: {ccoption:searchOption},
			cache: false,
			success: function(data){
				//This custom event will trigger a reset of compare. See compare.js
				jQuery(document).trigger('custom_catalog_view_switch');
				jQuery('#searchOptionCustomLabel').html(searchOptionLabel);
				//remove requestedPage info to land on first page for shop-4458
				var urlWOPageInfo = cmRemoveParameter("requestedPage", window.location.href);
				window.location.href = urlWOPageInfo;
				//force reload in case of hash
				if( window.location.hash ) {
					window.location.reload(true);
				}
			}
	};
	jQuery.ajax(ajaxCall);
}

jQuery(document).ready(function() {
	// click event handler for radio inputs
	// toggles between all products and smart catalog
	// specific to logged in user who has this setting to show inputs over dropdown
	jQuery("#catalogFilter input").not(":checked").on('click', function() {
		setSearchOption(this);
	});
});