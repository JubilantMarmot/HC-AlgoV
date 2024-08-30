const graphContainer = document.getElementById('graph-container');
const startNodeInput = document.getElementById('start-node');
const endNodeInput = document.getElementById('end-node');
const runAlgorithmButton = document.getElementById('run-algorithm');

let nodes = [];
let edges = [];
let graph = {};

function initializeGraph() {
    nodes = [
        { id: 0, x: 50, y: 50 },
        { id: 1, x: 200, y: 50 },
        { id: 2, x: 50, y: 200 },
        { id: 3, x: 200, y: 200 }
    ];
    
    edges = [
        { from: 0, to: 1, weight: 10 },
        { from: 1, to: 2, weight: 15 },
        { from: 2, to: 3, weight: 20 },
        { from: 0, to: 2, weight: 25 },
        { from: 1, to: 3, weight: 30 }
    ];
    
    //drawGraph();
}
