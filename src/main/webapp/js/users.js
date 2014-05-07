define(['utils','server','classes'], 
function(Utils,Server,Classes){
	
	Users = {};
	
	Users.init = function(){
		switch(Utils.getCurrentUser().role){
		case "FEDERATION_ADMIN":
			initUsersAside("All");
			initUserFieldsFedAdmin();
			break;
		case "NODE_ADMIN":
			initUsersAside("TUB"); //TODO: dynamic node
			initUserFieldsNodeAdmin();
			break;
		}
		
	};
	
	initUsersAside = function(nodeName){
		var usersHeader = "<h4><i class='fa fa-group fa-lg'></i>Users</h4>";
		var users = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='#allusers'><i class='fa fa-minus fa-li'></i>"+nodeName+" users</a></li>"));
		
		$("#homeAside").append($("<div>").append(usersHeader,users));
	};
	
	initUserFieldsFedAdmin = function(){
		var users = Server.getAllUsers();
		
		$.each(users, function(i, user) {
			
			var userRow = $("<tr>").append("<td><b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+") </td>");
			
			if(user.username != Utils.getCurrentUser().username){
				
				var getUser = $('<a>').addClass("margin3 btn").html("Details").on("click", function(){
					Utils.showSuccessModal(JSON.stringify(Server.getUser(user.username),null,' '));
				});
				userRow.append($('<td>').append(getUser));
				
				var deleteUser = $('<a>').addClass("margin3 btn").html("Delete").on("click", function(){
					deleteRow = function(){
						userRow.remove();
					};
					Server.deleteUser(user.username, deleteRow);
					
				});
				userRow.append($('<td>').append(deleteUser));
			
				var dropdown = $('<div>').addClass("dropdown");
				dropdown.append("<button class='margin3 btn dropdown-toggle' type='button' id='roleDropdown"+user.username+"' data-toggle='dropdown'>"+user.role+"</button>");
							
				var setRoleSTUDENT = $('<a>').attr("tabindex",-1).html("STUDENT").on('click',function(){
					if(Server.setRole(user.username, "STUDENT") == "success"){
						$(document.getElementById("roleDropdown"+user.username)).html("STUDENT");
					}
				});
				var setRoleCLASSOWNER = $('<a>').attr("tabindex",-1).html("CLASSOWNER").on('click',function(){
					if(Server.setRole(user.username, "CLASSOWNER") == "success"){
						$(document.getElementById("roleDropdown"+user.username)).html("CLASSOWNER");
					}
				});
				var setRoleFEDERATION_ADMIN = $('<a>').attr("tabindex",-1).html("FEDERATION_ADMIN").on('click',function(){
					if(Server.setRole(user.username, "FEDERATION_ADMIN") == "success"){
						$(document.getElementById("roleDropdown"+user.username)).html("FEDERATION_ADMIN");
					}
				});
				var setRoleNODE_ADMIN = $('<a>').attr("tabindex",-1).html("NODE_ADMIN").on('click',function(){
					if(Server.setRole(user.username, "NODE_ADMIN") == "success"){
						$(document.getElementById("roleDropdown"+user.username)).html("NODE_ADMIN");
					}
				});
				var dropdownOptionSTUDENT = $('<li>').append(setRoleSTUDENT);
				var dropdownOptionCLASSOWNER = $('<li>').append(setRoleCLASSOWNER);
				var dropdownOptionFEDERATION_ADMIN = $('<li>').append(setRoleFEDERATION_ADMIN);
				var dropdownOptionNODE_ADMIN = $('<li>').append(setRoleNODE_ADMIN);
				var ul = $('<ul>').addClass("dropdown-menu");
				ul.append(dropdownOptionSTUDENT);
				ul.append(dropdownOptionCLASSOWNER);
				ul.append(dropdownOptionNODE_ADMIN);
				ul.append(dropdownOptionFEDERATION_ADMIN);
				dropdown.append(ul);
				
				userRow.append($('<td>').append(dropdown));
			}
			
			$("#allusersusers").append(userRow);
			
		});
	};
	
	initUserFieldsNodeAdmin = function(){
		var users = Server.getAllUsers(); //TODO: get only users from node
		
		$.each(users, function(i, user) {
			
			if(user.role != "FEDERATION_ADMIN"){
			
				var userRow = $("<tr>").append("<td><b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+") </td>");
				
				if(user.username != Utils.getCurrentUser().username){
					
					var getUser = $('<a>').addClass("margin3 btn").html("Details").on("click", function(){
						Utils.showSuccessModal(JSON.stringify(Server.getUser(user.username),null,' '));
					});
					userRow.append($('<td>').append(getUser));
					
					var deleteUser = $('<a>').addClass("margin3 btn").html("Delete").on("click", function(){
						deleteRow = function(){
							userRow.remove();
						};
						Server.deleteUser(user.username, deleteRow);
						
					});
					userRow.append($('<td>').append(deleteUser));
				
					var dropdown = $('<div>').addClass("dropdown");
					dropdown.append("<button class='margin3 btn dropdown-toggle' type='button' id='roleDropdown"+user.username+"' data-toggle='dropdown'>"+user.role+"</button>");
								
					var setRoleSTUDENT = $('<a>').attr("tabindex",-1).html("STUDENT").on('click',function(){
						if(Server.setRole(user.username, "STUDENT") == "success"){
							$(document.getElementById("roleDropdown"+user.username)).html("STUDENT");
						}
					});
					var setRoleCLASSOWNER = $('<a>').attr("tabindex",-1).html("CLASSOWNER").on('click',function(){
						if(Server.setRole(user.username, "CLASSOWNER") == "success"){
							$(document.getElementById("roleDropdown"+user.username)).html("CLASSOWNER");
						}
					});
					var setRoleNODE_ADMIN = $('<a>').attr("tabindex",-1).html("NODE_ADMIN").on('click',function(){
						if(Server.setRole(user.username, "NODE_ADMIN") == "success"){
							$(document.getElementById("roleDropdown"+user.username)).html("NODE_ADMIN");
						}
					});
					var dropdownOptionSTUDENT = $('<li>').append(setRoleSTUDENT);
					var dropdownOptionCLASSOWNER = $('<li>').append(setRoleCLASSOWNER);
					var dropdownOptionNODE_ADMIN = $('<li>').append(setRoleNODE_ADMIN);
					var ul = $('<ul>').addClass("dropdown-menu");
					ul.append(dropdownOptionSTUDENT);
					ul.append(dropdownOptionCLASSOWNER);
					ul.append(dropdownOptionNODE_ADMIN);
					dropdown.append(ul);
					
					userRow.append($('<td>').append(dropdown));
				}
			
				$("#allusersusers").append(userRow);
			}
			
		});
	};


	
	return Users;

});
