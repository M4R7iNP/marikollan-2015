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
nunjucksEnv.addFilter('log', console.log);

// controllers
var pagesController = require('./controllers/pages');

// static routes
// these are set in nginx in prod
if (!app.production) {
    app.use('/js/', express.static(__dirname + '/js'));
    app.use('/js/lib/', express.static(__dirname + '/public/js/lib'));
    app.use('/css/', express.static(__dirname + '/public/css'));
    app.use('/fonts/', express.static(__dirname + '/public/fonts'));
    app.use('/files/', express.static(__dirname + '/public/files'));
    app.get('/favicon.png', express.static(__dirname + '/public'));
    app.use('/pages', pagesController.pagesHandler);
}

// main page route
app.use('/', pagesController.pagesHandler);

// 404 handler
app.use(function(req, res) {
    res.status(404);
    app.render('404', {path: req.originalUrl}, function(err, pageContent) {
        if (err)
            console.error(err);

        res.vary('X-Requested-With');
        if (req.xhr) {
            res.send(pageContent);
            res.end();
        }
        else {
            res.render('layout', {
                content: pageContent,
                path: req.originalUrl,
                bowerDependencies: bowerConfig.dependencies
            });
        }
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

