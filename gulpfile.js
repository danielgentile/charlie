var gulp = require( 'gulp' );
var rename = require( 'gulp-rename' );
var sass = require( 'gulp-sass' );
var autoprefixer = require( 'gulp-autoprefixer' );
var sourcemaps = require( 'gulp-sourcemaps' );
var browserify = require( 'browserify' );
var babelify = require( 'babelify' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var uglify = require( 'gulp-uglify' );
var inject = require( 'gulp-inject' );
var concat = require( 'gulp-concat' );

var styleSRC = 'web/src/scss/style.scss';
var styleDIST = './web/dist/css/';
var styleWatch = 'web/src/scss/**/*.scss';

var jsSRC = 'script.js';
var jsFolder = 'web/src/js/';
var jsDIST = './web/dist/js/';
var jsWatch = 'web/src/js/**/*.js';
var jsFILES = [jsSRC];

var stylesVendors = {
    // 'animate': [
    //     './node_modules/animate.css/animate.min.css',
    // ],
    'fontawesome': [
        './node_modules/@fortawesome/fontawesome-free/scss/*',
    ],
    'foundation': [
        './node_modules/foundation-sites/scss/**/*',
        './node_modules/foundation-sites/scss/*',
    ],
    'slick': [
        './node_modules/slick-carousel/slick/slick-theme.scss',
        './node_modules/slick-carousel/slick/slick.scss',
    ],
}

var scriptsVendors = {
    'jquery': [
        './node_modules/jquery/src/jquery.js',
    ],
    'parallax-js': [
        './node_modules/parallax-js/src/parallax.js',
    ],
    'slick': [
        './node_modules/slick-carousel/slick/slick.min.js',
    ],
    'vivus': [
        './node_modules/vivus/src/vivus.js',
    ]
}

var stylesTask = Object.keys(stylesVendors);

stylesTask.forEach(function (libName) {
   gulp.task( 'styles:' + libName, function () {
      return gulp.src(stylesVendors[libName])
         .pipe(gulp.dest('./web/src/scss/vendors/' + libName));
   });
});

gulp.task( 'stylesVendors',
   gulp.parallel(
      stylesTask.map(function(name) {
          return 'styles:' + name;
      })
   )
);

var scriptsTask = Object.keys(scriptsVendors);

scriptsTask.forEach(function (libName) {
   gulp.task( 'scripts:'+libName, function () {
      return gulp.src(scriptsVendors[libName])
         .pipe(gulp.dest('./web/src/js/vendors/' + libName));
   });
});

gulp.task( 'scriptsVendors',
   gulp.parallel(
      scriptsTask.map(function(name) {
          return 'scripts:'+name;
      })
   )
);

gulp.task('style', function() {
    return gulp.src( styleSRC )
        .pipe( sourcemaps.init() )
        .pipe( sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }) )
        .on( 'error', console.error.bind( console ) )
        .pipe( autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }) )
        .pipe( rename( { suffix: '.min' } ) )
        .pipe( sourcemaps.write( './' ) )
        .pipe( gulp.dest( styleDIST ) );
});

gulp.task('js', function() {
    jsFILES.map(function ( entry ) {
        return browserify({
                entries: [jsFolder + entry]
            })
            .transform( babelify, { presets: ['@babel/env'] } )
            .bundle()
            .pipe( source( entry ) )
            .pipe( rename({ extname: '.min.js' }) )
            .pipe( buffer() )
            .pipe( sourcemaps.init({ loadMaps: true }) )
            .pipe( uglify() )
            .pipe( sourcemaps.write( './' ) )
            .pipe( gulp.dest( jsDIST ) );
    });
});

gulp.task('index', function() {
    var target = gulp.src('./templates/index.html');
    var options = {
        addRootSlash: false,
    };
    var sources = gulp.src(['./web/dist/**/*.js', './web/dist/**/*.css'], {read: false});
    return target.pipe(inject(sources, options))
        .pipe(gulp.dest('./templates'));
});

gulp.task('default', gulp.series(['style', 'js', 'index']));﻿

gulp.task('watch', gulp.series(['default'], function() {
    gulp.watch( styleWatch, gulp.series(['style']) );
    gulp.watch( jsWatch, gulp.series(['js']) );
}));
