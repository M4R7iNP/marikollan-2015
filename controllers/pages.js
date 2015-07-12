var Fs = require('fs'),
    Path = require('path'),
    bowerConfig = require('../bower.json');

// page titles are saved as meta tags in file content
var metaTagRegex = /<meta\s+name="([^"]+)"\s+value="([^"]+)"\s*\/?>/,
    metaTagRegexGlobal = new RegExp(metaTagRegex.source, 'g');

module.exports.pagesHandler = function (req, res, next) {
    if (req.path.indexOf('..') !== -1)
        return next(new Error('Invalid path'));

    var fsPath = Path.join('./public/pages', req.path);
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

            res.vary('X-Requested-With');
            if (req.xhr) {
                if (metaTags && metaTags.title)
                    res.set('X-Title', metaTags.title);

                res.send(pageContent);
                res.end();
            } else {
                res.render('layout', {
                    content: pageContent,
                    path: req.originalUrl,
                    metaTags: metaTags || {},
                    bower: bowerConfig.dependencies
                });
            }
        });
    });
};

