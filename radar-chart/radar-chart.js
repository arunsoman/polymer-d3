import '../display-component/base-chart.js';
import './RadarChart.js';
/**
* @polymer
* @extends HTMLElement
*/
class radarChart extends baseChart{
  static get template() {
    return `
    <style>
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
      #chartContainer.selected polygon {
        fill-opacity: .25!important;
      }
      #chartContainer.selected polygon.selected {
        fill-opacity: .5!important;
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
        <chart-input slot="chart-input" axis="z" label="z-axis" accept="string"></chart-input>
      </chart-input-group>
      <!-- <chart-settings uuid="[[uuid]]"></chart-settings> -->
    <div id="chartContainer"></div>
`;
  }

  static get is(){
    return "radar-chart"
  }
  static get properties(){
    return{

    }
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
    let source = this.getChartData(chartProp.itemX, chartProp.itemY,chartProp.itemZ, chartProp.parseDate)
    let chartData = source.data
    let KeyMap = source.KeyMap
    

    //Options for the Radar chart, other than default
    let options = {
      width: chartProp.width,
      height: chartProp.height,
      maxValue: 0.6,
      levels: 6,
      ExtraWidthX: chartProp.margin.xMargin,
      ExtraHeightY: chartProp.margin.yMargin,
      color:chartProp.color,
      KeyMap:KeyMap,
      compSourcePopulate:this.compSourcePopulate.bind(this,chartProp.axis),
      compChartChk:this.isCompsiteChart,
      filterKeys:this.filterKeys,
      chartScope:this
    }

    return {
      chartData,
      options,
      KeyMap,
      chartProp
    }
  }
  _paint(obj) {
    this.clear()
    if (!obj) return false
    //Draw Radar chart
    let parentG = this.$.chartContainer
    chart.radarChart(parentG,obj.chartData,obj.options)
    //Draw Radar chart legend
    var svg = d3.select(parentG)
                .selectAll('svg')
                .append('svg')
                .attr("width", obj.options.width+obj.options.ExtraWidthX)
                .attr("height", obj.options.height+obj.options.ExtraHeightY)

    //Create the title for the legend
    var text = svg.append("text")
                    .attr("class", "title")
                    .attr('transform', 'translate(90,0)')
                    .attr("x", obj.options.width - 70)
                    .attr("y", 10)
                    .attr("font-size", "12px")
                    .attr("fill", "#404040")
                    .text("test legend");

    //Initiate Legend

    // this.addLegend({
    //     obj,
    //     container:svg,
    //     selector:'.dot',
    //     node:obj.KeyMap
    //   });
    var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr('transform', 'translate(90,20)')

    //Create colour squares
    legend.selectAll('rect')
          .data(obj.KeyMap)
          .enter()
          .append("rect")
          .attr("x", obj.options.width - 65)
          .attr("y", function(d, i){ return i * 20;})
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", function(d, i){ return obj.options.color(i);})
    //Create text next to squares
    legend.selectAll('text')
          .data(obj.KeyMap)
          .enter()
          .append("text")
          .attr("x", obj.options.width - 52)
          .attr("y", function(d, i){ return i * 20 + 9;})
          .attr("font-size", "11px")
          .attr("fill", "#737373")
          .text(function(d) { return d; })
    d3.select(parentG).style({"width":obj.options.width+ obj.options.ExtraWidthX+"px"})
  }
  // populate chart data
  getChartData(itemX, itemY,itemZ,formatDate){
    //let formatDate = d3.time.format("%Y-%m-%d").parse;
    let keys=this.source.map(row=>row[itemZ])
    let KeyMap = keys.filter((item, pos)=>keys.indexOf(item) == pos)
    let dateChk
    let sourceData= KeyMap.map((key,i)=>{
      return this.source.reduce((old,newD)=>{
          if(!old[key]){
            if(newD[itemZ] == key){old[key]=[newD]}
          }else{
            newD[itemZ] == key&& old[key].push(newD)
          }
          return old
       },{})
    })
    let data = sourceData.map((items,i)=>{
      let clsName = KeyMap[i]
      return items[clsName].map(item=>{
          let stringX =String(item[itemX]),
          dateV = stringX.indexOf("GMT")!=-1 ?new Date(stringX).toISOString().split("-")[0]:stringX.split(" ")[0]

          dateChk = stringX.indexOf("GMT")!=-1 ?true:formatDate(dateV)
          let dateSet = dateChk?dateV:item[itemX]
          return{
            axis:dateSet,
            value:item[itemY]
          }
        })
    })
    return{data,KeyMap}
  }
}
customElements.define(radarChart.is, radarChart)
