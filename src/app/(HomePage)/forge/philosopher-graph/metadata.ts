import { Metadata } from 'next';
import path from 'path';
import { loadContentMetadata, createMetadata } from '@/lib/metadataUtils';

// Generate metadata for the Philosopher Graph page with Open Graph properties
export async function generateMetadata(): Promise<Metadata> {
  // Load the philosopher graph markdown content
  const contentPath = path.join(process.cwd(), 'src/content/forge/philosopher-graph.md');
  const contentMetadata = await loadContentMetadata(contentPath);
  
  // Use the content metadata to generate proper Open Graph metadata
  return createMetadata(contentMetadata, '/forge');
}

export default generateMetadata;
