requirejs.config({
  shim: {
    'bootstrap'	: ['jquery','cookie'],
    'history' : ['jquery'],
    'ajaxify' : ['history'],
	'prettyCheckable' : ['jquery'],
  }
});

define(['jquery','bootstrap','loginPage', 'utils', 'history', 'ajaxify','fileSaver'], 

function($,Bootstrap,LoginPage,StatusPage,Utils){
	
	$.ajaxSetup({cache:false});	

	if(LoginPage.isUserLoggedIn()){
		require(["mainPage"], function(mainPage) {
			mainPage.load();
		});
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

});	
	

	











