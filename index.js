var express = require('express'),
    nunjucks = require('nunjucks'),
    Fs = require('fs'),
    Path = require('path'),
    bowerConfig = require('./bower.json');

// web server
var app = express();
app.set('trust proxy', 'loopback')
.set('port', process.env.PORT || 8083)
.set('views', __dirname + '/views')
.set('view engine', 'html')
.set('etag', 'strong');

app.production = app.get('env') == 'production';

// template engine
var nunjucksEnv =
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: !app.production
});

// nunjucks filters
var assetStats = {};
nunjucksEnv.addFilter('asset_url', function(path) {
    if (assetStats[path] === undefined) {
        try {
            assetStats[path] = Fs.statSync(Path.join(__dirname, 'public', path)).mtime.getTime();
        } catch(e) {
            assetStats[path] = Date.now();
        }
    }

    return path + (path.indexOf('?') === -1 ? '?' : '&' ) + '_=' + assetStats[path];
});
nunjucksEnv.addFilter('nl2br', function(str) {
    return str.replace(/(\n\r|\r\n|\r|\n)/g, '<br/>');
});

// static routes
// these are set in nginx in prod
if (!app.production) {
    app.get('/pages/', express.static(__dirname + 'public/pages'));
    app.use('/js/', express.static(__dirname + '/js'));
    app.use('/js/lib/', express.static(__dirname + '/public/js/lib'));
    app.use('/css/', express.static(__dirname + '/public/css'));
    app.use('/fonts/', express.static(__dirname + '/public/fonts'));
    app.get('/favicon.png', express.static(__dirname + '/public'));
}

// page titles are saved as meta tags in file content
var metaTagRegex = /<meta\s+name="([^"]+)"\s+value="([^"]+)"\s*\/?>/,
    metaTagRegexGlobal = new RegExp(metaTagRegex.source, 'g');

// main page route
app.use('/', function(req, res, next) {
    if (req.path.indexOf('..') !== -1)
        return next(new Error('Invalid path'));

    var fsPath = Path.join(__dirname, 'public/pages', req.path);
    if (fsPath.substr(-1) == '/')
        fsPath += 'index.html';
    else if (fsPath.substr(-5) != '.html')
        fsPath += '.html';

    Fs.stat(fsPath, function(err, stat) {
        if (err) {
            if (err.code == 'ENOENT') {
                var checkPath = Path.join(__dirname, 'public/pages', req.path);

                Fs.stat(checkPath, function(err, checkStat) {
                    if (checkStat && checkStat.isDirectory())
                        return res.redirect(res.path + '/');
                    else
                        return next();
                });

                return;
            }

            return next(err);
        }

        if (stat.isDirectory() && false)
            return res.redirect(req.path + '/');

        Fs.readFile(fsPath, {encoding: 'utf8'}, function(err, pageContent) {
            if (err)
                return next(err);

            var metaTags = pageContent.match(metaTagRegexGlobal);

            if (metaTags) {
                metaTags = metaTags.reduce(function(carry, item) {
                    var metaTag = metaTagRegex.exec(item);
                    carry[metaTag[1]] = metaTag[2];
                    return carry;
                }, {});
            }

            res.render('layout', {
                content: pageContent,
                metaTags: metaTags || {},
                bower: bowerConfig.dependencies
            });
        });
    });
});

// 404 handler
app.use(function(req, res) {
    res.status(404);
    app.render('404', {url: req.url}, function(err, pageContent) {
        if (err)
            console.error(err);

        res.render('layout', {
            content: pageContent,
            path: req.path,
            bowerDependencies: bowerConfig.dependencies
        });
    });
});

// naught
process.on('message', function(message) {
    if(message == 'shutdown')
        process.exit(0);
});

app.listen(app.get('port'), function() {
    console.log('Marikollan.no 2015 listening on port %d.', app.get('port'));
    console.log('ENV: %s, CWD: %s.', (app.production?'production':'development'), __dirname);

    // naught
    if(process.send)
        process.send('online');
});

