import '../display-component/base-chart.js';
import './layout-area.js';
import {Element} from "../node_modules/@polymer/polymer/polymer-element.js"

class layoutAreaMain extends ReduxMixinBehavior(Element){
  static get template() {
    return `
    <div id="layoutAreaContainer">
      <layout-area uuid="[[uuid]]" parent-id="[[parentId]]"></layout-area>
    </div>
`;
  }

  static get is(){
    return "layout-area-main"
  }
  static get properties(){
    return{
      uuid:{
        type:String
      },
      compChartReload:{
        type: Boolean,
        statePath(state){
          let chartIdChk = state.charts[this.uuid]
          let compChartReload = chartIdChk && chartIdChk.compChartReload
          return compChartReload
        },
        observer:"updateLayoutArea"
      }
    }
  }
  updateLayoutArea(){
    this.$.layoutAreaContainer.querySelector("layout-area").remove()
    let layoutArea = document.createElement("layout-area")
    layoutArea.set("uuid",this.uuid)
    layoutArea.set("parentId",this.parentId)
    this.$.layoutAreaContainer.appendChild(layoutArea)
  }
}
customElements.define(layoutAreaMain.is,layoutAreaMain)
