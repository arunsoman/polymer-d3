import '../display-component/base-chart.js';
/**
* @polymer
* @extends HTMLElement
*/
class differenceChart extends baseChart{
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

      .x.axis path {
        display: none;
      }

      .area.above {
        fill: rgb(252,141,89);
      }

      .area.below {
        fill: rgb(145,207,96);
      }

      .line {
        fill: none;
        stroke: #000;
        stroke-width: 1px;
      }
      paper-button.resetBtn {
        font-size: x-small;
        float: right;
        padding: 4px;
        margin-top: 5px;
      }

    </style>
      <chart-input-group uuid="[[uuid]]" chart-visible="[[chartVisible]]">
          <chart-input slot="chart-input" axis="x" label="Key"></chart-input>
          <chart-input slot="chart-input" axis="y" label="Y-Value" accept="number"></chart-input>
          <chart-input slot="chart-input" axis="z" label="Z-Value" accept="number"></chart-input>
      </chart-input-group>
      <!-- <chart-settings uuid="[[uuid]]"></chart-settings> -->
    <div id="chartContainer"></div>
`;
  }

  static get is(){
    return "difference-chart"
  }
  static get properties(){
    return{}
  }
  redraw() {
    this.draw(this._paint(this._compute()));
  }
  _compute() {
    //assign axisIndex value
    let axisIndex = 3
    //"chartProp" define for chart axis and properties
    let arg = {axisIndex}
    let chartProp = this.getChartProperties(arg)
    if(!chartProp)return false

    //get chart data once pass axis into the "getChartData" method
    let source = this.getChartData(chartProp.itemX, chartProp.itemY,chartProp.itemZ, chartProp.parseDate)
    let chartData = source.data
    let dateChk = source.dateChk
    //define x for date(time) or String
    let dateX = d3.time.scale().range([0, chartProp.width]);
    let stringX = d3.scale.ordinal().range([0, chartProp.width]);
    //define x and y
    let x = dateChk?dateX:stringX,
       y = d3.scale.linear().range([chartProp.height, 0])
   //define x and y axis
   let xAxis = d3.svg.axis().scale(x).orient("bottom"),
       yAxis = d3.svg.axis().scale(y).orient("left")

   // define line
   let line = d3.svg.area()
             .interpolate("basis")
             .x(d=>x(d.xKey))
             .y(d=>y(d.yKey))
   // define area
   let area = d3.svg.area()
         .interpolate("basis")
         .x(d=>x(d.xKey))
         .y1(d=>y(d.yKey));
   // define x and y domain
   if(dateChk){
     x.domain(d3.extent(chartData, d=>d.xKey));
   } else{
     x.domain(chartData.map(d=> d.xKey))
     .rangeRoundBands([0 , chartProp.width]);
   }
   y.domain([
     d3.min(chartData, d=>Math.min(d.yKey, d.zKey)),
     d3.max(chartData, d=>Math.max(d.yKey, d.zKey))
   ]);
    return {
      area,
      line,
      y,
      xAxis,
      yAxis,
      chartData,
      chartProp
    }
  }
  _paint(obj) {
    this.clear()
    if (!obj) return false
    //Draw Difference chart and append the svg canvas to the page
    let parentG = d3.select(this.$.chartContainer).append("svg")
                 .attr("width", obj.chartProp.width + obj.chartProp.margin.xMargin)
                 .attr("height", obj.chartProp.height + obj.chartProp.margin.yMargin)
               .append("g")
                 .attr("transform", "translate(" + obj.chartProp.margin.left + "," + obj.chartProp.margin.top + ")");

   parentG.datum(obj.chartData);

   parentG.append("clipPath")
       .attr("id", "clip-below")
     .append("path")
       .attr("d", obj.area.y0(obj.chartProp.height))
   parentG.append("clipPath")
       .attr("id", "clip-above")
     .append("path")
       .attr("d", obj.area.y0(0))

   parentG.append("path").attr("class", "area above")
     .attr("clip-path", "url(#clip-above)")
     .attr("d", obj.area.y0(d=>obj.y(d.zKey)));

   parentG.append("path")
     .attr("class", "area below")
     .attr("clip-path", "url(#clip-below)")
     .attr("d", obj.area);

   parentG.append("path")
     .attr("class", "line")
     .attr("d", obj.line);

   parentG.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + obj.chartProp.height + ")")
     .call(obj.xAxis);

   parentG.append("g")
       .attr("class", "y axis")
       .call(obj.yAxis)
     .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Values");
   d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+ obj.chartProp.margin.xMargin+"px"})
  }
  // populate chart data
  getChartData(itemX, itemY,itemZ,parseDate){
    //let parseDate = d3.time.format("%Y-%m-%d").parse;
    let dateChk
    let sourceData = this.source.map(items=>{
     let stringX =String(items[itemX]),
     dateV = stringX.indexOf("GMT")!=-1 ?items[itemX]:parseDate(stringX.split(" ")[0])
     dateChk = dateV
      let itemSet = dateV?dateV:items[itemX]
       return{
         xKey:itemSet,
         yKey:+items[itemY],
         zKey:+items[itemZ]
       }
    })
    let data = sourceData
    return {data,dateChk}
  }
}
customElements.define(differenceChart.is, differenceChart)
