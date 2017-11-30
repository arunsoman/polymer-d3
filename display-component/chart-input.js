import '../behaviors/redux-mixins-behavior.js';

class ChartInput extends ReduxMixinBehavior(Polymer.Element){
  static get template() {
    return `
<style>
      .item-holder p{
        margin: 0;
        font-size: 0.8em;
        color: #23d9a2;
      }
      .item-holder{
          width: 33%;
          display: inline-block;
          padding: 1em;
          box-sizing: border-box;
          text-align: left;
          position: relative;
          transform: scale3d(1,1,1);
          transition: all .2s linear;
      }

      .item-holder:after{
          content: "";
          display: none;
          right: 0;
          top: 0;
          bottom: 0;
          position: absolute;
          background: rgba(0,0,0,0);
          z-index: 1;
          left: 0;
      }
      :host .drag-active .item-holder:after{
        display: block;
      }
      .item-holder.hover{
        transform: scale3d(1.1,1.1,1);
      }
      h4{
          margin-top: 0.5em;
          color: #2f3238;
          margin-bottom: 0;
      }
      .item-drop{
        background: rgba(0,0,0,0.1);
          padding: 1em;
          min-height: 50px;
          vertical-align: middle;
          color: #7d443e;
          border-radius: 4px;
          position: relative;
      }

      .item-drop:after{
        position: absolute;
          top: 30%;
          left: 0;
          width: 100%;
          color: rgba(0,0,0,0.15);
          font-size: 2em;
          font-family: arial;
          pointer-events: none;
          content: "+";
          text-align: center;
      }
      .item-drop ::content .tags{
        background: #2f3238;
        color: #bdb0af;
        cursor: default;
      }
      .item-drop ::content .tags:hover{
        background: #7d413a;
      }

      .item-drop .tags i{
          position: absolute;
          right: 0;
          top: 0;
          background: rgba(0,0,0,0.5);
          margin-top: -0.1em;
          transition: all .2s linear;
          left: 0;
          text-align: center;
          opacity: 0;
      }
      .item-drop .tags:hover i{
          opacity: 1
      }
      .tags{
        cursor: move;
        padding: 0.5em 1em;
        display: inline-block;
        background: #2f3238;
        border-radius: 4px;
        color: #f1dbd9;
        margin-bottom: 0.2em;
        overflow: hidden;
        position: relative;
      }
      .tags:hover{
        background: #c38983;
      }
      .warning{
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        text-align: center;
        background: #fff;
        position: absolute;
        border-radius: 4px;
        padding-top: 24px;
        z-index: 999;
      }
    </style>
    <div class="item-holder" on-drop="drop" on-dragover="allowDrop" on-dragleave="dragLeave">
      <div class="item-drop">
        <template is="dom-repeat" items="{{itemGrp}}" as="tag" index-as="tagIndex">
          <span class="tags">[[ tag ]]<i><paper-icon-button icon="delete" on-tap="remove" index="{{index}}"></paper-icon-button></i></span>
        </template>
        <template is="dom-if" if="{{warning}}">
        <div class="warning">[[warning]]
          <paper-icon-button icon="close" on-tap="toggleWarning"></paper-icon-button>
        </div>
      </template>
      </div>

      <h4>[[ label ]]</h4>
      <p>Accept
      <template is="dom-if" if="[[accept]]">only [[accept]]</template>
      <template is="dom-if" if="[[!accept]]">all types</template>
      </p>
    </div>
`;
  }

  static get is(){ return 'chart-input'}

  static get properties(){
    return{
      axis:{
        type:String
      },
      labelRdx:{
        type:String
        ,statePath(state){
          let chartPath = state.charts[this.parentNode.uuid]
          let key = this.axis
          let objAssignChk = (chartPath && chartPath.inputs[key])
          return objAssignChk ?chartPath.inputs[key].label:""
        }
      },
      label:{
        type:String
      },
      selectedValue:{
        type:Array,
        statePath(state){
          let chartPath = state.charts[this.parentNode.uuid]
          let key = this.axis
          let objAssignChk = (chartPath && chartPath.inputs[key])
          return objAssignChk ?chartPath.inputs[key].selectedValue:[]
        }
      },
      itemGrp:{
        type:Array,
        statePath(state){
          let chartPath = state.charts[this.parentNode.uuid]
          let key = this.axis
          let objAssignChk = (chartPath && chartPath.inputs[key])
          return objAssignChk ?chartPath.inputs[key].itemGrp:[]
        }
      },
      selectedObjs:{
        type:Array,
        statePath(state){
          let chartPath = state.charts[this.parentNode.uuid]
          let key = this.axis
          let objAssignChk = (chartPath && chartPath.inputs[key])
          return objAssignChk ?chartPath.inputs[key].selectedObjs:[]
        }
      },
      input:{
        type:Object,
        value:{},
        notify:true
      },
      max:{
        type:String,
        value:0
      },
      warning:{
        value:false
      },
      accept:{
        value:false
      },
      exclude:{
        type:Array,
        value:[]
      },
      compChartUUIDChk:{
        type:Boolean,
        statePath(state){
          let chartPath = state.charts[this.parentNode.uuid]
          let compChartUUIDChk = chartPath && chartPath.compChartUUIDChk
          return compChartUUIDChk
        }
      },
      axisKeys:{
        type:String,
        statePath(state){
          let chartPath = state.charts[this.parentNode.uuid]
          let keyChk = chartPath && Object.keys(chartPath.inputs).length
          return keyChk && Object.keys(chartPath.inputs)
        }
      },
      layoutAreaChk:{
        type:Boolean,
        statePath(state){
          let chartPath = state.charts[this.parentNode.uuid]
          let layoutAreaChk = chartPath && chartPath.layoutAreaChk
          return layoutAreaChk
        }
      }
    }
  }
  static get actions() {
    return {
      addUpdateInputs(input) {
        return {
          type: 'ADD_UPDATE_CHART_INPUTS',
          value: input
        };
      },
      removeInputs(removeInput) {
        return {
          type: 'REMOVE_CHART_INPUTS',
          value: removeInput
        };
      },
      splitAreaChk(layoutAreaChk) {
        return {
          type: 'COMPOSITE_SPLIT_AREA_CHK',
          value: layoutAreaChk
        }
      }
    }
  }
  static get observers(){
    return["_inputChange(input)","_transformAccept(accept)"]
  }
  constructor(){
    super();
  }
  connectedCallback(){
    super.connectedCallback()
  }
  axisKeysAvailability(action){
    let axisYKeyChk = this.axisKeys.length&&this.axisKeys.indexOf("y")!=-1
    let axisXKeyChk = this.axisKeys.length&&this.axisKeys.indexOf("x")!=-1
    let addKeyChk = axisYKeyChk&&axisXKeyChk

    let actionAdd = action=="add"&&addKeyChk&&this.axisKeys.length>=2
    let actionRemove = action=="remove"&&this.axisKeys.length<=2

    let actionChk= actionAdd?actionAdd:actionRemove

    if(this.compChartUUIDChk && actionChk){
      this.set("layoutAreaChk",!this.layoutAreaChk)
      this.dispatch("splitAreaChk", {uuid:this.parentNode.uuid,layoutAreaChk:this.layoutAreaChk})
    }
  }

  _transformAccept(item){
    if(item){
      this.set('_accepts',item.split(','));
    }
  }
  _inputChange(input){
    // debugger
    let key = Object.keys( input )
    if(input!== undefined && key.length!=0){
      let updatedInput = input[key]
      this.dispatch("addUpdateInputs", {uuid:this.parentNode.uuid,objKey:key,input:updatedInput})
    }

  }
  add(selectedObject,tagNodeVal) {
      this.push("selectedValue",tagNodeVal)
      this.push("selectedObjs",selectedObject)
      this.push("itemGrp",selectedObject.key)
      this.setInputObj()
      let action = "add"
      this.axisKeysAvailability(action)
  }
  remove(e) {
      this.splice('selectedValue', e.model.tagIndex, 1);
      this.splice('selectedObjs', e.model.tagIndex, 1);
      this.splice('itemGrp', e.model.tagIndex, 1);
      let key = this.axis
      let slctedValLength= this.input[this.axis]?this.input[this.axis].selectedValue.length:0
      slctedValLength==0 ? this.dispatch("removeInputs", {uuid:this.parentNode.uuid,objKey:key})
        : this.setInputObj()
      let action = "remove"
      this.axisKeysAvailability(action)
  }
  setInputObj(){
    let input = {}
    input[this.axis] = {
      axis:this.axis||"",
      selectedValue:this.selectedValue,
      selectedObjs:this.selectedObjs,
      label: this.label||"",
      itemGrp:this.itemGrp
    }
    this.set("input", input)
  }

  dragLeave(e){
    e.target.classList.remove('hover');
  }
  allowDrop(e){
    e.target.classList.add('hover');
    e.preventDefault();
  }
  drop(e){
    e.preventDefault();
    this.parentElement.$.inputItems.classList.remove('drag-active');
    var tagIndex = e.dataTransfer.getData('text');
    if(tagIndex){
      e.target.classList.remove('hover');
      this.addTag(tagIndex);
      e.dataTransfer.clearData('text');
    }
  }
  addTag(tagIndex){
      let tagNode = this.parentNode.externals[tagIndex];
      // add only accepted data types on input box
      if(this._accepts && (this._accepts.indexOf(tagNode.type.toLowerCase())==-1) ){
        this.set('warning','accept only '+this.accept);
        return false;
      }
      let tagNodeVal = tagNode.value;
      this.add(tagNode,tagNodeVal)
  }
  toggleWarning(){
    this.set('warning',false);
  }
  onLabelChange(){
    this.setInputObj()
    debugger
  }
}
customElements.define(ChartInput.is,ChartInput)
