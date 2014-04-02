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
		var header = $("<tr>").append($("<td>"),$("<td>"),$("<td>"),$("<td>").html("Task 1"),$("<td>").html("Task 2"),$("<td>").html("Task 3"));
		var users = $("<tr>").append("<td>Max Mustermann</td>","<td><a class='margin3 btn'>Details</a></td>","<td><a class='margin3 btn'>Delete</a></td>","<td class='centered'><i class='fa fa-check-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-check-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>");
		var add = $("<tr>").append("<td><a><i class='fa fa-plus'></i>Add Participant</a></td>");
		var participants = $("<div>").append($("<table>").append(header,users,add));
		
		var page = $("<div>").attr("id","course"+course.id+"_participants").addClass("row-fluid tab-pane").append(title,$("<h4>").html("Participants"),participants);
		$("#desktop").append(page);
	};
	
	createCourseTestbedsPage = function(course){
		var title = $("<div>").append($("<h3>").html(course.name),"<hr/>");
		var testbeds = $("<div>").append($("<table>"));
		$.each(course.testbeds, function(i, tb) {
			var testbed = $("<tr>").append("<td>"+tb.name+"</td>","<td><a class='margin3 btn'>Delete</a></td>");
			testbeds.append(testbed);
		});
		
		var add = $("<tr>").append("<td><a><i class='fa fa-plus'></i>Add Testbed</a></td>");
		testbeds.append(add);
		
		var page = $("<div>").attr("id","course"+course.id+"_testbeds").addClass("row-fluid tab-pane").append(title,$("<h4>").html("Testbeds"),testbeds);
		$("#desktop").append(page);
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
