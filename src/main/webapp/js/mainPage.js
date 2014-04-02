var Main;
define(['require','utils','profile','publicKeys','certificates','server','users','courses'],
/**
 * @lends MainPage
 */ 
function(require,Utils,Profile,PublicKeys,Certificates,Server,Users,Courses){
	
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
			openDesktopTab(tag);
		}else{
			window.location.hash = "#home";
			openDesktopTab('unifi/#home');
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
			openDesktopTab("unifi/"+state);
		});
	};

	/**
	* Triggers functions for main Page initialization such as: screen adjustments by resizing, initialization of user panel, profile form,
	* public keys form, manage certificates form, and showing of the last opened tab.
    * @private
	* @memberOf Main#
	*/
	initMainPage = function(){
		Utils.unhideBody();
		
		initUserInfoPanel();	
		Courses.init();
		Profile.initForm();
		PublicKeys.initForm();
		Certificates.initForm();
		initCollapseHeaders();
		checkForStoredHashTags();
		
		require(["jsPlumb"], function(jsPlumb) {
			initResourceButtons();
		});
	};
	
	
	/**
      * Initiates user info panel located in the main page header section. Defines the behaviour for clicking on the panel items: 
	  * opening the corresponding window. Sets current user first and last name in it.
	  * Scrolls to the appropriate fields to the top after they are selected from the menu.
	  * Triggers sign out button initialization.
	  * @private
	  * @memberOf Main#
      */ 
	initUserInfoPanel = function(){		
		var navLinks = $(".navigationLink a");
		navLinks.off();
		navLinks.not('#signOut, #tasksToggle').on('click',function(e){
			e.preventDefault();
			var linkHref = $(this).attr('href');
			var hash = linkHref.toLowerCase();
			if(hash == "unifi/#task" || hash == "unifi/#createtask"){
				$("#homeAside").fadeOut(200, function(){
					$("#taskAsides").fadeIn(200);
				});
			}
			openDesktopTab(hash);
		});
		
		$(".toHomeAsideLink").on('click',function(e){
			e.preventDefault();
			$("#taskAsides").fadeOut(200, function(){
				$("#homeAside").fadeIn(200);
				openDesktopTab("#home");
			});
		});
		
		Utils.updateUserInfoPanel();
		initSignOutBtn();
		initHashtagChange();
	};
	
	
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
				case "ADMIN":
					$("<div>").load("mainContent.html #fiteagleusers,#testbeds,#addtestbed",function(){
						$("#desktop").append(this.childNodes);
						Users.initForm();
						initMainPage();
					});
					break;
					
				case "TBOWNER":
					$("<div>").load("mainContent.html #createcourse,#createtask",function(){
						$("#desktop").append(this.childNodes);
						initMainPage();
					});
					break;
					
				default:
					$("<div>").load("mainContent.html #task,#addcourse",function(){
						$("#desktop").append(this.childNodes);
						initMainPage();
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
			
			var a = $('.navigationLink [href$='+hash.replace("unifi/", "")+']');
			if(a.length != 0){
				history.pushState(hash, "page "+hash, "/"+hash);
				a.tab('show');
			}
			else{
				$('[href$=#home]').tab('show'); 
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
				var isCookieDeleted = Server.invalidateCookie();
				if(isCookieDeleted) Main.signOut();
		});
	};
	
	/**
	* Signs out the current user. Resets its data in the session storage and loads the login page.  
	* @public
	* @name Main#signOut
	* @function
	**/
	Main.signOut = function(){
		Utils.resetUser();
		history.pushState('', "page ", "/unifi/"); 
		require('loginPage').load();
	};
	
	return Main;
	
});



