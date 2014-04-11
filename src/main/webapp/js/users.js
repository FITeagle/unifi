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
							
				var setRoleUSER = $('<a>').attr("tabindex",-1).html("USER").on('click',function(){
					if(Server.setRole(user.username, "USER") == "success"){
						$(document.getElementById("roleDropdown"+user.username)).html("USER");
					}
				});
				var setRoleTBOWNER = $('<a>').attr("tabindex",-1).html("TBOWNER").on('click',function(){
					if(Server.setRole(user.username, "TBOWNER") == "success"){
						$(document.getElementById("roleDropdown"+user.username)).html("TBOWNER");
					}
				});
				var setRoleADMIN = $('<a>').attr("tabindex",-1).html("ADMIN").on('click',function(){
					if(Server.setRole(user.username, "ADMIN") == "success"){
						$(document.getElementById("roleDropdown"+user.username)).html("ADMIN");
					}
				});
				var dropdownOptionUSER = $('<li>').append(setRoleUSER);
				var dropdownOptionTBOWNER = $('<li>').append(setRoleTBOWNER);
				var dropdownOptionADMIN = $('<li>').append(setRoleADMIN);
				var ul = $('<ul>').addClass("dropdown-menu");
				ul.append(dropdownOptionUSER);
				ul.append(dropdownOptionTBOWNER);
				ul.append(dropdownOptionADMIN);
				dropdown.append(ul);
				
				userRow.append($('<td>').append(dropdown));
				
				$("#fiteagleusersusers").append(userRow);
			}
		});
	};

	
	return Users;

});
