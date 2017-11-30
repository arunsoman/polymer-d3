import {Element} from "../node_modules/@polymer/polymer/polymer-element.js";

class resizerElement extends Element {
  static get template() {
    return `
    <style>
      .resizable{
        position: absolute;
        background: rgba(255, 236, 147, 0.32);
        cursor: nwse-resize;
        z-index: 1;
      }
      .resizable.resize-true{
        background: transparent;
        /*cursor: move;*/
      }
      .resizable.right{
        width: 10px;
        right: 0;
        top:0;
        bottom: 0;
        height: 100%!important;
        /*border-left: solid 1px #bbbab9;*/
      }
      .resizable.left{
       width: 10px;
       left: 0;
       top:0;
       bottom: 0;
       height: 100%!important;
       z-index: 9;
       cursor:e-resize;
       /*border-right: solid 1px #bbbab9;*/
     }
     .resizable.top{
       left: 0;
       top:0;
       right: 0;
       width: 100%!important;
       transform: rotateX(180deg);
       cursor:s-resize;
       /*border-top: solid 1px #bbbab9;*/
     }
     .resizable.bottom{
      left: 0;
      bottom: 0;
      right: 0;
      width: 100%!important;
      /*border-top: solid 1px #bbbab9;*/
    }
    .count-label{
      user-select:none;
      position: absolute;
      min-width: 30px;
    }
    #rsz {
      position: absolute;
      right: 0;
      width: 10px;
      height: 100%;
      background-color: rgba(255, 236, 147, 0.74);
      cursor: pointer;
    }
    .left .count-label{
      top: 50%;
      right: 0;
    }
    .right .count-label{
      top: 50%;
    }
    .top .count-label{
      position: relative;
      display: inline-block;
      transform: rotateX(180deg);
    }
    .bottom .count-label{
      position: relative;
      display: inline-block;
    }
    .right #rsz{
      right: auto;
      left: 0;

    }
    .top #rsz{
      position: relative;
      top: 0;
      width: 100%;
      height: 10px;
      text-align: center;
    }
    .bottom #rsz{
      top: 0;
      position: relative;
      width: 100%;
      height: 10px;
      text-align: center;
    }
    .width-info{
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      border-bottom: dotted 1px #ccc;
      text-align: center;
    }
    .width-info span{
      background: #fff;
      position: absolute;
      top: -9px;
      padding: 0 10px;
      margin-left: -31px;
    }
    .info{
      user-select:none;
    }
    .info span{
      background: #fff;
    }
    .height-info {
      position: absolute;
      right: 50%;
      top: 0;
      bottom: 0;
      border-left: dotted 1px #ccc;
    }
    .height-info span {
      top: 42%;
      position: absolute;
      left: -18px;
      min-width: 50px;
      padding: 10px 0;
    }
    .height-info span{
      margin-top: 30%;
    }
    /*#resizeHandler{
      position: absolute;
      right: 0;
      bottom: 0;
      width: 50px;
      height: 50px;
      background: red;
      display: none;
    }
    .resizable.resize-true #resizeHandler{
      display: block;
      cursor: move;
    }*/


  </style>
  <div class\$="resizable {{elementAlign}} resize-{{resizeBoth}}" style\$="width:{{wd}}px;height:{{ht}}px">
    <div id="resizeHandler"></div>
    <template is="dom-if" if="[[resizeBoth]]">
      <template is="dom-if" if="[[showInfo]]">
        <div class="width-info info"></div>
        <div class="height-info info"> <span><small><i>[[wd]] px * [[ht]] px</i></small></span></div>
      </template>
    </template>
    <template is="dom-if" if="[[!resizeBoth]]">
      <!-- <div id="rsz">
        <template is="dom-if" if="[[inputVal]]">
          <div class="count-label"><paper-input label="Margin Left" type="number" value="[[marginValue]]"></paper-input></div>
        </template>
        <template is="dom-if" if="[[!inputVal]]">
          <div class="count-label">[[marginRound]] %</div>
        </template>
      </div> -->
    </template>

  </div>
<!--     <div class="resizable top"></div>
    <div class="resizable right"></div>
    <div class="resizable bottom"></div>
  -->
`;
  }

  static get is() {
    return 'resizer-element'
  }

  static get properties() {
    return {
      position:{
        type:String,
        value:'left'
      },
      leftPos:{
        type:Number,
        value:0
      },
      topPos:{
        type:Number,
        value:0
      },
      x:{
        type:Number
      },
      y:{
        type:Number
      },
      dx:{
        type:Number,
        value:0
      },
      dy:{
        type:Number,
        value:0
      },
      mousedown:{
        type:Boolean,
        value:false
      },
      wd:{
        type:Number,
        value:10
      },
      ht:{
        type:Number,
        value:10
      },
      elementAlign:{
        type:String
      },
      elementWidth:{
        type:Number,
        notify:true
      },
      elementHeight:{
        type:Number,
        notify:true
      },
      marginValue:{
        type:Number,
        notify:true,
        observer:'marginPercentage'
      },
      resizeBoth:{
        type:Boolean,
        value:false
      },
      marginRound:{
        type:Number
      },
      inputVal:{
        type:Number,
        value:null
      },
      timer:{
        type:Number
      },
      reverseVertical:{
        type:Boolean,
        value:false
      },
      reverseHorizontal:{
        type:Boolean,
        value:false
      },
      resizeCallback:{
        type:Number,
        notify:true
      },
      mouseupCallback:{
        type:Number,
        notify:true
      },
      showInfo:{
        type:Boolean,
        value:false
      }
    }
  }
  marginPercentage(e){
    if(!this.resizeBoth){
      this.set('marginRound',this.marginValue.toFixed());
    }
  }
  mouseupCallbackFn() {
    this.set('mouseupCallback',Date.now());
    // added timeout rest for resier element to snap to the parent grid;
    if(this.resizeBoth){
      setTimeout(()=>{
        this.set('wd',this.elementWidth)
        this.set('ht',this.elementHeight)
      })
    }
  }
  resizeCallbackFn(){
    this.set('resizeCallback',Date.now());
  }
  constructor() {
    super();
  }
  startResize(event){
    this.x = event.screenX;
    this.y = event.screenY;
  }
  resize(evt){
    this.dx = evt.screenX - this.x;
    this.dy = evt.screenY - this.y;
    this.x = evt.screenX;
    this.y = evt.screenY;
    this.wd += this.reverseHorizontal ? this.dx * -1 : this.dx ;
    this.ht += this.reverseVertical ? this.dy*-1 : this.dy;
    if(this.resizeBoth){
      this.set('elementWidth',this.wd);
      this.set('elementHeight',this.ht);
    }else{
      this.set('marginValue',["left","right"].indexOf(this.elementAlign)!=-1 ? this.wd : this.ht);
    }
    this.resizeCallbackFn();
  }
  ready(){
    super.ready();
    if(this.inputVal){

    }else{
      this.resizeEvents();
    }
    if(this.resizeBoth){
      this.set('wd',parseInt(this.elementWidth));
      this.set('ht',parseInt(this.elementHeight));
    }
  }
  resizeEvents(){
    // let handlerItem = this.resizeBoth ? this.$.resizeHandler : this;
    this.addEventListener('mousedown',(event)=>{
      this.mousedown = true;
      this.startResize(event);
    });
    document.body.addEventListener('mouseup',(event)=>{
      if(this.mousedown) this.mouseupCallbackFn();
      this.mousedown = false;
    })
    document.body.addEventListener("mousemove",(evt)=>{
      this.mousedown && this.resize(event)
    },true);
  }
}
customElements.define(resizerElement.is, resizerElement)
