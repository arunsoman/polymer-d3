import '../behaviors/redux-mixins-behavior.js';
import {Element} from "../node_modules/@polymer/polymer/polymer-element.js";

class polymerd3Table extends ReduxMixinBehavior(Element){
  static get template() {
    return `
    <style>
      :host {
        border: 1px solid #ccc;
        display: block;
        margin: 10px;
      }
      table {
        width:100%;
        table-layout: fixed;
      }
      .tbl-header {
        background-color: rgba(255,255,255,0.3);
      }
      .tbl-content {
        height:300px;
        overflow-x: auto;
        margin-top: 0px;
        border: 1px solid rgba(255,255,255,0.3);
      }
      th {
        padding: 20px 15px;
        text-align: left;
        font-weight: 500;
        font-size: 12px;
        color: black;
        text-transform: uppercase;
      }
      td {
        padding: 15px;
        text-align: left;
        vertical-align: middle;
        font-weight: 300;
        font-size: 12px;
        color: black;
        border-bottom: solid 1px rgba(255,255,255,0.1);
      }
      .content-table {
        overflow-y: auto;
        max-height: 400px;
      }
      .content-table table {
        border-spacing: 0;
      }
      .content-table td{
        overflow: hidden;
      }
      .content-table thead {
        display: none;
      }
      .content-table tr:nth-child(odd) {
        background-color: #ededed;
      }
    </style>
    <table>
      <thead>
        <tr>
          <template is="dom-repeat" items="{{externals}}" as="column">
            <th>{{column.key}}</th>
          </template>
        </tr>
      </thead>
    </table>
    <div class="content-table">
      <table>
        <thead>
          <tr>
            <template is="dom-repeat" items="{{externals}}" as="column">
              <th>{{column.key}}</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <template is="dom-repeat" items="{{source}}" as="row">
            <tr>
              <template is="dom-repeat" items="{{row}}">
                <td>{{item}}</td>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
`;
  }

  static get is(){return 'polymerd3-table'}
  static get properties(){
    return{
      source:{
        type:Array,
        statePath(state){
          return state.data[this.parentId].source;
        }
      },
      externals:{
        type:Array,
        statePath(state){
          return state.data[this.parentId].externals;
        }
      }
    }
  }
}
window.customElements.define(polymerd3Table.is,polymerd3Table)
