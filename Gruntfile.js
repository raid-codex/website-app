/*jslint node: true */
"use strict";


module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            dist: {
                files: {
                    'dist/app.min.js': ['build/*.js'],
                },
                options: {
                    mangle: false
                }
            }
        },

        html2js: {
            options: {
                base: "./",
            },
            dist: {
                src: ['app/**/*.html'],
                dest: 'build/app.templates.js'
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['app/*.js', 'app/**/*.js'],
                dest: 'build/app.js'
            }
        },

        jshint: {
            all: ['app/*.js', 'app/**/*.js']
        },

    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-html2js');

    grunt.registerTask('package', ['jshint:all', 'html2js:dist', 'concat:dist', 'uglify:dist']);
};