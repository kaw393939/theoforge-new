// forceWorker.ts - Web Worker for D3 Force Simulation Calculations
import * as d3 from 'd3-force';
import { PhilosopherNode, PhilosopherLink } from '@/types/graphTypes';

// Define an interface for the message data received by the worker
interface WorkerMessage {
  type: 'initialize' | 'tick' | 'update' | 'reheat';
  nodes?: PhilosopherNode[];
  links?: PhilosopherLink[];
  dimensions?: { width: number; height: number };
  config?: {
    chargeStrength?: number;
    linkDistance?: number;
    collisionPadding?: number;
    alphaDecay?: number;
    velocityDecay?: number;
    centerStrength?: number;
    iterations?: number;
  };
}

// Keep simulation in this scope so we can reference it
let simulation: d3.Simulation<PhilosopherNode, PhilosopherLink> | null = null;
let dimensions = { width: 1000, height: 800 };
let iterationCount = 0;
let maxIterations = 300; // Reduced from 500
let currentConfig = {
  chargeStrength: -50000,     // Significantly increased repulsion force
  linkDistance: 800,          // Greatly increased link distance
  collisionPadding: 150,      // Increased collision padding
  alphaDecay: 0.0025,         // Slower cooling for better stabilization
  velocityDecay: 0.06,        // Lower friction for more natural movement
  centerStrength: 0.005,      // Weaker centering force
  iterations: 800             // More iterations for better layout
};

// Handle messages from the main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const messageData = event.data;

  // Update dimensions if provided
  if (messageData.dimensions) {
    dimensions = messageData.dimensions;
  }
  
  // Update config if provided
  if (messageData.config) {
    currentConfig = { ...currentConfig, ...messageData.config };
  }

  switch (messageData.type) {
    case 'initialize':
      if (!messageData.nodes || !messageData.links) return;
      
      // Calculate degree (number of connections) for each node
      const nodeDegrees: Record<string, number> = {};
      messageData.nodes.forEach(node => { nodeDegrees[node.id] = 0 });
      
      messageData.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as PhilosopherNode).id : link.source as string;
        const targetId = typeof link.target === 'object' ? (link.target as PhilosopherNode).id : link.target as string;
        nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1;
        nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1;
      });
      
      // Set node radius based on degree - smaller nodes
      messageData.nodes.forEach(node => {
        const connections = nodeDegrees[node.id] || 0;
        const baseRadius = 12; // Smaller base radius
        // Simpler scaling algorithm
        const scaling = Math.sqrt(connections + 1) * 1.5; // Reduced scaling factor
        node.radius = baseRadius + scaling;
      });
      
      // Position nodes in a simple spread pattern
      positionNodesInSpread(messageData.nodes, dimensions);
      
      // Set up simulation with improved forces
      simulation = d3.forceSimulation<PhilosopherNode, d3.SimulationLinkDatum<PhilosopherNode>>()
        .nodes(messageData.nodes)
        .alpha(0.9) // Higher alpha for more energy
        .alphaMin(0.0005) // Lower minimum alpha for more gradual cooling
        .alphaDecay(currentConfig.alphaDecay)
        .velocityDecay(currentConfig.velocityDecay)
        .force('link', d3.forceLink<PhilosopherNode, d3.SimulationLinkDatum<PhilosopherNode>>()
          .id((d: PhilosopherNode) => d.id) // Type d as PhilosopherNode
          .links(messageData.links)
          .distance(() => currentConfig.linkDistance)
          .strength(0.05) // Weaker link strength to allow nodes to spread more
        )
        .force('charge', d3.forceManyBody<PhilosopherNode>()
          .strength((d) => {
            // Scale charge strength based on node radius 
            const nodeSize = d.radius || 12;
            return currentConfig.chargeStrength * Math.pow(nodeSize / 12, 1.5);
          })
          .distanceMax(Math.max(dimensions.width, dimensions.height) * 3) // Greatly increased distance max
          .theta(0.5) // More accurate force calculation
        )
        .force('collide', d3.forceCollide<PhilosopherNode>()
          .radius((d) => (d.radius || 12) + currentConfig.collisionPadding)
          .strength(1.0) // Maximum collision strength
          .iterations(8) // More iterations for better collision resolution
        )
        .force('x', d3.forceX<PhilosopherNode>()
          .strength((d) => {
            // Positioning along x-axis
            d.fx = undefined; // Clear any fixed positions
            return currentConfig.centerStrength * 0.8;
          })
        )
        .force('y', d3.forceY<PhilosopherNode>()
          .strength((d) => {
            // Positioning along y-axis (if birthYear exists)
            d.fy = undefined; // Clear any fixed positions
            return currentConfig.centerStrength * 0.8;
          })
        )
        // Add a radial force to push nodes outward from center
        .force('radial', d3.forceRadial<PhilosopherNode>(
          (d) => {
            // Vary radius based on degree
            const baseFactor = Math.min(dimensions.width, dimensions.height) * 0.4;
            const degreeFactor = d.degree ?? 0; // Use nullish coalescing
            return baseFactor + degreeFactor * 10;
          },
          dimensions.width / 2,
          dimensions.height / 2
        ).strength(0.1));
        
      iterationCount = 0;
      maxIterations = currentConfig.iterations;
      
      // Run an initial batch of iterations
      runBatchedIterations();
      break;
      
    case 'tick':
      if (!simulation) return;
      // Run a single iteration
      simulation.tick();
      // Send updated node positions back to main thread
      self.postMessage({ type: 'positions', nodes: simulation.nodes() });
      break;
      
    case 'reheat':
      if (!simulation) return;
      // Reheat the simulation
      simulation.alpha(1).restart();
      // Reset iteration counter
      iterationCount = 0;
      // Run new batch of iterations
      runBatchedIterations();
      break;
      
    case 'update':
      if (!simulation || !messageData.nodes) return; // Add guard for undefined nodes
      // Safely update node positions if nodes are provided
      if (messageData.nodes) { // Check if nodes array exists
        // Update node positions in the simulation
        simulation.nodes().forEach((simNode) => {
          // Use optional chaining to safely call .find()
          const updatedNode = messageData.nodes?.find(n => n.id === simNode.id);
          if (updatedNode && (updatedNode.fx !== undefined || updatedNode.fy !== undefined)) {
            simNode.fx = updatedNode.fx;
            simNode.fy = updatedNode.fy;
          }
        });
      }
      // Reheat slightly to adjust to new constraints
      simulation.alpha(0.3).restart();
      break;
  }
};

// Simple function to position nodes in a spread pattern
function positionNodesInSpread(nodes: PhilosopherNode[], dimensions: { width: number, height: number }) {
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(dimensions.width, dimensions.height) * 0.9; // Increased to 90% of the smaller dimension
  
  // Group nodes by community for better initial positioning
  const communitiesMap: Record<number | string, PhilosopherNode[]> = {};
  
  nodes.forEach(node => {
    const community = node.community !== undefined ? node.community : 'unknown';
    if (!communitiesMap[community]) {
      communitiesMap[community] = [];
    }
    communitiesMap[community].push(node);
  });
  
  const communities = Object.keys(communitiesMap);
  
  // Position each community in its own sector
  communities.forEach((community, communityIndex) => {
    const communityNodes = communitiesMap[community];
    
    // Calculate the sector angle for this community
    const sectorStartAngle = (communityIndex / communities.length) * 2 * Math.PI;
    const sectorEndAngle = ((communityIndex + 1) / communities.length) * 2 * Math.PI;
    
    // Position nodes in a spiral within their community sector
    communityNodes.forEach((node) => {
      // Use golden ratio for spiral
      const sectorWidth = sectorEndAngle - sectorStartAngle;
      const nodeAngle = sectorStartAngle + (sectorWidth * 0.8);
      
      // Calculate distance from center (spiral)
      const distanceFactor = Math.sqrt(node.degree ?? 0); // Use nullish coalescing
      const distance = radius * distanceFactor * 0.9;
      
      // Set position
      node.x = centerX + distance * Math.cos(nodeAngle);
      node.y = centerY + distance * Math.sin(nodeAngle);
      
      // Add randomness to prevent perfect alignment
      node.x += (Math.random() - 0.5) * 100;
      node.y += (Math.random() - 0.5) * 100;
      
      // Set initial velocity to zero
      node.vx = 0;
      node.vy = 0;
      
      // For nodes with birth years, adjust y position based on timeline
      if (node.birthYear !== undefined) {
        // Map from historical time (-600 to 2000) to screen coordinates
        const timelineY = centerY + (node.birthYear + 600) / 2600 * dimensions.height * 0.8 - dimensions.height * 0.4;
        // Blend the spiral position with the timeline position
        node.y = node.y * 0.3 + timelineY * 0.7;
      }
    });
  });
}

// Run batched iterations to avoid blocking for too long
function runBatchedIterations() {
  if (!simulation) return;
  
  // Batch size - adjust based on complexity
  const batchSize = 10;
  
  // Run a batch of iterations
  for (let i = 0; i < batchSize && iterationCount < maxIterations; i++) {
    simulation.tick();
    iterationCount++;
  }
  
  // Send progress update
  self.postMessage({ 
    type: 'progress', 
    progress: iterationCount / maxIterations,
    nodes: simulation.nodes()
  });
  
  // Schedule next batch if not done
  if (iterationCount < maxIterations) {
    setTimeout(runBatchedIterations, 0);
  } else {
    // Send completion notice
    self.postMessage({ 
      type: 'complete',
      nodes: simulation.nodes()
    });
    
    // Adjust alpha decay for interactive phase
    simulation.alphaDecay(0.02);
  }
}

// TypeScript needs this for workers
export {};
