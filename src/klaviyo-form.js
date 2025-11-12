document.addEventListener('DOMContentLoaded', function() {
  // Get all waitlist forms on the page
  const forms = document.querySelectorAll('.waitlist-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const submitButton = this.querySelector('button[type="submit"]');
      const email = emailInput.value.trim();
      
      // Disable form during submission
      submitButton.disabled = true;
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Joining...';
      
      try {
        const response = await fetch('/.netlify/functions/klaviyo-subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Success!
          submitButton.textContent = '✓ Joined!';
          submitButton.style.backgroundColor = '#00B576';
          emailInput.value = '';
          
          // Reset button after 3 seconds
          setTimeout(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '';
          }, 3000);
        } else {
          // Error from server
          alert(data.error || 'Failed to join waitlist. Please try again.');
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  });
});