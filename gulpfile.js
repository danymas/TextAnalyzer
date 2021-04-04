"use strict";

// -----------------------------------------------------------------------------
// - Dependencies -
// -----------------------------------------------------------------------------
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const glob = require("glob");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-sass");
const purgeCss = require("gulp-purgecss");
const browserify = require("browserify");
const terser = require("gulp-terser");
const environments = require("gulp-environments");

const siteOutput = "./dist";
const indexHtml = "index.html";
const sassMain = "./scss/main.scss";
const allJsFiles = "./js/*.js";

const isProduction = environments.production;
const isDevelopment = environments.development;

// -----------------------------------------------------------------------------
// - HTML -
// -----------------------------------------------------------------------------
gulp.task("html", () => {
  const htmlMinOptions = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeComments: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  };
  return gulp.src(indexHtml)
    .pipe(isProduction(htmlmin(htmlMinOptions)))
    .pipe(gulp.dest(siteOutput))
});

// -----------------------------------------------------------------------------
// - Sass -
// -----------------------------------------------------------------------------
gulp.task("css", () => {
  const sassOptions = {
    outputStyle: "compressed"
  };
  const purgeCssOptions = {
    content: [indexHtml, allJsFiles],
    safelist: {}
  };

  return gulp.src(sassMain)
    .pipe(sass(sassOptions).on("error", sass.logError))
    .pipe(purgeCss(purgeCssOptions))
    .pipe(gulp.dest(siteOutput + "/css"));
});

// -----------------------------------------------------------------------------
// - Javascript -
// -----------------------------------------------------------------------------
gulp.task("js", (done) => {
  const terserOptions = {
    ecma: 8,
    compress: isProduction(),
    mangle: isProduction(),
    toplevel: isProduction()
  };

  glob.sync("./js/*.js").map(file => {
    const fileName = file.substring(file.lastIndexOf("/") + 1);
    browserify(file).bundle()
      .pipe(source(fileName))
      .pipe(buffer())
      .pipe(terser(terserOptions))
      .pipe(gulp.dest(siteOutput + "/js"))
  });

  done();
});

// -----------------------------------------------------------------------------
// - Environment flags -
// -----------------------------------------------------------------------------
gulp.task("set-prod", done => {
  environments.current(isProduction);
  done();
});

gulp.task("set-dev", done => {
  environments.current(isDevelopment);
  done();
});

// -----------------------------------------------------------------------------
// - Clean -
// -----------------------------------------------------------------------------
// See https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md
gulp.task("clean", () => {
  return del(["dist/*"]);
});

// -----------------------------------------------------------------------------
// - Static server -
// -----------------------------------------------------------------------------
gulp.task("serve", () => {
  browserSync.init({
    server: {
      baseDir: siteOutput,
      serveStaticOptions: {
          extensions: ["html"]
      }
    }
  });

  gulp.watch(sassMain, gulp.series("css"))
    .on("change", browserSync.reload);
  gulp.watch(allJsFiles, gulp.series("js", "css"))
    .on("change", browserSync.reload);
  gulp.watch(indexHtml, gulp.series("html", "css"))
    .on("change", browserSync.reload);
});

// -----------------------------------------------------------------------------
// - Build -
// -----------------------------------------------------------------------------
function build(serve = true, isProd = false) {
  const setEnv = isProd ? "set-prod" : "set-dev";
  const tasksToRun = ["clean", setEnv, gulp.parallel(["js", "css", "html"])];
  if (serve) {
    tasksToRun.push("serve");
  }
  return gulp.series(tasksToRun);
}

gulp.task("default", build());
gulp.task("build", build(false, true));