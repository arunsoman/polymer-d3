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
    d3.text(name, function(error, text) {
        d3.csv.parseRows(text, (aline, ind) =>{
            numberIndexArray.forEach((token) =>{
                aline[token] = +aline[token];
            });
            dateIndexArray.forEach((token) =>{
                aline[token]  = d3.time.format(dateParser).parse(aline[token]);
            });
            arryadata.push(aline);
        });
        callback((header)? arryadata.splice(1):arryadata);
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
};
PolymerD3.summarizeData = (data, xIndex, xFormat, yIndices, yFormat, stack, measure) => {
    var priMin = Number.MAX_VALUE;
    var priMax = Number.MIN_VALUE;
    findMinMax = function(groups) {
        var min, max, sum;
        groups.forEach((aGroup, i) => {
            var ds = aGroup.values.map((a)=>{return a[yIndices[0]];});
            var extent = d3.extent(ds);
            if(extent[0] < priMin){
                priMin = extent[0] ;
            }
            if(extent[1] > priMax){
                priMax = extent[1] ;
            }
        });
        return [min, sum];
    };
    findStackedMinMax = (groups) => {
        var min, max, sum;
        groups.forEach((aGroup, i) => {
            var ds = aGroup.values.map((a)=>{return a[yIndices[0]];});
            min = d3.min(ds);
            sum = d3.sum(ds);
            if(min < priMin){
                priMin = min ;
            }
            if(sum > priMax){
                priMax = sum ;
            }
        });
        return [min, sum];
    };
    findMinMaxMultiCol = function(aRow) {
        var temp = [];
        yIndices.forEach((d) =>{
            temp.push(aRow[0][d]);
        });
        var result = d3.extent(temp);
        if(result[0]< priMin){
            priMin = result[0];
        }else if(result[1]< priMax){
            priMax = result[1];
        } 
        return result;
    };
    findStackedMinMaxMultiCol = (aRow) => {
        var min, max, sum;
        yIndices.forEach((yd, i) => {
            if (i == 0) {
                min = aRow[0][yd];
                max = aRow[0][yd];
                sum = min;
            } else {
                var datum = aRow[0][yd];
                if (datum < min) {
                    min = datum;
                }
                sum += datum;
            }
        });
        if(min < priMin){
            priMin = min ;
        }else if(sum < priMax){
            priMax = sum ;
        }
        return [min, sum];
    };

    findXDomain = (array, format) => {
        switch (format) {
            case 'string':
                return d3.map(array, (d) => {
                    return d.key;
                });
            case 'time':
                return d3.extent(array, (d) => {
                    return new Date(d.key);
                });
            case 'number':
                return d3.extent(array, (d) => {
                    return +d.key;
                });
        }
    };
/*
    findYDomain = (array, format) => {
        return [
        d3.min(array, (q)=>{return q.values[0]}),
        d3.max(array, (q)=>{return q.values[1]})
        ];
    };
    */

    if(yIndices.length < 1){
        var handler = (stack) ? findStackedMinMaxMultiCol : findMinMaxMultiCol;
    }else {
        var dataSummary = d3.nest()
        .key((d) => {
            return d[xIndex];
        })
        .entries(data);
        (stack) ? findStackedMinMax(dataSummary) : findMinMax(dataSummary);
    }
    var Xdomain = findXDomain(dataSummary, xFormat);
    var Ydomain = [priMin, priMax];// findYDomain(dataSummary, yFormat);
    return {
        'getXDomain': () => {
            return Xdomain
        },
        'getYDomain': () => {
            return Ydomain
        }
        };
};

PolymerD3.rollup = (data, groupby, handler) =>{
    var dataSummary = d3.nest()
    .key((d) => {
        return d[groupby];
    })
    .rollup((aRow) => {
        handler(aRow);
    })
    .entries(data);
    return dataSummary;
};

PolymerD3.rollupMultiValued = (columns, columnHeaders, xId, data)=>{
    var multiValue = columns.map(function(id) {
        return {
            id: columnHeaders[id],
            values: data.map((d) => {
                return {'x': d[xId], 'y': d[id]};
            })
        };
    });
    return multiValue;
};