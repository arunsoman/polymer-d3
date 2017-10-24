"use strict";

class crossfilterFrontend extends Polymer.Element{
  static get is(){
    return 'crossfilter-frontend'
  }

  processData(filter, dimension) {
    return new Promise(function(resolve, reject) {
      try {
        resolve(dimension.filter(filter).top(Infinity));
      } catch (e) {
        reject(e);
      }
    });
  }

}

customElements.define(crossfilterFrontend.is, crossfilterFrontend)


/*Polymer({
  is: 'crossfilter-frontend',
  // returns a promise to be uniform with crossfilterbackend
  processData: function(filter, dimension) {
    return new Promise(function(resolve, reject) {
      try {
        resolve(dimension.filter(filter).top(Infinity));
      } catch (e) {
        reject(e);
      }
    });
  }
});*/
