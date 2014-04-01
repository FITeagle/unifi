define(['utils','server'], 
function(Utils,Server){
	
	Courses = {};
	
	Courses.init = function(){
		switch(Utils.getCurrentUser().role){
		case "ADMIN":
			break;
		case "TBOWNER":
			initCoursesAside();
			initCreateCoursePage();
			break;
		default:
			
		}
	};
	
	initCreateCoursePage = function(){
		initTbDropdown();
		initCreateBtn();
	};
	
	initTbDropdown = function(){
		var courseName1 = "FUSECO Playground";
		var courseName2 = "UCT Testbed";
		var course1 = $("<li>").append($("<a>").attr("tabindex",-1).html(courseName1).on("click",function(){
			var tb = "";
			var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
				tb.remove();
			});
			tb = $("<div>").append("<span>"+courseName1+" </span>",deleteBtn);
			$("#addedTestbeds").append(tb);
		}));
		var course2 = $("<li>").append($("<a>").attr("tabindex",-1).html(courseName2).on("click",function(){
			var tb = "";
			var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
				tb.remove();
			});
			tb = $("<div>").append("<span>"+courseName2+" </span>",deleteBtn);
			$("#addedTestbeds").append(tb);
		}));
		$("#availableTestbeds").append(course1,course2);
	};
	
	var idCount = 0;
	
	initCreateBtn = function(){
		$("#createCourseBtn").on("click",function(){
			var course = new Object();
			course.id = idCount++;
			course.name = $("#testbedName").val();
			course.description = $("#testbedDescripion").val();
			course.testbeds = [];
			$.each($("#addedTestbeds").children(), function(i, tb) {
				var testbed = new Object();
				testbed.name = tb.children[0].innerHTML;
				course.testbeds.push(testbed);
			});
			//TODO: persist course
			console.log(JSON.stringify(course));	

			createCourseForAsideList(course);
			
			createCourseParticipantsPage(course);
			createCourseTestbedsPage(course);
			
			$("#testbedName").val('');
			$("#testbedDescripion").val('');
			$("#addedTestbeds").empty();
			initCollapseHeaders();
			openDesktopTab("#course"+course.id+"_participants");
		});
	};
	
	createCourseParticipantsPage = function(course){
		var title = $("<div>").append($("<h3>").html(course.name),"<hr/>");
		var header = $("<tr>").append($("<td>"),$("<td>"),$("<td>"),$("<td>").html("Task 1"),$("<td>").html("Task 2"),$("<td>").html("Task 3"));
		var users = $("<tr>").append("<td>Max Mustermann</td>","<td><a class='margin3 btn'>Details</a></td>","<td><a class='margin3 btn'>Delete</a></td>","<td class='centered'><i class='fa fa-check-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-check-square-o fa-lg'></i></td>","<td class='centered'><i class='fa fa-square-o fa-lg'></i></td>");
		var add = $("<tr>").append("<td><a class='black'><i class='fa fa-plus'></i>Add Participant</a></td>");
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
		
		var add = $("<tr>").append("<td><a class='black'><i class='fa fa-plus'></i>Add Testbed</a></td>");
		testbeds.append(add);
		
		var page = $("<div>").attr("id","course"+course.id+"_testbeds").addClass("row-fluid tab-pane").append(title,$("<h4>").html("Testbeds"),testbeds);
		$("#desktop").append(page);
	};
	
	
	createCourseForAsideList = function(course){
		var courseID = course.name.split(" ").join("_");
		
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),course.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+courseID+"Options").append(name);
		
		var participantsLink = $("<li>").append($("<a>").attr("href","unifi/#course"+course.id+"_participants").append($("<i>").addClass("fa fa-minus fa-li"),"Participants").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#course"+course.id+"_participants");
		}));
		var testbedsLink = $("<li>").append($("<a>").attr("href","unifi/#course"+course.id+"_testbeds").append($("<i>").addClass("fa fa-minus fa-li"),"Testbeds").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#course"+course.id+"_testbeds");
		}));
		
		var tasksHeaderLink = $("<a>").attr("id","tasksToggle").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),"Tasks");
		var tasksHeader = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+courseID+"Tasks").append(tasksHeaderLink);
		var createTaskLink = $("<li>").append($("<a>").attr("href","unifi/#createtask").append($("<i>").addClass("fa fa-plus fa-li"),"Create task").on("click",function(e){
			e.preventDefault();
			$("#homeAside").fadeOut(200, function(){
				$("#taskAsides").fadeIn(200);
				openDesktopTab("#createtask");
			});
		}));
		var tasks = $("<ul>").addClass("navigationLink fa-ul").append(createTaskLink);
		var tasksList =  $("<div>").attr("id",courseID+"Tasks").addClass("row-fluid collapse out").append(tasks);
		var tasksToggle = $("<li>").append(tasksHeader,tasksList);
		
		var deleteLink = $("<li>").append($("<a>").append($("<i>").addClass("fa fa-trash-o fa-li"),"Delete course").on("click",function(e){
			e.preventDefault();
			//TODO: delete from server
			courseElement.remove();
			openDesktopTab("#home");
		}));
		
		var optionList = $("<ul>").addClass("navigationLink fa-ul").append(participantsLink,testbedsLink,tasksToggle,deleteLink);
		var options = $("<div>").attr("id",courseID+"Options").addClass("row-fluid collapse out").append(optionList);
		
		var courseElement = $("<li>").append(header, options);
		$("#tbownerCourses").prepend(courseElement);
	};
	
	
	initCoursesAside = function(){
		var list = $("<ul>").attr("id","tbownerCourses").addClass("fa-ul");
		
		var createCourseLink = $("<a>").attr("href","unifi/#createcourse").append($("<i>").addClass("fa fa-plus fa-li"),"Create Course").on("click",function(e){
			e.preventDefault();
			openDesktopTab("#createcourse");
		});
		var createCourseDiv = $("<div>").addClass("navigationLink").append(createCourseLink);
		var createCourse = $("<li>").append("<i class='fa fa-plus fa-li'></i>",createCourseDiv);
		list.append(createCourse);
		
		var header = "<h4><i class='fa fa-group fa-lg'></i>Courses</h4>";
		$("#homeAside").append($("<div>").addClass("offset1").append(header,list));
		createDefaultCourse();
	};
	
	createDefaultCourse = function(){
		var course = new Object();
		course.name = "OpenEPC QoS";
		course.id = idCount++;
		course.testbeds = [];
		createCourseForAsideList(course);
		createCourseParticipantsPage(course);
		createCourseTestbedsPage(course);
	};
	
	return Courses;

});
