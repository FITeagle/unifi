define(['utils','server'], 
function(Utils,Server){
	
	Nodes = {};
	
	Nodes.init = function(){
		switch(Utils.getCurrentUser().role){
		case "FEDERATION_ADMIN":
			initAllNodesAside();
			initAllNodes();
			initAddNode();
			break;
		case "NODE_ADMIN":
			initNodeAside(Utils.getCurrentUser().node.name);
			break;
		}
	};
	
	initAllNodesAside = function(){
		var nodesHeader = "<h4><i class='fa fa-sitemap fa-lg'></i>Nodes</h4>";
		var nodes = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='#nodes'><i class='fa fa-minus fa-li'></i>All nodes</a></li>","<li><a href='#addnode'><i class='fa fa-plus fa-li'></i>Add node</a></li>"));

		$("#homeAside").append($("<div>").append(nodesHeader,nodes));
	};
	
	initNodeAside = function(nodeName){
		var nodesHeader = "<h4><i class='fa fa-sitemap fa-lg'></i>Nodes</h4>";
		var node = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='#manage_node'><i class='fa fa-minus fa-li'></i>"+nodeName+"</a></li>"));
		$("#nodeName").html(nodeName);
		$("#homeAside").append($("<div>").append(nodesHeader,node));
	};
	
	initAllNodes = function(){
		$("#allnodes").empty();
		var nodes = Utils.getAllNodes();
		
		$.each(nodes, function(i, node) {
			var nodename = $("<td>").html(node.name);
			var nodestatus = $("<td>").html("Up");
			var deleteBtn = $("<td>").append($("<a>").addClass("margin3 btn").html("Delete").on("click",function(){
				alert("deleting nodes not supported yet");
			}));
			var nodeitem = $("<tr>").append(nodename, nodestatus, deleteBtn);
			$("#allnodes").append(nodeitem);
		});
	};
	
	initAddNode = function(){
		$("#addNodeBtn").on("click",function(){
			var node = new Object();
			node.name = $("#nodeName").val();
			node.id = Server.addNode(node);
			
			initAllNodes();
			$("#nodeName").val('');
			openDesktopTab("#nodes");
		});
	};
	
	return Nodes;

});
