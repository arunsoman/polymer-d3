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
    var type={
      'Tabbrweekday': '%a ',
      'Tabbrmonth': '%b ',

      'number':'.2s',
      'currency':'$.2s',
      'percent':'.0%'
    };
    if(dataType.startsWith('T')){
      //d3.time.format('%a')(d3.time.format("%B %d, %Y").parse("June 30, 2015"));
       if(arguments.length < 2){
          return function(input){
            return d3.time.format(type[dataType])(input);
            }  
        }
        else{
          return function(input){
            return d3.time.format(type[dataType])(d3.time.format(parser).parse(input));
          }
        }
    }
    
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

PolymerD3.dateUtil = function(d1, d2) {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return {
        getDays: function() {
            return Math.round(Math.abs((d1.getTime() - d2.getTime()) / (oneDay)));
        },
        getMonths: function() {
            return getDays() / 12;
        },
        getYears: function() {
            return getDays() / 366;
        }
    };
}
PolymerD3.fileReader = function(name, numberIndexArray, dateIndexArray, dateParser) {
    var arryadata = [];
    d3.csv(name, function(error, data) {
        
        data.forEach(function(d) {
            var row = [];
            for (var key in d) {
                row.push(d[key]);
            }
            numberIndexArray.forEach(function(n) {
                row[n] = +row[n];
            });
            dateIndexArray.forEach(function(n) {
                row[n] = d3.time.format(dateParser).parse(row[n])
            });
            arryadata.push(row);
        });
    });
    return function(){
      return arryadata;;
    };
}
PolymerD3.axis = function(type, formater){
  var map = {
    'number':  d3.scale.linear(),
    'time':  d3.time.scale(),
    'currency': d3.scale.linear(),
    'percent': d3.scale.linear(),
    'category': d3.scale.ordinal()
  };

  var formaterMap ={
    'time': {
        'Tabbrweekday': '%a ',
        'Tabbrmonth': '%b '},
    'category':'',
    'number': '.2s',
    'currency': '$.2s',
    'percent':'.0%'
  };

  var axis = d3.svg.axis().scale(map[type]);
  if(formater){
    var ff = formaterMap['time'][formater];
    if(ff){
      axis.tickFormat(d3.time.format(ff));      
    }
  }
  else{
    if(type !== 'category')
      axis.tickFormat(d3.format(formaterMap[type]));
  }
  return axis;
}