var Login;
define([ 'require', 'validation', 'registration', 'utils', 'messages',
		'history', 'ajaxify', 'prettyCheckable' ],

function(require, Validation, Registration, Utils, Messages) {

	/**
	 * The Login class contains functions required for initialization of the
	 * forms and elements located on the login page.
	 * 
	 * @class
	 * @constructor
	 * @return Login Object including the public functions to be called inside
	 *         other modules.
	 */
	Login = {};

	Login.initLoginPage = function() {
		 redirectToUrl();
		 initOnWindowResizeEvent();
		 initLoginForm();
		 initSignInBtn();
		 Registration.initRegistrationForm();
		 initOnWindowResizeEvent();
		 initHistory();
	};

	/**
	* Initiates history functionality for the login page navigation menu by initializing History API. It stores 
	* the previous clicked navigation tab in the browser tab so it can be reached by clicking
	* on "back" and "next" buttons.
	* @private
	* @memberOf Login#
	*/
	initHistory = function(){
		$('#navigation ul li a').not("#unifiLink").not("#avLink").on('click',function(e){
			e.preventDefault();
			var href = $(this).attr('href');
			history.pushState(href, "page "+href, href+"_page");
			(href == '')?
				$('[href$=#home]').tab('show')
					:
				$('[href$='+href+']').tab('show');
		});
		$(window).on(' hashchange', function(event) {
			redirectToUrl();
		});
	};
	
	
	/**
     * Returns the username of the remembered user by a login process.  
	  * @public
	  * @name Login#getRememberedUsername
     * @function 
	  * @return {String} username of the remembered user or "undefined" if no user is remembered 
	  * @see https://github.com/carhartl/jquery-cookie
     */ 
	Login.getRememberedUsername = function(){
		var username="";
		var cookie = $.cookie('fiteagle_user_cookie');
		if(cookie){
			var cookieVal = atob(cookie);
			var start = cookieVal.indexOf("username:");
			if(start > -1){
				username = cookieVal.substring(start+9);
			}
		}
		return username;
	};
	
	
	/**
	 * Initiates on window resize event that toggles navigation button
	 * visibility, re-initiates tooltips for the login and registration form
	 * depending on a current screen size.
	 * 
	 * @private
	 * @memberOf Login#
	 * @see Registration.initRegistrationFormHints for more information about
	 *      the tooltip initialization for the registration form
	 */
	initOnWindowResizeEvent = function() {
		$(window).resize(function() {
			Registration.initRegistrationFormHints();
		});
	};

	
	/**
	 * Initiates on click event for "signIn" button on the Home page identified
	 * by #signIn. The Function Login.loginUser() is called after clicking on
	 * this button.
	 * 
	 * @private
	 * @memberOf Login#
	 * @see Login.loginUser
	 */
	initSignInBtn = function() {
		$("#login").on('click', function() {
			Utils.clearErrorMessagesFrom("#loginErrors");
			Login.loginUser();
		});
	};
	
	/**
     * Collects user login information sends it to the server for authentication.
	  * The function validates the login information provided by a user in the login form and shows the appropriate error
	  * message in case the error occurs on the server or while validation. 
	  * @public
	  * @name Login#loginUser
     * @function 
	  * @see Server.loginUser for more information about communication with server communication for authentication.
	  * @see checkUsername for username validation
	  * @see checkPassword for password validation
     */ 
	Login.loginUser = function(){
		Utils.clearErrorMessagesFrom("#loginErrors");
		var rememberMe = $("#rememberMeCheckbox").is(":checked");
		var username = $('#username').val();
		var pswd = $('#password').val();
		var errorMessage = Server.loginUser(username,pswd,rememberMe);
		if(errorMessage)Utils.addErrorMessageTo("#loginErrors",errorMessage);	
	};
	

	/**
	 * Checks if there is a user that has been already logged into the system.
	 * 
	 * @return {Boolean} true is returned if there is a logged user, false
	 *         otherwise.
	 * @public
	 * @name Login#isUserLoggedIn
	 * @function
	 */
	Login.isUserLoggedIn = function() {
		var user = Utils.getCurrentUser();
		if (!user) {
			return false;
		}
		return true;
	};

	/**
     * Loads the HTML for the loading page into the DOM and triggers the loading page initialization function.
	  * @public
	  * @name Login#load
     * @function 
	  * @see Login#initLoginPage function
     */  
	Login.load = function(){
		var url = "login.html";
		$("#mainPage").load(url + " #navigation,#main",function(){
			Login.initLoginPage();
		});	
	};	
	

	/**
     * Initiates the login form. It Defines the focus change for enter click events for the login form fields.
	  * Styles the remember me checkbox by utilizing prettyCheckable plugin functions and images as well as 
	  * initiates login form field hints with the twitter bootstrap tooltips.
	  * @private
	  * @memberOf Login#
     * @see http://arthurgouveia.com/prettyCheckable/
	  */
	initLoginForm = function(){
		Utils.changeFocusOnEnterClick("#username","#password");
		$('#username').focus();
		$('#rememberMeCheckbox').prettyCheckable({color:'gray'});
	};
	

	/**
	 * The function analyses the hash tag from the url and opens the appropriate
	 * tab if the tag is known otherwise it stores the value in order to make
	 * possible to open a tab for this tag if other page is loaded e.g. fiteagle
	 * main page.
	 * 
	 * @private
	 * @memberOf Login#
	 */
	redirectToUrl = function() {
		var state = window.location.hash;
		var hash = state.split("_page")[0];
		if (hash == null || hash == '') {
			$('#navigation [href$=#home]').tab('show');
		} else {
			var tab = $('#navigation [href$=' + hash + ']');
			(tab.length) ? tab.tab('show') : Utils.storeHashTag(hash); 
		}
	};

	return Login;
});
