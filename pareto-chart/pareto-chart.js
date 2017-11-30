import {baseChart} from '../display-component/base-chart.js';

class paretoChart extends baseChart{
  static get template() {
    return `
    <style>
      :host {
        display: block;
      }
      svg {
        font: 10px sans-serif;
      }
      .bar rect {
        fill: steelblue;
        shape-rendering: crispEdges;
      }
      .axis path, .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
      }
      .line {
        fill: none;
        stroke: purple;
        stroke-width: 1.5px;
      }
      .legend-box{
          fill:white
      }
      #chartContainer{
        margin:0 auto;
        font: 10px sans-serif;
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
      #chartContainer.selected g.bar {
        fill-opacity: .25;
      }
      #chartContainer.selected g.selected {
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
        <chart-input slot="chart-input" axis="x" label="Key"></chart-input>
        <chart-input slot="chart-input" axis="y" label="Value" accept="number"></chart-input>
      </chart-input-group>
      <!-- <chart-settings uuid="[[uuid]]"></chart-settings> -->
    <div id="chartContainer"></div>
`;
  }

  static get is(){
    return "pareto-chart"
  }
  static get properties(){
    return{

    }
  }
  redraw() {
    this.draw(this._paint(this._compute()));
  }
  _compute() {
    let axisIndex = 2
    //"chartProp" define for chart axis and properties
    let arg = {axisIndex}
    let chartProp = this.getChartProperties(arg)
    if(!chartProp)return false

    //get chart data once pass "x and y" into the "getChartData" method
    let source = this.getChartData(chartProp.itemX, chartProp.itemY)
    let chartData = source.data
    let xKey = "xKey"

    //Axes and scales
    let xScale = d3.scale.ordinal().rangeRoundBands([0, chartProp.width], 0.1);
    xScale.domain(chartData.map(d=>d[xKey]));

    let yhist = d3.scale.linear()
                  .domain([0, d3.max(chartData, d=>d.value)])
                  .range([chartProp.height, 0]);
    let ycum = d3.scale.linear().domain([0, 1]).range([chartProp.height, 0]);
    let xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient('bottom');

    let yAxis = d3.svg.axis()
                  .scale(yhist)
                  .orient('left');
    let yAxis2 = d3.svg.axis()
                   .scale(ycum)
                   .orient('right');
    return {
      xKey,
      xScale,
      yhist,
      ycum,
      xAxis,
      yAxis,
      yAxis2,
      chartData,
      chartProp
    }
  }
  _paint(obj) {
    this.clear()
    if (!obj) return false
    //Draw svg
    let parentG = d3.select(this.$.chartContainer).append("svg")
                    .attr("width", obj.chartProp.width + obj.chartProp.margin.xMargin)
                    .attr("height", obj.chartProp.height + obj.chartProp.margin.yMargin)
                    .append("g")
                    .attr("transform", "translate(" + obj.chartProp.margin.left + "," + obj.chartProp.margin.top + ")");
    //Draw histogram
    let bar = parentG.selectAll(".bar")
        .data(obj.chartData)
        .enter().append("g")
        .attr("class",function(d){
          let classes = "bar"
          this.filterKeys.length && this.filterKeys.indexOf(d.xKey)!=-1&&(classes+=" selected")
          return classes
        }.bind(this))
        .attr("data-value", function(d,i) {return d.value})
        .attr("data-key", function(d,i) {return d.xKey});

    bar.append("rect")
        .attr("x", d=>obj.xScale(d[obj.xKey]))
        .attr("width", obj.xScale.rangeBand())
        .attr("y", d=>obj.yhist(d.value))
        .attr("height", d=>obj.chartProp.height - obj.yhist(d.value));

    //Draw CDF line
    let guide = d3.svg.line()
                  .x(d=>obj.xScale(d[obj.xKey]))
                  .y(d=>obj.ycum(d.CumulativePercentage))
                  .interpolate('basis');
    let line = parentG.append('path')
                  .datum(obj.chartData)
                  .attr('d', guide)
                  .attr('class', 'line');
    //Draw axes
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
        .text("Value");

    parentG.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + [obj.chartProp.width, 0] + ")")
        .call(obj.yAxis2)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 4)
        .attr("dy", "-.71em")
        .style("text-anchor", "end")
        .text("Cumulative %");

    // append div for toolTip
    let tlpObj={elem:bar,tplY:70}
    this.chartToolTip(tlpObj)

    // this.isCompsiteChart&&bar.on("click",this.compSourcePopulate.bind(this,obj.chartProp.axis))
    let compSourcePopulate = this.compSourcePopulate.bind(this,obj.chartProp.axis)
    this.isCompsiteChart&&bar.on("click",function(e){
      let elem = this, item = e.xKey
      compSourcePopulate({item,elem})
    })
    this.isCompsiteChart&&bar.on("dblclick",function(e){
      let elem = this, item = e.xKey, dblClick=true
      compSourcePopulate({item,elem,dblClick})
    })

    d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+ obj.chartProp.margin.xMargin+"px"})
    this.addLegend({
        obj,
        container:parentG,
        selector:'.bar rect',
        node:obj.chartData,
        key: obj.xKey
      });
  }
  getChartData(itemX, itemY){
      // let xKey = this.externals[itemX]["key"]

      let sourcemap = this.source.reduce((old,newVal)=>{
        old[newVal[itemX]]=(old[newVal[itemX]]||0)+newVal[itemY]
        return old
      },{})
      let source  = Object.keys(sourcemap).map(item=>{return {xKey:item,value:sourcemap[item]}})
      let totalValue = 0
      //now calculate cumulative value from "item value + previous item value".
      source.forEach((item,i)=>{
        totalValue += item.value
        item.CumulativeValue = item.value + ((i > 0)? source[i-1].CumulativeValue:0);
        return item
      })
      //now calculate cumulative % from the cumulative amounts & total, round %
      let data = source.filter(item=>{
        return item.CumulativePercentage = parseFloat((item.CumulativeValue/ totalValue).toFixed(2));
      })
      return {data}
  }
}
customElements.define(paretoChart.is, paretoChart)
