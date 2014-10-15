define(['utils'],
/**
 * @lends MainPage
 */ 
function(Utils){
	
	/** 
     * Server class contains functions that enables the remote communication with the FITeagle server REST API,  
	 * by utilizing AJAX such as user profile, public key and certificate management. 
     * @class
     * @constructor
     * @return Server object
     */
	Server = {};
	
	/**
	* The function sends a request to the server API for logging in a user with a given username and password.   
	* @param {String} username of the user to try logging in
	* @param {String} password for the given username to log in
	* @param {Boolean} rememberMe - a flag for remembering the user after the user is successful logged in.
	* true is for remembering the current user and false for not.
	* @return {String} message in case of the error the server response message is returned.
	* @public
	* @name Server#loginUser
	* @function
	*/
	Server.loginUser = function(username,password,rememberMe){		
		var msg=null;
		setCookie = "";
		if(rememberMe){
			setCookie="setCookie=true";
			Utils.thisUserToBeRemembered();
		}
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			data: setCookie,
			url : "/native/api/user/"+username,
			beforeSend: function(xhr){
				Utils.unhideElement('#loginSpinner');
				xhr.setRequestHeader("Authorization",
                "Basic " + btoa(username + ":" + password)); // TODO Base64 support
			},
			success: function(user,status,xhr){
				user.username = user.username.split("@")[0];
				Utils.setCurrentUser(user);
				require(["mainPage"], function(mainPage) {
					mainPage.load();
				});
			},
			error: function(xhr,status,thrown){		
				msg = thrown;
			},
			complete: function(){
				setTimeout(function(){
					Utils.hideElement('#loginSpinner');
				},300);
			},
			statusCode:{				
				404: function(){
					msg = Messages.wrongUsernameOrPassword;	
				},
				401 : function(){
					msg = Messages.wrongUsernameOrPassword;
				}
			}
		});
		
		return msg;
	};
	
	/**
	* The function sends a request to the server API for registering a new user. If the given user is successfully 
	* registered the function then automatically sends the logging in request and loads the FITeagle main page.
	* @param {Object} newUser object contains
	* @param {String} newUsername is username for a new user to be registered with
	* @param {Function} successFunction is a callback function to be called after the new user is 
	* successfully registered.
	* @return {Object} error object containing the error response message from the server.
	* The error object is the Twitter Bootstrap alert span object
	* @see Utils#createErrorMessage and Twitter Bootstrap alert component
	* @public
	* @name Server#registerUser
	* @function
	*/
	Server.registerUser = function(newUser,newUsername,successFunction){	
		var userToJSON = JSON.stringify(newUser);
		var message=0;
		$.ajax({
			cache: false,
			type: "PUT",
			async: false,
			url: "/native/api/user/"+newUsername,
			data: userToJSON,
			contentType: "application/json",
			success: function(data,status){	},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
			statusCode:{				
				201: function(){
					newUser.username = newUsername;
					Utils.setCurrentUser(newUser);
					Server.loginUser(newUser.username, newUser.password, false, successFunction);
				}
			}
		});
		
		return message;
	};
	
	/**
	* Sends the request to the server API for getting user profile object for the specified username.
	* In case there was an unauthorized request attempt (meaning the user is not logged on the server side) the function and currently shown page is a FITeagle main page,
	* the function triggers the sing out procedure, it is done for security reasons and other use cases.
	* @param {String} username to get the user profile object for.
	* @return {Object} user profile object containing the entire information about the user.
	* @see Main#signOut for sign out procedure.
	* @public
	* @name Server#getUser
	* @function
	*/
	Server.getUser = function(username){	
		var userFromServer = null;	
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			url : "/native/api/user/"+username,
			beforeSend: function(xhr){
			},
			success: function(user,status,xhr){
				userFromServer = user;
				userFromServer.username = userFromServer.username.split("@")[0];
			},
			statusCode:{			
				401: function(){
					require('mainPage').signOut();
				}
			},	
		});
		return userFromServer;
	};
	
	/**
	* Sends an AJAX request to the server API for updating the current user profile with the specified information.
	* @param {Object} upadateProfileInformation object that carries the user profile information to be updated on the server.
	* The object has to have a predefined structure so after being stringified to JSON object it can be proceed by a server.
	* @return {Object} message object. The message object is either alert-error or alert-success twitter bootstrap alert span 
	* accordingly on the server response.
	* @see Profile#getUserProfileChanges for updateProfileInformation object creation
	* @see FITeagle REST API for more information.
	* @public
	* @name Server#updateUser
	* @function
	*/
	Server.updateUser = function(updateInformation){
		var data = JSON.stringify(updateInformation);
		var user = Utils.getCurrentUser(); 
		var message=0;
		$.ajax({
			cache: false,
			type: "POST",
			async: false,
			url: "/native/api/user/"+user.username,
			data: data,
			contentType: "application/json",
			beforeSend: function(xhr){
			},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
			statusCode:{			
				200: function(){
					var msg = "User has been successfully updated on the server";
					Utils.setCurrentUser(Server.getUser(user.username));
					message = Utils.createSuccessMessage(msg);
					$('#saveProfileInfo').addClass('disabled');
				}
			}
		});
		return message;
	};
	
	/**
	* Sends an AJAX request to the FITeagle REST API for uploading a new public key into the current user profile. 
	* @param {Object} publicKey object. The object has to have predefined structure so it can be evaluated by a server after the function
	* stringifies it to a JSON object.
	* @see PublicKeys#createNewPublicKeyObject for public key object creation.
	* @see FITeagle REST API for more information.
	* @return {String} message object. The message object is either alert-error or alert-success twitter bootstrap alert span 
	* accordingly on the server response.
	* @public
	* @name Server#uploadNewPublicKey
	* @function
	*/
	Server.uploadNewPublicKey = function(publicKey, uploadingSign){
		var user = Utils.getCurrentUser();
		var username = user.username;
		var message="";
		$.ajax({
			cache: false,
			type: "POST",
			async: false,
			url: "/native/api/user/"+username+'/pubkey',
			data: JSON.stringify(publicKey),
			contentType: "application/json",
			beforeSend: function(xhr){
				Utils.unhideElement(uploadingSign);
			},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
			statusCode:{			
				200: function(){
					var updatedUser = Server.getUser(username);
					Utils.setCurrentUser(updatedUser);
					message = Utils.createSuccessMessage("New public key with description: "
																+publicKey.description+
															" has been successfully uploaded");
				}
			},
			complete: function(){
				Utils.hideElement(uploadingSign);
			}
		});	
		
		return message;
	};
	
	/**
	* Sends an AJAX request to the FITeagle REST API for generating a new certificate for a specified public key, that is already exists in a user profile.
	* @param {String} publicKeyDescription is a name of the public key to generate a certificate for.
	* @return {String} generated certificate for the specified public key is returned. 
	* @public
	* @name Server#generateCertificateForPiblicKey
	* @function
	*/
	Server.generateCertificateForPiblicKey = function(publicKeyDescription){
		var username = Utils.getCurrentUser().username;
		var certificate="";
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			url : "/native/api/user/"+username+"/pubkey/"+publicKeyDescription+"/certificate",
			beforeSend: function(xhr){
			},
			success: function(cert,status,xhr){
				certificate = cert;
			},
		});

		return certificate;
	};
	
	/**
	* Sends an AJAX request to the FITeagle REST API for new ssh key pair and a certificate generation.
	* @param  {String} passphrase is a password to be set as a password for the new generated private key
	* @return {Array} privateKey and certificate index 0 and errorMessage index 1 is returned.
	* If the server response message has no error in it then the returned errorMessage is null.
	* @public
	* @name Server#generatePublicKeyAndCertificate 
	* @function
	*/
	Server.generatePublicKeyAndCertificate = function(passphrase){
		var username = Utils.getCurrentUser().username;
		var keyAndCertificate=0;
		var errorMessage="";
		$.ajax({
			cache: false,
			type: "POST",
			async: false,
			url: "/native/api/user/"+username+'/certificate',
			data: passphrase,
			contentType: "text/plain",
			beforeSend: function(xhr){},
			success: function(data,status){
				keyAndCertificate = data;
			},
			error: function(xhl,status){
				errorMessage = xhl.responseText;
			},
			complete: function(){}
		});
		
		return [keyAndCertificate,errorMessage];
	};
	
	/**
	* Sends an AJAX request to the FITeagle REST API for session invalidation on the server side. It is required for signing out a user,
	* that is remembered before by sending the corresponding request to the API.
	* @param {String} username is the name of the user to invalidate the session for.
	* @return {Boolean} true if the session invalidation was successful on the server side, false otherwise
	* @see Server#loginUser for remember me option
	* @see FITeagle REST API
	* @public
	* @name Server#invalidateCookie
	* @function
	*/
	Server.invalidateCookie = function(username){
		if(!username)username = Utils.getCurrentUser().username;
		isSuccessful = false;
		$.ajax({
			cache: false,
			type: "DELETE",
			async: false,
			url : "/native/api/user/"+username+"/cookie",
			success: function(answer,status){
				isSuccessful = true;
			},
		});
		
		return isSuccessful;
	};
	
	/**
	* Sends an AJAX request to the FITeagle REST API for deleting a specified public key from a user profile.
    * @param {String} keyDescription is a public key description to delete from the current user profile
	* @return {Object} message object. The message object is either alert-error or alert-success twitter bootstrap alert span 
	* accordingly on the server response.
	* @public
	* @name Server#deletePublicKey
	* @function
	*/
	Server.deletePublicKey = function(keyDescription){
		var user = Utils.getCurrentUser();
		var username = user.username;
		var message=0;
		$.ajax({
			cache: false,
			type: "DELETE",
			async: false,
			url: "/native/api/user/"+username+'/pubkey/'+keyDescription,
			beforeSend: function(xhr){
			},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
			statusCode:{			
				200: function(){
					var updatedUser = Server.getUser(username);
					Utils.setCurrentUser(updatedUser);
					message = Utils.createSuccessMessage("Public key " + keyDescription+" has been successfully removed.");
				}
			},
			complete: function(){
				Utils.hideElement(uploadingSign);
			}
		});
		
		return message;
	};
	
	
	/**
	* Sends an AJAX request to the FITeagle REST API for renaming of the specified public key to the given new public key description.
	* @param {String} oldKeyDescription is a name of the public key from a user profile to be renamed.
	* @param {String} newKeyDescription is a new public key for description name renaming of the old one.
	* @return {Object} message object. The message object is either alert-error or alert-success twitter bootstrap alert span 
	* accordingly on the server response. 
	* @public 
	* @name Server#renamePublicKey
	* @function
	*/
	Server.renamePublicKey = function(oldKeyDescription, newKeyDescription){
		var user = Utils.getCurrentUser();
		var username = user.username;
		var message=0;
		$.ajax({
			cache: false,
			type: "POST",
			async: false,
			url: "/native/api/user/"+username+'/pubkey/'+oldKeyDescription+'/description',
			data: newKeyDescription,
			contentType: "text/plain",
			beforeSend: function(xhr){
			},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
			statusCode:{			
				200: function(){
					var updatedUser = Server.getUser(username);
					Utils.setCurrentUser(updatedUser);
					message = Utils.createSuccessMessage("Public key " + oldKeyDescription+" has been successfully renamed to: " + newKeyDescription+'.');
				}
			},
		});
		
		return message;
	};
	
	Server.deleteUser = function(username, afterDeleteFunction){
		var message=0;
		$.ajax({
			cache: false,
			type: "DELETE",
			async: false,
			url: "/native/api/user/"+username,
			beforeSend: function(xhr){
				
			},
			success: function(data,status){
				message = Utils.createSuccessMessage('The user has been successfully deleted');
			},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
			statusCode:{			
				200: function(){		
					afterDeleteFunction();
				}
			},
		});
		
		return message;
	};
	
	Server.getAllUsers = function(){
		var usersFromServer = null;
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			url: "/native/api/user/",
			success: function(users,status,xhr){
				$.each(users, function(i, user) {
					user.username = user.username.split("@")[0];
				});
				Utils.setAllUsers(users);
				usersFromServer = users;				
			},
			statusCode:{			
				403: function(){
					require('mainPage').signOut();
				}
			},	
		});
		
		return usersFromServer;
	};
	
	Server.setRole = function(username, role){
		var message=0;
		$.ajax({
			cache: false,
			type: "POST",
			async: false,
			url: "/native/api/user/"+username+'/role/'+role,
			success: function(data,status){
				message = status;
			},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
		});
		
		return message;
	};
	
	Server.createClass = function(newClass){	
		var classJSON = JSON.stringify(newClass);
		var id=0;
		$.ajax({
			cache: false,
			type: "PUT",
			async: false,
			url: "/native/api/class/",
			data: classJSON,
			contentType: "application/json",
			success: function(data,status){
				id = data;
			},
		});
		
		return id;
	};
	
	Server.deleteClass = function(id, afterDeleteFunction){
		var message=0;
		$.ajax({
			cache: false,
			type: "DELETE",
			async: false,
			url: "/native/api/class/"+id,
			success: function(data,status){
				message = Utils.createSuccessMessage('The class has been successfully deleted');
			},
			error: function(xhl,status){
				message = Utils.createErrorMessage(xhl.responseText);
			},
			statusCode:{			
				200: function(){		
					afterDeleteFunction();
				}
			},
		});
		
		return message;
	};
	
	Server.addTask = function(id, task){	
		var newId=0;
		$.ajax({
			cache: false,
			type: "POST",
			async: false,
			data: JSON.stringify(task),
			contentType: "application/json",
			url: "/native/api/class/"+id+"/task",
			success: function(data,status){
				newId = data;
			},
		});
		return newId;
	};
	
	Server.addParticipant = function(id, username){	
		var message=0;
		$.ajax({
			cache: false,
			type: "POST",
			async: false,
			url: "/native/api/user/"+username+"/class/"+id,
			success: function(data,status){
				message = status;
			},
		});
		return message;
	};
	
	Server.deleteParticipant = function(id, username){	
		var message=0;
		$.ajax({
			cache: false,
			type: "DELETE",
			async: false,
			url: "/native/api/user/"+username+"/class/"+id,
			success: function(data,status){
				message = status;
			},
		});
		return message;
	};
	
	Server.getAllClassesFromUser = function(username){
		var classesFromServer = null;
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			url: "/native/api/user/"+username+"/classes",
			beforeSend: function(xhr){
			},
			success: function(classes,status,xhr){
				$.each(classes, function(i, targetClass) {
					$.each(targetClass.participants, function(i, user) {
						user.username = user.username.split("@")[0];
					});
				});
				Utils.setJoinedClasses(classes);
				classesFromServer = classes;				
			},
		});
		
		return classesFromServer;
	};
	
	Server.getAllClassesOwnedByUser = function(username){
		var classesFromServer = null;
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			url: "/native/api/user/"+username+"/ownedclasses",
			beforeSend: function(xhr){
			},
			success: function(classes,status,xhr){
				$.each(classes, function(i, targetClass) {
					$.each(targetClass.participants, function(i, user) {
						user.username = user.username.split("@")[0];
					});
				});
				classesFromServer = classes;				
			},
		});
		
		return classesFromServer;
	};
	
	Server.getAllClasses = function(){
		var classesFromServer = null;
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			url: "/native/api/class/",
			beforeSend: function(xhr){
			},
			success: function(classes,status,xhr){
				$.each(classes, function(i, targetClass) {
					$.each(targetClass.participants, function(i, user) {
						user.username = user.username.split("@")[0];
					});
				});
				Utils.setAllClasses(classes);
				classesFromServer = classes;	
			},
		});
		
		return classesFromServer;
	};
	
	Server.getAllNodes = function(){
		var nodesFromServer = null;
		$.ajax({
			cache: false,
			type: "GET",
			async: false,
			url: "/native/api/node/",
			beforeSend: function(xhr){
			},
			success: function(nodes,status,xhr){
				Utils.setAllNodes(nodes);
				nodesFromServer = nodes;
			},
		});
		
		return nodesFromServer;
	};
	
	Server.addNode = function(node){	
		var nodeJSON = JSON.stringify(node);
		var id=0;
		$.ajax({
			cache: false,
			type: "PUT",
			async: false,
			url: "/native/api/node/",
			data: nodeJSON,
			contentType: "application/json",
			success: function(data,status){
				id = data;
			},
		});
		
		return id;
	};
	
	Server.createOpenstackVM = function(vmName){
		
		var requestTTL = "@prefix fiteagle: <http://fiteagle.org/ontology#> . " +
				"@prefix openstack: <http://fiteagle.org/ontology/adapter/openstack#> ." +
				"@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ." +
				"@prefix : <http://fiteagleinternal#> ." +
				":OpenstackAdapter1 rdf:type openstack:OpenstackAdapter ." +
				":"+vmName+" rdf:type openstack:OpenstackVM ."
		
		var id=0;
		$.ajax({
			cache: false,
			type: "PUT",
			async: false,
			url: "/native/api/resources/OpenstackAdapter1",
			data: requestTTL,
			success: function(data,status){
				console.log(data);
				console.log(status);
				id = data;
			},
		});
		
		return id;
	};
		
	return Server;

});
