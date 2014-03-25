define(['utils','server'], 
function(Utils,Server){
	
	Users = {};
	
	Users.initForm = function(){
		initUserFields();
	};
	
	initUserFields = function(){
		var users = Server.getAllUsers();
		
		$.each(users, function(i, user) {
			var userRow = $("<tr>").append("<td>"+user.username+"</td");
			
			var getUser = $('<a>').addClass("margin3 btn btn-inverse").html("Details").on("click", function(){
				alert(JSON.stringify(Server.getUser(user.username)));
			});
			userRow.append($('<td>').append(getUser));
			
			var deleteUser = $('<a>').addClass("margin3 btn btn-inverse").html("Delete").on("click", function(){
				deleteRow = function(){
					userRow.remove();
				};
				Server.deleteUser(user.username, deleteRow);
				
			});
			userRow.append($('<td>').append(deleteUser));
			
			
			var dropdown = $('<div>').addClass("dropdown");
			dropdown.append("<button class='margin3 btn btn-inverse dropdown-toggle' type='button' id='roleDropdown"+user.username+"' data-toggle='dropdown'>"+user.role+"</button>");
						
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
		});
	};

	
	return Users;

});
