// (C) COPYRIGHT 2016-2019 palobby.com All rights reserved.

function CommunityModsGW()
{
    if (model.testGameState)
        return;

    // prevent default subscribe changing selection

    model.canFight.dispose();
    model.canExplore.dispose();

    model.testGameState = function(options, def)
    {
        var game = model.game();

        var curState = game.turnState();
        var result = options[curState];
        if (result === undefined)
            result = def;
        if (typeof(result) === 'function')
            result = result();
        return result;
    }

    model.canFight = ko.computed(function()
    {
        var game = model.game();

        if (model.player.moving())
            return false;
        var isBegin = game.turnState() === 'begin';
        return (isBegin || model.fighting() && !model.launchingFight()) && !!model.currentStar().ai();
    });

    model.allowLoad = function ()
    {
        var game = model.game();

        var result = model.useLocalServer()
            ? (model.useLocalServer() && game.replayName())
            : (!model.useLocalServer() && game.replayLobbyId());

        return !!result && (game.replayStar() == null || game.replayStar() === model.selection.star());
    };

    model.displayFight = ko.computed(function()
    {
        var game = model.game();

        return model.canFight() && !model.allowLoad() && model.selection.star() === game.currentStar();
    });

    model.displayLoadSave = ko.computed(function()
    {
        var game = model.game();

        return model.canFight() && model.allowLoad() && model.selection.star() === game.currentStar();
    });

    model.canExplore = ko.computed(function()
    {
        if (model.player.moving() || model.scanning())
            return false;
        return model.testGameState({begin: function() { return !!model.currentStar().hasCard() && !model.currentStar().ai(); }}, false);
    });

    model.displayExplore = ko.computed(function()
    {
        var game = model.game();

        return model.canExplore() && model.selection.star() === game.currentStar();
    });

    model.canSelectOrMovePrefix = function()
    {
        return model.testGameState({
            begin: function() {
                return !model.canExplore();
            },
            fight: function() {
                return !model.canExplore();
            },
            end: true
        }, false);
    };

    model.canSelect = function(star)
    {
        var game = model.game();
        var cheats = model.cheats;

        if (game.currentStar() === star)
            return true;

        if (!model.canSelectOrMovePrefix() && !cheats.noFog()) {
            return false;
        }

        return model.pathBetween(game.currentStar(), star, cheats.noFog());
    };

    model.pathBetween = function(from, to, noFog)
    {
        var galaxy = model.game().galaxy();

        var toExplored = galaxy.stars()[to].explored();

        var worklist = [[from]];
        while (worklist.length > 0) {
            var path = worklist.shift();
            var node = path[path.length - 1];
            var nodeNeighbors = galaxy.neighborsMap()[node];

            for (var neighbor = 0; neighbor < nodeNeighbors.length; ++neighbor)
            {
                var other = nodeNeighbors[neighbor];

                // Don't allow loops.
                if (_.contains(path, other))
                    continue;

                if (other === to)
                {
                    var previous = _.last( path );

                    // prevent pathing through unexplored systems for fog of war

                    var explored = galaxy.stars()[previous].explored() || toExplored;

                    if ( ! explored && ! noFog )
                        continue;

                    path.push(other);

                    return path;
                }

                var otherStar = galaxy.stars()[other];
                var otherVisited = otherStar.history().length > 0;

                var valid = noFog ? otherVisited : otherStar.explored();

                if (valid)
                {
                    var newPath = _.cloneDeep(path);
                    newPath.push(other);
                    worklist.push(newPath);
                }
            }
        }

        return null;
    };

    model.canMove = ko.computed(function()
    {
        var game = model.game();
        var cheats = model.cheats;

        if (model.player.moving())
            return false;

        var galaxy = game.galaxy();
        var from = game.currentStar();
        var to = model.selection.star();

        if ((to < 0) || (to > galaxy.stars().length))
            return false;

        if (!model.canSelectOrMovePrefix())
            return false;

        if (from === to)
            return false;

        return model.pathBetween(from, to, cheats.noFog());
    });

    model.displayMove = ko.computed(function()
    {
        return model.canMove();
    });

    model.move = function()
    {
        var game = model.game();
        var cheats = model.cheats;

        var star = model.selection.star();
        var path = game.galaxy().pathBetween(game.currentStar(), star, cheats.noFog());
        if (path)
        {
            // Discard the source node.
            path.shift();

            model.moveStep(path);
        }
        else
            console.error("Unable to find path for move command", game.currentStar(), star);
    };
}

try
{
    CommunityModsGW();
}
catch ( e )
{
    console.error( e );
    console.trace();
}
