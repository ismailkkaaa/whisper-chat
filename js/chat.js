// Enhanced chat JavaScript with improved UX

/* SESSION DATA */
const username = sessionStorage.getItem("whisper-user");
const room = sessionStorage.getItem("whisper-room");

if (!username || !room) {
  location.href = "/";
}

/* DOM ELEMENTS */
const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const roomName = document.getElementById("roomName");
const typingIndicator = document.getElementById("typingIndicator");

// Set room name with enhanced styling
roomName.innerHTML = `<span class="online-indicator"></span># ${room}`;

/* SOCKET CONNECTION */
const socket = new WebSocket(
  "wss://whisper-chat.albasith399.workers.dev/?room=" +
    encodeURIComponent(room)
);

/* STATE MANAGEMENT */
let isConnected = false;
let typingTimeout;
let lastMessageTime = Date.now();

/* UTILITY FUNCTIONS */
function forceFocus() {
  setTimeout(() => {
    input.focus();
    input.click();
  }, 50);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideInRight 0.3s ease;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* SOCKET EVENT HANDLERS */
socket.onopen = () => {
  isConnected = true;
  socket.send(JSON.stringify({ type: "join", user: username }));
  showToast('Connected to chat!', 'success');
  forceFocus();
  updateConnectionStatus(true);
};

socket.onclose = () => {
  isConnected = false;
  showToast('Connection lost. Reconnecting...', 'error');
  updateConnectionStatus(false);
  // Attempt to reconnect
  setTimeout(() => {
    if (!isConnected) {
      location.reload();
    }
  }, 3000);
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
  showToast('Connection error occurred', 'error');
};

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    handleMessage(data);
  } catch (error) {
    console.error('Error parsing message:', error);
  }
};

function handleMessage(data) {
  switch (data.type) {
    case "join":
      systemMessage(`${data.user} joined the chat`);
      break;
      
    case "leave":
      systemMessage(`${data.user} left the chat`);
      break;
      
    case "typing":
      if (data.user !== username) {
        showTypingIndicator(data.user);
      }
      break;
      
    case "message":
      addMessage(data.user, data.text, data.timestamp || Date.now());
      break;
      
    default:
      console.warn('Unknown message type:', data.type);
  }
}

function showTypingIndicator(user) {
  typingIndicator.textContent = `${user} is typing...`;
  typingIndicator.classList.add('loading-dots');
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingIndicator.textContent = "";
    typingIndicator.classList.remove('loading-dots');
  }, 2000);
}

function updateConnectionStatus(connected) {
  const indicator = document.querySelector('.online-indicator');
  if (indicator) {
    indicator.style.backgroundColor = connected ? '#4CAF50' : '#F44336';
  }
}

/* MESSAGE SENDING */
function sendMessage() {
  const text = input.value.trim();
  
  if (!text) {
    input.focus();
    return;
  }
  
  if (!isConnected) {
    showToast('Not connected to server', 'error');
    return;
  }
  
  // Anti-spam protection
  const now = Date.now();
  if (now - lastMessageTime < 300) {
    return; // Prevent rapid message sending
  }
  lastMessageTime = now;
  
  try {
    socket.send(JSON.stringify({
      type: "message",
      user: username,
      text,
      timestamp: now
    }));
    
    input.value = "";
    forceFocus();
    
    // Visual feedback
    sendBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      sendBtn.style.transform = 'scale(1)';
    }, 100);
    
  } catch (error) {
    console.error('Error sending message:', error);
    showToast('Failed to send message', 'error');
  }
}

/* EVENT LISTENERS */
sendBtn.addEventListener('click', sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

input.addEventListener("input", () => {
  if (isConnected) {
    socket.send(JSON.stringify({ type: "typing", user: username }));
  }
});

// Click anywhere to refresh focus
document.body.addEventListener("click", forceFocus);

// Window visibility change handling
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isConnected) {
    forceFocus();
  }
});

/* RENDER FUNCTIONS */
function addMessage(user, text, timestamp) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `msg ${user === username ? 'me' : ''}`;
  
  // Add user and message content
  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;
  
  // Add timestamp
  const timeSpan = document.createElement('span');
  timeSpan.className = 'timestamp';
  timeSpan.textContent = formatTime(timestamp);
  
  messageDiv.appendChild(content);
  messageDiv.appendChild(timeSpan);
  
  messages.appendChild(messageDiv);
  
  // Scroll to bottom with smooth animation
  setTimeout(() => {
    messages.scrollTo({
      top: messages.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
  
  // Add notification for new messages from others
  if (user !== username && document.hidden) {
    document.title = `New message from ${user}`;
    setTimeout(() => {
      document.title = `Whisper Chat - #${room}`;
    }, 3000);
  }
}

function systemMessage(text) {
  const div = document.createElement("div");
  div.className = "system";
  div.textContent = text;
  messages.appendChild(div);
  
  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: 'smooth'
  });
}

/* INITIALIZATION */
document.addEventListener('DOMContentLoaded', () => {
  // Set page title
  document.title = `Whisper Chat - #${room}`;
  
  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .message-content {
      word-break: break-word;
      white-space: pre-wrap;
    }
  `;
  document.head.appendChild(style);
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "leave", user: username }));
  }
});
