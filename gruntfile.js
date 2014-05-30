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
      cssmin:{
        build:{
          files:{
            //splash / home page
            'public/css/splash.css': ['public/css/splash.css'],
            //vendor css for application
            'public/css/vendor.min.css': [
              'public/css/bootstrap-editable.css',
              'public/css/jquery.datatables.css',
              'public/css/bootstrap-switch.min.css',
              'public/css/dropzone.css',
              'public/css/jquery.gritter.css',
              'public/css/ng-tags-input.min.css',
              'public/css/jquery-ui-1.10.3.css',
              'public/css/xeditable.css'
            ],
            //application template css
            'public/css/theme.min.css': [
              'public/css/bootstrap-override.css',
              'public/css/style.default.css',
              'public/css/style.custom.css'
            ],
            //public / auth pages css
            'public/css/public.min.css': [
              'public/css/style.default.css'
            ]
          }
        }
      },      
      copy: {
        build: {
          cwd: 'build',
          src: [
            //images
            'img/**/*',
            'images/**/*',
            'css/images/**/*',
            //fonts fav txt
            'fonts/**/*',
            'favicon.ico',
            'humans.txt',
            'robots.txt',
            // vendor css
            'css/bootstrap.min.css',
            'css/startup.css',
            'css/bootstrap-editable.css',
            'css/jquery.datatables.css',
            'css/bootstrap-switch.min.css',
            'css/jquery.gritter.css',
            'css/ng-tags-input.min.css',
            'css/jquery-ui-1.10.3.css',
            'css/dropzone.css',
            'css/xeditable.css',          // 
            'css/bootstrap-override.css',
            // 'css/.css',
            // Template CSS
            'css/style.custom.css',
            'css/style.default.css',
            //Vendor and Libs
            'js/jquery-2.1.1.min.js',
            'js/pace.js',
            'js/bootstrap.min.js',
            "js/angular.min.js",
            "js/angular-route.min.js",      
            'js/easing.js',
            'js/typer.js',
            'js/nicescroll.js',
            "js/jquery-ui-1.10.3.min.js",
            "js/jquery-migrate-1.2.1.min.js",
            "js/modernizr.min.js",
            "js/retina.min.js",
            "js/toggles.min.js",
            "js/chosen.jquery.min.js",
            "js/bootstrap-editable.min.js",
            "js/typeahead.bundle.js",
            "js/moment.js",
            "js/bootstrap-switch.min.js ",
            "js/underscore-min.js ",
            "js/jquery.gritter.min.js",
            "js/ng-tags-input.min.js",
            "js/angular-dragdrop.min.js",
            "js/jquery.slimscroll.min.js",
            "js/xeditable.min.js",
            "js/ui-bootstrap-custom-tpls-0.10.0.min.js",
            'js/ketchup.all.js',
            "js/dropzone.min.js",
            'js/tooltip.js',
            // Splash Template JS
            'js/startup.js',
            "js/modules/public.js",
            //Application Init JS
            'js/app.js',
            'js/modules/lang.js',    
            'js/common/services/services.js',
            'js/common/filters/filters.js',
            'js/common/directives/directives.js',
            'js/common/directives/checklist-model.js',
            'js/modules/hospital/hospital.js',
            'js/modules/dashboard/dashboard.js',
            'js/modules/order/order.js',
            'js/modules/reports/reports.js',
            'js/modules/drug/drug.js',
            'js/modules/bills/bills.js',
            'js/modules/dispense/dispense.js',
            'js/modules/supplier/supplier.js',
            'js/modules/admin/admin.js',
            'js/modules/stock/stock.js',
            'js/modules/user/user.js',
            'js/modules/organization/organization.js',
            "js/custom.js",
            ],
            dest: 'public/',
            expand: true
          }
        }, 
        clean:{
          build:{
            src:['public']
          }
        }, 
        uglify : {     
          build:{
            options:{
              mangle: false
            },
            files:{
              //Splash / Home page
              'public/js/public-module.min.js': [
                'public/js/pace.js',
                'public/js/easing.js',
                'public/js/typer.js',
                'public/js/nicescroll.js',
                'public/js/ketchup.all.js',
                'public/js/startup.js',
                "public/js/modules/public.js",
                "public/js/modules/lang.js",
                "public/js/modules/order/order.js",
                "public/js/modules/drug/drug.js",
                "public/js/common/services/services.js",
              ],
              //application vendor js
              'public/js/default-vendor.min.js': [
                "public/js/modernizr.min.js",
                "public/js/retina.min.js",
                "public/js/toggles.min.js",
                "public/js/chosen.jquery.min.js",
                "public/js/bootstrap-editable.min.js",
                "public/js/typeahead.bundle.js",
                "public/js/moment.js",
                "public/js/bootstrap-switch.min.js ",
                "public/js/underscore-min.js ",
                "public/js/jquery.gritter.min.js",
                "public/js/ng-tags-input.min.js",
                "public/js/angular-dragdrop.min.js",
                "public/js/jquery.slimscroll.min.js",
                "public/js/xeditable.min.js",
                "public/js/ui-bootstrap-custom-tpls-0.10.0.min.js",
                // "public/js/jquery.prettyPhoto.js",
                "public/js/dropzone.min.js",
                "public/js/tooltip.js",
              ],
              //application ng modules
              'public/js/modules.min.js': [
                'public/js/app.js',
                'public/js/modules/lang.js',
                'public/js/common/services/services.js',
                'public/js/common/filters/filters.js',
                'public/js/common/directives/directives.js',
                'public/js/common/directives/checklist-model.js',
                'public/js/modules/hospital/hospital.js',
                'public/js/modules/dashboard/dashboard.js',
                'public/js/modules/order/order.js',
                'public/js/modules/reports/reports.js',
                'public/js/modules/drug/drug.js',
                'public/js/modules/bills/bills.js',
                'public/js/modules/dispense/dispense.js',
                'public/js/modules/supplier/supplier.js',
                'public/js/modules/admin/admin.js',
                'public/js/modules/stock/stock.js',
                'public/js/modules/user/user.js',
                'public/js/modules/organization/organization.js',
                "public/js/custom.js"
              ],
              //public vendor js
              'public/js/public-vendor.min.js': [
                // 'public/js/jquery-1.10.2.min.js',
                // 'public/js/angular.min.js',
                'public/js/angular-route.min.js',
                // 'public/js/jquery-migrate-1.2.1.min.js',
                // 'public/js/bootstrap.min.js',
                'public/js/modernizr.min.js',
                'public/js/retina.min.js',
                'public/js/chosen.jquery.min.js',

                'public/js/custom.js',
              ]
            }
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
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');    

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'concurrent']);
    grunt.registerTask('build', ['clean', 'copy', 'uglify', 'cssmin']);

    //Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest']);
  };
