module.exports = {
    port: 27000,
    notify: false,
    logPrefix: 'P-D3',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    files: ['**/*.js', '**/*.html'],
    server: {
      baseDir: ['']
    }
};
