// @author Jonathan Irvin Gunawan
// Defines an Maximum Flow object; keeps implementation of graph internally and interact with GraphWidget to display Max Flow algorithm, and also maxflow modeling problem

// Maximum Flow Example Constants
var MAXFLOW_EXAMPLE_CP3_4_24 = 0;
var MAXFLOW_EXAMPLE_CP3_4_26_1 = 1;
var MAXFLOW_EXAMPLE_CP3_4_26_2 = 2;
var MAXFLOW_EXAMPLE_CP3_4_26_3 = 3;
var MAXFLOW_EXAMPLE_FORD_KILLER = 4;
var MAXFLOW_EXAMPLE_1 = 5;
var noOfExamples = 6;
var INF = 1000000000;

var MAXFLOW = function(){
  var self = this;
  var graphWidget = new GraphWidget();

  /*
   *  Structure of internalAdjList: JS object with
   *  - key: vertex number
   *  - value: JS object with
   *           - key: the other vertex number that is connected by the edge
   *           - value: ID of the edge, NOT THE WEIGHT OF THE EDGE
   *
   *  The reason why the adjList didn't store edge weight is because it will be easier to create bugs
   *  on information consistency between the adjList and edgeList
   *
   *  Structure of internalEdgeList: JS object with
   *  - key: edge ID
   *  - value: JS object with the following keys:
   *           - vertexA
   *           - vertexB
   *           - weight
   */

  var internalAdjList = {};
  var internalEdgeList = {};
  var amountVertex = 0;
  var amountEdge = 0;
  var stateList = [];

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
      internalEdgeList[key]["type"] = EDGE_TYPE_UDE;
      internalEdgeList[key]["displayWeight"] = true;
    }
    for (var key in internalAdjList)
      internalAdjList[key]["text"] = key;
    for (var key in internalEdgeList)
    {
      internalAdjList[internalEdgeList[key]["vertexA"]][internalEdgeList[key]["vertexB"]] = +key;
      internalAdjList[internalEdgeList[key]["vertexB"]][internalEdgeList[key]["vertexA"]] = +key;
      internalEdgeList[key]["weight"] = +internalEdgeList[key]["weight"];
    }
  }

  takeJSON = function(graph)
  {
    graph = JSON.parse(graph);
    internalAdjList = graph["vl"];
    internalEdgeList = graph["el"];
    fixJSON();
  }

  statusChecking = function()
  {
    if (amountVertex == 0)
      $("#draw-status p").html("Graph is empty");
    else
      $("#draw-status p").html("Source is vertex #0. Sink is vertex #" + (amountVertex-1));
    $("#sinkvertex").val(amountVertex-1);
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
    if (amountVertex == 0)
    {
      $("#draw-err p").html("Graph cannot be empty. ");
      return;
    }
    
    var visited = [];
    var stack = [];
    stack.push(0);
    visited[0] = true;
    while (stack.length > 0)
    {
      var now = stack.pop();
      for (var key2 in internalEdgeList) if(internalEdgeList[key2]["vertexA"] == now)
      {
        if (!visited[internalEdgeList[key2]["vertexB"]])
        {
          visited[internalEdgeList[key2]["vertexB"]] = true;
          stack.push(+internalEdgeList[key2]["vertexB"]);
        }
      }
    }
    if (!visited[amountVertex-1]) 
      error = error + "Source and sink is not connected. "
    var leftmost = INF, rightmost = -INF;
    for (var key in internalAdjList)
    {
      leftmost = Math.min(leftmost,internalAdjList[key]["cx"]);
      rightmost = Math.max(rightmost,internalAdjList[key]["cx"]);
    }
    if (leftmost < internalAdjList[0]["cx"])
      error = error + "Source is not the left most vertex. "
    if (rightmost > internalAdjList[amountVertex-1]["cx"])
      error = error + "Sink is not the right most vertex. "

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
  
  this.draw = function() 
  {
    if ($("#draw-err p").html() != "No Error") return false;
    if ($("#submit").is(':checked'))
      this.submit(JSONresult);
    if ($("#copy").is(':checked'))
    {
      window.prompt("Copy to clipboard:",JSONresult);
    }

    graph = createState(internalAdjList,internalEdgeList);
    graphWidget.updateGraph(graph, 500);
    return true;
  }

  this.submit = function(graph)
  {
    $.ajax({
                    url: "http://algorithmics.comp.nus.edu.sg/~onlinequiz/erinplayground/php/Graph.php?mode=" + MODE_SUBMIT_GRAPH + "&sessionID=" + $.cookie("sessionID"),
                    type: "POST",
                    data: {canvasWidth: 1000, canvasHeight: 500, graphTopics: 'Max Flow', graphState: graph},
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

  //returns index of edge in internalEdgeList that connects vertexA to vertexB
  var findEdgeIndex = function(vertexA,vertexB)
  {
    for (i in internalEdgeList)
      if(internalEdgeList[i]["vertexA"] == vertexA && internalEdgeList[i]["vertexB"] == vertexB)
        return i;
    return -1;
  }

  this.edmondskarp = function(sourceVertex, sinkVertex)
  {
    var existAugmentingPath = true;
    var MaxFlow = 0;

    while (existAugmentingPath)
    {

      existAugmentingPath = false;
      var edgeYellow = {};
      var edgeRed = {};
      var edgeBlue = {};
      var vertexTraversed = {};
      var vertexHighlighted = {};
      var parent = new Array(amountVertex);
      var visited = new Array(amountVertex);
      for (i in internalAdjList)
      {
        parent[i] = -1;
        visited[i] = false;
      }

      var BFSQueue = [];
      BFSQueue.push([sourceVertex,INF]);
      visited[sourceVertex] = true;
      while (BFSQueue.length > 0)
      {
        var now = BFSQueue.shift(); //pop front item
        var nowVertex = now[0];
        var nowCapacity = now[1];
        if (nowVertex == sinkVertex)
        {
          var path = [];
          while (nowVertex != sourceVertex)
          {
            path.push(nowVertex);
            nowVertex = parent[nowVertex];
          }
          path.push(sourceVertex);
          var bottleneck = [-1,-1]; //[forward edge,back edge]

          for (var i = path.length-1; i >= 1; --i)
          {
            var backEdge = findEdgeIndex(path[i-1],path[i]);
            var forwardEdge = findEdgeIndex(path[i],path[i-1]);
            //if capacity < bottleneck
            if (bottleneck[0] == -1 || internalEdgeList[forwardEdge]["weight"] < internalEdgeList[bottleneck[0]]["weight"])
            {
              //update bottleneck
              if (bottleneck[0] != -1)
              {
                delete edgeRed[bottleneck[0]];
                delete edgeRed[bottleneck[1]];
                edgeYellow[bottleneck[0]] = true;
                edgeYellow[bottleneck[1]] = true;
              }
              edgeRed[backEdge] = true;
              edgeRed[forwardEdge] = true;
              bottleneck = [forwardEdge,backEdge];
            } else
            {
              edgeYellow[backEdge] = true;
              edgeYellow[forwardEdge] = true;
            }
            currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow);
            currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
            currentState["status"] += '<br>Find an augmenting path. Bottleneck is ' + internalEdgeList[bottleneck[0]]["weight"] + ' (indicated by red)</br>';
            currentState["lineNo"] = [3];
            stateList.push(currentState);
          }

          currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow);
          currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
          currentState["status"] += '<br>Got an augmenting path by BFS. Bottleneck is ' + nowCapacity + ' (indicated by red)</br>';
          currentState["lineNo"] = [3];
          stateList.push(currentState);

          nowVertex = sinkVertex;

          while (nowVertex != sourceVertex)
          {
            var backEdge = findEdgeIndex(nowVertex,parent[nowVertex]);
            var forwardEdge = findEdgeIndex(parent[nowVertex],nowVertex);

            internalEdgeList[forwardEdge]["weight"] -= nowCapacity;
            internalEdgeList[backEdge]["weight"] += nowCapacity;

            var bottleneck = false;

            if (edgeRed.hasOwnProperty(backEdge)) bottleneck = true;

            if (bottleneck)
            {
              delete edgeRed[forwardEdge];
              delete edgeRed[backEdge];
            } else
            {
              delete edgeYellow[forwardEdge];
              delete edgeYellow[backEdge];
            }

            edgeBlue[forwardEdge] = true;
            edgeBlue[backEdge] = true;

            currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
            currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
            currentState["status"] += '<br>Bottleneck is ' + nowCapacity + ' (indicated by red). Updating edge from ' + parent[nowVertex] + ' to ' + nowVertex + ' (blue)</br>';
            currentState["lineNo"] = [4,5,6];

            nowVertex = parent[nowVertex];
            stateList.push(currentState);

            delete edgeBlue[forwardEdge];
            delete edgeBlue[backEdge];

            if (bottleneck)
            {
              edgeRed[forwardEdge] = true;
              edgeRed[backEdge] = true;
            } else
            {
              edgeYellow[forwardEdge] = true;
              edgeYellow[backEdge] = true;
            }

          }
          existAugmentingPath = true;
          MaxFlow += nowCapacity;
          currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
          currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
          currentState["status"] += '<br>Maximum flow increased by ' + nowCapacity + '</br>';
          currentState["lineNo"] = [7];
          stateList.push(currentState);
          break;
        }
        for (i in internalEdgeList)
        {
          var vertexA = internalEdgeList[i]["vertexA"];
          var vertexB = internalEdgeList[i]["vertexB"];
          var capacity = internalEdgeList[i]["weight"];
          if (nowVertex == vertexA && !visited[vertexB] && capacity > 0)
          {
            visited[vertexB] = true;
            parent[vertexB] = vertexA;
            if (capacity < nowCapacity)
              BFSQueue.push([vertexB,capacity]);
            else BFSQueue.push([vertexB,nowCapacity]);
          }
        }
      }
    }

    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
    currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
    currentState["status"] += '<br>No more augmenting path</br>';
    currentState["lineNo"] = [];
    stateList.push(currentState);
    populatePseudocode(0);
  }

  this.fordfulkerson = function(sourceVertex, sinkVertex)
  {
    var existAugmentingPath = true;
    var MaxFlow = 0;
    var numberOfAugmentingPaths = 0;

    while (existAugmentingPath)
    {
      ++numberOfAugmentingPaths;
      existAugmentingPath = false;
      var edgeYellow = {};
      var edgeRed = {};
      var edgeBlue = {};
      var vertexTraversed = {};
      var vertexHighlighted = {};
      var parent = new Array(amountVertex);
      var visited = new Array(amountVertex);
      for (i in internalAdjList)
      {
        parent[i] = -1;
        visited[i] = false;
      }


      var DFSStack = [];
      DFSStack.push([sourceVertex,INF]);
      //visited[sourceVertex] = true;
      while (DFSStack.length > 0)
      {
        var now = DFSStack.pop(); //last most item
        var nowVertex = now[0];
        var nowCapacity = now[1];
        if (visited[nowVertex]) continue;
        visited[nowVertex] = true;
        if (nowVertex == sinkVertex)
        {
          var path = [];
          while (nowVertex != sourceVertex)
          {
            path.push(nowVertex);
            nowVertex = parent[nowVertex];
          }
          path.push(sourceVertex);
          var bottleneck = [-1,-1]; //[forward edge,back edge]

          for (var i = path.length-1; i >= 1; --i)
          {
            var backEdge = findEdgeIndex(path[i-1],path[i]);
            var forwardEdge = findEdgeIndex(path[i],path[i-1]);
            if (bottleneck[0] == -1 || internalEdgeList[forwardEdge]["weight"] < internalEdgeList[bottleneck[0]]["weight"])
            {
              if (bottleneck[0] != -1)
              {
                delete edgeRed[bottleneck[0]];
                delete edgeRed[bottleneck[1]];
                edgeYellow[bottleneck[0]] = true;
                edgeYellow[bottleneck[1]] = true;
              }
              edgeRed[backEdge] = true;
              edgeRed[forwardEdge] = true;
              bottleneck = [forwardEdge,backEdge];
            } else
            {
              edgeYellow[backEdge] = true;
              edgeYellow[forwardEdge] = true;
            }
            currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow);
            currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
            currentState["status"] += '<br>Find an augmenting path. Bottleneck is ' + internalEdgeList[bottleneck[0]]["weight"] + ' (indicated by red)</br>';
            currentState["lineNo"] = [3];
            stateList.push(currentState);
          }

          currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
          currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
          currentState["status"] += '<br>Got an augmenting path by DFS. Bottleneck is ' + nowCapacity + ' (indicated by red)</br>';
          currentState["lineNo"] = [3];
          stateList.push(currentState);

          nowVertex = sinkVertex;

          while (nowVertex != sourceVertex)
          {            
            var backEdge = findEdgeIndex(nowVertex,parent[nowVertex]);
            var forwardEdge = findEdgeIndex(parent[nowVertex],nowVertex);

            internalEdgeList[forwardEdge]["weight"] -= nowCapacity;
            internalEdgeList[backEdge]["weight"] += nowCapacity;

            var bottleneck = false;

            if (edgeRed.hasOwnProperty(backEdge)) bottleneck = true;

            if (bottleneck)
            {
              delete edgeRed[forwardEdge];
              delete edgeRed[backEdge];
            } else
            {
              delete edgeYellow[forwardEdge];
              delete edgeYellow[backEdge];
            }

            edgeBlue[forwardEdge] = true;
            edgeBlue[backEdge] = true;

            currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
            currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
            currentState["status"] += '<br>Bottleneck is ' + nowCapacity + ' (indicated by red). Updating edge from ' + parent[nowVertex] + ' to ' + nowVertex + ' (blue)</br>';
            currentState["lineNo"] = [4,5,6];

            nowVertex = parent[nowVertex];
            stateList.push(currentState);

            delete edgeBlue[forwardEdge];
            delete edgeBlue[backEdge];

            if (bottleneck)
            {
              edgeRed[forwardEdge] = true;
              edgeRed[backEdge] = true;
            } else
            {
              edgeYellow[forwardEdge] = true;
              edgeYellow[backEdge] = true;
            }

          }
          existAugmentingPath = true;
          MaxFlow += nowCapacity;
          currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
          currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
          currentState["status"] += '<br>Maximum flow increased by ' + nowCapacity + '</br>';
          currentState["lineNo"] = [7];
          stateList.push(currentState);
          break;
        }
        var DFStempStack = [];
        for (i in internalEdgeList)
        {
          var vertexA = internalEdgeList[i]["vertexA"];
          var vertexB = internalEdgeList[i]["vertexB"];
          var capacity = internalEdgeList[i]["weight"];
          if (nowVertex == vertexA && !visited[vertexB] && capacity > 0)
          {
            parent[vertexB] = vertexA;
            if (numberOfAugmentingPaths % 2 == 0 && nowVertex == 0)
            {
              if (capacity < nowCapacity)
                DFStempStack.push([vertexB,capacity]);
              else DFStempStack.push([vertexB,nowCapacity]);
            } else
            {
              if (capacity < nowCapacity)
                DFSStack.push([vertexB,capacity]);
              else DFSStack.push([vertexB,nowCapacity]);
            }
          }
        }
        while (DFStempStack.length > 0)
          DFSStack.push(DFStempStack.pop());
      }
    }

    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
    currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
    currentState["status"] += '<br>No more augmenting path</br>';
    currentState["lineNo"] = [];
    stateList.push(currentState);
    populatePseudocode(1);
  }

  this.dinic = function(sourceVertex, sinkVertex)
  {
    var existBlockingFlow = true;
    var MaxFlow = 0;

    while (existBlockingFlow)
    {
      existBlockingFlow = false;
      var edgeBlue = {};
      var vertexTraversed = {};
      var vertexHighlighted = {};
      var visited = new Array(amountVertex);
      var distance = new Array(amountVertex);
      for (i in internalAdjList)
      {
        visited[i] = false;
        distance[i] = INF;
      }

      var BFSQueue = [];
      BFSQueue.push(sourceVertex);
      distance[sourceVertex] = 0;
      while (BFSQueue.length > 0)
      {
        var nowVertex = BFSQueue.shift();
        for (i in internalEdgeList)
        {
          var vertexA = internalEdgeList[i]["vertexA"];
          var vertexB = internalEdgeList[i]["vertexB"];
          var capacity = internalEdgeList[i]["weight"];
          if (nowVertex == vertexA && distance[vertexB] == INF && capacity > 0)
          {
            distance[vertexB] = distance[vertexA] + 1;
            BFSQueue.push(vertexB);
          }
        }
      }
      for (i in internalEdgeList)
      {
        var vertexA = internalEdgeList[i]["vertexA"];
        var vertexB = internalEdgeList[i]["vertexB"];
        var capacity = internalEdgeList[i]["weight"];
        if (capacity > 0 && distance[vertexA] + 1 == distance[vertexB])
        {
          edgeBlue[i] = true;
          edgeBlue[findEdgeIndex(vertexB,vertexA)] = true;
        }
      }

      if (distance[sinkVertex] == INF) break;
      
      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
      currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
      currentState["status"] += '<br>Got the level graph (indicated by blue). Sink is level ' + distance[sinkVertex] + '</br>';
      currentState["lineNo"] = [3];
      stateList.push(currentState);

      var edgeBlueTemp = edgeBlue;

      var existAugmentingPath = true;

      while (existAugmentingPath)
      {
        existAugmentingPath = false;
        edgeBlue = edgeBlueTemp;
        var edgeYellow = {};
        var edgeRed = {};
        var parent = new Array(amountVertex);

        var DFSStack = [];
        DFSStack.push([sourceVertex,INF]);
        while (DFSStack.length > 0)
        {
          var now = DFSStack.pop(); //last most item
          var nowVertex = now[0];
          var nowCapacity = now[1];
          if (nowVertex == sinkVertex)
          {
            while (nowVertex != sourceVertex)
            { 
              var backEdge = findEdgeIndex(nowVertex,parent[nowVertex]);
              var forwardEdge = findEdgeIndex(parent[nowVertex],nowVertex);

              delete edgeBlue[backEdge]; 
              delete edgeBlue[forwardEdge];

              if (internalEdgeList[forwardEdge]["weight"] != nowCapacity)
              {
                edgeYellow[backEdge] = true;
                edgeYellow[forwardEdge] = true;
              } else
              {
                edgeRed[backEdge] = true;
                edgeRed[forwardEdge] = true;
              }

              nowVertex = parent[nowVertex];
            }
            currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
            currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
            currentState["status"] += '<br>Found a blocking flow. Bottleneck is ' + nowCapacity + ' (indicated by red)</br>';
            currentState["lineNo"] = [4];
            stateList.push(currentState);

            nowVertex = sinkVertex;

            while (nowVertex != sourceVertex)
            {            
              var backEdge = findEdgeIndex(nowVertex,parent[nowVertex]);
              var forwardEdge = findEdgeIndex(parent[nowVertex],nowVertex);

              internalEdgeList[forwardEdge]["weight"] -= nowCapacity;
              internalEdgeList[backEdge]["weight"] += nowCapacity;

              var bottleneck = false;

              if (edgeRed.hasOwnProperty(backEdge)) bottleneck = true;

              currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
              currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
              currentState["status"] += '<br>Bottleneck is ' + nowCapacity + ' (indicated by red). Updating edge from ' + parent[nowVertex] + ' to ' + nowVertex + ' (blue)</br>';
              currentState["lineNo"] = [5];

              nowVertex = parent[nowVertex];
              stateList.push(currentState);

            }
            existAugmentingPath = true;
            existBlockingFlow = true;
            MaxFlow += nowCapacity;
            currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
            currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
            currentState["status"] += '<br>Maximum flow increased by ' + nowCapacity + '</br>';
            currentState["lineNo"] = [6];
            stateList.push(currentState);
            break;
          }
          for (i in internalEdgeList)
          {
            var vertexA = internalEdgeList[i]["vertexA"];
            var vertexB = internalEdgeList[i]["vertexB"];
            var capacity = internalEdgeList[i]["weight"];
            if (nowVertex == vertexA && capacity > 0 && distance[vertexA] + 1 == distance[vertexB])
            {
              parent[vertexB] = vertexA;
              if (capacity < nowCapacity)
                DFSStack.push([vertexB,capacity]);
              else DFSStack.push([vertexB,nowCapacity]);
            }
          }
        }
      }
    }

    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue);
    currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + MaxFlow;
    currentState["status"] += '<br>No more flow from source to sink</br>';
    currentState["lineNo"] = [];
    stateList.push(currentState);
    populatePseudocode(2);
  }

  this.countmaxflow = function(algorithm,sourceVertex,sinkVertex)
  {
    stateList = [];

    // error checks
    if (amountVertex == 0) { // no graph
      $('#countmaxflow-err').html("There is no graph to run this on. Please select a sample graph first.");
      return false;
    }

    if (sourceVertex >= amountVertex || sourceVertex < 0) { // source vertex not in range
      $('#countmaxflow-err').html("The source vertex does not exist in the graph. Please select another source vertex.");
      return false;
    }

    if (sinkVertex >= amountVertex || sinkVertex < 0) { // sink vertex not in range
      $('#countmaxflow-err').html("The sink vertex does not exist in the graph. Please select another source vertex.");
      return false;
    }

    if (sourceVertex == sinkVertex) { // sink vertex not in range
      $('#countmaxflow-err').html("The source vertex is the same as the sink vertex. Please select another source/sink vertex.");
      return false;
    }

    for (i in internalAdjList)
      if (i >= amountVertex) delete internalAdjList[i];

    for (i in internalEdgeList)
      if (i >= amountEdge) delete internalEdgeList[i];

    var currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + 0;
    currentState["status"] += '<br>The original graph</br>';
    stateList.push(currentState);


    //creating residual graph (backedges for every edge)
    for (i in internalEdgeList)
    {
      var backEdge = new Object();
      backEdge["vertexA"] = internalEdgeList[i]["vertexB"];
      backEdge["vertexB"] = internalEdgeList[i]["vertexA"];
      backEdge["weight"] = 0;
      // if backEdge is not on the internalEdgeList yet
      if (findEdgeIndex(backEdge["vertexA"],backEdge["vertexB"]) == -1)
      {
        //insert backEdge to internalEdgeList
        internalEdgeList[amountEdge] = (backEdge);
        ++amountEdge;
      }
    }

    var currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Maximum flow from ' + sourceVertex + ' to ' + sinkVertex + ' is ' + 0;
    currentState["status"] += '<br>Preparing residual graph</br>';
    stateList.push(currentState);

    //run the maxflow algorithm
    if (algorithm == "edmondskarp") this.edmondskarp(sourceVertex,sinkVertex); 
    if (algorithm == "fordfulkerson") this.fordfulkerson(sourceVertex,sinkVertex); 
    if (algorithm == "dinic") this.dinic(sourceVertex,sinkVertex); 
    graphWidget.startAnimation(stateList);
    return true;
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
      amountVertex = 2 + numOfRows + numOfColumns;

      internalAdjList[0] = 
      {
        "cx": 25,
        "cy": 175,
        "text": 0
      }

      internalAdjList[amountVertex - 1] = 
      {
        "cx": 625,
        "cy": 175,
        "text": amountVertex - 1
      }

      vertexHighlighted[0] = vertexHighlighted[amountVertex-1] = true;
      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Create source and sink vertex';
      currentState["lineNo"] = [1];
      stateList.push(currentState);
      delete vertexHighlighted[0]; delete vertexHighlighted[amountVertex-1];

      for (var i = 1; i <= numOfRows; ++i)
      {
        internalAdjList[i] = 
        {
          "cx": 225,
          "cy": (175 + (i - (numOfRows + 1) / 2) * (numOfRows == 1 ? 0 : 300 / (numOfRows - 1))),
          "text": "R" + i
        }
        internalEdgeList[amountEdge] = 
        {
          "vertexA": 0,
          "vertexB": i,
          "weight": 1
        }
        ++amountEdge;
        vertexHighlighted[i] = true;
      }

      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Create a node for each rows';
      currentState["status"] += '<br>and connect source vertex to each node with capacity 1</br>';
      currentState["lineNo"] = [2];
      stateList.push(currentState);
      for (var i = 1; i <= numOfRows; ++i)
        delete vertexHighlighted[i];

      for (var i = 1; i <= numOfColumns; ++i)
      {
        internalAdjList[i + numOfRows] = 
        {
          "cx": 425,
          "cy": (175 + (i - (numOfColumns + 1) / 2) * (numOfColumns == 1 ? 0 : 300 / (numOfColumns - 1))),
          "text": "C" + i
        }
        internalEdgeList[amountEdge] = 
        {
          "vertexA": i + numOfRows,
          "vertexB": amountVertex - 1,
          "weight": 1
        }
        ++amountEdge;
        vertexHighlighted[i + numOfRows] = true;
      }
      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Create a node for each columns';
      currentState["status"] += '<br>and connect each node to sink vertex with capacity 1</br>';
      currentState["lineNo"] = [3];
      stateList.push(currentState);
      for (var i = 1; i <= numOfColumns; ++i)
        delete vertexHighlighted[i + numOfRows];


      for (var i = 0; i < numOfRows; ++i)
      {
        for (var j = 0; j < numOfColumns; ++j)
        {
          var existEdge = 1 - blocked[i][j];
          if (existEdge == 1)
          {
            internalEdgeList[amountEdge] = 
            {
              "vertexA": i + 1,
              "vertexB": j + 1 + numOfRows,
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

      $('#sourcevertex').val(0);
      $('#sinkvertex').val(amountVertex-1);

      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'Run any maximum flow algorithm from 0 to ' + (amountVertex - 1);
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
      maxflowWidget.createBipartiteGraph();
      $('#current-action').show();
      $('#current-action p').html("Modeling()");
      $('#progress-bar').slider( "option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      populatePseudocode(3);
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
        toWrite += '<td height="50" bgcolor="white" id="cell' + i + j + '" onclick=maxflowWidget.changeState('+i+','+j+')></td>';
      toWrite += '</tr>';
    }

    toWrite += '</table>\n';
    toWrite += '<div class="modeling-actions">';
    toWrite += '<p onclick=maxflowWidget.inputRandomized()>Randomized</p>';
    toWrite += '<p onclick=maxflowWidget.inputFinished()>Done</p>';
    toWrite += '<p onclick=maxflowWidget.cancel()>Cancel</p>';
    toWrite += '</div>\n'
    toWrite += '</html>\n';
    $('#rookattack-board').html(toWrite);
    $('#rookattack-board').show("slow");
  }

  this.baseball = function()
  {
    var numOfTeams = parseInt($('#teams').val());
    var numOfGames = new Array(numOfTeams);
    var initialPoints = new Array(numOfTeams);
  
    for (var i = 0; i < numOfTeams; ++i)
      numOfGames[i] = new Array(numOfTeams);

    if (numOfTeams < 1 || numOfTeams > 6) { // no graph
      $('#modeling-err').html("Invalid number of teams. Number of teams must be between 1 and 6 inclusive.");
      return false;
    }

    setInterval(function()
    {
      for (var i = 0; i < numOfTeams; ++i)
      {
        numOfGames[i][i] = 0;
        $("#game" + i + i).val(0);
        for (var j = 0; j < i; ++j)
        {
          $("#game" + i + j).val($("#game" + j + i).val());
        }
      }
    },100);

    this.inputRandomized = function()
    {
      for (var i = 0; i < numOfTeams; ++i)
      {
        initialPoints[i] = Math.floor(Math.random() * 10); //0 - 9
        $("#point" + i).val(initialPoints[i]);
        for (var j = 0; j < numOfTeams; ++j)
        {
          numOfGames[i][j] = Math.floor(Math.random() * 10); //0 - 9
          $("#game" + i + j).val(numOfGames[i][j]);
        }
      }
    }

    this.createGraph = function(checkTeamIndex)
    {
      internalAdjList = {};
      internalEdgeList = {};
      vertexHighlighted = {};
      edgeRed = {};
      stateList = [];
      var currentState;
      var numOfMatches = ((numOfTeams - 1) * (numOfTeams - 2)) / 2;
      var totalMaxFlow = 0;
      amountEdge = 0;
      amountVertex = 2 + numOfMatches + (numOfTeams - 1);
      var totalNumberOfGames = new Array(numOfTeams);
      var vertexIndex = new Array(numOfTeams);
      for (var i = 0; i < numOfTeams; ++i)
      {
        totalNumberOfGames[i] = 0;
        vertexIndex[i] = new Array(numOfTeams);
        initialPoints[i] = (+$("#point" + i).val());
        for (var j = 0; j < numOfTeams; ++j)
        {
          numOfGames[i][j] = +($("#game" + i + j).val());
          totalNumberOfGames[i] += (numOfGames[i][j]);
          console.log(i + " " + j + " " + numOfGames[i][j]);
        }
      }

      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Assume Team ' + checkTeamIndex + ' wins all remaining games';
      currentState["status"] += '<br>Team ' + checkTeamIndex + ' will win ' + initialPoints[checkTeamIndex] + ' + ' + totalNumberOfGames[checkTeamIndex];
      currentState["status"] += ' = ' + (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + ' games</br>';
      currentState["lineNo"] = [1];
      stateList.push(currentState);

      for (var i = 0; i < numOfTeams; ++i) if (i != checkTeamIndex)
      {
        currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
        currentState["status"] = 'Assume T' + i + ' loses all remaining games. ';
        currentState["status"] += 'T' + i + ' will win ' + initialPoints[i] + ' games';
        if (initialPoints[i] <= initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex])
        {
          currentState["status"] += '<br>Because ' + initialPoints[i] + '<=' + (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + ', team ' + checkTeamIndex + ' can still win the league</br>';
          currentState["lineNo"] = [1];
          stateList.push(currentState);     
        } else
        {
          currentState["status"] += '<br>Because ' + initialPoints[i] + '>' + (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + ', team ' + checkTeamIndex + ' is obviously eliminated</br>';
          currentState["lineNo"] = [1];
          stateList.push(currentState);
          graphWidget.startAnimation(stateList);
          return true;
        }   
      }


      internalAdjList[0] = {"cx": 25, "cy": 175, "text": 0}

      internalAdjList[amountVertex - 1] = { "cx": 625, "cy": 175, "text": amountVertex - 1 }

      vertexHighlighted[0] = vertexHighlighted[amountVertex-1] = true;
      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Create source and sink vertex';
      currentState["lineNo"] = [];
      stateList.push(currentState);
      delete vertexHighlighted[0]; delete vertexHighlighted[amountVertex-1];

      amountVertex = 1;


      //create left set of vertices
      for (var i = 0; i < numOfTeams; ++i) if(i != checkTeamIndex)
      {
        for (var j = i + 1; j < numOfTeams; ++j) if(j != checkTeamIndex)
        {
          totalMaxFlow += numOfGames[i][j];
          internalAdjList[amountVertex] = 
          {
            "cx": 225,
            "cy": (175 + (amountVertex - (numOfMatches + 1) / 2) * (numOfMatches == 1 ? 0 : 300 / (numOfMatches - 1))),
            "text": i + "v" + j
          }
          internalEdgeList[amountEdge] = 
          {
            "vertexA": 0,
            "vertexB": amountVertex,
            "weight": numOfGames[i][j]
          }
          vertexHighlighted[amountVertex] = true;
          edgeRed[amountEdge] = true;
          currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeRed);
          currentState["status"] = 'Create a node for a match between T' + i + ' and T' + j + '. There are ' + numOfGames[i][j] + ' matches remaining';
          currentState["status"] += '. Connect source vertex to that node with capacity ' + numOfGames[i][j];
          currentState["lineNo"] = [2,3];
          stateList.push(currentState);
          delete vertexHighlighted[amountVertex];
          delete edgeRed[amountEdge];

          vertexIndex[i][j] = amountVertex;
          ++amountVertex;
          ++amountEdge;
        }
      }

      

      //create right set of vertices
      for (var i = 0; i < numOfTeams; ++i) if (i != checkTeamIndex)
      {
        internalAdjList[amountVertex] = 
        {
          "cx": 425,
          "cy": (175 + ((i+(i<checkTeamIndex?1:0)) - (numOfTeams) / 2) * (numOfTeams == 2 ? 0 : 300 / (numOfTeams - 2))),
          "text": "T" + i
        }
        var weight = (+initialPoints[checkTeamIndex]) + (+totalNumberOfGames[checkTeamIndex]) - (+initialPoints[i]);
        internalEdgeList[amountEdge] = 
        {
          "vertexA": amountVertex,
          "vertexB": 1 + numOfMatches + (numOfTeams - 1),
          "weight": weight
        }
        vertexHighlighted[amountVertex] = true;
        edgeRed[amountEdge] = true;
        currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeRed);
        currentState["status"] = 'Create a node for a Team ' + i + '. Team ' + i + ' may win ';
        currentState["status"] += (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + '-' + initialPoints[i] + ' = ' + weight + ' matches more';
        currentState["status"] += '. Connect that node to sink vertex with capacity ' + weight;
        currentState["lineNo"] = [4,5];
        stateList.push(currentState);
        delete vertexHighlighted[amountVertex];
        delete edgeRed[amountEdge];

        ++amountVertex;
        ++amountEdge;
      }



      //create middle edges
      for (var i = 0; i < numOfTeams; ++i) if (i != checkTeamIndex)
      {
        for (var j = i + 1; j < numOfTeams; ++j) if (j != checkTeamIndex)
        {
          internalEdgeList[amountEdge] = 
          {
            "vertexA": vertexIndex[i][j],
            "vertexB": amountVertex - numOfTeams + i + (i < checkTeamIndex ? 1 : 0),
            "weight": 9
          }
          edgeRed[amountEdge] = true;
          ++amountEdge;

          internalEdgeList[amountEdge] = 
          {
            "vertexA": vertexIndex[i][j],
            "vertexB": amountVertex - numOfTeams + j + (j < checkTeamIndex ? 1 : 0),
            "weight": 9
          }
          edgeRed[amountEdge] = true;
          ++amountEdge;

          currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeRed);
          currentState["status"] = 'Adding edge from R' + i + ' to C' + j + ' with capacity INF';
          currentState["lineNo"] = [6];
          //currentState["status"] += '<br>Adding edge from R' + i + ' to C' + j + '</br>';
          stateList.push(currentState);
          delete edgeRed[amountEdge-1];
          delete edgeRed[amountEdge-2];
        }
      }

      amountVertex = 0;
      amountEdge = 0;
      for (var i in internalAdjList) ++amountVertex;
      for (var i in internalEdgeList) ++amountEdge;

      $('#sourcevertex').val(0);
      $('#sinkvertex').val(amountVertex-1);

      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'Run any maximum flow algorithm from 0 to ' + (amountVertex - 1);
      currentState["status"] += '. Iff all source edges are saturated (maxflow = ' + totalMaxFlow + '), '
      currentState["status"] += 'then Team ' + checkTeamIndex + ' is not eliminated';
      currentState["lineNo"] = [7];
      stateList.push(currentState);
      graphWidget.startAnimation(stateList);
      return true;
    }

    this.inputFinished = function(checkTeamIndex)
    {
      $('.overlays').hide("slow");
      $('#dark-overlay').hide("slow");
      $('#baseball-board').hide("slow");
      maxflowWidget.createGraph(checkTeamIndex);
      $('#current-action').show();
      $('#current-action p').html("Modeling()");
      $('#progress-bar').slider( "option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      populatePseudocode(4);
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

    $('#dark-overlay').show("slow");
    var toWrite = '<html>\n';
    toWrite += '<p>Fill in the table below.\n';
    toWrite += ' Don\'t modify the black cells, they will be updated automatically</p>\n';
    toWrite += '<p>Click on any team to check whether the team is eliminated or not</p>\n';
    toWrite += '<table border="1" id="board">\n';
    for (var j = 0; j < numOfTeams + 2; ++j)
    {
      toWrite += '<col width="50">';
    }

    toWrite += '<tr>';
    toWrite += '<td rowspan="2">Team Index</td><td rowspan="2">Initial Points</td>';
    toWrite += '<td colspan="5" align="center">Remaining Games</td>';
    toWrite += '</tr>';
    toWrite += '<tr>';
    for (var i = 0; i < numOfTeams; ++i)
    {
      toWrite += '<td>Team ' + i + '</td>';
    }
    toWrite += '</tr>';

    for (var i = 0; i < numOfTeams; ++i)
    {
      toWrite += '<tr>';
      toWrite += '<td><div class="modeling-actions">';
      toWrite += '<p onclick=maxflowWidget.inputFinished('+i+')>Team ' + i + '</p>';
      toWrite += '</div></td>';
      toWrite += '<td height="50" bgcolor="white"><input id="point' + i + '" value=0 /></td>';
      for (var j = 0; j < numOfTeams; ++j) 
      {
        if (j > i)
        {
          toWrite += '<td height="50" bgcolor="white"><input id="game' + i + j + '" value=0 /></td>';
        }
        else 
        {
          toWrite += '<td height="50" bgcolor="black"><input style="background-color:black;color:white;" id="game' + i + j + '" value=0 /></td>';
        }
      }
      toWrite += '</tr>';
    }

    toWrite += '</table>\n';
    toWrite += '<div class="modeling-actions">';
    toWrite += '<p onclick=maxflowWidget.inputRandomized()>Randomized</p>';
    toWrite += '<p onclick=maxflowWidget.cancel()>Cancel</p>';
    toWrite += '</div>';
    toWrite += '</html>\n';
    $('#baseball-board').html(toWrite);
    $('#baseball-board').show("slow");
  }

  /*this.escape = function()
  {
    var numOfTeams = parseInt($('#teams').val());
    var numOfGames = new Array(numOfTeams);
    var initialPoints = new Array(numOfTeams);
  
    for (var i = 0; i < numOfTeams; ++i)
      numOfGames[i] = new Array(numOfTeams);

    if (numOfTeams < 1 || numOfTeams > 6) { // no graph
      $('#modeling-err').html("Invalid number of teams. Number of teams must be between 1 and 6 inclusive.");
      return false;
    }

    setInterval(function()
    {
      for (var i = 0; i < numOfTeams; ++i)
      {
        numOfGames[i][i] = 0;
        $("#game" + i + i).val(0);
        for (var j = 0; j < i; ++j)
        {
          $("#game" + i + j).val($("#game" + j + i).val());
        }
      }
    },100);

    this.inputRandomized = function()
    {
      for (var i = 0; i < numOfTeams; ++i)
      {
        initialPoints[i] = Math.floor(Math.random() * 10); //0 - 9
        $("#point" + i).val(initialPoints[i]);
        for (var j = 0; j < numOfTeams; ++j)
        {
          numOfGames[i][j] = Math.floor(Math.random() * 10); //0 - 9
          $("#game" + i + j).val(numOfGames[i][j]);
        }
      }
    }

    this.createGraph = function(checkTeamIndex)
    {
      internalAdjList = {};
      internalEdgeList = {};
      vertexHighlighted = {};
      edgeRed = {};
      stateList = [];
      var currentState;
      var numOfMatches = ((numOfTeams - 1) * (numOfTeams - 2)) / 2;
      var totalMaxFlow = 0;
      amountEdge = 0;
      amountVertex = 2 + numOfMatches + (numOfTeams - 1);
      var totalNumberOfGames = new Array(numOfTeams);
      var vertexIndex = new Array(numOfTeams);
      for (var i = 0; i < numOfTeams; ++i)
      {
        totalNumberOfGames[i] = 0;
        vertexIndex[i] = new Array(numOfTeams);
        initialPoints[i] = (+$("#point" + i).val());
        for (var j = 0; j < numOfTeams; ++j)
        {
          numOfGames[i][j] = +($("#game" + i + j).val());
          totalNumberOfGames[i] += (numOfGames[i][j]);
          console.log(i + " " + j + " " + numOfGames[i][j]);
        }
      }

      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Assume Team ' + checkTeamIndex + ' wins all remaining games';
      currentState["status"] += '<br>Team ' + checkTeamIndex + ' will win ' + initialPoints[checkTeamIndex] + ' + ' + totalNumberOfGames[checkTeamIndex];
      currentState["status"] += ' = ' + (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + ' games</br>';
      currentState["lineNo"] = [1];
      stateList.push(currentState);

      for (var i = 0; i < numOfTeams; ++i) if (i != checkTeamIndex)
      {
        currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
        currentState["status"] = 'Assume T' + i + ' loses all remaining games. ';
        currentState["status"] += 'T' + i + ' will win ' + initialPoints[i] + ' games';
        if (initialPoints[i] <= initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex])
        {
          currentState["status"] += '<br>Because ' + initialPoints[i] + '<=' + (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + ', team ' + checkTeamIndex + ' can still win the league</br>';
          currentState["lineNo"] = [1];
          stateList.push(currentState);     
        } else
        {
          currentState["status"] += '<br>Because ' + initialPoints[i] + '>' + (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + ', team ' + checkTeamIndex + ' is obviously eliminated</br>';
          currentState["lineNo"] = [1];
          stateList.push(currentState);
          graphWidget.startAnimation(stateList);
          return true;
        }   
      }


      internalAdjList[0] = {"cx": 25, "cy": 175, "text": 0}

      internalAdjList[amountVertex - 1] = { "cx": 625, "cy": 175, "text": amountVertex - 1 }

      vertexHighlighted[0] = vertexHighlighted[amountVertex-1] = true;
      currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted);
      currentState["status"] = 'Create source and sink vertex';
      currentState["lineNo"] = [];
      stateList.push(currentState);
      delete vertexHighlighted[0]; delete vertexHighlighted[amountVertex-1];

      amountVertex = 1;


      //create left set of vertices
      for (var i = 0; i < numOfTeams; ++i) if(i != checkTeamIndex)
      {
        for (var j = i + 1; j < numOfTeams; ++j) if(j != checkTeamIndex)
        {
          totalMaxFlow += numOfGames[i][j];
          internalAdjList[amountVertex] = 
          {
            "cx": 225,
            "cy": (175 + (amountVertex - (numOfMatches + 1) / 2) * (numOfMatches == 1 ? 0 : 300 / (numOfMatches - 1))),
            "text": i + "v" + j
          }
          internalEdgeList[amountEdge] = 
          {
            "vertexA": 0,
            "vertexB": amountVertex,
            "weight": numOfGames[i][j]
          }
          vertexHighlighted[amountVertex] = true;
          edgeRed[amountEdge] = true;
          currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeRed);
          currentState["status"] = 'Create a node for a match between T' + i + ' and T' + j + '. There are ' + numOfGames[i][j] + ' matches remaining';
          currentState["status"] += '. Connect source vertex to that node with capacity ' + numOfGames[i][j];
          currentState["lineNo"] = [2,3];
          stateList.push(currentState);
          delete vertexHighlighted[amountVertex];
          delete edgeRed[amountEdge];

          vertexIndex[i][j] = amountVertex;
          ++amountVertex;
          ++amountEdge;
        }
      }

      

      //create right set of vertices
      for (var i = 0; i < numOfTeams; ++i) if (i != checkTeamIndex)
      {
        internalAdjList[amountVertex] = 
        {
          "cx": 425,
          "cy": (175 + ((i+(i<checkTeamIndex?1:0)) - (numOfTeams) / 2) * (numOfTeams == 2 ? 0 : 300 / (numOfTeams - 2))),
          "text": "T" + i
        }
        var weight = (+initialPoints[checkTeamIndex]) + (+totalNumberOfGames[checkTeamIndex]) - (+initialPoints[i]);
        internalEdgeList[amountEdge] = 
        {
          "vertexA": amountVertex,
          "vertexB": 1 + numOfMatches + (numOfTeams - 1),
          "weight": weight
        }
        vertexHighlighted[amountVertex] = true;
        edgeRed[amountEdge] = true;
        currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeRed);
        currentState["status"] = 'Create a node for a Team ' + i + '. Team ' + i + ' may win ';
        currentState["status"] += (initialPoints[checkTeamIndex] + totalNumberOfGames[checkTeamIndex]) + '-' + initialPoints[i] + ' = ' + weight + ' matches more';
        currentState["status"] += '. Connect that node to sink vertex with capacity ' + weight;
        currentState["lineNo"] = [4,5];
        stateList.push(currentState);
        delete vertexHighlighted[amountVertex];
        delete edgeRed[amountEdge];

        ++amountVertex;
        ++amountEdge;
      }



      //create middle edges
      for (var i = 0; i < numOfTeams; ++i) if (i != checkTeamIndex)
      {
        for (var j = i + 1; j < numOfTeams; ++j) if (j != checkTeamIndex)
        {
          internalEdgeList[amountEdge] = 
          {
            "vertexA": vertexIndex[i][j],
            "vertexB": amountVertex - numOfTeams + i + (i < checkTeamIndex ? 1 : 0),
            "weight": 9
          }
          edgeRed[amountEdge] = true;
          ++amountEdge;

          internalEdgeList[amountEdge] = 
          {
            "vertexA": vertexIndex[i][j],
            "vertexB": amountVertex - numOfTeams + j + (j < checkTeamIndex ? 1 : 0),
            "weight": 9
          }
          edgeRed[amountEdge] = true;
          ++amountEdge;

          currentState = createState(internalAdjList, internalEdgeList,vertexHighlighted, edgeRed);
          currentState["status"] = 'Adding edge from R' + i + ' to C' + j + ' with capacity INF';
          currentState["lineNo"] = [6];
          //currentState["status"] += '<br>Adding edge from R' + i + ' to C' + j + '</br>';
          stateList.push(currentState);
          delete edgeRed[amountEdge-1];
          delete edgeRed[amountEdge-2];
        }
      }

      amountVertex = 0;
      amountEdge = 0;
      for (var i in internalAdjList) ++amountVertex;
      for (var i in internalEdgeList) ++amountEdge;

      $('#sourcevertex').val(0);
      $('#sinkvertex').val(amountVertex-1);

      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'Run any maximum flow algorithm from 0 to ' + (amountVertex - 1);
      currentState["status"] += '. Iff all source edges are saturated (maxflow = ' + totalMaxFlow + '), '
      currentState["status"] += 'then Team ' + checkTeamIndex + ' is not eliminated';
      currentState["lineNo"] = [7];
      stateList.push(currentState);
      graphWidget.startAnimation(stateList);
      return true;
    }

    this.inputFinished = function(checkTeamIndex)
    {
      $('.overlays').hide("slow");
      $('#dark-overlay').hide("slow");
      $('#baseball-board').hide("slow");
      maxflowWidget.createGraph(checkTeamIndex);
      $('#current-action').show();
      $('#current-action p').html("Modeling()");
      $('#progress-bar').slider( "option", "max", gw.getTotalIteration()-1);
      triggerRightPanels();
      populatePseudocode(4);
      isPlaying = true;
      return true;
    }

    $('#dark-overlay').show("slow");
    var toWrite = '<html>\n';
    toWrite += '<br>Fill in the table below.\n';
    toWrite += ' Don\'t modify the black cells, they will be updated automatically</br>\n';
    toWrite += '<br>Click on any team to check whether the team is eliminated or not</br>\n';
    toWrite += '<table border="1" id="board">\n';
    for (var j = 0; j < numOfTeams + 2; ++j)
    {
      toWrite += '<col width="50">';
    }

    toWrite += '<tr>';
    toWrite += '<td rowspan="2">Team Index</td><td rowspan="2">Initial Points</td>';
    toWrite += '<td colspan="5" align="center">Remaining Games</td>';
    toWrite += '</tr>';
    toWrite += '<tr>';
    for (var i = 0; i < numOfTeams; ++i)
    {
      toWrite += '<td>Team ' + i + '</td>';
    }
    toWrite += '</tr>';

    for (var i = 0; i < numOfTeams; ++i)
    {
      toWrite += '<tr>';
      toWrite += '<td><button onclick=maxflowWidget.inputFinished('+i+')>Team ' + i + '</button></td>';
      toWrite += '<td height="50" bgcolor="white"><input id="point' + i + '" value=0 /></td>';
      for (var j = 0; j < numOfTeams; ++j) 
      {
        if (j > i)
        {
          toWrite += '<td height="50" bgcolor="white"><input id="game' + i + j + '" value=0 /></td>';
        }
        else 
        {
          toWrite += '<td height="50" bgcolor="black"><input style="background-color:black;color:white;" id="game' + i + j + '" value=0 /></td>';
        }
      }
      toWrite += '</tr>';
    }

    toWrite += '</table>\n';
    toWrite += '<button onclick=maxflowWidget.inputRandomized()>Randomized</button>';
    toWrite += '</html>\n';
    $('#baseball-board').html(toWrite);
    $('#baseball-board').show("slow");
  }*/

  this.modeling = function(modelingType)
  {
    internalEdgeList = {};
    internalAdjList = {};
    if (modelingType == "rookattack") this.rookattack();
    if (modelingType == "baseball") this.baseball();
    return true;
  }

  this.examples = function(ssspExampleConstant) {
    internalAdjList = $.extend(true, {}, TEMPLATES[ssspExampleConstant][0]);
    internalEdgeList = $.extend(true, {}, TEMPLATES[ssspExampleConstant][1]);
    amountVertex = TEMPLATES[ssspExampleConstant][2];
    amountEdge = TEMPLATES[ssspExampleConstant][3];

    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
    $('#sourcevertex').val(0);
    $('#sinkvertex').val(amountVertex-1);
    return true;
  }

  this.completelyRandom = function() {
    var templateNo = Math.floor(Math.random()*noOfExamples); //0-4
    internalAdjList = $.extend(true, {}, TEMPLATES[templateNo][0]);
    internalEdgeList = $.extend(true, {}, TEMPLATES[templateNo][1]);
    amountVertex = TEMPLATES[templateNo][2];
    amountEdge = TEMPLATES[templateNo][3];

    //change edge weights
    var keys = Object.keys(internalEdgeList);
    var nVertices = Object.keys(internalAdjList).length/2;
    var nEdges = keys.length/2;
    for(var i=0; i<nEdges; i++) {
      //var newWeight = Math.floor(Math.random()*100)-50; //-50-49
      var newWeight = Math.floor(Math.random()*10); //0 - 9
      internalEdgeList[keys[i]]["weight"] = newWeight;
    }

    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
    return true;
  }

  this.bipartiteRandom = function(randomType) { 
    //0 : random, 1 : left 1, 2 : right 1, 3 : all 1.
    amountVertex = Math.floor(Math.random() * 9) + 4; //4 to 12
    var leftVertex = Math.floor(Math.random() * (amountVertex - 3)) + 1; //1 to N-3
    if (leftVertex > 6) leftVertex = 6;
    var numberOfFemales = amountVertex - 2 - leftVertex;
    
    internalAdjList = new Object();
    internalEdgeList = new Object();
    amountEdge = 0;

    internalAdjList[0] = 
    {
      "cx": 50,
      "cy": 175,
      "text": 0
    }

    internalAdjList[amountVertex - 1] = 
    {
      "cx": 650,
      "cy": 175,
      "text": amountVertex - 1
    }

    for (var i = 1; i <= leftVertex; ++i)
    {
      internalAdjList[i] = 
      {
        "cx": 250,
        "cy": (175 + (i - (leftVertex + 1) / 2) * (leftVertex == 1 ? 0 : 300 / (leftVertex - 1))),
        "text": i
      }
      internalEdgeList[amountEdge] = 
      {
        "vertexA": 0,
        "vertexB": i,
        "weight": 1
      }
      if (randomType == 0 || randomType == 2)
        internalEdgeList[amountEdge].weight = Math.floor(Math.random() * 10);
      ++amountEdge;
    }

    for (var i = 1; i <= numberOfFemales; ++i)
    {
      internalAdjList[i + leftVertex] = 
      {
        "cx": 450,
        "cy": (175 + (i - (numberOfFemales + 1) / 2) * (numberOfFemales == 1 ? 0 : 300 / (numberOfFemales - 1))),
        "text": (leftVertex + i)
      }
      internalEdgeList[amountEdge] = 
      {
        "vertexA": i + leftVertex,
        "vertexB": amountVertex - 1,
        "weight": 1
      }
      if (randomType == 0 || randomType == 1)
        internalEdgeList[amountEdge].weight = Math.floor(Math.random() * 10);
      ++amountEdge;
    }

    for (var i = 1; i <= leftVertex; ++i)
    {
      for (var j = 1; j <= numberOfFemales; ++j)
      {
        var existEdge = Math.floor(Math.random() * 2);
        if (existEdge == 1)
        {
          internalEdgeList[amountEdge] = 
          {
            "vertexA": i,
            "vertexB": j + leftVertex,
            "weight": 9
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

    $('#sourcevertex').val(0);
    $('#sinkvertex').val(amountVertex-1);
    return true;
  }

  function createState(internalAdjListObject, internalEdgeListObject, vertexHighlighted, edgeRed, vertexTraversed, edgeYellow, edgeBlue, edgeGrey){
    if(vertexHighlighted == null) vertexHighlighted = {};
    if(edgeRed == null) edgeRed = {};
    if(vertexTraversed == null) vertexTraversed = {};
    if(edgeYellow == null) edgeYellow = {};
    if(edgeBlue == null) edgeBlue = {};
    if(edgeGrey == null) edgeGrey = {};

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
      state["el"][key]["type"] = EDGE_TYPE_DE; // HOW TO MAKE THIS DIRECTED?
      state["el"][key]["weight"] = internalEdgeListObject[key]["weight"];
      if (internalEdgeListObject[key]["state"] == OBJ_HIDDEN)
        state["el"][key]["state"] = OBJ_HIDDEN;
      else
        state["el"][key]["state"] = EDGE_DEFAULT;
      state["el"][key]["displayWeight"] = true;
      state["el"][key]["animateHighlighted"] = false;
    }

    for(key in vertexHighlighted){
      state["vl"][key]["state"] = VERTEX_HIGHLIGHTED;
    }

    for(key in edgeRed){
      state["el"][key]["state"] = EDGE_RED;
    }

    for(key in vertexTraversed){
      state["vl"][key]["state"] = VERTEX_TRAVERSED;
    }

    for(key in edgeYellow){
      state["el"][key]["state"] = EDGE_TRAVERSED;
    }

    for(key in edgeBlue){
      state["el"][key]["state"] = EDGE_BLUE;
    }

    for(key in edgeGrey){
      state["el"][key]["state"] = EDGE_GREY;
    }

    return state;
  }
  
  function populatePseudocode(act) {
    switch (act) {
      case 0: // Edmonds Karp
        $('#code1').html('initMaxFlow');
        $('#code2').html('while there is an augmenting path');
        $('#code3').html('&nbsp;&nbsp;find an augmenting path using BFS');
        $('#code4').html('&nbsp;&nbsp;for each edge u->v in the path');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;decrease capacity u->v by bottleneck');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;increase capacity v->u by bottleneck');
        $('#code7').html('&nbsp;&nbsp;increase maxflow by bottleneck');
        break;
      case 1: // Ford Fulkerson
        $('#code1').html('initMaxFlow');
        $('#code2').html('while there is an augmenting path');
        $('#code3').html('&nbsp;&nbsp;find an augmenting path using DFS');
        $('#code4').html('&nbsp;&nbsp;for each edge u->v in the path');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;decrease capacity u->v by bottleneck');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;increase capacity v->u by bottleneck');
        $('#code7').html('&nbsp;&nbsp;increase maxflow by bottleneck');
        break;
      case 2: // Ford Fulkerson
        $('#code1').html('initMaxFlow');
        $('#code2').html('while t is reachable from s in the residual graph');
        $('#code3').html('&nbsp;&nbsp;find the level graph');
        $('#code4').html('&nbsp;&nbsp;find a blocking flow using DFS');
        $('#code5').html('&nbsp;&nbsp;update the capacity in the blocking flow');
        $('#code6').html('&nbsp;&nbsp;increase maxflow by bottleneck');
        $('#code7').html('');
        break;
      case 3: // Rook Attack Modeling
        $('#code1').html('Create source and sink vertex');
        $('#code2').html('Create one vertex Ri for each row i');
        $('#code3').html('Create one vertex Cj for each column j');
        $('#code4').html('For each rook-placable cell (i,j)');
        $('#code5').html('&nbsp;&nbsp;Add an edge from Ri to Cj with capacity INF');
        $('#code6').html('Run any maxflow algorithm');
        $('#code7').html('');
        break;
      case 4: // Baseball Elimination Modeling
        $('#code1').html('Checking for obvious cases');
        $('#code2').html('For every team X,Y');
        $('#code3').html('&nbsp;&nbsp;Create XvY vertex. Connect source to the vertex');
        $('#code4').html('For every team X');
        $('#code5').html('&nbsp;&nbsp;Create TX vertex. Connect the vertex to sink');
        $('#code6').html('Connect XvY vertex to TX and TY with capacity INF');
        $('#code7').html('Run any maxflow algorithm');
        break;
    }
  }
}

//SSSP sample graph templates
var TEMPLATES = new Array();
TEMPLATES[MAXFLOW_EXAMPLE_CP3_4_24] = 
[
  {
    0:{
      "cx": 50,
      "cy": 50,
      "text": 0,
    },
    1:{
      "cx": 250,
      "cy": 50,
      "text": 1,
    },
    2:{
      "cx": 50,
      "cy": 250,
      "text": 2,
    },
    3:{
      "cx": 250,
      "cy": 250,
      "text": 3
    }
  },
  {
    0:{
        "vertexA": 0,
        "vertexB": 1,
        "weight": 4
    },
    1:{
        "vertexA": 1,
        "vertexB": 0,
        "weight": 4
    },
    2:{
        "vertexA": 1,
        "vertexB": 3,
        "weight": 8
    },
    3:{
        "vertexA": 3,
        "vertexB": 1,
        "weight": 8
    },
    4:{
        "vertexA": 2,
        "vertexB": 3,
        "weight": 3
    },
    5:{
        "vertexA": 3,
        "vertexB": 2,
        "weight": 3
    },
    6:{
        "vertexA": 2,
        "vertexB": 0,
        "weight": 8
    },
    7:{
        "vertexA": 0,
        "vertexB": 2,
        "weight": 8
    },
    8:{
        "vertexA": 2,
        "vertexB": 1,
        "weight": 1
    },
    9:{
        "vertexA": 1,
        "vertexB": 2,
        "weight": 1
    }
  },
  4,10
];
TEMPLATES[MAXFLOW_EXAMPLE_CP3_4_26_1] = 
[
  {
    0:{
      "cx": 50,
      "cy": 250,
      "text": 0,
    },
    1:{
      "cx": 450,
      "cy": 450,
      "text": 1,
    },
    2:{
      "cx": 250,
      "cy": 50,
      "text": 2,
    },
    3:{
      "cx": 250,
      "cy": 450,
      "text": 3
    },
    4:{
      "cx": 650,
      "cy": 250,
      "text": 4
    }
  },
  {
    0:{
        "vertexA": 0,
        "vertexB": 2,
        "weight": 5
    },
    1:{
        "vertexA": 0,
        "vertexB": 3,
        "weight": 3
    },
    2:{
        "vertexA": 2,
        "vertexB": 3,
        "weight": 3
    },
    3:{
        "vertexA": 3,
        "vertexB": 1,
        "weight": 5
    },
    4:{
        "vertexA": 2,
        "vertexB": 1,
        "weight": 3
    },
    5:{
        "vertexA": 2,
        "vertexB": 4,
        "weight": 3
    },
    6:{
        "vertexA": 1,
        "vertexB": 4,
        "weight": 7
    }
  },
  5,7
];
TEMPLATES[MAXFLOW_EXAMPLE_CP3_4_26_2] = 
[
  {
    0:{
      "cx": 50,
      "cy": 250,
      "text": 0,
    },
    1:{
      "cx": 450,
      "cy": 450,
      "text": 1,
    },
    2:{
      "cx": 250,
      "cy": 50,
      "text": 2,
    },
    3:{
      "cx": 250,
      "cy": 450,
      "text": 3
    },
    4:{
      "cx": 650,
      "cy": 250,
      "text": 4
    }
  },
  {
    0:{
        "vertexA": 0,
        "vertexB": 2,
        "weight": 5
    },
    1:{
        "vertexA": 0,
        "vertexB": 3,
        "weight": 3
    },
    2:{
        "vertexA": 2,
        "vertexB": 3,
        "weight": 3
    },
    3:{
        "vertexA": 3,
        "vertexB": 1,
        "weight": 5
    },
    4:{
        "vertexA": 2,
        "vertexB": 1,
        "weight": 3
    },
    5:{
        "vertexA": 2,
        "vertexB": 4,
        "weight": 3
    },
    6:{
        "vertexA": 1,
        "vertexB": 4,
        "weight": 4
    }
  },
  5,7
];
TEMPLATES[MAXFLOW_EXAMPLE_CP3_4_26_3] = 
[
  {
    0:{
      "cx": 50,
      "cy": 250,
      "text": 0,
    },
    1:{
      "cx": 450,
      "cy": 450,
      "text": 1,
    },
    2:{
      "cx": 250,
      "cy": 50,
      "text": 2,
    },
    3:{
      "cx": 250,
      "cy": 450,
      "text": 3
    },
    4:{
      "cx": 650,
      "cy": 250,
      "text": 4
    }
  },
  {
    0:{
        "vertexA": 0,
        "vertexB": 2,
        "weight": 5
    },
    1:{
        "vertexA": 0,
        "vertexB": 3,
        "weight": 3
    },
    2:{
        "vertexA": 3,
        "vertexB": 1,
        "weight": 5
    },
    3:{
        "vertexA": 2,
        "vertexB": 1,
        "weight": 2
    },
    4:{
        "vertexA": 2,
        "vertexB": 4,
        "weight": 2
    },
    5:{
        "vertexA": 1,
        "vertexB": 4,
        "weight": 7
    }
  },
  5,6
];
TEMPLATES[MAXFLOW_EXAMPLE_FORD_KILLER] = 
[ 
  {
    0:{
      "cx": 50,
      "cy": 200,
      "text": 0,
    },
    1:{
      "cx": 200,
      "cy": 350,
      "text": 1,
    },
    2:{
      "cx": 200,
      "cy": 50,
      "text": 2,
    },
    3:{
      "cx": 350,
      "cy": 200,
      "text": 3
    }
  },
  {
    0:{
        "vertexA": 0,
        "vertexB": 1,
        "weight": 8
    },
    1:{
        "vertexA": 0,
        "vertexB": 2,
        "weight": 8
    },
    2:{
        "vertexA": 1,
        "vertexB": 3,
        "weight": 8
    },
    3:{
        "vertexA": 2,
        "vertexB": 3,
        "weight": 8
    },
    4:{
        "vertexA": 2,
        "vertexB": 1,
        "weight": 1
    }
  },
  4,5
];
TEMPLATES[MAXFLOW_EXAMPLE_1] = 
[ 
  {
    0:{
      "cx": 50,
      "cy": 250,
      "text": 0,
    },
    1:{
      "cx": 250,
      "cy": 50,
      "text": 1,
    },
    2:{
      "cx": 450,
      "cy": 50,
      "text": 2,
    },
    3:{
      "cx": 250,
      "cy": 450,
      "text": 3,
    },
    4:{
      "cx": 450,
      "cy": 450,
      "text": 4,
    },
    5:{
      "cx": 650,
      "cy": 250,
      "text": 5,
    }
  },
  {
    0:{
        "vertexA": 0,
        "vertexB": 1,
        "weight": 8
    },
    1:{
        "vertexA": 0,
        "vertexB": 3,
        "weight": 1
    },
    2:{
        "vertexA": 1,
        "vertexB": 3,
        "weight": 1
    },
    3:{
        "vertexA": 1,
        "vertexB": 2,
        "weight": 3
    },
    4:{
        "vertexA": 3,
        "vertexB": 4,
        "weight": 3
    },
    5:{
        "vertexA": 1,
        "vertexB": 4,
        "weight": 2
    },
    6:{
        "vertexA": 2,
        "vertexB": 5,
        "weight": 4
    },
    7:{
        "vertexA": 4,
        "vertexB": 5,
        "weight": 8
    }
  },
  6,8
];

