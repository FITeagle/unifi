define(['utils','server'], 
function(Utils,Server){
	
	Courses = {};
	
	Courses.init = function(){
		switch(Utils.getCurrentUser().role){
		case "ADMIN":
			break;
		case "TBOWNER":
			initAdminCoursesAside();
			initCreateCoursePage();
			break;
		default:
			initUserCoursesAside();
			initAddCourse();
		}
	};
	
	initCreateCoursePage = function(){
		initTbDropdown();
		initCreateBtn();
	};
	
	initTbDropdown = function(){
		var tbName1 = "FUSECO Playground";
		var tbName2 = "UCT Testbed";
		var course1 = $("<li>").append($("<a>").attr("tabindex",-1).html(tbName1).on("click",function(){
			var tb = "";
			var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
				tb.remove();
			});
			tb = $("<div>").append("<span>"+tbName1+" </span>",deleteBtn);
			$("#addedTestbeds").append(tb);
		}));
		var course2 = $("<li>").append($("<a>").attr("tabindex",-1).html(tbName2).on("click",function(){
			var tb = "";
			var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
				tb.remove();
			});
			tb = $("<div>").append("<span>"+tbName2+" </span>",deleteBtn);
			$("#addedTestbeds").append(tb);
		}));
		$("#availableTestbeds").append(course1,course2);
	};
	
	var idCount = 0;
	
	initCreateBtn = function(){
		$("#createCourseBtn").on("click",function(){
			var course = new Object();
			course.id = idCount++;
			course.name = $("#courseName").val();
			course.description = $("#courseDescripion").val();
			course.testbeds = [];
			$.each($("#addedTestbeds").children(), function(i, tb) {
				var testbed = new Object();
				testbed.name = tb.children[0].innerHTML;
				course.testbeds.push(testbed);
			});
			//TODO: persist course
			console.log(JSON.stringify(course));	

			createAdminCourseForAsideList(course);
			
			createCourseParticipantsPage(course);
			createCourseTestbedsPage(course);
			
			$("#courseName").val('');
			$("#courseDescripion").val('');
			$("#addedTestbeds").empty();
			initCollapseHeaders();
			openDesktopTab("#course"+course.id+"_participants");
		});
	};
	
	createCourseParticipantsPage = function(course){
		var title = $("<div>").append($("<h3>").html(course.name),"<hr/>");
		var header = $("<h4>").html("Participants");
		var tableheader = $("<tr>").append($("<td>"),$("<td>"),$("<td>"),$("<td>").html("Task 1"),$("<td>").html("Task 2"),$("<td>").html("Task 3"));
		var participants = $("<div>").append($("<table>").attr("id","course"+course.id+"ParticipantsTable").append(tableheader));
		
		var addheader = $("<h4>").html("Add participant");
		var ul = $('<ul>').addClass("dropdown-menu");
		var allUsers = Server.getAllUsers();
		$.each(allUsers, function(i, user) {
			if(user.role == "USER"){
				var userdropdownOption = $("<li>").append($('<a>').attr("tabindex",-1).html(user.username).on('click',function(){
					$("#usersDropdown"+course.id).html("<b>"+user.username+"</b> ("+user.firstName+" "+user.lastName+")");
				}));
				ul.append(userdropdownOption);
			}
		});
		var dropdown = $("<div>").addClass("dropdown").attr("style","margin-bottom:"+25*allUsers.length+"px");
		dropdown.append("<button class='btn dropdown-toggle' type='button' id='usersDropdown"+course.id+"' data-toggle='dropdown'>Available users</button>");
		var addBtn = $("<button>").addClass("btn margin3").html("Add").on('click',function(){
			if($("#usersDropdown"+course.id).html() != "Available users"){
				createParticipantRow(course.id,$("#usersDropdown"+course.id).html());
			}
		});
		dropdown.append(ul,addBtn);
		var addParticipant = $("<div>").append(addheader,dropdown);
		
		var page = $("<div>").attr("id","course"+course.id+"_participants").addClass("row-fluid tab-pane").append(title,header,participants,"<hr>",addParticipant);
		$("#desktop").append(page);
		
		//TODO: add real participants
		createParticipantRow(course.id,"<b>max</b> (Max Musterman)");
	};
	
	createParticipantRow = function(courseid,userData){
		var deleteUserBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Delete").on('click',function(){
			//TODO: delete from server
			row.remove();
		}));
		var row = $("<tr>").append("<td>"+userData+"</td>","<td><a class='margin3 btn'>Details</a></td>",deleteUserBtn,"<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>");
		$("#course"+courseid+"ParticipantsTable").append(row);
	};
	
	createCourseTestbedsPage = function(course){
		var title = $("<div>").append($("<h3>").html(course.name),"<hr/>");
		var testbedsHeader = $("<h4>").html("Testbeds");
		var testbeds = $("<div>").append($("<table>").attr("id","course"+course.id+"TestbedsTable"));
		
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
				$("#testbedsDropdown"+course.id).html(tb.name);
			}));
			ul.append(tbdropdownOption);
		});
		var dropdown = $("<div>").addClass("dropdown").attr("style","margin-bottom:"+35*allTestbeds.length+"px");
		dropdown.append("<button class='btn dropdown-toggle' type='button' id='testbedsDropdown"+course.id+"' data-toggle='dropdown'>Available testbeds</button>");
		var addBtn = $("<button>").addClass("btn margin3").html("Add").on('click',function(){
			if($("#testbedsDropdown"+course.id).html() != "Available testbeds"){
				createTestbedRow(course.id,$("#testbedsDropdown"+course.id).html());
			}
		});
		dropdown.append(ul,addBtn);
		var addTestbed = $("<div>").append(addheader,dropdown);
		
		var page = $("<div>").attr("id","course"+course.id+"_testbeds").addClass("row-fluid tab-pane").append(title,testbedsHeader,testbeds,"<hr>",addTestbed);
		$("#desktop").append(page);
		
		$.each(course.testbeds, function(i, tb) {
			createTestbedRow(course.id,tb.name);
		});
	};
	
	createTestbedRow = function(courseid,tbname){
		var deleteTestbedBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Delete").on('click',function(){
			//TODO: delete from server
			row.remove();
		}));
		var row = $("<tr>").append("<td>"+tbname+"</td>",deleteTestbedBtn);
		$("#course"+courseid+"TestbedsTable").append(row);
	};
	
	createAdminCourseForAsideList = function(course){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),course.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+course.id+"Options").append(name);
		
		var participantsLink = $("<li>").append($("<a>").attr("href","unifi/#course"+course.id+"_participants").append($("<i>").addClass("fa fa-minus fa-li"),"Participants").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#course"+course.id+"_participants");
		}));
		var testbedsLink = $("<li>").append($("<a>").attr("href","unifi/#course"+course.id+"_testbeds").append($("<i>").addClass("fa fa-minus fa-li"),"Testbeds").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#course"+course.id+"_testbeds");
		}));
		
		var tasksHeaderLink = $("<a>").attr("id","tasksToggle").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),"Tasks");
		var tasksHeader = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+course.id+"Tasks").append(tasksHeaderLink);
		var createTaskLink = $("<li>").append($("<a>").attr("href","unifi/#createtask").append($("<i>").addClass("fa fa-plus fa-li"),"Create task").on("click",function(e){
			e.preventDefault();
			$("#homeAside").fadeOut(200, function(){
				$("#taskAsides").fadeIn(200);
				openDesktopTab("#createtask");
			});
		}));
		var tasks = $("<ul>").addClass("navigationLink fa-ul").append(createTaskLink);
		var tasksList =  $("<div>").attr("id",course.id+"Tasks").addClass("row-fluid collapse out").append(tasks);
		var tasksToggle = $("<li>").append(tasksHeader,tasksList);
		
		var deleteLink = $("<li>").append($("<a>").append($("<i>").addClass("fa fa-trash-o fa-li"),"Delete course").on("click",function(e){
			e.preventDefault();
			//TODO: delete from server
			courseElement.remove();
			openDesktopTab("#home");
		}));
		
		var optionList = $("<ul>").addClass("navigationLink fa-ul").append(participantsLink,testbedsLink,tasksToggle,deleteLink);
		var options = $("<div>").attr("id",course.id+"Options").addClass("row-fluid collapse out").append(optionList);
		
		var courseElement = $("<li>").append(header, options);
		$("#tbownerCourses").prepend(courseElement);
	};
	
	createUserCourseForAsideList = function(course){
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),course.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+course.id+"Tasks").append(name);
		
		var taskLink1 = $("<li>").append($("<a>").attr("href","unifi/#task").append($("<i>").addClass("fa fa-minus fa-li"),"First Task").on("click",function(e){
			e.preventDefault();
			$("#homeAside").fadeOut(200, function(){
				$("#taskAsides").fadeIn(200);
				openDesktopTab("#task");
			});
		}));
		var tasksList = $("<ul>").addClass("navigationLink fa-ul").append(taskLink1);
		var tasks = $("<div>").attr("id",course.id+"Tasks").addClass("row-fluid collapse out").append(tasksList);
		
		var courseElement = $("<li>").append(header, tasks);
		$("#userCourses").prepend(courseElement);
	};
	
	
	initAdminCoursesAside = function(){
		var list = $("<ul>").attr("id","tbownerCourses").addClass("fa-ul");
		
		var createCourseLink = $("<a>").attr("href","unifi/#createcourse").append($("<i>").addClass("fa fa-plus fa-li"),"Create Course").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#createcourse");
		});
		var createCourse =  $("<li>").append($("<div>").addClass("navigationLink").append(createCourseLink));
		list.append(createCourse);
		
		var header = "<h4><i class='fa fa-group fa-lg'></i>Courses</h4>";
		$("#homeAside").append($("<div>").addClass("offset1").append(header,list));
		createDefaultAdminCourse();
	};
	
	initUserCoursesAside = function(){
		var list = $("<ul>").attr("id","userCourses").addClass("fa-ul");
		
		var addCourseLink = $("<a>").attr("href","unifi/#addcourse").append($("<i>").addClass("fa fa-plus fa-li"),"Add course").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#addcourse");
		});
		var addCourse = $("<li>").append($("<div>").addClass("navigationLink").append(addCourseLink));
		list.append(addCourse);
		
		var header = "<h4><i class='fa fa-group fa-lg'></i>Courses</h4>";
		$("#homeAside").append($("<div>").addClass("offset1").append(header,list));
		createDefaultUserCourse();
	};
	
	createDefaultAdminCourse = function(){
		var course = new Object();
		course.name = "OpenEPC QoS";
		course.id = idCount++;
		course.testbeds = [];
		createAdminCourseForAsideList(course);
		createCourseParticipantsPage(course);
		createCourseTestbedsPage(course);
	};
	
	createDefaultUserCourse = function(){
		var course = new Object();
		course.name = "OpenEPC QoS";
		course.id = idCount++;
		course.testbeds = [];
		createUserCourseForAsideList(course);
	};
	
	
	initAddCourse = function(){
		var allCourses = [];
		var course1 = new Object();
		course1.name = "OpenMTC Intro";
		course1.description = "This course is an intro to OpenMTC.";
		course1.id = idCount++;
		allCourses.push(course1);
		var course2 = new Object();
		course2.name = "OpenIMS Development";
		course2.description = "This course is about OpenIMS Development. It has a longer description where it explains what it is about and why.";
		course2.id = idCount++;
		allCourses.push(course2);
		
		$.each(allCourses, function(i, course) {
			var signUpBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Sign up").on("click",function(e){
				e.preventDefault();
				createUserCourseForAsideList(course);
				courseElement.remove();
				initCollapseHeaders();
			}));
			var courseElement = $("<tr>").append("<td>"+course.name+"</td>","<td>"+course.description+"</td>",signUpBtn);
			$("#addCourseCourses").append(courseElement);
		});
	};
	
	
	return Courses;

});
