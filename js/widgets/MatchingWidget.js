
var MCBM_EXAMPLE_CP3_4_44 = 0;
var MCBM_EXAMPLE_CP3_4_42 = 1;
var MCBM_EXAMPLE_CP3_4_43 = 2;
var COMPLETE_GRAPH = 3;

var MCBM = function(){
  var self = this;
  var graphWidget = new GraphWidget();

  var valueRange = [1,100];

  var internalAdjList = {};
  var internalEdgeList = {};
  var amountVertex = 0;
  var amountEdge = 0;
  var amountLeftSet = 0;
  var sourceVertex = 0;  

  this.getGraphWidget = function(){
    return graphWidget;
  }

  fixJSON = function()
  {
    amountVertex = 0;
    amountEdge = 0;
    for (var key in internalAdjList) ++amountVertex;
    for (var key in internalEdgeList) ++amountEdge;
    
    for (var key in internalEdgeList)
    {
      delete internalEdgeList[key]["type"];
      delete internalEdgeList[key]["displayWeight"];
      if (internalEdgeList[key]["vertexA"] > internalEdgeList[key]["vertexB"])
      {
        var temp = internalEdgeList[key]["vertexA"];
        internalEdgeList[key]["vertexA"] = internalEdgeList[key]["vertexB"];
        internalEdgeList[key]["vertexB"] = temp;
      }

    }
    for (var key in internalAdjList)
    {
      internalAdjList[key]["text"] = +key;
      delete internalAdjList[key]["state"];
    }
  }
  
  takeJSON = function(graph)
  {
    graph = JSON.parse(graph);
    amountVertex = $.map(graph["vl"], function(n, i) { return i; }).length;
    amountEdge = $.map(graph["el"], function(n, i) { return i; }).length;
    internalAdjList = graph["vl"];
    internalEdgeList = graph["el"];
    fixJSON();
  }

  var whichSide = new Array;
  var bipartite;

  bipartiteChecking = function(now)
  {
    for (var i in internalEdgeList) 
    {
      if (internalEdgeList[i]["vertexA"] == now)
      {
        if (whichSide[internalEdgeList[i]["vertexB"]] == -1)
        {
          whichSide[internalEdgeList[i]["vertexB"]] = 1 - whichSide[internalEdgeList[i]["vertexA"]];
          bipartiteChecking(internalEdgeList[i]["vertexB"]);
        } else if (whichSide[internalEdgeList[i]["vertexB"]] == whichSide[internalEdgeList[i]["vertexA"]])
        {
          bipartite = false;
        }
      } else if (internalEdgeList[i]["vertexB"] == now)
      {
        if (whichSide[internalEdgeList[i]["vertexA"]] == -1)
        {
          whichSide[internalEdgeList[i]["vertexA"]] = 1 - whichSide[internalEdgeList[i]["vertexB"]];
          bipartiteChecking(internalEdgeList[i]["vertexA"]);
        } else if (whichSide[internalEdgeList[i]["vertexA"]] == whichSide[internalEdgeList[i]["vertexB"]])
        {
          bipartite = false;
        }
      }
    }
  }

  statusChecking = function()
  {
    if (amountVertex == 0)
      $("#draw-status p").html("Graph is empty");
    else
    {
      if ($("#draw-err p").html() == "No Error")
      {
        for (var border = 0; border < amountVertex - 1; ++border) //check whether left side = [0,border]
        {
          var okay = true;
          for (var i = 0; i <= border; ++i)
          {
            for (var j = 0; j <= border; ++j)
            {
              for (var k in internalEdgeList)
              {
                if (internalEdgeList[k]["vertexA"] == i && internalEdgeList[k]["vertexB"] == j)
                  okay = false;
              }
            }
          }
          for (var i = border+1; i < amountVertex; ++i)
          {
            for (var j = border+1; j < amountVertex; ++j)
            {
              for (var k in internalEdgeList)
              {
                if (internalEdgeList[k]["vertexA"] == i && internalEdgeList[k]["vertexB"] == j)
                  okay = false;
              }
            }
          }
          if (okay)
          {
            $("#draw-status p").html("Left side vertices = [0," + border + "]. Right side vertices = [" + (border+1) + "," + (amountVertex-1) + "]");
            amountLeftSet = border + 1;
            return;
          }
        }
      } else $("#draw-status p").html("");
    }
  }

  warnChecking = function()
  {
    var warn = "";
    if (amountVertex >= 10)
      warn += "Too much vertex on screen, consider drawing smaller graph. ";

    if (warn == "") $("#draw-warn p").html("No Warning");
    else $("#draw-warn p").html(warn);
  }

  errorChecking = function()
  {
    var error = "";
    if (amountVertex < 2)
    {
      $("#draw-err p").html("There must be at least 2 vertices. ");
      return;
    }
    
    for (var i = 0; i < amountVertex; ++i) whichSide[i] = -1;
    bipartite = true;
    for (var i = 0; i < amountVertex; ++i) 
    {
      if(whichSide[i] == -1)
      {
        whichSide[i] = i % 2;
        bipartiteChecking(i);
      }
    }

    if (!bipartite) 
      error += "Graph is not bipartite. Currently Graph Matching only supports Bipartite Graph. :( ";
    
    var separatable = false;
    for (var border = 0; border < amountVertex - 1; ++border) //check whether left side = [0,border]
    {
      var okay = true;
      for (var i = 0; i <= border; ++i)
      {
        for (var j = 0; j <= border; ++j)
        {
          for (var k in internalEdgeList)
          {
            if (internalEdgeList[k]["vertexA"] == i && internalEdgeList[k]["vertexB"] == j)
              okay = false;
          }
        }
      }
      for (var i = border+1; i < amountVertex; ++i)
      {
        for (var j = border+1; j < amountVertex; ++j)
        {
          for (var k in internalEdgeList)
          {
            if (internalEdgeList[k]["vertexA"] == i && internalEdgeList[k]["vertexB"] == j)
              okay = false;
          }
        }
      }
      if (okay) 
      {
        separatable = true;
      }
    }

    if (bipartite && !separatable)
      error += "There is no X such that the left vertices are numbered [0,X] and the right vertices are numbered (X,|V|) ";

    if (error == "") $("#draw-err p").html("No Error");
    else $("#draw-err p").html(error);
  }
  
  var intervalID;

  this.startLoop = function()
  {
    intervalID = setInterval(function()
    {
      takeJSON(JSONresult);
      warnChecking();
      errorChecking();
      statusChecking();
    },100);
  }

  this.stopLoop = function()
  {
    clearInterval(intervalID);
  }

  relayout = function()
  {
    var amountRightSet = amountVertex - amountLeftSet;
    for (var i = 1; i <= amountLeftSet; ++i)
    {
      internalAdjList[i-1] = 
      {
        "cx": 250,
        "cy": (250 + (i - (amountLeftSet + 1) / 2) * (amountLeftSet == 1 ? 0 : 450 / (amountLeftSet - 1))),
        "text": (i - 1)
      }
    }

    for (var i = 1; i <= amountRightSet; ++i)
    {
      internalAdjList[i + amountLeftSet - 1] = 
      {
        "cx": 450,
        "cy": (250 + (i - (amountRightSet + 1) / 2) * (amountRightSet == 1 ? 0 : 450 / (amountRightSet - 1))),
        "text": (amountLeftSet + i - 1)
      }
    }
  }

  this.draw = function() 
  {
    if ($("#draw-err p").html() != "No Error") return false;
    if ($("#submit").is(':checked'))
      this.submit(JSONresult);
    if ($("#copy").is(':checked'))
    {
      window.prompt("Copy to clipboard:",JSONresult);
    }
    if ($("#relayout").is(':checked'))
      relayout();

    graph = createState(internalAdjList,internalEdgeList);
    graphWidget.updateGraph(graph, 500);
    return true;
  }

  this.submit = function(graph)
  {
    $.ajax({
                    url: "http://algorithmics.comp.nus.edu.sg/~onlinequiz/erinplayground/php/Graph.php?mode=" + MODE_SUBMIT_GRAPH + "&sessionID=" + $.cookie("sessionID"),
                    type: "POST",
                    data: {canvasWidth: 1000, canvasHeight: 500, graphTopics: 'Graph Matching', graphState: graph},
                    error: function(xhr, errorType, exception) { //Triggered if an error communicating with server  
                        var errorMessage = exception || xhr.statusText; //If exception null, then default to xhr.statusText  

                        alert("There was an error submitting your graph " + errorMessage);
                    }
                }).done(function(data) {
                    console.log(data);
                });
  }

  this.importjson = function()
  {
    var text = $("#samplejson-input").val();
    takeJSON(text);
    statusChecking();
    graph = createState(internalAdjList,internalEdgeList);
    graphWidget.updateGraph(graph, 500);
  }
    
  this.initRandom = function(graph) {
    internalAdjList = graph.internalAdjList;
    internalEdgeList = graph.internalEdgeList;
    amountVertex = internalAdjList.length;
    amountEdge = internalEdgeList.length;
    fixJSON();
    statusChecking();
    var newState = createState(internalAdjList, internalEdgeList);

    graphWidget.updateGraph(newState, 500);
  }

  this.generateRandom = function(){
    amountVertex = Math.floor(Math.random() * 9) + 4; //4 to 12
    var leftVertex = Math.floor(Math.random() * (amountVertex - 3)) + 1; //1 to N-3
    if (leftVertex > 6) leftVertex = 6;
    var rightVertex = amountVertex - leftVertex;

    internalAdjList = new Object();
    internalEdgeList = new Object();
    amountEdge = 0;

    for (var i = 0; i < leftVertex; ++i)
    {
      internalAdjList[i] = 
      {
        "cx": 250,
        "cy": (250 + (i + 1 - (leftVertex + 1) / 2) * (leftVertex == 1 ? 0 : 450 / (leftVertex - 1))),
        "text": i
      }
    }

    for (var i = 0; i < rightVertex; ++i){
      internalAdjList[i + leftVertex] = 
      {
        "cx": 450,
        "cy": (250 + (i + 1 - (rightVertex + 1) / 2) * (rightVertex == 1 ? 0 : 450 / (rightVertex - 1))),
        "text": (leftVertex + i)
      }
    }

    for (var i = 0; i < leftVertex; ++i)
    {
      for (var j = 0; j < rightVertex; ++j)
      {
        var existEdge = Math.floor(Math.random() * 2);
        if (existEdge == 1)
        {
          internalEdgeList[amountEdge] = 
          {
            "vertexA": i,
            "vertexB": j + leftVertex,
            "weight": 1
          }
          ++amountEdge;
        }
      }
    }

    amountVertex = 0;
    amountEdge = 0;
    for (var i in internalAdjList) ++amountVertex;
    for (var i in internalEdgeList) ++amountEdge;
    amountLeftSet = leftVertex;
    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
    return true;
  }

  this.augmentingPath = function(isGreedy){



    var key;
    var stateList = [];
    var vertexTraversed = {};
    var edgeTraversed = {};
    var vertexHighlighted = {};
    var edgeHighlighted = {};
    var edgeTraversed2 = {};
    var vertexTraversed2 = {};
    var currentState;
    
    var toSet = [];
    var toUnSet = [];

    var LeftToRightEdge = [];
    var RightToLeftEdge = [];

    var edgeDict = {};

    if (amountVertex == 0) { // no graph
        $('#augpath-err').html("There is no graph to run this on." + 
                           "Please select a sample graph first.");
        return false;
    }

    for(key in internalEdgeList){
      var edgeDictKeyOne = [];
      var edgeDictKeyTwo = [];
      edgeDictKeyOne.push(internalEdgeList[key]["vertexA"]);
      edgeDictKeyOne.push(internalEdgeList[key]["vertexB"]);
      edgeDictKeyTwo.push(internalEdgeList[key]["vertexB"]);
      edgeDictKeyTwo.push(internalEdgeList[key]["vertexA"]);
      edgeDict[edgeDictKeyOne] = key;
      edgeDict[edgeDictKeyTwo] = key;
    }

    var match = {};
    var vis = {};

    for (key in internalAdjList){
        if (key=="cx"||key=="cy") continue;
        match[key] = -1;
    }

    if(isGreedy){
      populatePseudocode(3);
      match = greedyMatch();
      currentState = createState(internalAdjList, internalEdgeList, 
                                 vertexHighlighted, edgeHighlighted, 
                                 vertexTraversed, edgeTraversed);
      currentState["status"] = 'Random greedy pairing has been picked';
      currentState["lineNo"] = 1;
      stateList.push(currentState);
    } else
    {
      populatePseudocode(0);
    }

    currentState = createState(internalAdjList, internalEdgeList, 
                               vertexHighlighted, edgeHighlighted, 
                               vertexTraversed, edgeTraversed);
    currentState["status"] = 'For each vertex on the left hand set' + 
        ', look for an augmenting path';
    currentState["lineNo"] = isGreedy ? 4 : 1;
    stateList.push(currentState);



    for (var i=0;i<amountLeftSet;i++){
      vertexTraversed = {};
      vertexTraversed[i] = true;
      currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed);
      currentState["status"] = 'For vertex ' + 
      internalAdjList[i]["text"] + ':';
      currentState["lineNo"] = isGreedy ? 4 : 1;
      stateList.push(currentState);	   
      for (key in internalAdjList){
        if (key=="cx"||key=="cy") continue;
        vis[key] = 0;
      }

      LeftToRightEdge = [];
      RightToLeftEdge = [];

      if(match[i]===-1){
        Aug(i);
      }

      LeftToRightEdge.reverse();
      RightToLeftEdge.reverse();

      for(var x = 0; x < RightToLeftEdge.length;x++){
        edgeTraversed[LeftToRightEdge[x][0]] = true;
        vertexTraversed[LeftToRightEdge[x][1]] = true;
        vertexTraversed2[LeftToRightEdge[x][2]] = true;
        currentState = createState(internalAdjList, internalEdgeList,
                                   vertexHighlighted, edgeHighlighted,
                                   vertexTraversed, edgeTraversed,
                                   vertexTraversed2, edgeTraversed2);
        currentState["status"] = "Free Edge from " + 
                                  internalAdjList[LeftToRightEdge[x][1]]["text"]
                                  + " to " +
                                  internalAdjList[LeftToRightEdge[x][2]]["text"]
                                   + " added to " +
                                 "augmenting path";
        currentState["lineNo"] = isGreedy ? 4 : 2;
        stateList.push(currentState);
        toSet.push(LeftToRightEdge[x]);

        edgeTraversed2[RightToLeftEdge[x][0]] = true;
        vertexTraversed2[RightToLeftEdge[x][1]] = true;
        vertexTraversed[RightToLeftEdge[x][2]] = true;
        currentState = createState(internalAdjList, internalEdgeList,
                                   vertexHighlighted, edgeHighlighted,
                                   vertexTraversed, edgeTraversed,
                                   vertexTraversed2, edgeTraversed2);
        currentState["status"] = "Occupied Edge from " + 
                                  internalAdjList[RightToLeftEdge[x][1]]["text"]
                                   + " to " +
                                  internalAdjList[RightToLeftEdge[x][2]]["text"]
                                   + " added to " +
                                 "augmenting path";
        currentState["lineNo"] = isGreedy ? 4 : 2;
        stateList.push(currentState);
        toUnSet.push(RightToLeftEdge[x]);

      }

      if( LeftToRightEdge.length > RightToLeftEdge.length){
        var x = RightToLeftEdge.length;
        edgeTraversed[LeftToRightEdge[x][0]] = true;
        vertexTraversed[LeftToRightEdge[x][1]] = true;
        vertexTraversed2[LeftToRightEdge[x][2]] = true;
        currentState = createState(internalAdjList, internalEdgeList,
                                   vertexHighlighted, edgeHighlighted,
                                   vertexTraversed, edgeTraversed,
                                    vertexTraversed2, edgeTraversed2);
        currentState["status"] = "Free Edge from " + 
                                  internalAdjList[LeftToRightEdge[x][1]]["text"]
                                  + " to " +
                                  internalAdjList[LeftToRightEdge[x][2]]["text"]
                                   + " added to " +
                                 "augmenting path";
        currentState["lineNo"] = isGreedy ? 4 : 2;
        stateList.push(currentState);
        toSet.push(LeftToRightEdge[x]);
      }

      vertexTraversed = {};
      vertexTraversed2 = {};
      currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed,
                                 vertexTraversed2, edgeTraversed2);
      currentState["status"] = 'No more edges to add.';
      currentState["lineNo"] = isGreedy ? 4 : 2;
      stateList.push(currentState);

      for(var x = 0; x < toUnSet.length; x++){
        edgeHighlighted[toSet[x][0]] = true;
        delete edgeTraversed[toSet[x][0]];
        currentState = createState(internalAdjList, internalEdgeList,
                                   vertexHighlighted, edgeHighlighted,
                                   vertexTraversed, edgeTraversed,
                                   vertexTraversed2, edgeTraversed2);
        currentState["status"] = "Flipped edge from " + 
                                  internalAdjList[LeftToRightEdge[x][1]]["text"]
                                  + " to " +
                                  internalAdjList[LeftToRightEdge[x][2]]["text"]
                                   + " to status taken";
        currentState["lineNo"] = isGreedy ? 4 : 3;
        stateList.push(currentState);

        delete edgeHighlighted[RightToLeftEdge[x][0]];
        delete edgeTraversed2[toUnSet[x][0]];
        currentState = createState(internalAdjList, internalEdgeList,
                                   vertexHighlighted, edgeHighlighted,
                                   vertexTraversed, edgeTraversed);
        currentState["status"] = "Flipped edge from " + 
                                  internalAdjList[RightToLeftEdge[x][1]]["text"]
                                   + " to " +
                                  internalAdjList[RightToLeftEdge[x][2]]["text"]
                                   + " to status not taken";
        currentState["lineNo"] = isGreedy ? 4 : 3;
        stateList.push(currentState);
      }

      if(toSet.length > toUnSet.length){
        var x = toSet.length - 1;
        edgeHighlighted[toSet[x][0]] = true;
        delete edgeTraversed[toSet[x][0]];
        currentState = createState(internalAdjList, internalEdgeList,
                                   vertexHighlighted, edgeHighlighted,
                                   vertexTraversed, edgeTraversed,
                                   vertexTraversed2, edgeTraversed2);
        currentState["status"] = "Flipped edge from " + 
                                  internalAdjList[LeftToRightEdge[x][1]]["text"]
                                  + " to " +
                                  internalAdjList[LeftToRightEdge[x][2]]["text"]
                                   + " to status taken";
        currentState["lineNo"] = isGreedy ? 4 : 3;
        stateList.push(currentState);
      }

      toSet = [];
      toUnSet = [];
      edgeTraversed = {};
      edgeTraversed2 = {};
      currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed);
      currentState["status"] = 'All edges in path flipped';
      currentState["lineNo"] = isGreedy ? 4 : 3;
      stateList.push(currentState);            
    }

    vertexTraversed = {};

    var numberOfMatchings = 0;
    for (var i = amountLeftSet; i < amountVertex; ++i)
      if (match[i] != -1) ++numberOfMatchings;

    currentState = createState(internalAdjList, internalEdgeList,
                               vertexHighlighted, edgeHighlighted,
                               vertexTraversed, edgeTraversed);
    currentState["status"] = 'Done. Found ' + numberOfMatchings + ' matchings';
    currentState["lineNo"] = isGreedy ? 4 : 4;
    stateList.push(currentState);

    graphWidget.startAnimation(stateList);
    return true;

    function uncolourAllEdges(v){
      for(var j=0; j < amountEdge; j++){
        var edge = internalEdgeList[j];
        if(v === edge["vertexA"] ||v === edge["vertexB"]){
            toUnSet.push(j);
        }
      }
      return;
    }

    function Aug(l) {
      if (vis[l]!==0) return 0;
      vis[l] = 1;
      for(var j=0; j<amountEdge; j++){
          var edge = internalEdgeList[j];
          var e,r;
          if (l===edge["vertexA"]){
              r = edge["vertexB"];
              if(match[r] === -1 || Aug(match[r])){
                  e = edgeDict[[l,r]];
                  //if(e==null){alert(l + ' ' + r + ' ' + j);}
                  //edgeTraversed[e] = true;
                  LeftToRightEdge.push([e,l,r]);
                  if(match[r]!==-1){
                      e = edgeDict[[r,match[r]]];
                      //edgeTraversed[e] = true;
                      RightToLeftEdge.push([e,r,match[r]]);
                  }
                  //uncolourAllEdges(r);
                  //uncolourAllEdges(l);
                  match[r] = l;
                  //toSet.push(j);
                  return 1;
              }
          } else if (l===edge["vertexB"]){
              r = edge["vertexA"];
              if (match[r] === -1 || Aug(match[r])){
                  e = edgeDict[[l,r]];
                  //edgeTraversed[e] = true;
                  LeftToRightEdge.push([e,l,r]);
                  if(match[r]!==-1){
                      e = edgeDict[[r,match[r]]];
                      //edgeTraversed[e] = true;
                      RightToLeftEdge.push([e,r,match[r]]);
                  }
                  //uncolourAllEdges(r);
                  //uncolourAllEdges(l);
                  match[r] = l;
                  //toSet.push(j);
                  return 1;
              }	
          }	    
      }
      return 0;
    }

    function greedyMatch()
    {
      for (var x in internalAdjList) 
      {
        x = +x;
        var unmatchedNeighbour = new Array();
        for (var key in internalEdgeList) if(internalEdgeList[key]["vertexA"] == x)
        {
          var y = internalEdgeList[key]["vertexB"];
          if (match[y] != -1) continue;
          edgeTraversed[key] = true;  
          unmatchedNeighbour.push(y);
        }
        if (unmatchedNeighbour.length > 0)
        {
          currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed);
          currentState["status"] = 'Unmatched neighbour of ' + internalAdjList[x]["text"] + ' are ';
          for (var i = 0; i < unmatchedNeighbour.length; ++i)
          {
            currentState["status"] += internalAdjList[unmatchedNeighbour[i]]["text"];
            if (i < unmatchedNeighbour.length - 1) currentState["status"] += ',';
          }
          currentState["lineNo"] = [2];
          stateList.push(currentState);

          var randomSelect = unmatchedNeighbour[Math.floor(Math.random() * unmatchedNeighbour.length)];
          randomSelect = unmatchedNeighbour[0];
          for (var key in internalEdgeList) if(internalEdgeList[key]["vertexA"] == x)
          {
            var y = internalEdgeList[key]["vertexB"];
            if (match[y] != -1) continue;
            if (y != randomSelect) 
              delete edgeTraversed[key];
          }
          currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed);
          currentState["status"] = 'Randomly choose ' + internalAdjList[randomSelect]["text"] + ' to be matched with ' + internalAdjList[x]["text"];
          currentState["lineNo"] = [3];
          stateList.push(currentState);

          match[x] = randomSelect;
          match[randomSelect] = x;

          for (var key in internalEdgeList) if(internalEdgeList[key]["vertexA"] == x && internalEdgeList[key]["vertexB"] == randomSelect)
          {
            delete edgeTraversed[key];
            edgeHighlighted[key] = true;
          }

        } else
        {
          currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed);
          currentState["status"] = 'There is no unmatched neighbour of ' + internalAdjList[x]["text"];
          currentState["lineNo"] = [2];
          stateList.push(currentState);
        }
      }
      return match;
    }
  }

  this.hopcroftKarp = function(){
    var visited = [];
    var owner = [];
    var p = [];
    var dist = [];
    var match;
    var car = 0; a = 0;
    var cur = 0;
    var vmap = {};
    var tmp;
    var list = [];

    var matching = 0;

    var stateList = [];
    var vertexTraversed = {};
    var edgeTraversed = {};
    var vertexTraversed2 = {};
    var edgeTraversed2 = {};
    var vertexHighlighted = {};
    var edgeHighlighted = {};
    var edgeDict = {};
    var toSet = [];
    var toUnSet = [];

     for(key in internalEdgeList){
      var edgeDictKeyOne = [];
      var edgeDictKeyTwo = [];
      edgeDictKeyOne.push(internalEdgeList[key]["vertexA"]);
      edgeDictKeyOne.push(internalEdgeList[key]["vertexB"]);
      edgeDictKeyTwo.push(internalEdgeList[key]["vertexB"]);
      edgeDictKeyTwo.push(internalEdgeList[key]["vertexA"]);
      edgeDict[edgeDictKeyOne] = key;
      edgeDict[edgeDictKeyTwo] = key;
    }

    for (key in internalAdjList){
        if (key=="cx"||key=="cy") continue;
        owner[(+key)+1] = 0;
    } 
    while(bfs()){
      for (var i=1;i<=amountLeftSet;i++){
        toSet = [];
        toUnSet = [];
        delete vertexTraversed2[i-1];
        currentState = createState(internalAdjList, internalEdgeList,
                       vertexHighlighted, edgeHighlighted,
                       vertexTraversed, edgeTraversed,
                       vertexTraversed2, edgeTraversed2);
        currentState["status"] = 'Considering vertex ' + 
            internalAdjList[i-1]["text"];
        currentState["lineNo"] = 2;
        stateList.push(currentState);
        if(owner[i]==0){
          if(dfs(i)){
            currentState = createState(internalAdjList, internalEdgeList,
                           vertexHighlighted, edgeHighlighted,
                           vertexTraversed, edgeTraversed,
                           vertexTraversed2, edgeTraversed2);
            currentState["status"] = "Augmenting path from " 
            + internalAdjList[i-1]["text"] + " exists";
            currentState["lineNo"] = 3;
            stateList.push(currentState);
            toSet.reverse();
            toUnSet.reverse();
            for(var x = 0; x < toUnSet.length; x++){
              edgeTraversed[toSet[x]] = true;
              currentState = createState(internalAdjList, internalEdgeList,
                                         vertexHighlighted, edgeHighlighted,
                                         vertexTraversed, edgeTraversed,
                                         vertexTraversed2, edgeTraversed2);
              currentState["status"] = "Unmatched edge from " + 
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexA"]]["text"]
                                        + " to " +
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexB"]]["text"]
                                         + " added to augmenting path";
              currentState["lineNo"] = 3;
              stateList.push(currentState);

              edgeTraversed2[toUnSet[x]] = true;
              currentState = createState(internalAdjList, internalEdgeList,
                                         vertexHighlighted, edgeHighlighted,
                                         vertexTraversed, edgeTraversed,
                                         vertexTraversed2, edgeTraversed2);
              currentState["status"] = "Matched edge from " + 
                                        internalAdjList[internalEdgeList[toUnSet[x]]["vertexB"]]["text"]
                                         + " to " +
                                        internalAdjList[internalEdgeList[toUnSet[x]]["vertexA"]]["text"]
                                         + " added to augmenting path";
              currentState["lineNo"] = 3;
              stateList.push(currentState);
            }

            if(toSet.length > toUnSet.length){
              var x = toSet.length - 1;
              edgeTraversed[toSet[x]] = true;
              currentState = createState(internalAdjList, internalEdgeList,
                                         vertexHighlighted, edgeHighlighted,
                                         vertexTraversed, edgeTraversed,
                                         vertexTraversed2, edgeTraversed2);
              currentState["status"] = "Unmatched edge from " + 
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexA"]]["text"]
                                        + " to " +
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexB"]]["text"]
                                         + " added to augmenting path";
              currentState["lineNo"] = 3;
              stateList.push(currentState);
            }
            for(var x = 0; x < toUnSet.length; x++){
              edgeHighlighted[toSet[x]] = true;
              delete edgeTraversed[toSet[x]];
              currentState = createState(internalAdjList, internalEdgeList,
                                         vertexHighlighted, edgeHighlighted,
                                         vertexTraversed, edgeTraversed,
                                         vertexTraversed2, edgeTraversed2);
              currentState["status"] = "Flipped edge from " + 
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexA"]]["text"]
                                        + " to " +
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexB"]]["text"]
                                         + " to status taken";
              currentState["lineNo"] = 4;
              stateList.push(currentState);

              delete edgeHighlighted[toUnSet[x]];
              delete edgeTraversed2[toUnSet[x]];
              currentState = createState(internalAdjList, internalEdgeList,
                                         vertexHighlighted, edgeHighlighted,
                                         vertexTraversed, edgeTraversed,
                                         vertexTraversed2, edgeTraversed2);
              currentState["status"] = "Flipped edge from " + 
                                        internalAdjList[internalEdgeList[toUnSet[x]]["vertexB"]]["text"]
                                         + " to " +
                                        internalAdjList[internalEdgeList[toUnSet[x]]["vertexA"]]["text"]
                                         + " to status not taken";
              currentState["lineNo"] = 4;
              stateList.push(currentState);
            }

            if(toSet.length > toUnSet.length){
              var x = toSet.length - 1;
              edgeHighlighted[toSet[x]] = true;
              delete edgeTraversed[toSet[x]];
              currentState = createState(internalAdjList, internalEdgeList,
                                         vertexHighlighted, edgeHighlighted,
                                         vertexTraversed, edgeTraversed,
                                         vertexTraversed2, edgeTraversed2);
              currentState["status"] = "Flipped edge from " + 
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexA"]]["text"]
                                        + " to " +
                                        internalAdjList[internalEdgeList[toSet[x]]["vertexB"]]["text"]
                                         + " to status taken";
              currentState["lineNo"] = 4;
              stateList.push(currentState);
            }
            matching++;
          }
        }
      }
    }
    vertexTraversed = {};
    vertexTraversed2 = {};
    //alert("Matching is " + matching);
    currentState = createState(internalAdjList, internalEdgeList,
                           vertexHighlighted, edgeHighlighted,
                           vertexTraversed, edgeTraversed,
                           vertexTraversed2, edgeTraversed2);
    currentState["status"] = "Maximum matching is " + matching;
    currentState["lineNo"] = 5;
    stateList.push(currentState);
    graphWidget.startAnimation(stateList);
    populatePseudocode(1);
    return true;

    function bfs(){
      var q = [];
      var ct = 0;
      vertexTraversed = {};
      for(var u = 1; u <= amountLeftSet; u++){
        if(owner[u] == 0){
          dist[u] = 0;
          q.push(u);
          ct++;
          vertexTraversed[u-1] = true;
        } else {
          dist[u] = 1000000;
        }
      }
      currentState = createState(internalAdjList, internalEdgeList,
                             vertexHighlighted, edgeHighlighted,
                             vertexTraversed, edgeTraversed,
                             vertexTraversed2, edgeTraversed2);
      if(ct>0){
        currentState["status"] = 'Set of free vertices found';
        currentState["lineNo"] = 1;
        stateList.push(currentState);
      } else {
        currentState["status"] = 'No more free vertices - no more augmenting path';
        currentState["lineNo"] = 1;
        stateList.push(currentState);
      }
      dist[0] = 1000000;
      while(q.length > 0){
        var u = q[0];
        if(u!=0){
          vertexTraversed2[u-1] = true;
          currentState = createState(internalAdjList, internalEdgeList,
                       vertexHighlighted, edgeHighlighted,
                       vertexTraversed, edgeTraversed,
                       vertexTraversed2, edgeTraversed2);
          currentState["status"] = 'vertex ' + internalAdjList[u-1]["text"]
               + ' popped from queue';
          currentState["lineNo"] = 1;
          stateList.push(currentState);
        }
        q.splice(0,1);
        if ((u != 0) && dist[u]<1000000){
          //for all j such that edge from u to j
          //if dist[j] is very far then set to 1 plus current)
          for(var j=0; j<amountEdge; j++){
            var edge = internalEdgeList[j];
            var adj;
            if(u - 1 === edge["vertexA"]){
              adj = edge["vertexB"] + 1;
            } else if (u - 1 === edge["vertexB"]){
              adj = edge["vertexA"] + 1;
            } else {
              continue;
            }
            if (dist[owner[adj]] === 1000000){
              dist[owner[adj]] = dist[u] + 1;
              q.push(owner[adj]);
              if(owner[adj]!=0){
                vertexTraversed[owner[adj]-1] = true;
                currentState = createState(internalAdjList, internalEdgeList,
                             vertexHighlighted, edgeHighlighted,
                             vertexTraversed, edgeTraversed,
                             vertexTraversed2, edgeTraversed2);
                currentState["status"] = 'vertex ' + internalAdjList[u-1]["text"] + 
                    ' pushed to queue';
                currentState["lineNo"] = 1;
                stateList.push(currentState);
              }
            }
          }
        }
      }
      currentState = createState(internalAdjList, internalEdgeList,
                       vertexHighlighted, edgeHighlighted,
                       vertexTraversed, edgeTraversed,
                       vertexTraversed2, edgeTraversed2);
      if(dist[0]==1000000){
        currentState["status"] = 'No more augmenting path found';
        currentState["lineNo"] = 1;
        stateList.push(currentState);
        return false;
      } else {
        currentState["status"] = 'Augmenting path of length ' + (dist[0]*2-1) + ' found';
        currentState["lineNo"] = 1;
        stateList.push(currentState);
        return true;
      }
    }

    function dfs(u){
      //alert(u);
      if (u != 0){
        for(var j=0; j<amountEdge; j++){
          var edge = internalEdgeList[j];
          var adj;
          if (u-1 === edge["vertexA"]){
            adj = edge["vertexB"] + 1;
          } else if (u-1 === edge["vertexB"]){
            adj = edge["vertexA"] + 1;
          } else {
            continue;
          }
          if ((dist[owner[adj]] == dist[u] + 1) && dfs(owner[adj])){
            if(owner[u]!=0){
              toUnSet.push(edgeDict[[u-1,owner[u]-1]]);
            }
            if(owner[adj]!=0){
              toUnSet.push(edgeDict[[owner[adj]-1,adj-1]]);
            }
            owner[u] = adj;
            owner[adj] = u;
            toSet.push(j);
            return true;
          }
        }
        dist[u] = 1000000;
        return false;
      }
      return true;
    }

  }

  this.rookattack = function()
  {
    var numOfRows = parseInt($('#rows').val());
    var numOfColumns = parseInt($('#columns').val());
    var blocked = new Array(numOfRows);

    for (var i = 0; i < numOfRows; ++i)
    {
      blocked[i] = new Array(numOfColumns);
      for (var j = 0; j < numOfColumns; ++j)
        blocked[i][j] = false;
    }

    if (numOfRows < 1 || numOfColumns < 1 || numOfRows > 6 || numOfColumns > 6) { // no graph
      $('#modeling-err').html("Invalid size. Row and column size must be between 1 and 6 inclusive.");
      return false;
    }

    this.changeState = function(rowIndex,columnIndex)
    {
      var temp = '#cell' + rowIndex + columnIndex;
      if (blocked[rowIndex][columnIndex])
      {
        $(temp).attr("bgcolor","white");
        blocked[rowIndex][columnIndex] = false;
      }
      else 
      {
        $(temp).attr("bgcolor","black");
        blocked[rowIndex][columnIndex] = true;
      }
    }

    this.createBipartiteGraph = function()
    {
      internalAdjList = {};
      internalEdgeList = {};
      vertexHighlighted = {};
      edgeRed = {};
      stateList = [];
      var currentState;
      amountEdge = 0;
      amountVertex = numOfRows + numOfColumns;
      amountLeftSet = numOfRows;

      for (var i = 1; i <= numOfRows; ++i)
      {
        internalAdjList[i-1] = 
        {
          "cx": 225,
          "cy": (250 + (i - (numOfRows + 1) / 2) * (numOfRows == 1 ? 0 : 450 / (numOfRows - 1))),
          "text": "R" + i
        }
        vertexHighlighted[i - 1] = true;
      }

      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Create a vertex for each rows';
      currentState["status"] += '<br>and connect source vertex to each vertex with capacity 1</br>';
      currentState["lineNo"] = [2];
      stateList.push(currentState);
      for (var i = 1; i <= numOfRows; ++i)
        delete vertexHighlighted[i - 1];

      for (var i = 1; i <= numOfColumns; ++i)
      {
        internalAdjList[i + numOfRows - 1] = 
        {
          "cx": 425,
          "cy": (250 + (i - (numOfColumns + 1) / 2) * (numOfColumns == 1 ? 0 : 450 / (numOfColumns - 1))),
          "text": "C" + i
        }
        vertexHighlighted[i + numOfRows - 1] = true;
      }
      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Create a vertex for each columns';
      currentState["status"] += '<br>and connect each vertex to sink vertex with capacity 1</br>';
      currentState["lineNo"] = [3];
      stateList.push(currentState);
      for (var i = 1; i <= numOfColumns; ++i)
        delete vertexHighlighted[i + numOfRows - 1];


      for (var i = 0; i < numOfRows; ++i)
      {
        for (var j = 0; j < numOfColumns; ++j)
        {
          var existEdge = 1 - blocked[i][j];
          if (existEdge == 1)
          {
            internalEdgeList[amountEdge] = 
            {
              "vertexA": i,
              "vertexB": j + numOfRows,
              "weight": 9
            }
            ++amountEdge;
            edgeRed[amountEdge-1] = true;
            currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeRed);
            currentState["status"] = 'Adding edge from R' + (i+1) + ' to C' + (j+1);
            currentState["lineNo"] = [4,5];
            stateList.push(currentState);
            delete edgeRed[amountEdge-1];
          }
        }
      }

      amountVertex = 0;
      amountEdge = 0;
      for (var i in internalAdjList) ++amountVertex;
      for (var i in internalEdgeList) ++amountEdge;

      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'Run any Max Cardinality Bipartite Matching';
      currentState["status"] += '<br>to get the value of the maximum rooks that can be placed</br>';
      currentState["lineNo"] = [6];
      stateList.push(currentState);
      graphWidget.startAnimation(stateList);
      return true;
    }

    this.inputFinished = function()
    {
      $('.overlays').hide("slow");
      $('#dark-overlay').hide("slow");
      $('#rookattack-board').hide("slow");
      mcbmWidget.createBipartiteGraph();
      $('#current-action').show();
      $('#current-action p').html("Modeling()");
      $('#progress-bar').slider( "option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      populatePseudocode(2);
      isPlaying = true;
      return true;
    }

    this.cancel = function()
    {
      $('.overlays').hide("slow");
      $('#dark-overlay').hide("slow");
      $('#rookattack-board').hide("slow");
      $('#progress-bar').slider( "option", "max", gw.getTotalIteration()-1);
      return true;
    }

    this.inputRandomized = function()
    {
      for (var i = 0; i < numOfRows; ++i)
        for (var j = 0; j < numOfColumns; ++j)
          if (Math.random() < 0.5) this.changeState(i,j);
    }

    $('#dark-overlay').show("slow");
    var toWrite = '<html>\n';
    toWrite += '<p>Click on any cell to toggle between black/white cell</p>\n';
    toWrite += '<p>Rooks can\'t be placed in black cells</p>\n';
    toWrite += '<table border="1" id="board">'
    for (var j = 0; j < numOfColumns; ++j)
      toWrite += '<col width="50">';
    for (var i = 0; i < numOfRows; ++i)
    {
      toWrite += '<tr>';
      for (var j = 0; j < numOfColumns; ++j)
        toWrite += '<td height="50" bgcolor="white" id="cell' + i + j + '" onclick=mcbmWidget.changeState('+i+','+j+')></td>';
      toWrite += '</tr>';
    }

    toWrite += '</table>\n';
    toWrite += '<div class="modeling-actions">';
    toWrite += '<p onclick=mcbmWidget.inputRandomized()>Randomized</p>';
    toWrite += '<p onclick=mcbmWidget.inputFinished()>Done</p>';
    toWrite += '<p onclick=mcbmWidget.cancel()>Cancel</p>';
    toWrite += '</div>\n'
    toWrite += '</html>\n';
    $('#rookattack-board').html(toWrite);
    $('#rookattack-board').show("slow");
  }

  this.modeling = function(modelingType)
  {
    internalEdgeList = {};
    internalAdjList = {};
    if (modelingType == "rookattack") this.rookattack();
    if (modelingType == "baseball") this.baseball();
    return true;
  }

  this.bipartiteRandom = function(randomType) { 
    //0 : random, 1 : left 1, 2 : right 1, 3 : all 1.
    amountVertex = Math.floor(Math.random() * 9) + 4; //4 to 12
    var leftVertex = Math.floor(Math.random() * (amountVertex - 3)) + 1; //1 to N-3
    if (leftVertex > 6) leftVertex = 6;
    var numberOfFemales = amountVertex- leftVertex;
    amountLeftSet = leftVertex;
    
    internalAdjList = new Object();
    internalEdgeList = new Object();
    amountEdge = 0;

    for (var i = 1; i <= leftVertex; ++i)
    {
      internalAdjList[i-1] = 
      {
        "cx": 250,
        "cy": (250 + (i - (leftVertex + 1) / 2) * (leftVertex == 1 ? 0 : 450 / (leftVertex - 1))),
        "text": (i - 1)
      }
    }

    for (var i = 1; i <= numberOfFemales; ++i)
    {
      internalAdjList[i + leftVertex - 1] = 
      {
        "cx": 450,
        "cy": (250 + (i - (numberOfFemales + 1) / 2) * (numberOfFemales == 1 ? 0 : 450 / (numberOfFemales - 1))),
        "text": (leftVertex + i - 1)
      }
    }

    for (var i = 0; i < leftVertex; ++i)
    {
      for (var j = 0; j < numberOfFemales; ++j)
      {
        var existEdge = Math.floor(Math.random() * 2);
        if (existEdge == 1)
        {
          internalEdgeList[amountEdge] = 
          {
            "vertexA": i,
            "vertexB": j + leftVertex,
            "weight": 1
          }
          ++amountEdge;
        }
      }
    }

    amountVertex = 0;
    amountEdge = 0;
    for (var i in internalAdjList) ++amountVertex;
    for (var i in internalEdgeList) ++amountEdge;
    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);

    return true;
  }

  this.examples = function(egConstant){
    templateToUse = templates[egConstant];
  	internalAdjList = $.extend(true,{},templateToUse[0]);
  	internalEdgeList = $.extend(true,{},templateToUse[1]);
  	amountVertex = templateToUse[2];
  	amountEdge = templateToUse[3];
    amountLeftSet = templateToUse[4];
  	var newState = createState(internalAdjList, internalEdgeList);
  	graphWidget.updateGraph(newState, 500);
  	return true;
  }
}

function createState(internalAdjListObject, internalEdgeListObject, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, vertexTraversed2, edgeTraversed2){
    if(vertexHighlighted == null) vertexHighlighted = {};
    if(edgeHighlighted == null) edgeHighlighted = {};
    if(vertexTraversed == null) vertexTraversed = {};
    if(edgeTraversed == null) edgeTraversed = {};
    if(vertexTraversed2 == null) vertexTraversed2 = {};
    if(edgeTraversed2 == null) edgeTraversed2 = {};

    var key;
    var state = {
      "vl":{},
      "el":{}
    };

    for(key in internalAdjListObject){
      state["vl"][key] = {};

      state["vl"][key]["cx"] = internalAdjListObject[key]["cx"];
      state["vl"][key]["cy"] = internalAdjListObject[key]["cy"];
      state["vl"][key]["text"] = internalAdjListObject[key]["text"];
      if (internalAdjListObject[key]["state"] == OBJ_HIDDEN)
        state["vl"][key]["state"] = OBJ_HIDDEN;
      else
        state["vl"][key]["state"] = VERTEX_DEFAULT;
    }

    for(key in internalEdgeListObject){
      state["el"][key] = {};

      state["el"][key]["vertexA"] = internalEdgeListObject[key]["vertexA"];
      state["el"][key]["vertexB"] = internalEdgeListObject[key]["vertexB"];
      state["el"][key]["type"] = EDGE_TYPE_UDE;
      state["el"][key]["weight"] = internalEdgeListObject[key]["weight"];
      if (internalEdgeListObject[key]["state"] == OBJ_HIDDEN)
        state["el"][key]["state"] = OBJ_HIDDEN;
      else
        state["el"][key]["state"] = EDGE_GREY;
      state["el"][key]["displayWeight"] = false;
      state["el"][key]["animateHighlighted"] = false;
    }

    for(key in vertexHighlighted){
      state["vl"][key]["state"] = VERTEX_HIGHLIGHTED;
    }

    for(key in edgeHighlighted){
      state["el"][key]["state"] = EDGE_DEFAULT;
    }

    for(key in vertexTraversed){
      state["vl"][key]["state"] = VERTEX_TRAVERSED;
    }

    for(key in edgeTraversed){
      state["el"][key]["state"] = EDGE_TRAVERSED;
    }

    for(key in vertexTraversed2){
      state["vl"][key]["state"] = VERTEX_BLUE_OUTLINE;
    }

    for(key in edgeTraversed2){
      state["el"][key]["state"] = EDGE_BLUE;
    }

    return state;
}

function populatePseudocode(act) {
    switch (act) {
      case 0: // Augmenting Path
        document.getElementById('code1').innerHTML = 'for each vertex in' +
            ' the left set'
        document.getElementById('code2').innerHTML = '&nbsp&nbspif there' +
            ' exists an augmenting path'
        document.getElementById('code3').innerHTML = '&nbsp&nbspflip the' + 
            ' status of edges in the augmenting path';
        document.getElementById('code4').innerHTML = 'return';        
        break;
      case 1: //Hopcroft Karp
        document.getElementById('code1').innerHTML = 'while there exists' +
            ' some augmenting path';
        document.getElementById('code2').innerHTML = '&nbsp&nbspfor each' +
            ' vertex in the left set';
        document.getElementById('code3').innerHTML = '&nbsp&nbsp&nbsp&nbsp' +
            'if augmenting path from vertex exists';
        document.getElementById('code4').innerHTML = '&nbsp&nbsp&nbsp&nbsp' +
            '&nbsp&nbspflip edges in augmenting path';
        document.getElementById('code5').innerHTML = 'return';
        break;
      case 2: //rook attack modeling
        $('#code1').html('Create source and sink vertex');
        $('#code2').html('Create one vertex Ri for each row i');
        $('#code3').html('Create one vertex Cj for each column j');
        $('#code4').html('For each rook-placable cell (i,j)');
        $('#code5').html('&nbsp;&nbsp;Add an edge from Ri to Cj');
        $('#code6').html('Run any Max Cardinality Bipartite Matching algorithm');
        $('#code7').html('');
        break;
      case 3: //Augmenting Path with greedy preprocessing
        $('#code1').html('For each vertex v in the left set');
        $('#code2').html('&nbsp&nbspRandomly choose unmatched neighbour x in the right set');
        $('#code3').html('&nbsp&nbspMatch v with x');
        $('#code4').html('Do the normal augmenting path algorithm');
        $('#code5').html('');
        $('#code6').html('');
        $('#code7').html('');
        break;
    }
}


var templates = 
[[{
    0:{
        "cx":250,
        "cy":40,
        "text":1,
    },
    1:{
        "cx":250,
        "cy":120,
        "text":2,
    },
    2:{
        "cx":450,
        "cy":40,
        "text":3
    },
    3:{
        "cx":450,
        "cy":120,
        "text":4
   }
},
  {
      0:{
	  "vertexA": 0,
	  "vertexB": 2,
	  "weight": 1
      },
      1:{
	  "vertexA": 0,
	  "vertexB": 3,
	  "weight": 1
      },
      2:{
	  "vertexA": 1,
	  "vertexB": 2,
	  "weight": 1
      }
  },4,3,2],
 [{
     0:{
         "cx":250,
         "cy":30,
         "text":1
     },
     1:{
         "cx":250,
         "cy":90,
         "text":7
     },
     2:{
         "cx":250,
         "cy":150,
         "text":11
     },
     3:{
         "cx":450,
         "cy":30,
         "text":4
     },
     4:{
         "cx":450,
         "cy":90,
         "text":10
     },
     5:{
         "cx":450,
         "cy":150,
         "text":12
     }
},
  {
      0:{
          "vertexA":0,
          "vertexB":3,
          "weight":1
      },
      1:{
          "vertexA":0,
          "vertexB":4,
          "weight":1
      },
      2:{
          "vertexA":0,
          "vertexB":5,
          "weight":1
      },
      3:{
          "vertexA":1,
          "vertexB":3,
          "weight":1
      },
      4:{
          "vertexA":1,
          "vertexB":4,
          "weight":1
      },
      5:{
          "vertexA":1,
          "vertexB":5,
          "weight":1
      },
      6:{
          "vertexA":2,
          "vertexB":5,
          "weight":1
      }
  },6,7,3],
 [{
     0:{
         "cx":250,
         "cy":40,
         "text":1
     },
     1:{
         "cx":250,
         "cy":120,
         "text":2,
     },
     2:{
         "cx":450,
         "cy":40,
         "text":3
     },
     3:{
         "cx":450,
         "cy":120,
         "text":4
     },
     4:{
         "cx":450,
         "cy":200,
         "text":5
     }
 },
  {
      0:{
          "vertexA":0,
          "vertexB":2,
          "weight":1
      },
      1:{
          "vertexA":0,
          "vertexB":3,
          "weight":1
      },
      2:{
          "vertexA":0,
          "vertexB":4,
          "weight":1
      },
      3:{
          "vertexA":1,
          "vertexB":2,
          "weight":1
      },
      4:{
          "vertexA":1,
          "vertexB":3,
          "weight":1
      },
      5:{
          "vertexA":1,
          "vertexB":4,
          "weight":1
      }
},5,6,2],
[{
      0:{
          "cx":250,
          "cy":40,
          "text":1
      },
      1:{
          "cx":250,
          "cy":100,
          "text":2
      },
      2:{
          "cx":250,
          "cy":160,
          "text":3
      },
      3:{
          "cx":250,
          "cy":220,
          "text":4
      },
      4:{
          "cx":250,
          "cy":280,
          "text":5
      },
      5:{
          "cx":450,
          "cy":40,
          "text":6
      },
      6:{
          "cx":450,
          "cy":100,
          "text":7
      },
      7:{
          "cx":450,
          "cy":160,
          "text":8
      },
      8:{
          "cx":450,
          "cy":220,
          "text":9
      },
      9:{
          "cx":450,
          "cy":280,
          "text":10
      }
},{
      0:{
          "vertexA":0,
          "vertexB":5,
          "weight": 1
      },
      1:{
          "vertexA":0,
          "vertexB":6,
          "weight": 1
      },
      2:{
          "vertexA":0,
          "vertexB":7,
          "weight": 1
      },
      3:{
          "vertexA":0,
          "vertexB":8,
          "weight": 1
      },
      4:{
          "vertexA":0,
          "vertexB":9,
          "weight": 1
      },
      5:{
          "vertexA":1,
          "vertexB":5,
          "weight": 1
      },
      6:{
          "vertexA":1,
          "vertexB":6,
          "weight": 1
      },
      7:{
          "vertexA":1,
          "vertexB":7,
          "weight": 1
      },
      8:{
          "vertexA":1,
          "vertexB":8,
          "weight": 1
      },
      9:{
          "vertexA":1,
          "vertexB":9,
          "weight": 1
      },
      10:{
          "vertexA":2,
          "vertexB":5,
          "weight": 1
      },
      11:{
          "vertexA":2,
          "vertexB":6,
          "weight": 1
      },
      12:{
          "vertexA":2,
          "vertexB":7,
          "weight": 1
      },
      13:{
          "vertexA":2,
          "vertexB":8,
          "weight": 1
      },
      14:{
          "vertexA":2,
          "vertexB":9,
          "weight": 1
      },
      15:{
          "vertexA":3,
          "vertexB":5,
          "weight": 1
      },
      16:{
          "vertexA":3,
          "vertexB":6,
          "weight": 1
      },
      17:{
          "vertexA":3,
          "vertexB":7,
          "weight": 1
      },
      18:{
          "vertexA":3,
          "vertexB":8,
          "weight": 1
      },
      19:{
          "vertexA":3,
          "vertexB":9,
          "weight": 1
      },
      20:{
          "vertexA":4,
          "vertexB":5,
          "weight": 1
      },
      21:{
          "vertexA":4,
          "vertexB":6,
          "weight": 1
      },
      22:{
          "vertexA":4,
          "vertexB":7,
          "weight": 1
      },
      23:{
          "vertexA":4,
          "vertexB":8,
          "weight": 1
      },
      24:{
          "vertexA":4,
          "vertexB":9,
          "weight": 1
      }
  },10,25,5]];      
