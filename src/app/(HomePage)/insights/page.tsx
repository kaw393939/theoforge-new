import React, { Suspense } from 'react';
import { getSortedPostsData } from '@/lib/posts';
import { PostData } from '@/types/post';
import { Metadata } from 'next';
import InsightsListWrapper from '@/components/insights/InsightsListWrapper';
import PageContainer from '@/components/Layout/PageContainer';
import { createMetadataGenerator } from '@/lib/metadataUtils';

// Generate metadata dynamically from blog/insights content
export const generateMetadata = createMetadataGenerator('blog');

export default async function BlogPage() {
  const allPostsData: PostData[] = await getSortedPostsData();
  
  const pageTitle = "Insights & Expertise";
  const pageSubtitle = "Strategic insights to help you confidently navigate the complexities of enterprise AI and digital transformation.";

  return (
    <main>
      <PageContainer title={pageTitle} subtitle={pageSubtitle}>
        <Suspense fallback={<div>Loading insights...</div>}>
          <InsightsListWrapper 
            allPostsData={allPostsData}
          />
        </Suspense>
      </PageContainer>
    </main>
  );
};
