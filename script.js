let socket;
let username;
let room;

const joinScreen = document.getElementById("join-screen");
const chatScreen = document.getElementById("chat-screen");

const joinBtn = document.getElementById("join-btn");
const sendBtn = document.getElementById("send-btn");

const msgInput = document.getElementById("message");
const messages = document.getElementById("messages");
const roomTitle = document.getElementById("room-title");

joinBtn.onclick = () => {
  username = document.getElementById("username").value.trim();
  room = document.getElementById("room").value.trim();

  if (!username || !room) {
    alert("Enter name and room");
    return;
  }

  connect();
};

function connect() {
  socket = new WebSocket(
    "wss://whisper-chat.albasith399.workers.dev/?room=" + room
  );

  socket.onopen = () => {
    joinScreen.classList.remove("active");
    chatScreen.classList.add("active");
    roomTitle.innerText = "Room: " + room;
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    addMessage(data.user, data.text);
  };

  socket.onerror = () => {
    alert("Connection error");
  };
}

sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;

  socket.send(JSON.stringify({
    user: username,
    text: text
  }));

  msgInput.value = "";
};

function addMessage(user, text) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<b>${user}</b>: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
