requirejs.config({
  shim: {
    'bootstrap'	: ['jquery','cookie'],
    'history' : ['jquery'],
    'ajaxify' : ['history'],
	'prettyCheckable' : ['jquery'],
  }
});

define(['jquery','bootstrap','loginPage','mainPage', 'utils', 'history', 'ajaxify','fileSaver'], 

function($,Bootstrap,LoginPage,MainPage,StatusPage,Utils){
	
	$.ajaxSetup({cache:false});	

	if(LoginPage.isUserLoggedIn()){
		MainPage.load();
	}else{
		var rememberedUser = Login.getRememberedUsername();
		if(rememberedUser){
			var user = Server.getUser(rememberedUser);
			if(user){
				Utils.setCurrentUser(user);
				MainPage.load();
			}
		}else{
			LoginPage.load();
		}
	}

	$(window).resize(function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 200);
    });

});	
	

	











