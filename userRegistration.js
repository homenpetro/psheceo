$(document).ready(
		function() {
			//bind oninput events
			$("#userRegistrationInfo input#zipCode, input#zipCodeDel").on(
					'input', function(e) {
						
						var zipCode = $(this).val();
						var calledBy = this.id == 'zipCodeDel' ? "deliveryAddr" : "";
						e.stopImmediatePropagation();
						//check for valid zip code
						if(isValidZipcodeAddress(zipCode)){
								
					        	var deferred = $.Deferred();
					        	postalReference.hideZipcodeErrors(calledBy);
					        	
					            $.ajax({
					                url: "/register/populateAddressForPostal?calledBy=" + calledBy,
					                type: 'POST',
					                data: $('#userRegistrationInfo').serialize(),
					                processData: false,
					                success: function(data) {

					                	if(isNotEmpty(data)) {
					                		// reset values before populate again, except first
					                		postalReference.resetDropdownValues(calledBy);
					                		
					            			$.each(data,function(key, pcrVal) 
					            					{
					            					    
					            					    if(key == 0){
					            					    	//populate state, city for first 
					            					    	postalReference.populateDefaultFields(pcrVal,calledBy);
					            					    }else {
					            					    	postalReference.populateFieldsForPostal(pcrVal,calledBy);
					            					    	
					            					    	
					            					    }
					            					    // append default last colony option
					            					    var colonyFieldId =  (calledBy == 'deliveryAddr') ? 'colonyDel' : 'colony';
					            					    if(key == (data.length -1)){
					            					    	postalReference.setOtherColonyOption(colonyFieldId,pcrVal);
					            					    }
					            					});
					        	    		
					                	} else {
					                		postalReference.showZipcodeErrors(calledBy);
					                	}

					                    deferred.resolve(data);
					                },
					                error: function(xht, textStatus, ex) {

					                    deferred.reject(xht);
					                }
					            });
					            
						  
						}else if(zipCode.length >= 5){
							//reset colony, city, state on invalid postal
							postalReference.resetFieldsForInvalidPostal(calledBy);
							postalReference.showZipcodeErrors(calledBy);
						}
						
					});
			
			//bind on change for colony dropdowns
			$("#userRegistrationInfo select#colony, select#colonyDel ").on('change', function() {
				var calledBy = this.id == 'colonyDel' ? "deliveryAddr" : "";
				var selected = $(this).find('option:selected');
				if(isEmpty(selected.val())){
					return;
				}
			    var city = selected.data('city');
			    var stateInfo = selected.data('stateInfo');
			    var stateVal = selected.data('stateVal');
			    //check delivery or billing address
				if(calledBy == 'deliveryAddr'){
					$("#cityDel").val(isNotEmpty(city) ? city : "");
			    	$("#stateInfoDel").val(isNotEmpty(stateInfo) ? stateInfo : "");
			    	$("#stateDel").val(isNotEmpty(stateVal) ? stateVal : "");
				}else {
					$("#city").val(isNotEmpty(city) ? city : "");
			    	$("#stateInfo").val(isNotEmpty(stateInfo) ? stateInfo : "");
			    	$("#state").val(isNotEmpty(stateVal) ? stateVal : "");
				}
			});
			
		});

var postalReference = {
	
		populateDefaultFields : function(pcrVal, calledBy) {
			// check delivery or billing address
			if (calledBy == 'deliveryAddr') {
				$('#colonyDel').append(
						$("<option></option>").attr("value", pcrVal.colony).attr(
								"selected", true).text(pcrVal.colony).data({ // Set
																				// multiple
																				// data
																				// attributes
							city : pcrVal.city,
							stateInfo : pcrVal.stateName,
							stateVal : pcrVal.isoCode
						}));
				$('#colonyDel').prop("disabled", false);
				$("#cityDel").val(pcrVal.city);
				$("#stateInfoDel").val(pcrVal.stateName);
				$("#stateDel").val(pcrVal.isoCode);
			} else {
				$('#colony').append(
						$("<option></option>").attr("value", pcrVal.colony).attr(
								"selected", true).text(pcrVal.colony).data({ // Set
																				// multiple
																				// data
																				// attributes
							city : pcrVal.city,
							stateInfo : pcrVal.stateName,
							stateVal : pcrVal.isoCode
						}));
				$('#colony').prop("disabled", false);
				$("#city").val(pcrVal.city);
				$("#stateInfo").val(pcrVal.stateName);
				$("#state").val(pcrVal.isoCode);
			}
	
		},
	
		populateFieldsForPostal : function(pcrVal, calledBy) {
	
			if (calledBy == 'deliveryAddr') {
	
				$('#colonyDel').append(
						$("<option></option>").attr("value", pcrVal.colony).text(
								pcrVal.colony).data({ // Set multiple data
							// attributes
							city : pcrVal.city,
							stateInfo : pcrVal.stateName,
							stateVal : pcrVal.isoCode
						}));
	
			} else {
				$('#colony').append(
						$("<option></option>").attr("value", pcrVal.colony).text(
								pcrVal.colony).data({ // Set multiple data
							// attributes
							city : pcrVal.city,
							stateInfo : pcrVal.stateName,
							stateVal : pcrVal.isoCode
						}));
			}
	
		},
	
		showZipcodeErrors : function(calledBy) {
			if (calledBy == 'deliveryAddr') {
				jQuery("#zipCodeDelError").html(
						$("#pcrInvalidPostalCodeAddr").val()).show();
			} else {
				jQuery("#zipCodeError").html($("#pcrInvalidPostalCodeAddr").val())
						.show();
			}
		},
	
		hideZipcodeErrors : function(calledBy) {
			if (calledBy == 'deliveryAddr') {
				jQuery("#zipCodeDelError").html("");
			} else {
				jQuery("#zipCodeError").html("");
			}
		},
	
		resetFieldsForInvalidPostal : function(calledBy) {
			if (calledBy == 'deliveryAddr') {
				$('#colonyDel').prop("disabled", true);
				$('#colonyDel').prop('selectedIndex', 0);
				$("#cityDel").val("");
				$("#stateInfoDel").val("");
				$("#stateDel").val("");
			} else {
				$('#colony').prop("disabled", true);
				$('#colony').prop('selectedIndex', 0);
				$("#city").val("");
				$("#stateInfo").val("");
				$("#state").val("");
			}
	
		},
	
		resetDropdownValues : function(calledBy) {
			if (calledBy == 'deliveryAddr') {
				$("#colonyDel").find('option').not(':first').remove();
			} else {
				$("#colony").find('option').not(':first').remove();
			}
		},
		//set other colony option for User registration
		setOtherColonyOption : function(colonyFieldId,pcrVal){

			var colonyValue = $("#otherColonyValue").val();
			var colonyText = $("#otherColonyText").val();
			$('#'+colonyFieldId).append(
					$("<option></option>").attr("value",colonyValue).text(
							colonyText).data({ 
						city : pcrVal.city,
						stateInfo : pcrVal.stateName,
						stateVal : pcrVal.isoCode
					}));

		}
	
};

var isStep2ValidationOn = false;
var isCreateAcctValidationOn = false;
var isStep3ValidationOn = false;

var userRegistration = {
	stepTwoSelections : { "DontKnowAccountNumber" : 0, "ProvideAccount" : 1, "CreateAccount" : 2, "OfflineAccount" : 3 },
	stepTwoSelection : null,
	hasSelfRegistratoinSet : true,
	previousAccountNumberInput : null,
	accountPattern : new RegExp(/\b^[0]?\d{9}\b$/),
	
	disableZipCode : function() {
		var registerAccount = jQuery("#register-account");
		var zipCode = registerAccount.find("#accountZipCode");
		var accountNumber = registerAccount.find("#accountNumber").val();
		
		var xhrArgs = {
				type : "POST",
				url : "/accountCheck",
				dataType : "text",
				data : {"accountID" : accountNumber},
				success : function(data) {
				    var disabledField = data.match("true");
				    
					zipCode.prop("readonly", disabledField);

					if (disabledField) {
					    userRegistration.disableZipCodeField(zipCode);
                                            jQuery("#accountNumberKnownFooter > input").focus();
					} else {
						userRegistration.enableZipCodeField(zipCode);
					}
				}
		}
		
		if (userRegistration.previousAccountNumberInput != accountNumber) {
			if (userRegistration.accountPattern.test(accountNumber)) {
				deferred = jQuery.ajax(xhrArgs);
			} else {
				userRegistration.enableZipCodeField(zipCode);
			}
			
			userRegistration.previousAccountNumberInput = accountNumber;
		}
	},
	
	enableZipCodeField : function(zipCode) {
		zipCode.prop("readonly", false);
		zipCode.removeClass("disabled-text-field");
	},
	
	disableZipCodeField : function(zipCode) {
	    zipCode.addClass("disabled-text-field").val("");
	    userRegistration.clearErrorsForForm("register-account");
	},

	displayCustomInvoiceInfo : function() {
		var deliveryAddressBlock = jQuery("#deliveryAddressFormBlock");
		deliveryAddressBlock.hide();
		
		var createAccountSubmitFooter = jQuery("#createAccountSubmitFooter");
		createAccountSubmitFooter.show();
		
		var customInvoiceBlock = jQuery("#customInvoiceFormBlock");
		customInvoiceBlock.show();
		customInvoiceBlock[0].scrollIntoView();
		jQuery('#state').attr('disabled',false);
		
		//jQuery("input:radio[name=wantsCustomInvoice]").attr("disabled", true).addClass("disabled-text-field");
	},
	
	displayDeliveryAddress : function() {
		if(document.getElementById("wantsCustomInvoiceNo").checked == true){
			var customInvoiceBlock = jQuery("#customInvoiceFormBlock");
			customInvoiceBlock.hide();
		}

		var createAccountSubmitFooter = jQuery("#createAccountSubmitFooter");
		createAccountSubmitFooter.show();
		
		var deliveryAddressBlock = jQuery("#deliveryAddressFormBlock");
		deliveryAddressBlock.show();
		deliveryAddressBlock[0].scrollIntoView();
		jQuery('#state').attr('disabled',false);
		
		jQuery("#address1DelInline").show();
		jQuery("#address1DelInline").val("");
		jQuery("#addressLine2DelInline").show();
		jQuery("#addressLine2DelInline").val("");
		jQuery("#colonyDelInline").show();
		jQuery("#colonyDelInline").val("");
		jQuery("#cityDelInline").show();
		jQuery("#cityDelInline").val("");
		jQuery("#zipCodeDelInline").show();
		jQuery("#zipCodeDelInline").val("");

		jQuery("#countryDel").show();
		jQuery("#stateDel").show();
		
		//jQuery("input:radio[name=wantsDeliveryAddress]").attr("disabled", true).addClass("disabled-text-field");
	},
	
	taxAddressAsDeliveryAddress : function() {
		var deliveryAddressBlock = jQuery("#deliveryAddressFormBlock");
		deliveryAddressBlock.hide();

	},
	
	displayRegisterAccount : function() {
		$('#acctNoEditFields').hide();
		
		var registerAccount = jQuery("#register-account");
		
		if(document.getElementById("hasRegisteredAccountYes").checked == false){
			registerAccount.hide();
			userRegistration.clearErrorsForForm("register-account");
		} else {
			registerAccount.show();
			userRegistration.checkStepTwoHeight(registerAccount);
			registerAccount[0].scrollIntoView();
			//jQuery("input:radio[name=hasRegisteredAccount]").attr("disabled", true).addClass("disabled-text-field");
		}
	},
	
	displayCreateAccount : function() {
		var createAccount = jQuery("#create-account");
		
		jQuery("input:radio[name=hasRegisteredAccount]").attr("disabled", true).addClass("disabled-text-field");
		jQuery("#accountNumberHidden, #zipCodeHidden").val("");
		jQuery("#newAccountCancel").show();
		createAccount.show();
		createAccount[0].scrollIntoView();
		
		if(jQuery("#federalGov").hasClass('active')){
			jQuery("#userRegistrationType").val("FC");
		} else if (jQuery("#exportRegistration").val() == 'true'){
			jQuery("#userRegistrationType").val("EC");
		}
 		
		userRegistration.clearErrorsForForm("create-account");
		userRegistration.stepTwoSelection = userRegistration.stepTwoSelections.CreateAccount;
		jQuery("#create-account")[0].scrollIntoView();
		userRegistration.checkStepTwoHeight(createAccount);
		jQuery('#state').attr('disabled',false);
	},
	
	submitCreateAccount : function() {
		jQuery("#companyRFCExists").css('display','none');
		userRegistration.clearErrorsForForm("create-account");
		Grainger.Modals.waitModal();
		if(jQuery("#addressLine2Hidden").html() == jQuery("#addressLine2").val()){
			jQuery("#addressLine2").val("");
		}
		
		jQuery.ajax({
				type : "POST",
				url : "/register/validateTaxID",
				dataType : "text",
				data : jQuery("#userRegistrationInfo").serialize(),
				cache: false,
				success : function(data) {
					Grainger.Modals.killModal();
					var err=false;
					if(data!=""){
						var json = jQuery.parseJSON(data);
						err=jQuery(json).attr("errors");
					}
					if (data.indexOf("grp1") > 0) { 
	                    grpOneAddress.newUserRegistrationDialogOpen(data);
                	} else {
                		
						if (err) {
							var createAccount = jQuery("#create-account");

							userRegistration.removeStepTwoHeight();
							userRegistration.displayErrors(json);
							userRegistration.checkStepTwoHeight(createAccount);	
						}
						else if(data!="" && !err){
                			var createAccount = jQuery("#create-account");
							userRegistration.removeStepTwoHeight();
							jQuery("#companyRFCExists").show();
							userRegistration.checkStepTwoHeight(createAccount);	
                		}else {
							var step3 = jQuery("#userRegStepThree");
							userRegistration.disableInputFieldsForForm("create-account", true);
							jQuery("input:radio[name=selfRegistration]").attr("disabled", true);
							jQuery("input:radio[name=offlineSelfRegistration]").attr("disabled", true);
							jQuery("#createAccountFooter").hide();
							step3.show();
							step3[0].scrollIntoView();
							userRegistration.clearErrorsForForm("userRegStepThree");
						} 
                	}
				},
				complete: function(jqXHR, textStatus) {
					//check for existing values and show them
					userRegistration.checkFields();
					Grainger.Modals.killWaitModal();
				}
		});
	},
	
	checkAccountNumber : function() {
		var registerAccount = jQuery("#register-account");
		jQuery('#dontKnowAccNum').hide();
		userRegistration.removeStepTwoHeight();
		isStep2ValidationOn = false;
		Grainger.Modals.waitModal();
		userRegistration.clearErrorsForForm("register-account");
		userRegistration.disableProvideAccountFields(false);
		
		var xhrArgs = {
			type : "POST",
			url : "register/checkAccount",
			dataType : "text",
			data : jQuery("#userRegistrationInfo").serialize(),
			success : function(data) {
				Grainger.Modals.killModal();
				var err=false;
				var isBillAddr = false;
				if(data!=""){
					var json = jQuery.parseJSON(data);
					compName    = jQuery(json).attr("companyName");
					selCurrency = jQuery(json).attr("defaultCurrencyIsoCode");
					addrDet     = jQuery(json).attr("contactAddress");
					if (typeof addrDet !== typeof undefined && addrDet !== false && addrDet!= null) 
					{
						addrLine1   = addrDet.line1;
						addrLine2   = addrDet.line2;
						addrColony  = addrDet.colony;
						addrCity	= addrDet.town;
						zipcode     = addrDet.postalCode;
						country     = addrDet.country.name;
						state       = addrDet.region.isocode;
						isBillAddr = true;
					}

					
					err=jQuery(json).attr("errors");
				}
				if (data.indexOf("grp1") > 0) { 
                    grpOneAddress.newUserRegistrationDialogOpen(data);
            	} 
				else{
					if(data=="false"){
						 jQuery('.accountNumberErrors').addClass('hide');
						 jQuery('#dontKnowAccNum').hide();
						jQuery('.noSelfRegistration').show();
						jQuery('#userRegistrationInfo :input').each(function(){
							  jQuery(this).removeClass("errorField");
						  });
						jQuery('#state').attr('disabled',false);
					}
					else if (err) {
						jQuery(".accountNumberErrors").hide();
						jQuery('.noSelfRegistration').hide();
						jQuery('#dontKnowAccNum').hide();
						userRegistration.displayErrors(json);
						userRegistration.checkStepTwoHeight(registerAccount);	
						if(json.errors.selfRegistration != null) {
							var selfRegistrationBlock =  jQuery("#selfRegistrationBlock");
							

							userRegistration.disableProvideAccountFields(true);
							userRegistration.hasSelfRegistratoinSet = false;
							
							jQuery("#selfRegistrationFooter").show();
							
							if (selfRegistrationBlock.is(":hidden")) {
								jQuery("#selfRegistrationError").hide();
								jQuery("#accountNumberKnownFooter").hide();
								jQuery("#dontKnowAccountNumberLink").hide();
								selfRegistrationBlock.show();
								userRegistration.checkStepTwoHeight(registerAccount);							
							}
							
						}
					} else if (data=="") {
						var createAccount = jQuery("#register-account");
						userRegistration.removeStepTwoHeight();
						jQuery(".noSelfRegistration").hide();
						jQuery(".accountNumberErrors").show().removeClass('hide');
						userRegistration.checkStepTwoHeight("#register-account");
					} else {
						jQuery(".accountNumberErrors").hide();
						var accountNumber = jQuery("#accountNumber"); 
						var zipCode = jQuery("#accountZipCode");
						$('#acctNoEditFields').show();
						jQuery('#NonEditcompany').val(compName);
						jQuery('#NonEditcurrency').val(selCurrency);
						if(isBillAddr){
							if(addrLine1 != null || addrLine1 != undefined){
								jQuery('#nonEditaddress1Inline').val(addrLine1);
							}
							if(addrLine2 != null || addrLine2 != undefined){
								jQuery('#nonEditaddress2Inline').val(addrLine2);
							}
							if(addrColony != null || addrColony != undefined){
								jQuery('#nonEditcolony').val(addrColony);
							}
							if(addrCity != null || addrCity != undefined){
								jQuery('#nonEditcity').val(addrCity);
							}
							if( zipcode != null || zipcode != undefined){
								jQuery('#nonEditzipCode').val(zipcode);
							}
							if(state != null || state != undefined){
								jQuery('#stateInfo').val(state);
							}
						}
						userRegistration.disableProvideAccountFields(true);
						jQuery('#termsOfRegistrationErrorMsg').hide();
						jQuery("#accountNumberKnownFooter").hide();
						jQuery("#dontKnowAccountNumberLink").hide();
						jQuery("#selfRegistrationFooter").hide();
						
						var step3 = jQuery("#userRegStepThree");
						
						if(jQuery("#federalGov").hasClass('active')){
							jQuery("#userRegistrationType").val('FA');
						}
						userRegistration.stepTwoSelection = userRegistration.stepTwoSelections.ProvideAccount;
						userRegistration.clearErrorsForForm("register-account");
						jQuery("input:radio[name=selfRegistration]").attr("disabled", true).addClass("disabled-text-field");
						step3.show();
						step3[0].scrollIntoView();
						userRegistration.clearErrorsForForm("userRegStepThree");
						jQuery('#state').attr('disabled',false);
					}
					
				}
				
			},
			error : function(jqXHR, textStatus, errorThrown) {
				jQuery("#errors").html("");

				var errorItem = jQuery(
						"<li />",
						{
							text : "There was a problem handling your request, please try again"
						});
                var errorList = jQuery("#errors").append("<ul class = 'alert'/>");
				errorList.append(errorItem);
			},
			complete: function(jqXHR, textStatus) {
				userRegistration.clearErrorsForForm("userRegStepThree");
				jQuery("#accountNumberHidden").attr("readonly", true).addClass("disabled-text-field");
				jQuery("#zipCodeHidden").attr("readonly", true).addClass("disabled-text-field");
				
				Grainger.Modals.killModal();
			}
		}

		deferred = jQuery.ajax(xhrArgs);
	},
	
	
	submitStepOne : function() {
		jQuery('#termsOfRegistrationErrorMsg').hide();
		userRegistration.clearErrorsForForm("create-account");
		userRegistration.clearErrorsForForm("registeredUserQuestionBlock");
		
		var registerAccount = jQuery("#register-account");
		userRegistration.removeStepTwoHeight();
		Grainger.Modals.waitModal();
		userRegistration.clearErrorsForForm("register-account");
		//userRegistration.disableProvideAccountFields(false);
		var url ="/register/my-Account";
		var loginUrl="/register/my-Account/?emailAlreadyExists=true";
		var clearPassword = false; 
		
		var xhrArgs = {
			type : "POST",
			url : "register/submitStepOne",
			dataType : "text",
			data : jQuery("#userRegistrationInfo").serialize(),
			success : function(data) {
				Grainger.Modals.killModal();
				var err = false;
				var emailExist;
				var accountExist;
				var checkBox = jQuery('#termsOfRegistration:checked').length;
				var createAccountStep2 = jQuery("#create-account");		// userRegStepThree = #create-account (step 2)
				
				if(data != ""){
					var json = jQuery.parseJSON(data);
					var accountTyped = jQuery("#accountNumber").val();
					err = jQuery(json).attr("errors");
					emailExist = jQuery(json).attr("emailAlreadyExists");
					accountExist = jQuery(json).attr("accountAlreadyExists");
				}
				
				if (data.indexOf("grp1") > 0) { 
                    grpOneAddress.newUserRegistrationDialogOpen(data);
            	} else {
            		if (err || checkBox==0) {
						jQuery(".accountNumberErrors").hide();
						jQuery('.noSelfRegistration').hide();
						jQuery('#dontKnowAccNum').hide();
						
            			if (checkBox == 0) {
    						jQuery('#termsOfRegistrationErrorMsg').show();
    					}
            			if (err) {
            				userRegistration.displayErrors(json);
            			}

					} else if (emailExist != null && emailExist == true) {	// EMAIL EXIST
						jQuery('#emailAddressExistsErr').show();
						jQuery('#confirmPasswordInline').hide();
						jQuery('#newPasswordInline').attr('value','Confirm Password');

					} else if (accountTyped != null && accountExist != null && accountExist == false) {
						jQuery(".accountNumberErrors").show().removeClass('hide');
												
					} else if (accountExist != null && accountExist == true) {	
						var isSelfRegistration = jQuery(json).attr("accountIsSelfRegistration");
						if (isSelfRegistration != null && isSelfRegistration == true) {		// NO SELF-REGISTRATION ACCOUNT
							jQuery('.accountNumberErrors').addClass('hide');
							jQuery('#dontKnowAccNum').hide();
							jQuery('.noSelfRegistration').show();
						} else {
							jQuery("#userRegistrationInfo").attr("action", url);
							jQuery("#userRegistrationInfo").on('submit',function(){
								jQuery('#state').attr('disabled',false);
							});
							jQuery("#userRegistrationInfo").submit();
						}
					} else if (data=="") {
						alert("data == EMPTY");
					
					} else {										// ACCOUNT = FALSE || emailExist == false
                        
						jQuery(".accountNumberErrors").hide();
						if (emailExist != null && emailExist == false) {
							jQuery('#emailAddressExistsErr').hide();
						}
						userRegistration.stepTwoSelection = userRegistration.stepTwoSelections.ProvideAccount;
						userRegistration.clearErrorsForForm("register-account");		// ACCOUNT & RFC ID
						
						userRegistration.disableInputFieldsForForm("registeredUserQuestionBlock", true);
						userRegistration.clearErrorsForForm("registeredUserQuestionBlock");
						createAccountStep2.show();
						createAccountStep2[0].scrollIntoView();
						
						//jQuery("input:radio[name=selfRegistration]").attr("disabled", true).addClass("disabled-text-field");
						//jQuery('#state').attr('disabled',false);
					}
				}
			},
			
			error : function(jqXHR, textStatus, errorThrown) {
				if (jqXHR.status === 403 ) {
	 		    	window.location.href = "/exception";
	 		  }
				jQuery("#errors").html("");
				var errorItem = jQuery(
						"<li />",
						{
							text : "There was a problem handling your request, please try again"
						});
                var errorList = jQuery("#errors").append("<ul class = 'alert'/>");
				errorList.append(errorItem);
			},
			complete: function(jqXHR, textStatus) {
				userRegistration.checkFields();
				//jQuery("#accountNumberHidden").attr("readonly", true).addClass("disabled-text-field");
				Grainger.Modals.killModal();
			}
		}
		deferred = jQuery.ajax(xhrArgs);
	},
	
	submitStepTwo : function() {
		jQuery("#companyRFCExists").css('display','none');
		userRegistration.clearErrorsForForm("create-account");
		jQuery('#wantsDeliveryAddressError').hide();
		var url ="/register/my-Account";
		Grainger.Modals.waitModal();

			jQuery.ajax({
					type : "POST",
					url : "/register/validateTaxID",
					dataType : "text",
					data : jQuery("#userRegistrationInfo").serialize(),
					cache: false,
					success : function(data) {
						Grainger.Modals.killModal();
						var err=false;
						if(data!=""){
							var json = jQuery.parseJSON(data);
							err=jQuery(json).attr("errors");
						}
						if (data.indexOf("grp1") > 0) { 
		                    grpOneAddress.newUserRegistrationDialogOpen(data);
	                	} else {
							if (err) {
								var createAccount = jQuery("#create-account");
								userRegistration.removeStepTwoHeight();
								userRegistration.displayErrors(json);
							}
							
							else if(data!="" && !err){
	                			var createAccount = jQuery("#create-account");
								jQuery("#companyRFCExists").show();

	                		} else {
								userRegistration.disableInputFieldsForForm("create-account", true);
								jQuery("#userRegistrationInfo").attr("action", url);
								jQuery("#userRegistrationInfo").on('submit',function(){
									jQuery('#state').attr('disabled',false);
								});
								jQuery("#userRegistrationInfo").submit();
							} 
	                	}
					},
					complete: function(jqXHR, textStatus) {
						if (jqXHR.status === 403) {
							window.location.href = "/exception";
						}
						// check for existing values and show them
						//userRegistration.checkFields();
						Grainger.Modals.killWaitModal();
					}
			});	
	},
	
	submitRegistration : function() {
		var userRegStepThree=jQuery("#userRegStepThree");
		jQuery('#termsOfRegistrationErrorMsg').hide();
		isStep3ValidationOn = false;		
		Grainger.Modals.waitModal();
		userRegistration.clearErrorsForForm("create-account");
		userRegistration.clearErrorsForForm("userRegStepThree");
		userRegistration.disableInputFieldsForForm("create-account", true);
		userRegistration.disableProvideAccountFields(true);
		var url ="/register/my-Account";
		var loginUrl="/register/my-Account/?emailAlreadyExists=true";
		var clearPassword = false; 

		jQuery.ajax({
			type : "POST",
			url : "/register/validateB2BCustomer",
			dataType : "text",
			data : jQuery("#userRegistrationInfo").serialize(),
			cache: false,
			success : function(data) {
				Grainger.Modals.killModal();
				var err=false;
				var emailErr;
				var checkBox= jQuery('#termsOfRegistration:checked').length;
				if(data!=""){
					var json = jQuery.parseJSON(data);
					err=jQuery(json).attr("errors");		/* response */
					emailErr=jQuery(json).attr("emailAlreadyExists");
				}
				if (data.indexOf("grp1") > 0) { 
                    grpOneAddress.newUserRegistrationDialogOpen(data);
            	} 
				
				if(err || checkBox==0) {
					var createAccount = jQuery("#userRegStepThree");
					userRegistration.removeStepTwoHeight();
					if(checkBox==0){
						jQuery('#termsOfRegistrationErrorMsg').show();
					}
					if(err){
						userRegistration.displayErrors(json);
					}
					userRegistration.checkStepTwoHeight(userRegStepThree);
				}
				else if(emailErr==true){
					var createAccount = jQuery("#userRegStepThree");
					userRegistration.removeStepTwoHeight();
					jQuery('#emailAddressExistsErr').show();
					jQuery('#confirmPasswordInline').hide();
					jQuery('#newPasswordInline').attr('value','Confirm Password');
					userRegistration.checkStepTwoHeight(userRegStepThree);
				}
				else if(emailErr==false){
					jQuery("#userRegistrationInfo").attr("action", loginUrl);
					jQuery("#userRegistrationInfo").on('submit',function(){
						jQuery('#state').attr('disabled',false);
					});
					jQuery("#userRegistrationInfo").submit();
				}
				else{
					jQuery("#userRegistrationInfo").attr("action", url);
					jQuery("#userRegistrationInfo").on('submit',function(){
						jQuery('#state').attr('disabled',false);
					});
					jQuery("#userRegistrationInfo").submit();
				}
				
				// there used to be a big ajax call below, check developmentNewFeature first merge on this file
				// banking on the submit to resolve not needing the call
			}
		});
			
	},		

	submitGuestRegistration : function() {
		Grainger.Modals.waitModal();
		userRegistration.clearErrorsForForm("UserRegistrationInfo");
		var clearPassword = false; 
		var guestRegistrationForm = jQuery("#UserRegistrationInfo");

		jQuery.ajax({
			type : "POST",
			url : "/registration/registerGuestUser",
			data : guestRegistrationForm.serialize(),
			success : function(data) {

				var json = jQuery.parseJSON(data);
				if (json.errors) {
					clearPassword = true;
					guestRegistrationForm[0].scrollIntoView();
					userRegistration.displayErrors(json);
					Grainger.Modals.killModal();
				} else if(json.SUCCESS) {
					clearPassword = true;

				    page_variables = jQuery.extend(page_variables, jQuery.parseJSON(json.UserDetails));
				    page_variables.CurrentURL = "/Guest_Registration_Complete";
                    page_variables.UserDetails.UserRegistrationType = "Guest_Registration";
                    page_variables.UserPk = jQuery.parseJSON(json.UserPk);
				    jQuery(window).trigger("grainger.guest.registration", ["ModelLoaded"]);

					var form = jQuery("#UserRegistrationInfo");

					jQuery(":input", form).val("")
					jQuery("#registerNowContainer").hide();
					jQuery("#UserRegistrationInfo").hide();
					jQuery("#thankYouContainer").show();
					jQuery("body")[0].scrollIntoView();
					userRegistration.populateHeaderForGuestRegistrationSuccess();
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				jQuery("#errors").html("");
				Grainger.Modals.killModal();
				clearPassword = true;

                jQuery("#errors").append("There was a problem handling your request, please try again");
			},
			complete : function() {
				Grainger.Modals.killModal();

				if (clearPassword) {
					jQuery("#newPassword").val("");
					jQuery("#confirmPassword").val("");
					jQuery("#submitRegistrationErrors").html("");

				}
			}
		});
	},

	populateHeaderForGuestRegistrationSuccess : function() {
		var xhrArgs = {
			type: "GET",
			url: "/content/fullSiteHeader",
			success: function(data) {
				//refactoring this to replace just the authnav part of the header.
				var headerId = jQuery("#topRibbon"),
					newRibbonContent = jQuery(data).find("#topRibbon");

            	headerId.html(newRibbonContent);
			}
		};
		
		deferred = jQuery.ajax(xhrArgs);
	},
	
	userExistsDialogOpen : function(data){
	      userRegistration.validationDialogOpen(data);
	},

	focusAndDisplayError : function(elementId, message){
		jQuery("#" + elementId).focus();
		var submitRegistrationErrors = jQuery("#submitRegistrationErrors");
		submitRegistrationErrors.html("<ul class='alert'><li id='"+elementId+".errors'>"+message+"</li></ul>");
		submitRegistrationErrors[0].scrollIntoView();
	},
	
	clearContents : function(id) {
		var formElement = jQuery("#" + id);
				
		if(formElement.val() == jQuery("#" + id + "Hidden").html()){
			formElement.removeClass("grey");
			formElement.val("");
		}
	},
	
	changeField : function(id) {
		jQuery("#" + id + "Inline").hide();
		jQuery("#" + id).show();
		jQuery("#" + id).focus();
	},

	checkFields : function() {
		var i = 0,
			els = jQuery("[id$=Inline]"),
			count = els.length,
			thisEl, thisElSiblingVal;

		for (i; i < count; i++) {
			thisEl = jQuery(els[i]);
			thisElSiblingVal = thisEl.next('input').val();

			if (thisElSiblingVal !== "") {
				thisEl.hide();
				thisEl.next('input').show();
			}
		}
	},

	validDialogId : "validationDialog",
	dialog : null,

	validationDialogOpen : function(data) {
		"use strict";

		Grainger.Modals.waitModal(userRegistration.validDialogId, userRegistration.validDialogId);

		// duplicate registration modal returns whole page
		// lets filter down the response
		if(jQuery(data).find('#userExistsWarning').doesExist()) {
			data = '<div id="userExistsWarning">' + jQuery(data).find('#userExistsWarning').html() + '</div>';
		}

		Grainger.Modals.createAndShowModal(userRegistration.validDialogId, userRegistration.validDialogId, data);
	},

	closeDialog : function() {
		"use strict";
		Grainger.Modals.killModal();
	},

	  gotoLogin : function(){
	      window.location = "/myaccount/signin";
	  },

	  gotoLoginWithUserId : function(){
	      window.location = "/myaccount/signin?existingUserId="+jQuery("#userID").val();
	  },
	  
	  selectCustomerType : function(id) {
			if (typeof id != undefined) {
				jQuery("#regAccountType").addClass("disabled");
				jQuery("#" + id).addClass("active");

				jQuery("#arrows ." + id).toggleClass("active");
						
				jQuery("#customize-line-item").removeClass("active");
				jQuery("#customize-order-level-settings").removeClass("active");
				
				var shippingDecision = jQuery("#shipping-decision");
				shippingDecision.show();
				shippingDecision[0].scrollIntoView();
				
				if(id.indexOf('federalGov') >= 0){
					userRegistration.federalSetup();
				}
				
				jQuery("#federalGov").unbind().click(function(event){
					     event.preventDefault();
					     return;
					});
					
				jQuery("#companyOrg, #stateLocalGov").prop("onclick", null);
			}
	  },

	  registerOrRedirect : function(id, answer) {
			if (typeof id != undefined) {
				jQuery("#hasRegisteredAccount").hide();
				jQuery("#redirect-to-bv").hide();
				//console.log(id);
				
				if (id == "registeredUserQuestionBlock") {
					jQuery("input:radio[name=shippingOption]").attr("disabled", true);
					
					var registeredUserQuestionBlock = jQuery("#" + id);
					var registerAccount = jQuery("#register-account");
					
					registeredUserQuestionBlock.show();
					registeredUserQuestionBlock[0].scrollIntoView();
					userRegistration.checkStepTwoHeight(registerAccount);
					
					if(!answer){
						jQuery("#exportRegistration").val(true);
						jQuery("#accountZipCode").addClass("hide");
						jQuery("#accountZipCodeLabel").addClass("hide");
						jQuery(".zipCodeText").addClass("hide");
						jQuery(".questionMark").removeClass("hide");
					}
					
				} else {
					userRegistration.dropBvMigrationCookie();
					window.location.href = "https://www.grainger.com/Grainger/wwg/registrationSelfSelectRender.shtml";
				}
				
			}
	  },
	  
	  cancelCreateAccount : function() {
		  
		userRegistration.clearErrorsForForm("create-account");
		userRegistration.clearCreateAccountInput();
		jQuery("#create-account").hide();
		jQuery("#newAccountCancel").hide();
		jQuery("input:radio[name=hasRegisteredAccount]").attr("checked", false);
		jQuery("input:radio[name=hasRegisteredAccount]").attr("disabled", false);
		userRegistration.removeStepTwoHeight();
	  },
	  
	  cancelCreateOfflineAccount : function() {
		  userRegistration.removeStepTwoHeight();
		 
		  var registerAccount = jQuery("#register-account");
		 
		  jQuery("#create-account").hide();
		  jQuery("#offlineAccountCancel").hide();
		  userRegistration.clearErrorsForForm("create-account");
		  userRegistration.clearCreateAccountInput();
		  jQuery("#offlineSelfRegistrationBlock").hide();
		  userRegistration.disableInputFieldsForForm("register-account", false);
		  jQuery("#register-account").show();
		  jQuery("#accountNumberKnownFooter").show();
		  jQuery("#dontKnowAccountNumberLink").show();
		  jQuery("input:radio[name=selfRegistration]").attr("disabled", false);
		  userRegistration.checkStepTwoHeight(registerAccount);
	  },
	  
	  cancelProvideAccount : function() {
		  isStep2ValidationOn = false;
		  userRegistration.clearErrorsForForm("register-account");
		  jQuery("#register-account").hide();
		  jQuery("input:radio[name=hasRegisteredAccount]").attr("checked", false);
		  jQuery("input:radio[name=hasRegisteredAccount]").attr("disabled", false);
		  userRegistration.clearProvideAccountInput();
		  jQuery("#accountZipCode").removeClass("disabled-text-field").val("");
		  userRegistration.removeStepTwoHeight();
		  jQuery('.error').hide();
	  },
	  
	  cancelSubmitRegistration : function() {
		  isStep3ValidationOn = false;
		  jQuery("#submitRegistrationErrors").html("");
		  jQuery("#userRegStepThree").hide();
		  jQuery('#emailAddressExistsErr').hide();
		  jQuery('#acctNoEditFields').hide();
		  userRegistration.clearUserRegistrationInput();
		  userRegistration.clearErrorsForForm("userRegStepThree");
		  jQuery("#fromGroupOne").val(false);
		  jQuery("#validated").val(false);
		  jQuery("#accountNumberHidden").attr("readonly", true);
		  jQuery("#zipCodeHidden").attr("readonly", true);
		  jQuery("#lastName").parent().removeClass("errors");
		  
		  switch (userRegistration.stepTwoSelection) {
		  case userRegistration.stepTwoSelections.ProvideAccount:
			  var registerAccount = jQuery("#register-account");
			  
			  registerAccount[0].scrollIntoView();
			  
			  if (userRegistration.hasSelfRegistratoinSet) {
				  userRegistration.disableInputFieldsForForm("register-account", false);
				  jQuery("#accountNumberKnownFooter").show();
				  jQuery("#dontKnowAccountNumberLink").show();
				  jQuery("#selfRegistrationBlock").hide();
				  jQuery("input:radio[name=selfRegistration]").attr("checked", false).attr("disabled", false);  
			  } else {
				  jQuery("#selfRegistrationFooter").show();
				  jQuery("input:radio[name=selfRegistration]").attr("disabled", false);
			  }
 			  
			  break;
		  case userRegistration.stepTwoSelections.CreateAccount:
			  var createAccount  = jQuery("#create-account");
			  
			  createAccount[0].scrollIntoView();
			  userRegistration.disableInputFieldsForForm("create-account", false);
			  jQuery("#createAccountFooter").show();
			  jQuery("#newAccountCancel").show();
			  jQuery("#dontKnowAccountCancel").hide();
			  
			  break;
		  case userRegistration.stepTwoSelections.DontKnowAccountNumber:
			  var createAccount  = jQuery("#create-account");
			  
			  createAccount[0].scrollIntoView();
			  userRegistration.disableInputFieldsForForm("create-account", false);
			  jQuery("#createAccountFooter").show();
			  jQuery("#newAccountCancel").hide();
			  jQuery("#dontKnowAccountCancel").show();

			  break;
		  case userRegistration.stepTwoSelections.OfflineAccount:
			  var createAccount  = jQuery("#create-account");
			  
			  createAccount[0].scrollIntoView();
			  userRegistration.disableInputFieldsForForm("create-account", false);
			  jQuery("#createAccountFooter").show();
			  jQuery("#newAccountCancel").hide();
			  jQuery("#dontKnowAccountCancel").hide();
			  jQuery("#offlineAccountCancel").show();
			  jQuery("input:radio[name=selfRegistration]").attr("checked", false).attr("disabled", false);
			  jQuery("input:radio[name=offlineSelfRegistration]").attr("disabled", false);
			  
			  break;
		  }
		  
		  userRegistration.disableInputFieldsForForm("acctInfoHidden", true);
		  jQuery('#state').attr("disabled",false);
	  },
	  
	  cancelSelfRegistration : function() {
			var registerAccount = jQuery("#register-account");	  	
	  	  userRegistration.removeStepTwoHeight();
		  jQuery("#accountNumberKnownFooter").show();
		  jQuery("#dontKnowAccountNumberLink").show();
		  userRegistration.disableProvideAccountFields(false);
		  jQuery("#selfRegistrationBlock").hide();
		  userRegistration.checkStepTwoHeight(registerAccount);
		  jQuery("input:radio[name=selfRegistration]").attr("disabled", false).attr("checked", false);
		  userRegistration.hasSelfRegistratoinSet = true;	
	  },
	  
	  cancelRegistrationForm : function() {
		  window.location.reload(false); 
	  },
	  
	  checkStepTwoHeight : function(id) {
		var stepTwoHeight = id.height();
		
		jQuery("#stepTwo span").height(stepTwoHeight);	  	
	  },
	  
	  removeStepTwoHeight : function() {
	  	jQuery("#stepTwo span").removeAttr("style");
	  },
	  
	  clearErrorsForForm : function(formId) {
		  var form = jQuery("#" + formId);
		  
		  jQuery.each(jQuery("[id$=Error]", form), 
				  function()  { 
			  		jQuery(this).html("").hide(); 
		  });
		  
		  jQuery.each(jQuery(".errorField", form), 
					function()  { 
					jQuery(this).removeClass("errorField");
					jQuery(this).parent().removeClass("errors"); 
		  });
	  }, 
		
	  displayErrors : function(data) {
		  
	  		jQuery('#UserRegistrationInfo .errorMsg').addClass('hide');

	        var checkPasswordErrorDoNotExists = true;
			jQuery.each(data, function(id, value) {
			  	jQuery("#" + id).addClass("errorField");			  	
				
				var field = jQuery("#" + id + "Error");
				field.html(value).show().removeClass('hide');
				var inlineField = jQuery("#" + id + "Inline");
				
				if (inlineField != null) {
					inlineField.addClass("errorField");
				}
			});
			
	  },
	  
	  displayUserExistsModal : function() {
		  var xhrArgs = {
				  	dataType : "html",
				  	url : "/content/user_registration?userExists",
					success : function(data) {
						userRegistration.userExistsDialogOpen(jQuery(data).find('#userExistsWarning').html());
					},
					error : function(jqXHR, textStatus, errorThrown) {
						jQuery("#errors").html("");

						var errorItem = jQuery(
								"<li />",
								{
									text : "There was a problem handling your request, please try again"
								});

                        var errorList = jQuery("#errors").append("<ul class = 'alert'/>");
						errorList.append(errorItem);
					}
				};

				deferred = jQuery.ajax(xhrArgs);
	  },
	  
	  displayUserInfoExistsModal : function() {
		  var xhrArgs = {
				  	dataType : "html",
				  	url : "/content/user_registration?userInfoExists",
					success : function(data) {
						userRegistration.userExistsDialogOpen(data);
					}, 
					error : function(jqXHR, textStatus, errorThrown) {
						jQuery("#errors").html("");

						var errorItem = jQuery(
								"<li />",
								{
									text : "There was a problem handling your request, please try again"
								});

                        var errorList = jQuery("#errors").append("<ul class = 'alert'/>");
						errorList.append(errorItem);
					}
				};

				deferred = jQuery.ajax(xhrArgs);
	  },
	  
	  dontKnowAccNum: function(){
		  jQuery('#userRegistrationInfo :input').each(function(){
			  jQuery(this).removeClass("errorField");
		  });
		  jQuery('.errorMsg').addClass('hide');
		  jQuery('#dontKnowAccNum').show();
	  },
	  
	  
	  showAdditionalInput : function() {
		  	isStep2ValidationOn = false;
			userRegistration.removeStepTwoHeight();
			var dontKnowAccNumber = jQuery("#create-account");
			
			jQuery("#acctInfoHidden").show();
			dontKnowAccNumber.show();
			userRegistration.checkStepTwoHeight(dontKnowAccNumber);
			dontKnowAccNumber[0].scrollIntoView();
			
			userRegistration.disableProvideAccountFields(true);
			jQuery("#dontKnowAccountNumberLink").hide();;
			
			var userRegistrationType = jQuery("#userRegistrationType");
			var noAccountFooter = jQuery("#accountNumberKnownFooter");
			
			jQuery("#newAccountCancel").hide();
			jQuery("#dontKnowAccountCancel").show();

			if(jQuery("#federalGov").hasClass('active')){
				userRegistrationType.val('FB');
			} else if (jQuery("#exportRegistration").val() == 'true'){
				jQuery("#userRegistrationType").val("EB");
			} else {
				userRegistrationType.val('B');
			}
			
			noAccountFooter.hide();
			userRegistration.clearProvideAccountInput();
			userRegistration.stepTwoSelection  = userRegistration.stepTwoSelections.DontKnowAccountNumber;
			jQuery("#register-account").hide();
			userRegistration.disableInputFieldsForForm("acctInfoHidden", true);
			jQuery("#acctInfoHidden")[0].scrollIntoView();
			jQuery("#accountNumber, #accountNumberHidden").val("");
			jQuery("#accountZipCode, #zipCodeHidden").val("");
	  },
	  
	  showCreateAccountAddress : function() {
			var dontKnowAccNumber = jQuery("#create-account");
			userRegistration.stepTwoSelection = userRegistration.stepTwoSelections.OfflineAccount;
			
			jQuery("#acctInfoHidden").show();
			dontKnowAccNumber.show();
			dontKnowAccNumber[0].scrollIntoView();
			
			if(jQuery("#federalGov").hasClass('active')){
				jQuery("#userRegistrationType").val('FA');
			} else {
				jQuery("#userRegistrationType").val('A');
			}
			
			jQuery("#accountNumberKnownFooter").hide();
			jQuery("#newAccountCancel").hide();
			jQuery("#dontKnowAccountCancel").hide();
			jQuery("#offlineAccountCancel").show();
			
			jQuery("#register-account").hide();
			
			var accountNumber = jQuery("#accountNumber").val();
			var accountZipCode = jQuery("#accountZipCode").val();
			
			jQuery("#accountNumberHidden").val(accountNumber);
			jQuery("#zipCodeHidden").val(accountZipCode);
			jQuery("#acctInfoHidden")[0].scrollIntoView();
			userRegistration.disableInputFieldsForForm("acctInfoHidden", false);
			jQuery("#offlineSelfRegistrationBlock").show();
			userRegistration.checkStepTwoHeight(dontKnowAccNumber);
	  },
	  
	  cancelDontKnowAccount : function() {
 			var registerAccount = jQuery("#register-account");
 			isCreateAcctValidationOn = false;
			userRegistration.clearErrorsForForm("create-account");
			jQuery("#create-account").hide();
			jQuery("#dontKnowAccountCancel").hide();
			userRegistration.removeStepTwoHeight();
			
			userRegistration.disableProvideAccountFields(false);
			
			var accountNumberLabel = jQuery("#dontKnowAccountNumberLabel");
			accountNumberLabel.hide();
			var enableLink = jQuery("#dontKnowAccountNumberLink");
			enableLink.show();
			jQuery("#register-account").show();
			jQuery("#acctInfoHidden").hide();
			
			var userRegistrationType = jQuery("#userRegistrationType");
			userRegistrationType.val('C');
			var newAccountCancel = jQuery("#newAccountCancel");
			newAccountCancel.show();
			var dontKnowAccountCancel = jQuery("#dontKnowAccountCancel");
			dontKnowAccountCancel.hide();
			var noAccountFooter = jQuery("#accountNumberKnownFooter");
			noAccountFooter.show();
			userRegistration.clearCreateAccountInput();
			jQuery("#register-account")[0].scrollIntoView()
			
			
			jQuery("#register-account").show();
			jQuery("#registerAccountHeight").css("height", "200px");
			
			jQuery("#zipCode").parent().removeClass("errors");
			userRegistration.checkStepTwoHeight(registerAccount);
	  },
	  
	  validateStep3Fields :function(){
		  
		  userRegistration.validateFirstName();
		  userRegistration.validateLastName();
		  userRegistration.validatePhone();
		  userRegistration.validateEmail();
		  userRegistration.validateUserID();
		  userRegistration.validateNewPassword();
		  userRegistration.validateConfirmPassword();
		  userRegistration.validateSecQuestion();
		  userRegistration.validateSecAnswer();
		  
	  },
	  
	  validateFirstName : function() {
		  var firstNameField = jQuery("#firstName");
		  var firstName = firstNameField.val();
		  var lastNameField = jQuery("#lastName");
		  
		  if(jQuery.trim(firstName) === ""){			  
			  lastNameField.parent().addClass("errors");
			  firstNameField.addClass("errorField");
			  jQuery("#firstNameError").html("First name is required.").show();
		  } else {
			  firstNameField.removeClass("errorField");
			  lastNameField.parent().removeClass("errors");	
			  jQuery("#firstNameError").html("");
			  
		  }		 
	  },
	  
	  validateLastName : function() {
		  var lastNameField = jQuery("#lastName");
		  var lastName = lastNameField.val();
		  
		  if(jQuery.trim(lastName) === ""){
			  lastNameField.parent().addClass("errors");	
			  lastNameField.addClass("errorField");
			  jQuery("#lastNameError").html("Last name is required.").show();
		  } else {
			  lastNameField.parent().removeClass("errors");	
			  lastNameField.removeClass("errorField");
			  jQuery("#lastNameError").html("");
		  }
		  
	  },
	  
	  validatePhone : function() {
		  var phoneField = jQuery("#phonenumber");
		  var phone = phoneField.val();
		  
		  if(jQuery.trim(phone) === ""){
			  phoneField.parent().addClass("errors");	
			  phoneField.addClass("errorField");
			  jQuery("#phonenumberError").html("Phone number is required.").show();
		  } else if (!phone.match("^\\(?([2-9][0-8][0-9])\\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})$")){
			  phoneField.parent().addClass("errors");	
			  phoneField.addClass("errorField");
			  jQuery("#phonenumberError").html("Phone number is not valid.").show();
		  } else {
			  phoneField.parent().removeClass("errors");	
			  phoneField.removeClass("errorField");
			  jQuery("#phonenumberError").html("");
		  }
		  
	  },
	  
	  validateEmail : function() {
		  var emailField = jQuery("#emailAddress");
		  var email = emailField.val();
			  
		  if(jQuery.trim(email) === ""){
			  emailField.parent().addClass("errors");	
			  emailField.addClass("errorField");
			  jQuery("#emailAddressError").html("Email address cannot be blank.").show();
		  } else if(!email.match("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$")) {
			  emailField.parent().addClass("errors");	
			  emailField.addClass("errorField");
			  jQuery("#emailAddressError").html("Email address format is not valid.").show();
		  } else {
			  emailField.parent().removeClass("errors");	
			  emailField.removeClass("errorField");
			  jQuery("#emailAddressError").html("");
		  }
		  
	  },
	  
	  validateUserID : function() {
		  var userIDField = jQuery("#userID");
		  var userID = userIDField.val();
		  var userIDLength = userID.length;
		  
		  if(jQuery.trim(userID) === ""){
			  userIDField.parent().addClass("errors");	
			  userIDField.addClass("errorField");
			  jQuery("#userIDError").removeClass('hide').html("User ID cannot be blank.").show();
		  } else if (userIDLength < 4 || userIDLength > 50) {
			  userIDField.parent().addClass("errors");	
			  userIDField.addClass("errorField");
			  jQuery("#userIDError").removeClass('hide').html("User ID must be between 4 - 50 characters.").show();
		  } else if (hasWhiteSpace(userID)) {
			  jQuery("#userIDError").removeClass('hide').html("User ID cannot contains spaces.").show();
		  }
		  else {
			  userIDField.parent().removeClass("errors");	
			  userIDField.removeClass("errorField");
			  jQuery("#userIDError").removeClass('hide').html("");
		  }
		  
	  },
	  
	  validateNewPassword : function() {
		  var newPasswordField = jQuery("#newPassword");
		  var confirmPasswordField = jQuery("#confirmPassword");
		  var newPassword = newPasswordField.val();
		  
		  if(jQuery.trim(newPassword) === ""){
			  newPasswordField.parent().addClass("errors");	
			  newPasswordField.addClass("errorField");
			  jQuery("#newPasswordError").html("The new password is missing.").show();
		  } else if(!newPassword.match("^.*(?=.*\\d)(?=.*[a-zA-Z]).*$")){
			  newPasswordField.parent().addClass("errors");	
			  newPasswordField.addClass("errorField");
			  jQuery("#newPasswordError").html("The password must contain at least 1 number and 1 letter.").show();
		  } else if(newPassword.length < 6 || newPassword.length > 20){
			  newPasswordField.parent().addClass("errors");	
			  newPasswordField.addClass("errorField");
			  jQuery("#newPasswordError").html("The password should be between 6 - 20 chars.").show();
		  } else if(newPassword.match(".*[!£$% \\^&*@?<>+_().~`,;:{}+=/'].*")) {
			  newPasswordField.parent().addClass("errors");	
			  newPasswordField.addClass("errorField");
			  jQuery("#newPasswordError").html("The password contains invalid special chars.").show();
		  } else if(newPassword.match(".*(?=\\s).*")) {
			  newPasswordField.parent().addClass("errors");	
			  newPasswordField.addClass("errorField");
			  jQuery("#newPasswordError").html("The password contains space.").show();
		  } else if(jQuery.trim(jQuery("#userID").val()) != "" && newPassword.indexOf(jQuery("#userID").val()) != -1) {
			  newPasswordField.parent().addClass("errors");	
			  newPasswordField.addClass("errorField");
			  jQuery("#newPasswordError").html("Password should not contain UserID.").show();
		  } else if(newPassword.toLowerCase().match(".*(?=(grainger|gra1nger)).*")) {
			  newPasswordField.parent().addClass("errors");	
			  newPasswordField.addClass("errorField");
			  jQuery("#newPasswordError").html("Password should not contain grainger or gra1nger.").show();
		  } else {
			  newPasswordField.parent().removeClass("errors");	
			  newPasswordField.removeClass("errorField");
			  jQuery("#newPasswordError").html("");
			  confirmPasswordField.parent().removeClass("errors");	
			  confirmPasswordField.removeClass("errorField");
			  jQuery("#confirmPasswordError").html("");
		  }
		  
	  },
	  
	  validateConfirmPassword : function() {
		  var confirmPasswordField = jQuery("#confirmPassword");
		  var confirmPassword = confirmPasswordField.val();
		  
		  if(jQuery.trim(confirmPassword) === ""){
			  confirmPasswordField.parent().addClass("errors");	
			  confirmPasswordField.addClass("errorField");
			  jQuery("#confirmPasswordError").html("The confirm password is missing.").show();
		  } else if(confirmPassword != jQuery("#newPassword").val()){
			  confirmPasswordField.parent().addClass("errors");	
			  confirmPasswordField.addClass("errorField");
			  jQuery("#confirmPasswordError").html("The New Password and Confirmation Password you have entered do not match.").show();
		  } else {
			  confirmPasswordField.parent().removeClass("errors");	
			  confirmPasswordField.removeClass("errorField");
			  jQuery("#confirmPasswordError").html("");
		  }
		  
	  },
	  
	  validateSecQuestion : function() {
		  var securityQuestionField = jQuery("#securityQuestion");
		  var securityQuestion = securityQuestionField.val();
		  
		  if(jQuery.trim(securityQuestion) === ""){
			  securityQuestionField.parent().addClass("errors");	
			  securityQuestionField.addClass("errorField");
			  jQuery("#securityQuestionError").html("Security question is required.").show();
		  } else {
			  securityQuestionField.parent().removeClass("errors");	
			  securityQuestionField.removeClass("errorField");
			  jQuery("#securityQuestionError").html("");
		  }
		  
	  },
	  
	  validateSecAnswer : function() {
		  var securityAnswerField = jQuery("#securityAnswer");
		  var securityAnswer = securityAnswerField.val();
		  
		  if(jQuery.trim(securityAnswer) === ""){
			  securityAnswerField.parent().addClass("errors");	
			  securityAnswerField.addClass("errorField");
			  jQuery("#securityAnswerError").html("Security answer is required.").show();
		  } else {
			  securityAnswerField.parent().removeClass("errors");	
			  securityAnswerField.removeClass("errorField");
			  jQuery("#securityAnswerError").html("");
		  }
		  
	  },
	  
	  validateCompanyName : function() {
		  var companyNameField = jQuery("#company");
		  var companyName = companyNameField.val();
		  
		  if(jQuery.trim(companyName) === ""){
			  companyNameField.parent().addClass("errors");	
			  companyNameField.addClass("errorField");
			  jQuery("#companyError").html("Company name cannot be blank.").removeClass("hide");
		  } else {
			  companyNameField.parent().removeClass("errors");	
			  companyNameField.removeClass("errorField");
			  jQuery("#companyError").html("").addClass("hide");
		  }
		  
	  },
	  
	  validateAddressOne : function() {
		  var addressLine1Field = jQuery("#address1");
		  var addressLine1 = addressLine1Field.val();
		  
		  if(jQuery.trim(addressLine1) === ""){
			  addressLine1Field.parent().addClass("errors");	
			  addressLine1Field.addClass("errorField");
			  jQuery("#address1Error").html("Address is required.").show();
		  } else {
			  addressLine1Field.parent().removeClass("errors");	
			  addressLine1Field.removeClass("errorField");
			  jQuery("#address1Error").html("");
		  }
		  
	  },
	  
	  validateCity : function() {
		  var cityField = jQuery("#city");
		  var city = cityField.val();
		  var accountZipCodeField = jQuery("#zipCode");
		  
		  if(jQuery.trim(city) === ""){
			  accountZipCodeField.parent().addClass("errors");	
			  cityField.addClass("errorField");
			  jQuery("#cityError").html("City is required.").show();
		  } else {
			  accountZipCodeField.parent().removeClass("errors");	
			  cityField.removeClass("errorField");
			  jQuery("#cityError").html("");
		  }
		  
	  },
	  
	  validateAccountNumber : function() {
		  var acctNumField = jQuery("#accountNumber");
		  var acctNum = acctNumField.val();
		  if(jQuery.trim(acctNum) === ""){
			  acctNumField.parent().addClass("errors");	
			  acctNumField.addClass("errorField");
			  jQuery("#accountNumberError").html("Account number is required.").show();
		  } else {
			  acctNumField.parent().removeClass("errors");	
			  acctNumField.removeClass("errorField");
			  jQuery("#accountNumberError").html("");
		  }
		  
	  },
	  
	  validateState : function() {
		  var stateField = jQuery("#state");
		  var state = stateField.val();
		  var accountZipCodeField = jQuery("#zipCode");
		  
		  if(jQuery.trim(state) === "NONE"){
			  accountZipCodeField.parent().addClass("errors");	
			  stateField.addClass("errorField");
			  jQuery("#stateError").html("State required to be 2 character abbreviation.").show();
		  } else {
			  accountZipCodeField.parent().removeClass("errors");	
			  stateField.removeClass("errorField");
			  jQuery("#stateError").html("");
		  }
		  
	  },
	  
	  validateZipCode : function() {
		  
		  var accountZipCodeField = jQuery("#zipCode");
		  var accountZipCode = accountZipCodeField.val();
		  
		  if(jQuery.trim(accountZipCode) === ""){
			  accountZipCodeField.parent().addClass("errors");	
			  accountZipCodeField.addClass("errorField");
			  jQuery("#zipCodeError").html("Zip code is required.").show();
		  } else if(!accountZipCode.match("^[\\d]{5}([-\\s][\\d]{4})?$")) {
			  accountZipCodeField.parent().addClass("errors");	
			  accountZipCodeField.addClass("errorField");
			  jQuery("#zipCodeError").html("Zip code required to be digits in ***** or *****-**** format.").show();
		  } else {
			  accountZipCodeField.parent().removeClass("errors");	
			  accountZipCodeField.removeClass("errorField");
			  jQuery("#zipCodeError").html("");
		  }
		  
	  },
	  
	  validateTypeAZipCode : function() {
		  
		  var accountZipCodeField = jQuery("#accountZipCode");
		  var accountZipCode = accountZipCodeField.val();
		  
		  if(jQuery.trim(accountZipCode) === ""){
			  accountZipCodeField.parent().addClass("errors");	
			  accountZipCodeField.addClass("errorField");
			  jQuery("#accountZipCodeError").html("Zip code is required.").show();
		  } else if(!accountZipCode.match("^[\\d]{5}([-\\s][\\d]{4})?$")) {
			  accountZipCodeField.parent().addClass("errors");	
			  accountZipCodeField.addClass("errorField");
			  jQuery("#accountZipCodeError").html("Zip code required to be digits in ***** or *****-**** format.").show();
		  } else {
			  accountZipCodeField.parent().removeClass("errors");	
			  accountZipCodeField.removeClass("errorField");
			  jQuery("#accountZipCodeError").html("");
		  }
		  
	  },
	  
	  displayAdminApprovalRequired : function() {
		  jQuery("#accountId").val(jQuery("#accountNumber").val());
		  jQuery("#user").val(jQuery("#userID").val());
		  jQuery("#adminApprovalForm").submit();
	},
	
	displayOfflineUserConfirmation : function(isfromCheckout) {
		window.location = "/content/user_registration?offlineConfirmed&checkout=" + isfromCheckout;
	},
	
	disableProvideAccountFields : function(value) {
        if (value) {
              jQuery("#accountNumber, #accountZipCode").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#accountRFC").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#NonEditcompany").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#nonEditaddress1Inline").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#nonEditaddress2Inline").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#nonEditcolony").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#nonEditcity").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#nonEditzipCode").attr("readonly", value).addClass("disabled-text-field left grey");
              jQuery("#NonEditcurrency").prop('disabled', true);
              jQuery("#stateInfo").prop('disabled', 'disabled');
                          
       }  else {
            jQuery("#accountNumber, #accountZipCode").attr("readonly", value).removeClass("disabled-text-field");
        }

	},
	
	disableInputFieldsForForm : function(formId, disable) {
		var selectedForm = jQuery("#" + formId);
		jQuery.each(jQuery(":input", selectedForm), function() {
			jQuery(this).attr("readonly", disable);
			jQuery(this).blur();
			if (disable) {
				if(this.id=="phonenumber"){
					jQuery(this).attr("readonly", false);
					jQuery(this).css("background-color","#cccccc");
				}
				jQuery(this).css('pointer-events','none');
			    jQuery(this).addClass("disabled-text-field");
			} else {
				jQuery(this).css('pointer-events','auto');
			    jQuery(this).removeClass("disabled-text-field");
			}
		});
		jQuery('#state').attr("disabled",disable);
	},
	
	clearCreateAccountInput : function() {
		jQuery("#company").val("");
		jQuery("#companyRFC").val("");
		
		var addressLine1 = jQuery("#address1");
		
		addressLine1.val("").hide();
		jQuery("#address1Inline").show();
		jQuery("#addressLine2").val("");
		jQuery("#city").val("");
		jQuery("#state").val("");
		jQuery("#zipCode").val("");
		jQuery("#colony").val("").hide();
		jQuery("#colonyInline").show();
		jQuery('#state').attr('disabled',false);
		
		var addressDelLine1 = jQuery("#addressDel1");
		addressDelLine1.val("").hide();
	},
	
	clearProvideAccountInput : function() {
		jQuery("#accountRFC, #accountNumber").prop("readonly", false).val("");
	},
	
	clearUserRegistrationInput : function() {
		jQuery("#firstNameInline").show();
		jQuery("#firstName").val("").hide();
		jQuery("#lastNameInline").show();
		jQuery("#lastName").val("").hide();
		jQuery("#phonenumber").val("");
		jQuery("#phoneExt").val("");
		jQuery("#mobileNumber").val("");
		jQuery("#faxNumber").val("");
		jQuery("#ccEmail").val("");
		jQuery("#userID").val("").hide();
		jQuery("#userIDInline").show();
		jQuery("#newPasswordInline").show();
		jQuery("#newPassword").val("").hide();
		jQuery("#confirmPasswordInline").show();
		jQuery("#confirmPassword").val("").hide();
		jQuery("#receiveEmail").attr("checked", false);
		jQuery("#receivePromos").attr("checked", false);
		jQuery("#termsOfRegistration").attr("checked", false);
		jQuery("#emailAddress").val("");
		jQuery('#state').attr('disabled',false);
	},
	
	resetMigrationCookieAndRedirect : function(url) {
		
		if (typeof url != 'undefined') {
			/* TODO only for reverse dual site; once Broadvision sunsets, remove this! */
			/* post SOR, drop the cookie for urls which should go to the old version */
			if (url.indexOf("/wwg") != -1 || url.indexOf(".shtml") != -1) {
				userRegistration.dropBvMigrationCookie();
			}
   			window.location = url;
		}
	},
	
	dropBvMigrationCookie : function() {
		document.cookie = "GR_MIGRATION_FLAG=10;domain=.grainger.com;max-age=2592000;path=/";
	},
	
	step3Init : function(){
		userRegistration.registerOrRedirect('registeredUserQuestionBlock', true);					
		userRegistration.selectCustomerType('companyOrg');
		jQuery("input:radio[id=shippingOptionYes]").attr("checked", true);
		userRegistration.disableProvideAccountFields(true);	
	},
	
	step3PageRegTypeA : function(){
		
		jQuery("input:radio[id=hasRegisteredAccountYes]").attr("checked", true);
		userRegistration.displayRegisterAccount();					
		jQuery("#accountNumberKnownFooter").hide();
		jQuery("#dontKnowAccountNumberLink").hide();
		jQuery("#selfRegistrationFooter").hide();
		userRegistration.disableInputFieldsForForm("create-account", false);
		
	},
	step3PageRegTypeAOffline : function(){
		userRegistration.showCreateAccountAddress();
		userRegistration.disableInputFieldsForForm("create-account", true);
		jQuery("#offlineSelfRegistration1").prop('disabled', true);
		jQuery("#offlineSelfRegistration2").prop('disabled', true);		
		jQuery("#createAccountFooter").hide();
	},
	step3PageRegTypeB : function(){
		jQuery("input:radio[id=hasRegisteredAccountYes]").attr("checked", true);
		userRegistration.displayRegisterAccount();	
		jQuery("#accountNumberKnownFooter").hide();
		jQuery("#dontKnowAccountNumberLink").hide();
		jQuery("#selfRegistrationFooter").hide();
		userRegistration.showAdditionalInput();
		userRegistration.disableInputFieldsForForm("create-account", true);
		jQuery("#createAccountFooter").hide();
	},
	step3PageRegTypeC : function(){		
		jQuery("input:radio[id=hasRegisteredAccountNo]").attr("checked", true);
		userRegistration.displayCreateAccount();
		userRegistration.disableInputFieldsForForm("create-account", true);
		jQuery("#createAccountFooter").hide();
	},
	step3Show : function(){
		var step3 = jQuery("#userRegStepThree");			
		userRegistration.stepTwoSelection = userRegistration.stepTwoSelections.ProvideAccount;
		jQuery("input:radio[name=selfRegistration]").attr("disabled", true).addClass("disabled-text-field");
		step3.show();
		step3[0].scrollIntoView();
	},	
	
	departmentChange: function() {
		var agencySelect = jQuery("#agencySelect");
		agencySelect.empty();
		
		var department = jQuery("#departmentSelect").find(":selected");
		
		if(department.val() === '') {
			agencySelect.prop('disabled', true);
			return false;
		}
		
		agencySelect.prop('disabled', false);
		jQuery("#company").val(department[0].value.substring(0,40));
		agencySelect.html( jQuery("." + department.attr('class'), gov_agencySelectList).filter("option").clone() );
		agencySelect.prepend("<option value=''>Select One</option>").val("");
		
	},
	
	agencyChange : function(){
		var selectBox = jQuery("#agencySelect");
		
		if(selectBox.val().indexOf("Other") == 0){
			jQuery("#company2").val("");
			jQuery("#govOther").removeClass("hide");
		} else {
			jQuery("#govOther").addClass("hide");
			jQuery("#company2").val(selectBox.val().substring(0,40));
		}
	}, 
	
	federalSetup : function (){
		jQuery("#receivePromos").addClass("hide");
		jQuery("#receivePromosLabel").addClass("hide");
		jQuery("#companyOrg").removeClass("active");
		jQuery("#companyLine1").addClass("hide");
		jQuery("#govDepartment").removeClass("hide");
		jQuery("#govAgency").removeClass("hide");
		jQuery("#federalGov").addClass("active");
		jQuery("#companyHeaderLabel").addClass("hide");
		jQuery("#federalHeaderLabel").removeClass("hide");
		jQuery("#companyLabel1").addClass("hide");
		jQuery("#companyLabel2").addClass("hide");
		jQuery("#federalLabel2").removeClass("hide");
		jQuery("#federalLabel1").removeClass("hide");
		jQuery("#registerAccountHeader").addClass("hide");
		jQuery("#registerAccountHeaderFederal").removeClass("hide");
		
	}
	
};
