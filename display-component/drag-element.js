import {Element} from "../node_modules/@polymer/polymer/polymer-element.js";

class dragElement extends Element {
  static get template() {
    return `
  <style>
  .tags{
    cursor: move;
    padding: 0.5em 1em 0;
    display: inline-block;
    background: #45c1e0;
    border-radius: 4px;
    color: #fff;
    margin-bottom: 0.2em;
    overflow: hidden;
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.07);
    position: relative;
    font-size: 1em;
    font-weight: bold;
  }
  .tags:hover{
    background: #028fa0;
    color: #fff;
  }
  .tags small {
      font-size: 0.8em;
    display: block;
    color: #c0effb;
  }
  .tags:hover small {
    color: #fff;
  }
  </style>
    <span class="tags">
      [[ item.key ]]
      <small>[[ item.type ]]</small>
    </span>
`;
  }

  static get is() {
      return 'drag-element';
  }
  constructor() {
      super();
  }
  connectedCallback(){
    this.addEventListener("dragstart",this.drag.bind(this))
    super.connectedCallback()
  }
  drag(e){
      if(!e.target.dataset) return;
      if(this.parentNode.nextElementSibling.id==="inputItems")
        this.parentElement.nextElementSibling.classList.add('drag-active');
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text",e.target.dataset.index);
  }
}
customElements.define(dragElement.is, dragElement)
