var group_by = (indices, xIndex, yIndex, headers) => {
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
            }
        };
    };
    var _group_by_cols = () => {
        var groups = [];
        var map = d3.map();
        var xInd = xIndex[0];
        return {
            process: (aRow) => {
                indices.forEach((i)=>{
                    var groupName = headers[i];
                    var aGroup = map.get(groupName);
                    if(!aGroup){
                        aGroup = {key:groupName, values:[]};
                    }
                    aGroup.values.push([aRow[xInd], aRow[i]]);
                    groups.push(aGroup);
                    map.set(groupName, aGroup);
                });
            },
            getGroups: () => {
                return groups;
            }
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