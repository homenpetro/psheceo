(function($,Grainger,document){
    "use strict";

    if(typeof Grainger.share !== 'object'){
        Grainger.share = {};
    }
    
    //var MessageHelper = Grainger.helper.MessageHelper;
    
    /**
     * This is an abstract share modal object that includes code common
     * to each implementation.
     *
     * @param Object config - options map
     * @param Object analytics - analytics JSON used for modal_variables
     * @param String currentUrl - The URL with which to use for modal_variables     
     */
    function AbstractShareModal(config,analytics,currentUrl) {
    
        var _this = this;
    
        //Messages
        this._messages = {
            invalidNameMessage : MessageHelper.getMessage('share.form.msg.name.invalid'),
            invalidEmailMessage : MessageHelper.getMessage('share.form.msg.email.invalid'),
            serverErrorMessage : MessageHelper.getMessage('share.form.msg.error'),
            captchaMisMatchMessage : MessageHelper.getMessage('invalid.captcha.message'),
            captchaEmptyMessage : MessageHelper.getMessage('share.captcha.empty')
        };
        
        $.extend(this._messages,config);
    
        this._pending = 1,
        this._recipients = {},
        
        //This is a fake URL used for the modal_variables.CurrentUrl when
        //the modal is opened
        this._currentUrl = currentUrl,
            
        //validator instance returned by $(form).validate()
        this._validator = null,
        this._analyticsFired = false,
    
        //Cache for error objects
        this._fieldErrorElements = {},
            
        //Server validation error codes
        this._errorCodeMessageMap = {
            "NotBlank.ShareData.firstName" : this._messages.invalidNameMessage,
            "NotBlank.ShareData.lastName" : this._messages.invalidNameMessage,
            "NotBlank.ShareData.email" : this._messages.invalidEmailMessage,
            "Invalid.ShareData.email" : this._messages.invalidEmailMessage,
            "NotBlank.ShareData.captchaEntered" : this._messages.captchaEmptyMessage
        },
    
        this._formModal = null,
        this._successModal = null,
        this._formModalContainer = document.getElementById('shareModalContainer'),
        this._successModalContainer = document.getElementById('successModalContainer'),
        this._form = $("#shareForm"),
        this._addRecipientButton = null,
        this._recipientContainers = null,
        this._removeRecipientButtons = null;
    
        this._getRecipientContainer = function(index) {
            return this._recipients[index].container;
        };
        
        this._isRecipientPending = function(index){
            return this._recipients[index].pending;
        };
    
        this._setRecipientPending = function(index,status){
            this._recipients[index].pending = status;
        };
    
        this._getRemoveRecipientButton = function(index) {
            if(!this._removeRecipientButtons[index]) {
                var el = this._getRecipientContainer(index).find('.removeRecipientButton').first();
                this._removeRecipientButtons[index] = el;
            }
            return this._removeRecipientButtons[index];
        };
    
        this._getAddRecipientButton = function() {
            if(!this._addRecipientButton){
                this._addRecipientButton = $('#addRecipientButton');
            }
            return this._addRecipientButton;
        };
    
        this._getFormModal = function() {
            return $(this._formModalContainer);
        };
    
        this._getSuccessModal = function() {
            if(!this._successModal) {
                $(this._successModalContainer).removeClass('hide');
            }
            return this._successModal;
        };
    
        this._closeSuccessModal = function(){
            $(this._successModalContainer).addClass('hide');
        };

        
        this._getFieldIndex = function(name){
            var index = parseInt(name.charAt(name.length - 1),10);
            return index;
        };
        
        this._getFormPostData = function() {
            return _this._form.serialize();
        };
        
        //Form handler to process form submission
        this._formHandler = function() {
            $.ajax({
                url : _this._form.attr('action'),
                data : _this._getFormPostData(),
                type : 'post',
                dataType : 'json',
                complete : function(jqXHR){
                    try {
                    var data = $.parseJSON(jqXHR.responseJSON || "");
                    } catch(err) {
                        alert(_this._messages.serverErrorMessage);
                        return;
                    }
                    switch(jqXHR.status){
                        case 200: 
                            if(data.success === false){
                            	
                            	if(data.captcha === "mismatch") {
                            		$("#captchaText").attr("src", "/captcha-image.html?tmp="+new Date());
                            		$("#captchaMismatchError").removeClass("hide").show();
                            		return;
                            		
                            	} else if(data.captcha === "empty") {
                            		$("#captchaText").attr("src", "/captcha-image.html?tmp="+new Date());
                            		$("#captchaEmptyError").removeClass("hide").show();
                            		return;
                            	}
                            	
                                //The product could not be shared.
                                alert(_this._messages.serverErrorMessage);
                                this._reset();
                            } else {
                                _this._handleSuccess(data);
                                _this._reset();
                            }
                            break;                    
                        case 400:
                            _this._handleValidationErrors(data);
                            break;
                        default: //All other codes, issue an error
                            alert(_this._messages.serverErrorMessage);
                            break;
                    }
                }
            });
            return false;
        };
    
        this._reset = function(){
            $(this._form).trigger('reset');

            $('#shareForm .row-container.recipient').each(function(index, element){
                this._recipients[index].pending = index === 0 ? true : false;
            });

            for(var i = 1; i < 5; i++){
                this._getRecipientContainer(i).addClass('hide');
            }
            
            this._getAddRecipientButton().removeClass('hide');
            
            this._pending = 1;
        };
    
        this._closeFormModal = function() {
            this._getFormModal().addClass('hide');
        };
    
        this._getAvailableIndex = function() {
            //Iterates through recipients and returns first one 
            //with pending status of false. This allows
            //addRecipient to revert the first non-pending
            //recipient container to visible when recipients
            //are removed out of order.
            for(var index in this._recipients){
                if(this._recipients[index].pending === false){
                    return index;
                }
            }
        };
    
        this._addRecipient = function() {
            this._pending++;
            if(this._pending === 5){
                this._getAddRecipientButton().addClass('hide');
            }
            var index = this._getAvailableIndex();
            this._setRecipientPending(index,true);
            this._getRecipientContainer(index).removeClass('hide');
        };
    
        this._removeRecipient = function(index){
            this._getRecipientContainer(index).addClass('hide');
            this._setRecipientPending(index,false);
            this._pending--;
            
            if(this._pending === 4){
                this._getAddRecipientButton().removeClass('hide');
            }
        };
    
        this._handleValidationErrors = function(data){
            $.each(data.errors,function(index, error){
                this._renderError(error.field, this._errorCodeMessageMap[error.code]);
            });
        };
    
        this._getErrorElement = function(fieldName){
            if(!this._fieldErrorElements[fieldName]){
                var el = $('.error[for="'+fieldName+'"]');
                if(el.length === 0){                
                    var formEl = $('input[name="'+fieldName+'"]');
                    formEl.after('<label class="error" for="'+fieldName+'"></label>');
                    el = $('.error[for="'+fieldName+'"]');
                }
                this._fieldErrorElements[fieldName] = el;
            }
            return this._fieldErrorElements[fieldName];
        };
    
        this._renderError = function(fieldName, message){
            this._getErrorElement(fieldName).text(message);
        };
        
        this._handleSuccess = function(data){
            throw new Error('_handleSuccess method must be implemented by child modal class.');
        };
    
        this._openSuccessModal = function(){
            $(this._successModalContainer).removeClass('hide');
        };
    
        this._openFormModal = function(){    
            this._getFormModal().removeClass('hide');
            $.scrollIntoView($('#shareModalContainer'));
            if(this._analyticsFired === false) {
                modal_variables = analytics;
                modal_variables.CurrentURL = this._currentUrl;

                try {
                   $.trigger("grainger.modal.open", ["ModelLoaded"]);
                }catch(err){
                   console.log("Error publishing the event for Bright Tag");
                }
                this._analyticsFired = true;
            }
        };
    
        //Iterate through recipient row containers so we can track
        //which ones are pending.
        $('#shareForm .recipient').each(function(index, element){
            _this._recipients[index] = {
                container : $(element),
                pending : index === 0 ? true : false
            };
        });
        
        //This is an abstract property that must be defined by extending child.
        if(typeof _this._formId !== 'string') {
            throw new Error('Extending modal object must define a _formId.');
        }
        this._validateConfig = {
            submitHandler : this._formHandler,
            errorClass: "alert",
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
                "recipients[0].email" : {
                    emailhygiene : this._messages.invalidEmailMessage
                },
                "recipients[1].email" : {
                    emailhygiene : this._messages.invalidEmailMessage
                },
                "recipients[2].email" : {
                    emailhygiene : this._messages.invalidEmailMessage
                },
                "recipients[3].email" : {
                    emailhygiene : this._messages.invalidEmailMessage
                },
                "recipients[4].email" : {
                    emailhygiene : this._messages.invalidEmailMessage
                },
                senderEmail : {
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

        this._validator = this._form.validate(this._validateConfig);

        this.__testHandleValidationErrors = function(){
        
            var data = {
                errors : [
                    {field : "senderEmail", code : "NotBlank.ShareData.email"},
                    {field : "recipients[0].firstName", code : "NotBlank.ShareData.firstName"},
                    {field : "recipients[0].lastName", code : "NotBlank.ShareData.lastName"},
                    {field : "recipients[0].email", code : "Invalid.ShareData.email"}
                ]
            };
            this._handleValidationErrors(data);
        };
        
        this._bindOpenButton = function(e) {
            e.preventDefault();
            _this._openFormModal();
        };
        
        //Bind event handlers to modal controls
        $('#shareModalOpenButton').click(function(e){
        	$("#captchaText").attr("src", "/captcha-image.html?tmp="+new Date());
            _this._bindOpenButton(e);
        });
        
        $('#shareModalCloseButton').click(function(e) {
            e.preventDefault();
            _this._closeFormModal();
        });
        
        $('#addRecipientButton').click(function(e){
            e.preventDefault();
            _this._addRecipient();
        });
        
        $('#shareForm .removeRecipientButton').click(function(e){
            e.preventDefault();
            _this._removeRecipient($(e.target).data('index'));
        });
        
        $('#successModalCloseButton').click(function(e){
            e.preventDefault();
            _this._closeSuccessModal();
        });
    }
    
    Grainger.share.ShareListModal = function(analytics) {
    
        this._formId = 'sharelist';
        
        AbstractShareModal.apply(this,[{},analytics || {},'modal/sharelist']);
        
        var _this = this;
        
        this._getFormPostData = function() {
            $('#shareForm [name="siteLink"]').val('https://' + window.location.host);
            return _this._form.serialize();
        };
        
        //Implement context-specific success handler
        this._handleSuccess = function(data){
            _this._closeFormModal();
            //Using the successMessage string template,
            //render the success message and inject into
            //the success modal content.
            var successMessage = MessageHelper.getMessage('share.form.msg.success');
                
            //If there's more than one recipient, insert a ul
            if(data.recipients.length > 1){
                
                var replace = ':<br /><ul class="recipients">';
                $.each(data.recipients,function(index,rec){
                    if(rec.firstName){
                        replace += '<li>' + rec.firstName + ' ' + rec.lastName+ '</li>';
                    }
                });
                replace += '</ul>';
                successMessage = successMessage.replace('{0}', replace);
            } else {
                successMessage = successMessage.replace('{0}', data.recipients[0].firstName + ' ' + data.recipients[0].lastName);
            }

            $('#successMessage').html(successMessage);
            _this._openSuccessModal();
        };
    };
    
    Grainger.share.ShareProductModal = function(config,analytics,productName) {
    
        this._formId = 'shareproduct';

        //Extend AbstractShareModal
        AbstractShareModal.apply(this,[config,analytics,'modal/shareaproduct']);
        
        var _this = this;
        
        this._getSuccessMessage = function() {
            return _this._successMessage;
        };
        
        //Implement context-specific success handler
        this._handleSuccess = function(data){
            _this._closeFormModal();
            //Using the successMessage string template,
            //render the success message and inject into
            //the success modal content.
            var successMessage = _this._messages.successMessage.replace('{0}',productName);
                
            //If there's more than one recipient, insert a ul
            if(data.recipients.length > 1){
                
                var replace = ':<br /><ul class="recipients">';
                $.each(data.recipients,function(index,rec){
                    if(rec.firstName){
                        replace += '<li>' + rec.firstName + ' ' + rec.lastName+ '</li>';
                    }
                });
                replace += '</ul>';
                successMessage = successMessage.replace('{1}', replace);
            } else {
                successMessage = successMessage.replace('{1}', data.recipients[0].firstName + ' ' + data.recipients[0].lastName);
            }

            $('#successMessage').html(successMessage);
            _this._openSuccessModal();
        };
        
    };
    
  //Share Motor Match Results Modal
    Grainger.share.ShareMotorMatchModal = function(config,analytics,searchSKUs) {
        
        this._formId = 'sharemotormatch';

        //Extend AbstractShareModal
        AbstractShareModal.apply(this,[config,analytics,'modal/sharemotormatch']);
        
        var _this = this;
		
	    //Customize form data
        this._getFormPostData = function() {
            var siteLink = window.location.protocol + '//' + window.location.host + '/' + 'search?searchSKUs=' + searchSKUs + '&source=MotorMatch%C2%AE%20Selection%20Guide';
            
            $('#shareForm [name="siteLink"]').val(siteLink);
            return _this._form.serialize();
        };
        
        //Implement context-specific success handler
        this._handleSuccess = function(data){
            _this._closeFormModal();
            //Using the successMessage string template,
            //render the success message and inject into
            //the success modal content.
            var successMessage = _this._messages.successMessage;
                
            //If there's more than one recipient, insert a ul
            if(data.recipients.length > 1){
                
                var replace = ':<br /><ul class="recipients">';
                $.each(data.recipients,function(index,rec){
                    if(rec.firstName){
                        replace += '<li>' + rec.firstName + ' ' + rec.lastName+ '</li>';
                    }
                });
                replace += '</ul>';
                successMessage = successMessage.replace('{0}', replace);
            } else {
                successMessage = successMessage.replace('{0}', data.recipients[0].firstName + ' ' + data.recipients[0].lastName);
            }

            $('#successMessage').html(successMessage);
            _this._openSuccessModal();
        };
        
    };
    
    Grainger.share.ShareCompareModal = function(config,analytics, compare) {
        
        if(typeof compare !== 'object') {
            throw new Error('compare object required');
        }
         
        this._formId = 'sharecompare';
        
        //Extend AbstractShareModal
        AbstractShareModal.apply(this,[config,analytics,'modal/shareproductcompare']);
        
        var _this = this;
        
        this._bindOpenButton = function(e) {
            if(compare.getProductCodes().length === 0) {
                compare.setErrorMessage(MessageHelper.getMessage('share.compare.minitems'));
            } else {
                e.preventDefault();
                _this._openFormModal();
            }
        };
        
        //Customize form data
        this._getFormPostData = function() {
            var productCodes = compare.getProductCodes();
            var siteLink = window.location.protocol + '//' + window.location.host + '/product/compare?shared=true';
            
            for(var i in productCodes) {
                siteLink += ('&productCodes[' + i + ']=' + productCodes[i]);
                $('#shareForm input[name="productCodes[' + i + ']"]').val(productCodes[i]);
            }
            
            //Reset remaining product code fields
            for(var j = productCodes.length; j < 5; j++) {
                $('#shareForm input[name="productCodes[' + j + ']"]').val('');
            }
            
            $('#shareForm [name="siteLink"]').val(siteLink);
            return _this._form.serialize();
        };
        
        //Implement context-specific success handler
        this._handleSuccess = function(data){
            _this._closeFormModal();
            //Using the successMessage string template,
            //render the success message and inject into
            //the success modal content.
            var successMessage = _this._messages.successMessage;
                
            //If there's more than one recipient, insert a ul
            if(data.recipients.length > 1){
                
                var replace = ':<br /><ul class="recipients">';
                $.each(data.recipients,function(index,rec){
                    if(rec.firstName){
                        replace += '<li>' + rec.firstName + ' ' + rec.lastName+ '</li>';
                    }
                });
                replace += '</ul>';
                successMessage = successMessage.replace('{0}', replace);
            } else {
                successMessage = successMessage.replace('{0}', data.recipients[0].firstName + ' ' + data.recipients[0].lastName);
            }

            $('#successMessage').html(successMessage);
            _this._openSuccessModal();
        };
        
    };
})(jQuery, Grainger, document);
