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
	
	initCreateBtn = function(){
		$("#createCourseBtn").on("click",function(){
			var course = new Object();
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

			$("#tbownerCourses").prepend(createCourseForAsideList(course));
			//TODO: open right page
			openDesktopTab("#courseparticipants");
			
		});
	};
	
	createCourseForAsideList = function(course){
		var courseID = course.name.split(" ").join("_");
		
		var name = $("<a>").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),course.name);
		var header = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+courseID+"Options").append(name);
		
		var participantsLink = $("<li>").append($("<a>").attr("href","unifi/#courseparticipants").append($("<i>").addClass("fa fa-minus fa-li"),"Participants").on("click",function(e){
			e.preventDefault();
//			history.pushState("#courseparticipants", "page #courseparticipants", "/#courseparticipants");
			openDesktopTab("#courseparticipants");
		}));
		var testbedsLink = $("<li>").append($("<a>").attr("href","unifi/#coursetestbeds").append($("<i>").addClass("fa fa-minus fa-li"),"Testbeds").on("click",function(e){
			e.preventDefault();
//			history.pushState("#coursetestbeds", "page #coursetestbeds", "/#coursetestbeds");
			openDesktopTab("#coursetestbeds");
		}));
		
		var tasksHeaderLink = $("<a>").attr("id","tasksToggle").append($("<i>").addClass("collapseSign fa fa-caret-right fa-li"),"Tasks");
		var tasksHeader = $("<div>").addClass("collapseHeader").attr("data-toggle","collapse").attr("data-target","#"+courseID+"Tasks").append(tasksHeaderLink);
		var createTaskLink = $("<li>").append($("<a>").attr("href","unifi/#createtask").append($("<i>").addClass("fa fa-plus fa-li"),"Create task").on("click",function(e){
			e.preventDefault();
			$("#homeAside").fadeOut(200, function(){
				$("#taskAsides").fadeIn(200);
//				history.pushState("#createtask", "page #createtask", "/#createtask");
				openDesktopTab("#createtask");
			});
		}));
		var tasks = $("<ul>").addClass("navigationLink fa-ul").append(createTaskLink);
		var tasksList =  $("<div>").attr("id",courseID+"Tasks").addClass("row-fluid collapse out").append(tasks);
		var tasksToggle = $("<li>").append(tasksHeader,tasksList);
		
		var deleteLink = $("<li>").append($("<a>").append($("<i>").addClass("fa fa-trash-o fa-li"),"Delete course"));

		var optionList = $("<ul>").addClass("navigationLink fa-ul").append(participantsLink,testbedsLink,tasksToggle,deleteLink);
		var options = $("<div>").attr("id",courseID+"Options").addClass("row-fluid collapse out").append(optionList);
		
		var courseElement = $("<li>").append(header, options);
		return courseElement;
	};
	
	
	initCoursesAside = function(){
		var list = $("<ul>").attr("id","tbownerCourses").addClass("fa-ul");
		var course = new Object();
		course.name = "OpenEPC QoS";
		list.append(createCourseForAsideList(course));
		
		var createCourseLink = $("<a>").attr("href","unifi/#createcourse").append($("<i>").addClass("fa fa-plus fa-li"),"Create Course").on("click",function(e){
			e.preventDefault();
//			history.pushState("#createcourse", "page #createcourse", "/#createcourse");
			openDesktopTab("#createcourse");
		});
		var createCourseDiv = $("<div>").addClass("navigationLink").append(createCourseLink);
		var createCourse = $("<li>").append("<i class='fa fa-plus fa-li'></i>",createCourseDiv);
		list.append(createCourse);
		
		var header = "<h4><i class='fa fa-group fa-lg'></i>Courses</h4>";
		$("#homeAside").append($("<div>").addClass("offset1").append(header,list));
	};
	
	return Courses;

});
