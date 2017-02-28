export default class Factory {

    constructor (factory, game) {
        this.game = game;
        this.id = factory.id;
        this.owner = factory.owner;
        this.count = factory.count;
        this.production = factory.production;

        this.keep_for_defence = 0;
        this.away_on_attack = 0;
        this.incoming_for_defence = 0;
        this.defendTable = {};
    }

    update(factory) {
        this.owner = factory.owner;
        this.count = factory.count;
        this.production = factory.production;
        this.defendTable = {};

    }

    isMine() {
        return this.owner === ME;
    }

    isEnemy() {
        return this.owner === ENEMY;
    }

    hasEnemyTroopsInbound() {
        return this.incomingEnemyTroops()
            .reduce((a, b) => {
                return (a.count || 0) + (b.count || 0)
            }, 0);
    }

    hasMyTroopsInbound() {
        return this.incomingDefendingTroops()
            .reduce((a, b) => {
                return (a.count || 0) + (b.count || 0)
            }, 0);
    }

    incomingEnemyTroops() {
        return this.game.troops.filter(troop => {
            return troop.factory_id_to === this.id && troop.owner === ENEMY
        }).sort((a, b) => { return a.turns_for_arrival - b.turns_for_arrival});
    }

    incomingDefendingTroops() {
        return this.game.troops.filter(troop => {
            return troop.factory_id_to === this.id && troop.owner === ME
        }).sort((a, b) => { return a.turns_for_arrival - b.turns_for_arrival});
    }

    distanceTo(factory) {
        return this.game.distances[this.id][factory.id];
    }

    closestEnemyFactory() {
        return this.game.factories.filter(f => {
            return f.owner === flip(this.owner)
        })
            .sort((a, b) => { return a.distanceTo(this) - b.distanceTo(this); })
            .first();
    }

    closestAllyFactory() {
        return this.game.factories.filter(f => {
            return f.owner === this.owner && f.id !== this.id
        })
            .sort((a, b) => { return a.distanceTo(this) - b.distanceTo(this); })
            .first();
    }


    threat(factory = false) {
        if(this.production === 0) return 0;

        var threat_count = 0;

        if(factory) {
            threat_count += (20 - this.distanceTo(factory)) * 4;
        }

        threat_count += this.production * 10;

        threat_count -= this.count / 2;

        return threat_count;
    }

    defend() {
        this.incomingEnemyTroops().forEach(troop => {
            if(this.freeRobots() + (this.production * troop.turns_for_arrival) < troop.count) {
                if(this.production === 0) {
                    this.abandonSHIP();
                } else {

                    this.reserveForDefence(this.count);

                    if(!this.defendTable.hasOwnProperty(this.game.turn + troop.turns_for_arrival)) {
                        this.defendTable[this.game.turn + troop.turns_for_arrival] = 0;
                    }
                    this.defendTable[
                        this.game.turn + troop.turns_for_arrival
                    ] += troop.count - (this.count + (this.production * troop.turns_for_arrival));

                }
            } else {
                this.reserveForDefence(troop.count);
            }
        });
    }

    isDefending() {
        return this.freeRobots() < 0;
    }

    reinforcementsNeeded() {
        var defending = this.hasMyTroopsInbound() + this.count + this.incoming_for_defence;
        var attacking = this.hasEnemyTroopsInbound();

        return (attacking - defending > 0) ? attacking - defending : 0;
    }

    freeRobots() {
        return this.count - this.away_on_attack - this.keep_for_defence;
    }

    reserveForDefence(amount) {
        this.keep_for_defence += amount;

        if(this.freeRobots() < 0) {
            this.keep_for_defence = this.count;
            return false;
        }

        return true;
    }

    reserveForAttack(amount) {
        this.away_on_attack += amount;
    }

    reinforcementsIncoming(amount) {
        this.incoming_for_defence += amount;
    }

    abandonSHIP() {
        this.game.move(this, this.closestAllyFactory(), this.count);
    }
}