// (C) COPYRIGHT 2016-2020 palobby.com All rights reserved.

function CommunityMods()
{
    model.seasonText = ko.computed(function()
    {
        return ['!LOC:Season ends __date__', { date: '2020-07-24 00:00 UTC' }];
    });
}

try
{
    CommunityMods();
}
catch ( e )
{
    console.error( e );
    console.trace();
}
