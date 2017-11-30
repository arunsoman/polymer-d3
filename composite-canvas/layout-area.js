import '../behaviors/redux-mixins-behavior.js';
import './chart-box.js';
import {Element} from "../node_modules/@polymer/polymer/polymer-element.js"

class layoutArea extends ReduxMixinBehavior(Element){
  static get template() {
    return `
    <style>
      :host #layoutArea{
        width:100%;
        min-height: 90vh;
        /*border:1px solid red;*/
      }
      #layoutArea:after{
        content: "";
        display:block;
        clear:both;
      }
      .row {
        margin-left: -5px;
        margin-right: -5px;
      }
      #layoutArea.drop{
        /*width:95%;*/
        transform: scale3d(1,1,1);
        background-color: #f6f6f6;
        box-shadow: 7px 1px 22px #474646;
        margin: 0;
      }
      #layoutArea.drop chart-box{
        opacity:.4;
      }
      div#layoutArea.compArea:after {
        content: "chart icons are drop here";
        display: block;
        position: absolute;
        width: 50%;
        font-size: 3.1em;
        top: 36%;
        left: 25%;
        color: #dadada
      }

    </style>
    <div id="layoutArea" class="row compArea" on-drop="drop" on-dragover="allowDrop" on-dragleave="dragLeave">
        <!-- <template is="dom-if" if="{{compChartReload}}" restamp="true"> -->
        <template is="dom-repeat" items="{{layoutData}}" id="domRepeat">
            <chart-box uuid="[[uuid]]" parent-id="[[parentId]]" chart-data="[[item]]"></chart-box>
        </template>
        <!-- </template> -->
        <!-- <dom-repeat items="[[layoutData]]">
          <template>
            <chart-box uuid="[[uuid]]" parent-id="[[parentId]]" chart-data="[[item]]"></chart-box>
          </template>
        </dom-repeat> -->
    </div>
`;
  }

  static get is(){
    return "layout-area"
  }
  static get properties(){
    return{
      uuid:{
        type:String
      },
      layoutData:{
        type:Array,
        statePath(state){
          let chartPath = state.charts[this.uuid]
          let layoutData = chartPath && chartPath.layoutData
          return layoutData
        }//,
        //observer:"itemFilter"
      },
      chartIndex:{
        type:Array,
        statePath(state){
          let chartPath = state.charts[this.uuid]
          let chartIndex = chartPath && chartPath.chartIndex
          return chartIndex?chartIndex:[]
        }
      },
      compChartReload:{
        type: Boolean,
        statePath(state){
          let chartIdChk = state.charts[this.uuid]
          let compChartReload = chartIdChk && chartIdChk.compChartReload
          return compChartReload?compChartReload:Date.now()
        }//,
        // observer:"itemFilter"
      }
    }
  }
  static get actions() {
    return{
      updateLayoutItem(layoutData){
        return {
          type: 'UPDATE_LAYOUT_ITEM',
          value: layoutData
        };
      },
      chartIndexUpdate(chartIndex){
        return {
          type: 'CHART_INDEX_UPDATE',
          value: chartIndex
        };
      }
    }
  }
  constructor(){
    super()
  }

  connectedCallback(){
    super.connectedCallback()
  }
  itemFilter(item){
    return item
    // debugger
    // this.$.domRepeat.render()
  }
  dragLeave(e){
    e.target.classList.remove('drop');
  }
  allowDrop(e){
    e.preventDefault();
    e.target.classList.add('drop');
  }
  drop(e){
    e.preventDefault();
    let chartElem = e.dataTransfer.getData('chartElem');
    let chartIcon = e.dataTransfer.getData('chartIcon');
    if(chartElem){
      e.target.classList.remove('drop');
      e.target.classList.remove('compArea');
      this.createChartBox(chartElem,chartIcon);
      e.dataTransfer.clearData('chartElem');
      e.dataTransfer.clearData('chartIcon');
    }
  }
  createChartBox(chartElem,Icon){
    let chartBox = document.createElement("chart-box")
    let chartItem={}
    chartItem.chartCls="col-md-6"
    chartItem.elem=chartElem
    chartItem.icon=Icon;
    chartItem.chartWidth = ((this.$.layoutArea.offsetWidth* 50)/100)-22
    let chartHeight = this.$.layoutArea.offsetHeight
    chartHeight = this.$.layoutArea.offsetHeight<=554?chartHeight:554
    chartHeight = chartHeight/2
    chartHeight = chartHeight+(chartHeight/2)
    chartItem.chartHeight = chartHeight

    let chartId = this.uuid+"@_"+chartElem+"_"+this.getUUID()
    chartItem.id=chartId
    chartItem.index=this.chartIndex.length+1

    let layoutData = Object.assign([],this.layoutData)
    layoutData.push(chartItem)
    this.dispatch("updateLayoutItem",{uuid:this.uuid,layoutData:layoutData})

    let chartIndex = Object.assign([],this.chartIndex)
    chartIndex.push(chartItem.index)
    this.dispatch("chartIndexUpdate",{uuid:this.uuid,chartIndex:chartIndex})

  }
  getUUID(){
    function uuid() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return uuid() + uuid() + '-' + uuid() + '-' + uuid();
  }
}
customElements.define(layoutArea.is,layoutArea)
