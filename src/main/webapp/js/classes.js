define(['utils','server'], 
function(Utils,Server){
	
	Classes = {};
	
	Classes.init = function(){
		switch(Utils.getCurrentUser().role){
		case "FEDERATION_ADMIN":
			break;
		case "NODE_ADMIN":
			break;
		case "CLASSOWNER":
			initClassownerClassesAside();
			initCreateClassPage();
			break;
		default:
			initUserClassesAside();
			initAddClass(false);
		}
	};
	
	initCreateClassPage = function(){
		initNodeDropdown();
		initCreateBtn();
	};
	
	initNodeDropdown = function(){
		var nodes = Server.getAllNodes();
		
		$.each(nodes, function(i, node) {
			var nodeItem = $("<li>").append($("<a>").attr("tabindex",-1).html(node.name).on("click",function(){
				var nodeDiv = "";
				var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
					nodeDiv.remove();
				});
				nodeDiv = $("<div>").append("<span>"+node.name+" </span>",deleteBtn).val(node.id);
				$("#addedNodes").append(nodeDiv);
			}));
			$("#availableNodes").append(nodeItem);
		});
	};
	
	initCreateBtn = function(){
		$("#createClassBtn").on("click",function(){
			var newClass = new Object();
			newClass.name = $("#className").val();
			newClass.description = $("#classDescripion").val();
			newClass.owner = Utils.getCurrentUser();
			newClass.nodes = [];
			$.each($("#addedNodes").children(), function(i, nodeItem) {
				var node = new Object();
				node.name = nodeItem.children[0].innerHTML;
				node.id = nodeItem.value;
				newClass.nodes.push(node);
			});
			
			newClass.id = Server.createClass(newClass);
			
			createClassownerClassForAsideList(newClass);
			
			createClassParticipantsPage(newClass);
			createClassResourcesPage(newClass);
			
			$("#className").val('');
			$("#classDescripion").val('');
			$("#addedNodes").empty();
			initCollapseHeaders();
			openDesktopTab("#class"+newClass.id+"_participants");
		});
	};
	
	createClassParticipantsPage = function(newClass){
		var title = $("<div>").append($("<h3>").html(newClass.name),"<hr/>");
		var header = $("<h4>").html("Participants");
		var tableheader = $("<tr>").append($("<td>"),$("<td>"),$("<td>"),$("<td>").html("Task 1"),$("<td>").html("Task 2"),$("<td>").html("Task 3"));
		var participants = $("<div>").append($("<table>").attr("id","class"+newClass.id+"ParticipantsTable").append(tableheader));
		
		var addheader = $("<h4>").html("Add participant");
		var ul = $('<ul>').addClass("dropdown-menu");
		
		var participantsUsernames = [];
		if(newClass.participants != null){
			$.each(newClass.participants, function(i, user) {
				participantsUsernames.push(user.username);
			});
		}
		var currentlyChosenUser = null;
		var allUsers = Server.getAllUsers();
		$.each(allUsers, function(i, user) {
			if(user.role == "STUDENT" && ($.inArray(user.username, participantsUsernames) == -1)){
				var userdropdownOption = $("<li>").append($('<a>').attr("tabindex",-1).html(user.username).on('click',function(){
					currentlyChosenUser = user;
					$("#usersDropdown"+newClass.id).html("<b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+")");
				}));
				ul.append(userdropdownOption);
			}
		});
		var dropdown = $("<div>").addClass("dropdown").attr("style","margin-bottom:"+25*allUsers.length+"px");
		dropdown.append("<button class='btn dropdown-toggle' type='button' id='usersDropdown"+newClass.id+"' data-toggle='dropdown'>Available users</button>");
		var addBtn = $("<button>").addClass("btn margin3").html("Add").on('click',function(){
			if(currentlyChosenUser != null){
				createParticipantRow(newClass.id,currentlyChosenUser);
				Server.addParticipant(newClass.id, currentlyChosenUser.username);
				currentlyChosenUser = null;
			}
		});
		dropdown.append(ul,addBtn);
		var addParticipant = $("<div>").append(addheader,dropdown);
		
		var page = $("<div>").attr("id","class"+newClass.id+"_participants").addClass("row-fluid tab-pane").append(title,header,participants,"<hr>",addParticipant);
		$("#desktop").append(page);
		
		if(newClass.participants != null){
			$.each(newClass.participants, function(i, user) {
				createParticipantRow(newClass.id,user);
			});
		}
	};
	
	createParticipantRow = function(classid,user){
		var deleteUserBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Delete").on('click',function(){
			if(Server.deleteParticipant(classid, user.username) == "success"){
				row.remove();
			}			
		}));
		var detailsBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Details").on('click',function(){
			Utils.showUserModal(Server.getUser(user.username));			
		}));
		
		var row = $("<tr>").append("<td><b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+")</td>",detailsBtn,deleteUserBtn,"<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>");
		$("#class"+classid+"ParticipantsTable").append(row);
	};
	
	createClassResourcesPage = function(newClass){
		var title = $("<div>").append($("<h3>").html(newClass.name),"<hr/>");
		var header = $("<h4>").html("Topology of the resources");
		
		var page = $("<div>").attr("id","class"+newClass.id+"_resources").addClass("row-fluid tab-pane").append(title,header);
		$("#desktop").append(page);
	};
	
	createClassownerClassForAsideList = function(newClass){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),newClass.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Options").append(name);
		
		var participantsLink = $("<li>").append($("<a>").attr("href","#class"+newClass.id+"_participants").append($("<i>").addClass("fa fa-minus fa-li"),"Participants").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#class"+newClass.id+"_participants");
		}));
		var resourcesLink = $("<li>").append($("<a>").attr("href","#class"+newClass.id+"_resources").append($("<i>").addClass("fa fa-minus fa-li"),"Resources").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#class"+newClass.id+"_resources");
		}));
		
		var tasksHeaderLink = $("<a>").attr("id","tasksToggle").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),"Tasks");
		var tasksHeader = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Tasks").append(tasksHeaderLink);
		var createTaskLink = $("<li>").append($("<a>").attr("href","#createtask").append($("<i>").addClass("fa fa-plus fa-li"),"Create task").on("click",function(e){
			e.preventDefault();
			$("#homeAside").fadeOut(200, function(){
				$("#taskAsides").fadeIn(200);
				openDesktopTab("#createtask");
			});
		}));
		var tasks = $("<ul>").addClass("navigationLink fa-ul").append(createTaskLink);
		var tasksList =  $("<div>").attr("id",newClass.id+"Tasks").addClass("row-fluid collapse out").append(tasks);
		var tasksToggle = $("<li>").append(tasksHeader,tasksList);
		
		var deleteLink = $("<li>").append($("<a>").append($("<i>").addClass("fa fa-trash-o fa-li"),"Delete class").on("click",function(e){
			e.preventDefault();
			Server.deleteClass(newClass.id,function(){
				classElement.remove();
				openDesktopTab("#home");
			});
		}));
		
		var optionList = $("<ul>").addClass("navigationLink fa-ul").append(participantsLink,resourcesLink,tasksToggle,deleteLink);
		var options = $("<div>").attr("id",newClass.id+"Options").addClass("row-fluid collapse out").append(optionList);
		
		var classElement = $("<li>").append(header, options);
		$("#tbownerClasses").prepend(classElement);
	};
	
	createUserClassForAsideList = function(newClass){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),newClass.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Tasks").append(name);
		
		var taskLink1 = $("<li>").append($("<a>").attr("href","#task").append($("<i>").addClass("fa fa-minus fa-li"),"First Task").on("click",function(e){
			e.preventDefault();
			$("#homeAside").fadeOut(200, function(){
				$("#taskAsides").fadeIn(200);
				openDesktopTab("#task");
			});
		}));
		var tasksList = $("<ul>").addClass("navigationLink fa-ul").append(taskLink1);
		var tasks = $("<div>").attr("id",newClass.id+"Tasks").addClass("row-fluid collapse out").append(tasksList);
		
		var classElement = $("<li>").append(header, tasks);
		$("#userClasses").prepend(classElement);
	};
	
	
	initClassownerClassesAside = function(){
		var list = $("<ul>").attr("id","tbownerClasses").addClass("fa-ul");
		
		var createClassLink = $("<a>").attr("href","#createclass").append($("<i>").addClass("fa fa-plus fa-li"),"Create Class").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#createclass");
		});
		var createClass =  $("<li>").append($("<div>").addClass("navigationLink").append(createClassLink));
		list.append(createClass);
		
		var header = "<h4><i class='fa fa-group fa-lg'></i>Classes</h4>";
		$("#homeAside").append($("<div>").append(header,list));
		createAllClassownerClassesAsides();
	};
	
	initUserClassesAside = function(){
		var myClassesList = $("<ul>").attr("id","userClasses").addClass("fa-ul");
		
		var myClassesHeader = "<h4><i class='fa fa-group fa-lg'></i>My classes</h4>";
		
		var allClassesHeader = "<h4><i class='fa fa-group fa-lg'></i>All classes</h4>";
		var allClassesList = $("<ul>").attr("id","userClasses").addClass("fa-ul");
		
		$.each(Utils.getAllNodes(), function(i, node) {		
			var classesLink = $("<a>").attr("href","#classes"+node.id).append($("<i>").addClass("fa fa-minus fa-li"),node.name+" classes").on("click",function(e){
				e.preventDefault();
				openDesktopTab("#classes"+node.id);
			});
			var classes = $("<li>").append($("<div>").addClass("navigationLink").append(classesLink));
			allClassesList.append(classes);
		});
		
		$("#homeAside").append($("<div>").append(myClassesHeader,myClassesList,allClassesHeader,allClassesList));
		createAllUserClassesAsides();
	};
	
	createAllClassownerClassesAsides = function(){
		var allClasses = Server.getAllClassesOwnedByUser(Utils.getCurrentUser().username);
		if(allClasses != null){
			$.each(allClasses, function(i, newClass) {
				createClassownerClassForAsideList(newClass);
				createClassParticipantsPage(newClass);
				createClassResourcesPage(newClass);
			});
		}
	};
	
	createAllUserClassesAsides = function(){
		var joinedClasses = Utils.getJoinedClasses();
		if(joinedClasses != null){
			$.each(joinedClasses, function(i, newClass) {
				createUserClassForAsideList(newClass);
			});
		}
	};
	
	initAddClass = function(updateToo){
		$.each(Utils.getAllNodes(), function(i, node) {	
			$("#classesList"+node.id).empty();
		});
		var allClasses;
		var joinedClasses;
		if(updateToo){
			allClasses = Server.getAllClasses();
			joinedClasses = Server.getAllClassesFromUser(Utils.getCurrentUser().username);
		}
		else{
			allClasses = Utils.getAllClasses();
			joinedClasses = Utils.getJoinedClasses();
		}
		$.each(allClasses, function(i, newClass) {
			var alreadyJoined = 0;
			$.each(joinedClasses, function(i, joinedClass) {
				if(joinedClass.id == newClass.id){
					alreadyJoined = 1;
				}
			});
			if(alreadyJoined == 0){
				var signUpBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Sign up").on("click",function(e){
					e.preventDefault();
					createUserClassForAsideList(newClass);
					Server.addParticipant(newClass.id, Utils.getCurrentUser().username);
					initAddClass(true);
					initCollapseHeaders();
				}));
				var classElement = $("<tr>").append("<td>"+newClass.name+"</td>","<td>"+newClass.description+"</td>",signUpBtn);
				
				$.each(newClass.nodes, function(i, node) {	
					$("#classesList"+node.id).append(classElement.clone(true));
				});
				
			}
		});
	};
	
	return Classes;

});
