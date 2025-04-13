import React from 'react';
import { getAboutData } from '@/lib/about';
import AboutClientUI from '@/components/About/AboutClientUI';
import { Metadata } from 'next';
import { createMetadataGenerator, processContentImage } from '@/lib/metadataUtils';
import { siteConfig } from '@/config/site';

export async function generateMetadata(): Promise<Metadata> {
  // First try to get metadata from the about content files
  const metadataGenerator = createMetadataGenerator('about');
  const baseMetadata = await metadataGenerator();
  
  // Then merge with author-specific data
  const aboutData = await getAboutData('keith');
  
  // If we have author data, use it to enhance the metadata
  if (aboutData) {
    // Get the first image from base metadata or use a default
    const baseImage = baseMetadata.openGraph?.images && 
                      Array.isArray(baseMetadata.openGraph.images) && 
                      baseMetadata.openGraph.images.length > 0 ? 
                      baseMetadata.openGraph.images[0] : null;
    
    // Create image object for the author's profile image if available
    const imageInfo = aboutData.image 
      ? processContentImage(aboutData.image)
      : baseImage || processContentImage(siteConfig.ogImage);
    
    // Use content from the about data or fall back to the base metadata
    const description = aboutData.contentHtml 
      ? `Learn more about ${aboutData.name || 'TheoForge'} and our mission.`
      : baseMetadata.description;
    
    // Twitter cards need string URLs for images
    const twitterImageUrl = typeof imageInfo === 'string' ? 
                          imageInfo : 
                          (imageInfo as { url: string }).url;
    
    return {
      ...baseMetadata,
      title: `About ${aboutData.name || 'TheoForge'} | ${siteConfig.name}`,
      description: description,
      openGraph: {
        ...baseMetadata.openGraph,
        title: `About ${aboutData.name || 'TheoForge'} | ${siteConfig.name}`,
        description: description as string,
        images: [imageInfo]
      },
      twitter: {
        ...baseMetadata.twitter,
        title: `About ${aboutData.name || 'TheoForge'} | ${siteConfig.name}`,
        description: description as string,
        images: [twitterImageUrl]
      }
    };
  }
  
  // If no author data, return the base metadata
  return baseMetadata;
}

export default async function AboutPage() {
  const aboutData = await getAboutData('keith'); // Added 'keith' argument back

  // Handle the case where data might not be available
  // This check is crucial because getAboutData currently returns null
  
  // Wrap the client UI in a <main> tag for semantic structure
  return (
    <main>
      <AboutClientUI aboutData={aboutData} />
    </main>
  );
}
