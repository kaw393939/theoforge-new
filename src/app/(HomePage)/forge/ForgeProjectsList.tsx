'use client';

import React from 'react';
import { ForgeProjectData } from '@/lib/forgeUtils';
import ForgeProjectCard from '@/components/Forge/ForgeProjectCard';

interface ForgeProjectsListProps {
  projects: ForgeProjectData[];
}

const ForgeProjectsList: React.FC<ForgeProjectsListProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mx-auto max-w-[1200px] justify-center">
      {projects.length > 0 ? (
        projects.map((project) => (
          <ForgeProjectCard key={project.id} project={project} />
        ))
      ) : (
        <div className="col-span-full text-center py-12"> 
          <p className="font-poppins text-lg text-text-secondary dark:text-dark-text-secondary">No projects found.</p>
        </div>
      )}
    </div>
  );
};

export default ForgeProjectsList;
