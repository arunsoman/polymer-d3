import {baseChart} from '../display-component/base-chart.js';
import './calendar-heatmap.js';
/**
* @polymer
* @extends HTMLElement
*/
class calendarChart extends baseChart{
  static get template() {
    return `
  <style>
  .day {
    fill: #fff;
    stroke: black;
    stroke-width: .5px;
  }
  .month {
    fill: none;
    stroke: white;
    stroke-width: 1px;
  }
  .year-title {
    font-size: 18px;
    letter-spacing: 10px;
    fill: #00B0DD;
  }
  svg text {
    font-size: 11px;
    text-transform: uppercase;
    fill: #00B0DD;
  }
  #chartContainer{
    margin:0 auto;
    font: 10px sans-serif;
  }
  paper-button.resetBtn {
    font-size: x-small;
    float: right;
    padding: 4px;
    margin-top: 5px;
  }
  </style>
    <chart-input-group uuid="[[uuid]]" chart-visible="[[chartVisible]]">
      <chart-input slot="chart-input" axis="x" label="Key" accept="date"></chart-input>
      <chart-input slot="chart-input" axis="y" label="Value" accept="number"></chart-input>
    </chart-input-group>
    <!-- <chart-settings uuid="[[uuid]]"></chart-settings> -->
    <!-- <svg id="svg"></svg> -->
    <div id="chartContainer"></div>
`;
  }

  static get is(){
    return "calendar-chart"
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
    let chartSrcData = source.map((item,i)=>{
      return{"item":item.value,"date":item["item"]}
    })
    // debugger
    let chartData = d3.nest()
          .key((d)=> d.item.indexOf("GMT")!=-1 ?d.item:chartProp.parseDate(d.item.split(' ')[0]))
          .rollup(function (n) {
              return d3.sum(n, function (d) {
                  return d.value; // key
              })
          })
          .map(source);
    //get years and calculated for year range(start and end year)
    let yearRange = chartSrcData.map(date=>date.date.indexOf("GMT")!=-1 ? +new Date(date.date).toISOString().split("-")[0]:+date.date.split("-")[0]).sort((a, b)=> a-b)
    let startYear =yearRange[0]
    let endYear =yearRange.pop()+1

    // create chart and source available in calendar-heatmap.js
    let self = this
    let calendarChart = d3.calendar.heatmap()
        .colourRangeStart('#FDBB30')
        .colourRangeEnd('#EE3124')
        .height(chartProp.height)
        .width(chartProp.width)
        .startYear(startYear)
        .endYear(endYear)
        .margin(chartProp.margin)

    return {
      calendarChart,
      chartData,
      chartProp
    }

  }
  _paint(obj) {
    this.clear()
    if (!obj) return false
    // render chart
    d3.select(this.$.chartContainer)
      .datum(obj.chartData)
      .call(obj.calendarChart);

    // this.addLegend({
    //     obj,
    //     container:d3.select(this.$.chartContainer),
    //     selector:'.day-rect',
    //     node:obj.chartData,
    //     key: 'date'
    //   });

    d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+obj.chartProp.margin.xMargin+"px"})
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
customElements.define(calendarChart.is,calendarChart)
