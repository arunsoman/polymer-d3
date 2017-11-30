var PolymerD3 = {};

PolymerD3.utilities = {};

PolymerD3.utilities.isEmptyObject = function(obj) {
    return obj.constructor === Object && Object.keys(obj).length === 0;
};

// Creates and attaches a dom node inside specific container and executes a meathod inside it
PolymerD3.utilities.attachElement = function(elem, container,uuid,icon) {
    var dynamicEl = document.createElement(elem);
    dynamicEl.parentId = uuid;
    dynamicEl.icon = icon;
    var containerElem = this.root.querySelector(container);
    if (containerElem) {
        containerElem.appendChild(dynamicEl);
    } else {
        this.appendChild(dynamicEl);
    }
    return dynamicEl;

};

PolymerD3.utilities.getUUID = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};