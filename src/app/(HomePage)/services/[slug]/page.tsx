import React from 'react';
import { notFound } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import { getAllServiceSlugs, getServiceData } from '@/lib/services';
import MarkdownRenderer from '@/components/Common/MarkdownRenderer';
import SectionContainer from '@/components/Layout/SectionContainer';
import Heading from '@/components/Common/Heading';
import Paragraph from '@/components/Common/Paragraph';
import Button from '@/components/Common/Button';

// Define the expected structure of resolved params
interface ResolvedServiceParams {
  slug: string;
}

// Type for the props received by the page component and generateMetadata
interface ServicePageProps {
  params: Promise<ResolvedServiceParams>;
}

// Function to generate static paths for pre-rendering
export async function generateStaticParams() {
  const slugs = getAllServiceSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Function to generate metadata dynamically
export async function generateMetadata({ params }: ServicePageProps) {
  const resolvedParams = await params; // Await the promise
  const slug = resolvedParams.slug;
  const service = await getServiceData(slug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `${service.title} | TheoForge`,
    description: service.excerpt,
    // Add other metadata fields if needed
  };
}

// The main page component
export default async function ServicePage({ params }: ServicePageProps) {
  const resolvedParams = await params; // Await the promise
  const slug = resolvedParams.slug;

  // Fetch the full service data
  const service = await getServiceData(slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="bg-background dark:bg-neutral-950">
      {/* --- Breadcrumbs --- */}
      <SectionContainer className="pt-8 pb-0">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1 text-sm text-muted-foreground dark:text-muted-foreground-dark">
            <li>
              <NextLink
                href="/"
                className="block transition hover:text-foreground dark:hover:text-foreground-dark"
              >
                <span className="sr-only"> Home </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </NextLink>
            </li>
            <li className="rtl:rotate-180">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </li>
            <li>
              <NextLink
                href="/services"
                className="block transition hover:text-foreground dark:hover:text-foreground-dark"
              >
                Services
              </NextLink>
            </li>
            <li className="rtl:rotate-180">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </li>
            <li>
              <span className="block transition text-foreground dark:text-foreground-dark font-medium">
                {service.title}
              </span>
            </li>
          </ol>
        </nav>
      </SectionContainer>

      {/* --- Hero Section --- */}
      <SectionContainer className="pt-8 pb-16 md:pt-12 md:pb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image Column */}
          <div className="order-1 md:order-1">
            {service.image && (
              <Image
                src={service.image}
                alt={`${service.title} service visual`}
                width={500}
                height={350}
                className="rounded-lg shadow-xl object-cover w-full h-auto"
                priority
              />
            )}
          </div>

          {/* Text Column */}
          <div className="order-2 md:order-2">
            <Heading
              level={1}
              className="text-3xl md:text-4xl lg:text-5xl font-poppins font-bold mb-4 text-foreground dark:text-foreground-dark"
            >
              {service.title}
            </Heading>
            <Paragraph className="text-lg md:text-xl text-muted-foreground dark:text-muted-foreground-dark">
              {service.excerpt}
            </Paragraph>
          </div>
        </div>
      </SectionContainer>

      {/* --- Main Content Section --- */}
      <SectionContainer className="pb-16 md:pb-24 bg-muted/30 dark:bg-muted/10">
        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <MarkdownRenderer content={service.content} />
        </div>
      </SectionContainer>

      {/* --- CTA Section --- */}
      <SectionContainer className="text-center">
        <Heading level={2} className="text-2xl md:text-3xl font-poppins font-semibold mb-4">
          Ready to Discuss {service.title}?
        </Heading>
        <Paragraph className="text-lg text-muted-foreground dark:text-muted-foreground-dark max-w-xl mx-auto mb-6">
          Let&apos;s explore how this service can help you achieve your goals. Get in touch to start the conversation.
        </Paragraph>
        <Button
          href={`/contact?service=${encodeURIComponent(service.title)}&slug=${slug}`}
          variant="primary"
          size="lg"
        >
          Request Consultation
        </Button>
      </SectionContainer>
    </main>
  );
}
