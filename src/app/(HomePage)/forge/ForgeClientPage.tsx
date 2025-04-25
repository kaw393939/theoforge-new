'use client';

import React from 'react';
import { getAllForgeProjects, ForgeProjectData } from '@/lib/forgeUtils';
import PageContainer from '@/components/Layout/PageContainer';
import ForgeProjectCard from '@/components/Forge/ForgeProjectCard';

const ForgeClientPage = () => {
  const pageTitle = "Forge Projects";
  const pageSubtitle = "Explore a selection of internal projects, experiments, and tools developed at TheoForge.";

  // Load projects from markdown files
  const forgeProjects: ForgeProjectData[] = getAllForgeProjects();

  return (
    <PageContainer title={pageTitle} subtitle={pageSubtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {forgeProjects.length > 0 ? (
          forgeProjects.map((project) => (
            <ForgeProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full text-center py-12"> 
            <p className="font-poppins text-lg text-text-secondary dark:text-dark-text-secondary">No projects found.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ForgeClientPage;
