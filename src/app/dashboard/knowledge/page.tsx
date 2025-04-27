/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  CheckIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Paragraph from '@/components/Common/Paragraph';
import { Button } from '@/components/ui/button';
import ForceGraph, { ForceGraphMethods, LinkObject, NodeObject } from 'react-force-graph-2d';
import { Loader2 } from 'lucide-react';

interface GraphNode {
  id?: string | number;
  label?: string;
  description?: string;
  size?: number;
}

interface GraphLink {
  source: string | number | GraphNode;
  target: string | number | GraphNode;
  label: string;
}
interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Sample knowledge graph data
const sampleGraphData = {
  nodes: [
    { id: 1, label: 'Machine Learning', description: 'Field of AI focused on creating systems that learn from data' },
    { id: 2, label: 'Neural Networks', description: 'Computing systems inspired by biological neural networks' },
    { id: 3, label: 'Data Analysis', description: 'Process of inspecting and modeling data' },
    { id: 4, label: 'Python', description: 'Programming language commonly used in AI' },
    { id: 5, label: 'TensorFlow', description: 'Open-source machine learning framework' },
    { id: 6, label: 'Deep Learning', description: 'Subset of ML using multi-layered neural networks' },
    { id: 7, label: 'Andrew Ng', description: 'Computer scientist and AI researcher' },
    { id: 8, label: 'Supervised Learning', description: 'Training with labeled data' },
    { id: 9, label: 'AI Ethics', description: 'Ethical considerations in AI development' },
    { id: 10, label: 'ML Research Paper', description: 'Academic document on ML advancements' }
  ],
  links: [
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

// AI setup
const AI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

export function KnowledgeGraphPage() {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData>(sampleGraphData);
  const [graphDimensions, setGraphDimensions] = useState({ width: 600, height: 400 });
  
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<GraphData>(sampleGraphData);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [showNodeInfo, setShowNodeInfo] = useState(false);
  
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [isRemoveNodeModalOpen, setIsRemoveNodeModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isRemoveLinkModalOpen, setIsRemoveLinkModalOpen] = useState(false);
  const [isNewGraphModalOpen, setIsNewGraphModalOpen] = useState(false);
  const [addNodeFormData, setAddNodeFormData] = useState<GraphNode>({});
  const [removeNodeFormData, setRemoveNodeFormData] = useState<string>('')
  const [addLinkFormData, setAddLinkFormData] = useState<{source?: string, target?: string, label?: string}>({});
  const [removeLinkFormData, setRemoveLinkFormData] = useState<{source?: string, target?: string}>({});
  const [newGraphPrompt, setNewGraphPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: "", type: "success" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter nodes based on search or type filter
  useEffect(() => {
    if (searchText) {
      const filteredNodes = graphData.nodes.filter(node => 
        node.label?.toLowerCase().includes(searchText.toLowerCase())
      );
      const filteredNodeIds = filteredNodes.map(object => object.id);
      // ForceGraph automatically replaces link source and target with GraphNodes instead of numbers
      const filteredLinks = graphData.links.filter(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        return filteredNodeIds.includes(sourceId) && filteredNodeIds.includes(targetId);
      });
      setFilteredData({
        nodes: filteredNodes,
        links: filteredLinks,
      });
    } else {
      setFilteredData(graphData);
    }
  }, [searchText, graphData]);

  // Reset to initial state when no filters are active
  useEffect(() => {
    if (!searchText) {
      setFilteredData(graphData);
    }
  }, [searchText]);

  {/* Knowledge graph functions */}
  // Resize force graph
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ResizeObserver) {
      setGraphDimensions({ width: 600, height: 400 });
      return;
    }

    const resizeObserver = new window.ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setGraphDimensions({ width, height });
      }
    });

    if (graphContainerRef.current) {
      resizeObserver.observe(graphContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Function for drawing nodes
  const handleNodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Draw highlight effect if selected
    if (node.id === selectedNodeId) {
      if (!node.x || !node.y) return;
      const highlightRadius = ((node as GraphNode).size || 5) * 1.8;
      ctx.beginPath();
      ctx.arc(node.x, node.y, highlightRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(128, 128, 128, 0.4)'; // Use addAlpha here
      ctx.fill();
    }

    // Draw the standard node
    const fontSize = 12 / globalScale;
    const nodeSize = node.size || 5;
    const nodeX = node.x ?? 0;
    const nodeY = node.y ?? 0;
    const outlineColor = 'rgba(0, 0, 0, 0.7)';
    let color = '#00695C';
    if (node === selectedNode) {
        color = '#B8860B';
    } else if (node === hoverNode) {
        color = '#bdbdbd';
    }

    // Draw node circle
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, nodeSize, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw outline if selected or hovered
    if (node.id === selectedNodeId || node.id === hoverNode?.id) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
    }

    // Draw node label
    if (globalScale > 0.5) { 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#212121';
        ctx.font = `${fontSize}px 'Public Sans', Roboto, "Helvetica Neue", Arial, sans-serif`;
        // Position label below the node circle
        ctx.fillText(node.label, nodeX, nodeY + nodeSize + (fontSize / 2)); 
    }

  }, [selectedNodeId, selectedNode, hoverNode]); // Removed theme dependency

  const handleNodeClick = useCallback((node: NodeObject) => {
    if (node.x !== undefined && node.y !== undefined && graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 600);
      graphRef.current.zoom(2, 600);
    }
    const nodeData = graphData.nodes.find(n => n.id === node.id);
    if (nodeData) {
      setSelectedNode(nodeData);
      setSelectedNodeId(Number(nodeData.id));
      setShowNodeInfo(true);
    } else {
      setSelectedNode(node as GraphNode);
      setSelectedNodeId(node ? Number(node.id) : null);
    }
  }, [graphData.nodes, graphRef]);
  
  const handleNodeHover = useCallback((node: NodeObject | null) => {
    setHoverNode(node);
  }, []);
  
  const getNodeId = (node: string | number | NodeObject | undefined): string | number | undefined => {
    if (typeof node === 'object' && node !== null && node.id !== undefined) {
      return node.id;
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return node;
    }
    return undefined;
  };
  
  const getLinkWidth = useCallback((link: LinkObject): number => {
    const sourceId = getNodeId(link.source);
    const targetId = getNodeId(link.target);
    // Make link thicker if connected to selected or hovered node
    const isHighlighted = (selectedNodeId && (Number(sourceId) === selectedNodeId || Number(targetId) === selectedNodeId)) || 
                          (hoverNode && (Number(sourceId) === Number(hoverNode.id) || Number(targetId) === Number(hoverNode.id)));
    return isHighlighted ? 2.5 : 1;
  }, [selectedNodeId, hoverNode]);
  
  {/* Handle adding and removing knowledge graph nodes and links */}
  const addNode = () => {
    if(addNodeFormData.label && addNodeFormData.description && graphData.nodes.every(node => node.label !== addNodeFormData.label)) {
      setGraphData({...graphData, nodes: graphData.nodes.concat([
        {
          id: graphData.nodes.length+1,
          label: addNodeFormData.label,
          description: addNodeFormData.description
        }
      ])});
      setIsAddNodeModalOpen(false);
      showSuccessAlert("Node Added");
    } else {
      showErrorAlert("Invalid Node");
    }
  }
  
  const removeNode = () => {
    if (removeNodeFormData) {
      const filteredNodes = graphData.nodes.filter(node => 
        String(node.id) !== removeNodeFormData
      );
      const filteredLinks = graphData.links.filter(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        return String(sourceId) !== removeNodeFormData && String(targetId) !== removeNodeFormData;
      });
      setGraphData({
        nodes: filteredNodes,
        links: filteredLinks,
      });
      setIsRemoveNodeModalOpen(false);
      showSuccessAlert("Node Removed");
    } else {
      showErrorAlert("Invalid Node");
    }
  }
  
  const addLink = () => {
    if(addLinkFormData && addLinkFormData.source && addLinkFormData.label && addLinkFormData.target && addLinkFormData.source !== addLinkFormData.target &&
      graphData.links.every(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        return !(addLinkFormData.source === String(sourceId) && addLinkFormData.target === String(targetId));
      })
    ) {
      // Map links from ForceGraph LinkObjects back into GraphLinks then add new link
      setGraphData({...graphData, links: graphData.links.map(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        return {source: Number(sourceId), label: link.label, target: Number(targetId)};
      }).concat([
        {
          source: Number(addLinkFormData.source),
          label: addLinkFormData.label,
          target: Number(addLinkFormData.target)
        }
      ])});
      setIsAddLinkModalOpen(false);
      showSuccessAlert("Link Added");
    } else {
      showErrorAlert("Invalid Link");
    }
  }
  
  const removeLink = () => {
    if(removeLinkFormData && removeLinkFormData.source && removeLinkFormData.target) {
      setGraphData({...graphData, links: graphData.links.filter(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        return !(removeLinkFormData.source === String(sourceId) && removeLinkFormData.target === String(targetId));
      })});
      setIsRemoveLinkModalOpen(false);
      showSuccessAlert("Link Removed");
    } else {
      showErrorAlert("Invalid Link");
    }
  }
  
  {/* Handle graph creation, exporting, and importing */}
  const createNewGraph = async () => {
    try {
      setIsLoading(true);
      // Prepare messages for the API
      const apiMessages = [
        { 
          content: 'You are an AI assistant that transforms text into a knowledge graph as JSON. You must identify entities and their relationships.', 
          role: 'system'
        },
        {
          content: newGraphPrompt,
          role: 'user'
        }
      ];
      
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
          response_format: {
            "type": "json_schema",
            "json_schema": {
              "name": "guestInfo",
              "strict": true,
              "schema": {
                "type": "object",
                "properties":{
                  "nodes": {
                    "description": "Entities in the text",
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties":{
                        "id": {
                          "description": "Entity number starting from 1",
                          "type": "number"
                        },
                        "label": {
                          "description": "Entity name",
                          "type": "string"
                        },
                        "description": {
                          "description": "Entity description",
                          "type": "string"
                        }
                      },
                      "required": ["id", "label", "description"],
                      "additionalProperties": false
                    }
                  },
                  "links": {
                    "description": "Relationships between entities",
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties":{
                        "source": {
                          "description": "Source entity id the relationship is for",
                          "type": "number"
                        },
                        "target": {
                          "description": "Target entity id the relationship is for",
                          "type": "number"
                        },
                        "label": {
                          "description": "One or two word relationship",
                          "type": "string"
                        }
                      },
                      "required": ["source", "target", "label"],
                      "additionalProperties": false
                    }
                  }
                },
                "required": ["nodes", "links"],
                "additionalProperties": false
              }
            }
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setGraphData(JSON.parse(data.choices[0].message.content));
      setIsNewGraphModalOpen(false);
      showSuccessAlert("Knowledge graph created!");
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      showErrorAlert("Failed to create knowledge graph");
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleExport = () => {
    try {
      // Remove additional information added from ForceGraph
      const simplifiedGraphData: GraphData = {
        nodes: graphData.nodes.map(node => {
          return {id: Number(node.id), label: node.label, description: node.description};
        }),
        links: graphData.links.map(link => {
          const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
          const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
          return {source: Number(sourceId), label: link.label, target: Number(targetId)};
        })
      }
      const blob = new Blob([JSON.stringify(simplifiedGraphData)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);;
      link.download = "theoforge-knowledge-graph.json";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      showErrorAlert("Failed to download knowledge graph");
    }
  }
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        try {
          if (reader.result) {
            setGraphData(JSON.parse(typeof reader.result === 'string' ?
              reader.result : Buffer.from(reader.result).toString()));
          } else throw Error("Invalid JSON file");
        } catch (error: any) {
          console.error("Error uploading file:", error);
          showErrorAlert("Invalid JSON file");
        }
      });
      reader.readAsText(file);
      showSuccessAlert("Knowledge graph uploaded!")
    }
  }
  
  {/* Alerts */}
  const showSuccessAlert = (message: string) => {
    setShowAlert({
      show: true,
      message,
      type: "success"
    });
    
    setTimeout(() => {
      setShowAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  const showErrorAlert = (message: string) => {
    setShowAlert({
      show: true,
      message,
      type: "error"
    });
    
    setTimeout(() => {
      setShowAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  return (
    <div className="space-y-2">
      {/* Header Section */}
      <Card className="p-6 border border-gray-100 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="mb-2 font-semibold text-2xl">
              Knowledge Graph
            </h1>
            <Paragraph className="text-gray-800 mb-2">
              Visual representation of concepts, entities, and their relationships
            </Paragraph>
            <div className="flex gap-2 flex-wrap">
              <Button 
                className="flex items-center gap-2 w-32 bg-teal-500"
                size="sm"
                onClick={() => setIsNewGraphModalOpen(true)}
              >
                <PlusIcon className="h-4 w-4" /> 
                New Graph
              </Button>
              <Button
                className="flex items-center gap-2 bg-gray-300"
                size="sm"
                onClick={handleExport}
              >
                <ArrowDownOnSquareIcon className="h-4 w-4" /> 
                Export
              </Button>
              <Button
                className="flex items-center gap-2 bg-blue-500"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ArrowUpOnSquareIcon className="h-4 w-4" /> 
                Import
              </Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              className="flex items-center gap-2 w-32 bg-teal-500"
              size="sm"
              onClick={() => setIsAddNodeModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4" /> 
              Add Node
            </Button>
            
            <Button 
              className="flex items-center gap-2 w-32 bg-red-500"
              size="sm"
              onClick={() => setIsRemoveNodeModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4" /> 
              Remove Node
            </Button>
            
            <Button 
              className="flex items-center gap-2 w-32 bg-teal-500"
              size="sm"
              onClick={() => setIsAddLinkModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4" /> 
              Add Link
            </Button>
            
            <Button 
              className="flex items-center gap-2 w-32 bg-red-500"
              size="sm"
              onClick={() => setIsRemoveLinkModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4" /> 
              Remove Link
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="relative border border-gray-100 overflow-hidden transition-all rounded-xl bg-white h-full p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex-grow">
              {/* Search input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="text-gray-500 w-4 h-4"/>
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
          </div>

          <div ref={graphContainerRef} className="flex-grow relative min-h-[400px] lg:min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="relative" style={{ width: `${graphDimensions.width}px`, height: `${graphDimensions.height}px` }}>
              <ForceGraph 
                ref={graphRef}
                graphData={filteredData}
                width={graphDimensions.width}
                height={graphDimensions.height}
                nodeId="id"
                nodeLabel="label"
                linkSource="source"
                linkTarget="target"
                linkLabel="label"
                nodeCanvasObject={handleNodeCanvasObject} 
                onNodeHover={handleNodeHover}
                onNodeClick={handleNodeClick}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.006}
                linkWidth={getLinkWidth}
              />
              
              {/* Node info panel */}
              {showNodeInfo && selectedNode && (
                <div className="absolute top-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="text-base font-medium text-gray-800">
                      {selectedNode.label}
                    </h6>
                    <button 
                      onClick={() => {
                        setShowNodeInfo(false);
                        setSelectedNode(null);
                        setSelectedNodeId(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-4 h-4"></XMarkIcon>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedNode.description}
                  </p>
                </div>
              )}
              
              {/* Empty state if no nodes match filter */}
              {filteredData.nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80">
                  <InformationCircleIcon strokeWidth={1.5} className="w-12 h-12 text-gray-400 mb-2"/>
                  <h6 className="text-base font-medium text-gray-800">
                    No matching nodes found
                  </h6>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Add Node Modal */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-neutral-300 bg-white dark:bg-gray-900 relative">
            <CardHeader>
              <h1 className="font-semibold text-xl">Add New Node</h1>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Node Label
                  </Paragraph>
                  <input
                    type="text"
                    placeholder="Enter node label"
                    className="w-full p-2 border border-black rounded-lg font-sans shadow-sm text-black placeholder:text-black/60"
                    onChange={(e) => setAddNodeFormData({...addNodeFormData, label: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Description
                  </Paragraph>
                  <input
                    type="text"
                    placeholder="Enter node description"
                    className="w-full p-2 border border-black rounded-lg font-sans shadow-sm text-black placeholder:text-black/60"
                    onChange={(e) => setAddNodeFormData({...addNodeFormData, description: e.target.value})}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="mr-2 bg-red-500"
                onClick={() => {
                  setIsAddNodeModalOpen(false);
                  setAddNodeFormData({});
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-teal-500"
                onClick={() => {
                  addNode();
                }}
              >
                Add Node
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Remove Node Modal */}
      {isRemoveNodeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-neutral-300 bg-white dark:bg-gray-900 relative">
            <CardHeader>
              <h1 className="font-semibold text-xl">Remove Node</h1>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Node
                  </Paragraph>
                  <select
                    onChange={(e) => setRemoveNodeFormData(e.target.value)}
                    className="w-full p-2 border border-black rounded-lg"
                    required
                  >
                    <option value="" disabled selected>Select an option</option>
                    {graphData.nodes.map(node => 
                      <option key={node.id} value={node.id}>{node.label}</option>
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="mr-2 bg-gray-500"
                onClick={() => {
                  setIsRemoveNodeModalOpen(false);
                  setRemoveNodeFormData('');
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-500"
                onClick={() => {
                  removeNode();
                }}
              >
                Remove Node
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Add Link Modal */}
      {isAddLinkModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-neutral-300 bg-white dark:bg-gray-900 relative">
            <CardHeader>
              <h1 className="font-semibold text-xl">Add New Node</h1>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Source Node
                  </Paragraph>
                  <select
                    onChange={(e) => setAddLinkFormData({...addLinkFormData, source: e.target.value})}
                    className="w-full p-2 border border-black rounded-lg"
                    required
                  >
                    <option value="" disabled selected>Select an option</option>
                    {graphData.nodes.map(node => 
                      <option key={node.id} value={node.id}>{node.label}</option>
                    )}
                  </select>
                </div>
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Link Label
                  </Paragraph>
                  <input
                    type="text"
                    placeholder="Enter link label"
                    className="w-full p-2 border border-black rounded-lg font-sans shadow-sm text-black placeholder:text-black/60"
                    onChange={(e) => setAddLinkFormData({...addLinkFormData, label: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Target Node
                  </Paragraph>
                  <select
                    onChange={(e) => setAddLinkFormData({...addLinkFormData, target: e.target.value})}
                    className="w-full p-2 border border-black rounded-lg"
                    required
                  >
                    <option value="" disabled selected>Select an option</option>
                    {graphData.nodes.map(node => 
                      <option key={node.id} value={node.id}>{node.label}</option>
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="mr-2 bg-red-500"
                onClick={() => {
                  setIsAddLinkModalOpen(false);
                  setAddLinkFormData({});
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-teal-500"
                onClick={() => {
                  addLink();
                }}
              >
                Add Link
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Remove Link Modal */}
      {isRemoveLinkModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-neutral-300 bg-white dark:bg-gray-900 relative">
            <CardHeader>
              <h1 className="font-semibold text-xl">Remove Link</h1>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Source Node
                  </Paragraph>
                  <select
                    onChange={(e) => setRemoveLinkFormData({...removeLinkFormData, source: e.target.value})}
                    className="w-full p-2 border border-black rounded-lg"
                    required
                  >
                    <option value="" disabled selected>Select an option</option>
                    {graphData.nodes.map(node => 
                      <option key={node.id} value={node.id}>{node.label}</option>
                    )}
                  </select>
                </div>
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Target Node
                  </Paragraph>
                  <select
                    onChange={(e) => setRemoveLinkFormData({...removeLinkFormData, target: e.target.value})}
                    className="w-full p-2 border border-black rounded-lg"
                    required
                  >
                    <option value="" disabled selected>Select an option</option>
                    {graphData.nodes.map(node => 
                      <option key={node.id} value={node.id}>{node.label}</option>
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="mr-2 bg-gray-500"
                onClick={() => {
                  setIsRemoveLinkModalOpen(false);
                  setRemoveLinkFormData({});
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-500"
                onClick={() => {
                  removeLink();
                }}
              >
                Remove Link
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* New Graph Modal */}
      {isNewGraphModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-neutral-300 bg-white dark:bg-gray-900 relative">
            <CardHeader>
              <h1 className="font-semibold text-xl">New Graph</h1>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Paragraph color="blue-gray" className="mb-2 font-medium">
                    Textual Data
                  </Paragraph>
                  <input
                    type="text"
                    placeholder="Enter text to transform into a knowledge graph"
                    className="w-full p-2 border border-black rounded-lg font-sans shadow-sm text-black placeholder:text-black/60"
                    onChange={(e) => setNewGraphPrompt(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="mr-2 bg-red-500"
                onClick={() => {
                  setIsNewGraphModalOpen(false);
                  setNewGraphPrompt('');
                }}
              >
                Cancel
              </Button>
              {isLoading ? (
                <Button
                  className="bg-teal-500"
                  disabled
                >
                  <Loader2 className="animate-spin" />
                  Creating
                </Button>
              ) : (
                <Button 
                className="bg-teal-500"
                onClick={() => {
                  createNewGraph();
                }}
              >
                Create Graph
              </Button>
            )}
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Element used by import graph button to download file */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImport}
        accept=".json"
      />
      
      {/* Success/Error Alert */}
      {showAlert.show && (
        <div className={`absolute top-24 right-8 z-50 mb-5 p-4 min-w-96 rounded-lg flex items-start ${showAlert.type === "success" ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
          <div className="flex-shrink-0 mr-3">
            {showAlert.type === "success" ? 
              <CheckIcon className="h-6 w-6 text-green-500" /> : 
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" />}
          </div>
          <div>{showAlert.message}</div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraphPage;
