import React from 'react';
import SectionContainer from '@/components/Layout/SectionContainer';
import Heading from '@/components/Common/Heading';
import Paragraph from '@/components/Common/Paragraph';
import Button from '@/components/Common/Button';
import { DiscordLogoIcon, ChatBubbleIcon, RocketIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import { Metadata } from 'next';
import Image from 'next/image';
import { createMetadataGenerator } from '@/lib/metadataUtils';

// Generate metadata dynamically from community content
export const generateMetadata = createMetadataGenerator('community');

// Placeholder data for insight cards - replace with actual data fetching later
const placeholderInsights = [
    {
        slug: 'navigating-ai-strategy',
        title: 'Beyond the Buzzwords: Forging Your Real-World AI Strategy (Sage/Hero)',
        excerpt: 'Cut through the hype. Define a clear, actionable AI roadmap aligned with your specific business goals and overcome implementation hurdles.',
        category: 'Strategic Vision',
        date: '2024-04-08',
        author: 'Keith Williams',
    },
    {
        slug: 'disrupting-legacy-thinking',
        title: "Is Your 'Digital Transformation' Already Obsolete? (Outlaw)", // Use double quotes to wrap string with single quotes
        excerpt: 'Challenge the slow pace of traditional change. Explore how targeted AI disruption can create immediate competitive advantages.',
        category: 'Implementation & Modernization',
        date: '2024-04-01',
        author: 'Keith Williams',
    },
    {
        slug: 'building-ai-literacy',
        title: "Empower Your Workforce: Building AI Capability from Within (Sage/Hero)",
        excerpt: "AI mastery isn't just for data scientists. Learn practical strategies to upskill your entire team for the AI era.",
        category: 'AI Literacy',
        date: '2024-03-25',
        author: 'Keith Williams',
    },
     {
        slug: 'responsible-ai-imperative',
        title: 'The Ethical Compass: Navigating Responsible AI Deployment (Sage)',
        excerpt: 'Move beyond compliance. Build trust and long-term value by embedding ethical considerations into your AI framework from day one.',
        category: 'Responsible AI',
        date: '2024-03-18',
        author: 'Keith Williams',
    },
];

// Re-insert InsightCardProps interface
interface InsightCardProps {
    title: string;
    excerpt: string;
    category: string;
    date: string;
    slug: string;
    author: string;
}

// Re-insert Insight Card Component
const InsightCard: React.FC<InsightCardProps> = ({ title, excerpt, category, date, slug, author }) => {
    return (
        <div className="border border-border rounded-lg p-6 bg-card dark:bg-card-dark shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <span className="text-xs font-medium uppercase text-primary dark:text-primary-light mb-2">{category}</span>
            <Heading level={3} className="text-xl font-semibold mb-3 font-poppins text-neutral-900 dark:text-neutral-100">
                 <a href={`/insights/${slug}`} className="hover:text-primary dark:hover:text-primary-light transition-colors duration-200">{title}</a>
            </Heading>
            <Paragraph className="text-neutral-700 dark:text-neutral-300 mb-4 flex-grow">
                {excerpt}
            </Paragraph>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground-dark mt-auto pt-4 border-t border-border">
                <span>{author}</span> | <span>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>
    );
};

const InsightsPage = () => {
    return (
        <>
            {/* --- Community Hero Section with Theophrastus --- */}
            <SectionContainer className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-teal-800/10 via-background to-secondary/5 dark:from-teal-900/20 dark:via-background-dark dark:to-secondary/10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    {/* Left side - Hero Text */}
                    <div className="lg:col-span-3 text-left">
                        <Heading
                            level={1}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold font-poppins mb-4 text-neutral-900 dark:text-neutral-100"
                        >
                            Welcome to <span className="text-primary dark:text-primary-dark">The Forge</span>
                        </Heading>
                        <Paragraph className="text-xl max-w-2xl text-neutral-700 dark:text-neutral-300 mb-8">
                            Where visionary leaders connect to transform AI complexity into strategic confidence. Join our vibrant community guided by Theophrastus, our AI philosopher.
                        </Paragraph>
                        
                        {/* Community Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start">
                                <div className="bg-secondary/10 dark:bg-secondary/20 p-2 rounded-full mr-4">
                                    <ChatBubbleIcon className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Expert Discussions</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">Engage in focused conversations with AI strategists and practitioners</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-secondary/10 dark:bg-secondary/20 p-2 rounded-full mr-4">
                                    <RocketIcon className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Implementation Support</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">Get practical guidance on your AI transformation journey</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* CTA Button */}
                        <Button
                            href="https://discord.gg/fp4NrUjCa5" // Updated Discord invite link
                            variant="secondary"
                            size="lg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shadow-md"
                        >
                            Join Our Discord Community <DiscordLogoIcon className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                    
                    {/* Right side - Theophrastus */}
                    <div className="lg:col-span-2 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 to-transparent rounded-2xl -z-10 blur-lg"></div>
                            <div className="bg-card dark:bg-card-dark p-6 border border-border rounded-2xl shadow-xl relative">
                                <div className="absolute top-4 right-4 w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                                    <LightningBoltIcon className="w-5 h-5 text-secondary" />
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-48 h-48 rounded-full mb-4 overflow-hidden border-4 border-secondary/30 shadow-lg relative">
                                        <Image 
                                            src="/theo_keith.png" 
                                            alt="Theophrastus, your AI guide" 
                                            width={192} 
                                            height={192}
                                            className="object-cover"
                                        />
                                    </div>
                                    <Heading level={2} className="text-2xl font-semibold mb-2">
                                        Meet Theophrastus
                                    </Heading>
                                    <Paragraph className="text-neutral-700 dark:text-neutral-300 mb-4">
                                        Your intelligent guide through AI transformation. Ask me anything about enterprise AI strategy, implementation, or ethics.
                                    </Paragraph>
                                    <Button 
                                        href="/contact" 
                                        variant="outline"
                                        className="border-secondary text-secondary hover:bg-secondary/10"
                                    >
                                        Chat with Theophrastus
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionContainer>

            {/* --- Community Benefits Section --- */}
            <SectionContainer className="py-16 md:py-24 bg-muted/30 dark:bg-muted-dark/30">
                <Heading level={2} className="text-3xl font-semibold font-poppins mb-6 text-center text-neutral-900 dark:text-neutral-100">
                    Why Join Our Community?
                </Heading>
                <Paragraph className="text-center max-w-3xl mx-auto mb-16 text-neutral-700 dark:text-neutral-300">
                    The Forge is where theory meets practice, where challenges become opportunities, and where you'll find the support to navigate your AI transformation journey.
                </Paragraph>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card dark:bg-card-dark rounded-xl p-8 shadow-md hover:shadow-lg transition-all border border-border">
                        <div className="w-12 h-12 bg-primary/10 dark:bg-primary-dark/20 rounded-lg flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary dark:text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Peer-to-Peer Learning</h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Connect with leaders facing similar challenges and learn from their experiences. Share insights and strategies that work in real-world scenarios.
                        </p>
                    </div>
                    
                    <div className="bg-card dark:bg-card-dark rounded-xl p-8 shadow-md hover:shadow-lg transition-all border border-border">
                        <div className="w-12 h-12 bg-secondary/10 dark:bg-secondary/20 rounded-lg flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Early Access & Insights</h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Get priority access to new frameworks, tools, and methodologies. Be the first to learn about emerging AI trends and their practical applications.
                        </p>
                    </div>
                    
                    <div className="bg-card dark:bg-card-dark rounded-xl p-8 shadow-md hover:shadow-lg transition-all border border-border">
                        <div className="w-12 h-12 bg-teal-600/10 dark:bg-teal-600/20 rounded-lg flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-teal-600 dark:text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Direct Expert Access</h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Join exclusive AMAs, workshops, and office hours with TheoForge experts and industry leaders. Get personalized guidance on your specific challenges.
                        </p>
                    </div>
                </div>
                
                {/* Final CTA */}
                <div className="text-center mt-16">
                    <Button
                        href="https://discord.gg/fp4NrUjCa5" // Updated Discord invite link
                        variant="primary"
                        size="lg"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Join the Community Today
                    </Button>
                    <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                        Already a member? <a href="https://discord.com/login" className="text-primary dark:text-primary-dark underline hover:no-underline">Sign in to Discord</a>
                    </p>
                </div>
            </SectionContainer>
        </>
    );
};

export default InsightsPage;
