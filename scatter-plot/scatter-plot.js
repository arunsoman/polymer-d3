import {baseChart} from '../display-component/base-chart.js';

class scatterPlot extends baseChart{
  static get template() {
    return `
    <style>
      #chartContainer{
        margin:0 auto;
        font: 10px sans-serif;
      }
      .axis path,
      .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
      }
      .dot {
        stroke: #000;
      }
      .tooltip {
        position: absolute;
        width: 200px;
        height: 28px;
        pointer-events: none;
      }
      paper-icon-button.resetBtn {
        font-size: x-small;
        float: right;
        padding: 4px;
        margin-top: 5px;
        width: 27px;
        color: #9f9e9e;
        height: 27px;
      }
      #chartContainer.selected circle {
        fill-opacity: .25;
      }
      #chartContainer.selected circle.selected {
        fill-opacity: 1;
        cursor:pointer;
      }
      .toolTip {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          position: absolute;
          display: none;
          width: auto;
          height: auto;
          background: none repeat scroll 0 0 white;
          border: 0 none;
          border-radius: 8px 8px 8px 8px;
          box-shadow: -3px 3px 15px #888888;
          color: black;
          font: 12px sans-serif;
          padding: 5px;
          text-align: center;
      }
    </style>
    <template is="dom-if" if="[[compfilterChk]]" restamp="true">
      <paper-icon-button class="resetBtn" on-click="chartReset" icon="communication:clear-all" title="Reset">reset</paper-icon-button>
    </template>
    <template is="dom-if" if="[[lastFilterActivated]]" restamp="true">
      <paper-icon-button raised="" class="resetBtn" on-click="exportFilterData" icon="icons:file-download" title="Export filter data">Export filter data</paper-icon-button>
    </template>
      <chart-input-group uuid="[[uuid]]" chart-visible="[[chartVisible]]">
        <chart-input slot="chart-input" axis="x" label="Key" accept="number"></chart-input>
        <chart-input slot="chart-input" axis="y" label="Value" accept="number"></chart-input>
        <chart-input slot="chart-input" axis="z" label="z-axis"></chart-input>
      </chart-input-group>
      <!-- <chart-settings uuid="[[uuid]]"></chart-settings> -->
    <div id="chartContainer"></div>
`;
  }

  static get is(){
    return "scatter-plot"
  }
  redraw() {
    this.draw(this._paint(this._compute()));
  }
  _compute() {
    let axisIndex = 3
    //"chartProp" define for chart axis and properties
    let arg = {axisIndex}
    let chartProp = this.getChartProperties(arg)
    if(!chartProp)return false

    //get chart data once pass "x and y" into the "getChartData" method
    let source = this.getChartData(chartProp.itemX, chartProp.itemY,chartProp.itemZ)
    let chartData = source.data,
        xKeyStr = source.xKeyStr,
        yKeyStr = source.yKeyStr

    // define x and y
    let x = d3.scale.linear().range([0, chartProp.width]),
        y = d3.scale.linear().range([chartProp.height, 0]);

    // define x and y values
    let xValue = (d)=>d.xKey,
        yValue = (d)=>d.yKey

    // define x and y axis
    let xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");
    let yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");

    // define x and y domain
    x.domain(d3.extent(chartData, d=>d.xKey)).nice();
    y.domain(d3.extent(chartData, d=>d.yKey)).nice();

    return {
      x,
      y,
      xValue,
      yValue,
      xAxis,
      yAxis,
      xKeyStr,
      yKeyStr,
      chartData,
      chartProp
    }
  }
  _paint(obj) {
    this.clear()
    if (!obj) return false
    //Draw Scatter plot chart and append the svg canvas to the page
    let parentG = d3.select(this.$.chartContainer).append("svg")
        .attr("width", obj.chartProp.width + obj.chartProp.margin.xMargin)
        .attr("height", obj.chartProp.height + obj.chartProp.margin.yMargin)
      .append("g")
        .attr("transform","translate(" + obj.chartProp.margin.left + "," + obj.chartProp.margin.top + ")");
    // add the tooltip area to the webpage
    let tooltip = d3.select(this.$.chartContainer).append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

    parentG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + obj.chartProp.height + ")")
            .call(obj.xAxis)
            .append("text")
              .attr("class", "label")
              .attr("x", obj.chartProp.width)
              .attr("y", -6)
              .style("text-anchor", "end")
              .text(obj.xKeyStr);

    parentG.append("g")
            .attr("class", "y axis")
            .call(obj.yAxis)
            .append("text")
              .attr("class", "label")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(obj.yKeyStr)

  let circle = parentG.selectAll(".dot")
          .data(obj.chartData)
          .enter().append("circle")

              circle.attr("class",function(d){
                let classes = "dot"
                this.filterKeys.length && this.filterKeys.indexOf(d.xKey)!=-1&&(classes+=" selected")
                return classes
              }.bind(this))
              // .attr("r",function(d){debugger})
              .attr("r",5)
              .attr("cx", d=>obj.x(d.xKey))
              .attr("cy", d=>obj.y(d.yKey))
              .style("fill", d=>obj.chartProp.color(d.zKey))
              .attr("data-value", function(d,i) {return "(" + obj.xValue(d)+ ", " + obj.yValue(d) + ")"})
              .attr("data-key", function(d,i) {return d.zKey})

              // .on("mouseover", function(d) {
              //       tooltip.transition()
              //            .duration(200)
              //            .style("opacity", .9);
              //       tooltip.html(d.zKey + "<br/> (" + obj.xValue(d)+ ", " + obj.yValue(d) + ")")
              //            .style("left", (d3.event.pageX + 5) + "px")
              //            .style("top", (d3.event.pageY - 28) + "px");
              //   })
              //   .on("mouseout", d=>tooltip.transition().duration(500).style("opacity", 0));


  // append div for toolTip
    let tlpObj={elem:circle,tplY:60}
    this.chartToolTip(tlpObj)
  // define Legends
  this.addLegend({
      obj,
      container:parentG,
      selector:'.dot',
      node:obj.chartProp.color.domain()
    });


    // this.isCompsiteChart&&circle.on("click",this.compSourcePopulate.bind(this,obj.chartProp.axis))
    let compSourcePopulate = this.compSourcePopulate.bind(this,obj.chartProp.axis)
    this.isCompsiteChart&&circle.on("click",function(e){
      let elem = this, item = e.xKey,zAxis=true, xVlaue=true
      compSourcePopulate({item,elem,zAxis,xVlaue})
    })
    this.isCompsiteChart&&circle.on("dblclick",function(e){
      let elem = this, item = e.xKey, zAxis=true, dblClick=true, xVlaue=true
      compSourcePopulate({item,elem,zAxis,dblClick,xVlaue})
    })

  d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+ obj.chartProp.margin.xMargin+"px"})
  }
  // populate chart data
  getChartData(itemX, itemY,itemZ){
    let xKeyStr = this.externals[itemX]["key"],
        yKeyStr = this.externals[itemY]["key"]
    let sourceData = this.source.map(item=>{
      return{
        xKey:+item[itemX],
        yKey:+item[itemY],
        zKey:item[itemZ]
      }
    })
    let data = sourceData
    return{data, xKeyStr, yKeyStr}
  }
}
customElements.define(scatterPlot.is, scatterPlot)
