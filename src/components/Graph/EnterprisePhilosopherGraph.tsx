'use client';

import React, { useState, useEffect, useRef, useCallback, forwardRef, useMemo } from 'react';
import { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';

import { GraphNode, GraphLink, PhilosopherData } from '@/types/graph';
import { paintStandardNode } from '@/utils/canvasUtils';

// Function to add alpha channel to hex color
const addAlpha = (color: string, opacity: number): string => {
  if (!color || !color.startsWith('#')) {
    console.warn(`Invalid color format for addAlpha: ${color}. Using fallback.`);
    return `rgba(128, 128, 128, ${opacity})`; // Fallback grey
  }
  const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase().padStart(2, '0');
};

// Function to paint the highlight effect behind a selected node
const paintSelectedHighlight = (node: NodeObject, ctx: CanvasRenderingContext2D, color: string, baseRadius: number = 5) => {
  if (!node.x || !node.y) return;

  const highlightRadius = baseRadius * 1.8;
  ctx.beginPath();
  ctx.arc(node.x, node.y, highlightRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = addAlpha(color, 0.4); // Use addAlpha here
  ctx.fill();
};

// Function to paint the invisible pointer interaction area for a node
const paintStandardNodePointerArea = (node: NodeObject, color: string, ctx: CanvasRenderingContext2D) => {
  const radius = ((node as GraphNode).size || 5) * 1.5; 
  const nodeX = node.x ?? 0;
  const nodeY = node.y ?? 0;

  ctx.fillStyle = color; 
  ctx.beginPath();
  ctx.arc(nodeX, nodeY, radius, 0, 2 * Math.PI, false);
  ctx.fill();
};

const ForceGraph = React.lazy(() => import('react-force-graph-2d'));

interface EnterprisePhilosopherGraphProps {
  data: PhilosopherData;
  width: number;
  height: number;
  physicsEnabled: boolean;
  selectedLayout: string;
  zoomLevel?: number; 
  onNodeClick?: (node: NodeObject, event: MouseEvent) => void; 
  onNodeHover?: (node: NodeObject | null) => void; 
  themeColors: {
    primary: string;
    secondary: string;
    muted: string;
    lightMuted: string;
    background: string;
  };
  selectedNodeId: string | null;
}

const EnterprisePhilosopherGraph = forwardRef<ForceGraphMethods, EnterprisePhilosopherGraphProps>(
  ({
    data,
    width,
    height,
    physicsEnabled,
    selectedLayout,
    zoomLevel,
    onNodeClick,
    onNodeHover,
    themeColors,
    selectedNodeId,
  }, ref) => {
    const graphRef = useRef<ForceGraphMethods | undefined>(undefined); 
    const workerRef = useRef<Worker | null>(null);
    const [processedData, setProcessedData] = useState<PhilosopherData | null>(null);
    const [layoutComplete, setLayoutComplete] = useState<boolean>(false);
    const [physicsEnabledState, setPhysicsEnabledState] = useState<boolean>(physicsEnabled); 
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    const highlightNodes = useRef(new Set<string>());
    const highlightLinks = useRef(new Set<GraphLink>());
    const [hoverNode, setHoverNode] = useState<NodeObject | null>(null);
    const [selectedNode] = useState<GraphNode | null>(null);

    // --- Helper Functions (Define before usage) ---
    const getNodeId = (node: string | number | NodeObject | undefined): string | number | undefined => {
      if (typeof node === 'object' && node !== null && node.id !== undefined) {
        return node.id;
      }
      if (typeof node === 'string' || typeof node === 'number') {
        return node;
      }
      return undefined;
    };

    const findNodeById = useCallback((nodeId: string | number | undefined): GraphNode | undefined => {
      if (!processedData || !processedData.nodes || nodeId === undefined) {
        return undefined;
      }
      const idString = String(nodeId);
      return processedData.nodes.find(node => String(node.id) === idString);
    }, [processedData]); 

    const processGraphData = useCallback(() => {
      let nodesWithPositions = data.nodes;
      let linksForLayout = data.links;

      if (selectedLayout === 'radial') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2.5;
        const angleStep = (2 * Math.PI) / data.nodes.length;

        const eraOrder = ['Ancient', 'Medieval', 'Renaissance', 'Early Modern', 'Modern', 'Contemporary'];
        nodesWithPositions = data.nodes
          .slice() 
          .sort((a, b) => {
            const eraAIndex = eraOrder.indexOf(a.era ?? '');
            const eraBIndex = eraOrder.indexOf(b.era ?? '');
            return eraAIndex - eraBIndex; 
          })
          .map((node, index) => ({
            ...node,
            fx: centerX + radius * Math.cos(angleStep * index),
            fy: centerY + radius * Math.sin(angleStep * index),
          }));
        linksForLayout = data.links;
        
        setLayoutComplete(true); // Mark layout as complete for radial
      } else if (selectedLayout === 'hierarchical') {
        console.warn("Hierarchical layout not fully implemented.");
        setLayoutComplete(true); // Mark complete even if not fully implemented
      }
      // else: Default force-directed layout doesn't need pre-processing here

      // Ensure nodes have valid IDs before setting state
      const validatedNodes = nodesWithPositions.map(n => ({ ...n, id: n.id ?? `node-${Math.random()}` }));

      setProcessedData({ nodes: validatedNodes, links: linksForLayout });
      setIsLoading(false);
      if (selectedLayout !== 'force') {
        setLayoutComplete(true); // Mark layout as complete if not using physics
      } else {
        setLayoutComplete(false); // Physics will determine completion
      }
    }, [data, width, height, selectedLayout]); 

    // Memoize graph data processing to prevent unnecessary re-renders
    const processedGraphData = useMemo(() => {
      if (!processedData) return {
          nodes: [],
          links: [],
          minInfluence: 0,
          maxInfluence: 0,
          neighbors: new Set<string>()
      }; 

      const { nodes, links } = processedData;
      const influenceScores = nodes.map(n => n.influenceScore || 0);
      const minInfluence = influenceScores.length > 0 ? Math.min(...influenceScores) : 0;
      const maxInfluence = influenceScores.length > 0 ? Math.max(...influenceScores) : 0;

      const neighbors: Set<string> = new Set();
      if (selectedNodeId) {
        links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? String((link.source as GraphNode).id) : String(link.source);
          const targetId = typeof link.target === 'object' ? String((link.target as GraphNode).id) : String(link.target);
          // Compare selectedNodeId as string
          if (sourceId === selectedNodeId) neighbors.add(targetId);
          if (targetId === selectedNodeId) neighbors.add(sourceId);
        });
      }

      return { nodes, links, minInfluence, maxInfluence, neighbors };
    }, [processedData, selectedNodeId]);

    // Node size based on influence score
    const getNodeVal = useCallback((node: NodeObject) => {
      const graphNode = node as GraphNode; // Cast inside if needed for custom props
      // Provide defaults for potentially undefined values from processedGraphData
      const { minInfluence, maxInfluence } = processedGraphData; // Already defaulted in useMemo
      if (maxInfluence === minInfluence) return 5; // Default size if all scores are the same
      const score = graphNode.influenceScore || 0;
      // Prevent division by zero if min/max are somehow still equal despite the check
      const scale = maxInfluence > minInfluence ? (score - minInfluence) / (maxInfluence - minInfluence) : 0;
      return 3 + scale * 12; // Scale size between 3 and 15
    }, [processedGraphData]);

    // Node color based on selection/hover
    const getNodeColor = useCallback((node: NodeObject) => {
      const graphNode = node as GraphNode; // Cast for custom props
      // Provide default for neighbors set from processedGraphData
      const { neighbors } = processedGraphData; // Already defaulted in useMemo

      if (selectedNodeId && String(graphNode.id) === selectedNodeId) { // Ensure string comparison
        return themeColors.secondary; // Highlight selected node
      } 
      if (hoverNode && graphNode.id === hoverNode.id) {
        return themeColors.primary; // Highlight hovered node
      } 
      if (selectedNodeId && neighbors.has(String(graphNode.id))) {
        return themeColors.primary; // Highlight neighbors of selected node
      }
      if (!selectedNodeId && hoverNode && neighbors.has(String(graphNode.id))) { // Use the defaulted neighbors set and ensure string ID
        // Also highlight neighbors on hover when nothing is selected
        return themeColors.primary; 
      }
      // Default color - could add era-based coloring here too
      return themeColors.muted;
    }, [selectedNodeId, hoverNode, themeColors, processedGraphData.neighbors]);

    // Link color based on selection/hover - Use LinkObject type
    const getLinkColor = useCallback((link: LinkObject) => {
      const graphLink = link as GraphLink; // Cast to access custom props
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);

      // 1. Determine base color based on relationship type
      let baseColor = themeColors.lightMuted; // Default to light muted (grey)
      const relation = graphLink.relation;

      switch (relation) {
        case 'Influenced by':
          baseColor = '#81c784'; // Greenish (matching legend)
          break;
        case 'Student of':
        case 'Successor & Student of': // Group with Student of
          baseColor = '#64b5f6'; // Blueish (matching legend)
          break;
        case 'Intellectual Partner':
          baseColor = '#ffb74d'; // Orangeish (matching legend)
          break;
        case 'Distant Admirer & Conceptual Disciple': // Treat as Other for now
        case 'Other': 
        default: // Fallback for any unknown relations
          baseColor = '#9e9e9e'; // Grey (matching legend "Other")
          break;
      }

      // 2. Apply hover/selection effects
      const isSelectedLink = selectedNodeId && (String(sourceId) === selectedNodeId || String(targetId) === selectedNodeId);
      const isHoverLink = hoverNode && (String(sourceId) === String(hoverNode.id) || String(targetId) === String(hoverNode.id));

      // Highlight: Use base color without added alpha
      if (isSelectedLink || isHoverLink) {
        return baseColor; 
      }

      // Dim inactive links when a node is selected: Add alpha to base color
      if (selectedNodeId && !isSelectedLink) {
         return addAlpha(baseColor, 0.3); // Dim significantly
      }
      
      // Default: Use base color with standard alpha (matching legend)
      return addAlpha(baseColor, 0.6);

    }, [selectedNodeId, hoverNode, themeColors]);

    // Link width based on selection/hover - Use LinkObject type
    const getLinkWidth = useCallback((link: LinkObject): number => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      // Highlight if connected to selected or hovered node
      const isHighlighted = (selectedNodeId && (String(sourceId) === selectedNodeId || String(targetId) === selectedNodeId)) || 
                            (hoverNode && (String(sourceId) === String(hoverNode.id) || String(targetId) === String(hoverNode.id)));
      return isHighlighted ? 2.5 : 1; // Make highlighted links thicker
    }, [selectedNodeId, hoverNode]);

    // Link particle width - Use LinkObject type
    const getLinkParticleWidth = useCallback((link: LinkObject): number => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      const isHighlighted = (selectedNodeId && (String(sourceId) === selectedNodeId || String(targetId) === selectedNodeId)) || 
                            (hoverNode && (String(sourceId) === String(hoverNode.id) || String(targetId) === String(hoverNode.id)));
      return isHighlighted ? 4 : 1.5; // Make particles bigger on highlighted links
    }, [selectedNodeId, hoverNode]);

    // Internal hover handler
    const handleNodeHoverInternal = useCallback((node: NodeObject | null) => {
      setHoverNode(node);
      // Pass hover event up if handler provided
      if (onNodeHover) {
        onNodeHover(node);
      }
    }, [onNodeHover]);

    React.useImperativeHandle(ref, () => ({ 
      zoom: (...args: [] | [scale: number, durationMs?: number]) => {
        if (!graphRef.current) return 0; 
        if (args.length === 0) {
          return graphRef.current.zoom(); 
        } else {
          const [scale, durationMs] = args;
          return graphRef.current.zoom(scale, durationMs); 
        }
      },
      centerAt: (x?: number, y?: number, durationMs?: number) => {
        if (!graphRef.current) return undefined;
        return graphRef.current.centerAt(x, y, durationMs);
      },
      zoomToFit: (durationMs?: number, padding?: number) => {
        if (!graphRef.current) return undefined;
        return graphRef.current.zoomToFit(durationMs, padding);
      }
    } as ForceGraphMethods), []);

    useEffect(() => {
      const worker = new Worker(new URL('../../app/(HomePage)/forge/philosopher-graph/forceWorker.ts', import.meta.url));
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent) => {
        const messageData: { type: string; nodes?: GraphNode[]; links?: GraphLink[] } = event.data;
        if (messageData.type === 'tick') {
        } else if (messageData.type === 'end') {
          console.log("Worker simulation finished.");
          const finalNodes = event.data.nodes as GraphNode[];
          setProcessedData(prevData => {
            if (!prevData) {
              return {
                nodes: finalNodes.map(node => ({ ...node, fx: undefined, fy: undefined })),
                links: []
              };
            }
            return {
              ...prevData,
              nodes: finalNodes.map(node => ({ ...node, fx: undefined, fy: undefined })), 
              links: prevData.links 
            };
          });
          setLayoutComplete(true);
        } else if (messageData.type === 'layoutUpdate') {
          const layoutNodes = event.data.nodes as GraphNode[];
          if (graphRef.current) {
          }
          if (layoutNodes) {
            setProcessedData(prevData => {
              if (!prevData) {
                return { nodes: layoutNodes, links: [] };
              }
              return {
                ...prevData, 
                nodes: layoutNodes.map((node: { id: string | number; x?: number; y?: number; vx?: number; vy?: number; fx?: number; fy?: number }) => ({ 
                  ...prevData.nodes.find(n => n.id === node.id), 
                  ...node 
                })),
                links: prevData.links 
              };
            });
          }
          if (!layoutComplete) setLayoutComplete(true); 
        }
      };

      return () => {
        workerRef.current?.terminate();
        console.log("Terminating worker");
        workerRef.current = null;
      };
    }, [layoutComplete, physicsEnabledState]);

    const handleNodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoverNode?.id;

      // Draw highlight effect *if* selected
      if (isSelected) {
          paintSelectedHighlight(node, ctx, themeColors.secondary, (node as GraphNode).size || 5); // secondary.main
      }

      // Draw the standard node - Removed the placeholder {} theme argument
      paintStandardNode(node as GraphNode, ctx, globalScale, isHovered ? node as GraphNode : null, isSelected ? node as GraphNode : null);

    }, [selectedNodeId, hoverNode, themeColors]); // Removed theme dependency

    const handleNodeClickInternal = useCallback((node: NodeObject, event: MouseEvent) => {
      console.log("Internal graph node clicked:", node);
      if (node.x !== undefined && node.y !== undefined && graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 600); 
        graphRef.current.zoom(2, 600); 
      }
      onNodeClick?.(node, event); // Forward to parent handler
    }, [onNodeClick, graphRef]);

    const handleLinkCanvasObject = useCallback(
      (linkObject: LinkObject, ctx: CanvasRenderingContext2D) => {
        const link = linkObject as GraphLink; 
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
        const sourceNode = findNodeById(sourceId);
        const targetNode = findNodeById(targetId);

        if (!sourceNode || !targetNode) {
          console.warn("Could not find source or target node for link", link);
          return; 
        }
        
        ctx.strokeStyle = getLinkColor(link); 
        ctx.lineWidth = getLinkWidth(link); 
        ctx.beginPath();
        if (sourceNode?.x !== undefined && sourceNode?.y !== undefined && targetNode?.x !== undefined && targetNode?.y !== undefined) {
            ctx.moveTo(sourceNode.x, sourceNode.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();
        } else {
            console.warn("Skipping link draw due to undefined node coordinates", link);
        }
      },
      [getLinkColor, getLinkWidth, findNodeById] 
    );

    useEffect(() => {
      if (graphRef.current) {
        if (physicsEnabledState) {
          graphRef.current.d3ReheatSimulation();
        } else {
          graphRef.current.pauseAnimation();
        }
      }
    }, [physicsEnabledState, graphRef]);

    useEffect(() => {
      if (graphRef.current && zoomLevel !== undefined) {
        graphRef.current.zoom(zoomLevel, 500); 
      }
    }, [zoomLevel, graphRef]); 

    useEffect(() => {
      console.log("Data or layout changed, re-processing...");
      setIsLoading(true);
      setLayoutComplete(false);
      processGraphData(); 
    }, [data, selectedLayout, processGraphData]); 

    useEffect(() => {
      if (data && data.nodes.length > 0) {
        processGraphData();
      }
    }, [data, processGraphData]); 
  
    useEffect(() => {
      if (!workerRef.current) return;

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'tick') {
        } else if (event.data.type === 'end') {
          console.log("Worker simulation finished.");
          const finalNodes = event.data.nodes as GraphNode[];
          setProcessedData(prevData => {
            if (!prevData) {
              return {
                nodes: finalNodes.map(node => ({ ...node, fx: undefined, fy: undefined })),
                links: []
              };
            }
            return {
              ...prevData,
              nodes: finalNodes.map(node => ({ ...node, fx: undefined, fy: undefined })), 
              links: prevData.links 
            };
          });
          setPhysicsEnabledState(false); 
        } else if (event.data.type === 'layoutUpdate') {
          const layoutNodes = event.data.nodes as GraphNode[];
          if (graphRef.current) {
          }
          if (layoutNodes) {
            setProcessedData(prevData => {
              if (!prevData) {
                return { nodes: layoutNodes, links: [] };
              }
              return {
                ...prevData, 
                nodes: layoutNodes.map((node: { id: string | number; x?: number; y?: number; vx?: number; vy?: number; fx?: number; fy?: number }) => ({ 
                  ...prevData.nodes.find(n => n.id === node.id), 
                  ...node 
                })),
                links: prevData.links 
              };
            });
          }
          if (!layoutComplete) setLayoutComplete(true); 
        }
      };

      workerRef.current.addEventListener('message', handleMessage);

      return () => {
        workerRef.current?.removeEventListener('message', handleMessage);
      };
    }, [layoutComplete, physicsEnabledState]); 

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full w-full">
          <p className="text-gray-500">Loading graph...</p>
        </div>
      );
    }

    return (
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        {typeof window !== 'undefined' && (
          <React.Suspense 
            fallback={
              <div className="flex justify-center items-center h-full w-full">
                <p className="text-gray-500">Loading Graph...</p>
              </div>
            }
          >
            <ForceGraph 
              ref={graphRef}
              width={width}
              height={height}
              graphData={processedGraphData} // Use processed data
              nodeId="id"        // Property to use as node ID
              nodeLabel="name"   // Display name on hover by default
              linkSource="source"  // Property for link source
              linkTarget="target"  // Property for link target
              cooldownTicks={physicsEnabledState ? 100 : 0} // Stop simulation if physics disabled
              nodeCanvasObject={handleNodeCanvasObject} 
              nodePointerAreaPaint={paintStandardNodePointerArea}
              onNodeHover={handleNodeHoverInternal} 
              onNodeClick={handleNodeClickInternal}
              linkColor={getLinkColor}
              linkWidth={getLinkWidth}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.006}
              linkDirectionalParticleWidth={getLinkParticleWidth}
              linkDirectionalParticleColor={getLinkColor}
              linkCanvasObject={handleLinkCanvasObject}
            />
          </React.Suspense>
        )}
      </div>
    );
  }
);

EnterprisePhilosopherGraph.displayName = 'EnterprisePhilosopherGraph';

export default EnterprisePhilosopherGraph;
