/*
 * Grainger Modal Confirm
 * 
 * This is modal confirm object. If you need to show a modal to confirm
 * a user action, this object can help.
 * 
 * Basic Usage:
 * 
 * var confirm = new Grainger.ui.Confirm({options here}, 
 *     if(r) { 
 *         //User clicked ok
 *     } else {
 *         //User clicked cancel of closed confirm
 *     }
 * });
 * 
 * == Options ==
 * 
 * showClose
 *    - TRUE|FALSE, display a close button on the confirm. Default TRUE
 *    
 * classes
 *    - String of additional CSS classes to include on modal confirm for
 *    - custom styling.
 * 
 * width
 *    - The numeric width of the modal. Default 420
 * top
 *    - Number of pixels the modal should be rendered from the top. Default 25
 * content
 *    - Content to display to the user.
 * submitText
 * cancelText
 *    - Text to display on cancel and submit/ok buttons. Default is 'OK' and 'Cancel'
 * template
 *    - Override default template.
 * id
 *    - If provided, the id value is used when creating the confirm modal's ids. This
 *    - allows additional custom behavior and styles if needed.
 *    
 */
(function($,Grainger){
    "use strict";
    
    if(typeof $ === 'undefined') {
    	throw new Error('Grainger.ui.Confirm requires jQuery');
    }
    
    if(typeof Grainger !== 'object'){
        Grainger = {};
    }
    
    if(typeof Grainger.ui !== 'object') {
        Grainger.ui = {};
    }
    
    Grainger.ui.Confirm = function (opts,callback) {
        
        var overlayEl = null,
            confirmEl = null,
            closeEl = null,
            submitEl = null,
            cancelEl = null,
            _callback = null;
        
        var props = {
            showClose : true,
            classes : '',
            width: 420,
            top: 25,
            content : '<p class="alert">Confirm action?</p>',
            submitText : 'OK',
            cancelText : 'Cancel',
            template : '<div id="{id}Confirm" class="grainger_ui_confirm modal-window {classes}" style="z-index:10000">' +
                         '<div id="{id}ConfirmHeader" class="modal-header">{heading}</div>' +
                         '<div id="{id}ConfirmContent" class="modal-content">{content}</div>' +
                         '<div id="{id}ConfirmFooter" class="modal-footer">' +
                             '<div class="right"><button class="btn btn-small" id="{id}ConfirmCancel">{cancelText}</button>' +
                             '<button class="btn btn-small" id="{id}ConfirmSubmit">{submitText}</button></div>' +
                         '</div>' +
                       '</div>'
        };
        
        $.extend(props, typeof opts === 'object' ? opts : {});
        
        if(!props.id) props.id = 'confirm_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        
        function setCallback(c) {
            if(typeof c !== 'function') {
                throw new Error('Invalid or missing confirmation callback.');
            }
            _callback = c;
        }
        
        function getOverlay(){
            if(overlayEl === null){
                if($("#grainger-modal-overlay").length === 0){
                    $('body').append('<div id="grainger-modal-overlay" class="grainger-modal-overlay" style="display:none"></div>');
                }
                overlayEl = $("#grainger-modal-overlay");
            }
            return overlayEl;
        }
        
        function cancel() {
            hide();
            _callback(false);
        }
        
        function ok() {
            hide();
            _callback(true);
        }
        
        function show() {
            confirmEl.show();
            getOverlay().show();
        }
        
        function hide() {
            confirmEl.hide();
            getOverlay().hide();
        }
        
        setCallback(callback);
        
        //Render modal and confirm
        getOverlay().show();
        
        var heading = props.showClose ? '<a href="#" id="' + props.id +'ConfirmClose" class="close right">close</a>' : '';
        heading += (props.heading ? '<h2>' + props.heading +'</h2>' : '');
        
        var html = props.template.replace(/\{content\}/g, props.content);
        html = html.replace(/\{heading\}/g, heading);
        html = html.replace(/\{classes\}/g, props.classes);
        html = html.replace(/\{cancelText\}/g, props.cancelText);
        html = html.replace(/\{submitText\}/g, props.submitText);
        html = html.replace(/\{id\}/g, props.id);
        

        $('body').append(html);
        
        confirmEl = $('#'+props.id+ 'Confirm');
        confirmEl.width(props.width);
        confirmEl.css('position','absolute');
        confirmEl.css('left',($(window).innerWidth() - props.width)/2);
        confirmEl.css('top',props.top);
        
        if(props.showClose){
            closeEl = $('#'+props.id+ 'ConfirmClose');
            closeEl.click(function(event){
                cancel();
                return false;
            });
        }
        
        cancelEl = $('#'+props.id+ 'ConfirmCancel');
        submitEl = $('#'+props.id+ 'ConfirmSubmit');
        
        cancelEl.click(function(event){
            cancel();
            return false;
        });
        
        submitEl.click(function(event){
            ok();
            return false;
        });
        
        $(window).resize(function() { 
            confirmEl.css('left',($(window).innerWidth() - props.width)/2);
        });
        
        getOverlay().dblclick(function(event){
            cancel();       
        });
        
        return {
            setCallback : setCallback,
            hide : hide,
            show : show
        };
    };
    
})(jQuery,Grainger);