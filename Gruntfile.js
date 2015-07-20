module.exports = function(grunt) {

  var jsFiles = ['src/players/player.js', 'src/players/expert-ai.js', 'src/players/human-player.js', 'src/model/board.js', 'src/model/game.js', 'src/view/view-config.js', 'src/view/board-view.js', 'src/view/choice-view.js', 'src/view/result-view.js', 'src/index.js', 'src/router.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: jsFiles,
        dest: 'public/js/build.js',
      },
    },
    uglify: {
      my_target: {
        files: {
          'public/js/build.min.js': ['public/js/build.js']
        }
      }
    },
    clean: ['public/js/build.js'],
    watch: {
      files: jsFiles,
      tasks: ['default']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat']);
  grunt.registerTask('c', ['concat']);
  grunt.registerTask('production', ['concat', 'uglify', 'clean']);
};