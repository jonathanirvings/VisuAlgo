// @author Steven Halim
// Defines an SSSP object; keeps implementation of graph internally and interact with GraphWidget to display Bellman Ford's and Dijkstra's SSSP visualizations

// SSSP Example Constants
var SSSP_EXAMPLE_CP3_4_3 = 0;
var SSSP_EXAMPLE_CP3_4_17 = 1;
var SSSP_EXAMPLE_CP3_4_18 = 2;
var SSSP_EXAMPLE_CP3_4_19 = 3;

var SSSP = function(){
  var self = this;
  var graphWidget = new GraphWidget();

  var valueRange = [1, 100]; // Range of valid values of BST vertexes allowed

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
    }
    for (var key in internalAdjList)
    {
      internalAdjList[key]["text"] = key;
      internalAdjList[key]["extratext"] = "";
    }
    for (var key in internalEdgeList)
    {
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
      $("#draw-status p").html("");
  }

  warnChecking = function()
  {
    var warn = "";

    if (amountVertex >= 10)
      warn += "Too much vertex on screen, consider drawing smaller graph. ";

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
    for (var i = 0; i < amountVertex; ++i)
      if (!visited[i]) warn += "Vertex " + i + " is not reachable from vertex 0. ";

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
                    data: {canvasWidth: 1000, canvasHeight: 500, graphTopics: 'SSSP', graphState: graph},
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

  this.bfs = function(sourceVertex) {
    var key;
    var i;
    var notVisited = {};
    var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, edgeGrey = {};
    var stateList = [];
    var currentState;

    // error checks
    if (amountVertex == 0) { // no graph
      $('#bfs-err').html("There is no graph to run this on. Please select a sample graph first.");
      return false;
    }

    if (sourceVertex >= amountVertex) { // source vertex not in range
      $('#bfs-err').html("This vertex does not exist in the graph. Please select another source vertex.");
      return false;
    }

    for (var j = 0; j < amountEdge; j++)
      if (internalEdgeList[j]["weight"] > 1) {
        $('#bfs-err').html("At least one edge of this graph has weight > 1. We cannot run BFS to get the SSSP information of this graph.");
        return false;
      }

    for (key in internalAdjList) {
      if (key == "cx" || key == "cy") continue;
      if (key != sourceVertex) notVisited[key] = true;
    }

    var d = {};
    var p = {};
    for (var i = 0; i < amountVertex; i++) {
      d[i] = 1000;
      p[i] = -1;
    }
    d[sourceVertex] = 0;

    for (key in internalAdjList) {
      internalAdjList[key]["state"] = VERTEX_DEFAULT;
      internalAdjList[key]["extratext"] = "Inf";
    }

    vertexHighlighted[sourceVertex] = true;
    internalAdjList[sourceVertex]["extratext"] = 0;
    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed);
    currentState["status"] = 'Start from source s = ' + sourceVertex + '<br>Set d[' + sourceVertex + '] = 0';
    currentState["lineNo"] = 1;
    stateList.push(currentState);

    delete vertexHighlighted[sourceVertex];
    for (key in internalEdgeList)
      delete edgeTraversed[key];

    var q = [];
    q.push(sourceVertex);
    var EdgeProcessed = 0;

    while (q.length > 0) {
      vertexHighlighted[q[0]] = true;
      for (key in internalEdgeList)
        delete edgeHighlighted[key];
      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
      currentState["status"] = 'The queue is now {' + q + '}<br>Exploring neighbors of vertex u = ' + q[0];
      currentState["lineNo"] = 2;
      stateList.push(currentState);

      var u = q.shift(); // front most item
    
      for (var j = 0; j < amountEdge; j++) {
        var vertexA = internalEdgeList[j]["vertexA"];
        var vertexB = internalEdgeList[j]["vertexB"];
        var weightAB = internalEdgeList[j]["weight"];

        for (key in internalEdgeList)
          delete edgeHighlighted[key];

        if (u == vertexA) {
          vertexTraversed[vertexA] = true;

          edgeTraversed[j] = true;
          EdgeProcessed = EdgeProcessed + 1;
          var thisStatus = 'relax(' + vertexA + ',' + vertexB + ',' + weightAB + '), #edge processed = ' + EdgeProcessed;
          if (d[vertexA] + weightAB < d[vertexB]) {
            d[vertexB] = d[vertexA] + weightAB;
            p[vertexB] = vertexA;
            internalAdjList[vertexB]["extratext"] = d[vertexB];
            thisStatus = thisStatus + '<br>We update d[' + vertexB + '] = ' + d[vertexB] + ' and p[' + vertexB + '] = ' + p[vertexB];
            edgeHighlighted[j] = true;
            edgeTraversed[j] = true;
            q.push(vertexB);
          }
          else {
            thisStatus = thisStatus + '<br>No change';
            edgeGrey[j] = true;
          }

/*
          for (var k = amountEdge; k < 2 * amountEdge; k++)
            internalEdgeList[k]["state"] = OBJ_HIDDEN;
          for (var k = 0; k < amountVertex; k++)
            if (p[k] != -1)
              for (var l = 0; l < amountEdge; l++)
                if (internalEdgeList[l]["vertexA"] == p[k] && internalEdgeList[l]["vertexB"] == k)
                  internalEdgeList[l + amountEdge]["state"] = EDGE_HIGHLIGHTED;
*/

          currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
          currentState["status"] = thisStatus;
          currentState["lineNo"] = [3,4];
          stateList.push(currentState);
        }
      }
    }
 
    for (key in internalAdjList)
      delete vertexHighlighted[key];
    for (key in internalAdjList)
      delete vertexTraversed[key];
    for (key in internalEdgeList)
      delete edgeHighlighted[key];
    edgeTraversed = {};
    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
    currentState["status"] = 'BFS processes O(V + E) = ' + EdgeProcessed + ' edges.<br>The highlighted edges form the BFS/SSSP spanning tree from source = ' + sourceVertex;
    stateList.push(currentState);

    console.log(stateList);

    populatePseudocode(0);
    graphWidget.startAnimation(stateList);
    return true;
  }

  this.bellmanford = function(sourceVertex) {
    var key;
    var i;
    var notVisited = {};
    var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, edgeGrey = {};
    var stateList = [];
    var currentState;

    // error checks
    if (amountVertex == 0) { // no graph
      $('#bellmanford-err').html("There is no graph to run this on. Please select a sample graph first.");
      return false;
    }

    if (sourceVertex >= amountVertex) { // source vertex not in range
      $('#bellmanford-err').html("This vertex does not exist in the graph. Please select another source vertex.");
      return false;
    }

    for (key in internalAdjList) {
      if (key == "cx" || key == "cy") continue;
      if (key != sourceVertex) notVisited[key] = true;
    }

    var d = {};
    var p = {};
    for (var i = 0; i < amountVertex; i++) {
      d[i] = 1000;
      p[i] = -1;
    }
    d[sourceVertex] = 0;

    for (key in internalAdjList) {
      internalAdjList[key]["state"] = VERTEX_DEFAULT;
      internalAdjList[key]["extratext"] = "Inf";
    }

    vertexHighlighted[sourceVertex] = true;
    internalAdjList[sourceVertex]["extratext"] = 0;
    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed);
    currentState["status"] = 'Start from source s = ' + sourceVertex + '<br>Set p[v] = -1 for all v and d[' + sourceVertex + '] = 0';
    currentState["lineNo"] = 1;
    stateList.push(currentState);

    delete vertexHighlighted[sourceVertex];
    var EdgeProcessed = 0;
    var NextStatus = "This is the first pass";
    
    for (var i = 1; i < amountVertex; i++) { // V-1 passes of Bellman Ford's
      var NoChange = true;
      
      for (key in internalEdgeList) {
        delete edgeHighlighted[key];
        delete edgeTraversed[key];
        delete edgeGrey[key];
      }

      for (var l = 0; l < amountEdge; l++)
        if (p[internalEdgeList[l]["vertexB"]] == internalEdgeList[l]["vertexA"])
          edgeTraversed[l] = true;
        else
          edgeGrey[l] = true;

      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
      currentState["status"] = NextStatus + '<br>The highlighted edges are the current SSSP spanning tree so far';
      
      currentState["lineNo"] = 2;
      stateList.push(currentState);

      for (key in internalEdgeList) { // start afresh for next round
        delete edgeHighlighted[key];
        delete edgeTraversed[key];
        delete edgeGrey[key];
      }
      for (var k = 0; k < amountVertex; k++)
        delete vertexHighlighted[k];
      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
      currentState["status"] = 'Pass number: ' + i + '<br>Prepare all edges for this pass';
      currentState["lineNo"] = 2;
      stateList.push(currentState);

      for (var j = 0; j < amountEdge; j++) {
        // turn off highlights first
        for (var k = 0; k < amountVertex; k++)
          delete vertexHighlighted[k];

        EdgeProcessed = EdgeProcessed + 1;
        var vertexA = internalEdgeList[j]["vertexA"];
        var vertexB = internalEdgeList[j]["vertexB"];
        var weightAB = internalEdgeList[j]["weight"];
        var thisStatus = 'Pass number: ' + i + ', relax(' + vertexA + ',' + vertexB + ',' + weightAB + '), #edge processed = ' + EdgeProcessed;

        // highlight the edge being relaxed in the input graph
        vertexHighlighted[vertexA] = true;
        vertexHighlighted[vertexB] = true;

        for (key in internalEdgeList)
          delete edgeHighlighted[key];
        edgeHighlighted[j] = true; // only highlight one
        edgeTraversed[j] = true;

        // if we can relax vertex B, do updates and some more highlights
        if (d[vertexA] != 1000 && d[vertexA] + weightAB < d[vertexB]) {
          d[vertexB] = d[vertexA] + weightAB;
          p[vertexB] = vertexA;
          internalAdjList[vertexB]["extratext"] = d[vertexB];
          thisStatus = thisStatus + '<br>We update d[' + vertexB + '] = ' + d[vertexB] + ' and p[' + vertexB + '] = ' + p[vertexB];
          edgeHighlighted[j] = EDGE_HIGHLIGHTED;
          edgeTraversed[j] = true;
          NoChange = false;
        }
        else {
          thisStatus = thisStatus + '<br>No change';
          edgeGrey[j] = true;
        }

        currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
        currentState["status"] = thisStatus;
        currentState["lineNo"] = [3,4];
        stateList.push(currentState);
      }

      if (NoChange) // optimized Bellman Ford's
        NextStatus = 'There is no change in the last pass, we can stop Bellman Ford\'s early';
      else
        NextStatus = 'We have at least one edge relaxation in the last pass, we will continue';
    }

    for (var k = 0; k < amountVertex; k++)
      delete vertexHighlighted[k];
    for (key in internalEdgeList) {
      delete edgeHighlighted[key];
      delete edgeTraversed[key];
      delete edgeGrey[key];
    }

    for (var l = 0; l < amountEdge; l++)
      if (p[internalEdgeList[l]["vertexB"]] == internalEdgeList[l]["vertexA"])
        edgeTraversed[l] = true;
      else
        edgeGrey[l] = true;

    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
    currentState["status"] = 'Bellman Ford\'s processes ' + EdgeProcessed + ' edges and O(V*E) = ' + (amountVertex-1) + '*' + amountEdge + ' = ' + ((amountVertex-1) * amountEdge) + '<br>The highlighted edges form the SSSP spanning tree from source = ' + sourceVertex;
    stateList.push(currentState);

    // console.log(stateList);

    populatePseudocode(1);
    graphWidget.startAnimation(stateList);
    return true;
  }

  this.dijkstra = function(sourceVertex, versiontype) {
    var key;
    var i;
    var notVisited = {};
    var vertexHighlighted = {}, edgeHighlighted = {}, vertexTraversed = {}, edgeTraversed = {}, edgeGrey = {};
    var stateList = [];
    var currentState;

    // error checks
    if (amountVertex == 0) { // no graph
      $('#dijkstra-err').html("There is no graph to run this on. Please select a sample graph first.");
      return false;
    }

    if (sourceVertex >= amountVertex) { // source vertex not in range
      $('#dijkstra-err').html("This vertex does not exist in the graph. Please select another source vertex.");
      return false;
    }

    for (key in internalAdjList) {
      if (key == "cx" || key == "cy") continue;
      if (key != sourceVertex) notVisited[key] = true;
    }

    var d = {};
    var p = {};
    for (var i = 0; i < amountVertex; i++) {
      d[i] = 1000;
      p[i] = -1;
    }
    d[sourceVertex] = 0;

    for (key in internalAdjList) {
      internalAdjList[key]["state"] = VERTEX_DEFAULT;
      internalAdjList[key]["extratext"] = "Inf"; // show this extra text
    }

    vertexHighlighted[sourceVertex] = true;
    internalAdjList[sourceVertex]["extratext"] = 0;
    currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
    currentState["status"] = 'Start from source s = ' + sourceVertex + '<br>Set d[' + sourceVertex + '] = 0';
    currentState["lineNo"] = 1;
    stateList.push(currentState);

    delete vertexHighlighted[sourceVertex];
    for (key in internalEdgeList) {
      delete edgeTraversed[key];
      delete edgeHighlighted[key];
      delete edgeGrey[key];
    }

    var pq = [];
    var done = [];

    if (versiontype == 1) { // original
      for (var i = 0; i < amountVertex; i++)
        if (i == sourceVertex)
          pq.push(new ObjectPair(0, i));
        else
          pq.push(new ObjectPair(1000, i));
    }
    else // modified
      pq.push(new ObjectPair(0, sourceVertex)); // only push one

    var EdgeProcessed = 0;
  
    while (pq.length > 0) {
      pq.sort(ObjectPair.compare); // sort by distance, then by vertex number, lousy O(n log n) PQ update
      if (versiontype == 2 && EdgeProcessed > 50) { // to prevent infinite loop in Modified Dijkstra on negative cycle
        currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
        currentState["status"] = 'Modified Dijkstra\'s algorithm is stopped prematurely<br>in order to prevent infinite loop';
        stateList.push(currentState);
        break;
      }

      var curFront = pq[0].getSecond();
      done.push(curFront);

      // for debugging the entire PQ
      // for (var k = 0; k < pq.length; k++)
      //   currentState["status"] += '(' + pq[k].getFirst() + ',' + pq[k].getSecond() + ') ';
      var newStatus = 'The priority queue is now {(';
      newStatus += pq[0].getFirst() + ',' + pq[0].getSecond() + ')';
      if (pq.length > 1)
        newStatus += ', (' + pq[1].getFirst() + ',' + pq[1].getSecond() + ')';
      if (pq.length > 2)
        newStatus += ', (' + pq[2].getFirst() + ',' + pq[2].getSecond() + ')';
      if (pq.length > 3)
        newStatus += ', ...';
      var frontitem = pq.shift(); // front most item
      var dist = frontitem.getFirst(); // not used in original dijkstra
      var u = frontitem.getSecond();

      if (versiontype == 2 && dist > d[u]) {
        newStatus += '}<br>But this pair (' + dist + ',' + u + ') is an old information and skipped';

        currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
        currentState["lineNo"] = [2,3];
        currentState["status"] = newStatus;
        stateList.push(currentState);
        continue; // do not do anything else...
      }
      else {
        newStatus += '}<br>Exploring neighbors of vertex u = ' + u;
        vertexTraversed[curFront] = true; // only re-highlight here
        currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
        currentState["lineNo"] = 2;
        currentState["status"] = newStatus;
        stateList.push(currentState);
      }

      for (var j = 0; j < amountEdge; j++) {
        var vertexA = internalEdgeList[j]["vertexA"];
        var vertexB = internalEdgeList[j]["vertexB"];
        var weightAB = internalEdgeList[j]["weight"];

        if (u == vertexA) {
          vertexTraversed[vertexA] = true;
          EdgeProcessed = EdgeProcessed + 1;
          var thisStatus = 'relax(' + vertexA + ',' + vertexB + ',' + weightAB + '), #edge processed = ' + EdgeProcessed;

          if (d[vertexA] + weightAB < d[vertexB]) {
            d[vertexB] = d[vertexA] + weightAB;
            if (versiontype == 1)
              for (var k = 0; k < pq.length; k++) // lousy O(n) PQ update, but it works for this animation (only for version 1)
                if (pq[k].getSecond() == vertexB) {
                  pq.splice(k, 1);
                  break;
                }
                
            if (p[vertexB] != -1) { // it has a parent before
              for (var k = 0; k < amountEdge; k++)
                if (internalEdgeList[k]["vertexA"] == p[vertexB] && internalEdgeList[k]["vertexB"] == vertexB) {
                  delete edgeTraversed[k]; // remove this highlight
                  delete edgeHighlighted[k];
                  edgeGrey[k] = true; // now make it "grey"
                  break;
                }
            }

            for (key in internalEdgeList) // remove all highlight first
              delete edgeHighlighted[key];
            edgeHighlighted[j] = true; // show the processing of this edge
            edgeTraversed[j] = true;
            
            p[vertexB] = vertexA; // now update parent information
            internalAdjList[vertexB]["extratext"] = d[vertexB];
            thisStatus = thisStatus + '<br>We update d[' + vertexB + '] = ' + d[vertexB] + ' and p[' + vertexB + '] = ' + p[vertexB];

            var canRelaxThis = true;
            for (var k = 0; k < done.length; k++)
              if (done[k] == vertexB) {
                canRelaxThis = false;
                break;
              }

            if (versiontype == 2 || canRelaxThis) // for standard dijkstra
              pq.push(new ObjectPair(d[vertexB], vertexB));
          }
          else {
            thisStatus = thisStatus + '<br>No change';
            edgeGrey[j] = true; // make this grey
          }

          currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
          currentState["status"] = thisStatus;
          if (versiontype == 1)    
            currentState["lineNo"] = [3,4];
          else
            currentState["lineNo"] = [4,5];
          stateList.push(currentState);
        }
      }

      delete vertexTraversed[u]; // no longer traversed
      vertexHighlighted[u] = true; // but done, let it be highlighted
      for (key in internalEdgeList) // remove all highlight first
        delete edgeHighlighted[key];
      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
      if (versiontype == 1) {
        currentState["status"] = "Vertex " + u + " is completed, d[" + u + "] = " + d[u] + " is final";
        currentState["lineNo"] = [3,4];
      }
      else {
        currentState["status"] = "Vertex " + u + " is 'temporarily' completed,<br>d[" + u + "] = " + d[u] + " can still be re-updated in the future as necessary";
        currentState["lineNo"] = [4,5];
      }
      stateList.push(currentState);
    }

    if (versiontype == 1 || (versiontype == 2 && EdgeProcessed <= 50)) { // to prevent infinite loop in Modified Dijkstra on negative cycle
      currentState = createState(internalAdjList, internalEdgeList, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey);
      currentState["status"] = (versiontype == 1 ? 'Original ' : 'Modified ') + 'Dijkstra\'s processes O((V + E) * log V) = ' + EdgeProcessed + ' edges.<br>The highlighted edges form the SSSP spanning tree from source = ' + sourceVertex;
      stateList.push(currentState);
    }

    // console.log(stateList);

    if (versiontype == 1)    
      populatePseudocode(2);
    else
      populatePseudocode(3);

    graphWidget.startAnimation(stateList);
    return true;
  }

  this.examples = function(ssspExampleConstant) {
    internalAdjList = $.extend(true, {}, TEMPLATES[ssspExampleConstant][0]);
    internalEdgeList = $.extend(true, {}, TEMPLATES[ssspExampleConstant][1]);
    amountVertex = TEMPLATES[ssspExampleConstant][2];
    amountEdge = TEMPLATES[ssspExampleConstant][3];
    
    for (key in internalAdjList)
      internalAdjList[key]["extratext"] = "";

    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
    return true;
  }

/*version that uses php graph generator, buggy because of graph form and createState()
  this.initRandom = function(graph) {
    internalAdjList = graph.internalAdjList;
    internalEdgeList = graph.internalEdgeList;
    amountVertex = internalAdjList.length;
    amountEdge = internalEdgeList.length;
    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
  }*/

  //Temporary version
  /*this.initRandom = function(allowNegative) {
    var templateNo = Math.floor(Math.random()*4); // choose one of the template 0-3

    internalAdjList = $.extend(true, {}, TEMPLATES[templateNo][0]);
    internalEdgeList = $.extend(true, {}, TEMPLATES[templateNo][1]);
    amountVertex = TEMPLATES[templateNo][2];
    amountEdge = TEMPLATES[templateNo][3];

    //change edge weights
    var keys = Object.keys(internalEdgeList);
    var nVertices = Object.keys(internalAdjList).length/2;
    var nEdges = keys.length/2;
    for(var i=0; i<nEdges; i++) {
      var newWeight;
      if(allowNegative) {
        var confirmNeg  = Math.floor(Math.random()*nEdges);
        if(i == confirmNeg) { //so that confirm is at least 1 edge with negative weight
          newWeight = Math.floor(Math.random()*20)-20; //-20 to -1
        } else {
          newWeight = Math.floor(Math.random()*100)-20; //-20 to 79
        }
      } else {
        newWeight = Math.floor(Math.random()*50); // 0 to 49
      }
      internalEdgeList[keys[i]]["weight"] = newWeight;
      //internalEdgeList[keys[i+nEdges]]["weight"] = newWeight; //graph on right
    }
    
    for (key in internalAdjList)
      internalAdjList[key]["extratext"] = ""; // clear this

    //for graphs without bi-directional edges, randomly change edge directions
    if(templateNo == SSSP_EXAMPLE_CP3_4_17 || templateNo == SSSP_EXAMPLE_CP3_4_18) {
      for(var i=0; i<nEdges; i++) {
        var flipEdge = Math.floor(Math.random()*2); //0 or 1
        if(flipEdge == 1) {
          //then flip edge
          var origA = internalEdgeList[keys[i]]["vertexA"];
          var origB = internalEdgeList[keys[i]]["vertexB"];
          internalEdgeList[keys[i]]["vertexA"] = origB;
          internalEdgeList[keys[i]]["vertexB"] = origA;
          //internalEdgeList[keys[i+nEdges]]["vertexA"] = origB+nVertices; //graph on right
          //internalEdgeList[keys[i+nEdges]]["vertexB"] = origA+nVertices; //graph on right
          //correct vertex adj list also
          delete internalAdjList[origA][origB];
          //delete internalAdjList[origA+nVertices][origB+nVertices]; //graph on right
          internalAdjList[origB][origA] = i;
          //internalAdjList[origB+nVertices][origA+nVertices] = i+nEdges; //graph on right
        }
      }
    }

    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState, 500);
    return true;
  }*/

  function createState(internalAdjListObject, internalEdgeListObject, vertexHighlighted, edgeHighlighted, vertexTraversed, edgeTraversed, edgeGrey){
    if(vertexHighlighted == null) vertexHighlighted = {};
    if(edgeHighlighted == null) edgeHighlighted = {};
    if(vertexTraversed == null) vertexTraversed = {};
    if(edgeTraversed == null) edgeTraversed = {};
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
      state["vl"][key]["extratext"] = internalAdjListObject[key]["extratext"];
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

    for(key in edgeHighlighted){
      state["el"][key]["state"] = EDGE_HIGHLIGHTED;
      state["el"][key]["animateHighlighted"] = true;
    }

    for(key in vertexTraversed){
      state["vl"][key]["state"] = VERTEX_TRAVERSED;
    }

    for(key in edgeTraversed){
      state["el"][key]["state"] = EDGE_TRAVERSED;
    }

    for(key in edgeGrey){
      state["el"][key]["state"] = EDGE_GREY;
    }

    return state;
  }
  
  function populatePseudocode(act) {
    switch (act) {
      case 0: // BFS
        $('#code1').html('initSSSP');
        $('#code2').html('while the queue Q is not empty');
        $('#code3').html('&nbsp;&nbsp;for each neighbor v of u = Q.front()');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;relax(u, v, w(u, v))');
        $('#code5').html('');
        $('#code6').html('');
        $('#code7').html('');
        break;
      case 1: // Bellman Ford's
        $('#code1').html('initSSSP');
        $('#code2').html('for i = 1 to |V|-1');
        $('#code3').html('&nbsp;&nbsp;for each edge(u, v) in E');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;relax(u, v, w(u, v))');
        $('#code5').html('');
        $('#code6').html('');
        $('#code7').html('');
        break;
      case 2: // Original Dijkstra's
        $('#code1').html('initSSSP');
        $('#code2').html('while the priority queue PQ is not empty');
        $('#code3').html('&nbsp;&nbsp;for each neighbor v of u = PQ.front()');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;relax(u, v, w(u, v)) + update PQ');
        $('#code5').html('');
        $('#code6').html('');
        $('#code7').html('');
        break;
      case 3: // Modified Dijkstra's
        $('#code1').html('initSSSP');
        $('#code2').html('while the priority queue PQ is not empty');
        $('#code3').html('&nbsp;&nbsp;if the front pair is invalid, skip');
        $('#code4').html('&nbsp;&nbsp;for each neighbor v of u = PQ.front()');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;relax(u, v, w(u, v)) + insert new pair to PQ');
        $('#code6').html('');
        $('#code7').html('');
        break;
    }
  }
}

//SSSP sample graph templates
var TEMPLATES = new Array();
TEMPLATES[SSSP_EXAMPLE_CP3_4_3] = [
{
  0:{
    "cx": 170,
    "cy": 20,
    "text": 0
  },
  1:{
    "cx": 290,
    "cy": 20,
    "text": 1
  },
  2:{
    "cx": 410,
    "cy": 20,
    "text": 2
  },
  3:{
    "cx": 530,
    "cy": 20,
    "text": 3
  },
  4:{
    "cx": 120,
    "cy": 120,
    "text": 4
  },
  5:{
    "cx": 240,
    "cy": 120,
    "text": 5
  },
  6:{
    "cx": 460,
    "cy": 120,
    "text": 6
  },
  7:{
    "cx": 580,
    "cy": 120,
    "text": 7
  },
  8:{
    "cx": 175,
    "cy": 220,
    "text": 8
  },
  9:{
    "cx": 220,
    "cy": 310,
    "text": 9
  },
  10:{
    "cx": 290,
    "cy": 310,
    "text": 10
  },
  11:{
    "cx": 410,
    "cy": 310,
    "text": 11
  },
  12:{
    "cx": 480,
    "cy": 310,
    "text": 12
  }
},
{
  0:{
    "vertexA": 0,
    "vertexB": 1,
    "weight": 1
  },
  1:{
    "vertexA": 0,
    "vertexB": 4,
    "weight": 1
  },
  2:{
    "vertexA": 1,
    "vertexB": 0,
    "weight": 1
  },
  3:{
    "vertexA": 1,
    "vertexB": 2,
    "weight": 1
  },
  4:{
    "vertexA": 1,
    "vertexB": 5,
    "weight": 1
  },
  5:{
    "vertexA": 2,
    "vertexB": 1,
    "weight": 1
  },
  6:{
    "vertexA": 2,
    "vertexB": 3,
    "weight": 1
  },
  7:{
    "vertexA": 2,
    "vertexB": 6,
    "weight": 1
  },
  8:{
    "vertexA": 3,
    "vertexB": 2,
    "weight": 1
  },
  9:{
    "vertexA": 3,
    "vertexB": 7,
    "weight": 1
  },
  10:{
    "vertexA": 4,
    "vertexB": 0,
    "weight": 1
  },
  11:{
    "vertexA": 4,
    "vertexB": 8,
    "weight": 1
  },
  12:{
    "vertexA": 5,
    "vertexB": 1,
    "weight": 1
  },
  13:{
    "vertexA": 5,
    "vertexB": 6,
    "weight": 1
  },
  14:{
    "vertexA": 5,
    "vertexB": 10,
    "weight": 1
  },
  15:{
    "vertexA": 6,
    "vertexB": 2,
    "weight": 1
  },
  16:{
    "vertexA": 6,
    "vertexB": 5,
    "weight": 1
  },
  17:{
    "vertexA": 6,
    "vertexB": 11,
    "weight": 1
  },
  18:{
    "vertexA": 7,
    "vertexB": 3,
    "weight": 1
  },
  19:{
    "vertexA": 7,
    "vertexB": 12,
    "weight": 1
  },
  20:{
    "vertexA": 8,
    "vertexB": 4,
    "weight": 1
  },
  21:{
    "vertexA": 8,
    "vertexB": 9,
    "weight": 1
  },
  22:{
    "vertexA": 9,
    "vertexB": 8,
    "weight": 1
  },
  23:{
    "vertexA": 9,
    "vertexB": 10,
    "weight": 1
  },
  24:{
    "vertexA": 10,
    "vertexB": 5,
    "weight": 1
  },
  25:{
    "vertexA": 10,
    "vertexB": 9,
    "weight": 1
  },
  26:{
    "vertexA": 10,
    "vertexB": 11,
    "weight": 1
  },
  27:{
    "vertexA": 11,
    "vertexB": 6,
    "weight": 1
  },
  28:{
    "vertexA": 11,
    "vertexB": 10,
    "weight": 1
  },
  29:{
    "vertexA": 11,
    "vertexB": 12,
    "weight": 1
  },
  30:{
    "vertexA": 12,
    "vertexB": 7,
    "weight": 1
  },
  31:{
    "vertexA": 12,
    "vertexB": 11,
    "weight": 1
  }
},
13, 32
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_17] = [
{
  0:{
    "cx": 330,
    "cy": 120,
    "text": 0
  },
  1:{
    "cx": 200,
    "cy": 50,
    "text": 1
  },
  2:{
    "cx": 390,
    "cy": 210,
    "text": 2
  },
  3:{
    "cx": 580,
    "cy": 50,
    "text": 3
  },
    4:{
    "cx": 430,
    "cy": 320,
    "text": 4
  }
},
{
  0:{
    "vertexA": 1,
    "vertexB": 4,
    "weight": 6
  },
  1:{
    "vertexA": 1,
    "vertexB": 3,
    "weight": 3
  },
  2:{
    "vertexA": 0,
    "vertexB": 1,
    "weight": 2
  },
  3:{
    "vertexA": 2,
    "vertexB": 4,
    "weight": 1
  },
  4:{
    "vertexA": 0,
    "vertexB": 2,
    "weight": 6
  },
  5:{
    "vertexA": 3,
    "vertexB": 4,
    "weight": 5
  },
  6:{
    "vertexA": 0,
    "vertexB": 3,
    "weight": 7
  }
},
5,7
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_18] = [
{
  0:{
    "cx": 200,
    "cy": 125,
    "text": 0
  },
  1:{
    "cx": 300,
    "cy": 50,
    "text": 1
  },
  2:{
    "cx": 300,
    "cy": 200,
    "text": 2
  },
  3:{
    "cx": 400,
    "cy": 125,
    "text": 3
  },
  4:{
    "cx": 500,
    "cy": 125,
    "text": 4
  }
},
{
  0:{
    "vertexA": 0,
    "vertexB": 1,
    "weight": 1
  },
  1:{
    "vertexA": 1,
    "vertexB": 3,
    "weight": 2
  },
  2:{
    "vertexA": 3,
    "vertexB": 4,
    "weight": 3
  },
  3:{
    "vertexA": 0,
    "vertexB": 2,
    "weight": 10
  },
  4:{
    "vertexA": 2,
    "vertexB": 3,
    "weight": -10
  }
},
5,5
];
TEMPLATES[SSSP_EXAMPLE_CP3_4_19] = [
{
  0:{
    "cx": 200,
    "cy": 50,
    "text": 0
  },
  1:{
    "cx": 300,
    "cy": 50,
    "text": 1
  },
  2:{
    "cx": 400,
    "cy": 50,
    "text": 2
  },
  3:{
    "cx": 500,
    "cy": 50,
    "text": 3
  },
  4:{
    "cx": 300,
    "cy": 125,
    "text": 4
  }
},
{
  0:{
    "vertexA": 0,
    "vertexB": 1,
    "weight": 99
  },
  1:{
    "vertexA": 1,
    "vertexB": 2,
    "weight": 15
  },
  2:{
    "vertexA": 2,
    "vertexB": 1,
    "weight": -42
  },
  3:{
    "vertexA": 2,
    "vertexB": 3,
    "weight": 10
  },
  4:{
    "vertexA": 0,
    "vertexB": 4,
    "weight": -99
  },
},
5,5
];
