// Klaviyo Form Integration
const KLAVIYO_PUBLIC_KEY = 'R5d6Sm';
const KLAVIYO_LIST_ID = 'UcNgUr';

// Function to subscribe email to Klaviyo using their legacy API endpoint
async function subscribeToKlaviyo(email, formElement) {
  try {
    // Using Klaviyo's legacy subscribe endpoint which is more reliable for client-side
    const formData = new URLSearchParams();
    formData.append('g', KLAVIYO_LIST_ID);
    formData.append('email', email);
    formData.append('$fields', '$source');
    formData.append('$source', 'Cabin Waitlist');

    const response = await fetch(`https://manage.kmail-lists.com/ajax/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await response.json();
    
    if (data.success || data.data?.is_subscribed) {
      showMessage(formElement, 'success', 'Thanks for joining the waitlist! Check your email for updates.');
      formElement.reset();
      return true;
    } else {
      console.error('Klaviyo API Error:', data);
      showMessage(formElement, 'error', 'Something went wrong. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Network Error:', error);
    showMessage(formElement, 'error', 'Network error. Please check your connection and try again.');
    return false;
  }
}

// Function to show success/error messages
function showMessage(formElement, type, message) {
  // Remove any existing message
  const existingMessage = formElement.parentElement.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message element
  const messageDiv = document.createElement('div');
  messageDiv.className = 'form-message mt-4 p-4 rounded-lg text-center font-medium';
  
  if (type === 'success') {
    messageDiv.classList.add('bg-[#008657]', 'bg-opacity-20', 'text-[#00B576]', 'border', 'border-[#00B576]');
  } else {
    messageDiv.classList.add('bg-red-900', 'bg-opacity-20', 'text-red-400', 'border', 'border-red-400');
  }
  
  messageDiv.textContent = message;
  formElement.parentElement.appendChild(messageDiv);

  // Auto-remove message after 5 seconds
  setTimeout(() => {
    messageDiv.style.transition = 'opacity 0.5s';
    messageDiv.style.opacity = '0';
    setTimeout(() => messageDiv.remove(), 500);
  }, 5000);
}

// Function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const email = emailInput.value.trim();

  // Validate email
  if (!email) {
    showMessage(form, 'error', 'Please enter your email address.');
    return;
  }

  if (!isValidEmail(email)) {
    showMessage(form, 'error', 'Please enter a valid email address.');
    return;
  }

  // Disable button during submission
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Joining...';

  // Submit to Klaviyo
  subscribeToKlaviyo(email, form).finally(() => {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  });
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get all waitlist forms
  const forms = document.querySelectorAll('.waitlist-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
});
