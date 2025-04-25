import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import SectionContainer from '@/components/Layout/SectionContainer';
import Heading from '@/components/Common/Heading';
import Button from '@/components/Common/Button';
import { ChevronRight, CheckCircle, ExternalLink, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: `TheoForge: The Living Lab | ${siteConfig.name}`,
  description: 'Experience enterprise AI strategies proven in our own operations before we recommend them to clients.',
  openGraph: {
    title: `TheoForge: The Living Lab | ${siteConfig.name}`,
    description: 'Experience enterprise AI strategies proven in our own operations before we recommend them to clients.',
    images: ['/images/about/living.png'],
  },
};

export default function LivingLabPage() {
  return (
    <>
      {/* Premium Hero Section with Dual-Layer Design */}
      <div className="relative">
        {/* Upper Section - Image with Overlay */}
        <div className="relative h-[45vh] sm:h-[50vh] md:h-[65vh] overflow-hidden">
          <Image 
            src="/images/about/living.png" 
            alt="Living Lab Concept" 
            fill 
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            priority
            className="brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/80 via-primary-dark/60 to-primary-dark"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <span className="inline-block px-3 py-0.5 sm:px-4 sm:py-1 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full mb-4 sm:mb-6">TheoForge Innovation</span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white text-center max-w-4xl mx-auto tracking-tight leading-none">
              The Living Lab
            </h1>
          </div>
        </div>
        
        {/* Lower Section - Content Area */}
        <div className="bg-primary relative pb-16">
          <div className="max-w-4xl mx-auto px-4 pt-8 sm:pt-10 md:pt-12 text-center">
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 sm:mb-10 max-w-3xl mx-auto">
              AI strategies proven in practice, not just theories on slides
            </p>
            
            <div className="flex justify-center">
              <Link href="/community" className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-accent text-white rounded-lg font-medium shadow-lg hover:bg-accent/90 transition-all">
                <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                <span className="font-medium">Join the Conversation</span>
              </Link>
            </div>
          </div>
          
          {/* Diagonal Cut Bottom Edge */}
          <div className="absolute -bottom-12 sm:-bottom-16 left-0 right-0 h-12 sm:h-16 z-10 overflow-hidden">
            <div className="absolute inset-0 bg-white dark:bg-background transform -skew-y-2"></div>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <SectionContainer className="py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-lg sm:text-xl">
              At TheoForge, we don't theorize about AI integration—we live it daily. Our Living Lab approach ensures every strategy we recommend has been rigorously tested in our own operations first. 
            </p>
            <p>
              This fundamental difference means our guidance comes from direct implementation experience, not just industry trends or theoretical frameworks. When we recommend an approach for your organization, it's because we've already proven its effectiveness in our own work.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* The Forge Title Section */}
      <div className="bg-neutral-50 dark:bg-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Heading level={2} className="text-3xl md:text-4xl font-bold mb-4">
            The Forge: Enterprise Innovation in Action
          </Heading>
          <p className="text-lg text-neutral-800 dark:text-neutral-200 max-w-3xl mx-auto">
            Our innovation hub where we develop functioning AI solutions that demonstrate transformative capabilities.
          </p>
        </div>
      </div>

      {/* Genesis Engine Section - Improved Responsiveness */}
      <SectionContainer className="py-10 sm:py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 max-w-7xl mx-auto">
          <div className="lg:w-1/2 order-2 lg:order-1 px-4">
            <div className="mb-5 sm:mb-6">
              <span className="inline-block px-3 py-1 bg-primary-lightest dark:bg-primary-dark/30 text-primary dark:text-primary-light text-sm font-medium rounded-full mb-2 sm:mb-3">Enterprise AI Personas</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading mb-2 sm:mb-3">Genesis Engine</h3>
              <p className="text-neutral-800 dark:text-neutral-200 mb-4 text-sm sm:text-base">
                Our enterprise-grade AI persona platform transforms customer engagement and employee training programs with personalized, brand-consistent interactions.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Brand-Consistent AI Representations</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Maintain your enterprise voice and values while ensuring regulatory compliance.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Interactive Learning Experiences</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Accelerate employee onboarding and skills development through personalized dialogues.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Enterprise-Grade Implementation</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Complete with fallback mechanisms, structured conversation flows, and seamless integration capabilities.</p>
                </div>
              </div>
            </div>

            <div>
              <Link href="/forge/character-chat" passHref>
                <Button 
                  variant="primary" 
                  size="sm"
                  rightIcon={<ExternalLink className="w-4 h-4 ml-1" />}
                >
                  Experience the Genesis Engine
                </Button>
              </Link>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2">
                Powers our <Link href="/services/workforce-training" className="text-primary dark:text-primary-light underline">Workforce Training</Link> service
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2 px-4">
            <div className="relative rounded-xl overflow-hidden shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
              <Image 
                src="/images/forge/characters/forge_characters_project.png" 
                alt="Genesis Engine Platform" 
                width={600} 
                height={400} 
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-4">
                  <span className="bg-accent text-white px-2 py-1 rounded-full text-xs">Live Demo Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Knowledge Graph Section - Improved Responsiveness */}
      <div className="bg-neutral-50 dark:bg-neutral-900 py-10 sm:py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 max-w-7xl mx-auto px-4">
          <div className="lg:w-1/2 mb-6 lg:mb-0">
            <div className="relative rounded-xl overflow-hidden shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
              <Image 
                src="/images/forge/philosphers/forge_philospher_project.png" 
                alt="Enterprise Knowledge Graph" 
                width={600} 
                height={400} 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-4">
                  <span className="bg-accent text-white px-2 py-1 rounded-full text-xs">Interactive Visualization</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="mb-5 sm:mb-6">
              <span className="inline-block px-3 py-1 bg-primary-lightest dark:bg-primary-dark/30 text-primary dark:text-primary-light text-sm font-medium rounded-full mb-2 sm:mb-3">Enterprise Knowledge Discovery</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading mb-2 sm:mb-3">Enterprise Knowledge Graph</h3>
              <p className="text-neutral-800 dark:text-neutral-200 mb-4 text-sm sm:text-base">
                Our Philosopher Graph transforms fragmented organizational knowledge into a unified, actionable intelligence ecosystem.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Dynamic Knowledge Visualization</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Reveal hidden connections across previously isolated data sources.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Intuitive Exploration Interface</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Make complex information accessible to all stakeholders, not just technical users.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Actionable Analytics</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Surface key insights and decision points within vast knowledge networks.</p>
                </div>
              </div>
            </div>

            <div>
              <Link href="/forge/philosopher-graph" passHref>
                <Button 
                  variant="primary" 
                  size="sm"
                  rightIcon={<ExternalLink className="w-4 h-4 ml-1" />}
                >
                  Explore the Platform
                </Button>
              </Link>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2">
                Underpins our <Link href="/services/engineering-empowerment" className="text-primary dark:text-primary-light underline">Engineering Empowerment</Link> service
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MCP Platform Section - Improved Responsiveness */}
      <SectionContainer className="py-10 sm:py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 max-w-7xl mx-auto">
          <div className="lg:w-1/2 order-2 lg:order-1 px-4">
            <div className="mb-5 sm:mb-6">
              <span className="inline-block px-3 py-1 bg-primary-lightest dark:bg-primary-dark/30 text-primary dark:text-primary-light text-sm font-medium rounded-full mb-2 sm:mb-3">Enterprise AI Governance</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading mb-2 sm:mb-3">MCP Orchestration Platform</h3>
              <p className="text-neutral-800 dark:text-neutral-200 mb-4 text-sm sm:text-base">
                Our Model Context Protocol framework addresses the critical challenge of coordinating and governing AI systems across large organizations.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Standardized AI Communication</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Universal protocol that connects AI capabilities to business systems.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Centralized Governance Controls</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Enable effective oversight while still fostering decentralized innovation.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Cross-Organizational Intelligence</h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">Break down traditional AI silos to create cohesive intelligence.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                Forms the foundation of our <Link href="/services/tech-strategy-leadership" className="text-primary dark:text-primary-light underline">Technology Strategy & Leadership</Link> service
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2 px-4">
            <div className="relative rounded-xl overflow-hidden shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
              <Image 
                src="/images/forge/mcp/forge_mcp_project.png" 
                alt="MCP Orchestration Platform" 
                width={600} 
                height={400} 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-4">
                  <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Benefits Grid Section - Improved Responsiveness */}
      <div className="bg-neutral-50 dark:bg-neutral-900 py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <Heading level={2} className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              How Your Enterprise Benefits
            </Heading>
            <p className="text-neutral-800 dark:text-neutral-200 max-w-3xl mx-auto text-sm sm:text-base">
              Our Living Lab approach translates to tangible advantages for your organization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Benefit Card 1 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-10 h-10 bg-primary-lightest dark:bg-primary-dark/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Accelerated Knowledge Discovery</h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                We continuously analyze the rapidly evolving AI landscape to provide insights that combine breadth and depth in ways traditional research cannot.
              </p>
            </div>

            {/* Benefit Card 2 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-10 h-10 bg-primary-lightest dark:bg-primary-dark/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Enterprise-Grade Engineering</h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                Our development processes serve as a testbed for AI-augmented engineering methodologies that maintain enterprise security and compliance requirements.
              </p>
            </div>

            {/* Benefit Card 3 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-10 h-10 bg-primary-lightest dark:bg-primary-dark/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">De-Risked Implementation</h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                Before recommending any approach, we've identified potential pitfalls and developed mitigation strategies based on direct experience.
              </p>
            </div>

            {/* Benefit Card 4 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-10 h-10 bg-primary-lightest dark:bg-primary-dark/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Practical Enterprise Expertise</h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                Our advice comes from implementation experience in enterprise contexts, not theoretical knowledge.
              </p>
            </div>

            {/* Benefit Card 5 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-10 h-10 bg-primary-lightest dark:bg-primary-dark/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Continuous Innovation Transfer</h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                As we discover new techniques, we transfer these innovations to our clients without the risks of being on the bleeding edge.
              </p>
            </div>

            {/* Benefit Card 6 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="w-10 h-10 bg-primary-lightest dark:bg-primary-dark/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Measurable Results</h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                We provide realistic estimates of benefits based on measured impacts in our own operations, focusing on approaches with demonstrable value.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Improved Responsiveness */}
      <SectionContainer className="py-10 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <Heading level={2} className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Experience the Living Lab Difference
          </Heading>
          <p className="text-neutral-800 dark:text-neutral-200 mb-6 sm:mb-8 max-w-3xl mx-auto text-sm sm:text-base">
            The TheoForge Living Lab represents our commitment to providing guidance based on real-world implementation. When you partner with us, you benefit from lessons we've learned firsthand—significantly reducing the risks associated with enterprise AI adoption.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link href="/contact" passHref>
              <Button 
                variant="primary" 
                size="md" 
                className="w-full sm:w-auto"
              >
                Contact Us
              </Button>
            </Link>
            <Link href="/services" passHref>
              <Button 
                variant="outline" 
                size="md"
                className="w-full sm:w-auto"
              >
                Explore Our Services
              </Button>
            </Link>
          </div>
        </div>
      </SectionContainer>

      {/* Visit The Forge Banner - Improved Responsiveness */}
      <div className="bg-primary-dark text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-center md:text-left">Visit Our Forge</h3>
            <p className="text-white/80 text-center md:text-left text-sm sm:text-base">
              Interact with our innovative projects and see how they can apply to your specific challenges.
            </p>
          </div>
          <Link href="/forge" passHref className="w-full md:w-auto">
            <Button 
              variant="secondary" 
              size="md" 
              className="whitespace-nowrap w-full md:w-auto mt-2 md:mt-0"
              rightIcon={<ChevronRight className="w-5 h-5 ml-1" />}
            >
              Explore The Forge
            </Button>
          </Link>
        </div>
      </div>

    </>
  );
}
