define(['utils','server'], 
function(Utils,Server){
	
	Users = {};
	
	Users.initForm = function(){
		initUserFields();
	};
	
	initUserFields = function(){
		var users = Server.getAllUsers();
		
		$.each(users, function(i, user) {
			var tr = $("<tr>").append("<td>"+user.username+"</td");
			tr.append("<td><a href='#' class='margin3 btn btn-inverse' onclick='return false;'>Details</a></td>");
			tr.append("<td><a href='#' class='margin3 btn btn-inverse' onclick='return false;'>Delete</a></td>");
//			$('<a>').attr("tabindex",-1).on('click',function(){
//			});
			tr.append("<td><div class='dropdown'><button class='margin3 btn btn-inverse dropdown-toggle' type='button' id='roleDropdown' data-toggle='dropdown'>"+
                    user.role+"</button><ul class='dropdown-menu'><li><a tabindex='-1' href='#' onclick='return false;'>USER</a></li><li><a tabindex='-1' href='#' onclick='return false;'>TBOWNER</a></li><li><a tabindex='-1' href='#' onclick='return false;'>ADMIN</a></li></ul></div></td>");
			$("#fiteagleusersusers").append(tr);
		});
	};

	
	return Users;

});
