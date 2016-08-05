var PolymerD3 = {};

PolymerD3.utilities = {};

PolymerD3.utilities.merge = function(from, to) {
  var me = this;
  this[to].forEach(function(t) {
    me.push(from, t);
  });
};

PolymerD3.utilities._setProperty = function(arr, key) {
  if (arguments.length < 1) {
    return;
  }
  var newVal = arguments[1];
  this[arr].forEach(function(elem) {
    if (elem.input === key) {
      for (var newKey in newVal) {
        elem[newKey] = newVal[newKey];
      }
    }
  });
};

PolymerD3.utilities._getProperty = function(arr, key) {
  var result;
  this[arr].forEach(function(elem) {
    if (elem.input === key) {
      result = elem;
    }
  });
  return result;
};

PolymerD3.utilities._formater = function(dataType, parser){
    if(dataType === 'datetime'){
        return d3.time.format(parser).parse;
    }
    var type={
      'number':'.2s',
      'currency':'$.2s',
      'percent':'.0%'
    };
    return d3.format(type[dataType]);
};
PolymerD3.utilities._formatNumber = function(n) {
  return d3.format(".2s")(n);
};

PolymerD3.utilities._formatCurrency = function(n) {
  return d3.format("$.2s")(n);
};

PolymerD3.utilities._formatPercent = function(n) {
  return d3.format(".0%")(n);
};