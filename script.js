let socket;
let username;
let room;

const joinScreen = document.getElementById("join");
const chatScreen = document.getElementById("chat");

const joinBtn = document.getElementById("joinBtn");
const sendBtn = document.getElementById("sendBtn");

const msgInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const roomTitle = document.getElementById("roomTitle");

joinBtn.onclick = () => {
  username = document.getElementById("username").value.trim();
  room = document.getElementById("room").value.trim();

  if (!username || !room) {
    alert("Please fill all fields");
    return;
  }

  connect();
};

function connect() {
  socket = new WebSocket(
    "wss://whisper-chat.albasith399.workers.dev/?room=" +
      encodeURIComponent(room)
  );

  socket.onopen = () => {
    joinScreen.classList.remove("active");
    chatScreen.classList.add("active");
    roomTitle.textContent = `# ${room}`;
    sendBtn.disabled = false;
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      renderMessage(data.user, data.text);
    } catch (err) {
      console.error("Invalid message", err);
    }
  };

  socket.onclose = () => {
    alert("Connection closed");
    sendBtn.disabled = true;
  };

  socket.onerror = () => {
    alert("WebSocket error");
  };
}

sendBtn.onclick = sendMessage;
msgInput.onkeydown = (e) => {
  if (e.key === "Enter") sendMessage();
};

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || socket.readyState !== 1) return;

  socket.send(JSON.stringify({
    user: username,
    text: text
  }));

  msgInput.value = "";
}

function renderMessage(user, text) {
  const div = document.createElement("div");
  div.className = "msg " + (user === username ? "me" : "other");

  div.textContent = text;

  const meta = document.createElement("span");
  meta.textContent = `${user} • ${new Date().toLocaleTimeString()}`;

  div.appendChild(meta);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
