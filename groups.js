var group_by = (indices, xIndex, yIndex, headers) => {
    var _stack = (groups) =>{
        var stackl = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d.values;
            })
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            });
      return stackl(groups);
    };
    var _group_by_col = () => {
        var group = [];
        var map = d3.map();
        var datumIndex = indices[0];
        return {
            process: (aRow) => {
                var groupName = aRow[datumIndex];
                var aGroup = map.get(groupName);
                if (!aGroup) {
                    aGroup = {
                        key: groupName,
                        values: []
                    };
                    group.push(aGroup);
                    map.set(groupName, aGroup);
                }
                aGroup.values.push([aRow[xIndex], aRow[yIndex]]);
            },
            getGroups: () => {
                return group;
            },
            getStack: () =>{return _stack(group);}
        };
    };
    var _group_by_cols = () => {
        var groups = [];
        var map = d3.map();
        return {
            process: (aRow) => {
                indices.forEach((i)=>{
                    var groupName = headers[i];
                    var aGroup = map.get(groupName);
                    if(!aGroup){
                        console.log(" no group:" + groupName);
                        aGroup = {key:groupName, values:[]};
                        groups.push(aGroup);
                    }
                    aGroup.values.push([aRow[xIndex], aRow[i]]);
                    map.set(groupName, aGroup);
                });
            },
            getGroups: () => {
                return groups;
            },
            getStack: () =>{return _stack(groups);}
        };
    };
    if (!indices) {
        throw new Error('indices argument mandatory');
    }
    if (indices.length == 1) {
        return _group_by_col();
    }else{
      return _group_by_cols();
    }
};