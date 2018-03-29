// gulpfile.js
const gulp = require('gulp');
const htmlclean = require('gulp-htmlclean');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const jsmin = require('gulp-jsmin');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify-es').default;
const rename = require("gulp-rename");
var autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const cssnano = require('gulp-cssnano');

const browserSync = require('browser-sync');


const bases = {
  src: 'src/',
  dist: 'dist/',
};

// configure file specific directory paths
const paths = {
  html:     '**/*.html',
  css:      'css/*.css',
  js:       'js/*.js',
  img:      'img/*.{png,jpg,jpeg,gif}'
}

gulp.task('html', function () {
  return gulp.src(paths.html, {cwd: bases.src})
    .pipe(htmlclean())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(bases.dist));
});

gulp.task('img', function() {
  gulp.src(paths.img, {cwd: bases.src})
    .pipe(imagemin({
      progressive: true,
    }))
    .pipe(gulp.dest(bases.dist + 'img/'));
});

gulp.task('js', function () {
  return gulp.src(paths.js, {cwd: bases.src})
    .pipe(jsmin())
    .pipe(eslint())
    // .pipe(eslint.format())
    // .pipe(eslint.failOnError())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(bases.dist + 'js/'));
});


gulp.task('css', function () {
  return gulp.src(paths.css, {cwd: bases.src})
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS())
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(bases.dist + 'css/'))
    //.pipe(reload({stream: true}));
});

gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.html, {cwd: bases.src}, ['html']);
  gulp.watch(paths.css, {cwd: bases.src}, ['css']);
  gulp.watch(paths.js, {cwd: bases.src}, ['js']);
  gulp.watch(paths.sw, {cwd: bases.src}, ['sw']);
});

gulp.task('default', ['watch']);