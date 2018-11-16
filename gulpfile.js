let gulp = require('gulp');
let del = require('del');
let webpack = require('webpack-stream');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('copy', ['clean'], () => {
    return gulp.src([
        'src/game.html',
        'src/assets/**/*.*'
    ], { base: 'src/' }).pipe(gulp.dest('dist/'));
});

gulp.task('webpack', ['clean'], () => {
    return gulp.src('src/index.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['copy', 'webpack']);

gulp.task('default', ['build']);