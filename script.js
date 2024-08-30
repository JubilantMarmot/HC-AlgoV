const graphContainer = document.getElementById('graph-container');
const startNodeInput = document.getElementById('start-node');
const endNodeInput = document.getElementById('end-node');
const runAlgorithmButton = document.getElementById('run-algorithm');
const algorithmSelect = document.getElementById('algorithm-select');
const speedSlider = document.getElementById('speed-slider');

let nodes = [];
let edges = [];
let adjacencyList = {};

function spreadNodes() {
    const rows = Math.ceil(Math.sqrt(nodes.length));
    const cols = Math.ceil(nodes.length / rows);
    const spacing = 500

    nodes.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        node.x = col * spacing + 100;
        node.y = row * spacing + 100;
    });
}

function drawGraph() {
    graphContainer.innerHTML = '';

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

    nodes.forEach(node => {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.style.left = `${node.x}px`;
        nodeElement.style.top = `${node.y}px`;
        nodeElement.innerText = node.id;
        nodeElement.dataset.id = node.id;
        graphContainer.appendChild(nodeElement);
    });
}

function initializeGraph() {
    nodes = [
        { id: 0, x: 0, y: 0 },
        { id: 1, x: 0, y: 0 },
        { id: 2, x: 0, y: 0 },
        { id: 3, x: 0, y: 0 }
    ];
    
    edges = [
        { from: 0, to: 1, weight: 10 },
        { from: 1, to: 2, weight: 15 },
        { from: 2, to: 3, weight: 20 },
        { from: 0, to: 2, weight: 25 },
        { from: 1, to: 3, weight: 30 }
    ];
    
    spreadNodes();
    drawGraph();
}

function initializeAdjacencyList() {
    adjacencyList = {};
    nodes.forEach(node => {
        adjacencyList[node.id] = [];
    });
    edges.forEach(edge => {
        adjacencyList[edge.from].push({ to: edge.to, weight: edge.weight });
        adjacencyList[edge.to].push({ to: edge.from, weight: edge.weight });
    });
}

function dijkstra(start, end) {
    initializeAdjacencyList();

    let unvisitedNodes = new Set(nodes.map(node => node.id));
    let distances = {};
    let previousNodes = {};

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

    visualizeShortestPath(start, end, previousNodes);
}

function astar(start, end) {
    initializeAdjacencyList();

    let openSet = new Set([start]);
    let closedSet = new Set();
    let gScores = {};
    let fScores = {};
    let previousNodes = {};

    nodes.forEach(node => {
        gScores[node.id] = Infinity;
        fScores[node.id] = Infinity;
        previousNodes[node.id] = null;
    });
    gScores[start] = 0;
    fScores[start] = heuristic(start, end);

    while (openSet.size > 0) {
        let currentNode = [...openSet].reduce((lowest, node) => {
            return fScores[node] < fScores[lowest] ? node : lowest;
        }, [...openSet][0]);

        if (currentNode === end) {
            return visualizeShortestPath(start, end, previousNodes);
        }

        openSet.delete(currentNode);
        closedSet.add(currentNode);

        adjacencyList[currentNode].forEach(neighbor => {
            if (closedSet.has(neighbor.to)) return;

            let tentativeGScore = gScores[currentNode] + neighbor.weight;
            if (!openSet.has(neighbor.to)) openSet.add(neighbor.to);
            else if (tentativeGScore >= gScores[neighbor.to]) return;

            previousNodes[neighbor.to] = currentNode;
            gScores[neighbor.to] = tentativeGScore;
            fScores[neighbor.to] = gScores[neighbor.to] + heuristic(neighbor.to, end);
        });
    }
}

function heuristic(node, end) {
    const nodePos = nodes.find(n => n.id === node);
    const endPos = nodes.find(n => n.id === end);
    return Math.abs(nodePos.x - endPos.x) + Math.abs(nodePos.y - endPos.y);
}

function visualizeShortestPath(start, end, previousNodes) {
    document.querySelectorAll('.start-node, .end-node, .path-node, .visited-node').forEach(el => {
        el.classList.remove('start-node', 'end-node', 'path-node', 'visited-node');
    });

    document.querySelector(`.node[data-id="${start}"]`).classList.add('start-node');
    document.querySelector(`.node[data-id="${end}"]`).classList.add('end-node');

    let path = [];
    for (let at = end; at !== null; at = previousNodes[at]) {
        path.unshift(at);
    }

    let step = 0;
    let cumulativeDelay = 0;
    const speed = parseInt(speedSlider.value, 10);

    function highlightPath() {
        if (step < path.length) {
            const nodeId = path[step];
            document.querySelector(`.node[data-id="${nodeId}"]`).classList.add('path-node');
            cumulativeDelay += speed;
            step++;
            setTimeout(highlightPath, cumulativeDelay);
        }
    }

    Object.keys(previousNodes).forEach(nodeId => {
        if (previousNodes[nodeId] !== null && nodeId !== start && nodeId !== end) {
            document.querySelector(`.node[data-id="${nodeId}"]`).classList.add('visited-node');
        }
    });

    highlightPath();
}

runAlgorithmButton.addEventListener('click', () => {
    const start = parseInt(startNodeInput.value, 10);
    const end = parseInt(endNodeInput.value, 10);
    if (!isNaN(start) && !isNaN(end) && start !== end) {
        const algorithm = algorithmSelect.value;
        if (algorithm === 'dijkstra') {
            dijkstra(start, end);
        } else if (algorithm === 'astar') {
            astar(start, end);
        }
    }
});

initializeGraph();