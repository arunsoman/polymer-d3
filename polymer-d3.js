import {Element} from "./node_modules/@polymer/polymer/polymer-element.js";
import './behaviors/redux-mixins-behavior.js';
import './polymer-d3-imports.js';

class polymerD3 extends ReduxMixinBehavior(Element) {
  static get template() {
    return `
<style>
  :host{
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  };
</style>
  <chart-holder settings-visible paragraph-id="[[paragraphId]]" activate-import></chart-holder>
`;
  }

  static get is(){return 'polymer-d3'}
  static get properties(){
    return{
      source:{
        type:Object,
        value:true,
        observer:'addStore'
      },
      paragraphId:{
        type:String,
        value:0
      },
      file:{
        observer:'transformData'
      },
      importFile:{
        type:Boolean,
        value:false,
        observer:'addSettings'
      },
      filterData:{
        type:Array,
        statePath(state){
          let dataChk = state.data[this.paragraphId]
          let exportFilterData = dataChk && dataChk.exportFilterData
          return exportFilterData
        },
        notify: true
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
      },
      addCommonSettings(settings){
        return{
          type:'ADD_COMMON_SETTINGS',
          value:settings
        }
      }
    }
  }
  addSettings(){
    this.dispatch('addCommonSettings',{id:this.paragraphId,settings:{importFile:this.importFile}});
  }
  transformData(e) {
      var me = this;
      let sourceObj={
        source:[],
        externals:[]
      }
      // if (data) {
      var data = e.replace(/(".*)(,)(.*?")/g,'$1ˏ$3');
      var headerObj = [];
      var lines = data.split('\n');
      var result = [];
      var headers = lines[0].split(',');
      var firstRow = lines[1].split(',');

      headers.forEach(function(el, key) {
        var type = me.getDataType(firstRow[key]);
        headerObj.push({
          key: headers[key],
          value: key,
          type: type
        });
      });

      // me.set('externals', headerObj);

      // this.dispatch({type:'SET_EXTERNAL',payload:{id:this.paragraphId,externals:headerObj}});

      // lines.length - 1 is used because, last row is always just a '\n' with no data
      for (var i = 1; i < lines.length - 1; i++) {
        var obj = [];
        var currentline = lines[i].split(',');
        for (var j = 0; j < headers.length; j++) {
          var converted = me.convertData(currentline[j], headerObj[j].type);
          obj.push(converted);
        }

        result.push(obj);
      }
      sourceObj.externals = headerObj;
      sourceObj.source = result;
      this.set('source',sourceObj);
    }
  convertData(data, type) {
    var result;
    switch (type) {
      case 'Number':
        result = parseFloat(data);
        break;
      case 'Date':
        result = new Date(data);
        break;
      default:
        result = data;
    }
    return result;
  }
  getDataType(data) {
    var result = '';
    if (data.match(/^\d*\.?\d*$/g)) {
      result = 'Number';
    } else if (Date.parse(data)) {
      result = 'Date';
    } else {
      result = 'String';
    }
    return result;
  }
  /*
  add data to redux store, so that all available chart can subscribe to this data.
  */
  addStore(){
      this.dispatch("updateSource",{id:this.paragraphId,source:this.source.source || []})
      this.dispatch("updateExternal",{id:this.paragraphId,externals:this.source.externals || []})
  }
  constructor(){
    super();

  }

  // Bootstraps element as per mode(view/edit)
  // This meathod avoids crazy rwo-way binding side effects
  bootstrapCharts(config) {
    this.set('editMode', true);
  }
}

window.customElements.define(polymerD3.is,polymerD3)
