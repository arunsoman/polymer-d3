import {baseChart} from '../display-component/base-chart.js';
import './bullet.js';

class bulletChart extends baseChart{
  static get template() {
    return `
  <style>

    button {
      position: absolute;
      right: 10px;
      top: 10px;
    }

    .bullet { font: 10px sans-serif; }
    .bullet .marker { stroke: #000; stroke-width: 2px; }
    .bullet .tick line { stroke: #666; stroke-width: .5px; }
    .bullet .range.s0 { fill: #eee; }
    .bullet .range.s1 { fill: #ddd; }
    .bullet .range.s2 { fill: #ccc; }
    .bullet .measure.s0 { fill: lightsteelblue; }
    .bullet .measure.s1 { fill: lightblue; }
    .bullet .measure.s2 { fill: steelblue; }
    .bullet .title { font-size: 14px; font-weight: bold; }
    .bullet .subtitle { fill: #999; }

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
    #chartContainer.selected g {
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
    <!-- <svg id="svg"></svg> -->
    <div id="chartContainer"></div>
`;
  }

  static get is(){
    return "bullet-chart"
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
    let groupedData
    let source = this.getChartData(chartProp.itemX, chartProp.itemY)
    groupedData = d3.nest().key(d => d.item).entries(source);
    chartProp.height = 50

    let chartData =[]
    groupedData.map((item,idx)=>{
      let itemValues = item.values.map(test=>test.value),
          minRange = itemValues.reduce((prev,cur)=>prev < cur ? prev : cur,+Infinity),
          markers = itemValues.reduce((prev,cur)=>prev > cur ? prev : cur,-Infinity),
          midRange = Math.round(markers/2),
          maxRange = markers+minRange;
      chartData[idx]={"title":item.key,
        "ranges":[minRange,midRange,maxRange],
        "measures":item.values.map(test=>test.value),
        "markers":[markers]
      }
    })

    let chart = d3.bullet()
        .width(chartProp.width)
        .height(chartProp.height);

    return {
      chart,
      chartData,
      chartProp
    }
  }
  _paint(obj) {
    this.clear()
    if (!obj) return false
    let parentG = d3.select(this.$.chartContainer).selectAll("div")
        .data(obj.chartData)
        .enter().append("svg")

    let bullet =  parentG.attr("width", obj.chartProp.width+ obj.chartProp.margin.xMargin)
      .attr("height", obj.chartProp.height+obj.chartProp.margin.yMargin)
      .append("g")
      .attr("transform", "translate(" + obj.chartProp.margin.left + "," + obj.chartProp.margin.top + ")")
      .call(obj.chart)
      .attr("class",function(d){
        let classes = "bullet"
        this.filterKeys.length && this.filterKeys.indexOf(d.title)!=-1&&(classes+=" selected")
        return classes
      }.bind(this))
      .attr("data-value", function(d,i) {return d.measures.reduce((a, b)=> a+b)})
      .attr("data-key", function(d,i) {return d.title})
      .attr("data-index", function(d,i) {return i+1});

  let title = bullet.append("g")
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + obj.chartProp.height / 2 + ")");

  title.append("text")
      .attr("class", "title")
      .text(function(d) { return d.title; });
  this.addLegend({
      obj,
      container:parentG,
      selector:'.measure',
      node:obj.chartData,
      key: 'date'
    });

  // append div for toolTip
  let tplY= obj.chartProp.height+obj.chartProp.margin.yMargin
    let tlpObj={elem:bullet,tplY:tplY-5}
    this.chartToolTip(tlpObj)

  // this.isCompsiteChart&& bullet.on("click",this.compSourcePopulate.bind(this,obj.chartProp.axis))
  let compSourcePopulate = this.compSourcePopulate.bind(this,obj.chartProp.axis)
  this.isCompsiteChart&&bullet.on("click",function(e){
    let elem = this, item = e.title
    compSourcePopulate({item,elem})
  })
  this.isCompsiteChart&&bullet.on("dblclick",function(e){
    let elem = this, item = e.title, dblClick=true
    compSourcePopulate({item,elem,dblClick})
  })

  d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+ obj.chartProp.margin.xMargin+"px"})
  }
  // populate chart data
  getChartData(itemX, itemY){
      let sourcemap = this.source.map(row=>{
        return{[row[itemX]]:row[itemY]}
      })
      // debugger
      let source  = sourcemap.map(items=>{return {item:Object.keys(items)[0],value:items[Object.keys(items)[0]]}})
      return source
  }
}
customElements.define(bulletChart.is, bulletChart)
