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

PolymerD3.utilities._formatNumber = function(n) {
  var result;
  n = Math.round(n);
  var abs = Math.abs(n);
  if (abs > 999) {
    result = Math.round(n/1000) + 'K';
  }
  if (abs > 1000000) {
    result = Math.round(n/1000000) + 'million';
  }
  if (abs > 10000000) {
    result = Math.round(n/10000000) * 10 + 'million';
  }
  if (abs > 1000000000) {
    result = Math.round(n/1000000000) * 100 + 'million';
  }
  return '$' + result;
};