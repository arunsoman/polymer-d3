Polymer({
  is: 'crossfilter-backend',
  properties: {
    // url to connect to backend query executer
    crossfilterExternal: {
      type: String,
    }
  },

  // returns a promise for the fired query
  processData: function(query) {
    let ironAjax = this.querySelector('#cf-backend-ajax');
    ironAjax.body = query;
    ironAjax.generateRequest();
    return ironAjax.lastRequest.completes;
  }
});
