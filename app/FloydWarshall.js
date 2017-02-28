export default function (distances) {
    var size = distances.length,
        moveMap = [];

    for (var l = 0; l < size; l += 1) {
        for (var m = 0; m < size; m += 1) {
            if (!moveMap[l]) {
                moveMap[l] = [];
            }
            moveMap[l].push(m);
        }
    }

    for (var k = 0; k < size; k += 1) {
        for (var i = 0; i < size; i += 1) {
            for (var j = 0; j < size; j += 1) {
                if (distances[i][j] > distances[i][k] + distances[k][j]) {
                    distances[i][j] = distances[i][k] + distances[k][j];
                    moveMap[i][j] = k;
                }
            }
        }
    }
    return moveMap;
}
