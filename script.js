const graphContainer = document.getElementById('graph-container');
const startNodeInput = document.getElementById('start-node');
const endNodeInput = document.getElementById('end-node');
const runAlgorithmButton = document.getElementById('run-algorithm');

let nodes = [];
let edges = [];
let adjacencyList = {};
let shortestPaths = {};
let previousNodes = {};

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
}function initializeAdjacencyList() {
    adjacencyList = {};
    nodes.forEach(node => {
        adjacencyList[node.id] = [];
    });
    edges.forEach(edge => {
        adjacencyList[edge.from].push({ to: edge.to, weight: edge.weight });
        adjacencyList[edge.to].push({ to: edge.from, weight: edge.weight }); // Assuming undirected graph
    });
}

function dijkstra(start, end) {
    initializeAdjacencyList();

    let unvisitedNodes = new Set(nodes.map(node => node.id));
    let distances = {};
    let path = [];

    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previousNodes[node.id] = null;
    });
    distances[start] = 0;

    while (unvisitedNodes.size > 0) {
        let currentNode = [...unvisitedNodes].reduce((minNode, node) => {
            return (distances[node] < distances[minNode] ? node : minNode);
        }, [...unvisitedNodes][0]);

        if (distances[currentNode] === Infinity) break;

        unvisitedNodes.delete(currentNode);

        adjacencyList[currentNode].forEach(neighbor => {
            let alternativePath = distances[currentNode] + neighbor.weight;
            if (alternativePath < distances[neighbor.to]) {
                distances[neighbor.to] = alternativePath;
                previousNodes[neighbor.to] = currentNode;
            }
        });
    }

    visualizeShortestPath(start, end, distances, path);
}

function visualizeShortestPath(start, end, distances, path) {
    //clear the previous one if any
    document.querySelectorAll('.start-node, .end-node, .path-node, .visited-node').forEach(el => {
        el.classList.remove('start-node', 'end-node', 'path-node', 'visited-node');
    });

    document.querySelector(`.node[data-id="${start}"]`).classList.add('start-node');
    document.querySelector(`.node[data-id="${end}"]`).classList.add('end-node');

    let step = 0;
    let cumulativeDelay = 0;
    function highlightPath() {
        if (step < path.length) {
            const nodeId = path[step];
            document.querySelector(`.node[data-id="${nodeId}"]`).classList.add('path-node');
            cumulativeDelay += 1000;
            step++;
            setTimeout(highlightPath, cumulativeDelay);
        }
    }


    Object.keys(distances).forEach(nodeId => {
        if (distances[nodeId] !== Infinity && nodeId !== start && nodeId !== end) {
            document.querySelector(`.node[data-id="${nodeId}"]`).classList.add('visited-node');
        }
    });

    highlightPath();
}

runAlgorithmButton.addEventListener('click', () => {
    const start = parseInt(startNodeInput.value, 10);
    const end = parseInt(endNodeInput.value, 10);
    if (!isNaN(start) && !isNaN(end) && start !== end) {
        dijkstra(start, end);
    }
});

initializeGraph();
