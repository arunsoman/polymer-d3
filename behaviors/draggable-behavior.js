PolymerD3.draggableBehavior = {
  _generateIcon: function(type) {
    switch(type.toLowerCase()) {
      case 'number':
        return 'chart:number-data';
      case 'currency':
        return 'editor:attach-money';
      case 'percent':
        return 'chart:perm-scan-wifi';
      case 'string':
        return 'chart:text-data';
      case 'date':
        return 'chart:date-data';
    }
  }
};
