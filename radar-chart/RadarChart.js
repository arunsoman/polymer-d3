let chart={}||chart

chart.radarChart = function(parentG, chartData, options){
  let cfg = {
	 radius: 5,
	 width: 600,
	 height: 600,
	 factor: 1,
	 factorLegend: .85,
	 levels: 3,
	 maxValue: 0,
	 radians: 2 * Math.PI,
	 opacityArea: 0.5,
	 ToRight: 5,
	 TranslateX: 80,
	 TranslateY: 30,
	 ExtraWidthX: 100,
	 ExtraHeightY: 100,
	 color: d3.scale.category10()
	}

  let optionsKeys = Object.keys(options);
  optionsKeys.forEach(key=>{
    return cfg[key] = options[key]
  })
  cfg.TranslateX= cfg.ExtraWidthX
  cfg.TranslateY = cfg.ExtraHeightY
  cfg.maxValue = Math.max(cfg.maxValue, d3.max(chartData, function(d){return d3.max(d.map(function(o){return o.value;}))}));
  let allAxis =[]
  chartData.map(function(d){return d.map(item=>{return allAxis.push(item.axis)})})
  allAxis = allAxis.filter((item, pos)=>allAxis.indexOf(item) == pos)
  let total = allAxis.length
	let radius = cfg.factor*Math.min(cfg.width/2, cfg.height/2);
	let Format = d3.format('%');
	d3.select(parentG).select("svg").remove();

  let svg = d3.select(parentG)
			.append("svg")
			.attr("width", cfg.width+cfg.ExtraWidthX)
			.attr("height", cfg.height+cfg.ExtraHeightY+50)
			.append("g")
			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

	let tooltip;
  let toolTipDiv;

  //Circular segments
	for(var j=0; j<cfg.levels-1; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  svg.selectAll(".levels")
	   .data(allAxis)
	   .enter()
	   .append("svg:line")
	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
	   .attr("class", "line")
	   .style("stroke", "grey")
	   .style("stroke-opacity", "0.75")
	   .style("stroke-width", "0.3px")
	   .attr("transform", "translate(" + (cfg.width/2-levelFactor) + ", " + (cfg.height/2-levelFactor) + ")");
	}
  //Text indicating at what % each level is
	for(var j=0; j<cfg.levels; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  svg.selectAll(".levels")
	   .data([1]) //dummy data
	   .enter()
	   .append("svg:text")
	   .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
	   .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
	   .attr("class", "legend")
	   .style("font-family", "sans-serif")
	   .style("font-size", "10px")
	   .attr("transform", "translate(" + (cfg.width/2-levelFactor + cfg.ToRight) + ", " + (cfg.height/2-levelFactor) + ")")
	   .attr("fill", "#737373")
	   .text(Format((j+1)*cfg.maxValue/cfg.levels));
	}
  let series = 0;

	let axis = svg.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
			.attr("class", "axis");

  axis.append("line")
  		.attr("x1", cfg.width/2)
  		.attr("y1", cfg.height/2)
  		.attr("x2", function(d, i){return cfg.width/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
  		.attr("y2", function(d, i){return cfg.height/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
  		.attr("class", "line")
  		.style("stroke", "grey")
  		.style("stroke-width", "1px");

  axis.append("text")
  		.attr("class", "legend")
  		.text(function(d){return d})
  		.style("font-family", "sans-serif")
  		.style("font-size", "11px")
  		.attr("text-anchor", "middle")
  		.attr("dy", "1.5em")
  		.attr("transform", function(d, i){return "translate(0, -10)"})
  		.attr("x", function(d, i){return cfg.width/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
  		.attr("y", function(d, i){return cfg.height/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});

  chartData.forEach(function(y, x){
    let dataValues = [];
	  svg.selectAll(".nodes")
    		.data(y, function(j, i){
    		  dataValues.push([
    			cfg.width/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
    			cfg.height/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
    		  ]);
    		});
    //create polygon for Radar chart
    let polygon = svg.selectAll(".area")
			 .data([dataValues])
			 .enter()
			 .append("polygon")
       .attr("zKey",options.KeyMap[series])

			 polygon.attr("class",function(d,series){
         let classes = "radar-chart-serie"+series
         options.filterKeys.length && options.filterKeys.indexOf(options.KeyMap[series])!=-1&&(classes+=" selected")
         return classes
       })
      //  .attr("class", "radar-chart-serie"+series)
			 .style("stroke-width", "2px")
			 .style("stroke", cfg.color(series))
			 .attr("points",function(d) {
				 var str="";
				 for(var pti=0;pti<d.length;pti++){
					 str=str+d[pti][0]+","+d[pti][1]+" ";
				 }
				 return str;
			  })
			 .style("fill", function(j, i){return cfg.color(series)})
			 .style("fill-opacity", cfg.opacityArea)
			 .on('mouseover', function (d){
								z = "polygon."+d3.select(this).attr("class");
								svg.selectAll("polygon")
								 .transition(200)
								 .style("fill-opacity", 0.1);
								svg.selectAll(z)
								 .transition(200)
								 .style("fill-opacity", .7);
							  })

			 .on('mouseout', function(){
								svg.selectAll("polygon")
								 .transition(200)
								 .style("fill-opacity", cfg.opacityArea);
		 });
     //create circle for Radar chart
     svg.selectAll(".nodes")
     		.data(y).enter()
     		.append("svg:circle")
     		.attr("class", "radar-chart-serie"+series)
     		.attr('r', cfg.radius)
     		.attr("alt", function(j){return Math.max(j.value, 0)})
     		.attr("cx", function(j, i){
     		  dataValues.push([
     			cfg.width/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
     			cfg.height/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
       		]);
       		return cfg.width/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
     		})
     		.attr("cy", function(j, i){
     		  return cfg.height/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
     		})
     		.attr("data-id", function(j){return j.axis})
     		.style("fill", cfg.color(series)).style("fill-opacity", .9)
     		.on('mouseover', function (d){
     					newX =  parseFloat(d3.select(this).attr('cx')) - 10;
     					newY =  parseFloat(d3.select(this).attr('cy')) - 5;
              toolTipDiv.style("left", d3.event.offsetX+"px");
              toolTipDiv.style("top", d3.event.offsetY+"px");
              toolTipDiv.style("display", "inline-block");
              toolTipDiv.html(Format(d.value)+"<br/>"+Math.max(d.value, 0)).transition(200).style('opacity', 1)
     				// 	tooltip
     				// 		.attr('x', newX)
     				// 		.attr('y', newY)
     				// 		.text(Format(d.value))
     				// 		.transition(200)
     				// 		.style('opacity', 1);

     					z = "polygon."+d3.select(this).attr("class");
     					svg.selectAll("polygon")
     						.transition(200)
     						.style("fill-opacity", 0.1);
     					svg.selectAll(z)
     						.transition(200)
     						.style("fill-opacity", .7);
     				  })
     		.on('mouseout', function(){
     				// 	tooltip
     				// 		.transition(200)
     				// 		.style('opacity', 0);
     					svg.selectAll("polygon")
     						.transition(200)
     						.style("fill-opacity", cfg.opacityArea);
                toolTipDiv.transition(200).style({"display":"none",'opacity': 0});
     		})
     	// 	.append("svg:title")
     	// 	.text(function(j){return Math.max(j.value, 0)});
	  series++;

    options.compChartChk && polygon.on("click",function(){
      let elem = this, item = this.getAttribute("zKey"),zAxis=true
      options.compSourcePopulate({item,elem,zAxis})
    })
    options.compChartChk && polygon.on("dblclick",function(e){
      let elem = this, item = this.getAttribute("zKey"), zAxis=true, dblClick=true
      compSourcePopulate({item,elem,zAxis,dblClick})
    })

  })
  //Tooltip
	tooltip = svg.append('text')
      			   .style('opacity', 0)
      			   .style('font-family', 'sans-serif')
      			   .style('font-size', '13px');
toolTipDiv = d3.select(options.chartScope.$.chartContainer).append("div").attr("class", "toolTip");
}
