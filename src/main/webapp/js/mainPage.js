var Main;
define(['utils','profile','publicKeys','certificates','server','users','classes','nodes'],
/**
 * @lends MainPage
 */ 
function(Utils,Profile,PublicKeys,Certificates,Server,Users,Classes,Nodes){
	
	 /** 
	 * The FITeagle main page class contains functions required for initialization of the 
	 * main page forms and elements located on the page.
     * @class
     * @constructor
     * @return Main Object
     */
	Main = {};
	
	/**
	* Initializes change of the icon sign for all of the headers with the class with  the ".collapseHeader" selector after clicking on it.
	* @private
	* @memberOf Main#
	*/
	initCollapseHeaders = function(){
		$('.collapseHeader').click(function(event){
			var header = event.currentTarget;
			var icon = $(header).find("i")[0];
			window.setTimeout(function(){
				switchCollapseSignFor($(icon));
			},100);
		});
	};
			
	/**
	* Initializes the icon sign replacement within the given container according to the current section state. 
	* Icon chevron right from the font awesome icons is shown if the section is collapsed and icon chevron right is section is opened.
 	* @param {Object} icon_object is a container object to change the icon sign after the section is opened or collapsed.
	* @private
	* @memberOf Main#
	*/
	switchCollapseSignFor = function(icon_object){
		var selector = $(icon_object[0].parentNode.parentNode).attr("data-target");
		var isOpen  = $(selector).hasClass('in');
			if(isOpen){
				icon_object.attr('class','');
				icon_object.addClass('collapseSign fa fa-caret-down fa-li');
			}else{
				icon_object.attr('class','');
				icon_object.addClass('collapseSign fa fa-caret-right fa-li');
		}
	};
	
	/**
	* Defines the behavior for clicking on "back" or "next" browser buttons aka browser history.
	* The function opens the appropriate form views.
	* @private
	* @memberOf Main#
	*/
	initHashtagChange = function(){
		$(window).unbind();
		openDesktopTab(window.location.hash.split("_page")[0], true);
		$(window).on('popstate hashchange',function(){
			var hash = window.location.hash.split("_page")[0];
			openDesktopTab(hash, false);
		});
	};

	/**
	* Triggers functions for main Page initialization such as: screen adjustments by resizing, initialization of user panel, profile form,
	* public keys form, manage certificates form, and showing of the last opened tab.
    * @private
	* @memberOf Main#
	*/
	initMainPage = function(){
		$("#unifiLogo").attr("href",home);
		Classes.init();
		initNavigationTabs();
		Utils.updateUserInfoPanel();
		initSignOutBtn();
		initHashtagChange();
		Profile.initForm();
		PublicKeys.initForm();
		Certificates.initForm();
		initCollapseHeaders();
	};
	
	initNavigationTabs = function(){		
		var navLinks = $(".navigationLink a");
		navLinks.not('#signOut, #tasksToggle').on('click',function(e){
			e.preventDefault();
			var hash = $(this).attr('href');
			openDesktopTab(hash, true);
		});
	};
	
	
	var welcome_message = "Manage your personal data, public keys and certificates from the dropdown-menu in the upper right corner.";
	var welcome_message_user = "Manage your personal data, public keys and certificates from the dropdown-menu in the upper right corner. " +
			"Classes, lectures and	virtualized testbeds from each partner university can be reached through the links on the map";
	
	/**
	* Loads HTML for the FITeagle main page dynamically and triggers the page initialization after the loading is successfully completed.
	* @public
	* @name Main#load
	* @function
	**/
	Main.load = function(){
		$("#mainPage").load("main.html #navigation,#main",
			function(){
				switch(Utils.getCurrentUser().role){
				case "FEDERATION_ADMIN":
					$("#welcome_content").append(welcome_message);
					Users.init();
					Nodes.init();
					initMainPage();
					break;
					
				case "NODE_ADMIN":
					$("#welcome_content").append(welcome_message);
					Users.init();
					Nodes.init();
					initMainPage();
					break;
					
				case "CLASSOWNER":
					$("#welcome_content").append(welcome_message);
					initMainPage();
					break;
					
				default:
					var img = $("<img>").attr("id", "unifiMap").attr("src", "img/map_unifi.png").attr("usemap", "#unifimap");
					
					var tubAreaClasses = $("<area>").attr("shape", "rect").attr("id", "tubClassesMapLink").attr("coords", "319,60,387,81").attr("href","#classes1");
					var tubAreaLectures = $("<area>").attr("shape", "rect").attr("coords", "319,82,387,101").attr("href","#tublectures").attr("onclick", "return false;");
					var tubAreaTestbeds = $("<area>").attr("shape", "rect").attr("coords", "319,102,387,123").attr("href","#tubtestbeds").attr("onclick", "return false;");
					
					var uctAreaClasses = $("<area>").attr("shape", "rect").attr("id", "uctClassesMapLink").attr("coords", "353,279,420,299").attr("href","#classes2");
					var uctAreaLectures = $("<area>").attr("shape", "rect").attr("coords", "353,300,420,320").attr("href","#uctlectures").attr("onclick", "return false;");
					var uctAreaTestbeds = $("<area>").attr("shape", "rect").attr("coords", "353,321,420,341").attr("href","#ucttestbeds").attr("onclick", "return false;");
					var map = $("<map>").attr("name", "unifimap").append(tubAreaClasses, tubAreaLectures, tubAreaTestbeds, uctAreaClasses, uctAreaLectures, uctAreaTestbeds);
					$("#welcome_content").append(welcome_message_user, img, map);
					initMainPage();
				}
			}
		);
	};
	
	var home = "#home";
	
	openDesktopTab = function(hash, pushToHistory){
		if(hash != null){
			var navLinks = $(".navigationLink li");
			navLinks.removeClass("active");
			
			var a = $('.navigationLink [href$='+hash+']');
			if(a.length != 0){
				if(pushToHistory){
					history.pushState(hash, "page "+hash, hash+"_page");
				}
				a.tab('show');
			}
			else{
				if(pushToHistory){
					history.pushState(home, "page "+home, home+"_page");
				}
				$('[href$='+home+']').tab('show'); 
			}
		}
	};
	
	/**
     * Defines the behaviour after clicking on the singOut button: Cookie invalidation on the server and singing out of the current user. 
	  * @private
	  * @memberOf Main#
    */ 
	initSignOutBtn = function(){
		$("#signOut").on('click',function(e){
			e.preventDefault();
			Main.signOut();
		});
	};
	
	/**
	* Signs out the current user. Resets its data in the session storage and loads the login page.  
	* @public
	* @name Main#signOut
	* @function
	**/
	Main.signOut = function(){
		Server.invalidateCookie();
		Utils.clearSessionStorage();
		history.pushState('', "page ", "/unifi/"); 
		require('loginPage').load();
	};
	
	return Main;
	
});
