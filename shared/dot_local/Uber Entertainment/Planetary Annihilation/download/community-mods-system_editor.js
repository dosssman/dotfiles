// (C) COPYRIGHT 2016-2019 palobby.com All rights reserved.

try
{
    api.camera.lookAt = function(target, smooth)
    {
        if (! _.isString(target))
            target = JSON.stringify(target);

        return engine.call('camera.lookAt', target, !!smooth);
    }
}
catch ( e )
{
    console.error( e );
    console.trace();
}