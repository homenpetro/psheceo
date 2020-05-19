
function submitLoginGet(){
	jQuery("#frwdUrlPath").val(location.pathname + location.search + location.hash);
	jQuery("#headerSignIn").submit();
}

function submitLoginErrorPage(){
	jQuery("#frwdUrlPath").val("/content");
	jQuery("#headerSignIn").submit();
}

function setAccount() {
	stopSubmit();
	var pathWithDestination = "/modal/m_signin?account=true";

	jQuery.ajax({
		url: pathWithDestination,
		data: jQuery("#chooseAcct").serialize(),
		dataType: "text",
		type: "POST",
		success: function(data) {
			if(data == null || data == "") {
				setTimeout("location.reload(true);",500);
			} else {
				Grainger.Modals.createAndShowModal("setAccount", "setAccount", data);
				try {
					refresh();
				} catch(err) {
				}
			}
		},
		error: function(error) {
			Grainger.Modals.createAndShowModal("setAccount", "setAccount", error);
		}
	});
}

function forgotPassword(action){
	var pathWithDestination = "/modal/m_authrecovery?parentPageUrl=" + jQuery.urlParam("parentPageUrl");
	if(action=='username'){
		pathWithDestination += "&forgotusername"
	}else if(action=='assistance'){
		pathWithDestination += "&assistance"
	}
	window.location.href = pathWithDestination;
}

function loginFrameLoadHandler() {
	var iframe = jQuery("#signInIframe");

	iframe.style.display = "block";
}

function showLogin() {

	// remove any login modals we may have created in the past
	var currentBody = jQuery("#body-main");
	var loginCurtain = jQuery("#loginCurtain");
	var loginLayer = jQuery("#loginLayer");
	if (loginCurtain != null) {
		currentBody.remove(loginCurtain);
	}
	if (loginLayer != null) {
		currentBody.remove(loginLayer);
	}

	loginCurtain = jQuery('<div/>');
	loginCurtain.attr('id',"loginCurtain").style("opacity", ".5");
	currentBody.append(loginCurtain);

	loginLayer = jQuery("<div/>");
	loginLayer.attr('id', "loginLayer");

	var iframeElement = jQuery("<iframe/>");
	var iframeSrc = "https://" + webServerDomain + "/modal/m_signin?parentPageUrl=" + getParentUrl();
	iframeElement.src = iframeSrc;
	iframeElement.id = "signInIframe";
	iframeElement.name = "signInIframe";
	iframeElement.setAttribute("scrolling", "no");
	iframeElement.setAttribute("frameborder", "0");
	iframeElement.setAttribute("allowTransparency", "-1");
    iframeElement.setAttribute("overflow", "hidden");

    iframeElement.setAttribute("style", "width: 300px; height: 700px; border: 0pt none; position: absolute; top: 0px; left: 0px; display:none;");

    if (!iframeElement.addEventListener) {
        iframeElement.attachEvent('onload', loginFrameLoadHandler);
    } else {
        iframeElement.addEventListener('load', loginFrameLoadHandler, false);
    }

    loginLayer.appendChild(iframeElement);
    currentBody.appendChild(loginLayer);

	var windowWidth = jQuery('window').width();

    var loginLeft = Math.floor((windowWidth*0.5)-140);
    jQuery('#' + iframeElement.id).style("left",loginLeft+"px");
}

var getParentUrl = function() {

    // When in a search context where a url fragment named "nav" exists, use the value of the fragment as the return url
    // instead of the full url which includes the fragment.  This is necessary to force proper reload of the parent search page.
    var fragObj = jQuery.parseParams(window.location.hash);

    if (fragObj.nav) {
        return (encodeURIComponent(window.location.protocol + "//" + window.location.host + fragObj.nav) + "&iframe");
    }

    return (encodeURIComponent(window.location.href) + "&iframe");
};

function closeIframeModal() {
	try {
		parent.document.getElementById("loginCurtain").style.display = "none";
		parent.document.getElementById("loginLayer").style.display = "none";
		parent.document.getElementById("loginLayer").innerHTML = ""
	} catch (a) {
		// The above will fail if the iframe is not of the same origin as the parent document
		// If thats the case, the only thing we can do is refresh the parent page
		window.parent.location.href = decodeURIComponent(jQuery.urlParam("parentPageUrl"));
	}
}

function stopSubmit() {
	try {
		event.stopPropagation();
	} catch (err) {
		if (window.console != 'undefined') {
			console.log("Error stopping submit [" + err + "]");
		}
	}
}

function searchByBrandLetter(brandLetter){
	stopSubmit();
	var xhrArgs={
			url: "/GuidedNavigationComponentController/brandByLetter?brandLetter=" + brandLetter,
			dataType: "text",
			type: "POST",
			success: function(data){
				//alert(data);
				if(data != null || data != ""){
					//alert(data)
					jQuery("#brandLetterResults").html(data);
				}
			},
			error: function(error){
				alert("ERROR!!!")
		}
	};
	var deferred = jQuery.ajax(xhrArgs);
}

//sign in, friend!
function heyLookSignIn() {
	var $signInLink = jQuery('#signInLink');

	if ($signInLink.hasClass('hasPopover')) {
		var showDelay = 1000,
			hideDelay = showDelay + 5000,
			showTimeout = setTimeout( (function(){
				$signInLink.popover('show');
			}), showDelay),
			hideTimeout = setTimeout( (function(){
				$signInLink.popover('hide');
			}), hideDelay);

		$signInLink
			.on('mouseenter', function() {
				clearTimeout(hideTimeout);
			})
			.on('mouseleave', function() {
				clearTimeout(hideTimeout);
				$signInLink.popover('hide');
			});
	}
 }
