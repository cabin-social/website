exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY;
    const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

    if (!KLAVIYO_PRIVATE_KEY || !KLAVIYO_LIST_ID) {
      console.error('Missing Klaviyo credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Step 1: Create or update profile
    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: email,
            properties: {
              source: 'Cabin Waitlist'
            }
          }
        }
      })
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Klaviyo profile creation failed:', errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create profile' })
      };
    }

    const profileData = await profileResponse.json();
    const profileId = profileData.data.id;

    // Step 2: Subscribe profile to list
    const subscribeResponse = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify({
        data: [
          {
            type: 'profile',
            id: profileId
          }
        ]
      })
    });

    if (!subscribeResponse.ok) {
      const errorText = await subscribeResponse.text();
      console.error('Klaviyo list subscription failed:', errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to subscribe to list' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed to waitlist'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
