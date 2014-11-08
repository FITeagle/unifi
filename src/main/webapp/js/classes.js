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
			createCreateClassPage();
			initClassownerClassesAside();
			break;
		default:
			createStudentJoinClassPages();
			createAllStudentTaskPages();
			initStudentClassesAside();
			initStudentJoinClass(true);
		}
	};

	createCreateClassPage = function(){
		var header = $("<h3>").html("Create Class");
		var subheader = $("<h4>").html("Create a new class where users can join");
		
		var labelName = $("<label>").addClass("span2").attr("for", "className").html("Name");
		var inputName = $("<input>").addClass("span8").attr("id", "className").attr("type" ,"text").attr("placeholder", "Chose any name for your class");
		var inputNameDiv = $("<div>").addClass("row-fluid").append(labelName, inputName);
		
		var labelDescription = $("<label>").addClass("span2").attr("for", "classDescription").html("Description");
		var inputDescription = $("<input>").addClass("span8").attr("id", "classDescription").attr("type" ,"text").attr("placeholder", "Write some description e.g. what the aims of the class are");
		var inputDescriptionDiv = $("<div>").addClass("row-fluid").append(labelDescription, inputDescription);
		
		var labelNodes = $("<label>").addClass("span2").attr("for", "addedNodes").html("Nodes");
		var addedNodes = $("<div>").attr("id", "addedNodes").addClass("span4 nomargin");
		
		var span = $("<span>").addClass("caret");
		var button = $("<button>").addClass("nomargin btn dropdown-toggle sr-only").attr("type", "button").attr("data-toggle", "dropdown").html("Available Nodes").prepend(span);
		var list = $("<ul>").attr("id", "availableNodes").addClass("dropdown-menu");
		var availableNodes = $("<div>").addClass("dropdown pull-right").append(button, list);
		var availableNodesDiv = $("<div>").addClass("span4").append(availableNodes);
		
		var nodesDiv = $("<div>").addClass("row-fluid").append(labelNodes, addedNodes, availableNodesDiv);
		
		var createBtn = $("<a>").attr("id", "createClassBtn").addClass("btn").html("Create");
		var createDiv = $("<div>").addClass("row-fluid").append(createBtn);
		
		var outerDiv = $("<div>").attr("style","min-height: 50%").append(inputNameDiv, inputDescriptionDiv, nodesDiv, createDiv);
		
		var createClass_page = $("<div>").attr("id", "createclass").addClass("row-fluid tab-pane").append(header, subheader, $("<hr>"), outerDiv);
		
		$("#desktop").append(createClass_page);
		initNodeDropdown();
		initCreateClassBtn();
	}
	
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
	
	initCreateClassBtn = function(){
		$("#createClassBtn").on("click",function(){
			var newClass = new Object();
			newClass.name = $("#className").val();
			newClass.description = $("#classDescription").val();
			newClass.owner = Utils.getCurrentUser();
			newClass.tasks = [];
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
			
			$("#className").val('');
			$("#classDescription").val('');
			$("#addedNodes").empty();
			initCollapseHeaders();
			$("#"+newClass.id+"Options").collapse('show');
			openDesktopTab("#class"+newClass.id+"_participants");
		});
	};
	
	createCreateTaskPage = function(targetClass){
		var createTask_page = $("<div>").attr("id", "class"+targetClass.id+"_createtask").addClass("row-fluid tab-pane");
		
		var header = $("<h3>").html("Create Task");
		var subheader = $("<h4>").html("Create a new task for the class "+targetClass.name);
		
		var labelName = $("<label>").addClass("span2").attr("for", "inputTaskName").html("Name");
		var inputName = $("<input>").addClass("span8").attr("id", "inputTaskName").attr("type" ,"text").attr("placeholder", "Give the task an appropriate name");
		var inputNameDiv = $("<div>").addClass("row-fluid").append(labelName, inputName);
		
		var labelDescription = $("<label>").addClass("span2").attr("for", "inputTaskDescription").html("Description");
		var inputDescription = $("<input>").addClass("span8").attr("id", "inputTaskDescription").attr("type" ,"text").attr("placeholder", "Describe the task here");
		var inputDescriptionDiv = $("<div>").addClass("row-fluid").append(labelDescription, inputDescription);
		
		createTask_page.append(header, subheader, $("<hr>"), inputNameDiv, inputDescriptionDiv);
		
		var resourcesHeader = $("<h5>").html("Chose the resources which should be available for this task:");
		createTask_page.append(resourcesHeader);
		
		$.each(targetClass.nodes, function(i, node) {
			createTask_page.append($("<h5>").html(node.name+" resources").addClass("span7"));
			createTask_page.append(createResourcesTable(node, null));
		});
		
		var iconCheck = $("<i>").addClass("fa fa-check");
		var iconSpinner = $("<i>").addClass("fa fa-spin fa-spinner fa-lg hidden").attr("id", "createTaskSpinner");
		var button = $("<button>").addClass("btn pull-left span3 nomargin").html("Create Task").prepend(iconCheck).append(iconSpinner).on("click",function(){
			var newTask = new Object();
			newTask.name = inputName.val();
			newTask.description = inputDescription.val();
			
			if(newTask.name == null || newTask.name.length < 1){
				alert("Please enter a task name!");
				return;
			}
			if(newTask.description == null || newTask.description.length < 1){
				alert("Please enter a task description!");
				return;
			}
			
			newTask.id = Server.addTask(targetClass.id, newTask, "createTaskSpinner");
			
			var taskLink = $("<li>").append($("<a>").attr("href","#class"+targetClass.id+"_task"+newTask.id).append($("<i>").addClass("fa fa-minus fa-li"), newTask.name).on("click",function(e){
				e.preventDefault();
				openDesktopTab("#class"+targetClass.id+"_task"+newTask.id);
			}));
			
			$("#"+targetClass.id+"TaskList").prepend(taskLink);
			
			inputName.val('');
			inputDescription.val('');
			createClassOwnerTaskPage(targetClass, newTask);
			
			openDesktopTab("#class"+targetClass.id+"_task"+newTask.id);
		});
		
		createTask_page.append($("<div>").addClass("span12 nomargin").append($("<br>"), $("<br>"), $("<br>"), $("<br>"), button));
		
		$("#desktop").append(createTask_page);
	}
	
	createClassParticipantsPage = function(newClass){
		var title = $("<h3>").html(newClass.name);
		var header = $("<h4>").html("Participants");
		var tableheader = $("<tr>").append($("<td>"),$("<td>"),$("<td>"));
		
		$.each(newClass.tasks, function(i, task) {
			tableheader.append($("<td>").html(task.name));
		});
		
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
		
		var page = $("<div>").attr("id","class"+newClass.id+"_participants").addClass("row-fluid tab-pane").append(title,header, $("<hr>"),participants,"<hr>",addParticipant);
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
		
		var row = $("<tr>").append("<td><b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+")</td>",detailsBtn,deleteUserBtn);
		
		$.each($("#class"+classid+"ParticipantsTable")[0].rows[0].cells, function(i, task) {
			if(i>2){
				row.append($("<td>").addClass("centered").append($("<i>").addClass("fa fa-square-o fa-lg")));
			}
		});
		
		$("#class"+classid+"ParticipantsTable").append(row);
	};
	
	createClassownerClassForAsideList = function(newClass){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),newClass.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Options").append(name);
		
		var participantsLink = $("<li>").append($("<a>").attr("href","#class"+newClass.id+"_participants").append($("<i>").addClass("fa fa-minus fa-li"),"Participants").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#class"+newClass.id+"_participants");
		}));
		
		var tasksHeaderLink = $("<a>").attr("id","tasksToggle").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),"Tasks");
		var tasksHeader = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Tasks").append(tasksHeaderLink);
		var createTaskLink = $("<li>").append($("<a>").attr("href","#class"+newClass.id+"_createtask").append($("<i>").addClass("fa fa-plus fa-li"),"Create task").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#class"+newClass.id+"_createtask");
		}));
		
		var tasks = $("<ul>").addClass("navigationLink fa-ul").attr("id",newClass.id+"TaskList").append(createTaskLink);
		
		if(newClass.tasks != null){
			$.each(newClass.tasks, function(i, task) {		
				var taskLink = $("<li>").append($("<a>").attr("href","#class"+newClass.id+"_task"+task.id).append($("<i>").addClass("fa fa-minus fa-li"), task.name).on("click",function(e){
					e.preventDefault();
					openDesktopTab("#class"+newClass.id+"_task"+task.id);
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
		
		var optionList = $("<ul>").addClass("navigationLink fa-ul").append(participantsLink,tasksToggle,deleteLink);
		var options = $("<div>").attr("id",newClass.id+"Options").addClass("row-fluid collapse").append(optionList);
		
		var classElement = $("<li>").append(header, options);
		$("#tbownerClasses").prepend(classElement);
	};
	
	createClassOwnerTaskPage = function(targetClass, task){
		var taskPage = $("<div>").attr("id", "class"+targetClass.id+"_task"+task.id).addClass("row-fluid tab-pane");
		
		var header = $("<h3>").html(task.name);
		var subheader = $("<h4>").html("Here you can view and edit the task");
		
		var labelName = $("<label>").addClass("span2").attr("for", "inputTaskName").html("Name");
		var inputName = $("<input>").addClass("span8").attr("id", "inputTaskName").attr("type" ,"text").attr("placeholder", task.name);
		var inputNameDiv = $("<div>").addClass("row-fluid").append(labelName, inputName);
		
		var labelDescription = $("<label>").addClass("span2").attr("for", "inputTaskDescription").html("Description");
		var inputDescription = $("<input>").addClass("span8").attr("id", "inputTaskDescription").attr("type" ,"text").attr("placeholder", task.description);
		var inputDescriptionDiv = $("<div>").addClass("row-fluid").append(labelDescription, inputDescription);
		
		taskPage.append(header, subheader, $("<hr>"), inputNameDiv, inputDescriptionDiv);
		
		var resourcesHeader = $("<h5>").html("These resources are currently available for this task:");
		taskPage.append(resourcesHeader);
		
		$.each(targetClass.nodes, function(i, node) {
			//TODO: add amounts
			taskPage.append($("<h5>").html(node.name+" resources").addClass("span7"));
			taskPage.append(createResourcesTable(node, null));
		});
		
		var icon = $("<i>").addClass("fa fa-check");
		var button = $("<button>").addClass("btn pull-left span3 nomargin").html("Update").prepend(icon).on("click",function(){
			alert("Updating tasks not supported yet!")
		});
		
		taskPage.append($("<div>").addClass("span12 nomargin").append($("<br>"), $("<br>"), $("<br>"), $("<br>"), button));
		
		$("#desktop").append(taskPage);
	}
	
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
				createCreateTaskPage(newClass);
				$.each(newClass.tasks, function(i, task) {		
					createClassOwnerTaskPage(newClass, task);
				});
			});
		}
	};
	
	createAllStudentTaskPages = function(){
		$.each(Utils.getJoinedClasses(), function(i, targetClass) {		
			createStudentTaskPagesForClass(targetClass);
		});
	};
	
	createResourcesTable = function(node, task){
		var typeHeader = $("<th>").addClass("span6 alignleft").html("Type");
		var amountHeader = $("<th>").addClass("span1 alignleft").html("Amount");
		var tableHeader = $("<tr>").append(typeHeader, amountHeader);
		var provisionTable = $("<table>").addClass("span7").append(tableHeader);
		if(task != null){
			provisionTable.attr("id","resourcesList"+task.id);
		}
		
		//TODO: make dynamic
		if(node.name === "TU Berlin"){
			var type = $("<td>").html("robot");
			
			var amountButton = $("<button>").addClass("btn dropdown-toggle").attr("data-toggle", "dropdown").append("0", $("<span>").addClass("caret"));
			var amountOption0 = $("<li>").append($('<a>').attr("tabindex",-1).html("0").on('click',function(){
				amountButton.html("0");
			}));
			var amountOption1 = $("<li>").append($('<a>').attr("tabindex",-1).html("1").on('click',function(){
				amountButton.html("1");
			}));
			var amountOptions = $("<ul>").attr("style", "min-width:0").addClass("dropdown-menu").append(amountOption0, amountOption1);
			var amount = $("<td>").addClass("dropdown").append(amountButton, amountOptions);
			
			var tableRow = $("<tr>").append(type, amount);
			provisionTable.append(tableRow);
		}
		if(node.name === "UCT"){
			var type = $("<td>").html("OpenMTC-as-a-Service");
			
			var amountButton = $("<button>").addClass("btn dropdown-toggle").attr("data-toggle", "dropdown").append("0", $("<span>").addClass("caret"));
			var amountOption0 = $("<li>").append($('<a>').attr("tabindex",-1).html("0").on('click',function(){
				amountButton.html("0");
			}));
			var amountOption1 = $("<li>").append($('<a>').attr("tabindex",-1).html("1").on('click',function(){
				amountButton.html("1");
			}));
			var amountOptions = $("<ul>").attr("style", "min-width:0").addClass("dropdown-menu").append(amountOption0, amountOption1);
			var amount = $("<td>").addClass("dropdown").append(amountButton, amountOptions);
			
			var tableRow = $("<tr>").append(type, amount);
			provisionTable.append(tableRow);
		}
		
		return provisionTable;
	}
	
	createConfigureResourcesTable = function(node, task){
		var typeHeader = $("<th>").addClass("span6 alignleft").html("Type");
		var configureHeader = $("<th>").addClass("span6 alignleft");
		var tableHeader = $("<tr>").append(typeHeader, configureHeader);
		var provisionTable = $("<table>").attr("id","resourcesList"+task.id).addClass("span12").append(tableHeader);
		
		//TODO: make dynamic
		if(node.name === "TU Berlin"){
			var type = $("<td>").html("robot (EV3GIP_ROBOT_1)");
			
			var configureButton = $("<button>").addClass("btn").attr("data-toggle","collapse").attr("data-target","#configureResource412").append("Configure", $("<span>").addClass("caret"));
			
			var label1 = $("<td>").addClass("span4").html("MTC URL");
			var input1 = $("<td>").addClass("span7").append($("<input>").addClass("nomargin").attr("type" ,"text").attr("placeholder", "The url of the controlling mtc"));
			var row1 = $("<tr>").append(label1, input1);
			var configureOptions = $("<div>").attr("id","configureResource412").addClass("collapse").append($("<table>").append(row1));
			var configure = $("<td>").addClass("dropdown").append(configureButton, configureOptions);
			
			
			var tableRow = $("<tr>").append(type, configure);
			provisionTable.append(tableRow);
		}
		if(node.name === "UCT"){
			var type = $("<td>").html("OpenMTC-as-a-Service (mtc-2)");
			
			var configureButton = $("<button>").addClass("btn").attr("data-toggle","collapse").attr("data-target","#configureResource323").append("Configure", $("<span>").addClass("caret"));
			
			var label1 = $("<td>").addClass("span4").html("Username");
			var input1 = $("<td>").addClass("span7").append($("<input>").addClass("nomargin").attr("type" ,"text").attr("placeholder", "The username for the mtc instance"));
			var row1 = $("<tr>").append(label1, input1);
			var label2 = $("<td>").addClass("span4").html("Password");
			var input2 = $("<td>").addClass("span7").append($("<input>").addClass("nomargin").attr("type" ,"password").attr("placeholder", "The password for the mtc instance"));
			var row2 = $("<tr>").append(label2, input2);
			var configureOptions = $("<div>").attr("id","configureResource323").addClass("collapse").append($("<table>").append(row1, row2));
			var configure = $("<td>").addClass("dropdown").append(configureButton, configureOptions);
			
			var tableRow = $("<tr>").append(type, configure);
			provisionTable.append(tableRow);
		}
		
		return provisionTable;
	}
	
	createStudentTaskPagesForClass = function(targetClass){
		$.each(targetClass.tasks, function(i, task) {
			
			var title = $("<h3>").html(task.name+" ("+targetClass.name+")");
			var description = "Description: "+task.description;
			
			var provisionContent = $("<div>").attr("id","provision"+task.id).addClass("collapse in");
			$.each(targetClass.nodes, function(i, node) {
				provisionContent.append($("<h5>").html(node.name+" resources").addClass("span7 left0"));
				provisionContent.append(createResourcesTable(node, task));
			});
			
			var provisionButton = $("<a>").addClass("btn margin3").html("Provision selected resources").on("click",function(e){
				provisionContent.collapse('hide');
				$.each(targetClass.nodes, function(i, node) {
					configureContent.append($("<h5>").html(node.name+" resources").addClass("span12"));
					configureContent.append(createConfigureResourcesTable(node, task));
				});
				configureContent.append(configureButton);
				configureContent.collapse('show');
			});
			
			provisionContent.append($("<div>").addClass("span12 nomargin").append($("<br>"), $("<br>"), $("<br>"), $("<br>"), provisionButton));
			 
			var provisionHeader = $("<div>").attr("data-toggle","collapse").attr("data-target","#provision"+task.id).addClass("pointer").append($("<h4>").html("Provision"));

			
			var configureHeader = $("<div>").attr("data-toggle","collapse").attr("data-target","#configure"+task.id).addClass("pointer").append($("<h4>").html("Configure"));
			
			var configureButton = $("<a>").addClass("btn margin3").html("Configure").on("click",function(e){
				provisionContent.collapse('hide');
				configureContent.collapse('hide');
				runContent.collapse('show');
			});
			
			var configureContent = $("<div>").attr("id","configure"+task.id).addClass("collapse");
			
			
			var labwikiHeader = $("<div>").html("Open a new tab with Labwiki to do the task:");
			var labwikiButton = $("<a>").attr("href", "http://"+window.location.hostname+":4000").attr("target","_blank").append($("<button>").addClass("btn pull-left").html("Labwiki"));
			var labwikiLink = $("<div>").addClass("span3 nomargin").append(labwikiButton);
			
			var runHeader = $("<div>").attr("data-toggle","collapse").attr("data-target","#run"+task.id).addClass("pointer").append($("<h4>").html("Run experiment"));
			var runContent = $("<div>").attr("id","run"+task.id).addClass("collapse").append(labwikiHeader, labwikiLink);
			
			
			var content = $("<div>").append($("<hr>"), provisionHeader, $("<hr>"), provisionContent, $("<br>"), configureHeader, $("<hr>"), configureContent, $("<br>"), runHeader, $("<hr>"), runContent);
			var taskTab = $("<div>").attr("id","task"+task.id).addClass("row-fluid tab-pane").append(title, description, content);
			$("#desktop").append(taskTab);
			
//			Server.getAllOpenstackVMs(task.id, parseOpenstackInstances);
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
	
	parseOpenstackInstances = function(ttldata, classID){
		var resources = [];
		var openstackVMs = [];
		var parser = N3.Parser();
		parser.parse(ttldata, function(error, triple, prefixes) {
			if(triple) {
				var name = Utils.getLocalName(triple.subject);
				var resource = $.grep(resources, function(res){ return res.name === name; })[0];
				
				if(resource == null){
					resource = new Object();
					resource.name = name;
					var node = new Object();
					node.namespace = Utils.getNameSpace(triple.subject);
					resource.node = node;
					resources.push(resource);
				}
				
				if(triple.predicate === "http://open-multinet.info/ontology/resource/openstackvm#id"){
					resource.id = triple.object.split("\"")[1];
				}
				if(triple.predicate === "http://open-multinet.info/ontology/resource/openstackvm#status"){
					resource.status = triple.object.split("\"")[1];
				}
				if(triple.predicate === "http://open-multinet.info/ontology/resource/openstackvm#image"){
					var image = new Object();
					image.name = Utils.getLocalName(triple.object);
					resource.image = image;
				}
				if(triple.predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"){
					resource.type = triple.object;
				}
			}
			else{
				$.each(resources, function(i, resource) {
					if(resource != null && resource.type === "http://open-multinet.info/ontology/resource/openstackvm#OpenstackVM"){
						var imageResult = $.grep(resources, function(res){ return res.name === resource.image.name; });
						resource.image.id = imageResult[0].id;
						openstackVMs.push(resource);
						
						var nodes = Utils.getAllNodes();
						var nodeResult = $.grep(nodes, function(n){ return n.namespace === resource.node.namespace; });
						resource.node.name = nodeResult[0].name;
						resource.node.id = nodeResult[0].id;
					}
				});
				processOpenstackInstances(openstackVMs, classID);
			}
		});
		return;
	}

	addOpenstackInstanceToTable = function(instance, classID){
		var type = $("<td>").html(Utils.getLocalName(instance.type));
		var amount = $("<td>");
		var tableRow = $("<tr>").append(type, amount);
		$("#resourcesList"+classID).append(tableRow);
	}
	
	processOpenstackInstances = function(instances, classID){
		$.each(instances, function(i, instance) {
			addOpenstackInstanceToTable(instance, classID);
		});
	}
	
	createStudentClassForAsideList = function(newClass){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),newClass.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Tasks").append(name);
		
		var classOptions = $("<ul>").addClass("navigationLink fa-ul");
		$.each(newClass.tasks, function(i, task) {
			var taskLink = $("<li>").append($("<a>").attr("href","#task"+task.id).append($("<i>").addClass("fa fa-minus fa-li"),task.name).on("click",function(e){
				e.preventDefault();
				openDesktopTab("#task"+task.id);
			}));
			classOptions.append(taskLink);
		});
		
		var leaveClassLink = $("<li>").append($("<a>").append($("<i>").addClass("fa fa-trash-o fa-li"), "Leave class").on("click",function(e){
			e.preventDefault();
			Server.deleteParticipant(newClass.id, Utils.getCurrentUser().username);
			Server.getAllClassesFromUser(Utils.getCurrentUser().username);
			classElement.remove();
		}));
		classOptions.append(leaveClassLink);
		
		var tasks = $("<div>").attr("id",newClass.id+"Tasks").addClass("row-fluid collapse").append(classOptions);
		
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
