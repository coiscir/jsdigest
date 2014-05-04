module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['all']);
  grunt.registerTask('build', ['concat', 'jshint', 'uglify']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('all', ['clean', 'build', 'test']);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {
      dist: ['dist/digest*.js']
    },

    concat: {
      options: {
        process: true
      },

      dist: {
        files: {
          'dist/digest.js': []
        }
      }
    },

    jshint: {
      options: {
        browser: true,
        node: true,

        globals: {
          define: true
        },

        /* Enforcing: Fixed */
        indent: 2,
        es3: true,
        camelcase: true,
        newcap: true,
        undef: true,
        unused: true,
        trailing: true,

        maxdepth: 2,
        maxlen: 100,

        /* Enforcing: Extras */
        immed: true,
        latedef: true,
        noarg: true,
        nonbsp: true,
        quotmark: true,

        /* Relaxing */
        eqnull: true
      },

      src: ['src/**/[!_]*.js'],
      dist: 'dist/digest.js'
    },

    uglify: {
      options: {
        banner:
          '/* <%= pkg.name %> v<%= pkg.version %> ' +
          '(c) 2009, <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> ' +
          'ISC License */\n'
      },

      dist: {
        src: 'dist/digest.js',
        dest: 'dist/digest.min.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }

  });

};
