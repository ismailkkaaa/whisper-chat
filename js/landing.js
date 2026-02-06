// Enhanced landing page JavaScript with better UX

document.addEventListener('DOMContentLoaded', () => {
  const joinButton = document.getElementById("join");
  const usernameInput = document.getElementById("username");
  const roomInput = document.getElementById("room");
  const inputs = [usernameInput, roomInput];

  // Form validation and enhancement
  function validateForm() {
    const username = usernameInput.value.trim();
    const room = roomInput.value.trim();
    
    // Reset styles
    inputs.forEach(input => {
      input.classList.remove('error', 'success');
    });
    
    let isValid = true;
    
    // Validate username
    if (!username) {
      usernameInput.classList.add('error');
      isValid = false;
    } else if (username.length < 2) {
      usernameInput.classList.add('error');
      showError(usernameInput, 'Name must be at least 2 characters');
      isValid = false;
    } else {
      usernameInput.classList.add('success');
    }
    
    // Validate room
    if (!room) {
      roomInput.classList.add('error');
      isValid = false;
    } else if (room.length < 3) {
      roomInput.classList.add('error');
      showError(roomInput, 'Room code must be at least 3 characters');
      isValid = false;
    } else {
      roomInput.classList.add('success');
    }
    
    return isValid;
  }

  function showError(input, message) {
    // Remove existing error message
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
      color: var(--ig-error);
      font-size: 14px;
      margin-top: 5px;
      animation: fadeIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
  }

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
  }

  // Enhanced join button handler
  joinButton.addEventListener("click", (e) => {
    e.preventDefault();
    
    clearErrors();
    
    if (validateForm()) {
      const username = usernameInput.value.trim();
      const room = roomInput.value.trim();
      
      // Show loading state
      joinButton.classList.add('loading');
      joinButton.disabled = true;
      joinButton.textContent = 'Connecting...';
      
      // Store session data
      sessionStorage.setItem("whisper-user", username);
      sessionStorage.setItem("whisper-room", room);
      
      // Add slight delay for better UX
      setTimeout(() => {
        window.location.href = "/chat";
      }, 800);
    }
  });

  // Enter key support
  inputs.forEach(input => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        joinButton.click();
      }
    });
    
    // Real-time validation
    input.addEventListener("input", () => {
      if (input.value.trim()) {
        input.classList.remove('error');
      }
    });
  });

  // Auto-focus first input
  usernameInput.focus();

  // Add subtle animations
  document.querySelector('.card').style.opacity = '0';
  document.querySelector('.card').style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    document.querySelector('.card').style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    document.querySelector('.card').style.opacity = '1';
    document.querySelector('.card').style.transform = 'translateY(0)';
  }, 100);

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      joinButton.click();
    }
  });
});

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .error-message {
    animation: fadeIn 0.3s ease;
  }
`;
document.head.appendChild(style);
