
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
        "cy": (175 + (i + 1 - (leftVertex + 1) / 2) * (leftVertex == 1 ? 0 : 300 / (leftVertex - 1))),
        "text": i
      }
    }

    for (var i = 0; i < rightVertex; ++i){
      internalAdjList[i + leftVertex] = 
      {
        "cx": 450,
        "cy": (175 + (i + 1 - (rightVertex + 1) / 2) * (rightVertex == 1 ? 0 : 300 / (rightVertex - 1))),
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
        $('#bfs-err').html("There is no graph to run this on." + 
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
      match = greedyMatch();
      currentState = createState(internalAdjList, internalEdgeList, 
                                 vertexHighlighted, edgeHighlighted, 
                                 vertexTraversed, edgeTraversed);
      currentState["status"] = 'Pick random greedy pairing';
      currentState["lineNo"] = 1;
      stateList.push(currentState);
    }

    currentState = createState(internalAdjList, internalEdgeList, 
                               vertexHighlighted, edgeHighlighted, 
                               vertexTraversed, edgeTraversed);
    currentState["status"] = 'For each node on the left hand set' + 
        ', look for an augmenting path';
    currentState["lineNo"] = 1;
    stateList.push(currentState);



    for (var i=0;i<amountLeftSet;i++){
      vertexTraversed = {};
      vertexTraversed[i] = true;
      currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed);
      currentState["status"] = 'For node ' + 
      internalAdjList[i]["text"] + ':';
      currentState["lineNo"] = 1;
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
        currentState["lineNo"] = 2;
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
        currentState["lineNo"] = 2;
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
        currentState["lineNo"] = 2;
        stateList.push(currentState);
        toSet.push(LeftToRightEdge[x]);
      }

      vertexTraversed = {};
      vertexTraversed2 = {};
      currentState = createState(internalAdjList, internalEdgeList,
                                 vertexHighlighted, edgeHighlighted,
                                 vertexTraversed, edgeTraversed,
                                 vertexTraversed2, edgeTraversed2);
      currentState["status"] = 'No more edges to add. Augmenting path found';
      currentState["lineNo"] = 2;
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
        currentState["lineNo"] = 3;
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
        currentState["lineNo"] = 3;
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
        currentState["lineNo"] = 3;
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
      currentState["lineNo"] = 3;
      stateList.push(currentState);            
    }

    vertexTraversed = {};
    currentState = createState(internalAdjList, internalEdgeList,
                               vertexHighlighted, edgeHighlighted,
                               vertexTraversed, edgeTraversed);
    currentState["status"] = 'Done';
    currentState["lineNo"] = 4;
    stateList.push(currentState);

    graphWidget.startAnimation(stateList);
    populatePseudocode(0);
    console.log(stateList);
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

    function greedyMatch(){
      for(key in internalEdgeList){
        var x = internalEdgeList[key]["vertexA"];
        var y = internalEdgeList[key]["vertexB"];
        if(match[x]==-1&&match[y]==-1){
          match[x] = y;
          match[y] = x;
          edgeHighlighted[key] = true;
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
        document.getElementById('code1').innerHTML = 'for each node in' +
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
    }
}


var templates = 
[[{
    0:{
        "cx":40,
        "cy":40,
        "text":1,
    },
    1:{
        "cx":40,
        "cy":120,
        "text":2,
    },
    2:{
        "cx":120,
        "cy":40,
        "text":3
    },
    3:{
        "cx":120,
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
         "cx":30,
         "cy":30,
         "text":1
     },
     1:{
         "cx":30,
         "cy":90,
         "text":7
     },
     2:{
         "cx":30,
         "cy":150,
         "text":11
     },
     3:{
         "cx":90,
         "cy":30,
         "text":4
     },
     4:{
         "cx":90,
         "cy":90,
         "text":10
     },
     5:{
         "cx":90,
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
         "cx":40,
         "cy":40,
         "text":1
     },
     1:{
         "cx":40,
         "cy":120,
         "text":2,
     },
     2:{
         "cx":120,
         "cy":40,
         "text":3
     },
     3:{
         "cx":120,
         "cy":120,
         "text":4
     },
     4:{
         "cx":120,
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
          "cx":40,
          "cy":40,
          "text":1
      },
      1:{
          "cx":40,
          "cy":100,
          "text":2
      },
      2:{
          "cx":40,
          "cy":160,
          "text":3
      },
      3:{
          "cx":40,
          "cy":220,
          "text":4
      },
      4:{
          "cx":40,
          "cy":280,
          "text":5
      },
      5:{
          "cx":120,
          "cy":40,
          "text":6
      },
      6:{
          "cx":120,
          "cy":100,
          "text":7
      },
      7:{
          "cx":120,
          "cy":160,
          "text":8
      },
      8:{
          "cx":120,
          "cy":220,
          "text":9
      },
      9:{
          "cx":120,
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
