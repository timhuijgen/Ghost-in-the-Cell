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
 * Implement minimum robot counts based on priority
 * Code to overtake factory after enemy takeover
 * Better priority calculations
 * Anti bomb code
 * Attack target from distributed factories instead of 1 to overtake all
 */

var game = new Game(initialize());

while(true) {
    game.tick();
}