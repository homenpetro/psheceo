jQuery(document).ready(function() {
    jQuery('html').on('click',function(e) {
        var currentValue = jQuery('#showUsers-list').attr("aria-expanded");
        if(e.target.id == 'labelText') {
            e.stopPropagation();
        }
        else {
            if (currentValue == "true") {
                OrderManagementCustomSetup.removeDropDown();
            }
        }
    });

    jQuery('body').on('keypress', '#employeespendlimit', function(e) {
        // if enter key
       if(e.keyCode === 13) {
          jQuery('#save-spend-limit-btn').trigger('click');
       };
    });

    jQuery('.sortOrderFields').click(function(){
    	var linkHref = jQuery(this).attr("href");
    	if(jQuery(this).hasClass("sort")){
    		jQuery(this).attr("href",linkHref+"&sortOrder=ASC");
    	}
    	else{
    		jQuery(this).attr("href",linkHref+"&sortOrder=DESC");
    	}
    });
});

var validUnitedStatesUPSTrackingNumberPattern = /\b(1Z ?[0-9A-Z]{3} ?[0-9A-Z]{3} ?[0-9A-Z]{2} ?[0-9A-Z]{4} ?[0-9A-Z]{3} ?[0-9A-Z]|[\dT]\d\d\d ?\d\d\d\d ?\d\d\d)\b/;


/* *****************************************************
    JavaScript specific for the Order Management System
   ***************************************************** */

/*
 * Contains methods which are used throughout the OMS pages
 */
var OrderManagementUtility = OrderManagementUtility || {};
OrderManagementUtility.clearTextOnFocus = function (clearme) {
    "use strict";
    jQuery("#" + clearme).val('');
};

OrderManagementUtility.clearTextOnFocusObject = function (clearme) {
    "use strict";
    clearme.val('');
};

OrderManagementUtility.scrollAZBarDiv = function(anchor, offset) {
	"use strict";
	var topPos;
    if(jQuery('html').hasClass('lt-ie8')) { //TODO: Need to find best practice now for browser checks.. Modernizer? Does jQuery still support browser checks?

        topPos = document.getElementById(anchor).offsetTop;
    }
    else {
        topPos = document.getElementById(anchor).offsetTop - offset;
    }
	
	document.getElementById('oms-approver-info-container').scrollTop = topPos;	

};

OrderManagementUtility.doModalAnalytics = function(variables) {
    "use strict";
    //Analytics Code
    modal_variables = variables;
    modal_item_variables = modal_variables;
    
    try {
        jQuery(document).trigger("grainger.modal.open", ["ModelLoaded"]);
    } catch(err) {
        console.log("Error publishing the event for Bright Tag");
    }
};

/*
 * Pending Activity Dashboard Modal -- Will be changed later
 */
var PendingActivityDashboard = PendingActivityDashboard || {};
PendingActivityDashboard.dialog = null;
PendingActivityDashboard.dialogID = "pendingactivitydashboardmodal";

PendingActivityDashboard.Active_Admins_Dialog_Open = function () {
    "use strict";
    var hrefStr = "/myaccount/dashboardadminsmodalpage";

    Grainger.Modals.waitModal(PendingActivityDashboard.dialogID, PendingActivityDashboard.dialogID);

    jQuery.ajax({
        url: hrefStr,
        cache: false,
        success: function(data) {
            Grainger.Modals.createAndShowModal(PendingActivityDashboard.dialogID, PendingActivityDashboard.dialogID, data);
        }
    });
};

PendingActivityDashboard.Dialog_Close = function () {
    "use strict";
    Grainger.Modals.killModal();
};

/////////////////////////////////////////////////////////////////
//Order management custom setup "namespace"                    //
//Probably going to refactor soon to be just for Step One code //
/////////////////////////////////////////////////////////////////
var OrderManagementCustomSetup = OrderManagementCustomSetup || {};
OrderManagementCustomSetup.ajaxBasePath    = "/oms/customSetup/";
OrderManagementCustomSetup.editInProgress  = false;
OrderManagementCustomSetup.approvalEditInProgress  = false;
OrderManagementCustomSetup.cachedStepTwoSwimLane = {};
OrderManagementCustomSetup.cachedEditData  = {};
OrderManagementCustomSetup.cachedApprovalData  = {};
OrderManagementCustomSetup.cachedStepThreeSwimLane = {};

//Below are localized strings. They are set up when the page is loaded.
OrderManagementCustomSetup.allOrdersRequireApproval = "";
OrderManagementCustomSetup.doesNotRequireApproval   = "";
OrderManagementCustomSetup.editSmallText            = "";
OrderManagementCustomSetup.deleteSmallText          = "";
OrderManagementCustomSetup.updateSmallText          = "";
OrderManagementCustomSetup.cancelSmallText          = "";
OrderManagementCustomSetup.noApprovalRights         = "";
OrderManagementCustomSetup.canApproveAnyOrder       = "";
//End localization

OrderManagementCustomSetup.breadCrumbOnLoad = function () {
    
    jQuery("#user-actions").addClass("omsUserAction");
    
    if(window.location.href.indexOf("omsSelectApproversPage") != -1){
        jQuery("#step2link").removeClass("hide");
    } else if(window.location.href.indexOf("omssetupstepthree") != -1) {
        jQuery("#step3link").removeClass("hide");
    } else if(window.location.href.indexOf("omsreviewsetup") != -1) {
        jQuery("#step4link").removeClass("hide");
    }
    
    jQuery("#omsBreadcrumbs").removeClass("hide");
    
};

OrderManagementCustomSetup.customSetupStepOneLoad = function () {
    "use strict";
    var omsSetupContinue = jQuery('#omsSetupContinue');

    omsSetupContinue.on('click', function () {
        window.location.replace('/myaccount/ordermanagement/omsSelectApproversPage');
    });
};

OrderManagementCustomSetup.removeDropDown = function () {
    
    OrderManagementCustomSetup.ariaUsabilityToggle();
    jQuery("#step2_dropdown").addClass("hidden");
    jQuery("#management-show-all-users").removeClass("active");
    
};

OrderManagementCustomSetup.processAllUsers = function (){
    jQuery(".adminUser").removeClass("hide");
    jQuery(".standardUser").removeClass("hide");
    jQuery("#downDownLabel").html(jQuery("#allText").html());
    
    
    var approvers = jQuery(".approver-name");
    
    OrderManagementCustomSetup.processApproverList(approvers);
        
};

OrderManagementCustomSetup.processAdminUsers = function () {
    jQuery(".adminUser").removeClass("hide");
    jQuery(".standardUser").addClass("hide");
    jQuery("#downDownLabel").html(jQuery("#adminText").html());
    
    
    var approvers = jQuery(".admin_approver");
    
    OrderManagementCustomSetup.processApproverList(approvers);
};

OrderManagementCustomSetup.processStdUsers = function () {
    jQuery(".adminUser").addClass("hide");
    jQuery(".standardUser").removeClass("hide");
    jQuery("#downDownLabel").html(jQuery("#standardText").html());
    
        
    var approvers = jQuery(".standard_approver");
    
    OrderManagementCustomSetup.processApproverList(approvers);
    
};

OrderManagementCustomSetup.processApproverList = function (approvers) {
    jQuery("#alpha").find("li").removeClass("active");
    jQuery(".alpha-header").addClass("hide");
    jQuery("#dropDownList").removeClass("open");
    
    if(approvers.size() < 20){
        jQuery("#alpha").addClass("hide");
    } else {
        jQuery("#alpha").removeClass("hide");
        approvers.each(function( index ) {
            var letter = jQuery(this).html();
            letter = letter.substring(0,1);
            letter = letter.toUpperCase();
            jQuery("#_" + letter).parent().removeClass("hide");
            jQuery("#" + letter).parent().addClass("active");
        });
    }
    
};

// called from manageLimitsModal.jsp
// yeah, it has nothing in it... ?
OrderManagementCustomSetup.manageLimitsModalLoad = function () {
    "use strict";
};

OrderManagementCustomSetup.manageLimitsFragmentLoad = function () {
    "use strict";

    var newSpendLimitTextBox     = jQuery('#create-new-spend-limit'),
        newApprovalLimitTextBox  = jQuery('#create-new-approval-limit'),
        addToSpendListButton     = jQuery('#addToSpendListButton'),
        addToApproverListButton  = jQuery('#addToApproverListButton');
    var addApprovalOrSpendLimitUrl=jQuery('#addApprovalOrSpendLimitUrl').val();
    jQuery('#create-new-approval-limit, #create-new-spend-limit').on('focus', function() {
        OrderManagementUtility.clearTextOnFocusObject(jQuery(this));
    });

	addToSpendListButton.on('click', function () {
    	jQuery("#addSpendLimitErrorTxt").addClass("hide");
    	jQuery(".alert").addClass("hide");
    	var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    	var dataToPost = {};
        dataToPost.limit =  newSpendLimitTextBox.val();
        dataToPost.limitType="sl"; 
        dataToPost._requestConfirmationToken=requestConfirmationTokenVal;
        jQuery.ajax({
            url: addApprovalOrSpendLimitUrl,
            data: dataToPost,
            dataType: "json",
            type: "POST",
            success: function (response, ioArgs) {
                jQuery("#currentSpendLimitsList").empty();
                newSpendLimitTextBox.val("");
                OrderManagementCustomSetup.refreshSpendLimitList();
            },
            error: function (xhr,errorMessage,textStatus) {
            	if(xhr.status==401){
            		window.location.reload();
            	}
            	var resp = $.parseJSON(xhr.responseJSON);
            	var spendErrorBlock = jQuery("#addSpendLimitErrorTxt");
            	spendErrorBlock.html(resp.error);
                spendErrorBlock.removeClass("hide");
            }
        });
    });

    newSpendLimitTextBox.on("keypress", function (e) {
    	
    	
        if(e.keyCode === 13) {
            addToSpendListButton.click()
        }
    });

    //Add Approver Limit Button
    addToApproverListButton.on('click', function () {
    	var approverErrorBlock = jQuery("#addApproverLimitErrorTxt");
    	approverErrorBlock.addClass("hide");
    	$('.alert').addClass("hide");
    	var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    	var dataToPost =  {};
        dataToPost.limit =  newApprovalLimitTextBox.val();
        dataToPost.limitType="al";
        dataToPost._requestConfirmationToken=requestConfirmationTokenVal;
        jQuery.ajax({
            url: addApprovalOrSpendLimitUrl,
            data: dataToPost,
            dataType: "json",
            type: "POST",
            success: function (response, ioArgs) {
                jQuery("#currentApproverLimitsList").empty();
                newApprovalLimitTextBox.val("");
                OrderManagementCustomSetup.refreshApproverLimitList();
            },
            error: function (xhr,errorMessage,textStatus) {
                if(xhr.status==401){
                	window.location.reload();
                }
                var resp = $.parseJSON(xhr.responseJSON);
                approverErrorBlock.html(resp.error);
            	approverErrorBlock.removeClass("hide");
            }
        });
    });

    newApprovalLimitTextBox.on('keypress', function (e) {
        if(e.keyCode === 13) {
            addToApproverListButton.click();
        }
    });	
};

OrderManagementCustomSetup.editSpendLimit = function (pk) {
    "use strict";
    // ID has periods in it, need to escape it so jQuery selectors to work
    var pkEscapedPeriod = pk.indexOf('.') === -1 ? pk : pk.split('.')[0] + '\\.' + pk.split('.')[1];
    var pkEscaped = pkEscapedPeriod.indexOf(',') === -1 ? pkEscapedPeriod : pkEscapedPeriod.replace(/,/g, "\\,");
    if (OrderManagementCustomSetup.editInProgress) {
        OrderManagementCustomSetup.restoreEditSpendLimit();
    }
    OrderManagementCustomSetup.editInProgress = true;

    var listElementToEdit, tempUpdateBox, tempUpdateLink, tempCancelLink, spendErrorBlock;
    spendErrorBlock = jQuery("#addSpendLimitErrorTxt");
    spendErrorBlock.addClass("hide");
    listElementToEdit = jQuery("#" + pkEscaped);
    
    OrderManagementCustomSetup.cachedEditData.pk = pk; 
    OrderManagementCustomSetup.cachedEditData.node = listElementToEdit.html();
    OrderManagementCustomSetup.cachedEditData.amt = jQuery("#" + pkEscaped + "amtRaw").html();

    listElementToEdit.html('');
    listElementToEdit.append('<input type="text" id="newval_' + pk + '" maxlength="10" value="' + OrderManagementCustomSetup.cachedEditData.amt + '" />');
    listElementToEdit.append('<a href="javascript:void(0);" id="update_' + pk + '">' + OrderManagementCustomSetup.updateSmallText + '</a>');
    listElementToEdit.append(' | <a href="javascript:void(0);" id="cancel_' + pk + '">' + OrderManagementCustomSetup.cancelSmallText + '</a>');
    $('.alert').addClass("hide");
    tempUpdateBox  = jQuery('#newval_' + pkEscaped)
    tempUpdateLink = jQuery('#update_' + pkEscaped)
    tempCancelLink = jQuery('#cancel_' + pkEscaped)

    tempUpdateLink.on('click', function () {
        var sendObject = {};
        var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
        sendObject.limitId  = OrderManagementCustomSetup.cachedEditData.pk;
        sendObject.newLimit =  tempUpdateBox.val();
        sendObject.limitType="sl";
        sendObject._requestConfirmationToken=requestConfirmationTokenVal;
        var editApprovalOrSpendLimitUrl=jQuery("#editApprovalOrSpendLimitUrl").val();
        jQuery.ajax({
            url: editApprovalOrSpendLimitUrl,
            data: sendObject,
            dataType: "json",
            type: "POST",
            success: function (response, ioArgs) {
            	response = JSON.parse(response);
            	if(response.error != undefined){
            		jQuery("#addSpendLimitErrorTxt").html(response.error);
            		jQuery("#addSpendLimitErrorTxt").removeClass("hide");
            	}
            	else if (response.success != undefined){
            		jQuery("#addSpendLimitSuccessTxt").removeClass("hide");
            	}
            	if(response.confirm) {
                    var dialogContent = jQuery("#editSpendTooltipDialog");

                    dialogContent.removeClass('hide');

                    jQuery("#editSpendTooltipDialogUpdate").unbind().click(function () {
                    	sendObject.confirmed = true;
                    	jQuery.ajax({
                            url: editApprovalOrSpendLimitUrl,
                            data: sendObject,
                            dataType: "json",
                            type: "POST",
                            success: function (response, ioArgs) {
                            	jQuery("#currentSpendLimitsList").empty();
                                OrderManagementCustomSetup.editInProgress = false;
                                OrderManagementCustomSetup.refreshSpendLimitList();
                                jQuery("#addSpendLimitSuccessTxt").removeClass("hide");
                            },
                            complete: function(response, ioArgs) {
                            	dialogContent.addClass('hide');
                            	OmsDashboardLimitsModal.popupDisplayed = false;
                            }
                        });
                    });
                    
                    jQuery("#editSpendTooltipDialogCancel").on('click', function () {
                    	dialogContent.addClass('hide');
                    	OmsDashboardLimitsModal.popupDisplayed = false;
                    	$("#limitsLable").click();
                    });
            	} else {
                    jQuery("#currentSpendLimitsList").empty();
                    OrderManagementCustomSetup.editInProgress = false;
                    OrderManagementCustomSetup.refreshSpendLimitList();
                }
            },
            error: function (errorMessage) {
            	spendErrorBlock.removeClass("hide");
            	OrderManagementCustomSetup.restoreEditSpendLimit();
            }
        });
    });

    tempCancelLink.on('click', function () {
        OrderManagementCustomSetup.restoreEditSpendLimit();
        OrderManagementCustomSetup.editInProgress = false;
    });

};

OrderManagementCustomSetup.restoreEditSpendLimit = function () {
    "use strict";
    var pk = OrderManagementCustomSetup.cachedEditData.pk;
    // ID has periods in it, need to escape it so jQuery selectors to work
    pk = pk.indexOf('.') === -1 ? pk : pk.split('.')[0] + '\\.' + pk.split('.')[1];
    pk = pk.indexOf(',') === -1 ? pk : pk.replace(/,/g, "\\,");
    jQuery("#"+pk).html(OrderManagementCustomSetup.cachedEditData.node);
    OrderManagementCustomSetup.editInProgress = false;
};

//This method below needs to show a confirmation dialog before allowing deletion. More
//Service logic will be needed to add this functionality -- possibly next sprint.
OrderManagementCustomSetup.removeSpendLimit = function (pk) {
    "use strict";
    var sendObject = {};
    var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    // ID has periods in it, need to escape it so jQuery selectors to work
    var pkEscaped = pk.indexOf('.') === -1 ? pk : pk.split('.')[0] + '\\.' + pk.split('.')[1];
    sendObject.limitId = pk;
    sendObject.confirmed = false;
    sendObject._requestConfirmationToken=requestConfirmationTokenVal;
    
    var removeSpendLimitUrl=jQuery("#removeApprovalOrSpendLimitUrl").val();
    jQuery.ajax({
        url: removeSpendLimitUrl,
        data: sendObject,
        dataType: "json",
        type: "POST",
        success: function (response, ioArgs) {
        	response=JSON.parse(response);
        	if(response.confirm) {
        	    var updatePos = jQuery('#' + pkEscaped + 'delete').position(),
                    dialogContent = jQuery("#deleteSpendTooltipDialog");

                dialogContent.removeClass('hide');

                OmsDashboardLimitsModal.popupDisplayed = true;
                
                jQuery("#deleteSpendTooltipDialogUpdate").on('click', function () {
                	sendObject.confirmed = true;
                    jQuery.ajax({
                        url: removeSpendLimitUrl,
                        data: sendObject,
                        dataType: "json",
                        type: "POST",
                        success: function (response, ioArgs) {   ;
                        	jQuery("#currentSpendLimitsList").empty();
                            OrderManagementCustomSetup.refreshSpendLimitList();
                        },
                        complete: function(response, ioArgs) {
                        	dialogContent.addClass('hide');
                        	OmsDashboardLimitsModal.popupDisplayed = false;
                        }
                    });
                });
                
                jQuery("#deleteSpendTooltipDialogCancel").on('click', function () {
                	dialogContent.addClass('hide');
                	OmsDashboardLimitsModal.popupDisplayed = false;
                });
        	} else {
                jQuery("#currentSpendLimitsList").empty();
                OrderManagementCustomSetup.refreshSpendLimitList();
            }
        },
        error: function (errorMessage) {
            alert(errorMessage);
        }
    });
};

OrderManagementCustomSetup.editApproverLimit = function (pk) {
    "use strict";

    var pkEscapedPeriod = pk.indexOf('.') === -1 ? pk : pk.split('.')[0] + '\\.' + pk.split('.')[1];
    var pkEscaped = pkEscapedPeriod.indexOf(',') === -1 ? pkEscapedPeriod : pkEscapedPeriod.replace(/,/g, "\\,");
    if (OrderManagementCustomSetup.approvalEditInProgress) {
        OrderManagementCustomSetup.restoreApproverLimit();
    }
    OrderManagementCustomSetup.approvalEditInProgress = true;

    var listElementToEdit, tempUpdateBox, tempUpdateLink, tempCancelLink, approverErrorBlock;
    listElementToEdit = jQuery("#"+pkEscaped);
    approverErrorBlock = jQuery("#addApproverLimitErrorTxt");
    approverErrorBlock.addClass("hide");
    $('.alert').addClass("hide");
    OrderManagementCustomSetup.cachedApprovalData.pk = pk; //May not need this part... Keeping for now
    OrderManagementCustomSetup.cachedApprovalData.node = listElementToEdit.html();
    OrderManagementCustomSetup.cachedApprovalData.amt  = jQuery("#"+pkEscaped + "amtRaw").html();

    listElementToEdit.html('');
    listElementToEdit.append('<input type="text" id="newval_' + pk + '" maxlength="10" value="' + OrderManagementCustomSetup.cachedApprovalData.amt + '" />');
    listElementToEdit.append('<a href="javascript:void(0);" id="update_' + pk + '">' + OrderManagementCustomSetup.updateSmallText + '</a>');
    listElementToEdit.append(' | <a href="javascript:void(0);" id="cancel_' + pk + '">' + OrderManagementCustomSetup.cancelSmallText + '</a>');

    tempUpdateBox  = jQuery('#newval_' + pkEscaped);
    tempUpdateLink = jQuery('#update_' + pkEscaped);
    tempCancelLink = jQuery('#cancel_' + pkEscaped);

    tempUpdateLink.on('click', function () {

        var sendObject = {};
        
        sendObject.limitId  = OrderManagementCustomSetup.cachedApprovalData.pk;
        sendObject.newLimit =  tempUpdateBox.val();
        sendObject.confirmed = false;
        sendObject.limitType="al";
        var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
        sendObject._requestConfirmationToken=requestConfirmationTokenVal;
        
    var    editApprovalOrSpendLimitUrl=jQuery("#editApprovalOrSpendLimitUrl").val();
        
        jQuery.ajax({
            url: editApprovalOrSpendLimitUrl,
            data: sendObject,
            dataType: "json",
            type: "POST",
            success: function (response, ioArgs) {
            	$('.alert').addClass("hide");
            	response = JSON.parse(response);
            	if(response.error != undefined){
            		jQuery("#addApproverLimitErrorTxt").html(response.error);
            		jQuery("#addApproverLimitErrorTxt").removeClass("hide");
            	}
            	else if (response.success != undefined){
            		jQuery("#addApproverLimitSuccessTxt").removeClass("hide");
            	}
            	if(response.confirm) {
            		var updatePos = tempUpdateLink.position();
            		var dialogContent = jQuery("#editApprovalTooltipDialog");

                    dialogContent.removeClass('hide');

                    OmsDashboardLimitsModal.popupDisplayed = true;
                    
                    jQuery("#editApprovalTooltipDialogUpdate").unbind().click(function () {
                    	sendObject.confirmed = true;
                    	jQuery.ajax({
                            url: editApprovalOrSpendLimitUrl,
                            data: sendObject,
                            dataType: "json",
                            type: "POST",
                            success: function (response, ioArgs) {
                            	jQuery("#currentApproverLimitsList").empty();
                                OrderManagementCustomSetup.approvalEditInProgress = false;
                                OrderManagementCustomSetup.refreshApproverLimitList();
                                jQuery("#addApproverLimitSuccessTxt").removeClass("hide");
                            },
                            complete: function(response, ioArgs) {
                            	dialogContent.addClass("hide");
                            	OmsDashboardLimitsModal.popupDisplayed = false;
                            }
                        });
                    });
                    
                    jQuery("#editApprovalTooltipDialogCancel").on('click', function () {
                    	dialogContent.addClass("hide");
                    	OmsDashboardLimitsModal.popupDisplayed = false;
                    	$("#limitsLable").click();
                    });
            	}
            	else {
                	jQuery("#currentApproverLimitsList").empty();
                    OrderManagementCustomSetup.approvalEditInProgress = false;
                    OrderManagementCustomSetup.refreshApproverLimitList();
                }
            },
            error: function (errorMessage) {
            	approverErrorBlock.removeClass("hide");
            	OrderManagementCustomSetup.restoreApproverLimit();
            }
        });
    });

    tempCancelLink.on('click', function () {
        OrderManagementCustomSetup.restoreApproverLimit();
        OrderManagementCustomSetup.approvalEditInProgress = false;
    });
};

OrderManagementCustomSetup.removeApproverLimit = function (pk) {
    "use strict";
    var sendObject = {}, pkEscaped = pk.indexOf('.') === -1 ? pk : pk.split('.')[0] + '\\.' + pk.split('.')[1];
    sendObject.limitId = pk;
    sendObject.confirmed = false;
    var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    sendObject._requestConfirmationToken=requestConfirmationTokenVal;
    
    var removeApprovalLimitUrl=jQuery("#removeApprovalOrSpendLimitUrl").val();
    jQuery.ajax({
        url: removeApprovalLimitUrl,
        data: sendObject,
        dataType: "json",
        type: "POST",
        success: function (response, ioArgs) {
        	response=JSON.parse(response);
        	if(response.confirm) {
        		var updatePos = jQuery('#' + pkEscaped + "delete").position();
        		var dialogContent = jQuery("#deleteApprovalTooltipDialog");

                dialogContent.removeClass('hide');

                OmsDashboardLimitsModal.popupDisplayed = true;
                
                jQuery("#deleteApprovalTooltipDialogUpdate").on('click', function () {
                	sendObject.confirmed = true;
                    jQuery.ajax({
                        url: removeApprovalLimitUrl,
                        data: sendObject,
                        dataType: "json",
                        type: "POST",
                        success: function (response, ioArgs) {   
                            jQuery("#currentApproverLimitsList").empty();
                            OrderManagementCustomSetup.refreshApproverLimitList();
                        },
                        complete: function(response, ioArgs) {
                        	dialogContent.addClass("hide");
                        	OmsDashboardLimitsModal.popupDisplayed = false;
                        }
                    });
                });
                
                jQuery("#deleteApprovalTooltipDialogCancel").on('click', function () {
                	dialogContent.addClass("hide");
                	OmsDashboardLimitsModal.popupDisplayed = false;
                });
        	}
        	else {
                jQuery("#currentApproverLimitsList").empty();
                OrderManagementCustomSetup.refreshApproverLimitList();
            }
        },
        error: function (errorMessage) {
            alert(errorMessage);
        }
    });
};

OrderManagementCustomSetup.restoreApproverLimit = function () {
    "use strict";
    var pk = OrderManagementCustomSetup.cachedApprovalData.pk;
    // ID has periods in it, need to escape it so jQuery selectors to work
    pk = pk.indexOf('.') === -1 ? pk : pk.split('.')[0] + '\\.' + pk.split('.')[1];
    pk = pk.indexOf(',') === -1 ? pk : pk.replace(/,/g, "\\,");
    jQuery("#"+pk).html(OrderManagementCustomSetup.cachedApprovalData.node);
    OrderManagementCustomSetup.approvalEditInProgress = false;
};

OrderManagementCustomSetup.submitApprovers = function(formID, step, errorID) {
	
	if(jQuery("#adminText").html() == jQuery("#downDownLabel").html()){
		jQuery(".standardCheckbox").attr("checked", false);
	} else if(jQuery("#standardText").html() == jQuery("#downDownLabel").html()) {
		jQuery(".adminCheckbox").attr("checked", false);
	} 
	
	jQuery("#" + errorID).addClass("hide");
	var check_array = jQuery("#" + formID + ' input:checkbox:checked');
	if(check_array.length <= 0) {
		jQuery("#" + errorID).removeClass("hide");
		return false;
	}

	var xferObject = {};
	var jsonIDArray = new Array();
    jQuery.each(check_array, function(index, item){
        jsonIDArray[index] = item.id;
    });

	xferObject[OrderManagementCustomSetup.tokenKey] = OrderManagementCustomSetup.tokenValue;
	xferObject.jsonIDArray = JSON.stringify(jsonIDArray);
	var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    xferObject._requestConfirmationToken=requestConfirmationTokenVal;
	
	jQuery.ajax({
	    url: OrderManagementCustomSetup.ajaxBasePath + "setAccountApprovers",
	    data: xferObject,
	    dataType: "json", 
	    type: 'post',
	    success: function(response, ioArgs) {
	    	var sURL = "/myaccount/ordermanagement/omsAssignSettingsPage";
            window.location.href = sURL;
        }
    });    
};

OrderManagementCustomSetup.selectAllUsers = function() {
	if(jQuery("#adminText").html() == jQuery("#downDownLabel").html()){
		jQuery(".adminCheckbox").prop("checked", true);
	} else if(jQuery("#standardText").html() == jQuery("#downDownLabel").html()) {
		jQuery(".standardCheckbox").prop("checked", true);
	} else {
		jQuery("#approverForm input").prop("checked", true);
			
	}
	
};

OrderManagementCustomSetup.deSelectAllUsers = function() {
	if(jQuery("#adminText").html() == jQuery("#downDownLabel").html()){
		jQuery(".adminCheckbox").prop("checked", false);
	} else if(jQuery("#standardText").html() == jQuery("#downDownLabel").html()) {
		jQuery(".standardCheckbox").prop("checked", false);
	} else {
		jQuery("#approverForm input").prop("checked",false)
	}
};

OrderManagementCustomSetup.refreshSpendLimitList = function () {
	var targetNode = jQuery("#currentSpendLimitsList");
	getCurrentSpendLimitUrl=jQuery("#currentSpendLimitsUrl").val();
	
	jQuery.ajax({
        url:getCurrentSpendLimitUrl,
        dataType: "text",
        cache: false,
        success: function (data) {
            targetNode.html(data);
            OrderManagementCustomSetup.addSpendLimitLocalizedText();
        }
    });
};

OrderManagementCustomSetup.addSpendLimitLocalizedText = function () {
	jQuery("#allOrdersRequireApproval").html(OrderManagementCustomSetup.allOrdersRequireApproval);
	jQuery("#doesNotRequireApproval").html(OrderManagementCustomSetup.doesNotRequireApproval);
	jQuery(".oms_edit_dummy").html( OrderManagementCustomSetup.editSmallText);
	jQuery(".oms_delete_dummy").html(OrderManagementCustomSetup.deleteSmallText);
};

OrderManagementCustomSetup.refreshApproverLimitList = function () {
	
	var currentApproverLimitsListUrl=jQuery("#currentApprovalLimitsUrl").val();
	var targetNode = jQuery("#currentApproverLimitsList"),
        xhrArgs = {
            url: currentApproverLimitsListUrl,
            dataType: "text",
            cache: false,
            success: function (data) {
                targetNode.html(data);
                OrderManagementCustomSetup.addApproverLimitLocalizedText();
            }
        };

    jQuery.ajax(xhrArgs);	
};

OrderManagementCustomSetup.addApproverLimitLocalizedText = function () {
	
	jQuery("#canApproveAnyOrder").html(OrderManagementCustomSetup.canApproveAnyOrder);
	jQuery("#noApprovalRights").html(OrderManagementCustomSetup.noApprovalRights);
	jQuery(".oms_aedit_dummy").html(OrderManagementCustomSetup.editSmallText);
	jQuery(".oms_adelete_dummy").html(OrderManagementCustomSetup.deleteSmallText);

};

OrderManagementCustomSetup.stepTwoEnableLane = function(uid) {
	"use strict";
	
	jQuery("#oms-approver-info-container select").attr('disabled', 'disabled');
	jQuery("input[type=checkbox]").attr('disabled', 'disabled');
	jQuery("input[name=editButton]").attr('disabled', 'disabled');
	jQuery("label[name=editButtonLabel]").addClass('disabled');
	jQuery("#"+uid).removeAttr('disabled');
	jQuery("#"+uid+"approver").removeAttr('disabled');
	jQuery("#"+uid+"lock").removeAttr('disabled');

	//Supports cancelling/updating a particular swim lane
	OrderManagementCustomSetup.cachedStepTwoSwimLane.userValue = jQuery("#"+uid).val();
	OrderManagementCustomSetup.cachedStepTwoSwimLane.approverValue = jQuery("#"+uid+"approver").val();
	OrderManagementCustomSetup.cachedStepTwoSwimLane.lockCheckedValue = jQuery("#"+uid+"lock").is(":checked");
	jQuery("#"+uid+"hideEditButton").addClass("hide");
	jQuery("#"+uid+"hideCancelUpdate").removeClass('hide');	
};

javascript:OrderManagementCustomSetup.updateStepTwoEditLane  = function(uid, rowId) {
	"use strict";

	var error = false;
	var xferObj = {};
	xferObj.userName = uid;
	xferObj.approvalLimitId = jQuery("#"+uid).val().substr(3);
	xferObj.noApproval = (jQuery("#"+uid).val().substr(0,2) === "00") ? true : false;

	if (xferObj.noApproval) {
		jQuery("#"+uid+"approver").val("anyApprover");
		xferObj.approverUserName = "anyApprover";
		jQuery("#"+uid+"lock").prop('checked', false);
		xferObj.approverLocked = false;
		var node = jQuery("#"+uid + "_arrow");
        node.addClass("gradient-arrows");
        node.removeClass("icon-lock");
	} else {
		xferObj.approverUserName = jQuery("#"+uid+"approver").val();
		xferObj.approverLocked = jQuery("#"+uid+"lock").is(":checked");
	}
	var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    xferObject._requestConfirmationToken=requestConfirmationTokenVal;
    
	jQuery.ajax({
        url: OrderManagementCustomSetup.ajaxBasePath + "updateStepTwoSwimLane",
        data: xferObj,
        dataType: "json",
        type: 'post',
        cache: 'false',
        success: function (response, ioArgs) {
        	location.reload(true);
        },
        error: function (errorMessage) {
            error = true;
        },
        complete: function(response, ioArgs) {
        	if (error) {
    			var errorObject = JSON.parse(response.responseText);
    			//errorCode == 1 is the validation error when no user is set to "Can Approve Any Order"
    			if (errorObject.errorCode !== undefined && errorObject.errorCode == "1") {
    				OrderManagementModal.dialogOpen("action=showUnlimitedApproverAlertModal");
    				OrderManagementCustomSetup.cancelStepTwoEditLane(uid, rowId);
    			}
    			else {
    				jQuery("#error_text").html(errorObject.error);
    				jQuery("#error_text").removeClass("hide");
    			}
    		} else {
                OrderManagementCustomSetup.resetStepTwoLaneGui(uid, rowId);
            }
    	}
    });
};

javascript:OrderManagementCustomSetup.resetStepTwoLaneGui = function(uid, rowId) {
    "use strict";
    jQuery("#" + uid).val(OrderManagementCustomSetup.cachedStepTwoSwimLane.userValue);
    jQuery("#" + uid+"approver").val(OrderManagementCustomSetup.cachedStepTwoSwimLane.approverValue);
    jQuery("#" + uid+"lock").val(OrderManagementCustomSetup.cachedStepTwoSwimLane.lockCheckedValue);
    jQuery("#" + uid).prop('disabled', true);
    jQuery("#" + uid+"approver").prop('disabled', true);
    jQuery("#" + uid+"hideEditButton").removeClass("hide");
    jQuery("#" + uid+"hideCancelUpdate").addClass('hide');
    jQuery("input[name=editButton]").removeAttr('disabled');
    jQuery("label[name=editButtonLabel]").removeClass('disabled');
    jQuery("#" + uid+"lock").prop('disabled', true);
    OrderManagementCustomSetup.hideErrorMessages(uid);
    OrderManagementCustomSetup.stepTwoLockApproverToggle(uid);
    OrderManagementCustomSetup.stepTwoApprovalLimitChanged(uid, "canSpendUpToText["+rowId+"]");
    
};

javascript:OrderManagementCustomSetup.cancelStepTwoEditLane = function(uid, rowId) {
    "use strict";

    jQuery("#" + uid).val(OrderManagementCustomSetup.cachedStepTwoSwimLane.userValue);
    jQuery("#" + uid + "approver").val(OrderManagementCustomSetup.cachedStepTwoSwimLane.approverValue);
    jQuery("#" + uid + "lock")[0].checked = OrderManagementCustomSetup.cachedStepTwoSwimLane.lockCheckedValue;

    OrderManagementCustomSetup.resetStepTwoLaneGui(uid, rowId);
};

OrderManagementCustomSetup.stepTwoApprovalLimitChanged = function(uid, hideId) {
	"use strict";
	var selectBox = jQuery("#" + uid);
	
	if(selectBox.val().substr(0,2) !== "00") {
		jQuery("#"+ uid + "arrowhide, #"+ uid + "approverhide").removeClass( "hide");
	}
	else {
		jQuery("#"+ uid + "arrowhide, #"+ uid + "approverhide").addClass("hide");
	}

	if(selectBox.selectedIndex <= 1) {
		jQuery("#" + hideId).addClass('hide');
	} else {
		jQuery("#" + hideId).removeClass('hide');
	}
};

OrderManagementCustomSetup.validateApprovalLimitChange = function(selectBox) {
    "use strict";
    var xferObj = {},
        el = jQuery(selectBox),
        elID = el.attr("ID"),
        selectedApprover = jQuery("#" + elID + "approver");


    xferObj.approvalApproverUsername = selectedApprover.val();
    xferObj.approverUsername = elID;
    xferObj.newApprovalLimit = el.val();

    jQuery.ajax({
        url: OrderManagementCustomSetup.ajaxBasePath + "validateApprovalLimitChange",
        data: xferObj,
        dataType: "json",
        cache: false,
        type: "GET",
        success: function (response, ioArgs) {
            OrderManagementCustomSetup.hideErrorMessages(elID);
            jQuery("#approvalMessaging").removeClass("hide");

            switch (response.message) {
                case "omsIncreaseApprovalLimit" :
                    jQuery("#" + elID + "increase-approval-limit").removeClass("hide");
                    break;

                case "omsDecreaseApprovalLimit" :
                    jQuery("#" + elID + "decrease-approval-limit").removeClass("hide");
                    break;

                case "omsEliminateApprovalRights" :
                    jQuery("#" + elID + "eliminate-approval-rights").removeClass("hide");
                    break;

                default :
                    break;
            }
        }
    });
};

OrderManagementCustomSetup.hideErrorMessages = function(uid) {

	jQuery("#"+uid + "increase-approval-limit").addClass("hide");
	jQuery("#"+uid + "decrease-approval-limit").addClass("hide");
	jQuery("#"+uid + "eliminate-approval-rights").addClass("hide");
	jQuery("#"+uid + "assign-smaller-approver").addClass("hide");

	jQuery("#error_text").addClass("hide");
};

OrderManagementCustomSetup.validateApproverChange = function(uid) {
    "use strict";

	var xferObj = {};
	var approverSelect = jQuery("#"+uid)[0];
	xferObj.approverUsername = approverSelect.id;
	xferObj.selectedApproverLimit = approverSelect.options[approverSelect.selectedIndex].value;
	var selectedApprovalApprover = jQuery("#"+approverSelect.id + "approver")[0];
	xferObj.selectedApprovalApprover = selectedApprovalApprover.options[selectedApprovalApprover.selectedIndex].value;
    var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    xferObject._requestConfirmationToken=requestConfirmationTokenVal;
    
	jQuery.ajax({
        url: OrderManagementCustomSetup.ajaxBasePath + "validateApproverChange",
        data: xferObj,
        dataType: "json",
        preventCache: true,
        success: function (response, ioArgs) {

        	OrderManagementCustomSetup.hideErrorMessages(approverSelect.id);

        	if (response.message == "omsAssignSmallerApprover") {
        		jQuery("#"+approverSelect.id + "assign-smaller-approver").removeClass("hide");
        	}
        }
    });
};

OrderManagementCustomSetup.stepTwoOnDomReady = function(count) {
	"use strict";
	for(var i = 1;i <= count;i++) {
		var rowDiv = jQuery("#row[" + i + "]");
		var selectBox = jQuery("select[name=userSpendLimit]:eq(0)",rowDiv);
		
		if(selectBox.selectedIndex <= 1) {
			jQuery("#canSpendUpToText[" + i + "]").addClass("hide");
		}
	}
};

OrderManagementCustomSetup.stepTwoApprovalApproverChanged = function(uid) {
	"use strict";
	var selectBox = jQuery("#" + uid + "approver");
    var checkBox = jQuery("#" + uid+"lock");

    if(selectBox.val() === "anyApprover") {
        checkBox.prop('checked', false);
        checkBox.prop('disabled', true);
        var node = jQuery("#" + uid + "_arrow");
        node.addClass("gradient-arrows");
        node.removeClass("icon-lock");
        jQuery("#" + uid + "lockfield").addClass("hide");
    }
    else {
        checkBox.prop('disabled', false);
        jQuery("#" + uid + "lockfield").removeClass("hide");
    }

};

OrderManagementCustomSetup.stepTwoLockApproverToggle = function(userid) {
    "use strict";
    var checkBox = jQuery("#" + userid + "lock")
    var node = jQuery("#" + userid + "_arrow");

    if(checkBox.is(':checked')) {
        node.removeClass("gradient-arrows")
            .addClass("icon-lock");
    }
    else {
        node.addClass("gradient-arrows")
            .removeClass("icon-lock");
    }

    OrderManagementCustomSetup.stepTwoApprovalApproverChanged(userid);
};

OrderManagementCustomSetup.showStepThree = function() {
    window.location.replace('/myaccount/ordermanagement/omssetupstepthree');
};

OrderManagementCustomSetup.stepThreeEnableLane = function(uid) {
	"use strict";
	
	jQuery("#oms-approver-info-container select").attr('disabled', true);
	jQuery("input[type=checkbox]").attr('disabled', true);
	jQuery("input[name=editButton]").attr('disabled', true);
	jQuery("label[name=editButtonLabel]").attr('disabled', true);
	jQuery("#"+uid).attr('disabled', false);
	jQuery("#"+uid+"approver").attr('disabled', false);
	jQuery("#"+uid+"lock").attr('disabled', false);

	//Supports cancelling/updating a particular swim lane
	OrderManagementCustomSetup.cachedStepThreeSwimLane.userValue = jQuery("#"+uid).val();
	OrderManagementCustomSetup.cachedStepThreeSwimLane.approverValue = jQuery("#"+uid+"approver").val();
	OrderManagementCustomSetup.cachedStepThreeSwimLane.lockCheckedValue = jQuery("#"+uid+"lock").is(":checked");
	jQuery("#"+uid+"hideEditButton").addClass("hide");
	jQuery("#"+uid+"hideCancelUpdate").removeClass('hide');	
};

javascript:OrderManagementCustomSetup.updateStepThreeEditLane  = function(uid) {
	"use strict";
	var xferObj = {};
	xferObj.username = uid;
	xferObj.newSpendLimitId = jQuery("#"+uid).val().substr(3);
	xferObj.noApproval = (jQuery("#"+uid).val().substr(0,2) === "00") ? true : false;

	if (xferObj.noApproval) {
		jQuery("#"+uid+"approver").val("anyApprover");
		xferObj.approverUsername = "anyApprover";
		jQuery("#"+uid+"lock").prop('checked', false);
		xferObj.approverLocked = false;
		jQuery("#" + uid + "_arrow").addClass("gradient-arrows").removeClass("icon-lock");
	} else {
		xferObj.approverUsername = jQuery("#"+uid+"approver").val();
		xferObj.approverLocked = jQuery("#"+uid+"lock").is(":checked");

	}
	
	var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    xferObject._requestConfirmationToken=requestConfirmationTokenVal;
    
	jQuery.ajax({
        url: OrderManagementCustomSetup.ajaxBasePath + "updateStepThreeSwimLane",
        data: xferObj,
        dataType: "json",
        type: "post",
        success: function (response, ioArgs) {
        	jQuery("#oms-approver-info-container select").attr('disabled', 'disabled');
        	jQuery("input[type=checkbox]").attr('disabled', 'disabled');
        	jQuery("#"+uid+"hideEditButton").removeClass("hide");
        	jQuery("#"+uid+"hideCancelUpdate").addClass('hide');
        	jQuery("input[name=editButton]").removeAttr('disabled');
        	jQuery("label[name=editButtonLabel]").removeClass('disabled');
        },
        error: function (errorMessage) {
            alert("Error: " + errorMessage);
        }
    });
    
    
};

javascript:OrderManagementCustomSetup.cancelStepThreeEditLane = function(uid, rowNum) {
	"use strict";
	
	jQuery("#"+uid).val(OrderManagementCustomSetup.cachedStepThreeSwimLane.userValue);
	jQuery("#"+uid+"approver").val(OrderManagementCustomSetup.cachedStepThreeSwimLane.approverValue);
	jQuery("#"+uid+"lock").attr('checked', OrderManagementCustomSetup.cachedStepThreeSwimLane.lockCheckedValue);
	jQuery("#"+uid).attr('disabled', 'disabled');
	jQuery("#"+uid+"approver").attr('disabled', 'disabled');
	jQuery("#"+uid+"hideEditButton").removeClass("hide");
	jQuery("#"+uid+"hideCancelUpdate").addClass('hide');
	jQuery("input[name=editButton]").removeAttr('disabled');
	jQuery("label[name=editButtonLabel]").removeClass('disabled');
	OrderManagementCustomSetup.lockApproverToggle(uid);
	OrderManagementCustomSetup.spendLimitChanged(uid, 'canSpendUpToText[' + rowNum + ']');
	jQuery("#"+uid+"lock").attr('disabled', 'disabled');
};

OrderManagementCustomSetup.spendLimitChanged = function(uid, hideId) {
	"use strict";
	var selectBox = jQuery("#" + uid);
	
	if(selectBox.val().substr(0,2) !== "00") {
		jQuery("#"+uid+ "arrowhide").removeClass("hide");
		jQuery("#"+uid+ "approverhide").removeClass("hide");
	}
	else {
		jQuery("#"+uid + "arrowhide").addClass("hide");
		jQuery("#"+uid + "approverhide").addClass("hide");
	}
	
	if(selectBox.selectedIndex <= 1) {
		jQuery("#"+hideId).addClass('hide');
	} else {
		jQuery("#"+hideId).removeClass('hide');
	}

};

OrderManagementCustomSetup.stepThreeOnDomReady = function(count) {
	"use strict";
	for(var i = 1;i <= count;i++) {
		var rowDiv = jQuery("#row[" + i + "]");
		var selectBox = jQuery("select[name=userSpendLimit]:eq(0)",rowDiv);
		
		if(selectBox.selectedIndex <= 1) {
			jQuery("#canSpendUpToText[" + i + "]").addClass("hide");
		}
	}
};

OrderManagementCustomSetup.stepThreeContinue = function() {
	"use strict";
	var foundChange = false;
	jQuery("#oms-approver-info-container select[name=userSpendLimit]").each(function(index) {
	    var parseString = jQuery(this).val();
	    if(parseString.substr(0,2) !== "00") {
	    	foundChange=true;
	    }
	});
	
	if(!foundChange) {
		OrderManagementCustomSetupStepThreeDialog.dialogOpen();
		return false;
	}
	
	alert("Next step doesn't exist yet!");
};

OrderManagementCustomSetup.spendApproverChanged = function(selectBox) {
	"use strict";
	
	var uid = selectBox.name;
	var checkBox = jQuery("#"+uid+"lock");
	
	if(selectBox.value === "anyApprover") {
        checkBox.prop('checked', false);
        checkBox.prop('disabled', true);
        var node = jQuery("#" + uid + "_arrow");
        node.addClass("gradient-arrows").removeClass("icon-lock");
        jQuery("#" + uid + "lockfield").addClass("hide");
	}
	else {
		jQuery(checkBox).removeAttr('disabled');
		jQuery("#"+uid + "lockfield").removeClass("hide");
	}
};

OrderManagementCustomSetup.lockApproverToggle = function(userid) {
	"use strict";
	var checkBox = jQuery("#" + userid + "lock");
	var node = jQuery("#"+userid + "_arrow");

    if (node.hasClass("gradient-arrows")) {
        node.removeClass("gradient-arrows").addClass("icon-lock");
    } else {
        node.removeClass("icon-lock").addClass("gradient-arrows");
    }
	OrderManagementCustomSetup.spendApproverChanged( jQuery("#"+ userid + "approver" ) );
};

OrderManagementCustomSetup.ariaUsabilityToggle = function() {
	var ariaNode = jQuery("#showUsers-list");
	var currentValue = ariaNode.attr("aria-expanded");

	if (currentValue == "true") {
		ariaNode.attr("aria-expanded", "false");
	}
	else {
		ariaNode.attr("aria-expanded", "true");
	}
};

////////////////////////////////////////////////////////////
//Defined a new "namespace" just to handle the dialog box.//
////////////////////////////////////////////////////////////
var OrderManagementCustomSetupStepThreeDialog = OrderManagementCustomSetupStepThreeDialog || {};
OrderManagementCustomSetupStepThreeDialog.hrefStr       = "/myaccount/ordermanagement/omscustomstepthreecontinuemodalpage";
OrderManagementCustomSetupStepThreeDialog.dialogID      = "ordermanagementcustomsetupstepthreedialog";
OrderManagementCustomSetupStepThreeDialog.dialog        = null;

OrderManagementCustomSetupStepThreeDialog.dialogOpen = function () {
    "use strict";

    Grainger.Modals.waitModal(OrderManagementCustomSetupStepThreeDialog.dialogID, OrderManagementCustomSetupStepThreeDialog.dialogID);

    jQuery.ajax({
        url: OrderManagementCustomSetupStepThreeDialog.hrefStr,
        cache: false,
        success: function(data) {
            Grainger.Modals.createAndShowModal(OrderManagementCustomSetupStepThreeDialog.dialogID, OrderManagementCustomSetupStepThreeDialog.dialogID, data);
        },
        error: function() {
            Grainger.Modals.killModal();
        }
    });
};

OrderManagementCustomSetupStepThreeDialog.dialogClose = function () {
    "use strict";
    Grainger.Modals.killModal();
};

////////////////////////////////////////////////////////////
//Defined a new "namespace" for OMS Modal Component.
////////////////////////////////////////////////////////////
var OrderManagementModal = OrderManagementModal || {};
OrderManagementModal.hrefStr       = jQuery("#suspendOrederMgmtURl").val();
OrderManagementModal.dialogID      = "OrderManagementModal";
OrderManagementModal.dialog        = null;

OrderManagementModal.dialogOpen = function (parameters) {
    "use strict";
    var localHref = jQuery("#suspendOrederMgmtURl").val();
    if (parameters !== undefined || parameters !== null) {
        localHref += "?" + "params="+parameters;
    }
    var xferObj = {};
    var requestConfirmationTokenVal=$("#miniCartLinkForm input[name=_requestConfirmationToken]").val();
	xferObj._requestConfirmationToken=requestConfirmationTokenVal;
    Grainger.Modals.waitModal(OrderManagementModal.dialogID, OrderManagementModal.dialogID);

    jQuery.ajax({
        url: localHref,
        cache: false,
        data:xferObj,
        type: "POST",
        success: function(data) {
        	Grainger.Modals.createAndShowModal(OrderManagementModal.dialogID, OrderManagementModal.dialogID, data, "smallModal");
        },
        error:function(xhr,textStatus){
        	 Grainger.Modals.killModal();
			 if(xhr.status==401 || xhr.status==404){
				 window.location.reload();
			 }
		 }
    });
};

OrderManagementModal.dialogClose = function () {
    "use strict";
    Grainger.Modals.killModal();
};

////////////////////////////////////////////////////////////

//Defined a new "namespace" just to handle the dialog box.//
////////////////////////////////////////////////////////////
var OrderManagementDefaultSettingsModalDialog = OrderManagementDefaultSettingsModalDialog || {};
OrderManagementDefaultSettingsModalDialog.hrefStr       = "/myaccount/ordermanagement/omsassigndefaultsettingsmodalpage";
OrderManagementDefaultSettingsModalDialog.dialogID      = "apply-default-settings-modal";
OrderManagementDefaultSettingsModalDialog.dialog        = null;

OrderManagementDefaultSettingsModalDialog.dialogOpen = function () {
    "use strict";
    Grainger.Modals.waitModal(OrderManagementDefaultSettingsModalDialog.dialogID, OrderManagementDefaultSettingsModalDialog.dialogID);

    jQuery.ajax({
        url: OrderManagementDefaultSettingsModalDialog.hrefStr,
        cache: false,
        success: function(data) {
            Grainger.Modals.createAndShowModal(OrderManagementDefaultSettingsModalDialog.dialogID, OrderManagementDefaultSettingsModalDialog.dialogID, data);
        },
        error: function() {
            Grainger.Modals.killModal();
        }
    });
};

OrderManagementDefaultSettingsModalDialog.dialogClose = function () {
    "use strict";
    Grainger.Modals.killModal();
};

OrderManagementDefaultSettingsModalDialog.toggleStandard = function () {
	"use strict";
	OrderManagementDefaultSettingsModalDialog.mode = "STANDARD";
	jQuery("#applyDefaultSetModalStandardText").removeClass("hide");
	jQuery("h3[name=standardUser]").removeClass("hide");
	jQuery("#applyDefaultSetModalAdminText").addClass("hide");
	jQuery("h3[name=adminFullRights]").addClass("hide");
	jQuery("#standardVersion").removeClass("hide");
	jQuery("#adminVersion").addClass("hide");
	OrderManagementDefaultSettingsModalDialog.selectDropdowns();
};

OrderManagementDefaultSettingsModalDialog.toggleAdmin = function () {
	"use strict";
	OrderManagementDefaultSettingsModalDialog.mode = "ADMIN";
	jQuery("#applyDefaultSetModalStandardText").addClass("hide");
	jQuery("h3[name=standardUser]").addClass("hide");
	jQuery("#applyDefaultSetModalAdminText").removeClass("hide");
	jQuery("h3[name=adminFullRights]").removeClass("hide");
	jQuery("#standardVersion").addClass("hide");
	jQuery("#adminVersion").removeClass("hide");
	OrderManagementDefaultSettingsModalDialog.selectDropdowns();
};

OrderManagementDefaultSettingsModalDialog.selectDropdowns = function () {
	"use strict";
	var spendLimitId = "";
	var approverId = "";
	var approverLocked = false;
	if(OrderManagementDefaultSettingsModalDialog.mode === "STANDARD") {
		spendLimitId = OrderManagementDefaultSettingsModalDialog.standardSpendId;
		approverId   = OrderManagementDefaultSettingsModalDialog.standardApproverId;
		approverLocked = OrderManagementDefaultSettingsModalDialog.standardLocked;
	}
	else {
		spendLimitId = OrderManagementDefaultSettingsModalDialog.adminSpendId;
		approverId   = OrderManagementDefaultSettingsModalDialog.adminApproverId;
		approverLocked = OrderManagementDefaultSettingsModalDialog.adminLocked;
	}
	
	jQuery("#assignDefaultSpendLimit").val(spendLimitId);
	jQuery("#assignDefaultApprover").val(	approverId);
	jQuery("#assignDefaultLockApprover").checked = approverLocked; 
};

OrderManagementDefaultSettingsModalDialog.submitDialog = function () {
	"use strict";
	var errorBlock = jQuery("#oms_assigndefaultsettingsmodal_error");
	errorBlock.addClass("hide");
	
	var xferObj = {};
	xferObj.adminMode = OrderManagementDefaultSettingsModalDialog.mode;
	xferObj.assignDefaultSpendLimit = jQuery("#assignDefaultSpendLimit").val();
	xferObj.assignDefaultApprover = jQuery("#assignDefaultApprover").val();
	xferObj.assignDefaultLockApprover = jQuery("#assignDefaultLockApprover").prop('checked');
    var requestConfirmationTokenVal=$("#omsSearchForm input[name=_requestConfirmationToken]").val();
    xferObject._requestConfirmationToken=requestConfirmationTokenVal;
    
	jQuery.ajax({
        url: OrderManagementCustomSetup.ajaxBasePath + "submitAssignDialog",
        dataType: "json",
        data: xferObj,
        type: "POST",
        success: function (response, ioArgs) {
            if (response.firstName && response.lastName && response.approverName) {
                ///alert(dojo.string.substitute(OrderManagementDefaultSettingsModalDialog.customApproverText, [response.firstName, response.lastName, response.approverName]));
            }
            else if (response.firstName && response.lastName && response.notInRole) {
                //alert(dojo.string.substitute(OrderManagementDefaultSettingsModalDialog.approverNotInRoleText, [response.firstName, response.lastName]));
            }
            else if (response.firstName && response.lastName) {
                //alert(dojo.string.substitute(OrderManagementDefaultSettingsModalDialog.sameUserAlertText, [response.firstName, response.lastName]));
            }
            window.location.reload(true);
        },
        error: function (errorMessage) {
        	var errorObject = JSON.parse(errorMessage.responseText);
        	errorBlock.removeClass("hide");
        	errorBlock.empty();
        	errorBlock.html(errorObject.error);
        }
    });
};

////////////////////////////////////////////////////////////
//Manage Limits dashboard dialog box                      //
////////////////////////////////////////////////////////////
var OmsDashboardLimitsModal = OmsDashboardLimitsModal || {};
OmsDashboardLimitsModal.hrefStr       = "/myaccount/ordermanagement/omsdashboardlimitsmodalpage";
OmsDashboardLimitsModal.dialogID      = "addLimitsModal";
OmsDashboardLimitsModal.dialog        = null;


OmsDashboardLimitsModal.dialogOpen = function () {
    "use strict";

    Grainger.Modals.waitModal(OmsDashboardLimitsModal.dialogID, OmsDashboardLimitsModal.dialogID);
    
    var manageLimits=$('#manageLimits').val()
    
    jQuery.ajax({
        url: manageLimits + "?isModal=true",
        cache: false,
        success: function(data) {
            Grainger.Modals.createAndShowModal(OmsDashboardLimitsModal.dialogID, OmsDashboardLimitsModal.dialogID, data);
        },
        error:function(xhr,textStatus){
        	Grainger.Modals.killModal();
			 if(xhr.status==401 || xhr.status==404){
				 window.location.reload();
			 }
		 },
        complete: function() {
            OrderManagementCustomSetup.manageLimitsFragmentLoad();
            OrderManagementCustomSetup.addSpendLimitLocalizedText();
            OrderManagementCustomSetup.addApproverLimitLocalizedText();
        }
    });
};

OmsDashboardLimitsModal.dialogClose = function () {
    "use strict";
    if(OmsDashboardLimitsModal.popupDisplayed) {
        return false;
    }
    // well this doesn't make sense
    // assuming it's a safe gaurd...
    if (jQuery('#' + OmsDashboardLimitsModal.dialogID).length > 0) {
        location.reload(true);
    }
};

var OMSGenericModal = OMSGenericModal || {};
OMSGenericModal.dialog = null;
OMSGenericModal.dialogID = null;
OMSGenericModal.canBeDestroyed = null;

OMSGenericModal.openDialog = function(modalId, modalTitle, modalHref, htmlSource, enableDrag){
	if(modalHref !== null && modalHref !== ''){
        jQuery.ajax({
            url: modalHref,
            cache: false,
            success: function(data) {
                Grainger.Modals.createAndShowModal(modalId, modalTitle, data);
            }
        });
	} else {
        Grainger.Modals.createAndShowModal(modalId, modalTitle, htmlSource.html());
    }
};

OMSGenericModal.closeDialog = function () {
	"use strict";
	Grainger.Modals.killModal();
};

var OMSReviewSetup = OMSReviewSetup || {};
OMSReviewSetup.comp = null;
OMSReviewSetup.omsCustomSetupURL = null;
OMSReviewSetup.reviewActive = false;

OMSReviewSetup.enableReview = function(){
	jQuery("#reviewerSelectDiv").removeClass("hide");
	jQuery("#enable-message-container").addClass("hide");
	jQuery("#disabled-message-container").removeClass("hide");
	jQuery("#omsRevContinue").addClass("hide");
	jQuery("#omsRevSaveContinue").removeClass("hide");
	OMSReviewSetup.reviewActive = true;
};


OMSReviewSetup.disableReview = function(){
	jQuery("#reviewerSelectDiv").addClass("hide");
	jQuery("#enable-message-container").removeClass("hide");
	jQuery("#disabled-message-container").addClass("hide");
	jQuery("#omsRevSaveContinue").addClass("hide");
	jQuery("#omsRevContinue").removeClass("hide");
	OMSReviewSetup.reviewActive = false;
};

OMSReviewSetup.confirmDisableReview = function(){
    OMSGenericModal.openDialog('disableReview', '', '', jQuery('#suspendOMSReviewModal'), false);
    modal_variables = jQuery.parseJSON(jQuery("#modalVariables").html());
	jQuery(window).trigger("grainger.modal.open");
};

OMSReviewSetup.enableConfiguredReview = function(){
	jQuery("#enableReviewForm").submit();
};

OMSReviewSetup.disableConfiguredReview = function(){
	jQuery("#disableReviewForm").submit();
};

OMSReviewSetup.enableCompleteOMSConfig = function(){
    
    if(jQuery("#adminText").html() == jQuery("#downDownLabel").html()){
        jQuery(".standardCheckbox").attr("checked", false);
        
    } else if(jQuery("#standardText").html() == jQuery("#downDownLabel").html()) {
        jQuery(".adminCheckbox").attr("checked", false);
    }
    
    var okToSubmitForm = false;
    jQuery('input:checkbox').each(function () {
    	if(this.checked){
    		okToSubmitForm = true;
    	}
    });
    if(okToSubmitForm){
        modal_variables = jQuery.parseJSON(jQuery("#omsSetupCompleteAnalyticsJson").html());
        modal_variables.CurrentURL =  OMSReviewSetup.omsCustomSetupURL;
    	jQuery(window).trigger("grainger.modal.open");
        OMSReviewSetup.completeOMSSetup();
    }else{
        OMSReviewSetup.oneApproverRequired();
    }
    // Submit This Form :: setReviewersForm
};

OMSReviewSetup.completeOMSSetup = function(){
	var formObject = jQuery("#setReviewersForm").serializeArray(), error = false;
    jQuery.ajax({
        url: "/myaccount/ordermanagement/omsreviewsetup/saveSettings",
        data: formObject,
        dataType: "json",
        type: "POST",
        success: function (response, ioArgs) {
        	if(response.success){
                var modalContents = jQuery("#configurationCompleteModal");
                OMSGenericModal.openDialog('completeOMSConfig', '', '', modalContents, false);
        	}
        }
    });
};

OMSReviewSetup.completeOMSConfig = function(){
	OMSReviewSetup.completeOMSSetup();
};

OMSReviewSetup.setReviewers = function(){

	var okToSubmitForm = false;
    jQuery('input:checkbox').each(function () {
    	if(this.checked){
    		okToSubmitForm = true;
    	}
    });

    if(okToSubmitForm){
		jQuery("#setReviewersForm").submit();
	}else{
		OMSReviewSetup.oneApproverRequired();
	}
}

OMSReviewSetup.selectAllUsers = function() {
	
	if(jQuery("#adminText").html() == jQuery("#downDownLabel").html()){
		jQuery(".adminCheckbox").prop("checked", true);
	} else if(jQuery("#standardText").html() == jQuery("#downDownLabel").html()) {
		jQuery(".standardCheckbox").prop("checked", true);
	} else {
		jQuery("#setReviewersForm input").prop("checked",true);
	}
};

OMSReviewSetup.deSelectAllUsers = function() {
	if(jQuery("#adminText").html() == jQuery("#downDownLabel").html()){
		jQuery(".adminCheckbox").prop("checked", false);
	} else if(jQuery("#standardText").html() == jQuery("#downDownLabel").html()) {
		jQuery(".standardCheckbox").prop("checked", false);
	} else {
		jQuery("#setReviewersForm input").prop("checked", false);
	}
};

OMSReviewSetup.ordersPending = function(){
	OMSGenericModal.openDialog('pendingReviews', '', '', jQuery('#pendingReviewsModal'), false);
};

OMSReviewSetup.oneApproverRequired = function(){
	OMSGenericModal.openDialog('reviewerRequired', '', '', jQuery('#oneApproverAlertModal'), false);
};

///////////////////////////////////////////////////////////////
//                                                           //
//         jQuery Converted/New Code Below Here...           //
//                                                           //
// Any new JS written should be in jQuery and go below here! //
//                                                           //
///////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Contains methods and data related to the OMS Express Dialog //
/////////////////////////////////////////////////////////////////
var OrderManagementExpressSetup = OrderManagementExpressSetup || {};
OrderManagementExpressSetup.DEFAULT_VAL   = "default";
OrderManagementExpressSetup.DEFAULT_ZERO  = "default0";
OrderManagementExpressSetup.DEFAULT_UNLIM = "defaultunlim";
OrderManagementExpressSetup.setupBasePath = "/myaccount/ordermanagement/omsexpresssetupmodaldialogpage?";
OrderManagementExpressSetup.ajaxBasePath  = "/oms/expressSetup/";
OrderManagementExpressSetup.dialogID      = "#omsExpressSetupModal";
OrderManagementExpressSetup.defaultType   = "";

OrderManagementExpressSetup.dialogOpen = function (step, params) {
	"use strict";

	OrderManagementExpressSetup.dialogClose();
	
    var hrefStr = this.setupBasePath + step, 
        requestGET;
    
    if (params !== undefined || params !== null) {
        hrefStr = hrefStr + "&" + params;
    }

    Grainger.Modals.waitModal();

	jQuery.ajax({
		type: 'GET',
		cache: false,
		url: hrefStr,
        success: function (response, textStatus, jqXHR) {
            Grainger.Modals.createAndShowModal(null, null, response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            Grainger.Modals.createAndShowModal(null, null, "System error. Please try again.");
        }
	});
};

OrderManagementExpressSetup.dialogClose = function() {
    "use strict";
    Grainger.Modals.killModal();
};

OrderManagementExpressSetup.beginCustomSetup = function () {
    "use strict";
    location.replace('/myaccount/ordermanagement/omssetupstepone');
    return true;
};

OrderManagementExpressSetup.stepOneAjaxSave = function (formID, errorTextID, step) {
    "use strict";
    
    var errorBlock = jQuery("#" + errorTextID),
        formData = jQuery("#spend1_form").serialize(),
        error = false,
        requestPOST;
    
    errorBlock.addClass('hide');
    
	var requestPOST = jQuery.ajax({
		type: 'POST',
		cache: false,
		url: OrderManagementExpressSetup.ajaxBasePath + "setSpendLimitSave",
		data: formData,
		dataType: 'json'		
	});
	
	requestPOST.done(function (response, textStatus, jqXHR) {
        error = false;
        
        if (response.success === OrderManagementExpressSetup.DEFAULT_VAL ||
            response.success === OrderManagementExpressSetup.DEFAULT_ZERO    ||
            response.success === OrderManagementExpressSetup.DEFAULT_UNLIM) {
            OrderManagementExpressSetup.defaultType = response.success;
            OrderManagementExpressSetup.dialogOpen("spend2", "type=" + response.success);
        } else {
            OrderManagementExpressSetup.dialogOpen("spendconfirm", "type=one");
        }
    });

    requestPOST.fail(function (jqXHR, textStatus, errorThrown) {
        error = true;
        Grainger.Modals.killModal();
    });    
    
    requestPOST.always(function (response) {
        if (error) {
            errorBlock.html(JSON.parse(response.responseText).error);
            errorBlock.removeClass('hide');
        }    
    });    
    
};

OrderManagementExpressSetup.stepTwoAjaxSave = function (checkboxID, step) {
    "use strict";
    
    var checkbox = jQuery("#" + checkboxID);
    if(checkbox.prop('checked')) {
        var requestPOST = jQuery.ajax({
            type: 'POST',
            cache: false,
            url: OrderManagementExpressSetup.ajaxBasePath + "setAllOrdersRequireApproval",
            data: { checked: true },
            dataType: 'json'        
        });
        
        requestPOST.done(function (response, textStatus, jqXHR) {
            if (OrderManagementExpressSetup.defaultType === OrderManagementExpressSetup.DEFAULT_UNLIM) {
                OrderManagementExpressSetup.dialogOpen("spendconfirm", "type=three");
            } else {
                OrderManagementExpressSetup.dialogOpen("spendconfirm", "type=two");
            }
        });

        requestPOST.fail(function (jqXHR, textStatus, errorThrown) {
            alert("System error. Please try again.");
            Grainger.Modals.killModal();
        });        
    } else {
        OrderManagementExpressSetup.dialogOpen("spendconfirm", "type=three");
    }

};

OrderManagementExpressSetup.approversDropDownMenu = function () {
    "use strict";
    jQuery("#management-show-all-users").toggleClass("active");
    jQuery("#step2_dropdown").toggleClass("hidden");
};

OrderManagementExpressSetup.approversSave = function (formID, step, errorID) {
    "use strict";
    
    Grainger.Modals.killWaitModal();
    Grainger.Modals.waitModal();

    if(jQuery("#adminText").html() == jQuery("#downDownLabel").html()){
        jQuery("#oms-approver-info-container .standardCheckbox").prop("checked", false);
    } else if(jQuery("#standardText").html() == jQuery("#downDownLabel").html()) {
        jQuery("#oms-approver-info-container .adminCheckbox").prop("checked", false);
    } 

    var errorBlock  = jQuery("#" + errorID).addClass('hide'), 
        check_array = jQuery("#approverForm input:checked"), 
        jsonIDArray = [],
        requestPOST;
    
    if (check_array.length <= 0) {
        errorBlock.removeClass('hide');
        return false;
    }

    check_array.each(function(index, value) {
        jsonIDArray[index] = jQuery(this).attr('id');
    });
    
    requestPOST = jQuery.ajax({
        type: 'POST',
        cache: false,
        url: OrderManagementExpressSetup.ajaxBasePath + "saveExpressData",
        data: { jsonIDArray: JSON.stringify(jsonIDArray) },
        dataType: 'json'
    });
    
    requestPOST.done(function (response, textStatus, jqXHR) {
        OrderManagementExpressSetup.dialogOpen("complete");
        Grainger.Modals.killWaitModal();
    });

    requestPOST.fail(function (jqXHR, textStatus, errorThrown) {
        alert("System failure - please try again");
        Grainger.Modals.killModal();
    });
    
};

OrderManagementExpressSetup.completeExpressOMSSetup = function() {
    "use strict";
    OrderManagementExpressSetup.dialogClose();
    document.location.reload(true);
};

OrderManagementExpressSetup.handleEnterKey = function(event) {
    "use strict";

    if (event.which === 13) {
        jQuery("#save-spend-limit-btn").click();
    }
};

///////////////////////////////////////////////////////////////
//Pending Order Summary Code                                 //
///////////////////////////////////////////////////////////////
var PendingOrderSummary = PendingOrderSummary || {};
PendingOrderSummary.curFullname = "";
PendingOrderSummary.pageNumber = 1;
PendingOrderSummary.totalPages = 1;
PendingOrderSummary.previousValue;
PendingOrderSummary.approverCache;
PendingOrderSummary.approvedOrders = 0;
PendingOrderSummary.firstValidateOrderId = "-1";

PendingOrderSummary.onPageLoad = function (pagination, userApprover, orderCount) {
    var orderFilterControl = jQuery("#orderFilter");
    
    //Cache the old list by cloning it...
    var approverFilterControl = jQuery("#approverFilter");
    PendingOrderSummary.approverCache = approverFilterControl.children();
    
    if(orderFilterControl.val() != null) {
        PendingOrderSummary.previousOrderFilterValue = PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter;
        if(PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter !== "MY_ORDERS" && PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter !== "ALL_PENDING_STANDARD" && PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter !== "ALL_PENDING_MY_ACTION") {
            PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter = "ks_" + PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter;
        }
        orderFilterControl.val(PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter);
        PendingOrderSummary.showOrderFilterChanged();
    }

    if(userApprover) {
        
        //Validate each order and provide a callback to remove the spinner and add the appropriate link
        jQuery("input[name=approvalLineItemHidden]").each(function( index, domEle ) {
            var requestGET = jQuery.ajax({
                type: 'GET',
                cache: false,
                url: '/oms/pendingReview/validatePendingOrder/' + domEle.id,
                dataType: 'json'        
            });

            requestGET.done(function (response, textStatus, jqXHR) {
                switch(response.status) {
                case "READY_FOR_REVIEW":
                    jQuery("#ACTION" + response.orderCode).empty().append("<label class=\"commerce shorter button right\"><input type=\"button\" class=\"btn btnPrimary\" onclick=\"window.location.href='/pendingorder/confirmorder?ordercode=" + response.orderCode + "'\" title=\"" + PendingOrderSummary.review + "\" value=\"" + PendingOrderSummary.review + "\"></label>");
                    break;
                case "READY_FOR_APPROVAL":
                    jQuery("#ACTION" + response.orderCode).empty().append('<label class="commerce shorter button right">' +
                                                                          "<input type=\"button\" class=\"btn btnPrimary\" onclick=\"javascript:PendingOrderSummary.inlineApprove('" + response.orderCode + "')\" value=\"" + PendingOrderSummary.approve + "\"></label>");

                    PendingOrderSummary.approvedOrders++;
                    if(orderCount > 1 && PendingOrderSummary.approvedOrders > 1) {
                        if(PendingOrderSummary.firstValidateOrderId !== "") {
                            jQuery('#' + PendingOrderSummary.firstValidateOrderId).attr('disabled', false).removeClass('hide');
                            PendingOrderSummary.firstValidateOrderId = "";
                        }
                        
                        var topApproveAll = jQuery("#topApprovalAll");
                        if(topApproveAll.hasClass('hide')) {
                            topApproveAll.removeClass('hide');
                        }

                        var bottomApprovalAll = jQuery("#bottomApprovalAll");
                        if(bottomApprovalAll.hasClass('hide')) {
                            bottomApprovalAll.removeClass('hide');
                        }
                        
                        var selectAllLink = jQuery("#selectAllLink");
                        if(selectAllLink.hasClass('hide')) {
                            selectAllLink.removeClass('hide');
                        }
                        
                        jQuery('.selectAllHeaderColEmpty').removeClass('selectAllHeaderColEmpty').addClass('selectAllHeaderCol').addClass('first');
                        jQuery('.selectAllCheckColEmpty').removeClass('selectAllCheckColEmpty').addClass('selectAllCheckCol').addClass('first');
                        
                        jQuery('#' + response.orderCode).attr('disabled', false).removeClass('hide');
                    } else {
                        PendingOrderSummary.firstValidateOrderId = response.orderCode;
                    }
                    break;
                case "EXCEEDS_APPROVAL_LIMIT":
                    jQuery("#ACTION" + response.orderCode).empty().append('<a href="/pendingorder/confirmorder?ordercode=' + response.orderCode + '" title="' + PendingOrderSummary.exceedsApproval + '">' + PendingOrderSummary.exceedsApproval + '</a>');
                    break;
                case "NEEDS_EDIT":
                default:
                    jQuery("#ACTION" + response.orderCode).empty().append('<a href="/pendingorder/confirmorder?ordercode=' + response.orderCode + '" title="' + PendingOrderSummary.view +'">' + PendingOrderSummary.view + '</a>');
                    break;                    
                }
            });
        
            requestGET.fail(function (jqXHR, textStatus, errorThrown) {
                //Handle fail like it was an edit link
                Grainger.Modals.killModal();
            });
        });
    }
    
    if(pagination) {
        //Create the pagination
        var paginationMain = jQuery("#paginationMain");
        
        //First determine if we need to draw previous or not
        if(PendingOrderSummary.totalPages > 1 && PendingOrderSummary.pageNumber > 1) {
            jQuery("<li class='prev'></li>").append(jQuery("<a href='javascript:void(0);'>Prev</a>").click( PendingOrderSummary.generateChangePageHandler(PendingOrderSummary.pageNumber-1) )).appendTo(paginationMain);
        }
    
        //We always draw a one first, the question is whether to add dots (..) to it.
        //We also need to check if this the current selected one...
        var itemTextOne = "<li class='first";
        if(PendingOrderSummary.pageNumber === 1) {
            itemTextOne += " current'>1</li>";
            paginationMain.append(itemTextOne);
        } else {
            itemTextOne += "'></li>";
            
            var one;
            
            if( ((PendingOrderSummary.pageNumber-2) > 1) &&  PendingOrderSummary.totalPages > 5) {
                one = "1..</a>";
            } else {
                one = "1</a>";
            }
            
            jQuery(itemTextOne).append(jQuery("<a href='javascript:void(0);'>" + one).click( PendingOrderSummary.generateChangePageHandler(1) )).appendTo(paginationMain);
            
        }
            
        //Fill the middle...
        if(PendingOrderSummary.totalPages > 1) {
            var startMiddleDigit = 1;
            var endMiddleDigit = 1;
            var ellip = false;
            
            //Quick fix for two cases found by testers...
            if ( (PendingOrderSummary.pageNumber === 1 || PendingOrderSummary.pageNumber === 2) && PendingOrderSummary.totalPages >= 5) {
                startMiddleDigit = 2;
                endMiddleDigit = 5;
                if(PendingOrderSummary.totalPages > 5) 
                    ellip = true;
            } else if ( (PendingOrderSummary.pageNumber === PendingOrderSummary.totalPages ||
                         PendingOrderSummary.pageNumber === (PendingOrderSummary.totalPages-1)) && PendingOrderSummary.totalPages >= 5) {
                if( (PendingOrderSummary.totalPages - 4) <= 1 ) {
                    startMiddleDigit = 2;
                } else {
                    startMiddleDigit = (PendingOrderSummary.totalPages - 4);
                }
                endMiddleDigit = PendingOrderSummary.totalPages;
            }
            else {
                if(PendingOrderSummary.pageNumber - 2 < 2) {
                    startMiddleDigit = 2;
                } else {
                    startMiddleDigit = PendingOrderSummary.pageNumber - 2;
                }
                
                if(PendingOrderSummary.pageNumber + 2 >= PendingOrderSummary.totalPages) {
                    endMiddleDigit = PendingOrderSummary.totalPages;
                } else {
                    endMiddleDigit = PendingOrderSummary.pageNumber + 2;
                    ellip = true;
                }
            }
            
            for(; startMiddleDigit < endMiddleDigit;startMiddleDigit++) {
                var itemTextTwo = "<li";
                if(PendingOrderSummary.pageNumber === startMiddleDigit) {
                    itemTextTwo += " class='current'>" + startMiddleDigit + "</li>";
                    paginationMain.append(itemTextTwo);
                } else {
                    itemTextTwo += "></li>";
                    jQuery(itemTextTwo).append(jQuery("<a href='javascript:void(0);'>" + startMiddleDigit + "</a>").click( PendingOrderSummary.generateChangePageHandler(startMiddleDigit) )).appendTo(paginationMain);
                }
            }
            
            var digit = "";
            var itemTextMiddle = "<li class='";
            if(ellip) {
                digit = endMiddleDigit + "..";
            } else {
                itemTextMiddle += "last ";
                digit = endMiddleDigit;
            }
            
            if(PendingOrderSummary.pageNumber === endMiddleDigit) {
                itemTextMiddle += "current'>" + digit + "</li>";
                paginationMain.append(itemTextMiddle);
            } else {
                itemTextMiddle += "'></li>";
                jQuery(itemTextMiddle).append(jQuery("<a href='javascript:void(0);'>" + digit + "</a>").click( PendingOrderSummary.generateChangePageHandler(endMiddleDigit) )).appendTo(paginationMain); 
            }        
    
            //If we had a .. on the final middle digit, it means we aren't near the end yet and have a final number to render
            if(ellip) {
                jQuery("<li class='last'></li>").append(jQuery("<a href='javascript:void(0);'>" + PendingOrderSummary.totalPages + "</a>").click( PendingOrderSummary.generateChangePageHandler(PendingOrderSummary.totalPages) )).appendTo(paginationMain);
            }
            
            //And now lets see if we need to render a next or not
            if(PendingOrderSummary.pageNumber < PendingOrderSummary.totalPages) {
                jQuery("<li class='next'></li>").append(jQuery("<a href='javascript:void(0);'>Next</a>").click( PendingOrderSummary.generateChangePageHandler(PendingOrderSummary.pageNumber+1) )).appendTo(paginationMain);
            }
        }
        
        var paginationBottom = jQuery("#pendingOrderBottomRow section");
        jQuery(paginationMain).clone(true)
                              .attr('id', 'paginationBottom')
                              .appendTo(paginationBottom);
        
    }
};

//Please see: http://stackoverflow.com/questions/7774636/jquery-event-handler-created-in-loop
PendingOrderSummary.generateChangePageHandler = function(j) {
    return function(event) { 
        PendingOrderSummary.changePage(j);
    };
};

PendingOrderSummary.checkAllBoxes = function () {
    jQuery("input:checkbox[name=approvalLineItem]").each(function() {    
        if( !jQuery(this).hasClass('hide') ) {
            jQuery(this).prop('checked', true);
        }
    });    
};

PendingOrderSummary.changePage = function (newPage) {
    PendingOrderSummary.pageNumber = newPage;
    PendingOrderSummary.pageRefresh();
};

PendingOrderSummary.showOrderFilterChanged = function () {
    var orderFilterControl = jQuery("#orderFilter");
    var approverFilterControl = jQuery("#approverFilter");
    
    //Gotta add new keepstock logic for when they filter by a program name...
    if(orderFilterControl.val().substr(0,3) === "ks_") {

        approverFilterControl.attr('disabled', 'disabled');
        approverFilterControl.empty();
        
        //Need to AJAX grab the new content and parse it...
        var ksProgramName = orderFilterControl.val().substr(3);
                
        jQuery.ajax({
              type: 'GET',
              cache: false,
              url: '/oms/pendingReview/getApproversForKSProgram/' + escape(ksProgramName),
              success: function (data, textStatus, jqXHR) {
                  
                  approverFilterControl.append('<option value="">Everyone</option>');
                  
                  for(var i = 0;i < data.length;i++) {
                      approverFilterControl.append('<option value="' + data[i].pk + '">' + data[i].formattedFullName + '</option>');
                  }
                  
                  approverFilterControl.removeAttr('disabled');
              },
              dataType: 'json'
            });
        
    }
    else if(orderFilterControl.val() === "MY_ORDERS" || orderFilterControl.val() === "ALL_PENDING_STANDARD") {
        
        if(orderFilterControl.val() === "MY_ORDERS") {
            approverFilterControl.empty();
            jQuery.ajax({
                  type: 'GET',
                  cache: false,
                  url: '/myaccount/ordermanagement/pendingordersummary/getCurrentUserPendingStandardApprovers',
                  success: function (data, textStatus, jqXHR) {
                      approverFilterControl.append('<option value="">Everyone</option>');
                      for(var i = 0;i < data.length;i++) {
                          if(PendingOrderSummary.obscureKey !=  data[i].pk) {
                              approverFilterControl.append('<option value="' + data[i].pk + '">' + data[i].formattedFullName + '</option>');
                          }
                      }
                  },
                  dataType: 'json'
                });
                        
        } else {
            approverFilterControl.empty().append(PendingOrderSummary.approverCache.clone() );
            
            if(orderFilterControl.val() !== PendingOrderSummary.previousOrderFilterValue) {
                approverFilterControl.val("");
            } else {
                approverFilterControl.val(PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].approverFilter);
            }
        }    
        
        approverFilterControl.removeAttr('disabled');
        
    } else {
        approverFilterControl.empty().append(PendingOrderSummary.approverCache.clone() );

        approverFilterControl.attr('disabled', 'disabled');
        approverFilterControl.val(PendingOrderSummary.obscureKey);
    }
    
};

PendingOrderSummary.changeSortColumn = function(column, order) {
    PendingOrderSummary.pageNumber = 1;
    PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].sortColumn = column;
    PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].sortOrder = order;
    PendingOrderSummary.pageRefresh();
};

PendingOrderSummary.applyFilterSettings = function() {
    PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].sortColumn = 'ORDER_DATE';
    PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].sortOrder = 'ASCENDING';
    PendingOrderSummary.pageNumber = 1;
    PendingOrderSummary.pageRefresh();
};

PendingOrderSummary.changeTab = function(newTab, isUserApprover) {
    PendingOrderSummary.pageNumber = 1; 
    if(isUserApprover && PendingOrderSummary.orderType === 'STANDARD_REJECTED') {
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].approverFilter = PendingOrderSummary.obscureKey;
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter = 'ALL_PENDING_MY_ACTION';
        PendingOrderSummary.orderType = newTab;
        PendingOrderSummary.changeLocation();
        return false;
    }
    
    PendingOrderSummary.orderType = newTab;
    PendingOrderSummary.changeLocation();
    return false;
};

PendingOrderSummary.pageRefresh = function () {

    var approverFilter = jQuery("#approverFilter").val();
    if(approverFilter == null) {
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].approverFilter = "";
    } else {
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].approverFilter = approverFilter;
    }
    
    var orderFilter = jQuery("#orderFilter").val();
    if(orderFilter == null) {
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter = "MY_ORDERS";
    } else {
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter = orderFilter;
    }
    
    if( (PendingOrderSummary.orderType === 'KEEPSTOCK' && PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter === 'MY_ORDERS') || 
           (PendingOrderSummary.orderType === 'STANDARD'  && PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter.substr(0,3) === "ks_"))    
    {
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter = 'ALL_PENDING_MY_ACTION';
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].approverFilter = PendingOrderSummary.obscureKey;
    } else if(PendingOrderSummary.orderType === 'KEEPSTOCK' && PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter.substr(0,3) === "ks_") {
        PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter = PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter.substr(3);
    }
    
    PendingOrderSummary.changeLocation();
    return false;
};

PendingOrderSummary.changeLocation = function () {
    var newLocation = '/myaccount/ordermanagement/pendingordersummary?orderType=' + PendingOrderSummary.orderType + '&orderFilter=' + PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].orderFilter + '&approverFilter=' + PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].approverFilter + "&sortColumn=" + PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].sortColumn + "&sortOrder=" + PendingOrderSummary.tabbedFilterMap[PendingOrderSummary.orderType].sortOrder + "&pageNumber=" + PendingOrderSummary.pageNumber;
    window.location.replace(newLocation);
};

//Inline approve requires a modal dialog...
PendingOrderSummary.approveConfirmModalID      = "OMSapproveConfirmModalID";
PendingOrderSummary.modal        = null;

PendingOrderSummary.openApprovalConfirmModal = function(jsonData, reviewerPk) {
	"use strict";
	
	//PendingOrderSummary.closeApprovalConfirmModal();

	var reviewer = "";
	if (reviewerPk !== undefined && reviewerPk !== null) {
		reviewer = "?reviewer=" + reviewerPk;
	}

    Grainger.Modals.waitModal();

	var requestPOST = jQuery.ajax({
		type: 'POST',
		cache: false,
		url: '/myaccount/ordermanagement/pendsummaryapprovalconfirmmodalpage' + reviewer,
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify(jsonData),
		dataType: 'html'		
	});
	
	requestPOST.done(function (response, textStatus, jqXHR) {
        Grainger.Modals.createAndShowModal(PendingOrderSummary.approveConfirmModalID, PendingOrderSummary.approveConfirmModalID, response);
    });

	requestPOST.fail(function (jqXHR, textStatus, errorThrown) {
    	alert("Error when creating the approval confirmation dialog.");
        Grainger.Modals.killModal();
    });
    
};

PendingOrderSummary.closeApprovalConfirmModal = function() {
	"use strict";
    Grainger.Modals.killModal();
    PendingOrderSummary.pageNumber = 1;
    PendingOrderSummary.pageRefresh();
};

PendingOrderSummary.inlineApproveHelper = function(orderCodes, reviewerPk) {
    "use strict";

    var reviewer = "";
    if (reviewerPk !== undefined && reviewerPk !== null) {
        reviewer = "?reviewer=" + reviewerPk;
    }

    jQuery.ajax({
        type: 'POST',
        cache: false,
        url: '/oms/pendingReview/approveOrderMultipleOrders' + reviewer,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(orderCodes),
        success:     function (response, textStatus, jqXHR) {
            var jsonObj = JSON.parse(response);

            if (jsonObj != null && jsonObj.showSelectReviewerModal) {
                PendingOrderSummary.openInlineReviewerDialog();
                return;
            }
            if( jsonObj.analytics.orderDetails != null && jsonObj.analytics.orderDetails.length > 0 ) {
                jQuery.each(jsonObj.analytics.orderDetails, function(index, value) {
                    if(this.promos == null || this.promos.length == 0) {
                        this.promos = "";
                    }
                });
            }
            
            OrderManagementUtility.doModalAnalytics(jsonObj.analytics);
            PendingOrderSummary.openApprovalConfirmModal(jsonObj.approvalModalData, reviewerPk);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            Grainger.Modals.killModal();
            alert("We are sorry, there was an error processing your transaction.  We value your business; please try again in a few minutes.");        
        }
    });
    
};

PendingOrderSummary.inlineApprove = function (orderNumber) {
    "use strict";

    var orderCodes = [orderNumber];
    PendingOrderSummary.inlineApproveHelper( orderCodes );
};

PendingOrderSummary.inlineApproveMultiple = function() {
    "use strict";

    var orderCodes = [];
    var i = 0;
    jQuery("input:checkbox[name=approvalLineItem]").each(function() {
        if( !jQuery(this).hasClass('hide') && jQuery(this).prop('checked') ) {
            orderCodes[i] = jQuery(this).attr('id');
            i++;
        }
    });

    if(orderCodes.length <= 0) {
        alert("Please select one or more rows");
        return;
    }

    PendingOrderSummary.inlineApproveHelper( orderCodes );
};

///////////////////////////////////////////////////////////////
//PENDING ORDER SUMMARY SELECT INLINE REVIEWER MODAL         //
///////////////////////////////////////////////////////////////
PendingOrderSummary.selectInlineReviewerDialogID = "#pendingOrderSummaryInlineReviewerModal";

PendingOrderSummary.openInlineReviewerDialog = function() {
    "use strict";

    Grainger.Modals.killModal();
    Grainger.Modals.waitModal();

    var requestGET = jQuery.ajax({
        type: 'GET',
        cache: false,
        url: '/myaccount/ordermanagement/pendsummaryselectreviewermodalpage',
        contentType: "application/json; charset=utf-8",
        dataType: 'html'
    });

    requestGET.done(function (response, textStatus, jqXHR) {
        Grainger.Modals.createAndShowModal(null, null, response);
    });

    requestGET.fail(function (jqXHR, textStatus, errorThrown) {
        Grainger.Modals.killModal();
        alert("System error. Please try again.");
    });
};

PendingOrderSummary.closeInlineReviewerDialog = function() {
	"use strict";
    Grainger.Modals.killModal();
	return false;
};

PendingOrderSummary.setInlineReviewer = function() {
    "use strict";

    var selectedReviewer = jQuery("#reviewers").val();
    if (!selectedReviewer) {
        jQuery("#oms_select_reviewer_error").removeClass("hide");
        return;
    }

    PendingOrderSummary.closeInlineReviewerDialog();
    PendingOrderSummary.inlineApproveHelper(null, selectedReviewer);
};

///////////////////////////////////////////////////////////////
//OMS Approval Options (Order Checkout) JavaScript           //
///////////////////////////////////////////////////////////////
var OMSApprovalOptions = OMSApprovalOptions || {};
OMSApprovalOptions.defaultCCEmailUserPK = "";
OMSApprovalOptions.currentUserPK = "";
OMSApprovalOptions.approverIsReviewerMsg = "";
OMSApprovalOptions.reviewerActiveOnAccount = "";
OMSApprovalOptions.showMessageInPageHeader = false;

OMSApprovalOptions.onPageLoad = function () {

    var omsCCEmailSelect = jQuery("#omsCCEmailSelect");
    var omsCcUserSetAsDefault = jQuery("#omsCcUserSetAsDefault");
    
    if(OMSApprovalOptions.defaultCCEmailUserPK !== "") {
        omsCCEmailSelect.val(OMSApprovalOptions.defaultCCEmailUserPK);
        omsCcUserSetAsDefault.prop('checked', true);
    }
    
    if(OMSApprovalOptions.currentUserPK !== "" && OMSApprovalOptions.approverIsReviewerMsg !== "" && !OMSApprovalOptions.approverIsReviewer) {
        OMSApprovalOptions.reviewerChange();
    }
    
    if(OMSApprovalOptions.approverIsReviewer) {
        jQuery("#takeOrderActionHeader").addClass("hide");
        jQuery("#altorderReviewerIsApproverMsg, #altorderReviewerIsApproverMsgTwo").removeClass("hide");
        jQuery("#omsReferenceInfoOptionalForSubmitterNote").empty().append(OMSApprovalOptions.approverIsReviewerMsg);
    } else {
        jQuery("#takeOrderActionHeader").removeClass("hide");
    }
};

OMSApprovalOptions.omsCCEmailSelectChanged = function() {
    var omsCCEmailSelect = jQuery("#omsCCEmailSelect");
    var omsCcUserSetAsDefault = jQuery("#omsCcUserSetAsDefault");
    if(omsCCEmailSelect.val() === "") {
        omsCcUserSetAsDefault.prop('checked', false);
    }    
};

OMSApprovalOptions.reviewerChange = function() {
    var approverOptions = jQuery("select[name=omsReviewers]");
    if(approverOptions.val() === OMSApprovalOptions.currentUserPK) {
        jQuery("#omsReferenceInfoOptionalForSubmitterNote").empty().append(OMSApprovalOptions.approverIsReviewerMsg);
        jQuery("#takeOrderActionHeader").addClass("hide");
        jQuery("#altorderReviewerIsApproverMsg, #altorderReviewerIsApproverMsgTwo").removeClass("hide");
    } else {
        jQuery("#omsReferenceInfoOptionalForSubmitterNote").empty().append(OMSApprovalOptions.reviewerActiveOnAccount);
        jQuery("#takeOrderActionHeader").removeClass("hide");
        jQuery("#altorderReviewerIsApproverMsg, #altorderReviewerIsApproverMsgTwo").addClass("hide");
    }
};

OMSApprovalOptions.approverActionsChange = function() {
    var approverAction = jQuery("select[name=approverActions]");
    if('APPROVE' == approverAction.val()){
        if(OMSApprovalOptions.approverIsReviewer) {
            jQuery("#takeOrderActionHeader").addClass("hide");
            jQuery("#altorderReviewerIsApproverMsg, #altorderReviewerIsApproverMsgTwo").removeClass("hide");
            jQuery("#omsReferenceInfoOptionalForSubmitterNote").empty().append(OMSApprovalOptions.approverIsReviewerMsg);
        } else {
            OMSApprovalOptions.reviewerChange();
        }
    } else {
        jQuery("#takeOrderActionHeader").removeClass("hide");
        jQuery("#altorderReviewerIsApproverMsg, #altorderReviewerIsApproverMsgTwo").addClass("hide");
        jQuery("#omsReferenceInfoOptionalForSubmitterNote").empty().append(OMSApprovalOptions.reviewerActiveOnAccount);
    }
};

///////////////////////////////////////////////////////////////
//OMS Order History Table (Order Checkout) JavaScript        //
///////////////////////////////////////////////////////////////
var OMSOrderHistoryTable = OMSOrderHistoryTable || {};
OMSOrderHistoryTable.returnedMsg = "";
OMSOrderHistoryTable.defaultNoOfRowsCount= 0;

OMSOrderHistoryTable.onPageLoad = function () {
    if(jQuery.trim(OMSOrderHistoryTable.returnedMsg).length > 0) {
        jQuery("#oms-message").after('<p>' + OMSOrderHistoryTable.returnedMsg + '</p>');
    }

    jQuery('p.showHideOrderHistoryLink > a.show-more-orderhistory').bind('click',function(){
        jQuery(this).addClass('hide');
        jQuery(this).next('.show-less-orderhistory').removeClass('hide');
        OMSOrderHistoryTable.showMoreOrderHistory();
    });
    
    jQuery('p.showHideOrderHistoryLink > a.show-less-orderhistory').bind('click',function(){
        jQuery(this).addClass('hide');
        jQuery(this).prev('.show-more-orderhistory').removeClass('hide');
        OMSOrderHistoryTable.showLessOrderHistory();
    });
};

OMSOrderHistoryTable.showMoreOrderHistory = function() {
    jQuery('tr[id^="orderHistoryData-"]').each(function(index){
        if(index > (OMSOrderHistoryTable.defaultNoOfRowsCount - 1) ){
            jQuery(this).removeClass('hide');
        }
    });
};

OMSOrderHistoryTable.showLessOrderHistory = function() {
    jQuery('tr[id^="orderHistoryData-"]').each(function(index){
        if(index > (OMSOrderHistoryTable.defaultNoOfRowsCount - 1)){
            jQuery(this).addClass('hide');
        }
    });
};



///////////////////////////////////////////////////////////////
//OMS Submitter Read Only Component
///////////////////////////////////////////////////////////////
var OMSApprovalReadOnly = OMSApprovalReadOnly || {};
OMSApprovalReadOnly.headerText = "";
OMSApprovalReadOnly.dialog = null;
OMSApprovalReadOnly.dialogID = "omsccusersdialogreadonly";
OMSApprovalReadOnly.onPageLoad = function() {
    jQuery("#oms-message").append(OMSApprovalReadOnly.headerText);
    jQuery("#oms-message").append("<p class='alert alert-block error'>" + OMSApprovalReadOnly.spendLimitText + "</p>").removeClass('hide');
};

OMSApprovalReadOnly.popupCCDialog = function() {
	"use strict";
    Grainger.Modals.createAndShowModal(OMSApprovalReadOnly.dialogID, OMSApprovalReadOnly.dialogID, jQuery("#ccDialog").html());
};

OMSApprovalReadOnly.dialogClose = function () {
    "use strict";
    Grainger.Modals.killModal();
};

///////////////////////////////////////////////////////////////
//OMS Suspend Order Management - With Pending Orders
///////////////////////////////////////////////////////////////
var SuspendOmsWithPendingOrders = SuspendOmsWithPendingOrders || {};
SuspendOmsWithPendingOrders.dialog = null;
SuspendOmsWithPendingOrders.dialogID = "suspendOmsWithPendingOrders";

SuspendOmsWithPendingOrders.dialogClose = function () {
    "use strict";
    Grainger.Modals.killModal();
};

SuspendOmsWithPendingOrders.popupSuspendOmsWithPendingOrders = function() {
    "use strict";
    Grainger.Modals.createAndShowModal(SuspendOmsWithPendingOrders.dialogID, "Orders Still Pending", jQuery("#oms-suspend-pending-orders-modal").html());
};

/////////////////////////////////////////////////////////////
//OMS Order History: Denied Orders
/////////////////////////////////////////////////////////////
var OmsOrderSummary = OmsOrderSummary || {};
OmsOrderSummary.deniedOrderTabActive = false;
OmsOrderSummary.currentTab = '';
OmsOrderSummary.sortColumn = 'ORDER_DATE';
OmsOrderSummary.sortOrder = 'ASCENDING';
OmsOrderSummary.pageNumber = 1;
OmsOrderSummary.withinthelast = "";
OmsOrderSummary.loadInProgress = false;

OmsOrderSummary.addTableRowsHelper = function (tableInsertLocation, data) {
    
    jQuery.each(data, function(index, value) {
        var orderNumber = "";
        var internal = true;
        if(value.orderNumber !== "") {
            orderNumber = value.orderNumber;
        } else {
            orderNumber = value.sapOrderNumber;
            internal = false;
        }
        
        var tableRow = "<tr>" +
                       "<td class='first'>" + value.formattedOrderDate + "<br />" + value.formattedTimestamp + "</td>" +
                       '<td><a href="/myaccount/orderdetail/deniedorder?ordercode=' + orderNumber + '">' + orderNumber + '</a></td>' +
                       "<td><!-- mp_trans_disable_start -->" + value.orderedByName + "<!-- mp_trans_disable_end --></td>" +
                       "<td>" + value.orderLines + "</td>" +
                       "<td>" + value.formattedSubtotal + "</td>" + 
                       '<td><label class="commerce button right"><input class="btn" type="button" value="Reorder" onclick="itemsToCartByOrderNumber(\'' + orderNumber + '\',' + internal + ',\'OSOH\',true)"></label></td>' +
                       "</tr>";
        
        tableInsertLocation.append(tableRow);
    });
    
};

OmsOrderSummary.applyFilters = function() {
    if(OmsOrderSummary.loadInProgress) {
        return;
    }
    //Defaulting back to page 1 when user applies a new filter
    OmsOrderSummary.pageNumber = 1;
    
    OmsOrderSummary.filterChange();
    OmsOrderSummary.refreshDeniedTableData();
};

OmsOrderSummary.filterChange = function () {
    var omsDeniedUserFilter = jQuery('#omsDeniedUserFilter');
    var omsDeniedDateRangeFilter = jQuery('#omsDeniedDateRangeFilter option:selected');
    var omsDeniedSearchFilterText = jQuery('#omsDeniedSearchFilterText');

    omsDeniedSearchFilterText.empty();

    if(omsDeniedUserFilter.is('select')) {
        var selectedOption = jQuery('#omsDeniedUserFilter option:selected'); 
        var headerText = jQuery('#omsDeniedUserFilter option:selected').text();
        
        if(jQuery('#omsDeniedUserFilter option:selected').val().substr(0, 4) === "USER") {
            headerText += ' ' + g_deniedorders;
        }
        
        headerText += ' ' + g_withinthelast + ' ' + omsDeniedDateRangeFilter.text();
        omsDeniedSearchFilterText.append(headerText);
    } else {
        omsDeniedSearchFilterText.append(omsDeniedUserFilter.attr('name') + ' ' + g_withinthelast + ' ' + omsDeniedDateRangeFilter.text());
    }    
};

OmsOrderSummary.handleDeniedTabClick = function () {
	if(OmsOrderSummary.loadInProgress) {
		return;
	}
	
	var omsDeniedUserFilter = jQuery('#omsDeniedUserFilter').val();
	var omsDeniedDateRangeFilter = jQuery('#omsDeniedDateRangeFilter').val();
	OmsOrderSummary.loadInProgress = true;
	
	var requestPOST = jQuery.ajax({
		type: 'GET',
		cache: false,
		url: '/oms/pendingReview/getDeniedOrders/' + omsDeniedUserFilter + '/' + omsDeniedDateRangeFilter + '/' + OmsOrderSummary.sortColumn + '/' + OmsOrderSummary.sortOrder + '/' + OmsOrderSummary.pageNumber,
		dataType: 'json'		
	});
	
	requestPOST.done(function (response, textStatus, jqXHR) {
		var deniedOrdersArray = response.deniedOrders;
		var totalRecordCount = response.totalRecordCount;
		var totalPages = response.totalPages;
		var tableInsertLocation = jQuery('#deniedOrdersTable > tbody:last');
		switch(OmsOrderSummary.currentTab) {			
			case 'order':
				jQuery("#orderhistoryOrdersTab").removeClass("active");
				jQuery("#order-history").addClass('hide');
				break;
			case 'item':
				jQuery("#orderhistoryItemsTab").removeClass("active");
				jQuery("#purchased-items").addClass('hide');
				break;
			case 'downloads':
				jQuery("#orderhistoryDownloadsTab").removeClass("active");
				jQuery("#orderHistoryDownloads").addClass('hide');
				break;				
			case 'denied':
				return;
			default:
				alert("Invalid tab click");
				break;
		}
		OmsOrderSummary.currentTab = 'denied';
		
		//Order history doesn't localize any of it's JavaScript... We will deal with it later as an entirity. 
		jQuery("#pageHeader").html("<h1 id='pageHeader'>Denied Orders</h1>");
		jQuery("#errorMsg").addClass('hide');
		jQuery("#nonOmsrelatedHeader").addClass('hide');
		jQuery("#oms-related-headinfo").removeClass('hide');
		jQuery("#deniedOrdersItemsTab").addClass('active');
		
		OmsOrderSummary.filterChange();
		
		tableInsertLocation.empty();
		if(deniedOrdersArray.length <= 0) {
			//TODO: They haven't given us text yet to use here. Need to find out from UX and fix in the future 
			tableInsertLocation.append('<tr><td colspan="6"><p class="alert noOrdersPending">No denied orders were found</p></td></tr>');
		} else {
			OmsOrderSummary.addTableRowsHelper(tableInsertLocation, deniedOrdersArray);	
			OmsOrderSummary.createPagination(OmsOrderSummary.pageNumber, totalPages);
		}
		
		jQuery("#oh-denied-orders-tab").removeClass('hide');		
		OmsOrderSummary.loadInProgress = false;
	    
    });

    requestPOST.fail(function (jqXHR, textStatus, errorThrown) {
        Grainger.Modals.killModal();
        alert("Could not retrieve the denied order data");        
    });
};

OmsOrderSummary.handleTabChange = function (newTab) {
    if(OmsOrderSummary.loadInProgress) {
        return;
    }
    
    jQuery("#oh-denied-orders-tab").addClass('hide');
    
    if(OmsOrderSummary.currentTab === '') {
        if(jQuery("#deniedOrdersItemsTab").hasClass("active")) {
            OmsOrderSummary.currentTab = 'denied';
        } else if(jQuery("#orderhistoryOrdersTab").hasClass("active")) {
            OmsOrderSummary.currentTab = 'order';
        } else if(jQuery("#orderhistoryItemsTab").hasClass("active")) {
            OmsOrderSummary.currentTab = 'item';
        } else if(jQuery("#orderhistoryDownloadsTab").hasClass("active")) {
            OmsOrderSummary.currentTab = 'downloads';
        } else {
            OmsOrderSummary.currentTab = 'order';
        }
    }
    
    if(newTab === 'denied') {
        if(OmsOrderSummary.currentTab === 'denied') {
            return;
        }
        //Change up the page for OMS
        OmsOrderSummary.deniedOrderTabActive = true;
        OmsOrderSummary.handleDeniedTabClick();
    } else {
        if(OmsOrderSummary.deniedOrderTabActive) {
            //Hide our OMS Denied Order DOM
            OmsOrderSummary.deniedOrderTabActive = false;
            jQuery("#errorMsg").removeClass('hide');
            jQuery("#oms-related-headinfo").addClass('hide');
            jQuery("#nonOmsrelatedHeader").removeClass('hide');
            jQuery("#deniedOrdersItemsTab").removeClass("active");
        }
        setCurrentURLBasedOnTab(newTab);
        OmsOrderSummary.currentTab = newTab;
    }
};

OmsOrderSummary.setSearchOrderHistoryVisibility = function (enabled){
    var omsSearchContainer = jQuery("#searchOrderHistory"),
        omsParentSearch = jQuery("#nonOmsrelatedHeader"),
        omsWidth = omsSearchContainer.outerWidth(true),
        omsHeight = omsSearchContainer.outerHeight(true),
        omsDisabledDiv = jQuery('<div id="omsSearchHeaderDisabled" />');
    
    if(enabled) {
        if(jQuery('#omsSearchHeaderDisabled').length > 0 ) {
            jQuery('#omsSearchHeaderDisabled').remove();
        }
    } else {
        omsDisabledDiv.appendTo(omsSearchContainer).css({
            height: omsHeight,
            width: omsWidth,
            opacity: 0.25
        });
    }
    
};

OmsOrderSummary.refreshDeniedTableData = function () {
    OmsOrderSummary.refreshDeniedTableData(false, null, null);
};

OmsOrderSummary.refreshDeniedTableData = function (changedSort, atag, sortClass) {
    OmsOrderSummary.loadInProgress = true;
    var omsDeniedUserFilter = jQuery('#omsDeniedUserFilter').val();
    var omsDeniedDateRangeFilter = jQuery('#omsDeniedDateRangeFilter').val();
    
    jQuery('#oh-denied-orders-tab').fadeTo('fast',0.2);
    
    var requestGET = jQuery.ajax({
        type: 'GET',
        cache: false,
        url: '/oms/pendingReview/getDeniedOrders/' + omsDeniedUserFilter + '/' + omsDeniedDateRangeFilter + '/' + OmsOrderSummary.sortColumn + '/' + OmsOrderSummary.sortOrder + '/' + OmsOrderSummary.pageNumber,
        dataType: 'json'        
    });
    
    requestGET.done(function (response, textStatus, jqXHR) {
        var deniedOrdersArray = response.deniedOrders;
        var totalRecordCount = response.totalRecordCount;
        var totalPages = response.totalPages;
        
        var tableInsertLocation = jQuery('#deniedOrdersTable > tbody:last');
        tableInsertLocation.empty();

        if(deniedOrdersArray.length <= 0) {
            //TODO: They haven't given us text yet to use here. Need to find out from UX and fix in the future 
            tableInsertLocation.append('<tr><td colspan="6"><p class="alert noOrdersPending">No denied orders were found</p></td></tr>');
        } else {
            OmsOrderSummary.addTableRowsHelper(tableInsertLocation, deniedOrdersArray);    
            OmsOrderSummary.createPagination(OmsOrderSummary.pageNumber, totalPages);
        }

        if(changedSort) {
            jQuery("#deniedOrdersTable > thead").find('a').removeClass();
            jQuery(atag).addClass(sortClass);
        }
        
        jQuery("#omsEditFilterTooltipPopup").addClass('hidden');
        jQuery('#oh-denied-orders-tab').fadeTo('fast',1);
        OmsOrderSummary.loadInProgress = false;
    });

    requestGET.fail(function (jqXHR, textStatus, errorThrown) {
        Grainger.Modals.killModal();
        jQuery("#omsEditFilterTooltipPopup").addClass('hidden');
        alert("Could not retrieve the denied order data");
    });
};

OmsOrderSummary.changeSortColumnAndOrder = function (atag, column) {
    if(OmsOrderSummary.loadInProgress) {
        return false;
    }
    var sortClass = 'sort';    
    
    if (column === OmsOrderSummary.sortColumn) {
        if(OmsOrderSummary.sortOrder === 'ASCENDING') {
            OmsOrderSummary.sortOrder = 'DESCENDING';
        } else {
            OmsOrderSummary.sortOrder = 'ASCENDING';
            sortClass = 'sort-reverse';
        }
    } else {
        OmsOrderSummary.sortColumn = column;
        OmsOrderSummary.sortOrder = 'ASCENDING';
        sortClass = 'sort-reverse';
    }
    //Defaulting back to page 1 when user sorts the column.
    OmsOrderSummary.pageNumber = 1;
    
    OmsOrderSummary.refreshDeniedTableData(true, atag, sortClass);
};

OmsOrderSummary.createPagination = function(pageNumber, totalPages) {
        //Create the pagination
        var paginationMain = jQuery("#paginationMain");
        paginationMain.empty();
        
        if(totalPages <= 0) {
            return;
        }
        
        //First determine if we need to draw previous or not
        if(totalPages > 1 && pageNumber > 1) {
            jQuery("<li class='prev'></li>").append(jQuery("<a href='javascript:void(0);'>Prev</a>").click( OmsOrderSummary.generateChangePageHandler(pageNumber-1) )).appendTo(paginationMain);
        }
    
        //We always draw a one first, the question is whether to add dots (..) to it.
        //We also need to check if this the current selected one...
        var itemTextOne = "<li class='first";
        if(pageNumber === 1) {
            itemTextOne += " current'>1</li>";
            paginationMain.append(itemTextOne);
        } else {
            itemTextOne += "'></li>";
            
            var one;
            
            if( ((pageNumber-2) > 1) && totalPages > 5) {
                one = "1..</a>";
            } else {
                one = "1</a>";
            }
            
            jQuery(itemTextOne).append(jQuery("<a href='javascript:void(0);'>" + one).click( OmsOrderSummary.generateChangePageHandler(1) )).appendTo(paginationMain);
            
        }
            
        //Fill the middle...
        if(totalPages > 1) {
            var startMiddleDigit = 1;
            var endMiddleDigit = 1;
            var ellip = false;
            
            //Quick fix for two cases found by testers...
            if ( (pageNumber === 1 || pageNumber === 2) && totalPages >= 5) {
                startMiddleDigit = 2;
                endMiddleDigit = 5;
                if(totalPages > 5) 
                    ellip = true;
            } else if ( (pageNumber === totalPages ||
                         pageNumber === (totalPages-1)) && totalPages >= 5) {
                if( (totalPages - 4) <= 1 ) {
                    startMiddleDigit = 2;
                } else {
                    startMiddleDigit = (totalPages - 4);
                }
                endMiddleDigit = totalPages;
            }
            else {
                if(pageNumber - 2 < 2) {
                    startMiddleDigit = 2;
                } else {
                    startMiddleDigit = pageNumber - 2;
                }
                
                if(pageNumber + 2 >= totalPages) {
                    endMiddleDigit = totalPages;
                } else {
                    endMiddleDigit = pageNumber + 2;
                    ellip = true;
                }
            }
            
            for(; startMiddleDigit < endMiddleDigit;startMiddleDigit++) {
                var itemTextTwo = "<li";
                if(pageNumber === startMiddleDigit) {
                    itemTextTwo += " class='current'>" + startMiddleDigit + "</li>";
                    paginationMain.append(itemTextTwo);
                } else {
                    itemTextTwo += "></li>";
                    jQuery(itemTextTwo).append(jQuery("<a href='javascript:void(0);'>" + startMiddleDigit + "</a>").click( OmsOrderSummary.generateChangePageHandler(startMiddleDigit) )).appendTo(paginationMain);
                }
            }
            
            var digit = "";
            var itemTextMiddle = "<li class='";
            if(ellip) {
                digit = endMiddleDigit + "..";
            } else {
                itemTextMiddle += "last ";
                digit = endMiddleDigit;
            }
            
            if(pageNumber === endMiddleDigit) {
                itemTextMiddle += "current'>" + digit + "</li>";
                paginationMain.append(itemTextMiddle);
            } else {
                itemTextMiddle += "'></li>";
                jQuery(itemTextMiddle).append(jQuery("<a href='javascript:void(0);'>" + digit + "</a>").click( OmsOrderSummary.generateChangePageHandler(endMiddleDigit) )).appendTo(paginationMain); 
            }        
    
            //If we had a .. on the final middle digit, it means we aren't near the end yet and have a final number to render
            if(ellip) {
                jQuery("<li class='last'></li>").append(jQuery("<a href='javascript:void(0);'>" + totalPages + "</a>").click( OmsOrderSummary.generateChangePageHandler(totalPages) )).appendTo(paginationMain);
            }
            
            //And now lets see if we need to render a next or not
            if(pageNumber < totalPages) {
                jQuery("<li class='next'></li>").append(jQuery("<a href='javascript:void(0);'>Next</a>").click( OmsOrderSummary.generateChangePageHandler(pageNumber+1) )).appendTo(paginationMain);
            }
        }
};

//Please see: http://stackoverflow.com/questions/7774636/jquery-event-handler-created-in-loop
OmsOrderSummary.generateChangePageHandler = function(j) {
    return function(event) {
        if(OmsOrderSummary.loadInProgress) {
            return false;
        }                
        OmsOrderSummary.pageNumber = j;
        OmsOrderSummary.refreshDeniedTableData();
    };
};

omsCartCarrierClicked = function() {
    jQuery("#designatedCarrier").val(jQuery("#cartRadio").val());
    
    jQuery("#carrierAccountNumber").val(jQuery("#carrierAccountNumberCart").val());
    
    jQuery("#best-option-selected").addClass("hide");
    
    if(jQuery("#carrierAccountNumber").val() == ""){
        jQuery("#carrierBillMe").attr("checked", false);
    } else {
        jQuery("#carrierBillMe").attr("checked", true);
    }
    
};

omsLockedCarrierClicked = function() {
    jQuery("#designatedCarrier").val(jQuery("#lockedRadio").val());
    
    jQuery("#carrierAccountNumber").val(jQuery("#carrierAccountNumberLock").val());
    
    if(jQuery("#carrierAccountNumber").val() == ""){
        jQuery("#carrierBillMe").attr("checked", false);
    } else {
        jQuery("#carrierBillMe").attr("checked", true);
    }
    
    if (jQuery("#isCarrierAccountLockedOms").val() == "false" && jQuery("#lockedRadio").val() != "BEST") {
        jQuery("#carrierBillMe").attr("disabled", false);
        jQuery("#carrierAccountNumber").attr("readonly", false);
        jQuery("#best-option-selected").removeClass("hide");
        
        jQuery("#carrierBillMe").attr("checked", false);
        jQuery("#carrierAccountNumberField").addClass("hide");
        
    } else {
        jQuery("#best-option-selected").addClass("hide");
    }
    
};

omsCarrierBillMeChange = function() {
    if(jQuery("#carrierBillMe").is(":checked")) {
        jQuery("#carrierAccountNumberField").removeClass("hide");
    } else {
        jQuery("#carrierAccountNumberField").addClass("hide");
    }
};

var orderDetailOnload = orderDetailOnload || {};

orderDetailOnload.generateOrderStatus = function(){
    var orderNumberList = [];
    orderNumberList.push(jQuery("#orderNumberHidden").val());
    var url = contextPath + "/my-account/itemStatus";    
    jQuery.ajax({
        dataType : "text",
        type: "GET",
        timeout: 10000,
        url: url,
        data: {        	
            orderNumberList: JSON.stringify(orderNumberList),
            ordersBelongToDifferentUsers:true    	
        },
      
        success: function(data){
            try{
                var itemStatus =  jQuery.parseJSON(data);                
                    itemStatus = itemStatus.items; 
                if (itemStatus.length > 0) {

	                for(i = 0;i < itemStatus.length;i++){
	                    var orderStatus = itemStatus[i].status;
	                    orderStatus = orderStatus.toUpperCase();
	                    var emptyString = "";
	                    var details = itemStatus[i].details[0];
	                    var deliveryDate = "";
	                    var deliveryStatus = "";
	                    
	                    jQuery(".itemStatus_" + itemStatus[i].itemNumber).html(itemStatus[i].status);
	                    if(details != undefined){	                    	
		                    if ( details.trackingUrl != undefined && details.trackingUrl != "") {
		                    	var trackUrl = jQuery(".trackUrl_" + itemStatus[i].itemNumber);
		                    	trackUrl.attr("href", details.trackingUrl);
		                    	trackUrl.attr("target", "_blank");
		                        jQuery(".track_" + itemStatus[i].itemNumber).show();
		                    } else {
		                    	jQuery(".track_" + itemStatus[i].itemNumber).hide();
		                    }
		                    
		                    deliveryDate = details.deliveryDate;	
		                    deliveryStatus = details.status;	
	                    }	                   
						
                        if (isNotEmpty(deliveryDate) && isNotEmpty(deliveryStatus)) {
                        	var status = deliveryStatus.toUpperCase();                        	
                        	switch (status) {
                        		case 'DELIVERED':
                        			var deliveredDateField = jQuery("#deliveredDateField_" + itemStatus[i].itemNumber);
                        	
                        			deliveredDateField.append("<br/><strong>" + deliveryDate + "</strong>");
									deliveredDateField.removeClass("hide");
                        			break;
                        		case 'SHIPPED':                        		                	
                        			var expectedDeliveryDateField = jQuery("#expectedArrivalDateField_" + itemStatus[i].itemNumber);                        			
                        			expectedDeliveryDateField.append("<br/><strong>" + deliveryDate + "</strong>");
                        			expectedDeliveryDateField.removeClass("hide");
                        			break;
                        		
                        		case 'PREPARING TO SHIP':  
                        			var expectedDeliveryDateFieldShippedTab = jQuery("#expectedArrivalDateFieldAsShipped_" + itemStatus[i].itemNumber);                        			
                        			expectedDeliveryDateFieldShippedTab.append("<br/><strong>" + deliveryDate + "</strong>");
                        			expectedDeliveryDateFieldShippedTab.removeClass("hide");
                        			var expectedDeliveryDateField = jQuery("#expectedArrivalDateField_" + itemStatus[i].itemNumber);                        			
                        			expectedDeliveryDateField.append("<br/><strong>" + deliveryDate + "</strong>");
                        			expectedDeliveryDateField.removeClass("hide");                        			
                        			break;	
                        			
                        		case 'PREPARING FOR PICKUP':
                        			var expectedPickUpDeliveryDateFieldPickUp = jQuery("#expectedPickUpArrivalDateFieldAsPickUp_" + itemStatus[i].itemNumber);                        			
                        			expectedPickUpDeliveryDateFieldPickUp.append("<br/><strong>" + deliveryDate + "</strong>");                        			
                        			expectedPickUpDeliveryDateFieldPickUp.removeClass("hide");                        			
                        			var expectedPickUpDeliveryDateFieldOrderedTab = jQuery("#expectedPickUpArrivalDateFieldOrderedTab_" + itemStatus[i].itemNumber);                        			
                        			expectedPickUpDeliveryDateFieldOrderedTab.append("<br/><strong>" + deliveryDate + "</strong>");
                        			expectedPickUpDeliveryDateFieldOrderedTab.removeClass("hide");
                        			break;
                        			
                        		case 'SHIPS FROM SUPPLIER TO BRANCH':
                        		case 'SHIPS FROM SUPPLIER':	
                        			var expectedPickUpDeliveryDateFieldPickUp = jQuery("#expectedArrivalDateFieldShipsFromSupplier_" + itemStatus[i].itemNumber);                        			
                        			expectedPickUpDeliveryDateFieldPickUp.append("<br/><strong>" + deliveryDate + "</strong>");
                        			expectedPickUpDeliveryDateFieldPickUp.removeClass("hide");
                        			var expectedPickUpDeliveryDateFieldOrderedTab = jQuery("#expectedArrivalDateFieldShipsFromSupplierOrderedTab_" + itemStatus[i].itemNumber);                        			
                        			expectedPickUpDeliveryDateFieldOrderedTab.append("<br/><strong>" + deliveryDate + "</strong>");
                        			expectedPickUpDeliveryDateFieldOrderedTab.removeClass("hide");
                        			break;
                        		case 'PICKED UP':
                        			var expectedPickUpDeliveryDateFieldPickUp = jQuery("#expectedPickedUpDateField_" + itemStatus[i].itemNumber);                        			
                        			expectedPickUpDeliveryDateFieldPickUp.append("<br/><strong>" + deliveryDate + "</strong>");                        			
                        			expectedPickUpDeliveryDateFieldPickUp.removeClass("hide");                        			
                        			
                        	}
                        }
	                }
            	} else {
                    jQuery("[class^='itemStatus_']").text("Unavailable");
                    jQuery("[class^='track_'").hide();
                    return false;
            	}
            } catch(error) {
                jQuery("[class^='itemStatus_']").text("Unavailable");
                jQuery("[class^='track_'").hide();
                return false;
            }
        },
        error : function(error, ioargs) {
            jQuery("[class^='itemStatus_']").text("Unavailable");
            jQuery("[class^='track_'").hide();
        }
    });
};

var omsPotable = omsPotable || {};

omsPotable.updateItem = function (orderNumber,itemNumber,configId,ksBinLocation,ksScannedOrderEntry, forPotableUse){
    "use strict";

    var requestPOST = jQuery.ajax({
        type: 'POST',
        cache: false,
        url: "/oms/pendingOrder/updatePotableAnswer?orderNumber=" + orderNumber + "&itemNumber=" + itemNumber + "&forPotableUse=" + forPotableUse + "&ksBinLocation=" + ksBinLocation + "&configId=" + configId + "&ksScannedOrderEntry=" + ksScannedOrderEntry
    });
    
    requestPOST.done(function (response, textStatus, jqXHR) {
        jQuery("#potableAnswer_" + itemNumber).removeClass("unanswered").addClass("hide");
        
        if(jQuery(".unanswered").length == 0){
            location.reload(true);
        }
    });

    requestPOST.fail(function (jqXHR, textStatus, errorThrown) {
        Grainger.Modals.killModal();
    });

};

function openFreightForward(){
	jQuery("#freightForwardClose").addClass("hide");
	jQuery("#freightForwardOpen").removeClass("hide");
	jQuery("#freightForwarderContent").removeClass("hide");
}

function closeFreightForward(){
	jQuery("#freightForwardClose").removeClass("hide");
	jQuery("#freightForwardOpen").addClass("hide");
	jQuery("#freightForwarderContent").addClass("hide");
	
}
