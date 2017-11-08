var PolymerD3 = {};

PolymerD3.utilities = {};

// PolymerD3.utilities.merge = function(from, to) {
//     var me = this;
//     this[to].forEach(function(t) {
//         me.push(from, t);
//     });
// };

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
    // debugger
    // if (cb && dynamicEl[cb]) {
    //     var callBack = dynamicEl[cb];
    //     callBack.call(dynamicEl);
    // }

    return dynamicEl;

};

// Parses changed Object from Array, works with deep obeservers
// Assumes arr is the array
// PolymerD3.utilities.parsePath = function(path, arr) {
//     var index = path.split('.');
//     if (index.length > 1) {
//         index = index[1].slice(1);
//         return arr[index];
//     }
// };

// PolymerD3.utilities._setProperty = function(arr, key) {
//     if (arguments.length < 1) {
//         return;
//     }
//     var newVal = arguments[1];
//     this[arr].forEach(function(elem) {
//         if (elem.input === key) {
//             for (var newKey in newVal) {
//                 elem[newKey] = newVal[newKey];
//             }
//         }
//     });
// };

// PolymerD3.utilities._getProperty = function(arr, key) {
//     var result;
//     this[arr].forEach(function(elem) {
//         if (elem.input === key) {
//             result = elem;
//         }
//     });
//     return result;
// };

// Utility to create event notifying dataMutation
// Can be removed
// PolymerD3.utilities.dataMutationEvent = function(data) {
//     var params = {
//         bubbles: true,
//         cancelable: true,
//         detail: data
//     };
//     return new CustomEvent('dataMutated', params);
// };
// PolymerD3.utilities.dataMutationParam = function(path, data, callBack) {
//     return {
//         data: data,
//         path: path,
//         callback: callBack
//     };
// };

// PolymerD3.fileReader = function(name, numberIndexArray, dateIndexArray, dateParser, callback, header) {
//     let arryadata = [];
//     let me = this;
//     d3.text(name, (error, text) => {
//         d3.csv.parseRows(text, (aline, ind) => {
//             if (ind == 0 && header === true) {
//                 arryadata.push(aline);
//             } else {
//                 numberIndexArray.forEach(token => {
//                     aline[token] = +aline[token];
//                 });
//                 dateIndexArray.forEach(token => {
//                     let tmp = aline[token];
//                     aline[token]  = d3.time.format(dateParser).parse(aline[token]);
//                     // d3.parse not parsing date properly for _area.csv
//                     if (!aline[token]) {
//                         aline[token] = new Date(tmp);
//                     }
//                 });
//                 arryadata.push(aline);
//             }
//         });
//         // callback((header)? arryadata.splice(1):arryadata);
//         callback.call(me,arryadata);
//     });
// };

// PolymerD3.axis = function(type, bound, range) {

//     var map = {
//         'number': d3.scale.linear(),
//         'time': d3.time.scale(),
//         'currency': d3.scale.linear(),
//         'percent': d3.scale.linear(),
//         'category': d3.scale.ordinal()
//     };

//     var formaterMap = {
//         'time': {
//             'Tabbrweekday': '%a ',
//             'Tabbrmonth': '%b '
//         },
//         'category': '',
//         'number': '.2s',
//         'currency': '$.2s',
//         'percent': '.0%'
//     };

//     var scale  = map[type];
//     var axis = d3.svg.axis();
//     if(range){
//         scale.range(range);
//     }

//     if (bound) {
//         scale.domain(bound);

//         if (d3.timeYear.count(bound[0], bound[1]) < 10) {
//             if (d3.timeMonth.count(bound[0], bound[1]) < 10) {
//                 if (d3.timeWeek.count(bound[0], bound[1]) < 10) {
//                     //todo
//                     if (d3.timeDay.count(bound[0], bound[1]) < 10) {
//                         if (d3.timeHour.count(bound[0], bound[1]) < 240)  {
//                           if (((d3.time.format('%H:%M')(bound[0])) === '00:00') && ((d3.time.format('%H:%M')(bound[1])) === '00:00')) {
//                               axis.tickFormat(d3.time.format('%d-%b'));
//                             } else{
//                               axis.tickFormat(d3.time.format('%a-%I-%M'));
//                             }
//                         } else {
//                           axis.tickFormat(d3.time.format('%d-%b'));
//                         }
//                      } else {
//                         axis.tickFormat(d3.time.format('%d-%b'));
//                      }
//                    // axis.tickFormat(d3.time.format('%d-%b'));
//                 }
//             } else {
//                 axis.tickFormat(d3.time.format('%a-%b'));
//             }
//         } else {
//             axis.tickFormat(d3.time.format('%b-%Y'));
//         }
//     }
//     if (type === 'category')
//         axis.tickFormat(d3.format(formaterMap[type]));
//     axis.scale(scale);
//     return axis;
// };

// PolymerD3.setSvgArea = function(svg, width, height, margin){
//      svg.attr('width', width + margin.left + margin.right)
//     .attr('height', height + margin.top + margin.bottom)
//     //There is a small problem with this, some charts don't just append a <g> directly to <svg>
//     .append('g')
//     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//     return svg;
// };

PolymerD3.utilities.getUUID = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

// PolymerD3.utilities.clone = function(obj) {
//     var clone;
//     if (obj) {
//         clone = JSON.stringify(obj);
//         clone = JSON.parse(clone);
//     }
//     return clone;
// };
// PolymerD3.summarizeData = (data, xIndex, xFormat, yIndices, yFormat, stack, measure) => {
//     var Xdomain = [];
//     var Ydomain;
//     var stacked;

//     var xSet = d3.set();

//     var findMinMax = function() {
//         var whenNotOrdinal = function(){
//             var priYMin;
//             var priYMax;
//             var priXMin;
//             var priXMax;
//             data.forEach((aRow, i) => {
//                 if(i == 0){
//                     priYMax = priYMin = aRow[yIndices[0]];
//                     priXMax = priXMin = aRow[xIndex];
//                 }
//                 else{
//                     if(aRow[yIndices[0]] < priYMin){
//                         priYMin = aRow[yIndices[0]] ;
//                     }
//                     if(aRow[yIndices[0]] > priYMax){
//                         priYMax = aRow[yIndices[0]] ;
//                     }
//                     if(aRow[xIndex] < priXMin){
//                         priXMin = aRow[xIndex] ;
//                     }
//                     if(aRow[xIndex] > priXMax){
//                         priXMax = aRow[xIndex] ;
//                     }
//                 }
//             });
//             Xdomain= [priXMin, priXMax];
//             Ydomain= [priYMin, priYMax];
//         };
//         var whenOrdinal = function(){
//             var priYMin;
//             var priYMax;
//             var setX = d3.set();
//             data.forEach((aRow, i) => {
//                 if(i == 0){
//                     priYMax = priYMin = aRow[yIndices[0]];
//                     setX.add(aRow[xIndex]);
//                 }
//                 else{
//                     if(aRow[yIndices[0]] < priYMin){
//                         priYMin = aRow[yIndices[0]] ;
//                     }
//                     if(aRow[yIndices[0]] > priYMax){
//                         priYMax = aRow[yIndices[0]] ;
//                     }
//                     // Todo optimize
//                     setX.add(aRow[xIndex]);
//                 }
//             });
//             Xdomain= setX.values();
//             Ydomain= [priYMin, priYMax];
//         };
//         if(xFormat === 'ordinal'){
//             whenOrdinal();
//         }else{
//             whenNotOrdinal();
//         }
//     };
//     var findStackedMinMax = (data) => {
//         var layerArray = [];
//         var converter = (arg) => {
//             var convertDate = function(strDate){
//                 return new Date(strDate);
//             };
//             var convertNum = function(num) {
//                 return +num;
//             };
//             var convertStr = function(str) {
//                 return str;
//             };
//             if (arg instanceof Date) {
//                 return convertDate;
//             } else if (typeof arg === 'number') {
//                 return convertNum;
//             } else {
//                 return convertStr;
//             }
//         };
//         var convert = converter(data[0][xIndex]);
//         // group by key.
//         var layers = d3.nest()
//             .key(function(d) {
//                 return d[xIndex];
//             })
//             .entries(data)
//             .map((d) => {
//                var r = [convert(d.key)];
//                d.values.forEach(v => {
//                  r.push(v[yIndices[0]])
//                })
//                return r;
//            });
//         stackFromMultiColoumn(layers, [1, 2, 3], 0);
//         // stackFromMultiColoumn(layerArray, new params);
//     };

//     var stackFromMultiColoumn = (data, newYIndices, newXIndex) => {
//         var layers = [];
//         if (!newYIndices) {
//             newYIndices = yIndices;
//         }
//         if (newXIndex === undefined || newXIndex === null) {
//             newXIndex = xIndex;
//         }
//         if (xFormat === 'ordinal') {
//             // yIndices = [0,1,2,3];
//             newYIndices.forEach(function (aCatIndex) {
//                 var catArray = [];
//                 data.forEach(function (datum) {
//                     catArray.push([datum[newXIndex], datum[aCatIndex]]);
//                     // Todo: Optimize
//                 });
//                 layers.push(catArray);
//             });
//             stacked = d3.layout.stack().y((d)=>{return d[1]})(layers);

//             var topS = stacked[stacked.length-1];
//             Ydomain = d3.extent(topS, (d) => {return (d.y + d.y0)})
//             Xdomain = topS.map(t => {return t[newXIndex]})
//         } else {
//             newYIndices.forEach(function (aCatIndex) {
//                 var catArray = [];
//                 data.forEach(function (datum) {
//                     catArray.push([datum[newXIndex], datum[aCatIndex]]);
//                 });
//                 layers.push(catArray);
//             });
//             stacked = d3.layout.stack().y((d)=>{return d[1]})(layers);

//             var topS = stacked[stacked.length-1];
//             Ydomain = d3.extent(topS, (d) => {return (d.y + d.y0)})
//             Xdomain = d3.extent(topS, (d) => {return d[0];} );
//         }
//     };
//     var groupFromMultiColoumn = (data) => {
//         Ymax = d3.max(data, function (aRow) {
//             return d3.max(aRow.filter(function (value, index) {
//                 return yIndices.includes(index);
//             }));
//         });
//         Ymin = d3.min(data, function (aRow) {
//             return d3.min(aRow.filter(function (value, index) {
//                 return yIndices.includes(index);
//             }));
//         });
//         if (xFormat === 'ordinal') {
//             data.forEach(function(datum) {
//                 xSet.add(datum[xIndex]);
//             });
//             Xdomain = xSet.values();
//         } else {
//             Xmax = d3.max(data, function (aRow) {
//                 return d3.max(aRow.filter(function (value, index) {
//                     return index == xIndex;
//                 }));
//             });
//             Xmin = d3.min(data, function (aRow) {
//                 return d3.min(aRow.filter(function (value, index) {
//                     return index == xIndex;
//                 }));
//             });
//             Xdomain = [Xmin, Xmax];
//         }
//         Ydomain = [Ymin, Ymax];
//     }
//     if(yIndices.length == 1){
//         var handler = (stack) ? findStackedMinMax : findMinMax;
//         handler(data);
//     }
//     else if (yIndices.length > 1){
//         var handler = (stack) ? stackFromMultiColoumn : groupFromMultiColoumn;
//         handler(data);
//     }
//     else{
//         throw new Error("invalid entry in yIndices" + yIndices);
//     }
//     // findYDomain(dataSummary, yFormat);

//     console.log("xDom:" + Xdomain + " yDom:" + Ydomain);
//     return {
//         'getStack': ()=>{
//             return stacked;
//         },
//         'getXDomain': () => {
//             return Xdomain
//         },
//         'getYDomain': () => {
//             return Ydomain
//         }
//     };
// };

/*PolymerD3.rollup = (data, groupby, handler) =>{
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
};*/

// PolymerD3.utilities.searchArr = function(arr, matchFn) {
//     return arr.reduce((accum, elem) => {
//         if (matchFn(elem)) {
//             return elem;
//         } else {
//             // just some FP craziness
//             // http://stackoverflow.com/a/30042948
//             // http://redux.js.org/docs/recipes/UsingObjectSpreadOperator.html
//             return Object.assign({}, accum);
//         }
//     }, {});;
// }

// compares and merges arays
// example:
// a => [1, 2, 3]; b => [2, 3, 5];
// comparison() => (if b[i] not in a, return true);
// f(a, b, comparison) = [1, 2, 3, 5]
// PolymerD3.utilities.compareAndMerge = function(from, to, comparison) {
//     let merged = to.reduce((accum, elem) => {
//         let _temp;
//         if (comparison(elem)){
//             _temp = [elem];
//         } else {
//             _temp = [];
//         }
//         // avoiding mutations with concat, slice and spreaf
//         // https://egghead.io/lessons/javascript-redux-avoiding-array-mutations-with-concat-slice-and-spread
//         return accum.concat(_temp);
//     }, []);

//     return from.concat(merged);
// }

// 'mutates' the object statisying 'condition' in the array of a objects 'arr'
// PolymerD3.utilities.mutateObjInArr = function(arr, condition, mutation) {
//     var newArr = arr.map(elem => {
//         if (condition(elem)) {
//             return mutation(elem);
//         }
//         return elem;
//     });
//     return newArr;
// }

// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
// polyfill for math.trunc
// PolymerD3.utilities.truncateFloat = Math.trunc || function(x) {
//     if (isNaN(x)) {
//       return NaN;
//     }
//     if (x > 0) {
//       return Math.floor(x);
//     }
//     return Math.ceil(x);
// };
