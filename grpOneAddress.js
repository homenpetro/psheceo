var grpOneAddress = {
	fromPages : {
	    EMPLREG : "employeeRegistration",
	    USERREG : "userRegistration",
	    USERMNG : "userManagement",
	    MYACCOUNT : "myaccount",
		ADDUSER : "addNewUser",
		NEWUSER : "newUserRegistration"
	},
	
    addressValidDialogId : "addressValidationDialog",
	dialog : null,
	
	grpOneDialogOpen : function(data) {
		"use strict";
		
		grpOneAddress.closeDialog();

    	Grainger.Modals.createAndShowModal(grpOneAddress.addressValidDialogId, grpOneAddress.addressValidDialogId, data);
	},
	
	employeeRegistrationDialogOpen : function(data){
	      var tempDiv = jQuery("<div>"+data+"</div>");
	      var results = jQuery("#suggestedAddressContent", tempDiv);
	      
	      grpOneAddress.grpOneDialogOpen(results);
	},
	
	newUserRegistrationDialogOpen : function(data){
		 var tempDiv = jQuery("<div>"+data+"</div>");
		 var results = jQuery("#suggestedAddressContent", tempDiv);
	      
	      grpOneAddress.grpOneDialogOpen(results);
	},
	
	closeDialog : function() {
		"use strict";
			 Grainger.Modals.killModal();
	},
	
	userRegistrationDialogOpen : function(data){
		var tempDiv = jQuery("<div>"+data+"</div>");
		var results = jQuery("#suggestedAddressContent", tempDiv);
        grpOneAddress.grpOneDialogOpen(results);
	 },

	userManagementDialogOpen : function(data){
		  var tempDiv = jQuery("<div>"+data+"</div>");
		  var results = jQuery("#suggestedAddressContent", tempDiv);
          grpOneAddress.grpOneDialogOpen(results);
	 },
	 
	 /* send user selected address from list for persistence */
	chooseFromSuggestedAddresses : function(radioGroupName, originalPk)  {

	    var checkedRadio = jQuery('[name=' + radioGroupName + ']:checked');
	    
	    if (checkedRadio && checkedRadio.length == 1) {
	        var idx = checkedRadio.val();
	        var formId = "selectSuggestedAddress_";
	        if (idx >= 0) {
	            formId += idx;
	        } else {
	            formId = "selectEnteredAddress";
	        }

	        var formNode = jQuery("#"+formId)[0];
	        var fromPage = jQuery("#fromPage").val();
	        
	        //Note: when other pages have saves there will need to be a switch statement here based on the fromPage value in the form to send it to the correct place
	        switch(fromPage){
	        case grpOneAddress.fromPages.EMPLREG:
	        	var employeeRegistrationInfo = jQuery("#employeeRegistrationInfo")[0];
	        	var employeeRegistrationAddress1 = employeeRegistrationInfo.address1;
	        	var employeeRegistrationCity = employeeRegistrationInfo.city;
	        	var employeeRegistrationState = employeeRegistrationInfo.state;
	        	var employeeRegistrationZipCode = employeeRegistrationInfo.zipCode;
	        	
	        	employeeRegistrationAddress1.value = formNode.address1.value;
	        	employeeRegistrationCity.value = formNode.city.value;			   
	        	employeeRegistrationState.value = formNode.state.value;
	        	employeeRegistrationZipCode.value = formNode.zipCode.value;
	        	employeeRegistrationInfo.validated.value = true;
	        	employeeRegistrationInfo.fromGroup1.value = true;
	        	
	        	employeeRegistration.submit();
	        	break;
              case grpOneAddress.fromPages.USERREG:
            	  	var userRegInfo = jQuery("#userRegStep2Info")[0];
            	  	if(typeof userRegInfo === 'undefined') {
            	  		userRegInfo = jQuery("#InvitedUserRegistrationInfo")[0];
            	  	}
                    var userRegAddress1 = userRegInfo.address1;
                    var userRegCity = userRegInfo.city;
                    var userRegState = userRegInfo.state;
                    var userRegZipCode = userRegInfo.zipCode;
                    userRegAddress1.value = formNode.address1.value;
                    userRegCity.value = formNode.city.value; 
                    userRegState.value = formNode.state.value;
                    userRegZipCode.value = formNode.zipCode.value;
                    userRegInfo.validated.value = true;
                    userRegInfo.fromGroup1.value = true;
                    
                    invitedUserRegistration.submit();
                    break;
              case grpOneAddress.fromPages.USERMNG:
          	  		var userManagementInfo = jQuery("#ManageUserInfo")[0];
                    var userManagementAddress1 = userManagementInfo.address1;
                    var userManagementCity = userManagementInfo.city;
                    var userManagementState = userManagementInfo.state;
                    var userManagementZipCode = userManagementInfo.zipCode;
                    userManagementAddress1.value = formNode.address1.value;
                    userManagementCity.value = formNode.city.value; 
                    userManagementState.value = formNode.state.value;
                    userManagementZipCode.value = formNode.zipCode.value;
                    userManagementInfo.validated.value = true;
                    userManagementInfo.fromGroup1.value = true;
                    userManagement.savePersonalInfo(true);
                    break;
			case grpOneAddress.fromPages.ADDUSER:
				var newUserInfo = jQuery("#AddUserInfo")[0];
				var newUserAddress1 = newUserInfo.address1;
				var newUserCity = newUserInfo.city;
                var newUserState = newUserInfo.state;
                var newUserZipCode = newUserInfo.zipCode;
                newUserAddress1.value = formNode.address1.value;
                newUserCity.value = formNode.city.value; 
                newUserState.value = formNode.state.value;
                newUserZipCode.value = formNode.zipCode.value;
                newUserInfo.validated.value = true;
                newUserInfo.fromGroup1.value = true;
				/* set the method argument to true to allow duplicates, if we got to */
				/* group1 then user chose to proceed adding duplicate */
                addUser.addNewUser(true);
				break;
			case grpOneAddress.fromPages.NEWUSER:
				var newUserInfo = jQuery("#userRegistrationInfo")[0];
				var newUserAddress1 = newUserInfo.address1;
				var newUserCity = newUserInfo.city;
                var newUserState = newUserInfo.state;
                var newUserZipCode = newUserInfo.zipCode;
                newUserAddress1.value = formNode.address1.value;
                newUserCity.value = formNode.city.value; 
                newUserState.value = formNode.state.value;
                newUserZipCode.value = formNode.zipCode.value;
                newUserInfo.validated.value = true;
                newUserInfo.fromGroup1.value = true;
                userRegistration.submitCreateAccount();
				break;
			case grpOneAddress.fromPages.MYACCOUNT:
				var contactInfo = jQuery("#shipAddress" + originalPk)[0];
				var newUserAddress1 = contactInfo.address1;
				var newUserCity = contactInfo.city;
                var newUserState = contactInfo.state;
                var newUserZipCode = contactInfo.zipCode;
                newUserAddress1.value = formNode.address1.value;
                newUserCity.value = formNode.city.value; 
                newUserState.value = formNode.state.value;
                newUserZipCode.value = formNode.zipCode.value;
                contactInfo.validated.value = true;
                contactInfo.fromGroup1.value = true;
				
				saveAddressForm('shipAddress', originalPk, null);
				break;
	        default:
		        saveAddressForm(formId, originalPk, null);
	        	break;
	        }
	    }
	},


	/* Use Invalid Address as entered with invalid address modal */
	chooseEnteredAddresses : function(formId, originalPk) {
        //Note: when other pages have saves there will need to be a switch statement here based on the fromPage value in the form to send it to the correct place
        var fromPage = jQuery("#fromPage").val();

        switch(fromPage) {
	        case grpOneAddress.fromPages.NEWUSER :
				var newUserInfo = jQuery("#userRegistrationInfo");
				jQuery("#validated").val(true);
				jQuery("#fromGroupOne").val(true);
				userRegistration.submitCreateAccount();
				break;

	        case grpOneAddress.fromPages.EMPLREG :
	        	jQuery("#validated").val(true);
				jQuery("#fromGroupOne").val(true);
	        	employeeRegistration.submit();
	        	break;

            case grpOneAddress.fromPages.USERREG :
            	var userRegInfo = jQuery("#InvitedUserRegistrationInfo");

                jQuery("#validated").val(true);
				jQuery("#fromGroup1").val(true);
            	invitedUserRegistration.submit();
            	break;

            case grpOneAddress.fromPages.USERMNG :
            	var userManagementInfo = jQuery("#ManageUserInfo");
            	jQuery("#validated").val(true);
				jQuery("#fromGroupOne").val(true);
            	userManagement.savePersonalInfo(true);
            	break;

			case grpOneAddress.fromPages.ADDUSER :
				var newUserInfo = jQuery("#AddUserInfo");
				jQuery("#validated").val(true);
				jQuery("#fromGroupOne").val(true);
				addUser.addNewUser(true);
				break;

	        default :
		        saveAddressForm(formId, originalPk, null);
	        	break;
	    }
	}
}
