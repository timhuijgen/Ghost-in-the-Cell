/*
 | Author: Tim Huijgen
 | Date Created: 25 February 2017
 |
 | Ghost in the CELL
 */

import './constants';
import Game from './Game';
import initialize from './initialize';

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



var game = new Game(initialize());

while(true) {
    game.tick();
}