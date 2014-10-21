define(['utils', 'server'], 
function(Utils, Server){
	
	Nodes = {};
	
	Nodes.init = function(){
		switch(Utils.getCurrentUser().role){
		case "FEDERATION_ADMIN":
			initAllNodesAside();
			initAllNodes(false);
			createAddNodePage();
			break;
		case "NODE_ADMIN":
			createManageNodePage(Utils.getCurrentUser().node.name);
			initNodeAside(Utils.getCurrentUser().node.name);
			break;
		}
	};
	
	initAllNodesAside = function(){
		var nodesHeader = "<h4><i class='fa fa-sitemap fa-lg'></i>Nodes</h4>";
		var nodes = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='#nodes'><i class='fa fa-minus fa-li'></i>All nodes</a></li>","<li><a href='#addnode'><i class='fa fa-plus fa-li'></i>Add node</a></li>"));

		$("#homeAside").append($("<div>").append(nodesHeader,nodes));
	};
	
	createManageNodePage = function(nodename){
		var header = $("<div>").append($("<h3>").html(nodename));
		var subheader = $("<div>").append($("<h4>").html("Manage your node here"));
		var manage_node_page = $("<div>").attr("id", "manage_node").addClass("row-fluid tab-pane").append(header, subheader, $("<hr>"));
		
		$("#desktop").append(manage_node_page);
	}
	
	initNodeAside = function(nodeName){
		var nodesHeader = "<h4><i class='fa fa-sitemap fa-lg'></i>Nodes</h4>";
		var node = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='#manage_node'><i class='fa fa-minus fa-li'></i>"+nodeName+"</a></li>"));
		$("#homeAside").append($("<div>").append(nodesHeader,node));
	};
	
	initAllNodes = function(updateToo){
		$("#allnodes").empty();
		var nodes;
		if(updateToo){
			nodes = Server.getAllNodes();
		}
		else{
			nodes = Utils.getAllNodes();
		}
		
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
	
	createAddNodePage = function(){
		var header = $("<div>").append($("<h3>").html("Add node"));
		var subheader = $("<div>").append($("<h4>").html("Set up connection to a new node"));
		
		var label = $("<label>").addClass("span2").attr("for", "nodeName").html("Name");
		var input = $("<input>").addClass("span8").attr("id", "nodeName").attr("type" ,"text").attr("placeholder", "The name of the node");
		var inputDiv = $("<div>").addClass("row-fluid").append(label, input);
		
		var button = $("<a>").addClass("btn").html("Add").on("click",function(){
			var node = new Object();
			node.name = $("#nodeName").val();
			node.id = Server.addNode(node);
			
			initAllNodes(true);
			$("#nodeName").val('');
			openDesktopTab("#nodes");
		});
		var buttonDiv = $("<div>").addClass("row-fluid").append(button);

		
		
		
		var add_node_page = $("<div>").attr("id", "addnode").addClass("row-fluid tab-pane").append(header, subheader, $("<hr>"), inputDiv, buttonDiv);
		
		$("#desktop").append(add_node_page);
		
		$("#addNodeBtn").on("click",function(){
			var node = new Object();
			node.name = $("#nodeName").val();
			node.id = Server.addNode(node);
			
			initAllNodes(true);
			$("#nodeName").val('');
			openDesktopTab("#nodes");
		});
	};
	
	return Nodes;

});
