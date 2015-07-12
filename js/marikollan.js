var Marikollan = Marikollan || {};

require(['jquery'], function($) {
    var defaultTitle = 'Marikollan 2015';

    Marikollan.init = function($) {
        // TODO: Put much magic in here

        $(document).on('click', 'a[href^="/"]:not([data-toggle])', Marikollan.clickHandler);
        $('a[href^="http"]').attr('target', '_blank');

        Marikollan.initFacebook();

        console.log('https://github.com/M4R7iNP/marikollan-2015');
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
            error: function(a){
                $("#content").html(a.responseText);
                document.title = defaultTitle;
            },
            complete: function(){
                document.body.classList.remove('ajax-pending');

                var header = $('.header').first();
                if($(window).scrollTop() >= header.height()) //TODO: improve this
                    $('html, body').animate({scrollTop: header.height() + 'px'}, 'fast');

                if(history.pushState && !opts.noPush)
                    history.pushState(false, false, url);
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

                    if (date.getFullYear() != 1970) {
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
                    $('#content').append('<fb:comments id="fb-c" href="http://2015.marikollan.no/'+url+'" num_posts="2" width="'+$content.width()+'"></fb:comments>');
                    require(['facebook'], function(FB) {
                        FB.XFBML.parse();
                    });
                }
                if(typeof twttr != 'undefined')
                    twttr.widgets.load();

                $('a[href^="http"]', $content).attr('target','_blank');

                if(typeof ga != 'undefined')
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

            FB.XFBML.parse();
        });
    };

    $(Marikollan.init);
});

