/* jshint esnext:true */
var jsdom = require('jsdom'),
    https = require('https'),
    async = require('async'),
    fs    = require('fs');

const TICKETS_QUERY_SELECTOR = '#content > table > tbody > tr.productline > td.ticket_description > div.availability > span';
const FILE_DEST  = process.argv[2];

function fetchGeekeventsPage(cb) {
    var req = https.request(
        {
            hostname: 'www.geekevents.org',
            path: '/marikollan15/shop/'
        },
        function(res) {
            if (res.statusCode !== 200)
                return cb(new Error('Got HTTP status code ' + res.statusCode));

            var body = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) { body += chunk; });
            res.on('end', function() {
                cb(undefined, body);
            });
        }
    );

    req.on('error', cb);
    req.end();
}

function parseGeekeventsPage(html, cb) {
    try {
        jsdom.env(html, function(err, window) {
            if (err)
                return cb(err);

            var document = window.document;

            var availableTicketsElm = document.querySelector(TICKETS_QUERY_SELECTOR);
            if (!availableTicketsElm)
                return cb(new Error('Did not find available tickets element'));

            cb(undefined, availableTicketsElm.textContent);
        });
    } catch (err) {
        cb(err);
    }
}

function outputToDestination(availableTickets, cb) {
    if (FILE_DEST) {
        fs.writeFile(
            FILE_DEST,
            availableTickets,
            cb
        );
    }
    else {
        process.stdout.write(availableTickets);
    }
}

async.waterfall(
    [
        fetchGeekeventsPage,
        parseGeekeventsPage,
        outputToDestination
    ],
    function(err, result) {
        if (err)
            console.error(err);

        process.exit(err ? 1 : 0);
    }
);
