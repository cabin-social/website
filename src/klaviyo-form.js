document.addEventListener('DOMContentLoaded', function() {
  // Get all waitlist forms on the page
  const forms = document.querySelectorAll('.waitlist-form');
  
  // Function to create and show success banner
  function showSuccessBanner() {
    // Remove any existing banner
    const existingBanner = document.querySelector('.success-banner');
    if (existingBanner) {
      existingBanner.remove();
    }

    // Create banner
    const banner = document.createElement('div');
    banner.className = 'success-banner fixed bottom-0 left-0 right-0 h-[82px] flex items-center justify-center z-50 transform translate-y-full transition-transform duration-300 ease-out';
    banner.style.backgroundColor = '#24775A';
    
    // Create inner content container
    const content = document.createElement('div');
    content.className = 'max-w-[1280px] w-full px-6 flex items-center justify-between';
    
    // Create message text
    const message = document.createElement('span');
    message.className = 'text-white text-[1.125rem] font-normal';
    message.textContent = 'You have been added to the waitlist for Cabin!';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'text-white opacity-50 hover:opacity-100 transition-opacity';
    closeButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.57672 3.42422C2.34422 3.19172 2.34422 2.80922 2.57672 2.57672C2.80922 2.34422 3.19172 2.34422 3.42422 2.57672L12.0005 11.153L20.5767 2.57672C20.8092 2.34422 21.1917 2.34422 21.4242 2.57672C21.6567 2.80922 21.6567 3.19172 21.4242 3.42422L12.848 12.0005L21.4242 20.5767C21.6567 20.8092 21.6567 21.1917 21.4242 21.4242C21.1917 21.6567 20.8092 21.6567 20.5767 21.4242L12.0005 12.848L3.42422 21.4242C3.19172 21.6567 2.80922 21.6567 2.57672 21.4242C2.34422 21.1917 2.34422 20.8092 2.57672 20.5767L11.153 12.0005L2.57672 3.42422Z" fill="white"/>
      </svg>
    `;
    closeButton.onclick = function() {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 300);
    };
    
    content.appendChild(message);
    content.appendChild(closeButton);
    banner.appendChild(content);
    document.body.appendChild(banner);
    
    // Trigger animation
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 10);
  }

  // Function to show error message below form
  function showErrorMessage(form, errorText) {
    // Get or create message container
    let messageContainer = form.parentNode.querySelector('.form-message-container');
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'form-message-container';
      form.parentNode.appendChild(messageContainer);
    }

    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'form-message text-white text-[1rem] mt-4 px-4 py-3 rounded-lg bg-[#C41E3A]';
    errorMessage.textContent = errorText;
    messageContainer.innerHTML = '';
    messageContainer.appendChild(errorMessage);
  }
  
  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const formLocation = this.getAttribute('data-form-location') || 'unknown';
      console.log(`[Klaviyo Form] Submission started from: ${formLocation}`);

      const emailInput = this.querySelector('input[type="email"]');
      const submitButton = this.querySelector('button[type="submit"]');
      const email = emailInput.value.trim();
      
      console.log(`[Klaviyo Form] Email: ${email}`);

      // Remove any existing error messages
      const existingMessage = this.parentNode.querySelector('.form-message');
      if (existingMessage) {
        existingMessage.remove();
      }

      // Disable form during submission
      submitButton.disabled = true;
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Join the waitlist';

      try {
        console.log(`[Klaviyo Form] Sending request to Netlify function...`);
        
        const response = await fetch('/.netlify/functions/klaviyo-subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, formLocation })
        });

        console.log(`[Klaviyo Form] Response status: ${response.status}`);
        
        const data = await response.json();
        console.log(`[Klaviyo Form] Response data:`, data);

        if (response.ok) {
          // Success!
          submitButton.textContent = 'Join the waitlist';
          submitButton.style.backgroundColor = '#24775A';
          emailInput.value = '';

          // Show success banner
          showSuccessBanner();

          // Reset button after 2 seconds
          setTimeout(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '';
          }, 2000);
        } else {
          // Error from server
          console.error(`[Klaviyo Form] Server error from ${formLocation}:`, data);
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;

          // Show error message below form
          showErrorMessage(this, data.error || 'Failed to join waitlist. Please try again.');
        }
      } catch (error) {
        console.error(`[Klaviyo Form] Network error from ${formLocation}:`, error);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;

        // Show error message below form
        showErrorMessage(this, 'Something went wrong. Please try again.');
      }
    });
  });
});
