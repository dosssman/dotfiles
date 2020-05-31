// (C) COPYRIGHT 2016-2020 palobby.com All rights reserved.

// !LOCNS:community_mods

var communityModsLoaded;

function CommunityMods()
{
    if ( communityModsLoaded )
        return;

    communityModsLoaded = true;

    const palobbyPrivacyUpdated = 1529947594985;

    if ( ! window.CommunityModsManager )
        return;

    model.communityModsOK = ko.observable(localStorage.getItem( 'community_mods_ok' ));

    model.communityModsOKTimestamp = ko.observable(localStorage.getItem('community_mods_ok_timestamp') || 0);

    model.communityModsPolicyUpdated = ko.computed( function()
    {
        return model.communityModsOKTimestamp() < palobbyPrivacyUpdated;
    });

    model.communityModsShowMessage = ko.computed( function()
    {
        return model.communityModsOK() != 'yes' || model.communityModsPolicyUpdated();
    });

    model.communityModsConfirmed = function()
    {
        console.log('Community Mods OK');
        model.communityModsOK('yes');
        localStorage.setItem( 'community_mods_ok', 'yes' );
        model.communityModsOKTimestamp(Date.now());
        localStorage.setItem( 'community_mods_ok_timestamp', Date.now());
    }

    model.openPaLobbyPrivacyPolicy = function()
    {
        engine.call( 'web.launchPage', 'https://palobby.com/privacy/' );
    }

    model.openWebsite = function()
    {
        engine.call( 'web.launchPage', 'https://planetaryannihilation.com/' );
    }

    model.openPaLobby = function()
    {
        engine.call( 'web.launchPage', 'https://palobby.com/' );
    }

    model.openLegionExpansion = function()
    {
        engine.call( 'web.launchPage', 'https://exodusesports.com/article/legion-expansion-community-faction-mod/' );
    }

    $( 'div.global_message_content' ).prepend( '<div id="community-mods-messages" style="font-size:16px; position: absolute; bottom: 0; display: flex; flex-direction: column"></div>' );

    $( '#community-mods-messages' ).prepend( '<div class="community-mods-message important palobby" style="display:none;" data-bind="visible: communityModsShowMessage"><div>' + loc("!LOCID:community-mods-intro:Community Mods and Community Chat are services provided by <a class=\"link\" data-bind=\"click: openPaLobby, click_sound: 'default', rollover_sound: 'default'\">palobby.com <span style=\"padding-right: 5px; font-size: 12px; font-family:'Glyphicons Halflings'\">&#xe164;</span></a> for <a class=\"link\" data-bind=\"click: openWebsite, click_sound: 'default', rollover_sound: 'default'\">Planetary Annihilation Inc <span style=\"padding-right: 5px; font-size: 12px; font-family:'Glyphicons Halflings'\">&#xe164;</span></a> that extend the base game with enhancements, fixes and hundreds of community created mods like <a class=\"link\" data-bind=\"click: openLegionExpansion, click_sound: 'default', rollover_sound: 'default'\">Legion Expansion <span style=\"padding-right: 5px; font-size: 12px; font-family:'Glyphicons Halflings'\">&#xe164;</span></a>") + '</div><div style="padding-top: 20px"><div style="float: left; background-color: black; padding: 10px; color: white;">palobby.com <span data-bind="visible: communityModsPolicyUpdated">updated </span> <a data-bind="click: openPaLobbyPrivacyPolicy, click_sound: \'default\', rollover_sound: \'default\'">privacy policy</a></loc></div><div style="float: right"><button data-bind="click: communityModsConfirmed, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:OK') + '</button></div></div></div>' );

	// model.leaderboardReady(true);

    if (!model.updateUrl)
    {
        model.openNews = function()
        {
            engine.call( 'web.launchPage', 'https://planetaryannihilation.com/news/' );
        }

        $('div.section_header.update').attr('data-bind', 'visible: showUpdate, click: openNews');
        $('div.section_post').attr('data-bind', 'visible: showUpdate, click: openNews');
    }

    model.showCommunityModsBusy = CommunityModsManager.busy;

// navigate to community mods

    model.navToCommunityMods = function()
    {
        window.location.href = 'coui://ui/main/game/community_mods/community_mods.html';
        return;
    }

    model.linkToExodusGuides = function()
    {
        engine.call( 'web.launchPage', 'https://exodusesports.com/guides/' );
    }

    model.linkToUnitsDatabase = function()
    {
        engine.call( 'web.launchPage', 'https://palobby.com/units/' );
    }

    model.linkToSupportWiki = function()
    {
        engine.call( 'web.launchPage', 'https://wiki.palobby.com/' );
    }

    // promotions

    if (model.events)
    {
        // clearInterval(model.updateActiveEventsTimer);

        model.updateActiveEvents2 = function()
        {
            var events = model.events() || [];

            var messages = [];

            var titans = api.content.ownsTitans();

            _.forEach(events, function(event, key)
            {
                // apply any classic overrides

                if ( ! titans && event.classic )
                    event = _.assign( {}, event, event.classic );

                var from = event.from;
                var showStart = event.showStart;

                var start = event.start;
                var finish = event.finish;

                var show = titans ? event.showTitans : event.showClassic;

                var now = Date.now();

                var activeStart = start - event.startingSeconds * 1000;

                var done = ! show || (finish && now > finish);

                var earlyExit = done || ( from && now < from ) || ( ! showStart && now < activeStart );

                if ( earlyExit )
                    return;

                var delta = false;
                var status = false;
                var timer = false;

                var active = now >= activeStart;

                if (active)
                {
                    if (event.active)
                        event = _.assign( {}, event, event.active );

                    if (event.showLive && event.stream)
                    {
                        if (now < start)
                            delta = start - now;

                        status = loc('LIVE ');
                    }
                    else if (event.showEnd && finish)
                    {
                        delta = finish - now;
                        status = loc('!LOC:ending in') + ' ';
                    }
                }
                else
                {
                    delta = start - now;
                    status = loc('!LOC:starting in') + ' ';
                }

                var text = loc(event.text);
                var link = event.link;
                var icon = event.icon;
                var streamIcon = event.streamIcon;
                var stream = event.stream;
                var streamTooltip = loc(event.streamTooltip) || '';

                if (delta)
                {
                    var seconds = delta / 1000;

                    var days = Math.floor( seconds / 86400 );

                    var hours = Math.floor( seconds / 3600 );

                    if ( hours < 10 )
                        hours = '0' + hours;

                    var minutes = Math.floor( seconds / 60 % 60 );

                    if ( minutes < 10 )
                        minutes = '0' + minutes;

                    var seconds = Math.floor( seconds % 60 );

                    if ( seconds < 10 )
                        seconds = '0' + seconds;

                    timer  = days > 1 ? days + ' ' + loc('!LOC:days') : ( hours > 0 ? hours + ':' : '') + minutes + ':' + seconds;
                }

                var message =
                {
                    text: text,
                    link: link,
                    status: status,
                    timer: timer,
                    icon: icon,
                    streamIcon: streamIcon,
                    stream: stream,
                    streamTooltip: streamTooltip
                }

                messages.push(message);
            });

            model.activeEvents(messages);
        }

        model.updateActiveEventsTimer = setInterval( model.updateActiveEvents, 1000 );

        model.updateActiveEvents();
    }
    else
    {
        model.fetchPatchNews = function ()
        {
            var html;
            var i;

            function formatDateFromTimestamp(timestamp)
            {
                var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

                // input format example: '2013-07-24.00:48:37'

                var year = timestamp.slice(0, 4);
                var month = months[Number(timestamp.slice(5, 7)) - 1];
                var day = timestamp.slice(8, 10);

                return '' + month + ' ' + day + ' ' + year;
            }

            function parseAndFixLinks(html)
            {
                var content = $.parseHTML(html);

                $(content).find('iframe').each(function()
                {
                    var url = $(this).attr('src');

                    var url2 = url + '&rel=0&autoplay=1';

                    $(this).replaceWith('<a href="' + url2 + '">' + url + '</a>');
                });

                $(content).find('a').each(function()
                {
                    $(this).click(function ()
                    {
                        if (this.href)
                            engine.call('web.launchPage', this.href);
                        return false;
                    });
                });

                return content;
            }

            var update_url = "https://planetaryannihilation.com/wp-json/wp/v2/posts?categories[]=40&per_page=1";

            $.ajax({
                type: "GET",
                url: update_url,
                contentType: "application/json",
                success: function (data, textStatus) {
                    var post, author;

                    if (data && data.length)
                    {
                        post = data[0];
                        if (post)
                        {
                            model.updateTitle(post.title.rendered);
                            model.updateUrl(post.link);
                            $('.update_content').html(parseAndFixLinks(post.content.rendered));
                            author = post.author_meta.display_name
                            if (author)
                                model.updateAuthor(author);

                            model.updateDate(formatDateFromTimestamp(post.date));
                            model.hasUpdatePost(true);
                        }
                    }

                    model.hasUpdatePost(true);
                },
                error: function () {
                    console.log('failed tor get news at : ' + update_url);
                    model.hasUpdatePost(true);
                }
            });
        }

        model.fetchCommunityVideos = function()
        {
            $.getJSON('https://cdn.services.planetaryannihilation.net/videos/').done(function(videos)
            {
                if (!_.isArray(videos))
                    videos = [];

                model.communityVideos(videos);
            });
        }

        model.promotions =
        {
            sale:
            {
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Steam Spring Sale', { discount: '75'}),
                text: loc('!LOC:Gift TITANS for __discount__% off during the Steam Summer Sale', { discount: '75'}),
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Steam Halloween Sale', { discount: '75'}),
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Steam Black Friday Sale', { discount: '75'}),
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Steam Winter Sale', { discount: '75'}),
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Steam Daily Deal', { discount: '75'}),
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Steam Weekend Deal', { discount: '75'}),
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Steam Lunar New Year Sale', { discount: '75'}),
                link: 'https://store.steampowered.com/app/386070/Planetary_Annihilation_TITANS/',
                logo: 'https://cdn.palobby.com/img/steam-icon.svg',
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Humble Indie Mega Week Sale', { discount: '75'}),
                text0: loc('!LOC:Gift TITANS for __discount__% off during the Humble Spring Sale', { discount: '75'}),
                link0: 'https://www.humblebundle.com/store/planetary-annihilation-titans',
                logo0: 'https://cdn.palobby.com/img/humble-store-icon.svg',

                stream: false,
                streamLogo: false,

                from: false,
                start: new Date( '2019-06-25 17:00:00 UTC' ).getTime(),
                finish: new Date( '2019-07-09 17:00 UTC' ).getTime(),

                showStart: false,
                showLive: false,
                showEnd: true,

                startingSeconds: 0,

                showTitans: true,
                showClassic: false,

                active:
                {
                },

                classic:
                {
                },
            },
            tournament:
            {
                text: 'Commandonut 1v1 Blind Community Tournament #2',
                link: 'https://forums.planetaryannihilation.com/threads/commandonut-1v1-blind-2-tournament.73254/',
                logo: 'https://cdn.palobby.com/img/commandonut-icon.png',

                stream: 'https://www.twitch.tv/wpmarshall',
                streamLogo: 'https://cdn.palobby.com/img/wpmarshall-icon.png',

                from: false,
                start: new Date( '2019-05-25 20:00 UTC' ).getTime(),
                finish: new Date( '2019-05-25 23:00 UTC' ).getTime(),

                showStart: true,
                showLive: true,
                showEnd: false,

                startingSeconds: 15 * 60,

                showTitans: true,
                showClassic: true,

                active:
                {
                    link: 'https://www.twitch.tv/wpmarshall',
                },

                classic:
                {
                    text: loc('!LOC:TITANS Commandonut 1v1 Blind #__number__ Community Tournament', { number: 2 }),
                },
            },
            tournament2:
            {
                text: 'Nimzo’s Competitive 2v2 Community Tournament',
                link: 'https://forums.planetaryannihilation.com/threads/nimzos-competitive-2v2-tournament.73421/#post-1150926',
                logo: 'https://cdn.palobby.com/img/commandonut-icon.png',

                stream: 'https://www.twitch.tv/wpmarshall',
                streamLogo: 'https://cdn.palobby.com/img/wpmarshall-icon.png',

                from: false,
                start: new Date( '2019-10-05 18:00 UTC' ).getTime(),
                finish: new Date( '2019-10-05 22:00 UTC' ).getTime(),

                showStart: true,
                showLive: true,
                showEnd: false,

                startingSeconds: 15 * 60,

                showTitans: true,
                showClassic: true,

                active:
                {
                    link: 'https://www.twitch.tv/wpmarshall/',
                },

                classic:
                {
                    text: loc('!LOC:TITANS Nimzo’s Competitive 2v2 Community Tournament'),
                },
            },
            tournament3:
            {
                text: 'Planetary Extinction League Season 3 Community Tournament',
                link: 'https://forums.planetaryannihilation.com/threads/planetary-extinction-league-season-3.73373/',
                logo: 'https://cdn.palobby.com/img/planetary-extinction-icon.png',

                stream: 'https://www.twitch.tv/wpmarshall',
                streamLogo0: false,
                streamLogo: 'https://cdn.palobby.com/img/wpmarshall-icon.png',

                from: false,
                start: new Date( '2019-08-10 17:00 UTC' ).getTime(),
                finish: new Date( '2019-08-10 18:30 UTC' ).getTime(),

                showStart: true,
                showLive: true,
                showEnd: false,

                startingSeconds: 15 * 60,

                showTitans: true,
                showClassic: true,

                active:
                {
                    link: 'https://www.twitch.tv/wpmarshall',
                },

                classic:
                {
                    text: loc('!LOC:TITANS Planetary Extinction League Season 3 Community Tournament'),
                },
            },
            ranked:
            {
                text1: loc('!LOC:TITANS 1v1 Ranked Season One'),
                text1b: loc('!LOC:TITANS 1v1 Ranked Season One Mid Season'),
                text: loc('!LOC:TITANS 1v1 Ranked Season Two'),
                text2b: loc('!LOC:TITANS 1v1 Ranked Season Two Mid Season'),
                text3: loc('!LOC:TITANS 1v1 Ranked Season Three'),
                text3b: loc('!LOC:TITANS 1v1 Ranked Season Three Mid Season'),
                text4: loc('!LOC:TITANS 1v1 Ranked Season Four'),
                text: loc('!LOC:TITANS 1v1 Ranked Season Four Mid Season'),
                text5: loc('!LOC:TITANS 1v1 Ranked Season Five'),
                text5b: loc('!LOC:TITANS 1v1 Ranked Season Five Mid Season'),
                text6: loc('!LOC:TITANS 1v1 Ranked Season Six'),
                text6b: loc('!LOC:TITANS 1v1 Ranked Season Six Mid Season'),

                link: 'https://planetaryannihilation.com/news/titans-1v1-ranked-season-4/',
                logo: 'https://cdn.palobby.com/img/invictus-icon.png',

                stream: false,
                streamLogo: false,

                from: false,
                start: new Date( '2019-07-25 00:00 UTC' ).getTime(),
                finish: new Date( '2019-09-06 00:00 UTC' ).getTime(),

                showStart: false,
                showLive: false,
                showEnd: true,

                startingSeconds: 0,

                showTitans: true,
                showClassic: true,

                active:
                {
                },

                classic:
                {
                },
            },

            'ranked-offline':
            {
                text: loc('!LOC:1v1 ranked will be offline for maintenance'),
                link: 'https://planetaryannihilation.com/news/panet-migration/',
                logo: 'https://cdn.palobby.com/img/invictus-icon.png',

                stream: false,
                streamLogo: false,

                from: false,
                start: new Date( '2019-07-25 00:00 UTC' ).getTime(),
                finish: new Date( '2019-07-25 04:30 UTC' ).getTime(),

                showStart: true,
                showLive: false,
                showEnd: false,

                startingSeconds: 0,

                showTitans: true,
                showClassic: true,

                active:
                {
                    text: loc('!LOC:1v1 ranked is offline for maintenance'),
                },

                classic:
                {
                },
            },

            'pa-net':
            {
                text: loc('!LOC:PA servers will be offline for up to 5 hours while we migrate to PAnet'),
                link: 'https://planetaryannihilation.com/news/panet-migration/',
                logo: 'https://cdn.palobby.com/img/icon-48x48.png',

                stream: false,
                streamLogo: false,

                from: false,
                start: new Date( '2019-05-20 15:00 UTC' ).getTime(),
                finish: new Date( '2019-05-20 20:00 UTC' ).getTime(),

                showStart: true,
                showLive: false,
                showEnd: true,

                startingSeconds: 0,

                showTitans: true,
                showClassic: true,

                active:
                {
                    text: loc('!LOC:PA servers are offline while we migrate to PAnet'),
                },

                classic:
                {
                },
            },

            'palobby':
            {
                text: loc('!LOC:Community Chat, Community Mods and palobby.com will be offline for up to one hour'),
                link: false,
                logo: 'https://cdn.palobby.com/img/icon-48x48.png',

                stream: false,
                streamLogo: false,

                from: false,
                start: new Date( '2019-07-01 05:00 UTC' ).getTime(),
                finish: new Date( '2019-07-01 05:15 UTC' ).getTime(),

                showStart: true,
                showLive: false,
                showEnd: true,

                startingSeconds: 0,

                showTitans: true,
                showClassic: true,

                active:
                {
                    text: loc('!LOC:Community Chat, Community Mods and palobby.com are offline for maintenance'),
                },

                classic:
                {
                },
            }
        };

        model.activePromotions = ko.observableArray([]);

        model.updatePromotions = function()
        {
            var promotions = model.promotions || [];

            var messages = [];

            var titans = api.content.ownsTitans();

            _.forEach(promotions, function(promotion, key)
            {
                // apply any classic overrides

                if ( ! titans && promotion.classic )
                    promotion = _.assign( {}, promotion, promotion.classic );

                var from = promotion.from;
                var showStart = promotion.showStart;

                var start = promotion.start;
                var finish = promotion.finish;

                var show = titans ? promotion.showTitans : promotion.showClassic;

                var now = Date.now();

                var activeStart = start - promotion.startingSeconds * 1000;

                var done = ! show || (finish && now > finish);

                var earlyExit = done || ( from && now < from ) || ( ! showStart && now < activeStart );

                if ( earlyExit )
                    return;

                var delta = false;
                var status = false;
                var timer = false;

                var active = now >= activeStart;

                if (active)
                {
                    if (promotion.active)
                        promotion = _.assign( {}, promotion, promotion.active );

                    if (promotion.showLive && promotion.stream)
                    {
                        if (now < start)
                            delta = start - now;

                        status = 'LIVE ';
                    }
                    else if (promotion.showEnd && finish)
                    {
                        delta = finish - now;
                        status = loc('!LOC:ending in') + ' ';
                    }
                }
                else
                {
                    delta = start - now;
                    status = loc('!LOC:starting in') + ' ';
                }

                var text = promotion.text;
                var link = promotion.link;
                var logo = promotion.logo;
                var streamLogo = promotion.streamLogo;
                var stream = promotion.stream;

                if (delta)
                {
                    var seconds = delta / 1000;

                    var days = Math.floor( seconds / 86400 );

                    var hours = Math.floor( seconds / 3600 );

                    if ( hours < 10 )
                        hours = '0' + hours;

                    var minutes = Math.floor( seconds / 60 % 60 );

                    if ( minutes < 10 )
                        minutes = '0' + minutes;

                    var seconds = Math.floor( seconds % 60 );

                    if ( seconds < 10 )
                        seconds = '0' + seconds;

                    timer  = days > 1 ? days + ' ' + loc('!LOC:days') : ( hours > 0 ? hours + ':' : '') + minutes + ':' + seconds;
                }

                var message =
                {
                    text: text,
                    link: link,
                    status: status,
                    timer: timer,
                    logo: logo,
                    streamLogo: streamLogo,
                    stream: stream,
                }

                messages.push(message);
            });

            model.activePromotions(messages);
        }

        model.updatePromotionsTimer = setInterval( model.updatePromotions, 1000 );

        model.promotionClicked = function(data, event)
        {
            var link = data.link;

            if ( link )
                engine.call( 'web.launchPage', link );
        }

        model.promotionStreamClicked = function(data)
        {
            var link = data.stream;

            if ( link )
                engine.call( 'web.launchPage', link );
        }
    }

    if (!model.openOfficialGuides)
    {
        model.openOfficialGuides = function()
        {
            engine.call( 'web.launchPage', 'https://planetaryannihilation.com/guides/' );
        }

        $( '#nav-system-designer' ).before( '<div id="nav-official-guides" style="position:relative" class="nav_item nav_item_text btn_std_ix community-nav"><div style="float: right; padding-left: 10px; padding-top: 2px; font-family:\'Glyphicons Halflings\'">&#xe164;</div><div data-bind="click: openOfficialGuides, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:OFFICIAL GUIDES') + '</div></div>' );
    }

    if (!model.openOfficialDiscord)
    {
        model.openOfficialDiscord = function()
        {
            engine.call( 'web.launchPage', 'https://discord.gg/pa' );
        }

        $( '#nav-system-designer' ).before( '<div id="nav-official-support" style="position:relative" class="nav_item nav_item_text btn_std_ix community-nav"><div style="float: right; padding-left: 10px; padding-top: 2px; font-family:\'Glyphicons Halflings\'">&#xe164;</div><div data-bind="click: openOfficialDiscord, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:OFFICIAL DISCORD') + '</div></div>' );
    }

    if (!model.openOfficialSupport)
    {
        model.openOfficialSupport = function()
        {
            engine.call( 'web.launchPage', 'https://support.planetaryannihilation.com/' );
        }

        $( '#nav-system-designer' ).before( '<div id="nav-official-support" style="position:relative" class="nav_item nav_item_text btn_std_ix community-nav"><div style="float: right; padding-left: 10px; padding-top: 2px; font-family:\'Glyphicons Halflings\'">&#xe164;</div><div data-bind="click: openOfficialSupport, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:OFFICIAL SUPPORT') + '</div></div>' );
    }

    model.openDedicatedServerReplays = function()
    {
        engine.call( 'web.launchPage', 'https://palobby.com/replays/' );
    }

    // if (api.content.usingTitans())
    //     $( '#nav-replays' ).after( '<div id="nav-dedicated-server-replays" style="position:relative" class="nav_item nav_item_text btn_std_ix community-nav"><div style="float: right; padding-left: 10px; padding-top: 2px; font-family:\'Glyphicons Halflings\'">&#xe164;</div><div data-bind="click: openDedicatedServerReplays, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:BIG GAME REPLAYS')+ '</loc></div></div>' );

    $( '#community-mods-messages' ).prepend( '<div data-bind="foreach: activePromotions"><div class="community-mods-message promotion" data-bind="click: $root.promotionClicked, attr: { \'data-link\': link }, click_sound: \'default\', rollover_sound: \'default\'"><img class="community-mods-message-logo" data-bind="visible: logo, attr: { src: logo }"/><div class="community-mods-message-block"><span class="community-mods-message-text" data-bind="text: text"> </span> <span class="community-mods-status-block" data-bind="visible:status"><span class="community-mods-status-text" data-bind="text: status"></span> <span class="community-mods-status-timer" data-bind="visible: timer, text: timer"></span></span><span class="community-mods-link-icon" data-bind="visible: link">&#xe164;</span></div><img class="community-mods-message-stream-logo" data-bind="visible: streamLogo, click: $root.promotionStreamClicked, attr: { \'data-link\': link }, clickBubble: false, attr: { src: streamLogo }"/></div></div>' );

    // add community mods menu item (visible once downloaded)

    $( '#nav_quit' ).before( '<div id="nav_mods" style="position:relative" class="nav_item nav_item_text btn_std_ix community-nav" data-bind="enabled: showCommunityModsBusy, click: navToCommunityMods, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:COMMUNITY MODS') + ' <img id="community-mods-busy" style="position:absolute;top:10px;right:10px;width:20px;height:20px" class="img_loading_animation small working std" data-bind="visible: showCommunityModsBusy" src="coui://ui/main/shared/img/working.svg""/></div>' );

    $( '#nav_quit' ).before( '<div id="nav_guides" style="position:relative" class="nav_item nav_item_text btn_std_ix community-nav"><div style="float: right; padding-left: 10px; padding-top: 2px; font-family:\'Glyphicons Halflings\'">&#xe164;</div><div data-bind="click: linkToUnitsDatabase, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:UNIT DATABASE') + '</div></div>' );

    // $( '#nav_quit' ).before( '<div id="nav_support" style="position:relative" class="nav_item nav_item_text btn_std_ix community-nav"><div style="float: right; padding-left: 10px; padding-top: 2px; font-family:\'Glyphicons Halflings\'">&#xe164;</div><div data-bind="click: linkToSupportWiki, click_sound: \'default\', rollover_sound: \'default\'">' + loc('!LOC:COMMUNITY SUPPORT') + '</div></div>' );

    if ( window.gNoMods )
    {
       $( '#community-mods-messages' ).prepend( '<div class="community-mods-message">' + loc('!LOC:MODS DISABLED BY --NOMODS') + '</div>' );
    }

    model.linkToPAMM = function()
    {
        engine.call( 'web.launchPage', 'https://wiki.palobby.com/wiki/Obsolete_Planetary_Annihilation_Titans_%26_Classic_PA_Mod_Manager_PAMM' );
    }

    model.showRanked = ko.computed( function()
    {
        return api.content.usingTitans() && ! CommunityModsManager.pammDetected();
    });

    model.showLeague = model.showRank; // for backwards compatibility with mods

    if ( CommunityModsManager.pammDetected() )
    {
       $( '#community-mods-messages' ).prepend( '<div class="community-mods-message error" data-bind="click: linkToPAMM"><span class="community-mods-text-block">' + loc('!LOC:TO PLAY 1V1 RANKED USE COMMUNITY MODS AND AVOID ISSUES <br />Please follow the wiki instructions to remove PAMM and your filesystem mods') + '</span><span class="community-mods-link-icon">&#xe164;</span></div>' );
    }

    model.linkToLegacy = function()
    {
        engine.call( 'web.launchPage', 'https://support.planetaryannihilation.com/kb/faq.php?id=257' );
    }

    // if ( window.gBuild.indexOf('legacy') == -1 )
    //     $( '#community-mods-messages' ).prepend( '<div class="community-mods-message" data-bind="click: linkToLegacy"><span class="community-mods-text-block">' + loc('!LOC:If you have any issues you can switch back to the legacy build!') + '</span><span class="community-mods-link-icon">&#xe164;</span></div>' );

    model.linkToModern = function()
    {
        engine.call( 'web.launchPage', 'https://support.planetaryannihilation.com/kb/faq.php?id=245' );
    }

    // if ( window.gBuild.indexOf('legacy') != -1 )
    //     $( '#community-mods-messages' ).prepend( '<div class="community-mods-message" data-bind="click: linkToModern"><span class="community-mods-text-block">' + loc('!LOC:Please try the modern build!') + '</span><span class="community-mods-link-icon">&#xe164;</span></div>' );

    if (!localStorage.community_mods_mt_enabled)
    {
        localStorage.community_mods_mt_enabled = true;
        api.settings.set('server','multi_threading', 'ON'); api.settings.save();
    }

// patch until next update

    model.ladderSeasonText = ko.computed(function()
    {
        return ['!LOC:Season ends __date__', { date: '2020-07-24 00:00 UTC' }];
    });

    model.rejoinGame = function () {
        model.showReconnect(false);

        model.gameHostname(null);
        model.gamePort(null);
        model.isLocalGame(false);
        model.serverType('uber');
        model.serverSetup(undefined);

// try to set game type, mod identifiers and uuid if we have matching reconnect info

        var reconnectToGameInfo = model.reconnectToGameInfo();

console.log( 'rejoinGame' );
console.log( JSON.stringify(reconnectToGameInfo) );

        var gameType = undefined;
        var mods = undefined;
        var uuid = '';

        if ( reconnectToGameInfo && reconnectToGameInfo.lobby_id == model.lobbyId() && reconnectToGameInfo.uberId == model.uberId() ) {
            gameType = reconnectToGameInfo.type;
            mods = reconnectToGameInfo.mods;
            uuid = reconnectToGameInfo.uuid;
        }

        model.gameType( gameType );
        model.gameModIdentifiers( mods );
        model.uuid( uuid );

        var params = {
            content: model.reconnectContent(),
        };
        window.location.href = 'coui://ui/main/game/connect_to_game/connect_to_game.html?' + $.param(params);
    };

    var userSystemsChecked = false;

    function checkUserSystems()
    {
console.log( 'Community Mods is checking user systems database' );

        var request = indexedDB.open( 'misc', 1 );

        request.onupgradeneeded = function (event)
        {
console.log( 'Community Mods is creating user systems database object store' );
            var db = event.target.result;
            db.createObjectStore( 'misc', { keyPath: 'db_key' } );
        };

        request.onsuccess = function( event )
        {
            var db = event.target.result;

            if ( db.objectStoreNames.length == 0 )
            {
console.log( 'Community Mods is deleting invalid user systems database with no object store' );

                db.close();

                indexedDB.deleteDatabase( 'misc' );

                if ( userSystemsChecked )
                {
                    return;
                }

                userSystemsChecked = true;

                checkUserSystems();

                return;
            }

            var valid = [];

            var systems = localStorage.systems;

            var store = db.transaction( [ 'misc' ], 'readonly' ).objectStore( 'misc' ).openCursor().onsuccess = function( event )
            {
                var cursor = event.target.result;

                if ( cursor )
                {
                    var value = cursor.value;

                    if ( value.value )
                    {
                        valid.push( value.db_key );
                    }

                    cursor.continue();
                }
                else
                {
                    var validCount = valid.length;

                    if ( validCount == 0 )
                    {
console.log( 'Community Mods is creating empty users systems' );

                        DataUtility.addObject( 'misc', [] ).then( function( db_key )
                        {
                            if ( db_key )
                            {
                                localStorage.systems = db_key;
                            }
                        });

                        return;
                    }
                    else if ( validCount == 1 )
                    {
                        var db_key = valid[ 0 ];

                        if ( systems != db_key )
                        {
                            localStorage.systems = db_key;
console.log( 'Community Mods fixed lost user systems database with key ' + db_key );
                        }
                    }
                    else
                    {
console.log( 'Community Mods found multiple keys for user systems database' );
console.log( JSON.stringify( valid ) );
                    }
                }
            };

            db.close();
        };
    }

    checkUserSystems();

    // $( '#community-mods-messages' ).prepend( '<div class="community-mods-message error">Servers are currently offline in some regions... we are working on it!</div>' );
}

function CommunityModsSetup()
{
    loadCSS( 'coui://download/community-mods-start.css' );

    SPLASH_DELAY_SECONDS = 0;

    $.holdReady( true );

    if ( window.CommunityModsManager )
    {
        console.log( 'CommunityModsManager already loaded in start' );
    }
    else
    {
        console.log( 'loading CommunityModsManager in start' );

        if ( ! loadScript( 'coui://download/community-mods-manager.js' ) )
        {
            $.holdReady( false );
            return;
        }
    }

    var start = Date.now();

    var deferred = $.Deferred();

    api.file.unmountAllMemoryFiles = function()
    {
console.log( 'Community Mods is preventing unmountAllMemoryFiles' );
    }

// check uberbar once on startup without reload to set timestamps

    if ( ! sessionStorage[ 'community_mods_started' ] )
    {
api.debug.log( 'Community Mods startup' );
        sessionStorage[ 'community_mods_started' ] = true;
        CommunityModsManager.checkUberbar( false );
        CommunityModsManager.checkInstalledMods();
    }

// this is a backup just in case a reset was not done and bypassed transit

    if ( sessionStorage.community_mods_reset_required )
    {
// reset required
        CommunityModsManager.resetServerMods().always( function( data )
        {
            CommunityModsManager.remountClientMods().always( function( data )
            {
                delete sessionStorage.community_mods_reset_required;
                deferred.resolve();
            });
        });
    }
    else
    {
        deferred.resolve();
    }

    deferred.always( function( results )
    {
console.log( ( Date.now() - start ) / 1000 + ' seconds to startup ready' );

        $.holdReady( false );

        CommunityModsManager.busy2( false );
    });
}

try
{
    CommunityModsSetup();
}
catch ( e )
{
    console.error( e.message );

    $.holdReady( false );
}
