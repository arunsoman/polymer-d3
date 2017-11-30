import {barChart} from './bar-chart.js';
/**
* @polymer
* @extends HTMLElement
*/
export class stackedbarChart extends barChart {
  static get template() {
    return `
  <style>
  #chartContainer{
    margin:0 auto;
    font: 10px sans-serif;
  }
  .legend-items text{
    fill:black
  }
  .legend-items circle{
    cursor: pointer;
  }
  .legend{
    fill:transparent;
    font-size: 12px;
  }
  .axis path,
  .axis line {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
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
    #chartContainer.selected rect {
      fill-opacity: .25;
    }
    #chartContainer.selected rect.selected {
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
      <chart-input slot="chart-input" axis="x" label="X axis"></chart-input>
      <chart-input slot="chart-input" axis="y" label="Y axis" accept="number,date"></chart-input>
      <chart-input slot="chart-input" axis="z" label="Z axis"></chart-input>
    </chart-input-group>
    <!-- <chart-settings uuid="[[uuid]]"></chart-settings> -->
    <div id="chartContainer"></div>
`;
  }

  static get is() {
    return 'stacked-bar-chart'
  }
  static get properties() {
    return {}
  }
  redraw() {
    this.draw(this._paint(this._compute()));
  }
  _compute(err) {
    let axisIndex=3
    let arg = {axisIndex}
    let chartProp = this.getChartProperties(arg)
    if(!chartProp)return false

    let chartData = this.transformToStackedData(chartProp.itemX, chartProp.itemY, chartProp.itemZ);

    let axis = {
      scale: {},
      position: {}
    }
    let layers = d3.layout.stack()(chartData);
    axis.scale.x = d3.scale.ordinal().rangeRoundBands([0, chartProp.width], .05);
    axis.scale.y = d3.scale.linear().range([chartProp.height, 0]);
    axis.scale.z = d3.scale.category10();
    axis.scale.x.domain(layers[0].map(items => items.x))
    axis.scale.y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();
    // get keys of array map without duplicate in it
    let keys = Object.keys(this.source.map(items=>items[chartProp.itemZ]).reduce((a,b)=>{a[b]=true; return a},{}));
    axis.scale.z.domain(keys);

    axis.position.x = d3.svg.axis().scale(axis.scale.x).orient("bottom");
    axis.position.y = d3.svg.axis().scale(axis.scale.y).orient("left").ticks(10);

    return {
      axis,
      chartData,
      layers,
      keys,
      chartProp
    }

  }
  _paint(obj) {
    this.clear();
    if(!obj) return false;

    let selector = d3.select(this.$.chartContainer)
      .append("svg")
      .attr("width", obj.chartProp.width + obj.chartProp.margin.xMargin)
      .attr("height", obj.chartProp.height + obj.chartProp.margin.yMargin)

    let svg = selector.append("g")
      .attr("transform", "translate(" + obj.chartProp.margin.left + "," + obj.chartProp.margin.top + ")");

    // // render stacked bar chart
    // if(obj.axis.scale.z){

    // }
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + obj.chartProp.height + ")")
      .call(obj.axis.position.x)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)")
      svg.append("g")
      .attr("class", "y axis")
      .call(obj.axis.position.y)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("dy", ".71em")
      .style("text-anchor", "start");

    let segments = svg.selectAll(".layer")
      .data(obj.layers)
      .enter().append("g")
      .attr("class",function(d){
        let classes = "layer"
        this.filterKeys.length && this.filterKeys.indexOf(d.x)!=-1&&(classes+=" selected")
        return classes
      }.bind(this))
      .style("fill", function(d, i) { return obj.axis.scale.z(i); });
      // .style("fill", "steelblue");

  let rect= segments.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("x", function(d) { return obj.axis.scale.x(d.x); })
    .attr("y", function(d) { return obj.axis.scale.y(d.y + d.y0); })
    .attr("height", function(d) { return obj.axis.scale.y(d.y0) - obj.axis.scale.y(d.y + d.y0); })
    .attr("width", obj.axis.scale.x.rangeBand() - 1)
    .attr("data-value", function(d,i) {return d.y==0?d.y0:d.y})
    .attr("data-key", function(d,i) {return d.x});

    let tlpObj={elem:rect,tplY:60}
    this.chartToolTip(tlpObj)

      // .attr("x", function(d) {
      //   return obj.axis.scale.x(d.item);
      // })
      // .attr("width", obj.axis.scale.x.rangeBand())
      // .attr("y", function(d) {
      //   return obj.axis.scale.y(d.value);
      // })
      // .attr("height", function(d) {
      //   return obj.height - obj.axis.scale.y(d.value);
      // })
    this.addLegend({
      obj,
      container:svg,
      selector:'.layer',
      node:obj.keys.map(items=>{return {item:items}}),
      key: 'item'
    });


    // this.isCompsiteChart&&segments.on("click",this.compSourcePopulate.bind(this,obj.chartProp.axis))
    let compSourcePopulate = this.compSourcePopulate.bind(this,obj.chartProp.axis)
    this.isCompsiteChart&&segments.on("click",function(e){
      let elem = this, item = e.x,zAxis=true
      compSourcePopulate({item,elem,zAxis})
    })
    this.isCompsiteChart&&segments.on("dblclick",function(e){
      let elem = this, item = e.x,zAxis=true,dblClick=true
      compSourcePopulate({item,elem,zAxis,dblClick})
    })

    d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+ obj.chartProp.margin.xMargin+"px"})

    // debugger;
    // this.attachToolTip(parentG, segments, 'pie-slice', htmlCallback);

  }

  // transform data to render chart in stacked format
  transformToStackedData(itemX,itemY,stacked){
    var keys = Object.keys(this.source.map(items=>items[stacked]).reduce((a,b)=>{a[b]=true; return a},{}));
    return keys.map(items=>this.source.map(source=>{return {
      x:source[itemX],y:source[itemY]}}));
  }
}
window.customElements.define(stackedbarChart.is, stackedbarChart);
