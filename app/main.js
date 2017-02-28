/*
 | Author: Tim Huijgen
 | Date Created: 25 Februari 2017
 |
 | Ghost in the CELL
 */

import './constants';
import Game from './Game';

/**
 *
 * Next steps
 *
 * Implement minimum robot counts
 *
 * Code to overtake factory after enemy takeover
 *
 * Fix threat calculations & sorting
 *
 * Send robots after bombs
 *
 */




var factoryCount = parseInt(readline()); // the number of factories
var linkCount = parseInt(readline()); // the number of links between factories

var links = [];
var distances = [];
var moveMap = [];

for (var i = 0; i < linkCount; i++) {
    var inputs = readline().split(' ');
    var factory1 = parseInt(inputs[0]);
    var factory2 = parseInt(inputs[1]);
    var distance = parseInt(inputs[2]);

    if(!distances[factory1]) {
        distances[factory1] = [];
    }

    if(!distances[factory2]) {
        distances[factory2] = [];
    }

    distances[factory1][factory2] = distance;
    distances[factory2][factory1] = distance;

    links.push({
        'factory_1_id': factory1,
        'factory_2_id': factory2,
        'distance': distance
    });
}

function initializeMoveMap(dist) {
    var size = dist.length;

    for(var l = 0; l < size; l += 1) {
        for(var m = 0; m < size; m += 1) {
            if ( !moveMap[ l ] ) {
                moveMap[ l ] = [];
            }
            moveMap[ l ].push( m );
        }
    }

    for (var k = 0; k < size; k += 1) {
        for (var i = 0; i < size; i += 1) {
            for (var j = 0; j < size; j += 1) {
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    moveMap[i][j] = k;
                }
            }
        }
    }
    return dist;
}

initializeMoveMap(distances);

var game = new Game(links, factoryCount, linkCount, moveMap);

while(true) {
    game.tick();
}