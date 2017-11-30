import '../display-component/base-chart.js';
/**
* @polymer
* @extends HTMLElement
*/
class pieChart extends baseChart {
  static get template() {
    return `
<style>
  body {
    text-align: center;
  }
  svg {
    font: 29px sans-serif;
  }
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
  paper-icon-button.resetBtn {
    font-size: x-small;
    float: right;
    padding: 4px;
    margin-top: 5px;
    width: 27px;
    color: #9f9e9e;
    height: 27px;
  }
  #chartContainer.selected g.arc {
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

  static get is() {
    return 'pie-chart'
  }
  static get properties() {
    return {
      innerRadius: {
        type: Object,
        value: {
          selectedValue: 0
        }
      }
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

    let innerRadius;
    let radius = Math.min(chartProp.width, chartProp.height) / 2;
    innerRadius = radius / 2

    // get chart data
    let source = this.getChartData(chartProp.itemX,chartProp.itemY)
    let chartData = d3.nest().key(d => d).entries(source);

    let pie = d3.layout.pie()
      .value(d => d.value)
      .sort(null);

    let arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(innerRadius);

    let labelArc = d3.svg.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    return {
      arc,
      pie,
      chartData,
      chartProp
    }
  }
  _paint(obj) {
    this.clear()
    if (!obj) return false
  //  this.chartKeys(obj,obj.chartData[0].values,'item');
    let parentG = d3.select(this.$.chartContainer)
      .selectAll("div#chartContainer")
      .data(obj.chartData).enter()
    let width = obj.chartProp.width+obj.chartProp.margin.xMargin,
        height = obj.chartProp.height+obj.chartProp.margin.yMargin
    parentG = parentG.append("div")
      .style({"display":"inline-block","width":width,"height":height})
      .append("svg")
      .attr("width", width)
      .attr("height", height).append("g");

    // let txt = this.externals[this.inputs[this.x].selectedValue[0]]["key"]

    // parentG.append("text")
    // .attr("dy", ".35em")
    // .attr("text-anchor", "middle")
    // .attr("transform", "translate("+(width/2)+","+(height/2)+")")
    // .text(txt)

    let g = parentG.selectAll('.arc')
      .data(d => obj.pie(d.values))
      .enter().append('g')
      .attr("class",function(d){
        let classes = "arc"
        this.filterKeys.length && this.filterKeys.indexOf(d.data.item)!=-1&&(classes+=" selected")
        return classes
      }.bind(this))
      .attr("data-value", function(d,i) {return d.data.value})
      .attr("data-key", function(d,i) {return d.data.item});

    let segments = g.append('path')
      .attr('d', obj.arc)
      .attr('class', 'pie-slice');

    segments.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // append div for toolTip
    let tlpObj={elem:g,tplY:60}
    this.chartToolTip(tlpObj)

    // let legend = parentG.append("g")
    //   .attr("class","legend")
    //   .attr("transform","translate("+(obj.width*obj.label.position.x)/100+","+(obj.height*obj.label.position.y)/100+")")
    //   .call(d3.legend)

    this.addLegend({
        obj,
        container:parentG,
        selector:'.pie-slice',
        node:obj.chartData[0].values,
        key: 'item',
        segments
      });

  // this.isCompsiteChart&& g.on("click",this.compSourcePopulate.bind(this,obj.chartProp.axis))
  let compSourcePopulate = this.compSourcePopulate.bind(this,obj.chartProp.axis)
  this.isCompsiteChart&& g.on("click",function(e){
    let elem = this, item = e.data.item
    compSourcePopulate({item,elem})
  })
  this.isCompsiteChart&&g.on("dblclick",function(e){
    let elem = this, item = e.data.item, dblClick=true
    compSourcePopulate({item,elem,dblClick})
  })

    d3.select(this.$.chartContainer).style({"width":obj.chartProp.width+obj.chartProp.margin.xMargin+"px"})

  }
  getChartData(itemX, itemY){
    let sourcemap =
    this.source.reduce((old,newVal)=>{
      old[newVal[itemX]]=(old[newVal[itemX]]||0)+newVal[itemY]
      return old
    },{})
    let source  = Object.keys(sourcemap).map(item=>{return {item,value:sourcemap[item]}})
    return source
  }
}
customElements.define(pieChart.is, pieChart)
