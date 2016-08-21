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
    
    var Xdomain;
    var Ydomain;
    var stacked;

    findMinMax = function() {
        whenNotOrdinal = function(){
            var priYMin;
            var priYMax;
            var priXMin;
            var priXMax;
            data.forEach((aRow, i) => {
                if(i == 0){
                    priYMax = priYMin = aRow[yIndices[0]];
                    priXMax = priXMin = aRow[xIndex];
                }
                else{
                    if(aRow[yIndices[0]] < priYMin){
                        priYMin = aRow[yIndices[0]] ;
                    }
                    if(aRow[yIndices[0]] > priYMax){
                        priYMax = aRow[yIndices[0]] ;
                    }
                    if(aRow[xIndex] < priXMin){
                        priXMin = aRow[xIndex] ;
                    }
                    if(aRow[xIndex] > priXMax){
                        priXMax = aRow[xIndex] ;
                    }
                }
            });
            Xdomain= [priXMin, priXMax];
            Ydomain= [priYMin, priYMax];
        };
        whenOrdinal = function(){
            var priYMin;
            var priYMax;
            var setX = d3.set();
            data.forEach((aRow, i) => {
                if(i == 0){
                    priYMax = priYMin = aRow[yIndices[0]];
                    setX.add(aRow[xIndex]);
                }
                else{
                    if(aRow[yIndices[0]] < priYMin){
                        priYMin = aRow[yIndices[0]] ;
                    }
                    if(aRow[yIndices[0]] > priYMax){
                        priYMax = aRow[yIndices[0]] ;
                    }
                    setX.add(aRow[xIndex]);
                }
            });
            Xdomain= setX.values();
            Ydomain= [priYMin, priYMax];
        };
        if(xFormat === 'string'){
            whenOrdinal();
        }else{
            whenNotOrdinal();
        }
    };
    findStackedMinMax = () => {
        var layers = d3.nest()
                    .key(function(d) { return d[measure]; })
                    //.rollup(function(aRow) { return [ aRow[xIndex], aRow[yIndices[0]] ] })
                    .entries(data);
        stacked = d3.layout.stack()
                    .y((d)=>{
                        return d[yIndices[0]]})
                    .values((d) => d.values)
                    (layers);
        var topS = stacked[stacked.length-1];
        Ydomain = d3.extent(topS.values, (d) => {
            return (d.y + d.y0)})
        Xdomain = d3.extent(topS.values, (d) => {
            return d[xIndex]; } )
    };

    if(yIndices.length == 1){
        var handler = (stack) ? findStackedMinMax : findMinMax;
        handler();
    }
    else if (yIndices.length > 1){
        if(stack) {
           var layers = [];
            yIndices.forEach(function (aCatIndex) {
                var catArray = [];
                data.forEach(function (datum) {
                    catArray.push([datum[xIndex], datum[aCatIndex]]);
                });
                layers.push(catArray);
            });
            stacked = d3.layout.stack().y((d)=>{return d[1]})(layers);

            var topS = stacked[stacked.length-1];
            Ydomain = d3.extent(topS, (d) => {return (d.y + d.y0)})
            Xdomain = d3.extent(topS, (d) => {return d[0];} );

            // For ordinal Xaxis
            if (xFormat === 'string') {
                Xdomain = data.map(d => {
                    return d[xIndex];
                });
            }

        } else{
             Ymax = d3.max(data, function (aRow) {
                return d3.max(aRow.filter(function (value, index) {
                    return yIndices.includes(index);
                }));
            });
            Ymin = d3.min(data, function (aRow) {
                return d3.min(aRow.filter(function (value, index) {
                    return yIndices.includes(index);
                }));
            });
            Xmax = d3.max(data, function (aRow) {
                return d3.max(aRow.filter(function (value, index) {
                    return index == xIndex;
                }));
            });
            Xmin = d3.min(data, function (aRow) {
                return d3.min(aRow.filter(function (value, index) {
                    return index == xIndex;
                }));
            });
            Ydomain = [Ymin, Ymax];
            Xdomain = [Xmin, Xmax];
        }
    }
    else{
        throw new Error("invalid entry in yIndices" + yIndices);
    }
    // findYDomain(dataSummary, yFormat);
    
    console.log("xDom:" + Xdomain + " yDom:" + Ydomain);
    return {
        'getStack': ()=>{
            return stacked;
        },
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