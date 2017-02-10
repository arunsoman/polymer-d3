PolymerD3.RadarChart = function(data, options, me) {
  let cfg = {
    w: me.chartWidth,        //Width of the circle
    h: me.chartHeight,       //Height of the circle
    margin: me.getMargins(), //The margins of the SVG
    levels: 3,               //How many levels or inner circles should there be drawn
    maxValue: 0,             //What is the value that the biggest circle will represent
    labelFactor: 1.25,       //How much farther than the radius of the outer circle should the labels be placed
    wrapWidth: 60,           //The number of pixels after which a label needs to be given a new line
    opacityArea: 0.35,       //The opacity of the area of the blob
    dotRadius: 4,            //The size of the colored circles of each blog
    opacityCircles: 0.1,     //The opacity of the circles of each blob
    strokeWidth: 2,          //The width of the stroke around each blob
    roundStrokes: false,     //If true the area and stroke will follow a round path (cardinal-closed)
    color: d3.scale.category10()
  };

  //Put all of the options into a variable called cfg
  if ('undefined' !== typeof options) {
    for (var i in options) {
      if ('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
    }//for i
  }//if
  var constPIby2 =  Math.PI/2;
  //If the supplied maxValue is smaller than the actual one, replace by the max in the data
  var maxValue = d3.max(data.map(axis => d3.max(axis, row => row.value)));

  var allAxis = data[0].map(row => row.axis), //Names of each axis
    total = allAxis.length,         //The number of different axes
    radius = Math.min(cfg.w/2, cfg.h/2),  //Radius of the outermost circle
    Format = d3.format('.2s'),        //Percentage formatting
    angleSlice = Math.PI * 2 / total;   //The width in radians of each "slice"

  //Scale for the radius
  var rScale = d3.scale.linear()
    .range([0, radius])
    .domain([0, maxValue]);

  var g = me.parentG.append("g")
      .attr("transform",
        "translate(" + (cfg.w/2) + "," +
        (cfg.h/2)+')');

  /////////////////////////////////////////////////////////
  ////////// Glow filter for some extra pizzazz ///////////
  /////////////////////////////////////////////////////////

  //Filter for the outside glow
  var filter = g.append('defs').append('filter').attr('id','glow')
    .append('feGaussianBlur')
    .attr('stdDeviation','2.5')
    .attr('result','coloredBlur');
  filter.append('feMerge')
    .append('feMergeNode').attr('in','coloredBlur')
    .append('feMergeNode').attr('in','SourceGraphic');

  /////////////////////////////////////////////////////////
  /////////////// Draw the Circular grid //////////////////
  /////////////////////////////////////////////////////////

  //Wrapper for the grid & axes
  var axisGrid = g.append("g").attr("class", "axisWrapper");

  var levelsArray = d3.range(1,(cfg.levels+1)).reverse();
  //Draw the background circles
  axisGrid.selectAll(".levels")
     .data(levelsArray)
     .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function(d){return radius/cfg.levels*d;})
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", cfg.opacityCircles)
    .style("filter" , "url(#glow)");

  //Text indicating at what % each level is
  axisGrid.selectAll(".axisLabel")
     .data(levelsArray)
     .enter().append("text")
     .attr("class", "axisLabel")
     .attr("x", 4)
     .attr("y", function(d){return -d*radius/cfg.levels;})
     .attr("dy", "0.4em")
     .style("font-size", "10px")
     .attr("fill", "#737373")
     .text(function(d) { return Format(maxValue * d/cfg.levels); });

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////

  //Create the straight lines radiating outward from the center
  var axis = axisGrid.selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis");
  //Append the lines
  var const2 = rScale(maxValue*1.1);
  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function(d, i){
      return const2 * Math.cos(angleSlice*i - constPIby2); })
    .attr("y2", function(d, i){
      return const2 * Math.sin(angleSlice*i - constPIby2); })
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");

  //Append the labels at each axis
  var const1=rScale(maxValue * cfg.labelFactor);
  axis.append("text")
    .attr("class", "legend")
    .style("font-size", "11px")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function(d, i){
      return const1 *
        Math.cos(angleSlice*i - constPIby2); })
    .attr("y", function(d, i){
      return const1 *
        Math.sin(angleSlice*i - constPIby2); })
    .text(function(d){return d;})
    .call(wrap, cfg.wrapWidth);

  /////////////////////////////////////////////////////////
  ///////////// Draw the radar chart blobs ////////////////
  /////////////////////////////////////////////////////////

  //The radial line function
  var radarLine = d3.svg.line.radial()
    .interpolate("linear-closed")
    .radius(function(d) { return rScale(d.value); })
    .angle(function(d,i) {  return i*angleSlice; });

  if(cfg.roundStrokes) {
    radarLine.interpolate("cardinal-closed");
  }

  //Create a wrapper for the blobs
  var blobWrapper = g.selectAll(".radarWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarWrapper");

  //Append the backgrounds
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", function(d) { return radarLine(d); })
    .style("fill", function(d,i) { return cfg.color(i); })
    .style("fill-opacity", cfg.opacityArea)
    .on('mouseover', function (d){
      //Dim all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", 0.1);
      //Bring back the hovered over blob
      d3.select(this)
        .transition().duration(200)
        .style("fill-opacity", 0.7);
    })
    .on('mouseout', function(){
      //Bring back all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  //Create the outlines
  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", function(d) { return radarLine(d); })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", function(d,i) { return cfg.color(i); })
    .style("fill", "none")
    .style("filter" , "url(#glow)");

  //Append the circles
  blobWrapper.selectAll(".radarCircle")
    .data(function(d) { return d; })
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", function(d,i){
      return rScale(d[1]) * Math.cos(angleSlice*i - constPIby2); })
    .attr("cy", function(d,i){
      return rScale(d[1]) * Math.sin(angleSlice*i - constPIby2); })
    .style("fill", function(d,i,j) { return cfg.color(j); })
    .style("fill-opacity", 0.8);

  /////////////////////////////////////////////////////////
  //////// Append invisible circles for tooltip ///////////
  /////////////////////////////////////////////////////////

  //Wrapper for the invisible circles on top
  var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
    .data(data)
    .enter().append("g")
    .attr("class", "radarCircleWrapper");

  //Append a set of invisible circles on top for the mouseover pop-up
  var inC = blobCircleWrapper.selectAll(".radarInvisibleCircle")
    .data(function(d) { return d; })
    .enter().append("circle")
    .attr("class", "radarInvisibleCircle")
    .attr("r", cfg.dotRadius*1.5)
    .attr("cx", function(d,i){
      return rScale(d[1]) * Math.cos(angleSlice*i - constPIby2); })
    .attr("cy", function(d,i){
      return rScale(d[1]) * Math.sin(angleSlice*i - constPIby2); })
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", (d,i,j)=> {
      var cir = d3.select(inC[j][i]);
      var newX =  parseFloat(cir.attr('cx')) - 10;
      var newY =  parseFloat(cir.attr('cy')) - 10;

      tooltip
        .attr('x', newX)
        .attr('y', newY)
        .text('Segment:'+d[2]+'\nValue:'+Format(d[1]))
        .transition().duration(200)
        .style('opacity', 1);
    })
    .on("mouseout", function(){
      tooltip.transition().duration(200)
        .style("opacity", 0);
    });

  //Set up the small tooltip for when you hover over a circle
  var tooltip = g.append("text")
    .attr("class", "tooltip")
    .style("opacity", 0);

  /////////////////////////////////////////////////////////
  /////////////////// Helper Function /////////////////////
  /////////////////////////////////////////////////////////

  //Taken from http://bl.ocks.org/mbostock/7555321
  //Wraps SVG text
  function wrap(text, width) {
    text.each(function() {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.4, // ems
      y = text.attr("y"),
      x = text.attr("x"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
      line.pop();
      tspan.text(line.join(" "));
      line = [word];
      tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
    });
  }//wrap

};//RadarChart