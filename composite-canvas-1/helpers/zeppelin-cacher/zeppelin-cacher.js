"use strict";

class zeppelinCacher extends Polymer.Element{
  static get is(){
    return 'zeppelin-cacher'
  }
  static get properties(){
    return{
      crossfilterApi: {
        type: String
      },
      threshold: {
        type: Number,
        default: 1000
      }
    }
  }
}

customElements.define(zeppelinCacher.is, zeppelinCacher)


/*
Polymer({
  is: 'zeppelin-cacher',
  properties: {
    crossfilterApi: {
      type: String
    },
    threshold: {
      type: Number,
      default: 1000
    }
  }
});
*/
