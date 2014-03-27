define(['utils','server'], 
function(Utils,Server){
	
	Courses = {};
	
	Courses.init = function(){
		switch(Utils.getCurrentUser().role){
		case "ADMIN":
			break;
		case "TBOWNER":
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
			tb = $("<div>").append("<span>"+courseName1+"</span>",deleteBtn);
			$("#addedTestbeds").append(tb);
		}));
		var course2 = $("<li>").append($("<a>").attr("tabindex",-1).html(courseName2).on("click",function(){
			var tb = "";
			var deleteBtn = $("<button>").addClass("btn").html("Delete").on("click",function(){
				tb.remove();
			});
			tb = $("<div>").append("<span>"+courseName2+"</span>",deleteBtn);
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
			console.log(JSON.stringify(course));	
		});
	};
	
	return Courses;

});
