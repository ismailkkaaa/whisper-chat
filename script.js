let socket;
let username;
let room;
let typingTimer;

const joinScreen = document.getElementById("join");
const chatScreen = document.getElementById("chat");

const joinBtn = document.getElementById("joinBtn");
const sendBtn = document.getElementById("sendBtn");

const msgInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const roomTitle = document.getElementById("roomTitle");
const typingIndicator = document.getElementById("typingIndicator");

joinBtn.onclick = () => {
  username = document.getElementById("username").value.trim();
  room = document.getElementById("room").value.trim();
  if (!username || !room) return alert("Fill all fields");
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

    sendEvent("join");
    msgInput.focus();
  };

  socket.onmessage = e => {
    const data = JSON.parse(e.data);
    handleEvent(data);
  };

  socket.onclose = () => {
    sendBtn.disabled = true;
    typingIndicator.textContent = "Disconnected";
  };
}

function sendEvent(type, payload = {}) {
  socket.send(JSON.stringify({
    type,
    user: username,
    payload
  }));
}

/* Typing */
msgInput.addEventListener("input", () => {
  sendEvent("typing");
});

sendBtn.onclick = sendMessage;
msgInput.onkeydown = e => e.key === "Enter" && sendMessage();

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  sendEvent("message", { text });
  msgInput.value = "";
}

/* Events */
function handleEvent(data) {
  if (data.type === "typing" && data.user !== username) {
    typingIndicator.textContent = `${data.user} is typing…`;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => typingIndicator.textContent = "", 2000);
  }

  if (data.type === "join" || data.type === "leave") {
    systemMessage(`${data.user} ${data.type === "join" ? "joined" : "left"} the room`);
  }

  if (data.type === "message") {
    renderMessage(data.user, data.payload.text);
  }
}

/* Rendering */
function renderMessage(user, text) {
  const div = document.createElement("div");
  div.className = "msg " + (user === username ? "me" : "other");

  const name = document.createElement("strong");
  name.textContent = user + ": ";
  name.style.color = nameColor(user);

  const body = document.createElement("span");
  body.textContent = text;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = new Date().toLocaleTimeString();

  div.appendChild(name);
  div.appendChild(body);
  div.appendChild(meta);

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function systemMessage(text) {
  const div = document.createElement("div");
  div.className = "system";
  div.textContent = text;
  messages.appendChild(div);
}

/* Username color */
function nameColor(name) {
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return `hsl(${hash % 360},70%,60%)`;
}
