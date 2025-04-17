'use client';

import React from 'react';
import PageContainer from '@/components/Layout/PageContainer';

// Rebuilt Contact Page Component
const ContactPage: React.FC = () => {
  const pageTitle = "Meet Theophrastus";
  const pageSubtitle = "Our AI assistant that can answer your questions, collect your information, and connect you with our team.";

  return (
    <main>
      <PageContainer 
        title={pageTitle} 
        subtitle={pageSubtitle} 
      >
        {/* Zapier Chatbot Integration */}
        <div className="mx-auto w-full flex flex-col items-center justify-center pb-12">
          <div className="relative w-full max-w-md mx-auto">
            {/* Zapier Chatbot using iframe approach */}
            <iframe 
              src="https://interfaces.zapier.com/embed/chatbot/cm91mcgc2002yc41mrfhan884" 
              height="600px" 
              width="100%" 
              allow="clipboard-write *" 
              style={{ border: 'none' }}
              title="Theophrastus AI Chatbot"
            />
          </div>
        </div>

        {/* Divider */}
        <hr className="my-12 md:my-16 border-border-light dark:border-border-dark" />

        {/* Contact Info Section */}
        <div className="text-center"> 
          <h2 className="font-poppins text-2xl font-semibold mb-6 text-text-primary dark:text-dark-text-primary">
            Contact Information
          </h2>
          <div className="flex flex-col space-y-3 items-center">
            <a
              href="mailto:info@yourcompany.com" 
              className="font-poppins flex items-center text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-colors duration-150 ease-in-out"
            >
              <span className="ml-2">info@yourcompany.com</span> 
            </a>
            <a
              href="tel:+1234567890" 
              className="font-poppins flex items-center text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-colors duration-150 ease-in-out"
            >
              <span className="ml-2">(123) 456-7890</span> 
            </a>
            {/* Add Address etc. if needed using similar structure */}
          </div>
        </div>
      </PageContainer>
    </main>
  );
 };

export default ContactPage;
