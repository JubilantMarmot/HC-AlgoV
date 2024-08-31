const graphContainer = document.getElementById('graph-container');
const startNodeInput = document.getElementById('start-node');
const endNodeInput = document.getElementById('end-node');
const runAlgorithmButton = document.getElementById('run-algorithm');
const algorithmSelect = document.getElementById('algorithm-select');
const speedSlider = document.getElementById('speed-slider');
const drawGraphButton = document.getElementById('draw-graph');
const exportGraphButton = document.getElementById('export-graph');

let nodes = [];
let edges = [];
let adjacencyList = {};
let nodeElements = {};
let edgeElements = {};
let isDrawingEdge = false;
let startNode = null;
let endNode = null;

function convertToDOT() {
    let dotString = 'graph G {\n';

    nodes.forEach(node => {
        dotString += `    ${node.id} [label="${node.id}"];\n`;
    });

    edges.forEach(edge => {
        dotString += `    ${edge.from} -- ${edge.to} [label="${edge.weight}"];\n`;
    });

    dotString += '}\n';

    return dotString;
}

function renderGraph() {
    const dotString = convertToDOT();
    const viz = new Viz();
    viz.renderSVGElement(dotString)
        .then(element => {
            graphContainer.innerHTML = '';
            graphContainer.appendChild(element);
        })
        .catch(error => {
            console.error(error);
        });
}

function initializeGraph() {
    nodes = [
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 }
    ];
    
    edges = [
        { from: 0, to: 1, weight: 10 },
        { from: 1, to: 2, weight: 15 },
        { from: 2, to: 3, weight: 20 },
        { from: 0, to: 2, weight: 25 },
        { from: 1, to: 3, weight: 30 }
    ];

    renderGraph();
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
    renderGraph();

    let path = [];
    for (let at = end; at !== null; at = previousNodes[at]) {
        path.unshift(at);
    }

    let step = 0;
    const speed = parseInt(speedSlider.value, 10) || 1000;

    function highlightPath() {
        if (step < path.length) {
            const nodeId = path[step];
            document.querySelector(`.node[data-id="${nodeId}"]`).classList.add('path-node');
            step++;
            setTimeout(highlightPath, speed);
        } else {
            path.forEach(nodeId => {
                document.querySelector(`.node[data-id="${nodeId}"]`).classList.add('visited-node');
            });
        }
    }

    highlightPath();
}

function addNode(id) {
    if (nodes.find(node => node.id === id)) return;
    nodes.push({ id });
    renderGraph();
}

function removeNode(id) {
    nodes = nodes.filter(node => node.id !== id);
    edges = edges.filter(edge => edge.from !== id && edge.to !== id);
    renderGraph();
}

function addEdge(from, to, weight) {
    if (edges.find(edge => edge.from === from && edge.to === to)) return;
    edges.push({ from, to, weight });
    renderGraph();
}

function removeEdge(from, to) {
    edges = edges.filter(edge => !(edge.from === from && edge.to === to));
    renderGraph();
}

function saveGraph() {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    a.click();
    URL.revokeObjectURL(url);
}

function loadGraph(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = JSON.parse(event.target.result);
        nodes = data.nodes;
        edges = data.edges;
        renderGraph();
    };
    reader.readAsText(file);
}

function setupNodeInteractions() {
    graphContainer.addEventListener('click', (event) => {
        const nodeId = event.target.dataset.id;
        if (nodeId) {
            if (isDrawingEdge) {
                if (startNode === null) {
                    startNode = parseInt(nodeId, 10);
                } else {
                    endNode = parseInt(nodeId, 10);
                    if (startNode !== endNode) {
                        const weight = prompt('Enter edge weight:', '10');
                        if (weight) addEdge(startNode, endNode, parseInt(weight, 10));
                    }
                    startNode = null;
                    endNode = null;
                }
                isDrawingEdge = false;
            } else {
                event.target.classList.toggle('selected-node');
            }
        }
    });
}

function setupControls() {
    drawGraphButton.addEventListener('click', initializeGraph);
    exportGraphButton.addEventListener('click', () => {
        const dotString = convertToDOT();
        const blob = new Blob([dotString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.dot';
        a.click();
        URL.revokeObjectURL(url);
    });
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
}

setupNodeInteractions();
setupControls();
initializeGraph();