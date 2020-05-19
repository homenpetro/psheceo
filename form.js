(function($, Grainger){

    var ACTIVE_REQUEST_FLAG = false;
    
    /*
     * This object is intended to make ajax forms easier to setup. It uses jQuery validate
     * for client-side validation and will render server validation errors using the same
     * error styles. An optional options parameter in the constructor allows the jQuery validator
     * messages to be customized.
     *
     * Basic usage is:
     * <form id="myForm" action="/formHandler" method="post">
     * ...
     * </form>
     * <script type="text/javascript">
     *    var options = {
     *       messages : { fieldName : { required : 'Please enter a value in this field.' }}
     *    };
     *    var myForm = new Grainger.GenericAjaxForm('myForm',options);
     * </script>
     */
    Grainger.GenericAjaxForm = function(formId, options) {
        
        var opts = {
            errorsClass : 'errors',
            errorFieldClass : 'errorField',
            errorClass : 'errorMsg',
            globalMessageId : 'globalMessage'
        };
        
        var formEl = $('#'+formId),
            globalMessageEl = null,
            Validator = null;
        
        if(!formEl || formEl.length === 0) {
            throw new Error('No element found with id ' + formId);
        }
        
        if(typeof formEl.validate === 'undefined') {
            throw new Error('Grainger.GenericAjaxForm object requires jQuery validate plugin.');
        }
        
        function renderErrors(errors) {
            $.each(errors, function(name, msg){
                var el = Validator.findByName(name);
                if(el) {
                    var parent = el.parent(),
                        errorMsg = parent.find('.'+opts.errorClass).first();

                    if(!errorMsg) {
                        parent.append('<div class="'+opts.errorClass+'"></div>');
                        errorMsg = parent.find('.'+opts.errorClass).first();
                    }
                    errorMsg.text(msg);
                    parent.addClass(opts.errorsClass);
                    el.addClass(opts.errorFieldClass);
                    
                    el.focus(function(){
                        el.removeClass(opts.errorFieldClass);
                        errorMsg.text('');
                        parent.removeClass(opts.errorsClass);
                    });
                } else {
                    console.warn('Could not find element with name "' + name + '"');
                }
            });
        }
        
        function renderGlobalMessage(message, type) {
            globalMessageEl.text(message);
            globalMessageEl.attr('class','');
            globalMessageEl.addClass('alert alert-'+ type);
            globalMessageEl.show();
        }
        
        var config = {
            submitHandler : function() {
            
                if(ACTIVE_REQUEST_FLAG) {
                    return false;
                }
                
                ACTIVE_REQUEST_FLAG = true;
                
                $.ajax({
                    url : formEl.attr('action'),
                    data : formEl.serialize(),
                    type : 'post',
                    dataType : 'json',
                    complete : function(jqXHR){
                        if(jqXHR.status === 200){
                            var data = jQuery.parseJSON(jqXHR.responseText || "");
                            if(data.success === false){
                                if(data.message) {
                                    renderGlobalMessage(data.message,'error');
                                } else if(data.errors) {
                                    renderErrors(data.errors);
                                }
                                if(formEl.data('errormessage')){
                                    renderGlobalMessage(formEl.data('errormessage'),'error');
                                }
                            } else {
                                formEl.trigger('reset');
                                if(formEl.data('successmessage')) {
                                    renderGlobalMessage(formEl.data('successmessage'),'confirmation');
                                }
                                
                                if(typeof opts.successHandler === 'function') {
                                    opts.successHandler();
                                }
                            }
                        } else {                    
                            if(formEl.data('errormessage')){
                                renderGlobalMessage(formEl.data('errormessage'),'error');
                            }
                        }
                        $('body, html').scrollTop(0);
                        ACTIVE_REQUEST_FLAG = false;
                    }
                });
                return false;        
            },
            errorClass : opts.errorClass ,
            errorPlacement: function(error, element) {
                element.addClass(opts.errorFieldClass);
                error.appendTo(element.parent());
                element.parent().addClass(opts.errorsClass);
            },
            unhighlight : function(element, errorClass) {
                var jEl = $(element);
                jEl.removeClass(opts.errorFieldClass);
                jEl.removeClass(errorClass);
                jEl.parent().removeClass(opts.errorsClass);
            }
        };
        
        $.extend(opts,options);
        
        globalMessageEl = $('#'+opts.globalMessageId);
        
        if(!globalMessageEl || globalMessageEl.length === 0) {
            throw new Error('No element found with id ' + opts.globalMessageId);
        }
        
        if($.isPlainObject(opts.messages)){
            config.messages = opts.messages;
        }
        
        Validator = formEl.validate(config);
    };
})(jQuery,Grainger);