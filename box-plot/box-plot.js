import '../display-component/base-chart.js';
import './box.js';
/**
* @polymer
* @extends HTMLElement
*/
class boxPlot extends baseChart {
  static get template() {
    return `
  <style>
    .box {
    font: 10px sans-serif;
    }
    .box line,
    .box rect,
    .box circle {
    stroke: #000;
    stroke-width: 1px;
    }
    .box .center {
    stroke-dasharray: 3,3;
    }
    .box .outlier {
    fill: none;
    stroke: #000;
    }
    .box text{
      fill:#000;
    }
    .axis {
    font: 12px sans-serif;
    }

    .axis path,
    .axis line {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
    }

    .x.axis path {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
    }
    svg {
      font: 29px sans-serif;
    }
    #chartContainer{
      margin:0 auto;
      font: 10px sans-serif;
    }
    .legend rect{
      fill:transparent;
      stroke-width:0;
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

  static get is() {
    return 'box-plot'
  }
  static get properties() {
    return {
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

    let labels = true,
        min = Infinity,
        max = -Infinity

    //get chart data once pass "x and y" into the "getChartData" method
    let groupedData
    let source = this.getChartData(chartProp.itemX, chartProp.itemY)
    groupedData = d3.nest().key(d => d.item).entries(source);

    let chartData =[]
    groupedData.map((item,idx)=>{
      chartData[idx]=[item.key,item.values.map(test=>test.value)]
    })

    min = this.findMin(chartData)
    max = this.findMax(chartData)

    // debugger  // the x-axis
    	let x = d3.scale.ordinal()
          .domain( chartData.map(d=> d[0]) )
          .rangeRoundBands([0 , chartProp.width], 0.7, 0.3);

    	let xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

    	// the y-axis
    	let y = d3.scale.linear()
          .domain([min, max])
          .range([chartProp.height + chartProp.margin.top, chartProp.margin.top]);

    	let yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    let chart = d3.box({y: y,formatNumber:this.formatNumber})
      		.whiskers(this.iqr(1.5))
      		.height(chartProp.height)
      		.domain([min, max])
      		.showLabels(labels);

    return {
      x,
      xAxis,
      y,
      yAxis,
      chart,
      chartData,
      chartProp
    }
  }

  _paint(obj) {
    this.clear()
    if (!obj) return false
    let parentG = d3.select(this.$.chartContainer).append("svg")
      .attr("width", obj.chartProp.width+obj.chartProp.margin.xMargin)
      .attr("height", obj.chartProp.height+obj.chartProp.margin.yMargin+90)
      .attr("class", "box")
      .append("g")
      .attr("transform", "translate(" + obj.chartProp.margin.left + "," + obj.chartProp.margin.top + ")");

      // draw the boxplots
    	let rect = parentG.selectAll(".box")
      .data(obj.chartData)
    	  .enter().append("g")
          .attr("transform", (d)=>"translate(" +  obj.x(d[0])  + "," + obj.chartProp.margin.top + ")")
      .attr('class', 'box-g')
      .call(obj.chart.width(obj.x.rangeBand()))
      .attr("class",function(d){
        let classes = "rect"
        this.filterKeys.length && this.filterKeys.indexOf(d[0])!=-1&&(classes+=" selected")
        return classes
      }.bind(this))
      .attr("data-value", function(d,i) {return d[1].reduce((a, b)=> a+b)})
      .attr("data-key", function(d,i) {return d[0]});

    // add a title
   parentG.append("text")
      .attr("x", (obj.chartProp.width / 2))
      .attr("y", 0 + (obj.chartProp.margin.top / 2))
      .attr("text-anchor", "middle")
      .text(obj.chartProp.settings.title.value);

  // draw y axis
  parentG.append("g")
      .attr("class", "y axis")
      .call(obj.yAxis)
      .append("text") // and text1
        .attr("transform", "rotate(-90)")
        .attr("y", 14)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "16px")

  parentG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (obj.chartProp.height+ 10) + ")")
      .call(obj.xAxis)
    .append("text")             // text label for the x axis
        .attr("x", (obj.chartProp.width / 2) )
        .attr("y",  34 )
            .attr("dy", ".71em")

  this.addLegend({
      obj,
      container:parentG,
      selector:'.rect',
      node:obj.chartData,
      key: 0
    });


    // this.isCompsiteChart&& rect.on("click",this.compSourcePopulate.bind(this,obj.chartProp.axis))
    let compSourcePopulate = this.compSourcePopulate.bind(this,obj.chartProp.axis)
    this.isCompsiteChart&&rect.on("click",function(e){
      let elem = this, item = e[0]
      compSourcePopulate({item,elem})
    })
    this.isCompsiteChart&&rect.on("dblclick",function(e){
      let elem = this, item = e[0], dblClick=true
      compSourcePopulate({item,elem,dblClick})
    })
    // append div for toolTip
    let tlpObj={elem:rect,tplY:60}
    this.chartToolTip(tlpObj)

    d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+obj.chartProp.margin.xMargin+"px"})
  }
  // Returns a function to compute the interquartile range.
  iqr(k) {
    return function(d, i) {
      var q1 = d.quartiles[0],
          q3 = d.quartiles[2],
          iqr = (q3 - q1) * k,
          i = -1,
          j = d.length;
      while (d[++i] < q1 - iqr);
      while (d[--j] > q3 + iqr);
      return [i, j];
    }
  }
  // todo: format later
  formatNumber(d) {
    if (d < 1000) {
      return d;
    }
    d = d3.format('s')(d);
    let sufix = d.slice(-1);
    let num = parseFloat(d.slice(0, d.length)).toFixed(2);
    return  num + sufix;
  }
  // find maximum in an array of arrays
  findMax(arr) {
    return d3.max(arr, innerArray => d3.max(innerArray[1]));
  }
  // find minimum in an array of arrays
  findMin(arr) {
    return d3.min(arr, innerArray => d3.min(innerArray[1]));
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
customElements.define(boxPlot.is, boxPlot)
