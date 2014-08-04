// @author Jonathan Irvin Gunawan
// Defines an Binary Indexed (Fenwick) Tree object; keeps implementation of graph internally and interact with GraphWidget to display with query and update visualization

// Binary Indexed Tree example Constatnts
var MAXFLOW_EXAMPLE_CP3_4_24 = 0;
var noOfExamples = 1;
var INF = 1000000000;
var POINT_UPDATE_RANGE_QUERY = 0;
var RANGE_UPDATE_POINT_QUERY = 1;
var RANGE_UPDATE_RANGE_QUERY = 2;
var BITType;

var actions = [".point-update-range-query-actions ",".range-update-point-query-actions ",".range-update-range-query-actions "];

var BIT = function(){
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
  var numberOfData;
  var psuedocode;

  var LSOne = function(point)
  {
    return (point & -point);
  }

  this.getGraphWidget = function(){
    return graphWidget;
  }

  this.fill = function()
  {
    if (BITType == POINT_UPDATE_RANGE_QUERY)
    {
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[i + numberOfData]["text"] = Math.floor(Math.random() * 10);
        for (var j = i; j <= numberOfData; j += LSOne(j))
          internalAdjList[j]["text"] += internalAdjList[i + numberOfData]["text"];
      }
    } /*else if (BITType == RANGE_UPDATE_POINT_QUERY)
    {
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[i + numberOfData]["text"] = Math.floor(Math.random() * 10);
        for (var j = i; j <= numberOfData; j += LSOne(j))
          internalAdjList[j]["text"] += internalAdjList[i + numberOfData]["text"];
        for (var j = i+1; j <= numberOfData; j += LSOne(j))
          internalAdjList[j]["text"] -= internalAdjList[i + numberOfData]["text"];
      }
    } *//*else if (BITType == RANGE_UPDATE_RANGE_QUERY)
    {
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[i + 2 * numberOfData]["text"] = Math.floor(Math.random() * 10);
        for (var j = i; j <= numberOfData; j += LSOne(j))
          internalAdjList[j]["text"] += internalAdjList[i + 2 * numberOfData]["text"];
        for (var j = i+1; j <= numberOfData; j += LSOne(j))
          internalAdjList[j]["text"] -= internalAdjList[i + 2 * numberOfData]["text"];
        for (var j = i; j <= numberOfData; j += LSOne(j))
          internalAdjList[j + numberOfData]["text"] -= internalAdjList[i + 2 * numberOfData]["text"] * (i - 1);
        for (var j = i+1; j <= numberOfData; j += LSOne(j))
          internalAdjList[j + numberOfData]["text"] -= internalAdjList[i + 2 * numberOfData]["text"] * (i);
      }
    }*/
    var newState = createState(internalAdjList, internalEdgeList);
    graphWidget.updateGraph(newState,500);
  }

  this.resize = function(numberOfVertex)
  {
    amountEdge = 0;
    internalEdgeList = {};
    internalAdjList = {};
    numberOfData = numberOfVertex;
    amountVertex = numberOfData * 2;
    $('.point-update-range-query-actions #query-input-right').val(numberOfData);
    $('.range-update-range-query-actions #query-input-right').val(numberOfData);
    $('.range-update-point-query-actions #update-input-right').val(numberOfData);
    $('.range-update-range-query-actions #update-input-right').val(numberOfData);

    if (BITType == RANGE_UPDATE_POINT_QUERY || BITType == POINT_UPDATE_RANGE_QUERY)
    {
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[i] = 
        {
          "cx": (numberOfData == 1 ? 850 : 50 + 800 / (numberOfData-1) * (i-1)),
          "cy": 50,
          "text": 0,
          "extratext" : i
        }
      }
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[numberOfData + i] = 
        {
          "cx": (numberOfData == 1 ? 850 : 50 + 800 / (numberOfData-1) * (i-1)),
          "cy": 350,
          "text": 0,
          "extratext" : i,
          "state" : VERTEX_BLUE_FILL
        }
      }
    } else if (BITType == RANGE_UPDATE_RANGE_QUERY)
    {
      amountVertex += numberOfData;
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[i] = 
        {
          "cx": (numberOfData == 1 ? 850 : 50 + 800 / (numberOfData-1) * (i-1)),
          "cy": 50,
          "text": 0,
          "extratext" : i
        }
      }
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[numberOfData + i] = 
        {
          "cx": (numberOfData == 1 ? 850 : 50 + 800 / (numberOfData-1) * (i-1)),
          "cy": 250,
          "text": 0,
          "extratext" : i
        }
      }
      for (var i = 1; i <= numberOfData; ++i)
      {
        internalAdjList[2 * numberOfData + i] = 
        {
          "cx": (numberOfData == 1 ? 850 : 50 + 800 / (numberOfData-1) * (i-1)),
          "cy": 450,
          "text": 0,
          "extratext" : i,
          "state" : VERTEX_BLUE_FILL
        }
      }
    }
    return true;
  }

  


  var createUpdatingTree = function(point,topLimit,yDifference,incIndex)
  {
    if (yDifference == null) yDifference = 50;
    if (incIndex == null) incIndex = 0;
    internalAdjList[point + incIndex]["cx"] = (numberOfData == 1 ? 850 : 50 + 800 / (numberOfData-1) * (point-1));
    internalAdjList[point + incIndex]["cy"] = topLimit;
    for (var i = 0; i < point; ++i) if (i + LSOne(i) == point)
    {
      internalEdgeList[amountEdge] = 
      {
        "vertexA" : i + incIndex,
        "vertexB" : point + incIndex,
      }
      internalAdjList[point + incIndex][i + incIndex] = amountEdge;
      internalAdjList[i + incIndex][point + incIndex] = amountEdge;
      ++amountEdge;
      createUpdatingTree(i,topLimit + yDifference,yDifference,incIndex);
    }
  }

  var updatePoint = function(position,value)
  {
    if (position > numberOfData) return true;
    internalEdgeList = {};
    amountEdge = 0;
    for (var i = 1; i <= numberOfData; ++i) if(i + LSOne(i) > numberOfData)
      createUpdatingTree(i,50);

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Creating the updating tree';
    if (psuedocode == 0)
      currentState["lineNo"] = [1];
    else if (psuedocode == 6) 
      currentState["lineNo"] = [2,3];
    else if (psuedocode == 2)
      currentState["lineNo"] = [2];

    stateList.push(currentState);

    var edgeIndex = -1;

    while (position <= numberOfData)
    {
      internalAdjList[position]["text"] += value;
      internalAdjList[position]["state"] = VERTEX_HIGHLIGHTED;
      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'position = ' + position;
      currentState["status"] += '<br>BIT[' + position + '] = ' + (internalAdjList[position]["text"] - value);
      currentState["status"] += ' + ' + value + ' = ' + internalAdjList[position]["text"] + '</br>';
      if (psuedocode == 0)
        currentState["lineNo"] = [2,3,4];
      else if (psuedocode == 6) 
        currentState["lineNo"] = [2,3];
      else if (psuedocode == 2)
        currentState["lineNo"] = [3,4,5];
      stateList.push(currentState);
      internalAdjList[position]["state"] = VERTEX_DEFAULT;
      if (edgeIndex != -1)
      {
        internalEdgeList[edgeIndex]["state"] = EDGE_DEFAULT;
        internalEdgeList[edgeIndex]["animateHighlighted"] = false;
      }
      if (position + LSOne(position) <= numberOfData)
      {
        edgeIndex = internalAdjList[position][position + LSOne(position)];
        internalEdgeList[edgeIndex]["state"] = EDGE_RED;
        internalEdgeList[edgeIndex]["animateHighlighted"] = true;
      }
      position += LSOne(position);
    }

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'position = ' + position + '. position > N';
    currentState["status"] += '<br>Update done</br>';
    stateList.push(currentState);
    
    return true;
  }

  this.updatePoint = function(position,value)
  {
    if (position <= 0 || position > numberOfData)
    {
      $(actions[BITType] + '#update-err').html('position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    psuedocode = 0;
    
    stateList = [];

    internalAdjList[position + numberOfData]["text"] += value;
    internalAdjList[position + numberOfData]["state"] = VERTEX_HIGHLIGHTED;
    currentState = createState(internalAdjList,internalEdgeList);
    currentState["status"] = 'Updating array';
    stateList.push(currentState);
    internalAdjList[position + numberOfData]["state"] = VERTEX_BLUE_FILL;
    
    if (!updatePoint(position,value)) 
      return false;
    graphWidget.startAnimation(stateList);
    populatePseudocode(psuedocode);
    return true;
  }

  var updateRange = function(positionLeft,positionRight,value)
  {
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Updating (' + positionLeft + ',' + value + ')';
    if (psuedocode == 6)
      currentState["lineNo"] = [2,3];
    else currentState["lineNo"] = [6];
    stateList.push(currentState);
    if (!updatePoint(positionLeft,value)) 
      return false;
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Updating (' + (positionRight+1) + ',' + (-value) + ')';
    if (psuedocode == 6)
      currentState["lineNo"] = [2,3];
    else currentState["lineNo"] = [7];
    stateList.push(currentState);
    if (!updatePoint(positionRight+1,-value)) 
      return false;
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Update Done';
    if (psuedocode == 6)
      currentState["lineNo"] = [2,3];
    else currentState["lineNo"] = [7];
    stateList.push(currentState);
    return true;
  }

  this.updateRange = function(positionLeft,positionRight,value)
  {
    psuedocode = 2;
    if (positionLeft > positionRight)
    {
      $(actions[BITType] + '#update-err').html('left position must be smaller or equal to right position');
      return false;
    }
    if (positionLeft <= 0)
    {
      $(actions[BITType] + '#update-err').html('left position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    if (positionRight >= numberOfData)
    {
      $(actions[BITType] + '#update-err').html('left position must be between 1 and ' + (numberOfData-1) + ' inclusive.');
      return false;
    }
    
    stateList = [];
    
    for (var i = positionLeft; i <= positionRight; ++i)
    {
      internalAdjList[i + numberOfData]["text"] += value;
      internalAdjList[i + numberOfData]["state"] = VERTEX_HIGHLIGHTED;
    }
    currentState = createState(internalAdjList,internalEdgeList);
    currentState["status"] = 'Updating array';
    stateList.push(currentState);
    for (var i = positionLeft; i <= positionRight; ++i)
    {
      internalAdjList[i + numberOfData]["state"] = VERTEX_BLUE_FILL;
    }

    if (!updateRange(positionLeft,positionRight,value)) return false;
    graphWidget.startAnimation(stateList);
    populatePseudocode(psuedocode);
    return true;
  }

  var updatePointV2 = function(position,value,incIndex,lineNumber)
  {
    if (position > numberOfData) return true;
    internalEdgeList = {};
    amountEdge = 0;

    if (incIndex == 0)
    {
      for (var i = 1; i <= numberOfData; ++i) if(i + LSOne(i) > numberOfData)
        createUpdatingTree(i,50,25,0);
    } else
    {
      for (var i = 1; i <= numberOfData; ++i) if(i + LSOne(i) > numberOfData)
        createUpdatingTree(i,250,25,numberOfData);
    }

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Creating the updating tree';
    currentState["lineNo"] = lineNumber;
    

    stateList.push(currentState);

    var edgeIndex = -1;

    while (position <= numberOfData)
    {
      internalAdjList[position + incIndex]["text"] += value;
      internalAdjList[position + incIndex]["state"] = VERTEX_HIGHLIGHTED;
      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'position = ' + position;
      currentState["status"] += '<br>BIT[' + position + '] = ' + (internalAdjList[position + incIndex]["text"] - value);
      currentState["status"] += ' + ' + value + ' = ' + internalAdjList[position + incIndex]["text"] + '</br>';
      currentState["lineNo"] = lineNumber;
      stateList.push(currentState);
      internalAdjList[position + incIndex]["state"] = VERTEX_DEFAULT;
      if (edgeIndex != -1)
      {
        internalEdgeList[edgeIndex]["state"] = EDGE_DEFAULT;
        internalEdgeList[edgeIndex]["animateHighlighted"] = false;
      }
      if (position + LSOne(position) <= numberOfData)
      {
        edgeIndex = internalAdjList[position + incIndex][position + LSOne(position) + incIndex];
        internalEdgeList[edgeIndex]["state"] = EDGE_RED;
        internalEdgeList[edgeIndex]["animateHighlighted"] = true;
      }
      position += LSOne(position);
    }

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'position = ' + position + '. position > N';
    currentState["status"] += '<br>Update done</br>';
    currentState["lineNo"] = lineNumber;
    stateList.push(currentState);
    
    return true;
  }

  var updateRangeV2 = function(positionLeft,positionRight,value,lineNumber)  
  {
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'BIT1 updating(' + positionLeft + ',' + value + ')';
    currentState["lineNo"] = [lineNumber == null ? 2 : lineNumber];
    stateList.push(currentState);
    if (!updatePointV2(positionLeft,value,0,lineNumber == null ? 2 : lineNumber))
      return false;

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'BIT1 updating(' + (positionRight + 1) + ',' + ( -value ) + ')';
    currentState["lineNo"] = [lineNumber == null ? 3 : lineNumber];
    stateList.push(currentState);
    if (!updatePointV2(positionRight + 1,-value,0,lineNumber == null ? 3 : lineNumber))
      return false;

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'BIT2 updating(' + (positionLeft) + ',' + ( value * (positionLeft - 1) ) + ')';
    currentState["lineNo"] = [lineNumber == null ? 4 : lineNumber];
    stateList.push(currentState);
    if (!updatePointV2(positionLeft,value * (positionLeft - 1),numberOfData,lineNumber == null ? 4 : lineNumber))
      return false;

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'BIT2 updating(' + (positionRight + 1) + ',' + ( -value * positionRight ) + ')';
    currentState["lineNo"] = [lineNumber == null ? 5 : lineNumber];
    stateList.push(currentState);
    if (!updatePointV2(positionRight + 1,-value * positionRight,numberOfData,lineNumber == null ? 5 : lineNumber))
      return false;

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Update done';
    stateList.push(currentState);
    return true;
  }

  this.updateRangeV2 = function(positionLeft,positionRight,value) //for RURQ
  {
    psuedocode = 4;
    if (positionLeft > positionRight)
    {
      $(actions[BITType] + '#update-err').html('left position must be smaller or equal to right position');
      return false;
    }
    if (positionLeft <= 0)
    {
      $(actions[BITType] + '#update-err').html('left position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    if (positionRight >= numberOfData)
    {
      $(actions[BITType] + '#update-err').html('left position must be between 1 and ' + (numberOfData-1) + ' inclusive.');
      return false;
    }
    
    stateList = [];
    
    for (var i = positionLeft; i <= positionRight; ++i)
    {
      internalAdjList[i + 2 * numberOfData]["text"] += value;
      internalAdjList[i + 2 * numberOfData]["state"] = VERTEX_HIGHLIGHTED;
    }
    currentState = createState(internalAdjList,internalEdgeList);
    currentState["status"] = 'Updating array';
    stateList.push(currentState);
    for (var i = positionLeft; i <= positionRight; ++i)
    {
      internalAdjList[i + 2 * numberOfData]["state"] = VERTEX_BLUE_FILL;
    }

    if (!updateRangeV2(positionLeft,positionRight,value)) return false;
    graphWidget.startAnimation(stateList);
    populatePseudocode(psuedocode);
    return true;
  }




  var createQueryTree = function(point,topLimit,yDifference,incIndex)
  {
    if (yDifference == null) yDifference = 50;
    if (incIndex == null) incIndex = 0;
    internalAdjList[point + incIndex]["cx"] = (numberOfData == 1 ? 850 : 50 + 800 / (numberOfData-1) * (point-1));
    internalAdjList[point + incIndex]["cy"] = topLimit;
    for (var i = point+1; i <= numberOfData; ++i) if (i - LSOne(i) == point)
    {
      internalEdgeList[amountEdge] = 
      {
        "vertexA" : i + incIndex,
        "vertexB" : point + incIndex,
      }
      internalAdjList[point + incIndex][i + incIndex] = amountEdge;
      internalAdjList[i + incIndex][point + incIndex] = amountEdge;
      ++amountEdge;
      createQueryTree(i,topLimit + 50,yDifference,incIndex);
    }
  }

  var prefixSum = function(position)
  {
    var sum = 0;
    var startPosition = position;
    var edgeIndex = -1;

    while (position > 0)
    {
      internalAdjList[position]["state"] = VERTEX_HIGHLIGHTED;
      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'RSQ(1,' + startPosition + ') = ' + sum + ' + ' + internalAdjList[position]["text"] + ' = ';
      currentState["status"] += sum + internalAdjList[position]["text"];
      currentState["lineNo"] = [4,5,6];
      stateList.push(currentState);
      internalAdjList[position]["state"] = VERTEX_DEFAULT;
      sum += internalAdjList[position]["text"];
      if (edgeIndex != -1)
      {
        internalEdgeList[edgeIndex]["state"] = EDGE_DEFAULT;
        internalEdgeList[edgeIndex]["animateHighlighted"] = false;
      }
      if (position - LSOne(position) > 0)
      {
        edgeIndex = internalAdjList[position][position - LSOne(position)];
        internalEdgeList[edgeIndex]["state"] = EDGE_RED;
        internalEdgeList[edgeIndex]["animateHighlighted"] = true;
      }
      position -= LSOne(position);
    }
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'RSQ(1,' + startPosition + ') = ' + sum;
    currentState["lineNo"] = [2];
    stateList.push(currentState);

    return sum;
  }

  var sumRange = function(positionLeft,positionRight)
  {
    internalEdgeList = {};
    amountEdge = 0;
    for (var i = 1; i <= numberOfData; ++i)
    {
      if (i - LSOne(i) == 0)
        createQueryTree(i,50);
    }
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Creating the interrogation tree';
    currentState["lineNo"] = [1];
    stateList.push(currentState);

    var sumRight = prefixSum(positionRight);
    var sumLeft = prefixSum(positionLeft - 1);

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'RSQ(' + positionLeft + ',' + positionRight + ')';
    currentState["status"] += ' = RSQ(1,' + positionRight + ') - RSQ(1,' + (positionLeft-1) + ')';
    currentState["status"] += ' = ' + sumRight + ' - ' + sumLeft + ' = ' + (sumRight - sumLeft);
    currentState["lineNo"] = [7];
    stateList.push(currentState);
  
    return true;
  }

  this.sumRange = function(positionLeft,positionRight)
  {
    if (positionLeft > positionRight)
    {
      $(actions[BITType] + '#query-err').html('left position must be smaller or equal to right position');
      return false;
    }
    if (positionLeft <= 0)
    {
      $(actions[BITType] + '#query-err').html('left position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    if (positionRight > numberOfData)
    {
      $(actions[BITType] + '#query-err').html('left position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    psuedocode = 1;
    stateList = [];

    for (var i = positionLeft; i <= positionRight; ++i)
      internalAdjList[i + numberOfData]["state"] = VERTEX_HIGHLIGHTED;
    sumRange(positionLeft,positionRight)
    for (var i = positionLeft; i <= positionRight; ++i)
      internalAdjList[i + numberOfData]["state"] = VERTEX_BLUE_FILL;


    graphWidget.startAnimation(stateList);
    populatePseudocode(psuedocode);
    return true;
  }

  var sumPoint = function(position)
  {
    internalEdgeList = {};
    amountEdge = 0;
    for (var i = 1; i <= numberOfData; ++i)
    {
      if (i - LSOne(i) == 0)
        createQueryTree(i,50);
    }
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Creating the interrogation tree';
    currentState["lineNo"] = [2];
    stateList.push(currentState);

    var sum = prefixSum(position);

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'data[' + position + '] = RSQ(1,' + position + ') = ' + sum;
    currentState["lineNo"] = [7];
    stateList.push(currentState);

    return true;
  }

  this.sumPoint = function(position)
  {
    psuedocode = 3;
    if (position <= 0 || position > numberOfData)
    {
      $(actions[BITType] + '#query-err').html('position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    stateList = [];
    internalAdjList[position + numberOfData]["state"] = VERTEX_HIGHLIGHTED;
    if (!sumPoint(position)) return false;
    internalAdjList[position + numberOfData]["state"] = VERTEX_BLUE_FILL;

    graphWidget.startAnimation(stateList);
    populatePseudocode(psuedocode);
    return true;
  }

  var prefixSumV2 = function(position,incIndex,lineNumber)
  {
    var sum = 0;
    var startPosition = position;
    var edgeIndex = -1;

    while (position > 0)
    {
      internalAdjList[position + incIndex]["state"] = VERTEX_HIGHLIGHTED;
      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'RSQ(1,' + startPosition + ') = ' + sum + ' + ' + internalAdjList[position + incIndex]["text"] + ' = ';
      currentState["status"] += sum + internalAdjList[position + incIndex]["text"];
      currentState["lineNo"] = [lineNumber];
      stateList.push(currentState);
      internalAdjList[position + incIndex]["state"] = VERTEX_DEFAULT;
      sum += internalAdjList[position + incIndex]["text"];
      if (edgeIndex != -1)
      {
        internalEdgeList[edgeIndex]["state"] = EDGE_DEFAULT;
        internalEdgeList[edgeIndex]["animateHighlighted"] = false;
      }
      if (position - LSOne(position) > 0)
      {
        edgeIndex = internalAdjList[position + incIndex][position - LSOne(position) + incIndex];
        internalEdgeList[edgeIndex]["state"] = EDGE_RED;
        internalEdgeList[edgeIndex]["animateHighlighted"] = true;
      }
      position -= LSOne(position);
    }
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'RSQ(1,' + startPosition + ') = ' + sum;
    currentState["lineNo"] = [lineNumber];
    stateList.push(currentState);

    return sum;
  }


  var sumPointV2 = function(position)
  {
    internalEdgeList = {};
    amountEdge = 0;
    for (var i = 1; i <= numberOfData; ++i)
    {
      if (i - LSOne(i) == 0)
        createQueryTree(i,50,25,0);
    }
    for (var i = 1; i <= numberOfData; ++i)
    {
      if (i - LSOne(i) == 0)
        createQueryTree(i,250,25,numberOfData);
    }
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Creating the interrogation tree';
    currentState["lineNo"] = [1,2,3,4];
    stateList.push(currentState);


    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Computing RSQ([1,' + position + ']) on BIT1';
    currentState["lineNo"] = [2];
    stateList.push(currentState);
    var sumBIT1 = prefixSumV2(position,0,2);



    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Computing RSQ([1,' + position + ']) on BIT2';
    currentState["lineNo"] = [3];
    stateList.push(currentState);
    var sumBIT2 = prefixSumV2(position,numberOfData,3);


    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'RSQ([1,' + position + ']) = RSQ(BIT1,[1,' + position + ']) * ' + position + ' - RSQ(BIT2,[1,' + position + '])';
    currentState["status"] += '<br>' + sumBIT1 + ' * ' + position + ' - ' + sumBIT2 + ' = ' + (sumBIT1 * position - sumBIT2) + '</br>';
    currentState["lineNo"] = [4]
    stateList.push(currentState);

    return sumBIT1 * position - sumBIT2;
  }

  var sumRangeV2 = function(positionLeft,positionRight)
  {
    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Computing RSQ([1,' + positionRight + '])';
    currentState["lineNo"] = [5];
    stateList.push(currentState);
    var sumRight = sumPointV2(positionRight);

    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'Computing RSQ([1,' + (positionLeft - 1) + '])';
    currentState["lineNo"] = [5];
    stateList.push(currentState);
    var sumLeft = sumPointV2(positionLeft - 1);


    currentState = createState(internalAdjList, internalEdgeList);
    currentState["status"] = 'RSQ([' + positionLeft + ',' + positionRight + '])';
    currentState["status"] += ' = RSQ([1,' + positionRight + ']) - RSQ([1,' + (positionLeft-1) + '])';
    currentState["status"] += ' = ' + sumRight + ' - ' + sumLeft + ' = ' + (sumRight - sumLeft);
    currentState["lineNo"] = [5];
    stateList.push(currentState);

    return true;
  }

  this.sumRangeV2 = function(positionLeft,positionRight)
  {
    if (positionLeft > positionRight)
    {
      $(actions[BITType] + '#query-err').html('left position must be smaller or equal to right position');
      return false;
    }
    if (positionLeft <= 0)
    {
      $(actions[BITType] + '#query-err').html('left position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    if (positionRight > numberOfData)
    {
      $(actions[BITType] + '#query-err').html('left position must be between 1 and ' + numberOfData + ' inclusive.');
      return false;
    }
    psuedocode = 5;
    stateList = [];

    for (var i = positionLeft; i <= positionRight; ++i)
      internalAdjList[i + 2 * numberOfData]["state"] = VERTEX_HIGHLIGHTED;
    sumRangeV2(positionLeft,positionRight)
    for (var i = positionLeft; i <= positionRight; ++i)
      internalAdjList[i + 2 * numberOfData]["state"] = VERTEX_BLUE_FILL;
    graphWidget.startAnimation(stateList);
    populatePseudocode(psuedocode);
    return true;
  }




  this.create = function(data)
  {
    if (BITType == POINT_UPDATE_RANGE_QUERY)
    {
      if (data.length < 2 || data.length > 16)
      {
        $(actions[BITType] + '#create-err').html('size of data must be between 2 and 16 inclusive');
        return false;
      }
      psuedocode = 6;
      stateList = [];
      this.resize(data.length);
      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'resize N = ' + data.length;
      currentState["lineNo"] = [1];
      stateList.push(currentState);

      for (var i = 0; i < data.length; ++i)
      {
        currentState = createState(internalAdjList, internalEdgeList);
        currentState["status"] = 'update([' + (i + 1) + ',' + (i + 1) + ']' + ',' + data[i] + ')';
        currentState["lineNo"] = [2,3];
        stateList.push(currentState);
        internalAdjList[(i + 1) + numberOfData]["text"] += data[i];
        updatePoint(i+1,data[i]);
      }

      graphWidget.startAnimation(stateList);
      populatePseudocode(psuedocode);
      return true;



    } else if (BITType == RANGE_UPDATE_POINT_QUERY)
    {
      var maxData = 0;
      for (var i = 0; i < data.length; ++i)
        maxData = Math.max(maxData,data[i]);

      if (maxData < 2 || maxData > 15)
      {
        $(actions[BITType] + '#create-err').html('size of data must be between 2 and 15 inclusive');
        return false;
      }
      psuedocode = 6;
      stateList = [];
      ++maxData;
      this.resize(maxData);
      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'resize N = ' + maxData;
      currentState["lineNo"] = [1];
      stateList.push(currentState);

      for (var i = 0; i < data.length; i += 2)
      {
        if (data[i] > data[i+1])
        {
          $(actions[BITType] + '#create-err').html('left interval must be smaller than or equal to right interval');
          return false;
        }
        for (var j = data[i]; j <= data[i+1]; ++j)
        {
          internalAdjList[j + numberOfData]["text"] += 1;
          internalAdjList[j + numberOfData]["state"] = VERTEX_HIGHLIGHTED;
        }
        currentState = createState(internalAdjList, internalEdgeList);
        currentState["status"] = 'update([' + (data[i]) + ',' + (data[i+1]) + ']' + ',' + 1 + ')';
        currentState["lineNo"] = [2,3];
        stateList.push(currentState);

        for (var j = data[i]; j <= data[i+1]; ++j)
          internalAdjList[j + numberOfData]["state"] = VERTEX_BLUE_FILL;

        updateRange(data[i],data[i+1],1);
      }

      graphWidget.startAnimation(stateList);
      populatePseudocode(psuedocode);
      return true;



    } else if (BITType == RANGE_UPDATE_RANGE_QUERY)
    {
      var maxData = 0;
      for (var i = 0; i < data.length; ++i)
        maxData = Math.max(maxData,data[i]);

      if (maxData < 2 || maxData > 15)
      {
        $(actions[BITType] + '#create-err').html('size of data must be between 2 and 15 inclusive');
        return false;
      }
      psuedocode = 6;
      stateList = [];
      ++maxData;
      this.resize(maxData);
      currentState = createState(internalAdjList, internalEdgeList);
      currentState["status"] = 'resize N = ' + maxData;
      currentState["lineNo"] = [1];
      stateList.push(currentState);

      for (var i = 0; i < data.length; i += 2)
      {
        if (data[i] > data[i+1])
        {
          $(actions[BITType] + '#create-err').html('left interval must be smaller than or equal to right interval');
          return false;
        }
        for (var j = data[i]; j <= data[i+1]; ++j)
        {
          internalAdjList[j + 2 * numberOfData]["text"] += 1;
          internalAdjList[j + 2 * numberOfData]["state"] = VERTEX_HIGHLIGHTED;
        }
        currentState = createState(internalAdjList, internalEdgeList);
        currentState["status"] = 'update([' + (data[i]) + ',' + (data[i+1]) + ']' + ',' + 1 + ')';
        currentState["lineNo"] = [2,3];
        stateList.push(currentState);

        for (var j = data[i]; j <= data[i+1]; ++j)
          internalAdjList[j + 2 * numberOfData]["state"] = VERTEX_BLUE_FILL;

        updateRangeV2(data[i],data[i+1],1,3);
      }

      graphWidget.startAnimation(stateList);
      populatePseudocode(psuedocode);
      return true;
    }
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
      state["vl"][key]["extratext"] = internalAdjListObject[key]["extratext"];
      state["vl"][key]["state"] = internalAdjListObject[key]["state"];
    }

    for(key in internalEdgeListObject){
      state["el"][key] = {};

      state["el"][key]["vertexA"] = internalEdgeListObject[key]["vertexA"];
      state["el"][key]["vertexB"] = internalEdgeListObject[key]["vertexB"];
      state["el"][key]["type"] = EDGE_TYPE_UDE; // HOW TO MAKE THIS DIRECTED?
      state["el"][key]["weight"] = 0;
      state["el"][key]["state"] = internalEdgeListObject[key]["state"];
      state["el"][key]["displayWeight"] = false;
      state["el"][key]["animateHighlighted"] = false;
      state["el"][key]["animateHighlighted"] = internalEdgeListObject[key]["animateHighlighted"]
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
      case 0: // UPDATE POINT_UPDATE_RANGE_QUERY
        $('#code1').html('Create the updating tree');
        $('#code2').html('while position <= N');
        $('#code3').html('&nbsp;&nbsp;BIT[position] += value');
        $('#code4').html('&nbsp;&nbsp;position += LSOne(position)');
        $('#code5').html('');
        $('#code6').html('');
        $('#code7').html('');
        break;
      case 1: // QUERY POINT_UPDATE_RANGE_QUERY
        $('#code1').html('Create the interrogation tree');
        $('#code2').html('function RSQ(1,position)');
        $('#code3').html('&nbsp;&nbsp;RSQ = 0');
        $('#code4').html('&nbsp;&nbsp;while position > 0');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;RSQ += BIT[position]');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;position -= LSOne(position)');
        $('#code7').html('RSQ(a,b) = RSQ(1,b) - RSQ(1,a - 1)');
        break;
      case 2: //UPDATE RANGE_UPDATE_POINT_QUERY
        $('#code1').html('function update(position,value)');
        $('#code2').html('&nbsp;&nbsp;Create the updating tree');
        $('#code3').html('&nbsp;&nbsp;while position <= N');
        $('#code4').html('&nbsp;&nbsp;&nbsp;&nbsp;BIT[position] += value');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;position += LSOne(position)');
        $('#code6').html('update(L,val)');
        $('#code7').html('update(R+1,-val)');
        break;
      case 3: //QUERY RANGE_UPDATE_POINT_QUERY
        $('#code1').html('function RSQ(1,position)');
        $('#code2').html('&nbsp;&nbsp;Create the interrogation tree');
        $('#code3').html('&nbsp;&nbsp;RSQ = 0');
        $('#code4').html('&nbsp;&nbsp;while position > 0');
        $('#code5').html('&nbsp;&nbsp;&nbsp;&nbsp;RSQ += BIT[position]');
        $('#code6').html('&nbsp;&nbsp;&nbsp;&nbsp;position -= LSOne(position)');
        $('#code7').html('data[position] = RSQ(1,position)');
        break;
      case 4: //UPDATE RANGE_UPDATE_RANGE_QUERY
        $('#code1').html('function update([a,b],value)');
        $('#code2').html('&nbsp;&nbsp;update (BIT1,a,    value           )');
        $('#code3').html('&nbsp;&nbsp;update (BIT1,b+1, -value           )');
        $('#code4').html('&nbsp;&nbsp;update (BIT2,a,    value * (a - 1) )');
        $('#code5').html('&nbsp;&nbsp;update (BIT2,b+1, -value * b       )');
        $('#code6').html('');
        $('#code7').html('');
        break;
      case 5: //QUERY RANGE_UPDATE_RANGE_QUERY
        $('#code1').html('function RSQ([1,x])');
        $('#code2').html('&nbsp;&nbsp;a = RSQ([1,x]) on BIT1');
        $('#code3').html('&nbsp;&nbsp;b = RSQ([1,x]) on BIT2');
        $('#code4').html('&nbsp;&nbsp;return a * x - b');
        $('#code5').html('RSQ([x,y]) = RSQ([1,y]) - RSQ([1,x-1])');
        $('#code6').html('');
        $('#code7').html('');
        break;
      case 6: // Create
        $('#code1').html('resize N = data.length');
        $('#code2').html('for i : 1 to N');
        $('#code3').html('&nbsp;&nbsp;update(i,data[i])');
        $('#code4').html('');
        $('#code5').html('');
        $('#code6').html('');
        $('#code7').html('');
        break;
    }
  }
}



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
