var gulp = require('gulp'),
    browser = require('browser-sync').create();

gulp.task('server', function () {
    browser.init({
        server: {
            baseDir: './'
        },
        files: ['./index.html', './build/index.js']
    });
});