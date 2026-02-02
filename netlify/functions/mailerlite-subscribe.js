exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid email is required' }),
      };
    }

    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
    const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

    // Check environment variables
    if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
      console.error('Missing MailerLite credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Subscribe to MailerLite
    const response = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MAILERLITE_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email,
          groups: [MAILERLITE_GROUP_ID],
        }),
      }
    );

    // Handle response
    const text = await response.text();
    let responseData = null;

    if (text) {
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', text);
      }
    }

    if (!response.ok) {
      console.error('MailerLite API error:', response.status, responseData);

      // Handle specific error cases
      if (
        response.status === 422 &&
        responseData?.message?.includes('already exists')
      ) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Email already subscribed to waitlist',
          }),
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to subscribe to waitlist' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Successfully subscribed to waitlist',
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
