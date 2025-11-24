exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, formLocation } = body;
    
    console.log(`[Klaviyo Subscribe] Request received from form: ${formLocation || 'unknown'}`);
    console.log(`[Klaviyo Subscribe] Email: ${email}`);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error(`[Klaviyo Subscribe] Invalid email format: ${email}`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Valid email is required' })
      };
    }

    const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY;
    const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

    // Check environment variables
    if (!KLAVIYO_PRIVATE_KEY || !KLAVIYO_LIST_ID) {
      console.error('[Klaviyo Subscribe] Missing Klaviyo credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    console.log(`[Klaviyo Subscribe] Using List ID: ${KLAVIYO_LIST_ID}`);
    console.log(`[Klaviyo Subscribe] Sending request to Klaviyo API...`);

    // Subscribe to Klaviyo
    const requestBody = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email: email
                }
              }
            ]
          }
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: KLAVIYO_LIST_ID
            }
          }
        }
      }
    };
    
    console.log(`[Klaviyo Subscribe] Request body:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify(requestBody)
    });

    // Handle response
    console.log(`[Klaviyo Subscribe] Klaviyo API response status: ${response.status}`);
    
    const text = await response.text();
    console.log(`[Klaviyo Subscribe] Klaviyo API raw response:`, text);
    
    let responseData = null;
    
    if (text) {
      try {
        responseData = JSON.parse(text);
        console.log(`[Klaviyo Subscribe] Klaviyo API parsed response:`, JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.error('[Klaviyo Subscribe] Failed to parse response:', text);
      }
    }

    if (!response.ok) {
      console.error(`[Klaviyo Subscribe] Klaviyo API error for ${formLocation || 'unknown'} form:`, response.status, responseData);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to subscribe to waitlist',
          details: responseData 
        })
      };
    }

    console.log(`[Klaviyo Subscribe] Successfully subscribed ${email} from ${formLocation || 'unknown'} form`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed to waitlist',
        formLocation: formLocation || 'unknown'
      })
    };

  } catch (error) {
    console.error('[Klaviyo Subscribe] Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
