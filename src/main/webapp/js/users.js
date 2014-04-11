define(['utils','server'], 
function(Utils,Server){
	
	Users = {};
	
	Users.initForm = function(){
		initUsersAside();
		initUserFields();
	};
	
	initUsersAside = function(){
		var usersHeader = "<h4><i class='fa fa-group fa-lg'></i>Users</h4>";
		var users = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='unifi/#fiteagleusers'><i class='fa fa-minus fa-li'></i>All users</a></li>"));
		
		var testbedsHeader = "<h4><i class='fa fa-sitemap fa-lg'></i>Testbeds</h4>";
		var testbeds = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='unifi/#testbeds'><i class='fa fa-minus fa-li'></i>Testbeds</a></li>","<li><a href='unifi/#addtestbed'><i class='fa fa-plus fa-li'></i>Add testbed</a></li>"));

		$("#homeAside").append($("<div>").addClass("offset1").append(usersHeader,users,testbedsHeader,testbeds));
		createDefaultUserCourse();
	};
	
	initUserFields = function(){
		var users = Server.getAllUsers();
		
		$.each(users, function(i, user) {
			if(user.username != Utils.getCurrentUser().username){
			
				var userRow = $("<tr>").append("<td><b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+") </td>");
				
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
				
				$("#fiteagleusersusers").append(userRow);
			}
		});
	};

	
	return Users;

});
