define(['utils','server','classes'], 
function(Utils,Server,Classes){
	
	Users = {};
	
	Users.initForm = function(){
		initUsersAside();
		initUserFields();
	};
	
	initUsersAside = function(){
		var usersHeader = "<h4><i class='fa fa-group fa-lg'></i>Users</h4>";
		var users = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='unifi/#allusers'><i class='fa fa-minus fa-li'></i>All users</a></li>"));
		
		var nodesHeader = "<h4><i class='fa fa-sitemap fa-lg'></i>Nodes</h4>";
		var nodes = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='unifi/#nodes'><i class='fa fa-minus fa-li'></i>All nodes</a></li>","<li><a href='unifi/#addnode'><i class='fa fa-plus fa-li'></i>Add node</a></li>"));

		$("#homeAside").append($("<div>").addClass("offset1").append(usersHeader,users,nodesHeader,nodes));
	};
	
	initUserFields = function(){
		var users = Server.getAllUsers();
		
		$.each(users, function(i, user) {
			
			var userRow = $("<tr>").append("<td><b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+") </td>");
			
			if(user.username != Utils.getCurrentUser().username){
				
				var getUser = $('<a>').addClass("margin3 btn").html("Details").on("click", function(){
					alert(JSON.stringify(Server.getUser(user.username)));
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
				ul.append(dropdownOptionFEDERATION_ADMIN);
				ul.append(dropdownOptionNODE_ADMIN);
				dropdown.append(ul);
				
				userRow.append($('<td>').append(dropdown));
			}
			
			$("#allusersusers").append(userRow);
			
		});
	};

	
	return Users;

});
