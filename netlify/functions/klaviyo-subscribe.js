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
      console.error('KLAVIYO_PRIVATE_KEY exists:', !!KLAVIYO_PRIVATE_KEY);
      console.error('KLAVIYO_LIST_ID exists:', !!KLAVIYO_LIST_ID);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Log configuration (without exposing the full key)
    console.log('Klaviyo List ID:', KLAVIYO_LIST_ID);
    console.log('API Key starts with:', KLAVIYO_PRIVATE_KEY.substring(0, 3));
    console.log('API Key length:', KLAVIYO_PRIVATE_KEY.length);

    // Step 1: Create or get profile
    console.log('Step 1: Creating/getting profile for email:', email);
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

    console.log('Profile response status:', profileResponse.status);
    let profileId;
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      profileId = profileData.data.id;
      console.log('Profile created/found with ID:', profileId);
    } else if (profileResponse.status === 409) {
      // Profile already exists, get it by email
      console.log('Profile exists (409), searching for it...');
      const searchResponse = await fetch(`https://a.klaviyo.com/api/profiles/?filter=equals(email,"${email}")`, {
        method: 'GET',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
          'revision': '2024-10-15'
        }
      });
      
      console.log('Search response status:', searchResponse.status);
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Failed to find existing profile:', errorText);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to process subscription' })
        };
      }
      
      const searchData = await searchResponse.json();
      if (searchData.data && searchData.data.length > 0) {
        profileId = searchData.data[0].id;
        console.log('Found existing profile with ID:', profileId);
      } else {
        console.error('Profile exists but could not be found in search results');
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to process subscription' })
        };
      }
    } else {
      const errorText = await profileResponse.text();
      console.error('Failed to create profile. Status:', profileResponse.status);
      console.error('Error response:', errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create profile' })
      };
    }

    // Step 2: Subscribe profile to list
    console.log('Step 2: Subscribing profile to list...');
    console.log('List ID being used:', KLAVIYO_LIST_ID);
    console.log('Profile ID being subscribed:', profileId);
    
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

    console.log('Subscribe response status:', subscribeResponse.status);

    if (!subscribeResponse.ok) {
      const errorText = await subscribeResponse.text();
      console.error('Failed to subscribe to list. Status:', subscribeResponse.status);
      console.error('Error response:', errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to subscribe to waitlist' })
      };
    }

    console.log('Successfully subscribed profile to list!');

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
