const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

// Importaciones condicionales para evitar errores
let postcss, autoprefixer, cssnano, sourcemaps, rename, gulpif;

try {
    postcss = require('gulp-postcss');
    autoprefixer = require('autoprefixer');
    cssnano = require('cssnano');
    sourcemaps = require('gulp-sourcemaps');
    rename = require('gulp-rename');
    gulpif = require('gulp-if');
} catch (error) {
    console.log('⚠️  Algunas dependencias opcionales no están instaladas');
}

// Configuración
const config = {
    production: process.env.NODE_ENV === 'production',
    styles: {
        src: 'src/scss/main.scss',
        watch: 'src/scss/**/*.scss',
        dest: 'assets/css'
    }
};

// Verificar si PostCSS está disponible
const hasPostCSS = () => {
    return typeof postcss !== 'undefined';
};

function compileSCSS() {
    console.log('🎨 Compilando SCSS...');

    let stream = gulp.src(config.styles.src);

    // Sourcemaps solo en desarrollo y si está disponible
    if (!config.production && hasPostCSS()) {
        stream = stream.pipe(sourcemaps.init());
        console.log('📝 Sourcemaps habilitados');
    }

    stream = stream.pipe(sass({
        sassOptions: {
            quietDeps: true,
            style: 'expanded',
            outputStyle: config.production ? 'compressed' : 'expanded'
        }
    }).on('error', function(error) {
        console.error('❌ Error en Sass:', error.message);
        console.error('🔍 Archivo:', error.file);
        console.error('📄 Línea:', error.line);
        this.emit('end');
    }));

    // PostCSS solo si está disponible
    if (hasPostCSS()) {
        const processors = [autoprefixer()];
        if (config.production) {
            processors.push(cssnano());
            console.log('⚡ CSS minificado habilitado');
        }
        stream = stream.pipe(postcss(processors));
        console.log('🎯 Autoprefixer habilitado');
    }

    // Sourcemaps solo en desarrollo y si está disponible
    if (!config.production && hasPostCSS()) {
        stream = stream.pipe(sourcemaps.write('.'));
    }

    stream = stream.pipe(gulp.dest(config.styles.dest));

    // Minificar solo en producción y si está disponible
    if (config.production && hasPostCSS()) {
        stream = stream.pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest(config.styles.dest));
    }

    return stream.on('end', () => {
        console.log(`✅ SCSS compilado ${config.production ? 'en modo producción' : 'en modo desarrollo'}`);
        console.log(`📁 Output: ${config.styles.dest}/`);
        if (!hasPostCSS()) {
            console.log('ℹ️  PostCSS no disponible - CSS sin autoprefixer ni minificación');
        }
    });
}

function watch() {
    console.log('🔍 Buscando archivos SCSS...');

    // Compilar primero antes de empezar a observar
    compileSCSS();

    console.log('👀 Observando cambios en SCSS...');
    console.log('📁 Ruta observada:', config.styles.watch);

    return gulp.watch(config.styles.watch, {
        ignoreInitial: false
    }, function(done) {
        console.log('🔄 Cambio detectado, recompilando...');
        compileSCSS().on('end', done);
    });
}

// Tarea para limpiar CSS
function cleanCSS(done) {
    const fs = require('fs');
    const path = require('path');

    console.log('🧹 Limpiando archivos CSS...');
    const cssDir = config.styles.dest;

    if (fs.existsSync(cssDir)) {
        const files = fs.readdirSync(cssDir);
        let deletedCount = 0;

        files.forEach(file => {
            if (file.endsWith('.css') || file.endsWith('.css.map')) {
                fs.unlinkSync(path.join(cssDir, file));
                console.log(`🗑️  Eliminado: ${file}`);
                deletedCount++;
            }
        });

        if (deletedCount === 0) {
            console.log('📭 No se encontraron archivos CSS para limpiar');
        }
    } else {
        console.log('📁 Directorio CSS no existe:', cssDir);
    }

    done();
}

// Tareas específicas
exports.styles = compileSCSS;
exports.watch = watch;
exports.clean = cleanCSS;
exports.build = gulp.series(cleanCSS, compileSCSS);

// Tarea por defecto - compila y luego observa
exports.default = gulp.series(compileSCSS, watch);