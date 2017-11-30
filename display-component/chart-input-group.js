import './chart-input.js';
import './drag-element.js';
import '../behaviors/redux-mixins-behavior.js';
import {Element} from "../node_modules/@polymer/polymer/polymer-element.js"
class chartInputGroup extends ReduxMixinBehavior(Element) {
  static get template() {
    return `
    <style>
      .placeholder{
        --iron-icon-height: 10em;
        --iron-icon-width: 10em;
        opacity: 0.1;
        margin: 0 auto;
        display: inherit;
      }
      .placeholder-wrapper {
        padding: 6em;
        overflow: hidden;
        cursor: pointer;
      }
      .chart-description{
        text-align: center;
        color: #b9b6b6;
      }

      :host{
        position: relative;
      };
      .input-drag-wrapper{
        padding: 1em;
      }
      #chartSelector{
        position: relative;
        background: #2196f3;
        text-align: center;
        margin: 0;
        padding: 0;
      }
      .input-drag-wrapper{
        padding: 1em 1em 0;
      }
      #inputItems{
        background: #fff;
        margin-top: 7px;
      }
      paper-dialog{
        min-width: 710px;
      }
      paper-tabs{
        background: #45c1e0;
        /*margin-bottom: 0;*/
        margin-top: 0;
      }
      paper-tabs[no-bar] paper-tab.iron-selected {
        color: #ffff8d;
      }
      .chart-wrapper{
        overflow: auto;
        resize: both;
        border: dotted 3px red;
        position: absolute;
      }
      .chart-wrapper:active{
        width: 0;
        height: 0;
      }
      .margin-wrapper{
        position: absolute;
      }
      .canvas-resizer,.left-wrapper{
        position: relative;
      }
      paper-icon-button.settings{
        float:right;
        color: #9f9e9e;
        width: 36px;
        height: 36px;
        margin-top: 1px;
      }
      .left-wrapper,.right-wrapper{
        float: left;
      }
      .block{
        position: absolute;
        /*height: 150px;*/
      }
      .block.top{
        z-index: 9999;
      }
      .legend-drag-area{
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
      }
      .live-edit-wrapper{
        background: #27b7da;
        color: #fff;
        --paper-radio-button-label-color:#fff;
        --paper-radio-button-checked-ink-color:#fff;
        --paper-radio-button-checked-color:#fff;
      }
      .axis-label{
        display: inline-block; 
        float: left; 
        margin-top: 20px;
        color: #000;
      }
      .legend-drop-target{
        position: absolute;
      }
      
    </style>
    <template is="dom-if" if="[[!chartVisible.show]]">
      <div class="placeholder-wrapper" on-click="showChartOptions">
        <iron-icon class="placeholder" icon="[[chartVisible.icon]]"></iron-icon>
        <p class="chart-description">Source is required to show charts. Let's add chart by tap this area</p>
      </div>
    </template>
    <template is="dom-if" if="[[chartVisible.show]]">
    <paper-menu-button>
    <paper-icon-button icon="menu" horizontal-align="right" slot="dropdown-trigger" alt="menu"></paper-icon-button>
    <paper-listbox slot="dropdown-content">
      <paper-item on-click="showChartOptions">Add Source</paper-item>
      <paper-item>Edit</paper-item>
    </paper-listbox>
  </paper-menu-button>
      <!-- <paper-icon-button icon="icons:settings" on-click="showChartOptions" class="settings"></paper-icon-button> -->
    </template>



    <template is="dom-if" if="{{live}}">
      <div class="live-edit-wrapper">


        <button on-tap="toggleEdit">Exit live edit</button>
        <paper-radio-group selected="{{live}}" attr-for-selected="name">
          <paper-radio-button name="canvas">Canvas</paper-radio-button>
          <paper-radio-button name="legend">Legend</paper-radio-button>
          <paper-radio-button name="label">Label</paper-radio-button>
        </paper-radio-group>
        <template is="dom-if" if="{{eq(live,'canvas')}}">
          <div class="canvas-resizer">
            <div class="block top" style="width:[[aggregateWidthMargin]]px;height:[[newSettings.margin.value.top]]px">
              <resizer-element element-align="top" ht="[[newSettings.margin.value.top]]" margin-value="{{newSettings.margin.value.top}}" mouseup-callback="{{updateCallback}}"></resizer-element>
            </div>
            <div class="block left" style\$="width:[[newSettings.margin.value.left]]px; top:[[newSettings.margin.value.top]]px;height: [[newSettings.height.value]]px;" ht="[[newSettings.height.value]]">
              <resizer-element element-align="left" margin-value="{{newSettings.margin.value.left}}" mouseup-callback="{{updateCallback}}" wd="[[newSettings.margin.value.left]]"></resizer-element>
            </div>
            <div class="block main" style\$="width:[[newSettings.width.value]]px;left:[[newSettings.margin.value.left]]px; top:[[newSettings.margin.value.top]]px;">
              <resizer-element resize-both="" show-info="" element-width="{{newSettings.width.value}}" element-height="{{newSettings.height.value}}" mouseup-callback="{{updateCallback}}"></resizer-element>
            </div>
            <div class="block right" style\$="width:[[newSettings.margin.value.right]]px; left:[[aggregateWidth]]px;top:[[newSettings.margin.value.top]]px; height: [[newSettings.height.value]]px;">
              <resizer-element element-align="left" margin-value="{{newSettings.margin.value.right}}" mouseup-callback="{{updateCallback}}" wd="[[newSettings.margin.value.right]]"></resizer-element>
            </div>
            <div class="block bottom" style\$="top:[[aggregateHeight]]px; height: [[newSettings.margin.value.bottom]]px; width: [[aggregateWidthMargin]]px">
              <resizer-element element-align="top" margin-value="{{newSettings.margin.value.bottom}}" mouseup-callback="{{updateCallback}}" ht="[[newSettings.margin.value.bottom]]"></resizer-element>
            </div>

          </div>
        </template>
        <template is="dom-if" if="{{eq(live,'legend')}}">
          <div class="legend-drop-target" style\$="width:[[aggregateWidthMargin]]px; height: [[aggregateHeightMargin]]px;">
            <legend-customizer chart-settings="{{newSettings}}" mouseup-callback="{{updateCallback}}"></legend-customizer>
          </div>
        </template>
        <template is="dom-if" if="{{eq(live,'label')}}">
          <div class="item">
            <div class="axis-label">X</div>
            <paper-slider style="float: left;" class="red" value="{{dragSettings.xLabel.value}}" max="360" editable=""></paper-slider>
          </div>

          <div class="item">
            <div class="axis-label">Y</div>
            <paper-slider style="float: left;" class="red" value="{{dragSettings.yLabel.value}}" max="360" editable=""></paper-slider>
          </div>

          <div class="item">
            <div class="axis-label">Z</div>
            <paper-slider style="float: left;" class="red" value="{{dragSettings.zLabel.value}}" max="360" editable=""></paper-slider>
          </div>


        </template>
      </div>
    </template>
    <paper-dialog id="chartSelectorModal" with-backdrop="">

      <paper-tabs selected="{{selected}}" no-bar="">
        <paper-tab>Chart Source</paper-tab>
        <paper-tab>Edit</paper-tab>
      </paper-tabs>
      <iron-pages selected="{{selected}}">
        <div>
         <div id="chartSelector">
          <div class="input-drag-wrapper">
            <template is="dom-repeat" items="[[ externals ]]">
              <drag-element item="[[item]]" draggable="true" data-index\$="[[item.value]]"></drag-element>
            </template>
          </div>

          <div id="inputItems">
            <slot name="chart-input"></slot>
          </div>
        </div>
      </div>

      <div>
        <chart-settings uuid="[[uuid]]" live="{{live}}"></chart-settings>
      </div>
    </iron-pages>
  </paper-dialog>
`;
  }

  static get is() {
    return 'chart-input-group';
  }
  static get properties(){
    return{
      uuid:{
        type:String,
        observer:'init'
      },
      paragraphId:{
        type:String
      },
      externals:{
        type:Array,
        statePath(state){
          if(this.paragraphId){
            return state.data[this.paragraphId].externals;
          }
        }
      },
      live:{
        type:Boolean,
        value:false,
        observer:'liveEdit'
      },
      selected:{
        type:Number,
        value:0,
        observer:'tabChange'
      },
      source:{
        type:Array,
        statePath(state){
          if(this.paragraphId){
            return state.data[this.paragraphId].source
          }
        }
      },
      updateCallback:{
        type:Number,
        observer:'applySettings'
      },
      aggregateWidth:{
        type:Number
      },
      aggregateHeight:{
        type:Number
      },
      aggregateWidthMargin:{
        type:Number
      },
      aggregateHeightMargin:{
        type:Number
      },
      dragSettings:{
        type:Object
      },
      settings:{
        type:Object,
        statePath(state){
          if(this.uuid && state.charts[this.uuid]){
            return state.charts[this.uuid].settings
          }
        },
        observer:'aggregate'
      }
    }
  }
  static get actions() {
    return {
      updateExternal(externals) {
        return {
          type: 'UPDATE_EXTERNALS',
          value: externals
        };
      },
      updateSource(source) {
        return {
          type: 'UPDATE_SOURCE',
          value: source
        };
      }
    }
  }
  static get observers(){
    return ['applyDragSettings(dragSettings.*)']
  }
  eq(object, args) {
    return object == args
  }
  applyDragSettings(ev){
    if(Object.keys(this.dragSettings).length > 0){
      this.newSettings = Object.assign({},this.dragSettings);
      this.applySettings();
    }
  }
  applySettings(){
    // this.aggregate();
    
    this.dispatch({
      type: 'UPDATE_SETTINGS',
      value: {
        id: this.uuid,
        settings: this.newSettings
      }
    })
  }
  aggregate(obj){
    this.set('newSettings',Object.assign({},obj));
    if(!this.newSettings.legend.values.position.x){
      this.set('newSettings.legend.values.position.x',this.newSettings.width.value*0.8);
    }
    if(!this.newSettings.legend.values.position.y){
      this.set('newSettings.legend.values.position.y',10);
    }

    this.set('aggregateWidth',this.newSettings.margin.value.left + this.newSettings.width.value);
    this.set('aggregateHeight',this.newSettings.margin.value.top + this.newSettings.height.value);
    this.set('aggregateWidthMargin',this.newSettings.margin.value.left+this.newSettings.margin.value.right + this.newSettings.width.value);
    this.set('aggregateHeightMargin',this.newSettings.margin.value.top+ this.newSettings.margin.value.bottom + this.newSettings.height.value);
  }
  eq(data,val){
    return data == val;
  }
  toggleEdit(){
    this.set('live',!this.live);
  }
  liveEdit(){
    this.$.chartSelectorModal.close();
    this.newSettings = Object.assign({},this.settings);
    this.dragSettings = Object.assign({},this.settings);
  }
  tabChange(){
    this.$.chartSelectorModal.notifyResize();
  }
  showChartOptions(){
    this.$.chartSelectorModal.open();
  }
  init(){
    this.set('paragraphId',this.uuid.split('@')[0]);
  }
  constructor() {
    super();
  }
  connectedCallback(){
    super.connectedCallback();
  }
}
customElements.define(chartInputGroup.is, chartInputGroup)
