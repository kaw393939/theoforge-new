'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PhilosopherData, GraphNode, GraphLink } from '@/types/graph';
import { NodeObject, ForceGraphMethods } from 'react-force-graph-2d';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/Graph/controls/SearchBar';
import GraphLegend from '@/components/Graph/GraphLegend'; 
import AnalyticsModal from '@/components/Graph/analytics/AnalyticsModal';
import { NodeDetailPanel } from '@/components/Graph/panels/NodeDetailPanel'; 
import PageContainer from '@/components/Layout/PageContainer'; 
import resolveConfig from 'tailwindcss/resolveConfig'; 
import tailwindConfig from '../../../../../tailwind.config.js'; 

// Dynamically import the graph component to avoid SSR issues
const DynamicPhilosopherGraph = dynamic(
  () => import('@/components/Graph/EnterprisePhilosopherGraph'),
  { ssr: false }
);

// Define the page component
export default function PhilosopherGraphPage() { 
  // --- Theme Colors (Resolved from Tailwind Config - MUST BE TOP LEVEL) ---
  const fullConfig = resolveConfig(tailwindConfig);
  const themeColors = useMemo(() => {
    const getColor = (path: string[], fallback: string): string => {
      let current: any = fullConfig.theme?.colors;
      for (const key of path) {
        if (!current || typeof current !== 'object' || !(key in current)) {
          return fallback;
        }
        current = current[key];
      }
      return typeof current === 'string' ? current : fallback;
    };

    return {
      primary: getColor(['primary', '600'], '#2563EB'), // blue-600
      secondary: getColor(['secondary'], '#B8860B'), // Muted Gold
      muted: getColor(['gray', '500'], '#6B7280'), // gray-500
      lightMuted: getColor(['gray', '300'], '#D1D5DB'), // gray-300
      background: getColor(['background'], '#FFFFFF') // background
    };
  }, [fullConfig]); // Dependency: fullConfig (though it rarely changes)

  // Theme and dimensions
  // REMOVED state for fixed dimensions - will use relative sizing

  // Graph data state
  const [graphData, setGraphData] = useState<PhilosopherData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [physicsEnabled, setPhysicsEnabled] = useState<boolean>(true);
  const [selectedLayout, setSelectedLayout] = useState('force'); // e.g., 'force', 'radial'
  
  // Filtering state
  const [activeEras, setActiveEras] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null); 
  
  // Ref for the graph container div to potentially measure later if needed
  const graphContainerRef = useRef<HTMLDivElement>(null);
  
  // Create a reference to the graph component
  const graphRef = useRef<ForceGraphMethods | null>(null);
  
  // Reusable function to fetch graph data
  const loadGraphData = async (isRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add cache-busting parameter to prevent browser caching
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/data/philosophers.json${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.nodes.length} philosophers and ${data.links.length} connections`);
      
      // Reset filters only on initial load, not on refresh potentially?
      // Or always reset them? Current logic resets on both. Let's keep it for now.
      setActiveEras([]);
      setSearchQuery('');
      
      // Set the graph data
      setGraphData(data);

      // Reset the view after refresh if needed
      if (isRefresh && graphRef.current && data.nodes.length > 0) {
        setTimeout(() => { 
          if (graphRef.current) {
            try {
              graphRef.current.zoomToFit(400);
            } catch (error) {
              console.error("Error resetting view after refresh:", error);
            }
          }
        }, 100);
      }

    } catch (err) {
      const error = err as Error;
      console.error("Error fetching/loading graph data:", error);
      setError(`Failed to load philosopher data. Please try again. (${error?.message || 'Unknown error'})`);
    } finally {
      // Ensure loading state is always turned off
      setLoading(false); 
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    const fetchData = async () => {
      // Reset states before fetching
      setLoading(true);
      setError(null);
      // Don't reset graphData or activeEras here, let filter handle empty state

      try {
        // Add cache-busting parameter and headers to initial fetch
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(`/data/philosophers.json${cacheBuster}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'same-origin'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PhilosopherData = await response.json();

        // Set data FIRST
        setGraphData(data);

        // THEN set active eras based on the *fetched* data
        const allEras = Array.from(new Set(data.nodes.map(node => node.era).filter(Boolean)));
        setActiveEras(allEras as string[]);

      } catch (e) {
        console.error("Failed to fetch philosopher data:", e);
        setError(e instanceof Error ? e.message : 'Failed to load data');
        // Reset data/eras on error
        setGraphData({ nodes: [], links: [] });
        setActiveEras([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  // Update Graph Dimensions on Container Resize
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ResizeObserver) {
      console.warn('ResizeObserver not supported or not available in this environment.');
      // Optionally set default dimensions or handle the lack of observer
      setGraphDimensions({ width: 600, height: 400 }); // Example default
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

  // Calculate available eras *only* when graphData.nodes changes and has items
  const availableEras = useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) {
      return [];
    }
    const erasInData = new Set(
      graphData.nodes
        .map(node => node.era)
        .filter((era): era is string => typeof era === 'string' && era.trim() !== '')
    );
    return Array.from(erasInData).sort();
  }, [graphData.nodes]); // Depend only on nodes array

  // Filter graph data based on active eras and search query
  const filteredData = useMemo(() => {
    // Check if graphData or nodes/links are available
    if (!graphData || !graphData.nodes || !graphData.links) {
      console.log("Filtering: No graph data available yet.");
      return { nodes: [], links: [] };
    }

    const nodesExist = graphData.nodes.length > 0;
    const erasSelected = activeEras.length > 0;
    const queryExists = searchQuery.trim() !== '';

    // If no data, return empty
    if (!nodesExist) {
      console.log("Filtering: Nodes array is empty.");
      return { nodes: [], links: [] };
    }

    // Filter nodes
    const filteredNodes = graphData.nodes.filter(node => {
      // Era check: if eras are selected, node must match one
      const eraMatch = activeEras.length === 0 || activeEras.includes(node.era ?? 'Unknown');

      // Search query check: if query exists, node name/desc must match (case-insensitive)
      const searchMatch = searchQuery === '' || 
                         (node.name && node.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                         (node.description && node.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return eraMatch && searchMatch;
    });

    // Filter links: Keep links where BOTH source and target are in filteredNodes
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });

    console.log(`Filtering: ${activeEras.length} active eras, query: "${searchQuery}". Result: ${filteredNodes.length} nodes, ${filteredLinks.length} links.`);
    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, activeEras, searchQuery]);

  // Handle era filter toggle
  const handleEraFilter = (era: string) => {
    console.log(`Toggling era filter for: ${era}`);
    setActiveEras(prev => {
      const newEras = prev.includes(era) 
        ? prev.filter(e => e !== era) 
        : [...prev, era];
      console.log(`New active eras: ${newEras.join(', ')}`);
      return newEras;
    });
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    console.log(`Setting search query to: "${query}"`);
    setSearchQuery(query);
  };

  // Handle node selection from search (placeholder)
  const handleNodeSelectFromSearch = (node: GraphNode | null) => {
    if (node) {
      console.log(`Node selected from search: ${node.name}`);
      // Potentially center graph or highlight node
      setSelectedNode(node);
    } else {
      console.log("Node selection cleared from search.");
    }
  };

  // Handle clicking on a node
  const handleNodeClick = useCallback((node: NodeObject) => {
    // The node object from the graph might not have all our custom props initially,
    // find the full data from our original dataset.
    const fullNodeData = graphData.nodes.find(n => n.id === node.id);
    console.log("Node clicked:", node.id, node.name);
    if (fullNodeData) {
      setSelectedNode(fullNodeData);
    } else {
      console.warn("Clicked node data not found in graphData.nodes");
      // Fallback to the potentially partial data from the graph event
      setSelectedNode(node as GraphNode); 
    }
  }, [graphData.nodes]); // Depend on graphData.nodes

  // Handle closing the detail panel
  const handleClosePanel = useCallback(() => {
    console.log("Closing panel");
    setSelectedNode(null);
  }, []);

  // Placeholder: Handle node hover events - Use NodeObject type
  const handleNodeHover = useCallback((node: NodeObject | null) => {
    // console.log('Hovering over:', node?.name); // Access node properties safely
    // Future: Implement tooltip or other hover effects
  }, []);

  // Define Page Title/Subtitle
  const pageTitle = "Philosopher Knowledge Graph";
  const pageSubtitle = "Explore connections between philosophers and their ideas. Click nodes to see details.";

  // State for graph dimensions
  const [graphDimensions, setGraphDimensions] = useState({ width: 600, height: 400 });

  return (
    // Main container for the page
    <PageContainer title={pageTitle} subtitle={pageSubtitle}>
      {/* Loading and Error States */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80">
          <p className="text-lg font-medium text-gray-700">Loading Graph Data...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
          <p>Error loading graph data: {error}</p>
        </div>
      )}

      {/* Main content area: Controls + Graph + Details */}
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(80vh)]"> 
        {/* Left Column: Controls */}
        <div className="flex flex-col space-y-4 w-full lg:w-64 shrink-0"> 
          {/* Search Bar */}
          <SearchBar 
            onSearchChange={handleSearchChange} 
            data={graphData.nodes} 
            onSelect={handleNodeSelectFromSearch} 
          />

          {/* Era Filters (Legend) */}
          <GraphLegend 
            availableEras={availableEras} 
            activeEras={activeEras} 
            onToggleEra={handleEraFilter} 
          />
          
          {/* Other controls (placeholder) */}
          {/* <Button onClick={() => loadGraphData(true)}>Refresh Data</Button> */}
          {/* <Button onClick={() => setShowAnalytics(true)}>Show Analytics</Button> */}
        </div>

        {/* Center Column: Graph Area */}
        <div ref={graphContainerRef} className="flex-grow relative min-h-[400px] lg:min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {!loading && !error && (
            <DynamicPhilosopherGraph
              ref={graphRef} 
              data={filteredData} 
              onNodeClick={handleNodeClick}
              width={graphDimensions.width}
              height={graphDimensions.height}
              physicsEnabled={physicsEnabled}
              selectedLayout={selectedLayout}
              onNodeHover={handleNodeHover}
              // Pass theme colors and selected node ID
              themeColors={themeColors}
              selectedNodeId={selectedNode ? String(selectedNode.id) : null} // Ensure string or null
            />
          )}
          {/* Graph Controls Overlay (Zoom/Pan) could go here if not handled by library */}
        </div>

        {/* Right Column: Details Panel - Conditionally Rendered */}
        {selectedNode && (
          <NodeDetailPanel 
            node={selectedNode} 
            onClose={handleClosePanel} 
            allNodes={graphData.nodes} 
            links={graphData.links} 
            // Pass theme colors to the panel if needed for styling connections
            themeColors={themeColors}
          />
        )}
      </div> 

      {/* Modals */}
      <AnalyticsModal
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        data={graphData} 
      />
    </PageContainer>
  );
};
