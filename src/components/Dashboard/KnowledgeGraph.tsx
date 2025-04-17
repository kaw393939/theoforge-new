'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

interface PositionedNode {
  x: number;
  y: number;
  id: number;
  label: string;
  type: string;
  desc: string;
}

// Graph node types and their colors
const NODE_TYPES: {[label: string] : {label: string, color: string}} = {
  "CONCEPT": { label: 'Concept', color: 'teal' },
  "ENTITY": { label: 'Entity', color: 'blue' },
  "PERSON": { label: 'Person', color: 'purple' },
  "DOCUMENT": { label: 'Document', color: 'amber' },
  "PROCESS": { label: 'Process', color: 'green' }
};

// Sample knowledge graph data
const sampleGraphData = {
  nodes: [
    { id: 1, label: 'Machine Learning', type: 'CONCEPT', desc: 'Field of AI focused on creating systems that learn from data' },
    { id: 2, label: 'Neural Networks', type: 'CONCEPT', desc: 'Computing systems inspired by biological neural networks' },
    { id: 3, label: 'Data Analysis', type: 'PROCESS', desc: 'Process of inspecting and modeling data' },
    { id: 4, label: 'Python', type: 'ENTITY', desc: 'Programming language commonly used in AI' },
    { id: 5, label: 'TensorFlow', type: 'ENTITY', desc: 'Open-source machine learning framework' },
    { id: 6, label: 'Deep Learning', type: 'CONCEPT', desc: 'Subset of ML using multi-layered neural networks' },
    { id: 7, label: 'Andrew Ng', type: 'PERSON', desc: 'Computer scientist and AI researcher' },
    { id: 8, label: 'Supervised Learning', type: 'CONCEPT', desc: 'Training with labeled data' },
    { id: 9, label: 'AI Ethics', type: 'CONCEPT', desc: 'Ethical considerations in AI development' },
    { id: 10, label: 'ML Research Paper', type: 'DOCUMENT', desc: 'Academic document on ML advancements' }
  ],
  edges: [
    { source: 1, target: 2, label: 'includes' },
    { source: 1, target: 3, label: 'requires' },
    { source: 1, target: 8, label: 'contains' },
    { source: 2, target: 6, label: 'enables' },
    { source: 4, target: 3, label: 'used for' },
    { source: 4, target: 5, label: 'supports' },
    { source: 5, target: 2, label: 'implements' },
    { source: 6, target: 9, label: 'raises' },
    { source: 7, target: 1, label: 'researches' },
    { source: 7, target: 10, label: 'authored' },
    { source: 10, target: 1, label: 'about' },
    { source: 8, target: 3, label: 'type of' }
  ]
};

const KnowledgeGraph = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [graphData, setGraphData] = useState(sampleGraphData);
  const [searchText, setSearchText] = useState('');
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNodeInfo, setShowNodeInfo] = useState(false);
  const [filteredNodes, setFilteredNodes] = useState<PositionedNode[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Calculate positions for nodes (simple circular layout)
  const calculateNodePositions = () => {
    const centerX = 300;
    const centerY = 200;
    const radius = 150;
    const nodes = graphData.nodes.map((node, index) => {
      const angle = (index / graphData.nodes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...node, x, y };
    });
    return nodes;
  };

  const positionedNodes = calculateNodePositions();

  // Filter nodes based on search or type filter
  useEffect(() => {
    let filtered = positionedNodes;
    
    if (searchText) {
      filtered = filtered.filter(node => 
        node.label.toLowerCase().includes(searchText.toLowerCase()) ||
        node.desc.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (activeFilter) {
      filtered = filtered.filter(node => node.type === activeFilter);
    }
    
    setFilteredNodes(filtered);
  }, [searchText, activeFilter, graphData]);

  // Reset to initial state when no filters are active
  useEffect(() => {
    if (!searchText && !activeFilter) {
      setFilteredNodes(positionedNodes);
    }
  }, [searchText, activeFilter]);

  // Set initial nodes on component mount
  useEffect(() => {
    setFilteredNodes(positionedNodes);
  }, []);

  const handleNodeClick = (node: PositionedNode) => {
    setSelectedNode(node);
    setShowNodeInfo(true);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 20, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 20, 40));
  };

  const handleResetView = () => {
    setZoom(100);
    setSearchText('');
    setActiveFilter(null);
    setSelectedNode(null);
    setShowNodeInfo(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleFilterByType = (type: string) => {
    if (activeFilter === type) {
      setActiveFilter(null);
    } else {
      setActiveFilter(type);
    }
  };

  // Get color for nodes based on type
  const getNodeColors = (type: string) => {
    const colorMap: {[color: string] : {bg: string, border: string, text: string}} = {
      'teal': { bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-600' },
      'blue': { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-600' },
      'purple': { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-600' },
      'amber': { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-600' },
      'green': { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-600' },
      'gray': { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-600' }
    };

    const nodeColor = NODE_TYPES[type]?.color || 'gray';
    return colorMap[nodeColor];
  };

  // Generate a simple SVG visualization of the knowledge graph
  return (
    <div className={`relative border border-gray-100 overflow-hidden transition-all rounded-xl bg-white ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100">
        <h5 className="text-lg font-medium text-gray-800">
          Knowledge Graph
        </h5>
        <div className="flex gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-1 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex-grow">
            {/* Search input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Search nodes"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Zoom controls */}
            <button 
              onClick={handleZoomOut}
              className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="w-12 text-center text-sm">
              {zoom}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button 
              onClick={handleResetView}
              className="p-1 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </div>

        {/* Type filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto py-1">
          {Object.entries(NODE_TYPES).map(([key, { label, color }]) => {
            const colors = getNodeColors(color);
            return (
              <button 
                key={key}
                onClick={() => handleFilterByType(key)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  activeFilter === key 
                    ? `${colors.bg} ${colors.border} ${colors.text}` 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Graph visualization */}
        <div className="relative border rounded-xl overflow-hidden bg-gray-50 p-2" style={{ height: isFullscreen ? 'calc(100vh - 220px)' : '400px' }}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 600 400" 
            preserveAspectRatio="xMidYMid meet"
            style={{ 
              transform: `scale(${zoom/100})`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            {/* Draw edges */}
            {graphData.edges.map((edge) => {
              const sourceNode = positionedNodes.find(n => n.id === edge.source);
              const targetNode = positionedNodes.find(n => n.id === edge.target);
              
              // Skip edges for filtered-out nodes
              if (!filteredNodes.some(n => n.id === edge.source) || 
                  !filteredNodes.some(n => n.id === edge.target)) {
                return null;
              }
              
              if (sourceNode && targetNode) {
                // Calculate midpoint for label
                const midX = (sourceNode.x + targetNode.x) / 2;
                const midY = (sourceNode.y + targetNode.y) / 2;
                
                return (
                  <g key={`${edge.source}-${edge.target}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                    />
                    {/* Edge label */}
                    <text
                      x={midX}
                      y={midY}
                      fontSize="10"
                      fill="#64748b"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="select-none"
                    >
                      <tspan dy="-0.5em" className="bg-white px-1">{edge.label}</tspan>
                    </text>
                  </g>
                );
              }
              return null;
            })}
            
            {/* Draw nodes */}
            {filteredNodes.map((node) => {
              const nodeColor = NODE_TYPES[node.type]?.color || 'gray';
              const isSelected = selectedNode && selectedNode.id === node.id;
              
              const fillColor = {
                'teal': '#99f6e4',
                'blue': '#bae6fd',
                'purple': '#ddd6fe',
                'amber': '#fef3c7',
                'green': '#bbf7d0',
                'gray': '#e5e7eb'
              }[nodeColor];
              
              const strokeColor = {
                'teal': '#14b8a6',
                'blue': '#0ea5e9',
                'purple': '#a855f7',
                'amber': '#f59e0b',
                'green': '#22c55e',
                'gray': '#9ca3af'
              }[nodeColor];
              
              return (
                <g 
                  key={node.id} 
                  onClick={() => handleNodeClick(node)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 25 : 20}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    fontSize="11"
                    fontWeight={isSelected ? "bold" : "normal"}
                    fill="#334155"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 12 ? node.label.substring(0, 10) + '...' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Node info panel */}
        {showNodeInfo && selectedNode && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
            <div className="flex justify-between items-start mb-2">
              <h6 className="text-base font-medium text-gray-800">
                {selectedNode.label}
              </h6>
              <button 
                onClick={() => setShowNodeInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-2">
              {selectedNode.type && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNodeColors(NODE_TYPES[selectedNode.type]?.color || 'gray').bg} ${getNodeColors(NODE_TYPES[selectedNode.type]?.color || 'gray').text}`}>
                  {NODE_TYPES[selectedNode.type]?.label || 'Unknown'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {selectedNode.desc}
            </p>
            <div className="mt-3">
              <button className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                View Details
              </button>
            </div>
          </div>
        )}
        
        {/* Empty state if no nodes match filter */}
        {filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <h6 className="text-base font-medium text-gray-800">
              No matching nodes found
            </h6>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
            <button 
              className="mt-2 px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-md"
              onClick={handleResetView}
            >
              Reset View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;