define(['utils', 'server'], 
function(Utils, Server){
	
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
			initCreateTaskPage();
			break;
		default:
			createStudentJoinClassPages();
			createAllStudentTaskPages();
			initStudentClassesAside();
			initStudentJoinClass(false);
		}
	};
	
	initCreateClassPage = function(){
		initNodeDropdown();
		initCreateBtn();
	};
	
	var currentClassId = 0;
	
	initCreateTaskPage = function(){
		$("#createTaskBtn").on("click",function(){
			var newTask = new Object();
			newTask.name = $("#inputTaskName").val();
			newTask.description = $("#inputTaskDescription").val();
			
			if(newTask.name == null || newTask.name.length < 1){
				alert("Please enter a task name!");
				return;
			}
			if(newTask.description == null || newTask.description.length < 1){
				alert("Please enter a task description!");
				return;
			}
			
			newTask.id = Server.addTask(currentClassId, newTask);
			
			var taskLink = $("<li>").append($("<a>").attr("href","#classownerTask"+newTask.id).append($("<i>").addClass("fa fa-minus fa-li"), newTask.name).on("click",function(e){
				e.preventDefault();
				openDesktopTab("#classownerTask"+newTask.id);
				//TODO: create this classowner task page
			}));
			
			$("#"+currentClassId+"TaskList").prepend(taskLink);
			
			$("#inputTaskName").val('');
			$("#inputTaskDescription").val('');
		});
	};
	
	initNodeDropdown = function(){
		var nodes = Server.getAllNodes();
		
		$.each(nodes, function(i, node) {
			var nodeItem = $("<li>").append($("<a>").attr("tabindex",-1).html(node.name).on("click",function(){
				var nodeDiv = "";
				var deleteBtn = $("<button>").addClass("btn span4").html("Delete").on("click",function(){
					nodeDiv.remove();
				});
				nodeDiv = $("<div>").addClass("span12 nomargin").append("<span class='span8'>"+node.name+" </span>",deleteBtn).val(node.id);
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
		var allUsers = Utils.getAllUsers();
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
	
	parseOpenstackInstances = function(ttldata, classID){
		var instances = [];
		var parser = N3.Parser();
		parser.parse(ttldata, function(error, triple, prefixes) {
			if(triple) {
				if(triple.predicate === "http://fiteagle.org/ontology/adapter/openstack#id"){
					var posPrefixSubj = triple.subject.indexOf("#");
					var instance = new Object();
					instance.name = triple.subject.slice(posPrefixSubj+1, triple.subject.size);
					instance.id = triple.object.split("\"")[1];
					instances.push(instance);
				}
			}
			else{
				processOpenstackInstances(instances, classID);
			}
		});
		return instances;
	}

	addOpenstackInstanceToTable = function(instance, classID){
		var name = $("<td>").html(instance.name);
		var id = $("<td>").html(instance.id);
		var tableRow = $("<tr>").append(name, id);
		$("#resourcesList"+classID).prepend(tableRow);
	}
	
	processOpenstackInstances = function(instances, classID){
		$.each(instances, function(i, instance) {
			addOpenstackInstanceToTable(instance, classID);
		});
	}
	
	
	createClassResourcesPage = function(newClass){
		var title = $("<div>").append($("<h3>").html(newClass.name),"<hr/>");
		var header = $("<h4>").html("Topology of the resources");
		
		var nameHeader = $("<th>").addClass("span2").html("Name");
		var idHeader = $("<th>").addClass("span7").html("ID");
		var btnHeader = $("<th>").addClass("span3");
		var tableHeader = $("<tr>").append(nameHeader, idHeader, btnHeader);
		var tableHead = $("<thead>").append(tableHeader);
		var table = $("<table>").addClass("span12").append(tableHead);
		
		var tableBody = $("<tbody>").attr("id","resourcesList"+newClass.id);
		
		var inputName = $("<td>").append($("<input>").attr("id", "newInstanceName").attr("placeholder","Enter a name for a new instance"));
		var emptyID = $("<td>");
		var button = $("<td>").append($("<a>").addClass("btn margin3").html("Create").on("click",function(e){
			var name = $("#newInstanceName").val();
			if(name.length > 0){
				Server.createOpenstackVM(name, newClass.id, parseOpenstackInstances);
			}
			$("#newInstanceName").val("");
		}));
		var createRow = $("<tr>").append(inputName, emptyID, button);
		tableBody.append(createRow);
		
		table.append(tableBody);
		
		var page = $("<div>").attr("id","class"+newClass.id+"_resources").addClass("row-fluid tab-pane").append(title, header, $("<br>"), $("<div>").append(table));
		$("#desktop").append(page);
		
		Server.getAllOpenstackVMs(newClass.id, parseOpenstackInstances);
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
			currentClassId = newClass.id;
			openDesktopTab("#createtask");
		}));
		
		var tasks = $("<ul>").addClass("navigationLink fa-ul").attr("id",newClass.id+"TaskList").append(createTaskLink);
		
		if(newClass.tasks != null){
			$.each(newClass.tasks, function(i, task) {		
				var taskLink = $("<li>").append($("<a>").attr("href","#classownerTask"+task.id).append($("<i>").addClass("fa fa-minus fa-li"), task.name).on("click",function(e){
					e.preventDefault();
					openDesktopTab("#classownerTask"+task.id);
					//TODO: create this classowner task page
				}));
				tasks.prepend(taskLink);
			});
		}
		var tasksList =  $("<div>").attr("id",newClass.id+"Tasks").addClass("row-fluid collapse").append(tasks);
		var tasksToggle = $("<li>").append(tasksHeader,tasksList);
		
		var deleteLink = $("<li>").append($("<a>").append($("<i>").addClass("fa fa-trash-o fa-li"),"Delete class").on("click",function(e){
			e.preventDefault();
			Server.deleteClass(newClass.id,function(){
				classElement.remove();
				openDesktopTab("#home");
			});
		}));
		
		var optionList = $("<ul>").addClass("navigationLink fa-ul").append(participantsLink,resourcesLink,tasksToggle,deleteLink);
		var options = $("<div>").attr("id",newClass.id+"Options").addClass("row-fluid collapse").append(optionList);
		
		var classElement = $("<li>").append(header, options);
		$("#tbownerClasses").prepend(classElement);
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
	
	createAllStudentTaskPages = function(){
		$.each(Utils.getJoinedClasses(), function(i, targetClass) {		
			createStudentTaskPagesForClass(targetClass);
		});
	};
	
	createStudentTaskPagesForClass = function(targetClass){
		$.each(targetClass.tasks, function(i, task) {		
			var title = $("<div>").append($("<h3>").html(task.name+" ("+targetClass.name+")"));
			var description = $("<div>").html("Description: "+task.description);
			var labwiki = $("<div>").html("Open a new tab with Labwiki to do the task:");
			var labwikiButton = $("<a>").attr("href", "http://"+window.location.hostname+":4000").attr("target","_blank").append($("<button>").addClass("btn pull-left").html("Labwiki"));
			var labwikiLink = $("<div>").addClass("span3 nomargin").append(labwikiButton);
			var taskTab = $("<div>").attr("id","task"+task.id).addClass("row-fluid tab-pane").append(title, description, $("<br>"), labwiki, labwikiLink);
			$("#desktop").append(taskTab);
		});
	};
	
	createStudentJoinClassPages = function(){
		$.each(Utils.getAllNodes(), function(i, node) {		
			var title = $("<div>").append($("<h3>").html(node.name+" classes"));
			var description = $("<div>").append($("<h4>").html("Chose a class you want to sign up for"));
			var nameHeader = $("<th>").addClass("span3").html("Name");
			var descriptionHeader = $("<th>").addClass("span7").html("Description");
			var btnHeader = $("<th>").addClass("span2");
			var header = $("<tr>").append(nameHeader, descriptionHeader, btnHeader);
			var table = $("<div>").append($("<table>").attr("id","classesList"+node.id).append(header));
			var nodeClassesTab = $("<div>").attr("id","classes"+node.id).addClass("row-fluid tab-pane").append(title, description, $("<hr>"), table);
			$("#desktop").append(nodeClassesTab);
			
			if(node.name == "TU Berlin"){
				$("#tubClassesMapLink").attr("href", "#classes"+node.id);
			}
			if(node.name == "UCT"){
				$("#uctClassesMapLink").attr("href", "#classes"+node.id);
			}
		});
	};
	
	initStudentClassesAside = function(){
		var myClassesList = $("<ul>").attr("id","userClasses").addClass("fa-ul");
		
		var myClassesHeader = "<h4><i class='fa fa-group fa-lg'></i>My classes</h4>";
		
		var allClassesHeader = "<h4><i class='fa fa-group fa-lg'></i>All classes</h4>";
		var allClassesList = $("<ul>").attr("id","userClasses").addClass("fa-ul");
		
		$.each(Utils.getAllNodes(), function(i, node) {		
			var classesLink = $("<a>").attr("href","#classes"+node.id).append($("<i>").addClass("fa fa-minus fa-li"),node.name+" classes");
			var classes = $("<li>").append($("<div>").addClass("navigationLink").append(classesLink));
			allClassesList.append(classes);
		});
		
		$("#homeAside").append($("<div>").append(myClassesHeader,myClassesList,allClassesHeader,allClassesList));
		createAllStudentClassesAsides();
	};
	
	createStudentClassForAsideList = function(newClass){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),newClass.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Tasks").append(name);
		
		var tasksList = $("<ul>").addClass("navigationLink fa-ul");
		$.each(newClass.tasks, function(i, task) {
			var taskLink = $("<li>").append($("<a>").attr("href","#task"+task.id).append($("<i>").addClass("fa fa-minus fa-li"),task.name).on("click",function(e){
				e.preventDefault();
				openDesktopTab("#task"+task.id);
			}));
			tasksList.append(taskLink);
		});
		var tasks = $("<div>").attr("id",newClass.id+"Tasks").addClass("row-fluid collapse").append(tasksList);
		
		var classElement = $("<li>").append(header, tasks);
		$("#userClasses").prepend(classElement);
	};
	
	createAllStudentClassesAsides = function(){
		var joinedClasses = Utils.getJoinedClasses();
		if(joinedClasses != null){
			$.each(joinedClasses, function(i, newClass) {
				createStudentClassForAsideList(newClass);
			});
		}
	};
	
	initStudentJoinClass = function(updateToo){
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
					createStudentClassForAsideList(newClass);
					Server.addParticipant(newClass.id, Utils.getCurrentUser().username);
					createStudentTaskPagesForClass(newClass);
					initStudentJoinClass(true);
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
