var addCartToList;
var addQuoteToList;
$(document).ready(function() {
	addToList.bindAll();
	addCartToList = false;
	addQuoteToList =false;
	$('#create-a-new-list').keyup(function() {
		if($(this).val() !=null && $(this).val().length >= 75 ){
			$(this).val(jQuery.trim($(this).val()));	
		}
		
		});
	$('#create-a-new-list').keypress(function (e) {
            if (e.which == 13){
                return false;
            }
        });
});


var addToList = {
		quoteId: "",
		
		bindAddQuotetoMyListLink : function() {
			$('.addQuoteToList a').on('click', function() {
				if ($(this).hasClass('disabled')) {
					return;
				} else if($('.addQuoteToList').hasClass('disabled')){
					return;
				}
					Grainger.Modals.waitModal();
					$.ajax({
						type : "GET",
						url : contextPath + "/my-account/list/fullyAuthentication",
						cache : false,
						context : this,
						contentType : "application/json; charset=utf-8",
						success : function(data) {
							if (data == false) {
								window.location.href = "/login?frwdUrlPath=" + redirectPath();
							} else {
								addToList.quoteId=$(this).attr("data-quoteId");
								addQuoteToList = true;
								addToList.addEntryToList();
							}
						},
						complete : function() {
							Grainger.Modals.killWaitModal();
						},
						error : function(error) {
							console.log(error);
							window.location.href = "/login?frwdUrlPath=" + redirectPath();
						}
					});				
			});
		},
	bindAddCartoMyListLink : function() {
		$('.addToCartListLink a').on('click', function() {
			if ($(this).hasClass('disabled')) {
				return;
			}
			if ($('#isFullyAuthenticated').length > 0 && $('#isFullyAuthenticated').val() == "false") {
				window.location.href = "/login?frwdUrlPath=" + redirectPath();
			} else {
				Grainger.Modals.waitModal();
				$.ajax({
					type : "GET",
					url : contextPath + "/my-account/list/fullyAuthentication",
					cache : false,
					context : this,
					contentType : "application/json; charset=utf-8",
					success : function(data) {
						if (data == false) {
							window.location.href = "/login?frwdUrlPath=" + redirectPath();
						} else {							
							addCartToList = true;
							addToList.addEntryToList();
						}
					},
					complete : function() {
						Grainger.Modals.killWaitModal();
					},
					error : function(error) {
						console.log(error);
						window.location.href = "/login?frwdUrlPath=" + redirectPath();
					}
				});
			}
		});
	},

	addToListPPI : function(_aThis) {
		addToList.addToListCommon(_aThis);
		$("#loaderBlackModalID").addClass('hide');
	},
	
	bindAddtoMyListLink : function() {

		$('.addToMyList a').on('click', function() { 
			addToList.addToListCommon(this);
		});
		
	},
	
	bindAddtoProductGridListLink : function() {
		
		$('.componentaddToMyList a').on('click', function(e) {
			e.stopImmediatePropagation ();
			addToList.addToListCommon(this);
			$("#loaderBlackModalID").addClass('hide');
		});
	},
	
	addToListCommon : function(_aThis) {
		
		if ($(_aThis).hasClass('disabled')) {
			return;
		}
		$("#loaderBlackModalID").removeClass('hide');
		if ($('#isFullyAuthenticated').length > 0 && $('#isFullyAuthenticated').val() == "false") {
			window.location.href = "/login?frwdUrlPath=" + redirectPath();
		} else {
			$.ajax({
				type : "GET",
				url : contextPath + "/my-account/list/fullyAuthentication",
				cache : false,
				context : _aThis,
				contentType: "application/json; charset=utf-8",	            
				success : function(data) {
					if (data == false) {
						window.location.href = "/login?frwdUrlPath=" + redirectPath();
					} else {													
						var prodcode = $(_aThis).attr("productcode");
					
						$('#productCode-modal').val(prodcode);

						var productqty = parseInt($(_aThis).attr("productqty"));
						if ($(_aThis).attr("data-page") == "IDP") {
							productqty = $('#quantity' + prodcode).val();
						}
						else if ($(_aThis).attr("data-page") == "search") {
							productqty = $('#qty' + prodcode).val();
						}					
						$('#productQuantity-modal').val(productqty);
						addCartToList = false;
						addToList.addEntryToList();
					}
				},
				complete : function(){
					$("#loaderBlackModalID").addClass('hide');
				},
				error : function(error) {
					console.log(error);
					window.location.href = "/login?frwdUrlPath=" + redirectPath();
				}
			});
		}
	
	},
	bindAddtoMyListCancel : function() {
		$('#addItemToList-cancel').on('click', function() {
			$('#mdlAddToOL').addClass('hide');
			$('#mdlAddToOL').hide();
			$('#mdlAddToOL').removeClass('modal modal-window commerce');
			$('.modal-backdrop').hide();
			$('#myListName, #corporateListName, #favouriteListName').empty();
			$('#mdlAddToOL input[type=text]').val("");
			$('.mdl-order-list input').removeAttr('disabled');
			$('#mdlAddToOL, #add-product-to-list-backdrop, .message-wrap p, .mdl-content .add, .mdl-content .create, #addItemToList-close').hide();
		});
	},
	bindAddtoMyListClose : function() {
		$('#addItemToList-close').on('click', function() {
			addToList.closeModalAndReturnToOriginalState();
			$('#mdlAddToOL').addClass('hide');
			$('#mdlAddToOL').hide();
			$('#mdlAddToOL').removeClass('modal modal-window commerce');
			$('.modal-backdrop').hide();
		});
	},
	bindSelectAll : function() {
		$("#mdlAddToOL .mdl-tab-contents").on("click", ".select-all", function() {
			$('#' + $(this).parent().parent().attr('id') + ' :checkbox').prop("checked", ($(this).is(':checked') ? true : false));
		});
	},

	bindAll : function() {
		addToList.bindAddtoMyListLink();
		addToList.bindAddCartoMyListLink();
		addToList.bindAddQuotetoMyListLink();
		addToList.bindAddtoMyListCancel();
		addToList.bindAddItemToList();
		addToList.bindSelectAll();
		addToList.bindAddtoMyListClose();
		addToList.bindAddtoExistingListOption();
		addToList.bindAddtoNewListOption();
		addToList.bindFilterSearchInput();
		addToList.bindAddtoProductGridListLink();
	},

	addEntryToList : function() {
		$('#mdlAddToOL').addClass('modal modal-window commerce');
		$('#mdlAddToOL').removeClass('hide');
		$('#mdlAddToOL').show();
		$('<div class="modal-backdrop"></div>').insertBefore('#mdlAddToOL');
		addToList.getUsersList();
		$('#myListResults').show();
	},
	getUsersList : function() {

		var myListFlag = false,
			corporateFlag = false;
		$('.not-found, .add-to-list-header-text-area-empty').hide();

		$.ajax({
			type : "GET",
			url : contextPath + "/my-account/ajaxlists/getAllLists",
			cache : false,
			success : function(data) {
				$('#myListName, #corporateListName, #favouriteListName').empty();
				if (data.length > 0) {
					$.each(data, function(index, element) {
						if (this.listType == 'CORPORATE_LIST') {
							if (!corporateFlag) {
								$("#corporateListName").append("<li class='check-all true'> <input type='checkbox' name='myList' class='select-all mls' id='checkUncheckAll' value=''><label for='checkUncheckAll'>" + $('#checkAllText').val() + "</label></li>");
							}

							$("#corporateListName").append("<li class='addToListResults " + this.favorite + "'><input type='checkbox' id='" + this.listPK + "' name='CorporateList' class='corporateListCheckbox addToListModalCheckboxes mlm' value='" + this.listPK + "'><label for='" + this.listPK + "'>" + this.listName + "</label></li>");
							corporateFlag = true;
						} else {
							if (!myListFlag) {
								$("#myListName").append("<li class='check-all true'> <input type='checkbox' name='myList' class='select-all mlm' id='checkUncheckAll' value=''><label for='checkUncheckAll'>" + $('#checkAllText').val() + "</label></li>");
							}

							$("#myListName").append("<li class='addToListResults " + this.favorite + "'> <input type='checkbox' id='" + this.listPK + "' name='myList' class='myListCheckbox addToListModalCheckboxes mlm' value='" + this.listPK + "'><label for='" + this.listPK + "'>" + this.listName + "</label></li>");
							myListFlag = true;
						}
					});
					if (myListFlag) {
						$('.my-list-empty-text').hide();
						$('.select-multiple').show();
					} else {
						$('.my-list-empty-text').show()
						$('.select-multiple').hide();
					}
					if (corporateFlag) {
						$('.corporate-list-empty-text').hide();
						$('.select-multiple').show();
					} else {
						$('.corporate-list-empty-text').show();
						$('.select-multiple').hide();
					}
					$("#addProductRadio").removeAttr('disabled').trigger("click").next().css('opacity', '1');
					if (corporateFlag && !myListFlag) {
						$('.corporate-list-tab a').trigger('click');
					}
				} else {
					//initialize no lists
					$("#addProductRadio").attr('disabled', 'disabled').next().css('opacity', '.5');
					$("#createNewRadio").trigger("click");
					$('#create-a-new-list').focus();
					$('.add-to-list-filter').attr('disabled', 'disabled');
					$('.initial-no-list-created-message').show();
					$('#addItemToList, #addItemToList-cancel').show();
					$('#addItemToList-close').hide();
					
				}
			}
		});
		try {
			populateOrderListModalDataDom();
		} catch (err) {
			console.log(err);
		}

	},

	bindAddItemToList : function() {
		$('#addItemToList').on("click", function(e) {
			e.stopImmediatePropagation ();
			$('.message-wrap p').hide();

			var tempObj = {};
			if ($('#productQuantity-modal').val() == null || parseInt($('#productQuantity-modal').val()) <= 0) {
				$('.add-to-list-invalid-qty').show();
				return;
			}
			tempObj[String($('#productCode-modal').val())] = String($('#productQuantity-modal').val());

			if ($('#addProductRadio').is(':checked')) {
				var corpArray = [];
				var myArray = [];

				$(".my-order-lists").find('input[type=checkbox]:checked').each(function() {
					if (!$(this).hasClass('select-all')) {
						$(this).hasClass('myListCheckbox') ? myArray.push($(this).val()) : corpArray.push($(this).val());
					}
				});

				if (myArray.length == 0 && corpArray.length == 0) {
					$('.add-to-list-select').show();
				} else {
					if (corpArray.length) {
						addToList.addItemToList(tempObj, (corpArray.toString()), corpArray.length);
					}
					if (myArray.length) {
						addToList.addItemToList(tempObj, (myArray.toString()), myArray.length);
					}
				}
			} else {
				var data = {};
				data["listName"] = $('#create-a-new-list').val();
				data["listType"]="MyList"; //GPAN specific
				$(".create_list_error_div").text("");
				$("#addItemToList").addClass("disabled");
				$.ajax({
					type : "POST",
					contentType : "application/json",
					url : contextPath + "/my-account/ajaxlists/create",
					data : JSON.stringify(data),
					dataType : "json",
					cache : false,
					success : function(data) {
						var dataSplit = data.split(":");
						if (dataSplit[0] === "success") {
							var result = "";
							var pkArray = [];
							pkArray.push(dataSplit[1]);
							result = pkArray.toString();
							addToList.addItemToList(tempObj, result);
						} else {
							$(".create_list_error_div").text(data).show();
							$(".create_list_error_div").removeClass('hide');
							$('#addItemToList, #addItemToList-cancel').show();
							$('#addItemToList-close').hide();
						}
					},
					complete : function () {
                        $("#addItemToList").removeClass("disabled");
                    }
				});
			}
		});

	},

	addItemToList : function(tempObj, result, listCount) {
		$(".add-list-max-quantity").hide();
		$('.add_product_list_error_div_list').html("");
		$('#addItemToList, #addItemToList-cancel').show();
		$("#addItemToList").addClass("disabled");
		var data1;
		var url;
		if (typeof addCartToList != 'undefined' && addCartToList) {
			data1 = null;
			url = contextPath + "/my-account/ajaxlists/addCartToMultipleListsGpan?pkStringList=" + encodeURI(result);
		} else if(typeof addQuoteToList != 'undefined' && addQuoteToList){
			data1 = null;
			url = contextPath + "/my-account/ajaxlists/addQuoteToMultipleListsGpan?pkStringList=" + encodeURI(result)+"&quoteId="+addToList.quoteId;
		} else {
			data1 = JSON.stringify(tempObj);
			url = contextPath + "/my-account/ajaxlists/addItemsToMultipleLists?pkStringList=" + encodeURI(result);
		}

		$.ajax({
			type : "POST",
			contentType : "application/json",
			url : url,
			cache : false,
			data : data1,
			success : function(data) {
				if (data === "success") {
					$('#addItemToList, #addItemToList-cancel').hide();
					if ($('#addProductRadio').is(':checked')) {
						$('.add-list-success-message1, #addItemToList-close').show();
					} else {
						$('.create-list-success-message1, #addItemToList-close').show();
					}
					$('.mdl-order-list input').attr('disabled', 'disabled');
						$('#mainContent').hide();					

					try {
						if (data1) {
							addItemToOrderListModalDataDom(tempObj);
						} else {
							addItemToOrderListModalDataDom("addCartItemToList");
						}
					} catch (err) {
						console.log(err);
					}
			
				}
			else{						
					var listOfLists = "";
					var failedCount = 0;
					$.each(data, function(result, val) {
						if (listOfLists !== "") {
							listOfLists += "<br/>";
						}
						listOfLists += $("input[value='" + result + "']").parent().text();
						failedCount++;
					});
					if (listOfLists !== "") {
						if (listCount > failedCount) {
							$('.add-list-success-message2').show();
							$('.add-list-success-message1').hide();
							try {
								addItemToOrderListModalDataDom("addCartItemToList");
							} catch(err) {
								console.log(err);
							}
						}
						$(".add-list-max-quantity").show();
					}
				}
			},
			complete : function () {
                $("#addItemToList").removeClass("disabled");
            }
		});
	},

	closeModalAndReturnToOriginalState : function() {
		$('#myListName, #corporateListName, #favouriteListName').empty();
		$('#mdlAddToOL input[type=text]').val("");
		$('.mdl-order-list input').removeAttr('disabled');
		$('#mdlAddToOL, .message-wrap p, .mdl-content .add, .mdl-content .create, #addItemToList-close').hide();
		$('#addItemToList, #addItemToList-cancel').show();
		$('#mainContent').show();
		$('.my-list-tab a').trigger('click');
	},
	
	bindAddtoExistingListOption : function() {
		$('#addProductRadio').on('click', function() {
			$('.my-list-tab a').trigger('click');
			$('.mdl-content .create, .message-wrap p').hide();
			$('.mdl-content .add').fadeIn();
			$('.mdl-tab-contents :checkbox').prop("checked", false);
			$('.filterListInput').removeClass('hide-filter');
		});

		
	},
	bindAddtoNewListOption : function() {
		$('#createNewRadio').on('click', function() {
			
			$('.mdl-content .add, .message-wrap p').hide();
			$('.mdl-content .create').fadeIn();
			$('#create-a-new-list').val('').focus();
			$('#create-a-new-list').focus();
			$('.filterListInput').addClass('hide-filter');
		});
	},
	bindFilterSearchInput : function() {
		$('#mdlAddToOL .add-to-list-filter').keyup(function() {
			$('.add-to-list-filter').val().length > 0 ? $('.search-wrap .search-icon').addClass('clear-icon') : $('.search-wrap .search-icon').removeClass('clear-icon');

			var that = this,
				$allListElements = $('ul#myListName > li.addToListResults');
			var $matchingListElements = $allListElements.filter(function(i, li) {
				var listItemText = $(li).text(),
					searchText = that.value;
				return ~(listItemText.toLowerCase()).indexOf(searchText.toLowerCase());
			});

			$allListElements.hide();

			if ($matchingListElements.length > 0) {
				$('.not-found').hide();
				$('li.check-all').show();
				$matchingListElements.show();
			} else {
				if ($('.add-to-list-filter').val().length > 0) {
					$('li.check-all').hide();
					$('.not-found').show();
				}
			}
		});

		// clear search 	
		$("#mdlAddToOL").on("click", ".clear-icon", function() {
			$('#mdlAddToOL .search').val('').trigger('keyup');
			$('#mdlAddToOL .add-to-list-filter').focus();
		});

	}
}


function redirectPath() {
	var pathName = location.pathname;
	pathName = pathName.replace(ACC.config.contextPath, "");

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
	return pathName + search;
}