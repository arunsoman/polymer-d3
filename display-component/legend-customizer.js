import {Element} from "../node_modules/@polymer/polymer/polymer-element.js";

class legendCustomizer extends Element {
  static get template() {
    return `
    <style>
    #chartArea {
      position: absolute;
      left: 0;
      right: 0;
      top:0;
      bottom: 0;
      border: dotted 2px #d8d0d0;
    }

    #legends {
      position: absolute;
      background: #ffec93;
      padding: 1px 6px;
      border-radius: 11px;
      color: #c39c19;
      border: solid 1px;
      z-index: 99;
      cursor: pointer;
      width: 52px;
      user-select:none;
    }

    #legends iron-icon {
      position: absolute;
      width: 1.2em;
      margin-left: 0.5em;
      margin-top: -0.2em;
      cursor: pointer;
    }

    </style>
    <div id="chartArea">
      <div id="legends" style\$="left:[[chartSettings.legend.values.position.x]]px;top:[[chartSettings.legend.values.position.y]]px;">Legend
        <iron-icon icon="icons:invert-colors" label="legends" on-click="showColorPicker"></iron-icon>
      </div>
    </div>
   <!--  <paper-dialog id="dialog" modal>
      <h2>Label color picker</h2>
      <paper-dialog-scrollable>
        <div class="flex">
          <template is="dom-repeat" items="[[keys]]">
            <paper-input label="[[item.key]]">
              <paper-swatch-picker color="{{item.color}}" slot="prefix"></paper-swatch-picker>
            </paper-input>
          </template>
        </div>
      </paper-dialog-scrollable>
      <div class="buttons">
        <paper-button dialog-dismiss on-click="save">Apply</paper-button>
        <paper-button dialog-dismiss>Cancel</paper-button>
      </div>
    </paper-dialog> -->
`;
  }

  static get is() {
    return 'legend-customizer'
  }

  static get properties() {
    return {
      chartSettings:{
        type:Object,
        notify:true
      },
      legendData: {
        type: Object
      },
      legendSettings: {
        notify: true
      },
      legendKeys:{
        type:Object,
        observer:'tansformKeys'
      },
      mouseupCallback:{
        type:Number,
        notify:true
      },
      margin:{
        type:Object,
        value:{
          left:0,
          right:0,
          top:0,
          bottom:0
        },
        notify:true
      },
      dragPosition: {
        type:Object,
        value:{
          x:0,
          y:0
        }
      }
    }
  }

  tansformKeys(items){
    this.set('keys',Object.keys(items).map((item,i)=>items[i]));
  }
  showColorPicker() {
    this.$.dialog.open();
  }
  allowDrop(ev) {
    this.set('chartSettings.legend.values.position.x',ev.offsetX-26);
    this.set('chartSettings.legend.values.position.y',ev.offsetY-9);
    // console.log(this.dragPosition.x,this.dragPosition.y,":",ev.);
    ev.preventDefault();
  }

  drop(e) {
    let getchartWidth = this.$.chartArea.offsetWidth;
    let getchartHeight = this.$.chartArea.offsetHeight;

    this.set('chartSettings.legend.values.position',this.dragPosition);
    this.set('mouseupCallback',Date.now());
  }
  move(ev){
    // console.log(ev.clientX,ev.clientY);
    this.set('chartSettings.legend.values.position.x',ev.clientX-26);
    this.set('chartSettings.legend.values.position.y',ev.clientY-99);
    this.set('mouseupCallback',Date.now());
  }

  constructor() {
    super();
  }
  ready(){
    super.ready();
    console.log(this.$.legends);
    this.$.legends.addEventListener('mousedown',(event)=>{
      this.mousedown = true;
    });
    document.body.addEventListener('mouseup',(event)=>{
      this.mousedown = false;
    });
    document.body.addEventListener("mousemove",(evt)=>{
      this.mousedown && this.move(event)
    },true);

  }
  save(){
    this.set('legendData.nodes',this.keys)
  }
}
customElements.define(legendCustomizer.is, legendCustomizer)
