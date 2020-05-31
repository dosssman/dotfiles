// (C) COPYRIGHT 2016-2019 palobby.com All rights reserved.

function CommunityModsSetup()
{

    if ( window.CommunityModsManager )
    {
        console.log( 'CommunityModsManager already loaded in gw_referee' );
    }
    else
    {
        console.log( 'loading CommunityModsManager in gw_referee' );

        if ( ! loadScript( 'coui://download/community-mods-manager.js' ) )
        {
            return;
        }
    }

    api.file.unmountAllMemoryFiles = function()
    {
console.log( 'Community Mods is reloading after unmountAllMemoryFiles' );
        sessionStorage.community_mods_reset_required = true;

// classic tutorial check

        if ( api.content.usingTitans() || ! window.model || ! model.game || ! model.game().isTutorial() )
            return CommunityModsManager.remountClientMods();

        var deferred = $.Deferred();

        CommunityModsManager.remountClientMods().always( function()
        {
            $.getJSON( 'coui://pa/units/unit_list.json' ).done( function( unitList )
            {
                if ( ! unitList || ! unitList.units )
                    return deferred.resolve();

                unitList.units = _.union( unitList.units,
                [
                    "/pa/units/commanders/tutorial_ai_commander/tutorial_ai_commander.json", "/pa/units/commanders/tutorial_ai_commander_2/tutorial_ai_commander_2.json", "/pa/units/commanders/tutorial_ai_commander_3/tutorial_ai_commander_3.json", "/pa/units/commanders/tutorial_player_commander/tutorial_player_commander.json", "/pa/units/commanders/tutorial_titan_commander/tutorial_titan_commander.json"
                ]);

                cookedFiles =
                {
                    '/pa/units/unit_list.json': JSON.stringify( unitList )
                }

                api.file.mountMemoryFiles( cookedFiles ).always( function()
                {
                    deferred.resolve();
                });

            }).fail( function()
            {
                deferred.resolve();
            });
        });

        return deferred;
    }
}

try
{
    CommunityModsSetup();
}
catch ( e )
{
    console.log( e );
    console.log( JSON.stringify( e ) );
}
