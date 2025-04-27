// Define the allowed context types
export type ContextType =
| "services"
| "forge"
| "engineeringEmpowerment"
| "technologyStrategy"
| "workforceTraining"
| "genesisEngine"
| "characterChat"
| "aiOrchestrationPlatform"
| "modelContextProtocol"
| "knowledgeGraph"
| "theoforge";

// All context values will be returned as plain strings
const contexts: Record<ContextType, string> = {
services:
  "Engineering Empowerment: Transform your development team with AI tools that amplify productivity, eliminate technical debt, and accelerate feature delivery.\n" +
  "Technology Strategy & Leadership: Define your AI roadmap and align technology initiatives with core business objectives for sustainable growth and competitive advantage.\n" +
  "Future Ready Workforce Training: Equip your teams with the AI literacy and practical skills needed to thrive in an increasingly automated landscape.",
forge:
  "Welcome to the Forge—our experimental playground showcasing proof-of-concept projects that demonstrate emerging AI technologies like Knowledge Graphs, Multi-Agent Systems, RAG, and advanced character agents.",
engineeringEmpowerment:
  "Transform your development team with AI tools that amplify productivity, eliminate technical debt, and accelerate feature delivery.\n\n" +
  "• Engineering Workflow Enhancement: Implement enterprise-grade AI coding assistants and testing frameworks that scale across large development teams, based on real-world applications.\n" +
  "• Technical Debt Reduction: Apply AI-assisted refactoring methodologies for legacy systems, informed by both enterprise consulting perspectives and startup evaluation experience.\n" +
  "• Development Velocity: Accelerate your development lifecycle with AI pair programming practices refined through startup innovation.\n" +
  "• Enterprise Talent Strategy: Integrate AI tools into your talent ecosystem, combining engineering leadership, product design expertise, and educational insights.",
technologyStrategy:
  "Define your AI roadmap and align technology initiatives with core business objectives for sustainable growth and competitive advantage.\n\n" +
  "• Enterprise AI Readiness: Assess technical capabilities, data architecture, and team readiness.\n" +
  "• Strategic Roadmapping: Craft AI strategies addressing enterprise complexity, legacy integration, and change management.\n" +
  "• Talent Strategy: Develop frameworks for AI-augmented productivity while mitigating displacement concerns.\n" +
  "• Governance at Scale: Establish innovation-friendly governance balancing iteration with compliance.\n" +
  "• Vendor Optimization: Navigate AI tool ecosystems from builder and investor perspectives.\n" +
  "• Architecture Evolution: Design phased transitions from legacy to AI-powered systems.",
workforceTraining:
  "Equip your teams with AI literacy and practical skills through enterprise training programs that blend hands-on implementation with educational methodology.\n\n" +
  "• Executive AI Literacy: Senior leader conceptual understanding and strategic vocabulary.\n" +
  "• Team Transformation: Upskill developers on AI-assisted coding, prompt engineering, and workflow integration.\n" +
  "• Implementation Workshops: Hands-on training within your technology ecosystem.\n" +
  "• Product Integration: Training for product managers and designers on AI-enhanced products.\n" +
  "• Change Management: Frameworks to build AI adoption enthusiasm.\n" +
  "• Technical Debt Strategies: Systematic AI-driven legacy code refactoring.",
genesisEngine:
  "The Genesis Engine delivers enterprise-grade AI personas for customer engagement and training—ensuring impact, brand consistency, and compliance.",
characterChat:
  "Advanced character agents from our lab demonstrating context-aware interactive AI personas for conversations and training.",
aiOrchestrationPlatform:
  "An AI governance framework for CTOs to coordinate specialized agents—eliminating silos, streamlining integration, and centralizing visibility.",
modelContextProtocol:
  "The Model Context Protocol (MCP) is the “HTTP of AI,” providing a universal standard for context-rich AI integration with business systems.",
knowledgeGraph:
  "A knowledge graph platform transforming siloed data into actionable insights, applicable across manufacturing, finance, and pharma to reveal hidden relationships.",
theoforge:
  "Transform AI Complexity into Strategic Confidence—Theoforge navigates enterprises through AI strategy, implementation, and education.\n\n" +
  "Meet Theophrastus: Our AI Philosophy in Action, embodying practical wisdom and clear communication.\n\n" +
  "The Genesis Engine R&D explores AI personalities to enhance interactions, informing our advisory with hands-on research.\n\n" +
  "Our Services: Technology Strategy & Leadership; AI Modernisation Advisory; Workforce Training; Custom AI Implementations.\n\n" +
  "Our Philosophy: Clarity, Pragmatic Engineering, Empowering Education—led by Keith Williams, combining engineering leadership and educational expertise."
};

// Return only the string relevant to the requested context
export function getTheoforgeInfo({ contextType }: { contextType: ContextType }): string {
if (!(contextType in contexts)) {
  throw new Error(`getContext: invalid contextType "${contextType}".`);
}
return contexts[contextType];
}