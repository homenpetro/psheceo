 

	 function showDropDown(divId)
	 {
		
		 jQuery('#' + divId).addClass('open');
	 }
	 
	 function hideDropDown(divId)
	 {
		
		 jQuery('#' + divId).removeClass('open');
	 }
	 
	 function showAllProductdet()
	 {
		 var elemwidth   = document.getElementById('prd_ctg_for_nav_comps');
		 var catlistlen  = elemwidth.getElementsByTagName("li").length;
		
		 if(catlistlen <= 15)
		 {
			 
			 elemwidth.style.width="238px";
			 elemwidth.className="dropdown-menu smalldropDown";
			 
		}
		if( !isHomePage()){
			var height = $('#prd_ctg_for_nav_comps').outerHeight();
			$("#customCatalogHoverMenu").css("height", height);
			if(catlistlen > 15 && catlistlen < 30){
				 elemwidth.className="dropdown-menu twoColDropDown";
				 $('.homepage').find('#eheader').find('#navSearchContainer').find('.allProducts > .dropdown-menu').css('width','238px');
				 $('.homepage').find('#eheader').find('#navSearchContainer').find('.headerContainer').find('.allProducts.open') .find('.twoColDropDown > ul:first-child').addClass('width100');
				 $('.homepage').find('#eheader').find('#navSearchContainer').find('.headerContainer').find('.allProducts.open') .find('.twoColDropDown > ul').addClass('width100');
				
			 }
			 
			 if(catlistlen >= 30 && catlistlen <= 45){
				 elemwidth.className="dropdown-menu threeColDropDown";
				 $('.homepage').find('#eheader').find('#navSearchContainer').find('.allProducts > .dropdown-menu').css('width','238px');
				 $('.homepage').find('#eheader').find('#navSearchContainer').find('.headerContainer').find('.allProducts.open') .find('.threeColDropDown > ul:first-child').addClass('width100');
				 $('.homepage').find('#eheader').find('#navSearchContainer').find('.headerContainer').find('.allProducts.open') .find('.threeColDropDown > ul').addClass('width100');
				
			 }
			 $('#isCustomCatalogsMenu').val()=== 'true' ? $('#prd_ctg_for_nav_comps').addClass('toggleCategoriesMenu') :'' ;
			 
		}
		  jQuery('#allProductsSubnav').addClass('open');
				 		 
	 }
	 

	 function hideAllProductdet()
	 {
		 jQuery('#allProductsSubnav').removeClass('open');
	 }

	 function changeLanguage(url){
		 var fromurl = encodeURIComponent(location.pathname + location.search + location.hash); 
		 var fullUrl = url + "&from="+fromurl;
		 $("#from").val(fromurl);
		 $("#changeLanguageLinkForm").submit();
		}
	 
	 function changeURLFromCart(url){
		 $("#fromUrl").val(location.pathname + location.search + location.hash);
		 $("#miniCartLinkForm").submit();
	}
	 
	 function refineSearchString() {		
		 if($.trim($("#refine-search-query").val()).length == 0) {
	        alert($("#searchErrorMsg").val());
	     } else {
	    	 var searchToken;
			 if($('#search_keyword').length > 0 && $('#search_keyword').val() != '') {			 
				 searchToken = $("#search_keyword").val() + " " + "+"+$("#refine-search-query").val();				 
				 if($("#remove_token").val().length > 0 && $('#remove_token').val() != '') {
					 $("#remove_token").val($("#remove_token").val()+"|"+$("#refine-search-query").val());					 
				 } else {					 
					 $("#remove_token").val($("#search_keyword").val()+"|"+$("#refine-search-query").val());
				 }
				 
			 } else {
				 searchToken = $("#refine-search-query").val();
				 $("#remove_token").val($("#refine-search-query").val());
			 }
			 var arr = $("#search_token").val().split(":");
			 var text = searchToken;
			 for (i = 1; i < arr.length; i++) { 
				 text += ":"+arr[i];
			 }			 
			 if (text.substring(0,1)=="+"){
				 $("#refine-search-query").val(text);
			 } else {
				 $("#refine-search-query").val("+" + text);
			 }
			 $("#searchbarRefineForm").submit();
			 $("#refine-search-query").val("");
	     } 
	 }
	 
	 function refineSearchEvent(event) {
		 if(event.keyCode == 13){
		    event.preventDefault();
			refineSearchString();
		 }
	 }
 
	 function isHomePage(){
		 return ($("#isHomePage").val() === 'true');
	 }