import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createMetadataGenerator } from '@/lib/metadataUtils';
import PageContainer from '@/components/Layout/PageContainer';
import ForgeProjectsList from './ForgeProjectsList';
import { getAllForgeProjects } from '@/lib/forgeUtils';
import { ChevronRight, Beaker } from 'lucide-react';

// Generate metadata dynamically from forge content
export const generateMetadata = createMetadataGenerator('forge');

export default function Page() {
  const pageTitle = "Forge Projects";
  const pageSubtitle = "Explore a selection of internal projects, experiments, and tools developed at TheoForge.";

  // Server-side data loading
  const forgeProjects = getAllForgeProjects();
  
  return (
    <PageContainer title={pageTitle} subtitle={pageSubtitle}>
      {/* Forge Header with Living Lab Link */}
      <div className="mb-8 md:mb-12 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Beaker className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">Innovation in Action</h3>
          </div>
          
          <Link 
            href="/about/living-lab" 
            className="group flex items-center text-primary dark:text-primary-light hover:underline font-medium"
          >
            <span>Visit our Living Lab</span>
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <p className="mt-2 text-neutral-800 dark:text-neutral-200 text-sm md:text-base">
          Our Forge projects demonstrate our implementation-first approach. Learn more about how we test and refine 
          AI strategies in our own operations through our <Link href="/about/living-lab" className="text-primary dark:text-primary-light hover:underline">Living Lab</Link> philosophy.
        </p>
      </div>
      
      <ForgeProjectsList projects={forgeProjects} />
    </PageContainer>
  );
}
