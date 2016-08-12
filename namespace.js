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

PolymerD3.fileReader = function(name, numberIndexArray, dateIndexArray, dateParser, callback, header) {
    var arryadata = [];
    d3.csv(name, function(error, data) {

        data.forEach(function(d, i) {
            if(header &&  i == 0)
                return;
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
        callback(arryadata);
    });
};

PolymerD3.axis = function(type, bound, range) {

    var map = {
        'number': d3.scale.linear(),
        'time': d3.time.scale(),
        'currency': d3.scale.linear(),
        'percent': d3.scale.linear(),
        'category': d3.scale.ordinal()
    };

    var formaterMap = {
        'time': {
            'Tabbrweekday': '%a ',
            'Tabbrmonth': '%b '
        },
        'category': '',
        'number': '.2s',
        'currency': '$.2s',
        'percent': '.0%'
    };

    var scale  = map[type];
    var axis = d3.svg.axis();
    if(range){
        scale.range(range);
    }
    
    if (bound) {
        scale.domain(bound);

        if (d3.timeYear.count(bound[0], bound[1]) < 10) {
            if (d3.timeMonth.count(bound[0], bound[1]) < 10) {
                if (d3.timeWeek.count(bound[0], bound[1]) < 10) {
                    //todo
                    if (d3.timeDay.count(bound[0], bound[1]) < 10) {
                        if (d3.timeHour.count(bound[0], bound[1]) < 240)  {
                          if (((d3.time.format('%H:%M')(bound[0])) === '00:00') && ((d3.time.format('%H:%M')(bound[1])) === '00:00')) {
                              axis.tickFormat(d3.time.format('%d-%b'));
                            } else{
                              axis.tickFormat(d3.time.format('%a-%I-%M'));
                            }
                        } else {
                          axis.tickFormat(d3.time.format('%d-%b'));
                        }
                     } else {
                        axis.tickFormat(d3.time.format('%d-%b'));
                     }
                   // axis.tickFormat(d3.time.format('%d-%b'));
                }
            } else {
                axis.tickFormat(d3.time.format('%a-%b'));
            }
        } else {
            axis.tickFormat(d3.time.format('%b-%Y'));
        }
    }
    if (type === 'category')
        axis.tickFormat(d3.format(formaterMap[type]));
    axis.scale(scale);
    return axis;
};

PolymerD3.setSvgArea = function(svg, width, height, margin){
     svg.attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    //There is a small problem with this, some charts don't just append a <g> directly to <svg>
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    return svg;
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

PolymerD3.utilities.clone = function(obj) {
    var clone;
    if (obj) {
        clone = JSON.stringify(obj);
        clone = JSON.parse(clone);
    }
    return clone;
}
