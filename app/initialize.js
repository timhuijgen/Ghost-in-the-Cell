export default function() {
    var factoryCount = parseInt(readline()); // the number of factories
    var linkCount = parseInt(readline()); // the number of links between factories
    var distances = [];


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
    }

    return {
        distances,
        factoryCount,
        linkCount
    }
}