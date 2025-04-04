import React from 'react';
import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link'; // Use MUI Link for breadcrumbs
import NextLink from 'next/link'; // Use NextLink for navigation
import { getServiceData, getAllServiceSlugs, ServiceData } from '@/lib/services';
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'; // Import the common component

// Define the expected params structure
interface ServicePageProps {
  params: {
    slug: string;
  };
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
  const slug = params.slug;
  const service = getServiceData(slug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `${service.title} - TheoForge Services`,
    description: service.excerpt,
    // Add other metadata fields if needed
  };
}

// The main page component
export default function ServicePage({ params }: ServicePageProps) {
  const slug = params.slug;

  // Fetch the full service data
  const service = getServiceData(slug);

  if (!service) {
    notFound();
  }

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg"> 
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
          <Link component={NextLink} underline="hover" color="inherit" href="/">
            Home
          </Link>
          {/* TODO: Add link to a potential "/services" overview page if it exists */}
          {/* <Link component={NextLink} underline="hover" color="inherit" href="/services">
            Services
          </Link> */}
          <Typography color="text.primary">{service.title}</Typography>
        </Breadcrumbs>

        {/* Service Title */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          {service.title}
        </Typography>

        {/* Render service content using Markdown */}
        <MarkdownRenderer content={service.content} />

        {/* Optional: Add a CTA section if needed */}

      </Container>
    </Box>
  );
}
