const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const del = require('del');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const newer = require('gulp-newer');
const browserSync = require('browser-sync');

const path = {
  html: {
    src: 'src/*.html',
    dest: 'dist',
  },
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css/',
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/',
  },
  images: {
    src: 'src/images/**',
    dest: 'dist/images/',
  },
};

gulp.task('clean', () => del(['dist/*', '!dist/img']));

gulp.task('html', () =>
  gulp
    .src(path.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(path.html.dest))
    .pipe(browserSync.stream())
);

gulp.task('styles', () =>
  gulp
    .src(path.styles.src)
    .pipe(sourcemaps.init())
    .pipe(scss({ outputStyle: 'compressed' }).on('error', scss.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(rename({ basename: 'main', suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.styles.dest))
    .pipe(browserSync.stream())
);

gulp.task('scripts', () =>
  gulp
    .src(path.scripts.src, { sourcemaps: true })
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(path.scripts.dest))
    .pipe(browserSync.stream())
);

gulp.task('img', () =>
  gulp
    .src(path.images.src)
    .pipe(newer(path.images.dest))
    .pipe(
      imagemin({
        progressive: true,
      })
    )
    .pipe(gulp.dest(path.images.dest))
);

gulp.task('watch', () => {
  browserSync.init({
    server: {
      baseDir: './dist/',
    },
  });
  gulp.watch(path.html.dest).on('change', browserSync.reload);
  gulp.watch(path.html.src, gulp.parallel('html'));
  gulp.watch(path.styles.src, gulp.parallel('styles'));
  gulp.watch(path.scripts.src, gulp.parallel('scripts'));
  gulp.watch(path.images.src, gulp.parallel('img'));
});

gulp.task('build', gulp.series('clean', 'html', gulp.parallel('scripts', 'styles', 'img'), 'watch'));
