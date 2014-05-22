module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            jade: {
                files: ['app/views/**'],
                options: {
                    livereload: true,
                },
            },
            js: {
                files: ['public/js/**', 'app/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true,
                },
            },
            html: {
                files: ['public/views/**'],
                options: {
                    livereload: true,
                },
            },
            css: {
                files: ['public/css/**'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: ['gruntfile.js', 'public/js/**/*.js', 'test/**/*.js', 'app/**/*.js']
        },
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['app', 'config'],
                    debug: true,
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'], 
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec'
            },
            src: ['test/**/*.js']
        },
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        jade: {
            debug:{            
                options: {
                    pretty: true,
                    data: {
                        debug: true
                    }
                },
                files: [{ 
                  expand: true, 
                  src: "**/*.jade", 
                  dest: "dist/", 
                  cwd: "views", 
                  ext: '.html'
                }]
            },
            release: {
                options: {
                    pretty: true,
                    data: {
                        debug: false
                    }
                },
                files: [{ 
                  expand: true, 
                  src: "**/*.jade", 
                  dest: "dist/", 
                  cwd: "views", 
                  ext: '.html'
                }]
            }            
        },
        compile: {
            options: {
                pretty: true,
                data: {
                    debug: false
                }
            },
            files: [{ 
              expand: true, 
              src: "**/*.jade", 
              dest: "dist/", 
              cwd: "views", 
              ext: '.html'
            }]
        }            
        
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-env');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'concurrent']);
    // grunt.registerTask('jade', ['jade']);

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest']);
};
