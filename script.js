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
    
    drawGraph();
}

function drawGraph() {
    graphContainer.innerHTML = '';

    nodes.forEach(node => {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.style.left = `${node.x}px`;
        nodeElement.style.top = `${node.y}px`;
        nodeElement.innerText = node.id;
        nodeElement.dataset.id = node.id;
        graphContainer.appendChild(nodeElement);
    });

    edges.forEach(edge => {
        const fromNode = nodes.find(node => node.id === edge.from);
        const toNode = nodes.find(node => node.id === edge.to);
        const edgeElement = document.createElement('div');
        edgeElement.className = 'edge';
        const length = Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2));
        edgeElement.style.width = `${length}px`;
        edgeElement.style.transformOrigin = '0 0';
        edgeElement.style.transform = `rotate(${Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * 180 / Math.PI}deg)`;
        edgeElement.style.left = `${fromNode.x}px`;
        edgeElement.style.top = `${fromNode.y}px`;
        graphContainer.appendChild(edgeElement);
    });
}

function dijkstra(start, end) {
    //todo this one will take time
    const startNode = document.querySelector(`.node[data-id="${start}"]`);
    const endNode = document.querySelector(`.node[data-id="${end}"]`);
    startNode.classList.add('start-node');
    endNode.classList.add('end-node');
}

runAlgorithmButton.addEventListener('click', () => {
    const start = parseInt(startNodeInput.value, 10);
    const end = parseInt(endNodeInput.value, 10);
    if (!isNaN(start) && !isNaN(end)) {
        dijkstra(start, end);
    }
});

initializeGraph();
