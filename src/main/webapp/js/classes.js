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
			initAdminClassesAside();
			initCreateClassPage();
			break;
		default:
			initUserClassesAside();
			initAddClass();
		}
	};
	
	initCreateClassPage = function(){
		initNodeDropdown();
		initCreateBtn();
	};
	
	initNodeDropdown = function(){
		var nodeName1 = "FUSECO Playground";
		var nodeName2 = "UCT Testbed";
		var class1 = $("<li>").append($("<a>").attr("tabindex",-1).html(nodeName1).on("click",function(){
			var node = "";
			var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
				node.remove();
			});
			node = $("<div>").append("<span>"+nodeName1+" </span>",deleteBtn);
			$("#addedNodes").append(node);
		}));
		var class2 = $("<li>").append($("<a>").attr("tabindex",-1).html(nodeName2).on("click",function(){
			var node = "";
			var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
				node.remove();
			});
			node = $("<div>").append("<span>"+nodeName2+" </span>",deleteBtn);
			$("#addedNodes").append(node);
		}));
		$("#availableNodes").append(class1,class2);
	};
	
	var idCount = 0;
	
	initCreateBtn = function(){
		$("#createClassBtn").on("click",function(){
			var newClass = new Object();
			newClass.name = $("#className").val();
			newClass.description = $("#classDescripion").val();
			newClass.owner = Utils.getCurrentUser();
			newClass.nodes = [];
			$.each($("#addedNodes").children(), function(i, tb) {
				var node = new Object();
				node.name = tb.children[0].innerHTML;
				newClass.nodes.push(node);
			});
			
			newClass.id = Server.createClass(newClass);
			
			createAdminClassForAsideList(newClass);
			
			createClassParticipantsPage(newClass);
			createClassTestbedsPage(newClass);
			
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
		var allUsers = Server.getAllUsers();
		$.each(allUsers, function(i, user) {
			if(user.role == "USER"){
				var userdropdownOption = $("<li>").append($('<a>').attr("tabindex",-1).html(user.username).on('click',function(){
					$("#usersDropdown"+newClass.id).html("<b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+")");
				}));
				ul.append(userdropdownOption);
			}
		});
		var dropdown = $("<div>").addClass("dropdown").attr("style","margin-bottom:"+25*allUsers.length+"px");
		dropdown.append("<button class='btn dropdown-toggle' type='button' id='usersDropdown"+newClass.id+"' data-toggle='dropdown'>Available users</button>");
		var addBtn = $("<button>").addClass("btn margin3").html("Add").on('click',function(){
			if($("#usersDropdown"+newClass.id).html() != "Available users"){
				createParticipantRow(newClass.id,$("#usersDropdown"+newClass.id).html());
			}
		});
		dropdown.append(ul,addBtn);
		var addParticipant = $("<div>").append(addheader,dropdown);
		
		var page = $("<div>").attr("id","class"+newClass.id+"_participants").addClass("row-fluid tab-pane").append(title,header,participants,"<hr>",addParticipant);
		$("#desktop").append(page);
		
		//TODO: add real participants
		createParticipantRow(newClass.id,"<b>max</b> (Max Musterman)");
	};
	
	createParticipantRow = function(classid,userData){
		var deleteUserBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Delete").on('click',function(){
			//TODO: delete from server
			row.remove();
		}));
		var row = $("<tr>").append("<td>"+userData+"</td>","<td><a class='margin3 btn'>Details</a></td>",deleteUserBtn,"<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>");
		$("#class"+classid+"ParticipantsTable").append(row);
	};
	
	createClassTestbedsPage = function(newClass){
		var title = $("<div>").append($("<h3>").html(newClass.name),"<hr/>");
		var testbedsHeader = $("<h4>").html("Testbeds");
		var testbeds = $("<div>").append($("<table>").attr("id","class"+newClass.id+"TestbedsTable"));
		
		var addheader = $("<h4>").html("Add testbed");
		var ul = $('<ul>').addClass("dropdown-menu");
		var allTestbeds = [];
		tb1 = new Object();
		tb1.name = "UCT Testbed";
		tb2 = new Object();
		tb2.name = "FUSECO Playground";
		allTestbeds.push(tb1,tb2);
		$.each(allTestbeds, function(i, tb) {
			var tbdropdownOption = $("<li>").append($('<a>').attr("tabindex",-1).html(tb.name).on('click',function(){
				$("#testbedsDropdown"+newClass.id).html(tb.name);
			}));
			ul.append(tbdropdownOption);
		});
		var dropdown = $("<div>").addClass("dropdown").attr("style","margin-bottom:"+35*allTestbeds.length+"px");
		dropdown.append("<button class='btn dropdown-toggle' type='button' id='testbedsDropdown"+newClass.id+"' data-toggle='dropdown'>Available testbeds</button>");
		var addBtn = $("<button>").addClass("btn margin3").html("Add").on('click',function(){
			if($("#testbedsDropdown"+newClass.id).html() != "Available testbeds"){
				createTestbedRow(newClass.id,$("#testbedsDropdown"+newClass.id).html());
			}
		});
		dropdown.append(ul,addBtn);
		var addTestbed = $("<div>").append(addheader,dropdown);
		
		var page = $("<div>").attr("id","class"+newClass.id+"_testbeds").addClass("row-fluid tab-pane").append(title,testbedsHeader,testbeds,"<hr>",addTestbed);
		$("#desktop").append(page);
		
		$.each(newClass.nodes, function(i, tb) {
			createTestbedRow(newClass.id,tb.name);
		});
	};
	
	createTestbedRow = function(classid,tbname){
		var deleteTestbedBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Delete").on('click',function(){
			//TODO: delete from server
			row.remove();
		}));
		var row = $("<tr>").append("<td>"+tbname+"</td>",deleteTestbedBtn);
		$("#class"+classid+"TestbedsTable").append(row);
	};
	
	createAdminClassForAsideList = function(newClass){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),newClass.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Options").append(name);
		
		var participantsLink = $("<li>").append($("<a>").attr("href","unifi/#class"+newClass.id+"_participants").append($("<i>").addClass("fa fa-minus fa-li"),"Participants").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#class"+newClass.id+"_participants");
		}));
		var testbedsLink = $("<li>").append($("<a>").attr("href","unifi/#class"+newClass.id+"_testbeds").append($("<i>").addClass("fa fa-minus fa-li"),"Testbeds").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#class"+newClass.id+"_testbeds");
		}));
		
		var tasksHeaderLink = $("<a>").attr("id","tasksToggle").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),"Tasks");
		var tasksHeader = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Tasks").append(tasksHeaderLink);
		var createTaskLink = $("<li>").append($("<a>").attr("href","unifi/#createtask").append($("<i>").addClass("fa fa-plus fa-li"),"Create task").on("click",function(e){
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
		
		var optionList = $("<ul>").addClass("navigationLink fa-ul").append(participantsLink,testbedsLink,tasksToggle,deleteLink);
		var options = $("<div>").attr("id",newClass.id+"Options").addClass("row-fluid collapse out").append(optionList);
		
		var classElement = $("<li>").append(header, options);
		$("#tbownerClasses").prepend(classElement);
	};
	
	createUserClassForAsideList = function(newClass){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),newClass.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+newClass.id+"Tasks").append(name);
		
		var taskLink1 = $("<li>").append($("<a>").attr("href","unifi/#task").append($("<i>").addClass("fa fa-minus fa-li"),"First Task").on("click",function(e){
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
	
	
	initAdminClassesAside = function(){
		var list = $("<ul>").attr("id","tbownerClasses").addClass("fa-ul");
		
		var createClassLink = $("<a>").attr("href","unifi/#createclass").append($("<i>").addClass("fa fa-plus fa-li"),"Create Class").on("click",function(e){
			e.preventDefault();
			openDesktopTab("unifi/#createclass");
		});
		var createClass =  $("<li>").append($("<div>").addClass("navigationLink").append(createClassLink));
		list.append(createClass);
		
		var header = "<h4><i class='fa fa-group fa-lg'></i>Classes</h4>";
		$("#homeAside").append($("<div>").addClass("offset1").append(header,list));
		createDefaultAdminClass();
	};
	
	initUserClassesAside = function(){
		var myClassesList = $("<ul>").attr("id","userClasses").addClass("fa-ul");
		
		var myClassesHeader = "<h4><i class='fa fa-group fa-lg'></i>My classes</h4>";
		
		var allClassesHeader = "<h4><i class='fa fa-group fa-lg'></i>All classes</h4>";
		var allClassesList = $("<ul>").attr("id","userClasses").addClass("fa-ul");
		
		var uctClassesLink = $("<a>").attr("href","unifi/#uctclasses").append($("<i>").addClass("fa fa-minus fa-li"),"UCT classes").on("click",function(e){
			e.preventDefault();
			openDesktopTab("unifi/#uctclasses");
		});
		var uctClasses = $("<li>").append($("<div>").addClass("navigationLink").append(uctClassesLink));
		var tubClassesLink = $("<a>").attr("href","unifi/#uctclasses").append($("<i>").addClass("fa fa-minus fa-li"),"TUB classes").on("click",function(e){
			e.preventDefault();
			openDesktopTab("unifi/#uctclasses");
		});
		var tubClasses = $("<li>").append($("<div>").addClass("navigationLink").append(tubClassesLink));
		allClassesList.append(uctClasses, tubClasses);
		
		$("#homeAside").append($("<div>").addClass("offset1").append(myClassesHeader,myClassesList,allClassesHeader,allClassesList));
		createAllUserClassesAsides();
	};
	
	createDefaultAdminClass = function(){
		var newClass = new Object();
		newClass.name = "OpenEPC QoS";
		newClass.id = idCount++;
		newClass.nodes = [];
		createAdminClassForAsideList(newClass);
		createClassParticipantsPage(newClass);
		createClassTestbedsPage(newClass);
	};
	
	createAllUserClassesAsides = function(){
		var newClass = new Object();
		newClass.name = "OpenEPC QoS";
		newClass.id = idCount++;
		newClass.nodes = [];
		createUserClassForAsideList(newClass);
		
		var allClasses = Server.getAllClassesFromUser(Utils.getCurrentUser().username);
		if(allClasses != null){
			$.each(allClasses, function(i, newClass) {
				createUserClassForAsideList(newClass);
			});
		}
	};
	
	
	initAddClass = function(){
		var allClasses = Server.getAllClasses();
		
		$.each(allClasses, function(i, newClass) {
			var signUpBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Sign up").on("click",function(e){
				e.preventDefault();
				createUserClassForAsideList(newClass);
				Server.addParticipant(newClass.id, Utils.getCurrentUser().username);
				classElement.remove();
				initCollapseHeaders();
			}));
			var classElement = $("<tr>").append("<td>"+newClass.name+"</td>","<td>"+newClass.description+"</td>",signUpBtn);
			$("#uctClassClasses").append(classElement);
		});
	};
	
	
	return Classes;

});
