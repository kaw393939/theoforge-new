import { Theme } from '@mui/material/styles';
import { GraphNode } from '@/types/graph'; // Adjust path as needed

/**
 * Standard node painting logic.
 * Draws a circle with a label below it. Handles hover and selection highlighting.
 * 
 * @param node The node object (expected to conform to GraphNode).
 * @param ctx The canvas rendering context.
 * @param globalScale The current global scale of the graph.
 * @param theme The MUI theme object for colors.
 * @param hoveredNode The currently hovered node, if any.
 * @param selectedNode The currently selected node, if any.
 */
export const paintStandardNode = (
    node: GraphNode, 
    ctx: CanvasRenderingContext2D, 
    globalScale: number,
    theme: Theme,
    hoveredNode: GraphNode | null,
    selectedNode: GraphNode | null
) => {
    // Node properties - Use defaults if not present
    const label = node.name || '';
    const fontSize = 12 / globalScale; // Adjust font size based on zoom
    const nodeSize = node.size || 5;   // Default node radius
    const nodeX = node.x ?? 0;
    const nodeY = node.y ?? 0;

    // Determine node color
    let color = node.color || theme.palette.primary.main; // Default to theme primary
    if (node === selectedNode) {
        color = theme.palette.secondary.main; // Highlight selected node
    } else if (node === hoveredNode) {
        color = theme.palette.action.hover; // Highlight hovered node
    }
    
    const outlineColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

    // --- Draw Node Circle ---
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, nodeSize, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // --- Draw Outline (if selected or hovered) ---
    if (node === selectedNode || node === hoveredNode) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 2 / globalScale; // Make outline consistent size regardless of zoom
        ctx.stroke();
    }

    // --- Draw Node Label ---
    // Show label only above a certain zoom level to avoid clutter
    if (globalScale > 0.5) { 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = theme.palette.text.primary; // Use theme text color
        ctx.font = `${fontSize}px Sans-Serif`; // Set font size and type
        // Position label below the node circle
        ctx.fillText(label, nodeX, nodeY + nodeSize + (fontSize / 2)); 
    }
};
