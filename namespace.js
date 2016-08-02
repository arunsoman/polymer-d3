var PolymerD3 = {};

PolymerD3.utilities = {};

PolymerD3.utilities.merge = function(from, to) {
  var me = this;
  this[to].forEach(function (t) {
    me.push(from, t);
  });
}
