var Main;
define(['require','utils','profile','publicKeys','certificates','server','users','classes','nodes'],
/**
 * @lends MainPage
 */ 
function(require,Utils,Profile,PublicKeys,Certificates,Server,Users,Classes,Nodes){
	
	 /** 
	 * The FITeagle main page class contains functions required for initialization of the 
	 * main page forms and elements located on the page.
     * @class
     * @constructor
     * @return Main Object
     */
	Main = {};
	
	/**
	* Checks if any hashtag is stored before. In case the tag is found the function triggers the tab opening according to this tag.
	* @private
	* @memberOf Main#
	*/
	checkForStoredHashTags = function(){
		var tag = Utils.getStoredHashTag();
		if(tag && tag.length > 1){
			history.pushState(tag, "page "+tag, tag);
			openDesktopTab(tag);
		}else{
			window.location.hash = home;
			history.pushState(home, "page "+home, home);
			openDesktopTab(home);
		}
	};
		
	
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
		$(window).on('popstate hashchange',function(){
			var state = window.location.hash;
			openDesktopTab(state);
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
		checkForStoredHashTags();
	};
	
	initNavigationTabs = function(){		
		var navLinks = $(".navigationLink a");
		navLinks.off();
		navLinks.not('#signOut, #tasksToggle').on('click',function(e){
			e.preventDefault();
			var hash = $(this).attr('href');
			if(hash == "#task" || hash == "#createtask"){
				$("#homeAside").fadeOut(200, function(){
					$("#taskAsides").fadeIn(200);
				});
			}
			history.pushState(hash, "page "+hash, hash);
			openDesktopTab(hash);
		});
		
		$(".toHomeAsideLink").on('click',function(e){
			e.preventDefault();
			$("#taskAsides").fadeOut(200, function(){
				$("#homeAside").fadeIn(200);
				history.pushState(home, "page "+home, home);
				openDesktopTab(home);
			});
		});
	};
	
	
	var home = "";
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
					$("<div>").load("mainContent.html #home_federationadmin,#allusers,#nodes,#addnode",function(){
						$("#desktop").append(this.childNodes);
						home = "#home_federationadmin";
						Users.init();
						Nodes.init();
						initMainPage();
					});
					break;
					
				case "NODE_ADMIN":
					$("<div>").load("mainContent.html #home_nodeadmin,#tubnode,#allusers",function(){
						$("#desktop").append(this.childNodes);
						home = "#home_nodeadmin";
						Users.init();
						Nodes.init();
						initMainPage();
					});
					break;
					
				case "CLASSOWNER":
					$("<div>").load("mainContent.html #home_classowner,#createclass,#createtask",function(){
						$("#desktop").append(this.childNodes);
						home = "#home_classowner";
						initMainPage();
						require(["jsPlumb"], function(jsPlumb) {
							initResourceButtons();
						});
					});
					break;
					
				default:
					$("<div>").load("mainContent.html #home_student,#task,#uctclasses,#tubclasses",function(){
						$("#desktop").append(this.childNodes);
						home = "#home_student";
						initMainPage();
						require(["jsPlumb"], function(jsPlumb) {
							initResourceButtons();
						});
					});
				}
			}
		);
	};
	
	/**
	* Opens the appropriate tab from the user info dropdown menu on the main page according to the
	* hash tag entered in the browser's url field. The function searches within a "user info dropdown" menu
	* for a link with the reference showing to the specified container.
	* If no tab is found for a hash tag then the home tab is opened per default.
	* @see Twitter Bootstrap tab documentation for more information.
	* @param {String} hash - tag to opening a form for.
	* @example openTab('#keys') tries to open a tab identified by a "#keys" selector
	* @private
	* @memberOf Main#
	*/
	openDesktopTab = function(hash){
		if(hash != null){
			var navLinks = $(".navigationLink li");
			navLinks.removeClass("active");
			
			var a = $('.navigationLink [href$='+hash+']');
			if(a.length != 0){
				a.tab('show');
			}
			else{
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
		Utils.resetUser();
		history.pushState('', "page ", "/unifi/"); 
		require('loginPage').load();
	};
	
	return Main;
	
});



