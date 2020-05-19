
jQuery(document).ready(function (){
	_this = this;
	
	shareMail.bindAll();
	
	 //Cache for error objects
    this._fieldErrorElements = {},
   
    
	//Messages
    this._messages = {
    		
        invalidNameMessage : $('#requiredFieldErrorMessage').val(),
        invalidEmailMessage : $('#invalidEmailErrorMessage').val(),
        requiredEmailMessage : $('#requiredFieldErrorMessage').val(),
        serverErrorMessage : "Server Error",
        noErrorMessage : ""
    };

    var emailFieldMsgs = {
            required : this._messages.requiredEmailMessage,
            emailhygiene : this._messages.invalidEmailMessage,
            noerror : this._messages.noErrorMessage
            
        };
    
	 this._validateConfig = {
	            submitHandler : _this._formHandler,
	            errorClass: "alert fs-11",
	            focusCleanup: true,
	            onkeyup: false,
	            rules : {	            	
	            	
	            	"recipients[0].email" : {emailhygiene: _this._formId},
	            	"recipients[1].email" : {emailhygiene: _this._formId},
	                "recipients[2].email" : {emailhygiene: _this._formId},
	                "recipients[3].email" : {emailhygiene: _this._formId},
	                "recipients[4].email" : {emailhygiene: _this._formId},
	                senderEmail : {emailhygiene: _this._formId}
	                
	            },
	            messages : {
	            	"recipients[0].firstName" : {
	            		required : this._messages.invalidNameMessage
	            	},
	            	"recipients[0].lastName" : {
	            		required : this._messages.invalidNameMessage
	            		},
	        		"recipients[1].firstName" : {
	            		required : this._messages.invalidNameMessage
	                	},
	            	"recipients[1].lastName" : {
	            		required : this._messages.invalidNameMessage
	            		},
	        		"recipients[2].firstName" : {
	            		required : this._messages.invalidNameMessage
	                	},
	            	"recipients[2].lastName" : {
	            		required : this._messages.invalidNameMessage
	            		},
	        		"recipients[3].firstName" : {
	    				required : this._messages.invalidNameMessage
	                	},
	            	"recipients[3].lastName" : {
	            		required : this._messages.invalidNameMessage
	            		},
	        		"recipients[4].firstName" : {
	            		required : this._messages.invalidNameMessage
	                	},
	            	"recipients[4].lastName" : {
	            		required : this._messages.invalidNameMessage
	                            		},
	            	 "recipients[0].email" : emailFieldMsgs,
	                 "recipients[1].email" : emailFieldMsgs,
	                 "recipients[2].email" : emailFieldMsgs,
	                 "recipients[3].email" : emailFieldMsgs,
	                 "recipients[4].email" : emailFieldMsgs,
	                 senderEmail : { required : this._messages.requiredEmailMessage,
	            	 				emailhygiene : this._messages.invalidEmailMessage	
	                 				},
	                senderFirstName : {
	                    required : this._messages.invalidNameMessage
	                },
	                senderLastName : {
	                    required : this._messages.invalidNameMessage
	                },
	                captchaEntered : {
	                    required : this._messages.captchaEmptyMessage
	                }
	                
	            }
	        };

	 
	$('input.required').focusout(function(e) {
  	  if($(this).val() === ''){
  		  _this._renderError(this.name, _this._validateConfig.messages[this.name].required);
  	  }else {
  		  $(this).next('label').hide();
  	  }
     });
	$('input.emailhygiene').focusout(function(e) {
		var emailField = this;
		  var email = $(this).val();
			  
		  if(jQuery.trim(email) === ""){
			  _this._renderError(this.name, _this._validateConfig.messages[this.name].required);
		  } else if(!email.match("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$")) {
			  _this._renderError(this.name, _this._validateConfig.messages[this.name].emailhygiene);
		  } else {
			  $(this).next('label').hide();
		  }
	     });
	
	  this._handleValidationErrors = function(data){
          $.each(data.errors,function(index, error){
              _this._renderError(error.field, _this._errorCodeMessageMap[error.code]);
          });
      };
  
     this._getErrorElement = function(fieldName){
          if(!this._fieldErrorElements[fieldName]){
              var el = $('.alert[for="'+fieldName+'"]');
              if(el.length === 0){                
                  var formEl = $('input[name="'+fieldName+'"]');
                  formEl.after('<label class="alert fs-11" for="'+fieldName+'"></label>');
                  el = $('.alert[for="'+fieldName+'"]');
              }
              this._fieldErrorElements[fieldName] = el;
          }
          return this._fieldErrorElements[fieldName];
      };
      
    this._renderError = function(fieldName, message){
    	
        this._getErrorElement(fieldName).text(message).show();
    };
    
});

var shareMail ={
		
		bindAll: function(){
			shareMail.openShareMailModal();
			shareMail.closeShareMailModal();
			shareMail.closeShareMailConfirmationModal();
			shareMail.viewMoreShareMailModal();
			shareMail.checkSubmitButton();
			shareMail.submitForm();
		},
		openShareMailModal: function(){
			
			$("#shareModalOpenButton").on("click", function() {
				$("#shareModalContainer").removeClass('hide');
				$('#shareModalContainer').addClass('modal modal-window commerce');
				
				if ($('#isIdpPage').val() == "true") {
					populateDataDomOnModalDisplayForEmailingIDP();
					
				} else {
					populateDataDomOnModalDisplayForEmailingSharedCart();
					
				}

				$('<div class="modal-backdrop"></div>').insertBefore('#shareModalContainer');
			});
		},
		
		closeShareMailModal: function(){
			
			$("#shareModalCloseButton, #shareModalCancelButton").on("click", function() {
				$("#shareModalContainer").addClass('hide');
				$('#shareModalContainer').removeClass('modal modal-window commerce');
				$(".modal-backdrop").remove();
				$("#shareForm").trigger("reset");
				$("label.fs-11").addClass('hide');
				for(var i=1;i<5;i++) {
					$('.recipient'+i).addClass('hide');
				}
				$('#addRecipientButton').removeClass('hide');
				
			});
		},
		
		closeShareMailConfirmationModal: function(){
					
					$("#shareModalConfirmationCloseButton").on("click", function() {
						$("#shareModalSuccess").addClass('hide');
						$('#shareModalSuccess').removeClass('modal modal-window commerce');
						$(".modal-backdrop").remove();
						$("#shareForm").trigger("reset");
						$("label.fs-11").addClass('hide');
						for(var i=1;i<5;i++) {
							$('.recipient'+i).addClass('hide');
						}
						$('#addRecipientButton').removeClass('hide');
						
					});
				},
		
		viewMoreShareMailModal: function() {
			
			$("#addRecipientButton").on("click", function() {
				for(var i=1;i<5;i++){
					if($('.recipient'+i).hasClass('hide')){
						$('.recipient'+i).removeClass('hide');
						$('#shareCartSubmitID').attr('disabled', 'disabled');
						shareMail.enableSubmitBtn();
						if(i==4) {
							$('#addRecipientButton').addClass('hide');
						}
						break;
					}
				}
			});
		},
		closeRecipent: function(recipientIndex) {
					$('.recipient'+recipientIndex).addClass('hide');
					if($('#addRecipientButton').hasClass('hide')) {
						$('#addRecipientButton').removeClass('hide');
					}
					$('input[name="recipients['+recipientIndex+'].email"]').val("");
					$('input[name="recipients['+recipientIndex+'].firstName"]').val("");
					$('input[name="recipients['+recipientIndex+'].lastName"]').val("");
					$('.alert[for="recipients['+recipientIndex+'].email"]').addClass('hide');
					$('.alert[for="recipients['+recipientIndex+'].firstName').addClass('hide');
					$('.alert[for="recipients['+recipientIndex+'].lastName"]').addClass('hide');
					shareMail.enableSubmitBtn();
			},
		checkSubmitButton: function() {
			$('#shareCartSubmitID').attr('disabled', 'disabled');
			$("form#shareForm :input").on("change", function() {
				shareMail.enableSubmitBtn();				
			});
		},
		
		enableSubmitBtn: function () {
			try{
				var enableSubmit= true;
				if($('#senderFirstName').val()=="" ||
					$('#senderLastName').val()=="" ||
					$('#captchaEntered').val()=="" ||
					$('#senderEmail').val()=="" || ($('#senderEmail').val()!="" && !$('#senderEmail').val().match("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"))) {
					enableSubmit=false;
				} else {
					for(var i=0;i<5;i++) {
						if(!$('.recipient'+i).hasClass('hide')) {
							var email=$('input[name="recipients['+i+'].email"]').val();
							if($('input[name="recipients['+i+'].firstName"]').val()=="" ||
									$('input[name="recipients['+i+'].lastName"]').val()=="" ||
									email=="" || (email!="" && !email.match("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"))) {
								enableSubmit=false;
							}
						}
					}
				}
				if(enableSubmit) {
					$('#shareCartSubmitID').attr('disabled', false);
				} else {
					$('#shareCartSubmitID').attr('disabled', 'disabled');
				}			
			} catch(err){
				console.log("Error in enabling Submit btn");
			}
	},
	submitForm: function() {
		$("form#shareForm").on('submit', function() {
			var recipientName=$('input[name="recipients[0].firstName"]').val()+" "+ $('input[name="recipients[0].lastName"]').val();
			$('#recipentNameConfirm').html(recipientName);
			
	        $.ajax({
	            url     : $(this).attr('action'),
	            type    : $(this).attr('method'),
	            dataType: 'json',
	            data    : $(this).serialize(),
	            success : function( data ) {
	            	
	            	 var jsonData = $.parseJSON(data || "");
	            	 if(jsonData.success === false){
                     	
                     	if(jsonData.captcha === "mismatch") {
                     		$("#captchaMismatchError").removeClass("hide").show();
                     		return;
                     		
                     	} else if(jsonData.captcha === "empty") {
                     		$("#captchaEmptyError").removeClass("hide").show();
                     		return;
                     	}
	            	 }
						$('#shareModalContainer').addClass("hide");
						$('#shareModalSuccess').removeClass("hide");

						if ($('#isIdpPage').val() == "true") {
							populateDataDomForEmailingIDP();
						} else {
							populateDataDomForEmailingSharedCart();
						}
					},
					error   : function( xhr, err ) {
	                         console.log("Error in sharing Product via email");
	                         $('#shareModalContainer').addClass("hide");
	                         shareMail.resetForm();
	            }
	        });    
	        return false;
	    });
	},
	
	resetForm: function(){
		$(".modal-backdrop").remove();
		$("#shareForm").trigger("reset");
		$("label.fs-11").addClass('hide');
		for(var i=1;i<5;i++) {
			$('.recipient'+i).addClass('hide');
		}
	}
}

function recaptchaCallback() {
	$("#captchaEmptyError").addClass("hide");	
}

