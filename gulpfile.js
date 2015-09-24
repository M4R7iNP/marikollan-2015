var gulp = require('gulp'),
    gzip = require('gulp-gzip'),
    less = require('gulp-less'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    rename = require('gulp-rename'),
    mainBowerFiles = require('main-bower-files'),
    Autoprefixer = require('less-plugin-autoprefix'),
    Gls = require('gulp-live-server');

gulp.task('clean-css', function (cb) {
    return del('public/css/*', cb);
});
gulp.task('clean-js', function (cb) {
    return del('public/js/*', cb);
});

gulp.task('less', ['clean-css'], function () {
    gulp.src('./less/marikollan.less')
    .pipe(less({
        compress: true,
        plugins: [new Autoprefixer()]
    }))
    .pipe(header('/* Copyright © ' + (new Date()).getFullYear() + ' Martin Pedersen */\n'))
    .pipe(gulp.dest('./public/css'))
    .pipe(gzip())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('js', ['clean-js'], function () {
    gulp.src('./js/*.js')
    .pipe(uglify())
    .pipe(header('/* Copyright © ' + (new Date()).getFullYear() + ' Martin Pedersen */\n'))
    .pipe(gulp.dest('./public/js'))
    .pipe(gzip())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('dev', function(){
    var server = new Gls(['index.js', '--es6_staging'], {noColor: true}, false);
    server.start();

    gulp.watch(['less/**/*.less'], ['less']);
    gulp.watch(['index.js', 'lib/*.js', 'controllers/*.js', 'models/*.js'], server.start);
    gulp.watch(['public/css/*.css', 'view/**/*.html'], server.notify);
});

gulp.task('bower', function() {
    return gulp.src(mainBowerFiles({
        filter: /\.js$/
    }))
    .pipe(rename(function(path) {
        var original = path.basename + path.extname;
        path.extname = '.min' + path.extname;
        console.log(original, '=>', path.basename + path.extname);
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/lib'));
});

gulp.task('prod', ['less', 'js', 'bower']);
gulp.task('clean', ['clean-css', 'clean-js']);

