function runUU()
{
var UNDIRECTED = true, UNWEIGHTED = true;

var grid = 10;

var width = 960,
	height = 500,
	colors = d3.scale.category10();

// clear stuff
d3.select("#drawgraph #viz").selectAll('svg').remove();


var svg = d3.select('#drawgraph #viz')
			.append('svg')
			.attr('width',width)
			.attr('height',height);

var countNodeId = new Array(200);
for (var i = countNodeId.length; i >= 0; -- i) countNodeId[i] = 0;
countNodeId[0]++;
countNodeId[1]++;
countNodeId[2]++;

var nodes = [ 	{id : 0, x : 100, y : 100 },
				{id : 1, x : 200, y : 200 },
				{id : 2, x : 300, y : 300 }],
	links = [	{source : nodes[0], target : nodes[1] },
				{source : nodes[1], target : nodes[2] }],
	lastNodeId = 3;

var drag_line = svg.append('svg:path')
	.attr('class', 'link dragline hidden')
	.attr('d', 'M0,0L0,0');

var path; 
var circle; 

var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

	
function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}


function restart()
{
	// redraw everything
	
	svg.selectAll('g').remove();
	
	path =  svg.append('svg:g').selectAll('path'),
	circle = svg.append('svg:g').selectAll('g');
	
	circle = circle.data(nodes, function(d) { return d.id; });
	circle.selectAll('circle')
		.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); });
	
	var g = circle.enter().append('svg:g');

	g.append('svg:circle')
		.attr('class','node')
		.attr('r',16)
		.attr('cx', function (d) { return d.x; })
		.attr('cy', function (d) { return d.y; })
		.style('fill', function(d) { return (d === selected_node) ? d3.rgb(167,212,20) : d3.rgb(238,238,238); })
		//.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
		//.style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
		.on('mousedown', function(d) {
			if (d3.event.ctrlKey) return;
			
			mousedown_node = d;
			if (mousedown_node === selected_node) selected_node = null;
			else selected_node = mousedown_node;
			
			selected_link = null;
 
			  // reposition drag line
			drag_line
				/*
				.style('marker-end', 'url(#end-arrow)')
				*/
				.classed('hidden', false)
				.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
		 	
			restart();
		})
		.on('mouseup', function(d) {
			if (!mousedown_node) return;
			
			drag_line
        .classed('hidden', true)
		/*
        .style('marker-end', '');
		*/
 
		  // check for drag-to-self
		  mouseup_node = d;
		  if(mouseup_node === mousedown_node) { resetMouseVars(); return; }
	 
	 
		  // add link to graph (update if exists)
		  // NB: links are strictly source < target; arrows separately specified by booleans
		  var source, target, direction;
		  if(mousedown_node.id < mouseup_node.id) {
			source = mousedown_node;
			target = mouseup_node;
			//direction = 'right';
		  } else {
			source = mouseup_node;
			target = mousedown_node;
			//direction = 'left';
		  }
	 
		  var link;
		  link = links.filter(function(l) {
			return (l.source === source && l.target === target);
		  })[0];
	 
		  if(link) {
			//link[direction] = true;
		  } else {
			link = {source: source, target: target};
			//link[direction] = true;
			links.push(link);
		  }
	 
		  // select new link
		  selected_link = link;
		  selected_node = null;
		  restart();
		})
	;
	
	g.append('svg:text')
		.attr('x', function(d) { return d.x; })
		.attr('y', function(d) { return d.y + 3.5; })
		//.attr('y', function (d) { return 4; })
		.attr('class','id')
		.text(function(d) { return d.id; });
	
	//circle.exit().remove();
	
	// drawing paths
	
	path = path.data(links);
	
	path.classed('selected', function(d) { return d === selected_link; });
	
	path.enter().append('svg:path')
		.attr('class','link')
		.classed('selected',function(d) {return d === selected_link; })
		.attr('d', function (d)
		{
			var deltaX = d.target.x - d.source.x,
			deltaY = d.target.y - d.source.y,
			dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
			normX = deltaX / dist,
			normY = deltaY / dist,
			/*
			sourcePadding = d.left ? 17 : 12,
			targetPadding = d.right ? 17 : 12,
			*/
			sourcePadding = 12;
			targetPadding = 12;
			sourceX = d.source.x + (sourcePadding * normX),
			sourceY = d.source.y + (sourcePadding * normY),
			targetX = d.target.x - (targetPadding * normX),
			targetY = d.target.y - (targetPadding * normY);
			return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
		})
		.on('mousedown', function(d) {
			if(d3.event.ctrlKey) return;
		 
			// select link
			mousedown_link = d;
			if(mousedown_link === selected_link) selected_link = null;
			else selected_link = mousedown_link;
			selected_node = null;
			restart();
		})
		;
	
	// json object
	
	var json = "{\"vl\":{";
	
	// process nodes
	
	for (var i = 0; i < nodes.length; i++)
	{
		var first = "\"" + nodes[i].id + "\":";
		
		var obj = new Object();
		obj.text = nodes[i].id;
		obj.cx = nodes[i].x;
		obj.cy = nodes[i].y;
		
		var second = JSON.stringify(obj);
		
		json = json + first + second;
		
		if (i !== nodes.length - 1) json = json + ",";
	}
	var add = "},\"el\":{";
	json = json.concat(add);
	
	// process edges
	for (var i = 0; i < links.length; i++)
	{
		var first = "\"" + links[i].source.id + "\":";
		
		var obj = new Object();
		obj.vertexA = links[i].source.id;
		obj.vertexB = links[i].target.id;
		obj.type = 0;
		
		var second = JSON.stringify(obj);
		
		json = json + first + second;
		
		if (i !== links.length - 1) json = json + ",";
	}
	
	add = "}}";
	json = json.concat(add);
	
	console.log(json);
	JSONresult = json;
	
	var maxNodeId = -1;
	var countNode = nodes.length;
	var countEdge = links.length;
	var adjMat = [];
	
	for (var i = 0; i < nodes.length; i++)
		if (nodes[i].id > maxNodeId) maxNodeId = nodes[i].id;
	
	maxNodeId++;
	// adjacency matrix
	var validNode = new Array(maxNodeId);
	
	for (var i = 0; i < maxNodeId; i++) validNode[i] = false;
	for (var i = 0; i < nodes.length; i++) validNode[nodes[i].id] = true;
	
	for (var i = 0; i < maxNodeId; i++)
	{
		adjMat[i] = [];
		for (var j = 0; j < maxNodeId; j++)
			if (validNode[i] === true && validNode[j] === true) adjMat[i][j] = "0";
			else adjMat[i][j] = "x";
	}
	
	
	if (UNDIRECTED === true)
	{
		if (UNWEIGHTED === true)
		{
			for (var i = 0; i < links.length; i++)
			{
				adjMat[links[i].source.id][links[i].target.id] = "1";
				adjMat[links[i].target.id][links[i].source.id] = "1";
			}
		}
		else
		{
			for (var i = 0; i < links.length; i++)
			{
				adjMat[links[i].source.id][links[i].target.id] = links[i].weight.toString();
				adjMat[links[i].target.id][links[i].source.id] = links[i].weight.toString();
			}
		}
	}
	else
	{
		if (UNWEIGHTED === true)
		{
			for (var i = 0; i < links.length; i++)
			{
				adjMat[links[i].source.id][links[i].target.id] = "1";
			}
		}
		else
		{
			for (var i = 0; i < links.length; i++)
			{
				adjMat[links[i].source.id][links[i].target.id] = links[i].weight.toString();
			}
		}
	}
	
	// test adjMat
	console.log("Adjacency Matrix");
	for (var i = 0; i < maxNodeId; i++)
	{
		var out = "";
		for (var j = 0; j < maxNodeId; j++) out = out + adjMat[i][j] + " ";
		console.log(out);
	}
	
	// output adjMat to html
	
	d3.select("#adj_matrix_table").selectAll('tr').remove();
	var table1 = d3.select("#adj_matrix_table").select('tbody');
	
	// top 
	var row = table1.append('tr');
	row.append('td').text(" ");
	
	for (var i = 0; i < maxNodeId; i++) row.append('td').text(i.toString());
	
	for (var i = 0; i < maxNodeId; i++)
	{
		row = table1.append('tr');
		row.append('td').text(i.toString());
		for (var j = 0; j < maxNodeId; j++) row.append('td').text(adjMat[i][j]);
	}
	
	// adjacency list
	var AdjList = [];
	var adjList = [];
	
	for (var i = 0; i < maxNodeId; i++) adjList[i] = [];
	for (var i = 0; i < maxNodeId; i++) AdjList[i] = [];
	
	if (UNWEIGHTED === true)
	{
		for (var i = 0; i < links.length; i++)
		{
			adjList[links[i].source.id].push(links[i].target.id.toString());
			AdjList[links[i].source.id].push(links[i].target.id);
			
			if (UNDIRECTED === true)
			{
				adjList[links[i].target.id].push(links[i].source.id.toString());
				AdjList[links[i].target.id].push(links[i].source.id);
			}
		}
	}
	else
	{
		adjList[links[i].source.id].push("("+links[i].weight.toString()+","+links[i].target.id.toString()+")");
		AdjList[links[i].source.id].push(links[i].target.id);
		
		if (UNDIRECTED === true)
		{
			adjList[links[i].target.id].push("("+links[i].weight.toString()+","+links[i].source.id.toString()+")");
			AdjList[links[i].target.id].push(links[i].source.id);
		}
	}
	
	// test adjList
	console.log("Adjacency List");
	for (var i = 0; i < maxNodeId; i++)
	{
		var out = i.toString() + " : ";
		for (var j = 0; j < adjList[i].length; j++) out = out + adjList[i][j] + " ";
		console.log(out);
	}
	
	// output adjList to html
	
	d3.select("#adj_list_table").selectAll('tr').remove();
	var table2 = d3.select("#adj_list_table").select('tbody');
	
	for (var i = 0; i < maxNodeId; i++)
	{
		row = table2.append('tr');
		row.append('td').text(i.toString() + " : ");
		
		for (var j = 0; j < adjList[i].length; j++) row.append('td').text(adjList[i][j]);
	}
	
	// edge list
	
	console.log("Edge List");
	for (var i = 0; i < links.length; i++)
	{
		var out = i.toString() + " : ";
		
		if (UNWEIGHTED === true)
		{
			out = out + links[i].source.id.toString() + " " + links[i].target.id.toString();
		}
		else
		{
			out = out + links[i].weight.toString() + " " + links[i].source.id.toString() + " " + links[i].target.id.toString();
		}
		
		console.log(out);
	}
	
	// output edgeList to html
	
	d3.select("#edge_list_table").selectAll('tr').remove();
	var table3 = d3.select("#edge_list_table").select('tbody');
	
	for (var i = 0; i < links.length; i++)
	{
		row = table3.append('tr');
		
		row.append('td').text(i.toString() + " : ");
		
		if (UNWEIGHTED === true)
		{
			row.append('td').text(links[i].source.id.toString());
			row.append('td').text(links[i].target.id.toString());
		}
		else
		{
			row.append('td').text(links[i].weight.toString());
			row.append('td').text(links[i].source.id.toString());
			row.append('td').text(links[i].target.id.toString());
		}
		
	}
	// IsTree
	var IsTree = false;
	
	if (UNDIRECTED === true && countEdge === countNode - 1) IsTree = true;
	console.log("IsTree : " + IsTree);
	
	if (IsTree === true) d3.select("#isTree").text(" : Yes");
	else d3.select("#isTree").text(" : No");
	
	// IsComplete
	var IsComplete = false;
	
	if (UNDIRECTED === true && countEdge === (countNode * (countNode - 1))/2) IsComplete = true;
	console.log("IsComplete : " + IsComplete);
	
	if (IsComplete === true) d3.select("#isComplete").text(" : Yes");
	else d3.select("#isComplete").text(" : No");
	
	// IsBipartite
	
	var color = [];
	for (var i = 0; i < maxNodeId; i++) color[i] = -1;
	
	var IsBipartite = true;
	
	if (countNode === 0) IsBipartite = false;
	else
	{
		var q = [];
		q.push(nodes[0].id);
		
		while (q.length > 0)
		{
			var u = q.shift();
			
			for (var i = 0; i < adjList[u].length; i++)
			{
				var v = adjList[u][i];
				
				if (color[v] === -1)
				{
					color[v] = 1 - color[u];
					q.push(v);
				}
				else if (color[v] === color[u])
				{
					IsBipartite = false;
					break;
				}
			}
			
			if (IsBipartite === false) break;
		}
	}
	
	console.log("IsBipartite : " + IsBipartite);
	
	if (IsBipartite === true) d3.select("#isBipartite").text(" : Yes");
	else d3.select("#isBipartite").text(" : No");
}


function mousedown() {
  svg.classed('active', true);
 
  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;
 
  // insert new node at point
  var point = d3.mouse(this),
      node = {id: lastNodeId};
	  
	// find new last node ID
  countNodeId[lastNodeId]++;
  for (var i = 0; i < 200; i++)
	if (countNodeId[i] === 0) 
	{
	   lastNodeId = i;
	   break;
	}
  node.x = point[0];
  node.y = point[1];
  
  nodes.push(node);
 
  node.x = parseInt(node.x) - parseInt(node.x) % grid;
  node.y = parseInt(node.y) - parseInt(node.y) % grid;
  
  restart();
}

function mousemove() {
  if(!mousedown_node) return;
 
  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
 
  restart();
}
 
function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      //.style('marker-end', '');
  }
 
  // because :active only works in WebKit?
  svg.classed('active', false);
 
  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}
var lastKeyDown = -1;


var drag = d3.behavior.drag()
	.on("drag", function (d)
	{
		console.log("dragging");
		
		var dragTarget = d3.select(this).select('circle');
		
		//console.log(this);
		
		var new_cx, new_cy;
		
		console.log(d);
		
			dragTarget
		.attr("cx", function()
		{
			//new_cx = d3.event.dx + parseInt(dragTarget.attr("cx"));
			new_cx = d3.mouse($("svg")[0])[0];
			return new_cx;
		})
		.attr("cy", function()
		{
			//new_cy = d3.event.dy + parseInt(dragTarget.attr("cy"));
			new_cy = d3.mouse($("svg")[0])[1];
			return new_cy;
		});
		
		//console.log(d3.event.dx + " " + d3.event.dy);
		d.x = new_cx;
		d.y = new_cy;
		
		d.x = parseInt(d.x) - parseInt(d.x) % grid;
		d.y = parseInt(d.y) - parseInt(d.y) % grid;
		
		//console.log(d.x + " " + d.y);
		
		restart();
	});

function move()
{
}

function keydown() {
  d3.event.preventDefault();
 
  //if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;
 
  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(drag);
    svg.classed('ctrl', true);
  }
 
  if(!selected_node && !selected_link) return;
  
  switch(d3.event.keyCode) {
    //case 8: // backspace
    case 46: // delete
      if(selected_node) 
	  {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
		countNodeId[selected_node.id] = 0;
		for (var i = 0; i < 200; i++)
			if (countNodeId[i] === 0) 
			{
			   lastNodeId = i;
			   break;
			}
      } else if(selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      restart();
      break;
	/*  
    case 66: // B
      if(selected_link) {
        // set link direction to both left and right
        selected_link.left = true;
        selected_link.right = true;
      }
      restart();
      break;
    case 76: // L
      if(selected_link) {
        // set link direction to left only
        selected_link.left = true;
        selected_link.right = false;
      }
      restart();
      break;
    case 82: // R
      if(selected_node) {
        // toggle node reflexivity
        selected_node.reflexive = !selected_node.reflexive;
      } else if(selected_link) {
        // set link direction to right only
        selected_link.left = false;
        selected_link.right = true;
      }
      restart();
      break;
	 */
  }
}
 
function keyup() {
  lastKeyDown = -1;
 
  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}

svg.on('mousedown', mousedown)
	.on('mousemove', mousemove)
	.on('mouseup', mouseup);
d3.select(window)
	.on('keydown',keydown)
	.on('keyup',keyup);
restart();

}