const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Parse form data from URL encoded format
    const params = new URLSearchParams(event.body);
    
    const business_name = params.get('business_name') || 'Test Business';
    const content_topics = params.get('content_topics') || 'AI, Marketing';
    const website_url = params.get('website_url') || '';
    const social_media = params.get('social_media') || '';
    const email = params.get('email');
    const product_name = params.get('product_name') || 'AI Content Package';

    console.log('Form data received:', {
      business_name,
      content_topics,
      website_url,
      social_media,
      email,
      product_name
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product_name,
              description: `AI Content for ${business_name} - ${content_topics}`,
            },
            unit_amount: 2900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://autocontentengine.netlify.app/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://autocontentengine.netlify.app/onboarding.html',
      customer_email: email,
      metadata: {
        business_name: business_name,
        content_topics: content_topics,
        website_url: website_url,
        social_media: social_media,
        product_name: product_name,
        product_id: 'ai_content_package'
      },
    });

    console.log('Stripe session created with metadata:', session.metadata);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      })
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
