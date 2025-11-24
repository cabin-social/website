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

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid email is required' })
      };
    }

    const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY;
    const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

    // Check environment variables
    if (!KLAVIYO_PRIVATE_KEY || !KLAVIYO_LIST_ID) {
      console.error('Missing Klaviyo credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // First, create or update the profile
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
            email: email
          }
        }
      })
    });

    let profileId;
    const profileText = await profileResponse.text();
    
    if (profileResponse.status === 201) {
      // New profile created
      const profileData = JSON.parse(profileText);
      profileId = profileData.data.id;
    } else if (profileResponse.status === 409) {
      // Profile already exists - get the ID from the error response
      const errorData = JSON.parse(profileText);
      // Extract profile ID from the duplicate error
      if (errorData.errors && errorData.errors[0] && errorData.errors[0].meta && errorData.errors[0].meta.duplicate_profile_id) {
        profileId = errorData.errors[0].meta.duplicate_profile_id;
      } else {
        console.error('Could not extract profile ID from conflict response:', profileText);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to process subscription' })
        };
      }
    } else {
      console.error('Profile creation failed:', profileResponse.status, profileText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create profile' })
      };
    }

    // Now subscribe the profile to the list
    const response = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
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
      console.error('Klaviyo API error:', response.status, responseData);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to subscribe to waitlist' })
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
