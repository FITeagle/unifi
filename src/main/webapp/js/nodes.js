define(['utils','server'], 
function(Utils,Server){
	
	Nodes = {};
	
	Nodes.init = function(){
		switch(Utils.getCurrentUser().role){
		case "FEDERATION_ADMIN":
			initAllNodesAside();
			break;
		case "NODE_ADMIN":
			initNodeAside("TUB");
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
		var node = $("<div>").append($("<ul>").addClass("fa-ul navigationLink").append("<li><a href='#tubnode'><i class='fa fa-minus fa-li'></i>"+nodeName+" node</a></li>"));

		$("#homeAside").append($("<div>").append(nodesHeader,node));
	};
	

	
	return Nodes;

});
