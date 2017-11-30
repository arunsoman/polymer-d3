import '../behaviors/redux-mixins-behavior.js';
import './legend-customizer.js';
import './resizer-element.js';
import {Element} from "../node_modules/@polymer/polymer/polymer-element.js";

class chartSettings extends ReduxMixinBehavior(Element) {
  static get template() {
    return `
    <style>
    :host {
      display: block;
    }

    .customizer-holder {
      height: 400px;
      width: 700px
    }

    .dummy-txt {
      display: inline-block;
      transition: all 400ms ease;
    }

    .flex {
      display: flex;
    }

    .item {
      flex-grow: 1;
      display: inline-block;
      width: 40%;
      margin:0 1em;
    }

    .inputs.flex {
      flex-wrap: wrap;
      margin: 0 2em;
    }

    .inputs.flex paper-input {
      margin-left: 5px;
    }

    .none {
      display: none!important;
    }
    h2{
      display: inline;
    }
    .buttons{
      float: right;
      margin-top: -10px;
    }
    paper-button{
      background: #ffec93;
    }
    paper-button.cancel{
      background: #fff;
    }
    .animate{
      transition: transform .5s linear;
    }
    </style>
    <!-- <paper-icon-button icon="icons:settings" on-click="showSettings"></paper-icon-button> -->
    <!-- <paper-dialog id="dialog" modal> -->
      <h2>Chart Settings </h2>
      <div class="buttons">
        <paper-button on-click="liveEdit" dialog-dismiss=""><strong>Live Edit</strong></paper-button>
        <paper-button on-click="applySettings" dialog-dismiss=""><strong>Apply</strong></paper-button>
        <paper-button on-click="resetSettings" class="cancel" dialog-dismiss="">Cancel</paper-button>
      </div>
      <div class="flex" style="width: 100%">
        <!-- <legend-customizer legend-data="[[settings.legend.values]]" legend-settings="{{legend}}" legend-keys="{{chartKeys}}" style="width: 40%;" margin="{{settings.margin.value}}"></legend-customizer> -->

        <div class="inputs flex" style="width: 60%;">
          <template is="dom-repeat" items="{{_settings}}">
              <template is="dom-if" if="{{eq(item.value.uitype,'picker')}}">
                <div class="item">

                </div>
              </template>
             <!--  <template is="dom-if" if="{{eq(item.value.uitype,'text')}}">
                <div class="item">
                  <paper-input label="[[item.value.txt]]" type='[[item.value.uitype]]' value='{{item.value.value}}'></paper-input>
                </div>
              </template> -->
              <!-- <template is="dom-if" if="{{eq(item.value.uitype,'number')}}">
                <div class="item">
                  <paper-input label="[[item.value.txt]]" type='[[item.value.uitype]]' value='{{item.value.value}}'></paper-input>
                </div>
              </template> -->
              <!-- <template is="dom-if" if="{{eq(item.value.uitype,'range')}}">
                <div class="item">
                  <div>[[item.value.txt]]</div>
                  <div style\$="transform: rotateZ({{item.value.value}}deg); transform-origin: center; display: inline-block; float: left; margin-top: 20px;" class="animate">Label</div>
                  <paper-slider style="float: left;" class="red" value="{{item.value.value}}" max="360" editable></paper-slider>
                  
                </div>
              </template> -->
              <template is="dom-if" if="{{eq(item.value.uitype,'boolean')}}">
                <div class="item">
                  <paper-checkbox checked="{{item.value.value}}">[[item.value.txt]]</paper-checkbox>
                </div>
              </template>
          </template>
        </div>
      </div>
     
    <!-- </paper-dialog> -->

    <!-- <template is="dom-if" if="[[isActive]]">
      <div class="tick-rotation flex">
        <template is='dom-repeat' items="{{_settings}}">
          <template is="dom-if" if="{{isSliderInput(item.uitype)}}">
            <span>[[item.txt]]</span>
            <div class="slider-wrap">
              <paper-slider pin snaps min="[[item.min]]" max="[[item.max]]" max-markers="10" step="[[item.step]]" value="{{item.selectedValue}}" on-value-change="_rotateTick"></paper-slider>
              <span id="{{item.input}}" class="dummy-txt">TICK</span>
            </div>
          </template>
        </template>
      </div>
      <template is="dom-if" if="{{legendSettingsFlag}}" restamp>
        <legends-component opener="{{legendSettingsFlag}}" settings="{{_legendSettings}}"></legends-component>
      </template>
      <div>
        <span id="mouse-pointer"></span>
        <div>
        </div>
      </div>
    </template> -->
`;
  }

  static get is() {
    return 'chart-settings'
  }

  static get properties() {
    return {
      settings: {
        type: Object,
        statePath(state) {
          if (state.charts[this.uuid]) {
            return state.charts[this.uuid].settings
          }
        },
        observer: 'settingsToArray'
      },
      legendData:{
        type:Object
      },
      legend:{
        type:Object
      },
      live:{
        type:Boolean,
        value:false,
        notify:true
      },
      chartKeys:{
        type:Object,
        statePath(state){
          if(state.charts[this.uuid]){
            return state.charts[this.uuid].chartkeys
          }
        }
      }
    }
  }
  static get observers(){
    return['legendChange(legend)']
  }
  legendChange(data){
    this._settings.find(items=>{if(items.item=='legend') items.value.values = Object.assign({},data)});
  }
  eq(object, args) {
    return object == args
  }
  noeq(object, args) {
    return object !== args
  }
  resetSettings() {
    this.settingsToArray();
  }
  showSettings() {
    this.$.dialog.open();
  }
  applySettings() {
    let newSettings = this.settingstoObj();
    this.dispatch({
      type: 'UPDATE_SETTINGS',
      value: {
        id: this.uuid,
        settings: newSettings
      }
    })
  }
  liveEdit(key){
    this.set('live','canvas');
  }
  settingsToArray() {
    // transform object to array with object key value.
      this.settings && this.set('_settings', Object.keys(this.settings).map(item => {
      return {
        item,
        value: Object.assign({}, this.settings[item])
      }
    }));
  }
  settingstoObj() {
    return this._settings.reduce((prev, newVal) => {
      prev[newVal.item] = newVal.value;
      return prev;
    }, {})
  }
  constructor() {
    super();
  }
}
customElements.define(chartSettings.is, chartSettings)
