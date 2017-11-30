import {baseChart} from '../display-component/base-chart.js';
import './layout-area-main.js';

class compositeCanvas extends baseChart{
  static get template() {
    return `
    <style>
    </style>
    <layout-area-main uuid="[[uuid]]" parent-id="[[parentId]]"></layout-area-main>
`;
  }

  static get is(){
    return "composite-canvas"
  }
  static get properties(){
    return{
      isCompsiteChart:{
        type:Boolean,
        statePath(state){
          let chartPath = state.charts
          let isCompsiteChart = chartPath && chartPath.isCompsiteChart
          return isCompsiteChart
        }
      }
    }
  }
  static get actions() {
    return {

    }
  }
  connectedCallback(){
    super.connectedCallback()
    this.dispatch("isCompsiteChart", {uuid:this.uuid,isCompsiteChart:true})
  }
}
customElements.define(compositeCanvas.is,compositeCanvas)
