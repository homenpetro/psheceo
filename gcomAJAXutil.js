/*****************************************************************
 * 
 * AJAX without dojo 
 *
 * @author: Richard Song 
 *****************************************************************/

hasDojo = !(typeof dojo == "undefined");
isIE  = false; 
isOpera = (navigator.userAgent.indexOf("Opera") >= 0) ? parseFloat(navigator.appVersion) : 0;
if(document.all && !isOpera){
	isIE = parseFloat(navigator.appVersion.split("MSIE ")[1]) || 0;
}

_XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0'];
function getXMLHttpRequest(){
	var xhrObj = null;
	var last_e = null;
	if(!isIE || window.XMLHttpRequest){ //IE 7 falls into here as well, if not, then it will use Msxml2.XMLHTTP
		try{ xhrObj = new XMLHttpRequest(); }catch(e){}
	}
	if(!xhrObj){ //this is for IE 5.x-6.x:
		for(var i=0; i<5; ++i){
			var progid = _XMLHTTP_PROGIDS[i];
			try{
				xhrObj = new ActiveXObject(progid);
			}catch(e){
				last_e = e;
			}
            if(xhrObj){
				_XMLHTTP_PROGIDS = [progid];  // so faster next time
				break;
			}
		}
	}
	if(!xhrObj){
	    throw new Error( "This browser does not support XMLHttpRequest. :" + last_e );
	}
	return xhrObj;
}

function convertToXhrArgs (obsoleteBindArgs) {
	var retVal = {
		url: obsoleteBindArgs.url,
		content: obsoleteBindArgs.content,
		form:    obsoleteBindArgs.formNode,
		sync: obsoleteBindArgs.sync || false,
		error: function (response, ioArgs) {
			return obsoleteBindArgs.error("", response);
		},
		method: obsoleteBindArgs.method,
		handleAs: getHandleAs(obsoleteBindArgs.mimetype),
		load: function (response, ioArgs) {
		    return obsoleteBindArgs.load("", response, "");
		}		
	};
    return retVal;
}

function xhrCall(method, xhrArgs) {//only handleAs text is supported
/* this is the xhrArgs object for your AJAX call
xhrArgs = {
		url: //url or the XMLHttpRequest call,
		headers: //Additional HTTP headers to send in the request.,
		content: //Contains properties with string values. These properties will be serialized as name1=value2 and passed in the request.,
		form:  //form name to be submitted,
		sync: //sync or asyn call, true|false,
		username: //user name,
		password: //password,
		error: function (response, ioArgs) { //function being call if error
			return obsoleteBindArgs.error("", response);
		},
		handleAs: //whether it is 'text', 'xml', 'json' etc, for Now only text is supported
		load: function (response, ioArgs) { //callback function if the submit is successful
		    return obsoleteBindArgs.load("", response, "");
		}	
	};
*/	

  var method = method || 'POST'; 
  if(typeof dojo == "undefined") {
      var xhrObj =  getXMLHttpRequest();     
	  
	  xhrObj.onreadystatechange = function() {
          var done = 4, ok = 200;
          if (xhrObj.readyState == done && xhrObj.status == ok) {
            if (xhrObj.responseText) {
               xhrArgs.load(xhrObj.responseText);
            }
          }else {
		      try { xhrArgs.error(xhrObj.responseText); }catch(e){}
		  }    
	 };	 
	   
      xhrObj.open(method, xhrArgs.url, xhrArgs.sync != true, xhrArgs.username || undefined, xhrArgs.password || undefined);
      if (method == 'POST') {
          xhrObj.setRequestHeader("Content-Type",  "application/x-www-form-urlencoded");
      }
      var contentMap = null;
	  if(xhrArgs.content) {
	     contentMap = xhrArgs.content;
	  }
	  if(xhrArgs.form) {
	     if (contentMap) {
		 	contentMap = mergeMap(contentMap, formToMap(xhrArgs.form));
		 }
	  }
      var contentToSend = (contentMap)? mapToContent(contentMap) : null; //if GET, then this is null 
 
       try{
			xhrObj.send(contentToSend);
		}catch(e){
			alert("ajax call failed: " + e);
		}
  } else {
  	if (method == 'POST') {
		dojo.xhrPost(xhrArgs);
	} else if (method == 'GET') {
		dojo.xhrGet(xhrArgs);
	} else { //default will be POST
		dojo.xhrPost(xhrArgs);
	}	
  }
}

function addToMap(map, name, value){
		var val = map[name];
		if(isArray(val)){
			val.push(value);
		}else if(!isEnpty(val)){//for an existing string, convert to array
			map[name] = [val, value];
		}else{
			map[name] = value;
		}
}
	
function formToMap(/*DOMNode||String*/ formNode){
		var ret = {}; //the map object to be returned
		if (formNode instanceof String || typeof formNode == "string") {
		   formNode = document.getElementById(forNode);
		}
		var elms = formNode.elements;
		var noTypes = "file,submit,image,reset,button";//skip these guys
		var inputElms = formNode.getElementsByTagName("input");  
		var selectElms = formNode.getElementsByTagName("select");
		var textareaElms = formNode.getElementsByTagName("textarea");    
		for (var i=0; i<inputElms.length; i++) {
		    var elm = inputElms[i];
			var type = elm.type.toLowerCase();
			if(noTypes.indexOf(type)<0) {
				if(type == "radio" || type == "checkbox"){
				   if(elm.checked){ addToMap(ret, elm.name, elm.value); }
			    }else{ 
				   addToMap(ret, elm.name, elm.value);
				}
			}
		}			
		for (var i=0; i<selectElms.length; i++) {
		    var elm = selectElms[i];
			if (elm.multiple) {
			   for (var j=0; j<elm.options.length; j++) {
			   		var opt = elm.options[j];
					if(opt.selected){addToMap(ret, elm.name, opt.value);}
			   }	
			}else if(elm.selectedIndex >=0) {
			   addToMap(ret, elm.name, elm.options[elm.selectedIndex].value);			
			}
		}
		for (var i=0; i<textareaElms.length; i++) {
		    var elm = textareaElms[i];
		    addToMap(ret, elm.name, elm.value);			
		}
		return ret; 
	}



function isArray(obj) {
	return obj && (obj instanceof Array || typeof obj == "array");
}

function isEmpty(str) {
	return str == null || str == undefined || str.length == 0;
}



function mapToContent(/*property object*/map) {
        //var map = formToMap(formObj);
	    var enc = encodeURIComponent;
	    var pairs = [];
	    var emptyValues = {};
		for(var name in map){
			var value = map[name];
			if(value != emptyValues[name]){
				var assign = enc(name) + "=";
				if(isArray(value)){
					for(var i=0; i < value.length; i++){
						pairs.push(assign + enc(value[i]));
					}
				}else{
					pairs.push(assign + enc(value));
				}
			}
		}
		return pairs.join("&");
}	
	
function mergeMaps (map1, map2) {
	var ret = {};
	if (map1) {
	   for (var name in map1) {
		  addToMap(ret, name, map1[name]);
	   }
	}
	if (map2) {
		for (var name in map2) {
		  addToMap(ret, name, map2[name]);
	    }
	}
	return ret;
}	

//using the following or isAjaxSupported to replace dojo.hostenv.getXmlhttpObject()
function isXmlhttpRequestSupported() {
    var xhr = null;
    try{ xhr = (hasDojo) ? dojo._xhrObj() : getXMLHttpRequest(); }catch(e){}  
	return (!xhr) ? false : true; 
}

function isAjaxSupported() {
    return isXmlhttpRequestSupported();
}	

function getHandleAs(mimetype) {
    mimetype = mimetype || 'text/html';	 
	if (mimetype == 'text/html' || mimetype == 'text/plain') {
	   return 'text';
	}
	
	if (mimetype.indexOf('javascript') > 0) {
	   return 'javascript';
	}
	
	if (mimetype.indexOf('xml') > 0) {
	   return 'xml';
	}
	   
	return 'text';   
}

function modifyInputFields(formId, enableFlag) {
    var formElement = document.getElementById(formId);
    if (formElement != null && formElement.tagName == "FORM") {
        for (var i=0; i< formElement.length; i++ ) {
            var element = formElement[i];
            if (element.tagName == "INPUT" ) {
                if (!enableFlag) {
                    element.disabled = true;
                } else {
                    element.disabled = false;
                }
            }
        }
    }
}

function processAjaxResponse(response) {
	if (response.toLowerCase().indexOf("<ajax-response>") < 0) {
		document.write(response);
		document.close();
		return;
	}
	xmlDoc = (hasDojo) ? dojox.data.dom.createDocument(response) : createXMLDocument(response);
	var errors = xmlDoc.getElementsByTagName("error");
	if (errors != null && errors.length > 0) {
		processErrors(errors);
	} else {
		var fields = xmlDoc.getElementsByTagName("field");
		processFields(fields);
	}
}

function processErrors(errors) {
	for (var i = 0; i < errors.length; i++) {
		var value = errors[i].getAttribute("value");
		if (value == null) {
			if (window.ActiveXObject) {
				value = errors[i].firstChild.nodeValue.trim();
			} else {
				value = errors[i].childNodes[1].nodeValue.trim();
			}
		}
		alert(value);
	}
}

function processFields(fields) {
	for (var i = 0; i < fields.length; i++) {
		var id = fields[i].getAttribute("id");
		// skip processing if field does not exist
		if (!document.getElementById(id)) {
			continue;
		}
		var attribute = fields[i].getAttribute("attribute");
		var value = fields[i].getAttribute("value");
		if (value == null) {
			if (window.ActiveXObject) {
				value = fields[i].firstChild.nodeValue.trim();
			} else {
				
				value = "";
				for (var nodeIdx=0;nodeIdx < fields[i].childNodes.length; ++nodeIdx) {
					value += fields[i].childNodes[nodeIdx].nodeValue.trim();
				}
			}
		}
		eval("window.replaceValue = function(value) { document.getElementById('" + id + "')." + attribute + " = value;}");
		replaceValue(value);
		
		if (attribute == "innerHTML" && value != null && value.length > 0) {
			var node = null;			
			node = document.getElementById(id);			
			var scripts = node.getElementsByTagName("script");
			for (var j = 0; j < scripts.length; j++) {
				var src = scripts[j].getAttribute("src");
				if (src != null && src != "") {
					if (src.indexOf("dojo.js") < 0) { //why are we doing this? dojo.js should already be loaded, anyway, leave it for now					  
						dojo.xhrGet({
							url: src,
							handleAs: "javascript",
							load: function(response, ioArgs) {},
                            sync: true,
							error: function(response, ioArgs) { alert("Error: " + response); }
						});
					}
				} else {
					var script = "";
					
					if (window.ActiveXObject) {
                        script = scripts[j].text.trim();
					} else {

						// For FF, Opera and other non-IE browsers thre is a limit on nodeValue
						// FF is 4096, Opera seems to be higher at 32768.
						// Data over this limit will be split into N child nodes
						// To ensure that we process the entire data response we must concat
						// all nodes together.
						for (var nodeIdx=0;nodeIdx < scripts[j].childNodes.length; ++nodeIdx) {
							script += scripts[j].childNodes[nodeIdx].nodeValue.trim();
						}
					}
					eval(script);
				}
			}
		}
	}
}



function dojoBind(oArg) {
	var resetTimeout = true;
	if (oArg.resetTimoutCounter == undefined) {
		resetTimeout = true;
	} else {
		resetTimeout = oArg.resetTimoutCounter;
	}
    if (resetTimeout) {
        sessionResetCount = 0;
    }

	if (isIE && !isXmlhttpRequestSupported()) {
    	var showMsg = true;
    	if (oArg.showMsg == undefined) {
    		showMsg = true;
    	} else {
    		showMsg = oArg.showMsg;
    	}
        if (showMsg) {
            alert("To complete this action, your Internet Explorer browser must have\r\nActiveX controls enabled.   Please update your browser, use a different\r\nbrowser or contact Customer Care at 1-888-361-8649, 24 hours a day,\r\n7 days a week for assistance.");
        }
    	if (oArg.none != undefined) {
    		for (var i=0;i<oArg.none.length;i++) {
    			if (document.getElementById(oArg.none[i])) {
    			    document.getElementById(oArg.none[i]).style.display = "none";
    			}
    		}
    	}
    	if (oArg.inline != undefined) {
    		for (var i=0;i<oArg.inline.length;i++) {
    			if (document.getElementById(oArg.inline[i])) {
    			    document.getElementById(oArg.inline[i]).style.display = "inline";
    			}
    		}
    	}     
        return -1;
	}
	

	oArg.bindObj.sendTransport = true;  
	xhrCall(oArg.bindObj.method, convertToXhrArgs(oArg.bindObj));	
}