// gulpfile.js
var gulp = require('gulp');
var htmlclean = require('gulp-htmlclean');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var jsmin = require('gulp-jsmin');
var htmlmin = require('gulp-htmlmin');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var browserSync = require('browser-sync');
const compress = require('compression');
const reload = browserSync.reload;
const rename = require("gulp-rename");
var del = require('del');
var runSequence = require('run-sequence');
var eslint = require('gulp-eslint');
var gzipMiddleware = require('connect-gzip-static-html');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify-es').default;

const bases = {
  src: 'src/',
  dist: 'dist/',
};

// configure file specific directory paths
const paths = {
  html:     '**/*.html',
  css:      'css/**/*.css',
  js:       'js/**/*.js',
  img:      'img/*.{png,jpg,jpeg,gif}',
  icon:     'icon.png',
  manifest: 'manifest.json' 
}

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('html', function () {
  return gulp.src(paths.html, {cwd: bases.src})
    .pipe(htmlclean())
    .pipe(htmlmin({collapseWhitespace: true}))
    //.pipe(gzip({ append: true }))
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({stream: true}));
});


gulp.task('css', function () {
  return gulp.src(paths.css, {cwd: bases.src})
    //.pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    //.pipe(gzip({ append: true }))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest(bases.dist + 'css/'))
    .pipe(reload({stream: true}));
});

gulp.task('js', function () {
  return gulp.src(paths.js, {cwd: bases.src})
    //.pipe(sourcemaps.init())
    .pipe(jsmin())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    //.pipe(gzip({ append: true }))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest(bases.dist + 'js/'))
    .pipe(reload({stream: true}));
});

gulp.task('sw', function () {
  // Service Worker
  return gulp.src(paths.sw, {cwd: bases.src})
    .pipe(jsmin())
    //.pipe(gzip({ append: true }))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({stream: true}));
});

gulp.task('img', function() {

  gulp.src(paths.img, {cwd: bases.src})
    .pipe(imagemin({
      progressive: true,
    }))
    .pipe(webp())
    .pipe(gulp.dest(bases.dist + 'img/'));
});

gulp.task('app-icons', (() => {
  gulp.src(paths.appIcons, {cwd: bases.src})
    .pipe(imagemin({
      progressive: true,
    }))
    .pipe(gulp.dest(bases.dist + 'img/app_icons'))
}));

gulp.task('manifest', (() => {
  gulp.src(paths.manifest, {cwd: bases.src})
    .pipe(gulp.dest(bases.dist))
}));

//gulp.task('build', ['html', 'css', 'js', 'sw','img', 'app-icons','manifest']);

gulp.task('build', function() {
    runSequence('clean', ['html', 'css', 'js', 'sw', 'img', 'app-icons', 'manifest']);
});

gulp.task('serve',['build'], (() => {
  browserSync.init({
    server: {
      baseDir: bases.dist,
      middleware: [compress()]
    }, ui: {
      port: 5000
    }, port: 5000
  });
}));

gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.html, {cwd: bases.src}, ['html']);
  gulp.watch(paths.css, {cwd: bases.src}, ['css']);
  gulp.watch(paths.js, {cwd: bases.src}, ['js']);
  gulp.watch(paths.sw, {cwd: bases.src}, ['sw']);
});

gulp.task('default', ['watch']);