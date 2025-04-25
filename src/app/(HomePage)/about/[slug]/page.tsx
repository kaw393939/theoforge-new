import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAllAboutSlugs, getAboutData } from '@/lib/about';
import SectionContainer from '@/components/Layout/SectionContainer';
import Heading from '@/components/Common/Heading';
import Button from '@/components/Common/Button';

// Define the expected structure of resolved params
interface ResolvedAboutParams {
  slug: string;
}

// Type for the props received by the page component and generateMetadata
interface AboutPageProps {
  params: Promise<ResolvedAboutParams>;
}

// Function to generate static paths for pre-rendering
export async function generateStaticParams() {
  const slugs = getAllAboutSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Function to generate metadata dynamically
export async function generateMetadata({ params }: AboutPageProps) {
  const resolvedParams = await params; // Await the promise
  const slug = resolvedParams.slug;
  const aboutData = await getAboutData(slug);

  if (!aboutData) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: `${aboutData.title} | TheoForge`,
    description: aboutData.excerpt || 'Learn more about TheoForge and our approach to enterprise AI transformation.',
  };
}

// The main page component
export default async function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = await params; // Await the promise
  const slug = resolvedParams.slug;
  const aboutData = await getAboutData(slug);

  if (!aboutData) {
    notFound();
  }

  return (
    <SectionContainer className="py-12 md:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {aboutData.image && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={aboutData.image}
              alt={aboutData.title}
              fill
              priority
              style={{ objectFit: 'cover' }}
              className="transition-opacity duration-500"
            />
          </div>
        )}

        <Heading level={1} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          {aboutData.title}
        </Heading>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: aboutData.contentHtml || '' }} />
        </div>

        <div className="mt-12 flex justify-center">
          <Button 
            href="/about" 
            variant="secondary"
            leftIcon={<span className="mr-2">←</span>}
          >
            Back to About
          </Button>
        </div>
      </div>
    </SectionContainer>
  );
}
