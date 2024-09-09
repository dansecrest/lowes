'use strict';

// PLUGINS
var gulp = require('gulp');

var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});

var async = require('async');
var browserSync = require('browser-sync');
var del = require('del');
var fs = require('fs');
var runSequence = require('run-sequence');

var runTimestamp = Math.round(Date.now()/1000);


// ENVIRONMENTS
var development = plugins.environments.development;
var production = plugins.environments.production;


// PATHS
var paths = {
    assets: {
        fonts: 'src/fonts/*.*',
        icons: 'src/fonts/icons/**/*.*',
        images: 'src/images/**/*.*'
    },
    scripts: {
        vendor: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/jquery-validation/dist/jquery.validate.js',
            'bower_components/picturefill/dist/picturefill.js',
            'src/scripts/vendor/modernizr-custom.js'
        ],
        main: [
            'src/scripts/utils.js',
            'src/scripts/main.js',
            'src/scripts/checklist.js'
        ]
    },
    seo: [
        'src/robots.txt',
        'src/sitemap.xml'
    ]
};


// DATA
gulp.task('data', function() {
    return gulp.src('src/views/_data/**/*.json')
        .pipe(plugins.mergeJson('data.json'))
        .pipe(gulp.dest('build/assets'));
});


// VIEWS
gulp.task('pug', function(callback) {
    return gulp.src(['src/views/**/*.pug', '!src/views/_components/**/*.pug', '!src/views/_layouts/**/*.pug'])
        .pipe(plugins.data(function() {
            return JSON.parse(fs.readFileSync('./build/assets/data.json'));
        }))
        .pipe(plugins.pug({pretty: true}).on('error', function(error) {
            console.error('Error!', error.message);
            callback();
        }))
        .pipe(gulp.dest('build'));
});


// ICONS
gulp.task('iconfont', function(done) {
    var iconStream = gulp.src(paths.assets.icons)
        .pipe(plugins.iconfont({
            fontHeight: 1001,
            fontName: 'lowes-doors-windows',
            formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
            normalize: true,
            prependUnicode: false,
            timeStamp: runTimestamp
        }));

    async.parallel([
        function handleGlyphs(callback) {
            iconStream.on('glyphs', function(glyphs, options) {
                gulp.src('src/styles/icons.css')
                    .pipe(plugins.consolidate('lodash', {
                        className: 'icon',
                        fontName: 'lowes-doors-windows',
                        fontPath: '../fonts/',
                        glyphs: glyphs
                    }))
                    .pipe(gulp.dest('build/assets/styles'))
                    .on('finish', callback);
            });
        },
        function handleFonts(callback) {
            iconStream
                .pipe(gulp.dest('build/assets/fonts'))
                .on('finish', callback);
        }
    ], done);
});


// STYLES
gulp.task('styles', function(callback) {
    return gulp.src('src/styles/**/*.scss')
        .pipe(development(plugins.sourcemaps.init()))
        .pipe(plugins.sass({
            errLogToConsole: true
        }).on('error', function(error) {
            console.error('Error!', error.message);
            callback();
        }))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(development(plugins.sourcemaps.write()))
        .pipe(production(plugins.cleanCss()))
        .pipe(production(plugins.rename({suffix: '.min'})))
        .pipe(gulp.dest('build/assets/styles'));
});


// SCRIPTS
gulp.task('scripts-vendor', function() {
    return gulp.src(paths.scripts.vendor)
        .pipe(plugins.concat('vendor.js'))
        .pipe(production(plugins.uglify()))
        .pipe(production(plugins.rename({suffix: '.min'})))
        .pipe(gulp.dest('build/assets/scripts'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.scripts.main)
        .pipe(plugins.concat('main.js'))
        .pipe(production(plugins.uglify()))
        .pipe(production(plugins.rename({suffix: '.min'})))
        .pipe(gulp.dest('build/assets/scripts'));
});


// IMAGEMIN
gulp.task('imagemin', function() {
    return gulp.src(paths.assets.images)
        .pipe(plugins.imagemin())
        .pipe(gulp.dest('build/assets/images'));
});


// COPY
gulp.task('copy', function() {
    gulp.src(paths.assets.fonts, {base: './src'})
        .pipe(gulp.dest('build/assets'));
    gulp.src(paths.seo, {base: './src'})
        .pipe(gulp.dest('build'));
});


// CLEAN
gulp.task('clean', function() {
    return del(['build'], {
        force: true
    });
});


// BROWSERSYNC
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'build',
            index: 'index.html'
        },
        files: ['build/assets/styles/**/*.css', 'build/assets/scripts/**/*.js'],
        notify: {
            styles: {
                top: 'auto',
                bottom: '0'
            }
        }
    });
});


// WATCHES
gulp.task('watch', function() {
    gulp.watch('src/views/_data/**/*.json', function() {
        runSequence(
            'data',
            'pug',
            browserSync.reload
        );
    });
    gulp.watch('src/views/**/*.pug', ['pug', browserSync.reload]);
    gulp.watch('src/fonts/icons/*.svg', ['iconfont', 'styles']);
    gulp.watch('src/images/**/*.*', ['imagemin']);
    gulp.watch('src/styles/**/*.scss', ['styles']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
});


// BUILD
gulp.task('build', ['clean'], function(callback) {
    runSequence(
        'imagemin',
        'iconfont',
        'data',
        ['pug', 'styles', 'scripts-vendor', 'scripts', 'copy'],
        callback
    );
});


// DEFAULT
gulp.task('default', ['clean'], function(callback) {
    runSequence(
        'imagemin',
        'iconfont',
        'data',
        ['pug', 'styles', 'scripts-vendor', 'scripts', 'copy'],
        'browser-sync',
        'watch',
        callback
    );
});
