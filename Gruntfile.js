module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/* okfoc.us 2016 */\n'
      },
      index: {
        src: 'assets/app.concat.js',
        dest: 'assets/app.min.js'
      }
    },

    clean: {
      release: [
        "assets/app.concat.js",
        "tmp/"
      ],
    },

    watch: {
      scripts: {
        files: ['assets/**/*.js'],
        tasks: ['concat_sourcemap'],
        options: {
          spawn: false,
        },
      },
    },

    concat_sourcemap: {
      options: {
        separator: "\n;\n"
      },
      target: {
        files: {
          'assets/app.concat.js': [
            "assets/js/vendor/jquery-3.1.1.min.js",
            "assets/js/vendor/dataUriToBlob.js",
            "assets/js/vendor/ExifReader.js",
            "assets/js/vendor/fastclick.js",
            "assets/js/vendor/fileSaver.js",
            "assets/js/vendor/loader.js",
            "assets/js/vendor/lodash.min.js",
            "assets/js/vendor/parser.js",
            "assets/js/vendor/renderToCanvas.js",
            "assets/js/vendor/util.js",
            "assets/js/vendor/domvas.js",
            "assets/js/vendor/view/View.js",
            "assets/js/lib/views/MemeView.js",
            "assets/js/lib/views/UploadView.js",
            "assets/js/lib/views/HomeView.js",
            "assets/js/app.js",
          ]
        },
      }
    },

  });

  // Load tasks that we'll be using
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concat-sourcemap');

  // Default task(s).
  grunt.registerTask('default', ['concat_sourcemap', 'uglify']);
};
