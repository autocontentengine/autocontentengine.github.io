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
    const { email } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Blog Article Package',
            description: 'Professional blog article with social media posts',
          },
          unit_amount: 2900,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://your-site.netlify.app/success',
      cancel_url: 'https://your-site.netlify.app/',
      customer_email: email,
      metadata: { product_id: 'blog_article_package', product_name: 'Blog Article Package' },
    });

    return { statusCode: 200, headers, body: JSON.stringify({ id: session.id }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
