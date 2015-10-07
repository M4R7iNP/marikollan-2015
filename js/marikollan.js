var Marikollan = Marikollan || {};

require(['jquery'], function($) {
    var defaultTitle = 'Marikollan 2015';

    Marikollan.init = function($) {
        $(document).on('click', 'a[href^="/"]:not([data-toggle])', Marikollan.clickHandler);
        $('a[href^="http"]').attr('target', '_blank');

        $(window).bind('popstate', function(e) {
            var loc = history.location || document.location;
            Marikollan.ajax(loc.pathname + loc.search, {noPush: true});
        });

        Marikollan.getAvailableTickets();
        Marikollan.initFacebook();

        if (location.pathname == '/')
            Marikollan.timeCountdown();

        console.log('Er du er røver på HTML, CSS og Javascript? Bli med da vel! https://github.com/M4R7iNP/marikollan-2015');
    };

    Marikollan.clickHandler = function(ev) {
        var url;

        if (this && this.href)
            url = this.href.replace(location.origin, '');

        if (url.substr(0, 1) != '/')
            url = '/' + url;

        if (url) {
            Marikollan.ajax(url);
            ev.preventDefault();
        }
    };

    Marikollan.ajax = function(url, opts) {
        if (!opts)
            opts = {};

        document.body.classList.add('ajax-pending');

        $.ajax({
            url: '/pages' + url,
            dataType: 'html',
            error: function(a) {
                $("#content").html(a.responseText);
                document.title = defaultTitle;
            },
            complete: function() {
                document.body.classList.remove('ajax-pending');

                var header = $('.header').first();
                if ($(window).scrollTop() >= header.height()) //TODO: improve this
                    $('html, body').animate({scrollTop: header.height() + 'px'}, 'fast');

                if (history.pushState && !opts.noPush)
                    history.pushState(false, false, url);

                if (url == '/')
                    Marikollan.timeCountdown();
                else if (countdownInterval) {
                    countdownInterval = clearInterval(countdownInterval);
                    $('.countdown-container').addClass('hide');
                }
            },
            success: function(html, b, c) {
                var $content = $('#content');
                $content.html(html);

                var metaTitle = $('meta[name="title"]', $content);
                if (metaTitle.length)
                    document.title = metaTitle.attr('value') + ' - ' + defaultTitle;
                else
                    document.title = defaultTitle;

                //Add last modified and comments on bottom
                if (!$('meta[hideTimestamp]', $content).length) {
                    var date = new Date(c.getResponseHeader('Last-Modified'));

                    if (date.getTime() > 0) {
                        $content.append(
                            $('<p/>')
                            .attr('id', 'lastedit')
                            .addClass('text-muted text-right')
                            .text('Sist redigert: ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString())
                        );
                    }
                }

                //Load social plugins
                if ($('meta[name="facebookComments"]', $content).length) {
                    require(['facebook'], function(FB) {
                        Marikollan.appendCommentSection(url);
                        FB.XFBML.parse();
                    });
                }
                if(typeof window.twttr == 'object')
                    twttr.widgets.load();

                $('a[href^="http"]', $content).attr('target','_blank');

                if(typeof window.ga == 'function')
                    ga('send', 'pageview', url);
            }
        });
    };

    Marikollan.initFacebook = function() {
        require(['facebook'], function(FB) {
            FB.init({
                appId      : '369971899738545',
                version    : 'v2.4'
            });

            if ($('#content meta[name="facebookComments"]').length)
                Marikollan.appendCommentSection();

            FB.XFBML.parse();
        });
    };

    Marikollan.appendCommentSection = function(pathname) {
        if (!pathname)
            pathname = location.pathname;

        $('#content').append('<div class="fb-comments-container text-center"><div class="fb-comments" data-href="http://2015.marikollan.no'+ pathname +'" num_posts="5"></div></div>');
    };

    var countdownInterval;
    Marikollan.timeCountdown = function() {
        var countdownElm = document.getElementById('time-countdown'),
            marikollanTime = new Date('2015-10-30T18:00:00+0200');

        document.querySelector('.countdown-container').classList.remove('hide');

        function updateCountdown() {
            if (!countdownElm)
                clearInterval(interval);

            var now = new Date(),
                timeDiff = (marikollanTime.getTime() - now.getTime())/1000 - (now.getTimezoneOffset() - marikollanTime.getTimezoneOffset())*60;

            if (timeDiff < 0) {
                countdownElm.textContent = 'Marikollan! <3';
                return;
            }

            var d = {};
            d.weeks   = Math.floor(timeDiff/60/60/24/7);
            d.days    = Math.floor(timeDiff/60/60/24 - d.weeks*7);
            d.hours   = Math.floor(timeDiff/60/60 - d.weeks*7*24 - d.days*24);
            d.minutes = Math.floor(timeDiff/60 - d.weeks*7*24*60 - d.days*24*60 - d.hours*60);
            d.seconds = Math.floor(timeDiff - d.weeks*7*24*60*60 - d.days*24*60*60 - d.hours*60*60 - d.minutes*60);

            var units = ['weeks', 'days', 'hours', 'minutes', 'seconds'];
            for (var i in units) {
                var unit = units[i];

                if (isNaN(d[unit]))
                    return;

                countdownElm.querySelector('.' + unit).textContent = d[unit];
                countdownElm.querySelector('.' + unit + '-plural').classList[d[unit] === 1 ? 'add' : 'remove']('hidden');
            }
        }
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    };

    Marikollan.getAvailableTickets = function() {
        $.get(
            '/tickets.txt',
            function(txt, b, c) {
                $('#tickets')
                .empty()
                .append([
                    document.createTextNode('Det er '),
                    $('<span>').addClass('count').text(txt),
                    document.createTextNode(' ledige billetter')
                ]);
            }
        );
    };

    $(Marikollan.init);
});

