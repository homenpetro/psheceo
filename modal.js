/*
 * Grainger Modal ported over from CSA app and slightly modified due to Bootstrap modal 
 * not working in some cases.
 * 
 * Basic usage:
 * 
 * var modal = new Grainer.Modal(options);
 * 
 * == Options ==
 * 
 * content 
 *    - Set the content of the modal
 * modal.height 
 *    - CSS height value
 * modal.width 
 *    - Numeric css width value or 'auto' ('auto' only applicable when content or URL option set)
 * title 
 *    - Specify the title of the modal
 * id 
 *    - Specify the id prefix of the modal. If no id is created, one is randomly created.
 * url
 *    - Specify a URL the modal should use to asyncronously load content. If a URL is specified,
 *    - the loaded content will be used.
 * urlParams
 *    - json object of parameters that should be added to the URL
 * template
 *    - Override the default modal template
 *    
 * == Methods ==
 * 
 * open()
 *    - Open the modal
 * close()
 *    - close the modal
 * loadContent(url,params)
 *    - Load conent into the modal from the specified URL. Params optional.
 * setContent(content)
 *    - Set the content of the modal
 * setTitle(title)
 *    - Set the title of the modal
 * 
 */
(function(Grainger,$, window) {
    "use strict";
    
    if(typeof $ === 'undefined') {
    	throw new Error('Grainger.ui.Confirm requires jQuery');
    }
    
    if(typeof Grainger !== 'object') {
        Grainger = {};
    }
    
    if(typeof Grainger.ui !== 'object') {
        Grainger.ui = {};
    }
    
    Grainger.ui.Modal = function(args){
    
        var $modal = this;
        
        var props = {
            modal : {
                height : '70%',
                width : 500
            },
            content : null,
            url : null,
            urlParams : {},
            id : null,
            title : "Modal Window",
            template : '<div id="${id}Window" class="grainger-modal-window" style="display:none"><div id="${id}Header" class="grainger-modal-header"><span id="${id}Title" class="grainger-modal-title"></span><button id="${id}Close" class="grainger-modal-close"></button></div><div id="${id}Toolbar" class="grainger-modal-toolbar"></div><div class="grainger-modal-content" id="${id}Content"></div><div id="${id}Footer" class="grainger-modal-footer"></div></div>'
        };
        
        $.extend(props, args ? args : {});
        
        if(props.modal.width === 'auto'){
            if(props.content === null && props.url === null) {
                throw new Error('auto width option only possible when content or url option provided.');
            }
        }
        
        var titleEl = null,
            overlayEl = null,
            contentEl = null,
            windowEl = null,
            closeButtonEl = null,
            headerEl = null,
            loaderEl = null,
            toolbarEl = null;
        
        var resultsCache = {};
        
        function getLoader(){
            if(loaderEl === null){
                if($("#grainger-modal-loader").length === 0){
                    $('body').append('<div id="grainger-modal-loader" class="grainger-modal-loader" style="display:none"></div>');
                }
                loaderEl = $("#grainger-modal-loader");
                loaderEl.css({
                    'position' : 'absolute',
                    'width' : contentEl.outerWidth(),
                    'height' : contentEl.outerHeight(),
                    'left' : windowEl.position().left + contentEl.position().left,
                    'top' : windowEl.position().top + contentEl.position().top
                });
            }
            return loaderEl;
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
        
        this.getWindow = function(){
            return windowEl;
        };
        
        this.loadContent = function(url,params){
            
            var cacheId = encodeURI(url);
            
            if(params){
                cacheId += $.param(params);
            }
            
            if(resultsCache[cacheId]){
                $modal.setContent(resultsCache[cacheId]); 
                return;
            }
            
            $.ajax({
                url : url,
                type : 'get',
                dataType : 'html',
                data : params,
                beforeSend : function(){
                    getLoader().show();
                },
                
                success : function(data){
                    $modal.setContent(data);
                    resultsCache[cacheId] = data;
                },
                
                error : function(jqXHR, statusText, error){
                    $modal.setContent(statusText);
                },
                
                complete : function(){
                    getLoader().hide();
                }
            });
        };
        
        this.setContent = function(content){
            props.content = content;
            contentEl.html(content);
        };
        
        this.setTitle = function(title){
            props.title = title;
            titleEl.html(title);
        };
        
        this.open = function(){
            getOverlay().show();
            windowEl.show();
        };
        
        this.close = function(){
            getOverlay().hide();
            windowEl.hide();
            getLoader().hide();
        };
        
        this.getToolbar = function(){
            return toolbarEl;
        };
        
        function position(){
            windowEl.css('left', ($(window).innerWidth() - props.modal.width)/2);
        }
        
        //Initialize modalWindow
        if(!props.id) props.id = 'modal_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        
        $('body').append(props.template.replace(/\$\{id\}/g, props.id));
        
        windowEl      = $('#'+props.id+'Window');
        closeButtonEl = $('#'+props.id+'Close'); 
        headerEl      = $('#'+props.id+'Header');
        titleEl       = $('#'+props.id+'Title');
        contentEl     = $('#'+props.id+'Content');
        toolbarEl     = $('#'+props.id+'Toolbar');
        
        windowEl.height(props.height);
        windowEl.width(props.width);
        windowEl.css('width',props.modal.width);
        windowEl.css('height',props.modal.height);
        
        //Load or set content
        if(props.url) {
            this.loadContent(props.url,props.urlParams);
        } else {
            this.setContent(props.content);
        }
        
        //If auto width, update with width of window.
        if(props.modal.width === 'auto'){
            props.modal.width = windowEl.outerWidth();
        }
        
        //Position modal on page
        position();
        
        //On window resize, re-position modal on page
        $(window).resize(function() { 
            position();
        });
        
        getOverlay().dblclick(function(event){
            $modal.close();
        });
        
        closeButtonEl.click(function(event){
            $modal.close();
        });
        
        this.setTitle(props.title);
        
    };
    
})(Grainger,jQuery, window);