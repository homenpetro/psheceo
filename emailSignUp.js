$(document).ready(function() {
	if ($('#subscribe').length > 0) {
		if($('#subscribe').hasClass('alt-menu')){
			$('#subscribe').css('margin-top', ($('#prd_ctg_for_nav_comps').outerHeight() + 20));
		}
		$('#subscribe').removeClass('hide');
    }
	

    $('#emailSignUpForm #subscribeEmailBtn').click(function() {
    	$('#emailSignUpForm').submit();
    });

	$('form#emailSignUpForm').submit(function() {
		validateEmailAddress($('#emailAddress')) ? subscribeForEmails() : $('#subscribeEmailSuccess').addClass('hide');
		return false;
    });
	
    var email = getUrlParameter('email');
    if(email){
        $('#emailUnsubForm #unsubEmailAddress').val(email);
    }
});

function validateEmailAddress(email) {
	
    var emailRegex = /\b[A-Za-zÀ-ÖØ-öø-ÿ0-9._\'%+-]+@(?:[A-Za-zÀ-ÖØ-öø-ÿ0-9-]+\.)+[A-Za-zÀ-ÖØ-öø-ÿ]{2,6}\b/;
    $('#emailSignUpForm .confirmation').addClass('hide');
    $('#emailSignUpForm .subscribeSuccessMsg').addClass('hidden');
    $('#emailSignUpForm .subscribeSuccessMsg2').addClass('hidden');
    var isEmailValid = emailRegex.test(email.val()) ;
    !isEmailValid ? $('#subscribeEmailError').removeClass('hidden') : $('#subscribeEmailError').addClass('hidden');
    
    return isEmailValid;
}

function subscribeForEmails() {
    $.ajax({
        type: "POST",
        url: "/emailSignUp/signUp",
        data: $("#emailSignUpForm").serialize(),
        success: function(data) {
            var error = false;
            if (data == 'success') {
                $('#emailSignUpForm .confirmation').removeClass('hide');
                $('#emailSignUpForm .subscribeSuccessMsg').removeClass('hidden');
                $('#emailSignUpForm .subscribeSuccessMsg2').removeClass('hidden');
                $('#subscribeEmailError').addClass('hidden');
                $('#email-subscribe-content .bloque').addClass('hidden');
                $('#emailSignUpForm #subscribeInputSection').addClass('hidden');
                
                $('#emailSignUpForm input[type="text"]').each(function() {
                    $(this).val('');
                });
                $('#receiveEmail').removeAttr('checked');

            } else if (data != "") {
                var json = jQuery.parseJSON(data);
                error = jQuery(json).attr("errors");
                if (error) {
                    $('#emailAddress').parent().find('div.error').removeClass('hide');
                    $('#subscribeEmailError').removeClass('hidden');
                    $('#emailSignUpForm .subscribeSuccessMsg').addClass('hidden');
                    $('#emailSignUpForm .subscribeSuccessMsg2').addClass('hidden');
                    
                    $('#emailSignUpForm #subscribeInputSection').removeClass('hidden');
                    $('#email-subscribe-content .bloque').removeClass('hidden');
                }

            }
        },
        error: function(data) {
            console.log('An error occurred to subscribe via Email.');
            console.log(data);
        }
    });
}


