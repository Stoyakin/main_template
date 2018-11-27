var fs = require('fs'),
    gulp = require('gulp'),
    rebaseCSSurls = require('gulp-rebase-css-urls'),
    pngquant = require('imagemin-pngquant'),
    autoprefixer = require('autoprefixer'),
    pug = require('gulp-pug'),
    pugInheritance = require('gulp-pug-inheritance'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    $ = require('gulp-load-plugins')();

// Пути
var src = {
    'app': {
        'stylus': 'app/stylus/',
        'css': 'app/css/',
        'font': 'app/fonts/',
        'js': 'app/js/',
        'vendor': 'app/vendor/',
        'svg': 'app/svg/',
        'pug': 'app/pug/'
    },
    'build': {
        'css': 'prod/static/css/',
        'js': 'prod/static/js/',
        'tmpl': 'prod'
    }
};

// Компиляция .styl файлов (stylus)
function stylus(src, dst) {
    return function () {
        return gulp.src(src + 'styles.styl')
            .pipe($.plumber({
                errorHandler: $.notify.onError({
                    title: 'Stylus error',
                    message: '<%= error.message %>'
                })
            }))
            .pipe($.print())
            .pipe($.stylus({
                'include css': true
            }))
            .pipe(gulp.dest(dst))
            .pipe($.notify({
                title: 'STYLUS',
                message: 'STYLUS build complete',
                onLast: true
            }));
    }
}

// Билд CSS
function css(src, dst) {
    return function () {
        return gulp.src(src)
            .pipe($.plumber({
                errorHandler: $.notify.onError({
                    title: 'CSS error',
                    message: '<%= error.message %>'
                })
            }))
            .pipe($.print())
            .pipe(rebaseCSSurls('.'))
            .pipe($.postcss([
                require('autoprefixer')({
                        browsers: ['> 5%', 'last 2 version'],
                        cascade: false
                    })
            ]))
            .pipe($.concat('style.css'))
            .pipe(gulp.dest(dst))
            .pipe($.notify({
                title: 'CSS',
                message: 'CSS build complete'
            }))
            .pipe(reload({
                stream: true
            }));
    }
}

// Упаковка CSS
function csspack(src, dst) {
    return function () {
        return gulp.src(src)
            .pipe($.plumber({
                errorHandler: $.notify.onError({
                    title: 'CSS PACK error',
                    message: '<%= error.message %>'
                })
            }))
            .pipe($.print())
            .pipe($.postcss([
                require('cssnano')({
                        discardComments: {
                            removeAll: true
                        },
                        discardUnused: {
                            namespace: false
                        }
                    })
            ]))
            .pipe($.concat('style.pack.css'))
            .pipe(gulp.dest(dst))
            .pipe($.notify({
                title: 'CSS PACK',
                message: 'CSS PACK complete',
                onLast: true
            }))
            .pipe(reload({
                stream: true
            }));
    }
}

// Билд JS
function js(src, dst, fileName) {
    return function () {
        return gulp.src(src)
            .pipe($.sourcemaps.init())
            .pipe($.plumber({
                errorHandler: $.notify.onError({
                    title: 'JS error',
                    message: '<%= error.message %>'
                })
            }))
            .pipe($.changed(dst, {
                extension: '.js'
            }))
            .pipe($.print())
            .pipe($.concat(fileName))
            .pipe($.uglify())
            .pipe($.sourcemaps.write('./'))
            .pipe(gulp.dest(dst))
            .pipe($.notify({
                title: 'JS',
                message: 'JS build complete',
                onLast: true
            }))
            .pipe(reload({
                stream: true
            }));
    }
}

// Таски
// Компилим pug
gulp.task('pug', function buildHTML() {
    return gulp.src(src.app.pug + '*.pug')
    .pipe($.changed(src.build.tmpl, {
        extension: '.html'
    }))
    .pipe($.if(global.isWatching, $.cached('pug')))
    //.pipe(cached('pug'))
    .pipe(pugInheritance({
        basedir: 'app/pug/',
        skip: 'node_modules'
    }))
    .pipe(pug({pretty: '    ' }))
    .pipe(gulp.dest(src.build.tmpl))
    .pipe(reload({stream: true}));
});

// Компилим CSS
gulp.task('stylus', stylus([src.app.stylus], src.app.css));

// Собираем CSS
gulp.task('css', css([
        src.app.css + 'fonts.css',
        //'node_modules/jquery-form-styler/dist/jquery.formstyler.css'
        //src.app.css + 'ext/jquery.mCustomScrollbar.min.css',
        src.app.css + 'styles.css'
    ],
    src.build.css
));

// Пакуем CSS
gulp.task('csspack', csspack([src.build.css + 'styles.css'], src.build.css));

// Собираем JS
gulp.task(
    'js-own',
    js(
        [
            src.app.js + '*'
        ],
        src.build.js,
        'own.js'
    )
);

gulp.task(
    'js-vendor',
    js(
        [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/jquery-ui-dist/jquery-ui.min.js',
            'node_modules/jquery-migrate/dist/jquery-migrate.min.js',
            //'node_modules/jquery-form-styler/dist/jquery.formstyler.min.js',
            //src.app.js + 'ext/jquery.mCustomScrollbar.js',
            //src.app.js + 'ext/jquery.dotdotdot.min.js',
            //src.app.js + 'ext/jquery.fancybox.js',
            //src.app.js + 'ext/jquery.maskedinput.min.js'
        ],
        src.build.js,
        'vendor.js'
    )
);

gulp.task(
    'js',
    function () {
        gulp.start('js-vendor');
        gulp.start('js-own');
    }
);

gulp.task('setWatch', function() {
    global.isWatching = true;
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: './',
            directory: true
        }
    });
});

gulp.task('watch', function () {
    gulp.start('default');
    gulp.watch(src.app.pug + '*.pug', ['setWatch','pug']);
    gulp.watch(src.app.stylus + '**/*.styl', ['stylus']);
    gulp.watch(src.app.css + 'styles.css', ['css']);
    gulp.watch(src.app.js + '**/*.js', ['js-own']);
});

gulp.task('build', ['setWatch', 'pug', 'stylus', 'css', 'js']);

gulp.task('default', ['build', 'browserSync']);