import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { startMeasurement, endMeasurement } from '@/lib/performanceMonitoring';

// Initialize email API client
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configuration
const TO_EMAIL = process.env.CONTACT_FORM_TO_EMAIL || 'your-default-recipient@example.com';
const FROM_EMAIL = process.env.CONTACT_FORM_FROM_EMAIL || 'onboarding@resend.dev';

// Rate limiting
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT = 5; // max submissions per 15 minutes
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

// Clean up rate limit tracking every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 60 * 1000); // 1 hour

// Contact form request handler
export async function POST(request: Request) {
  const perfMark = startMeasurement('contact_form_api');
  
  try {
    // Check if email service is configured
    if (!resend) {
      console.error('Resend API key is not configured. Set RESEND_API_KEY environment variable.');
      endMeasurement(perfMark, { 
        metadata: { 
          errorMessage: 'Email service not configured',
          success: false 
        } 
      });
      return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
    }
    
    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, timestamp: now };
    
    // Reset count if outside window
    if (now - rateData.timestamp > RATE_LIMIT_WINDOW) {
      rateData.count = 0;
      rateData.timestamp = now;
    }
    
    // Check if rate limited
    if (rateData.count >= RATE_LIMIT) {
      endMeasurement(perfMark, { 
        metadata: { 
          rateLimit: true,
          success: false 
        } 
      });
      return NextResponse.json({ 
        error: 'Too many requests', 
        message: 'Please wait before submitting another message.'
      }, { status: 429 });
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      endMeasurement(perfMark, { 
        metadata: { 
          validationError: true,
          success: false 
        } 
      });
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'Name, email, and message are all required.'
      }, { status: 400 });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      endMeasurement(perfMark, { 
        metadata: { 
          validationError: true,
          fieldError: 'email',
          success: false 
        } 
      });
      return NextResponse.json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address.'
      }, { status: 400 });
    }
    
    // Send email
    const { data, error } = await resend.emails.send({
      from: `TheoForge Contact <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject: `New Contact Form Submission from ${name}`,
      replyTo: email,
      html: `
        <p>You received a new message from your website contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p> 
      `,
    });
    
    // Handle email API errors
    if (error) {
      console.error('Resend Error:', error);
      endMeasurement(perfMark, { 
        metadata: { 
          errorMessage: error.message,
          errorType: 'email_api',
          success: false
        } 
      });
      return NextResponse.json({ 
        error: 'Failed to send message',
        message: 'There was a problem sending your message. Please try again later.'
      }, { status: 500 });
    }
    
    // Update rate limit counter
    rateData.count++;
    rateLimitMap.set(ip, rateData);
    
    // Log success and end measurement
    console.log('Email sent successfully via Resend:', data);
    endMeasurement(perfMark, { 
      metadata: { 
        success: true,
        emailId: data?.id
      } 
    });
    
    // Return success response
    return NextResponse.json({ 
      message: 'Message sent successfully!',
      data: { id: data?.id }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    endMeasurement(perfMark, { 
      metadata: { 
        errorMessage: error instanceof Error ? error.message : String(error),
        success: false
      } 
    });
    
    // Return appropriate error based on type
    if (error instanceof SyntaxError) { 
      return NextResponse.json({ 
        error: 'Invalid request body',
        message: 'The request could not be processed. Please check your input and try again.'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
}
