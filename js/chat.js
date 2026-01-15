/* SESSION DATA */
const username = sessionStorage.getItem("whisper-user");
const room = sessionStorage.getItem("whisper-room");

if (!username || !room) {
  location.href = "/";
}

/* DOM */
const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const roomName = document.getElementById("roomName");
const typingIndicator = document.getElementById("typingIndicator");

roomName.textContent = `# ${room}`;

/* SOCKET */
const socket = new WebSocket(
  "wss://whisper-chat.albasith399.workers.dev/?room=" +
    encodeURIComponent(room)
);

/* ENSURE FOCUS WORKS ON DESKTOP */
function forceFocus() {
  setTimeout(() => {
    input.focus();
    input.click(); // 🔥 Firefox / Desktop fallback
  }, 50);
}

/* SOCKET OPEN */
socket.onopen = () => {
  socket.send(JSON.stringify({ type: "join", user: username }));
  forceFocus();
};

/* SOCKET MESSAGE */
let typingTimeout;

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "join") {
    systemMessage(`${data.user} joined`);
  }

  if (data.type === "leave") {
    systemMessage(`${data.user} left`);
  }

  if (data.type === "typing" && data.user !== username) {
    typingIndicator.textContent = `${data.user} is typing…`;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      typingIndicator.textContent = "";
    }, 1500);
  }

  if (data.type === "message") {
    addMessage(data.user, data.text);
  }
};

/* SEND MESSAGE */
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  socket.send(
    JSON.stringify({
      type: "message",
      user: username,
      text
    })
  );

  input.value = "";
  forceFocus();
}

/* EVENTS */
sendBtn.onclick = sendMessage;

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* SEND TYPING EVENT */
input.addEventListener("input", () => {
  socket.send(JSON.stringify({ type: "typing", user: username }));
});

/* CLICK ANYWHERE TO REFRESH FOCUS */
document.body.addEventListener("click", forceFocus);

/* RENDER FUNCTIONS */
function addMessage(user, text) {
  const div = document.createElement("div");
  div.className = "msg" + (user === username ? " me" : "");
  div.textContent = `${user}: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function systemMessage(text) {
  const div = document.createElement("div");
  div.className = "system";
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
