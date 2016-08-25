var group_by = (indices, xIndex, yIndex) => {
    var _group_by_col = () => {
        var group = [];
        var map = d3.map();
        var datumIndex = indices[0];
        return {
            process: (aRow) => {
                var key = aRow[datumIndex];
                var aGroup = map.get(key);
                if (!aGroup) {
                    aGroup = {
                        key: null,
                        values: []
                    };
                    group.push(aGroup);
                    map.set(key, aGroup);
                }
                aGroup.key = aRow[indices[0]];
                aGroup.values.push([aRow[xIndex], aRow[yIndex]]);
            },
            getGroups: () => {
                return group;
            }
        };
    };
    var _group_by_cols = () => {
        var group = [];
        var map = d3.map();
        var datumIndex = indices[0];
        return {
            process: (aRow) => {
                //TODO
            },
            getGroups: () => {
                return group;
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