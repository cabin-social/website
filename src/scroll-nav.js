// Scroll-based navigation highlighting
(function () {
  // Get all navigation links and their corresponding sections
  const navLinks = {
    'our-story': document.querySelector('a[href="#our-story"]'),
    'how-were-different': document.querySelector(
      'a[href="#how-were-different"]'
    ),
    faq: document.querySelector('a[href="#faq"]'),
  };

  // Get all mobile menu links
  const mobileNavLinks = {
    'our-story': document.querySelectorAll('a[href="#our-story"]')[1],
    'how-were-different': document.querySelectorAll(
      'a[href="#how-were-different"]'
    )[1],
    faq: document.querySelectorAll('a[href="#faq"]')[1],
  };

  const sections = {
    'our-story': document.getElementById('our-story'),
    'how-were-different': document.getElementById('how-were-different'),
    faq: document.getElementById('faq'),
  };

  // Active state color (hover color from the design)
  const activeColor = '#E4E9FF';
  const inactiveColor = '#ACBCF5';

  // Function to update active navigation link
  function updateActiveNav() {
    const scrollPosition = window.scrollY + 150; // Offset for header height

    let currentSection = null;

    // Determine which section is currently in view
    Object.keys(sections).forEach(sectionId => {
      const section = sections[sectionId];
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = sectionId;
        }
      }
    });

    // Update all navigation links
    Object.keys(navLinks).forEach(sectionId => {
      const link = navLinks[sectionId];
      const mobileLink = mobileNavLinks[sectionId];

      if (link) {
        if (sectionId === currentSection) {
          // Apply active state (hover color)
          link.style.color = activeColor;
        } else {
          // Reset to default color
          link.style.color = inactiveColor;
        }
      }

      // Update mobile menu links as well
      if (mobileLink) {
        if (sectionId === currentSection) {
          mobileLink.style.color = 'white';
        } else {
          mobileLink.style.color = '#7780A3';
        }
      }
    });
  }

  // Throttle function to improve performance
  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Add scroll event listener with throttling
  window.addEventListener('scroll', throttle(updateActiveNav, 100));

  // Initial check on page load
  updateActiveNav();
})();
