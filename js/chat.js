const user = sessionStorage.getItem("whisper-user");
const room = sessionStorage.getItem("whisper-room");

if (!user || !room) location.href = "/";

document.getElementById("room").textContent = `# ${room}`;

const input = document.getElementById("input");
const messages = document.getElementById("messages");
const typing = document.getElementById("typing");

const ws = new WebSocket(
  "wss://whisper-chat.albasith399.workers.dev/?room=" +
  encodeURIComponent(room)
);

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "join", user }));
  setTimeout(() => input.focus(), 50);
};

ws.onmessage = e => {
  const data = JSON.parse(e.data);

  if (data.type === "typing" && data.user !== user) {
    typing.textContent = `${data.user} is typing…`;
    clearTimeout(window._t);
    window._t = setTimeout(() => typing.textContent = "", 1500);
  }

  if (data.type === "join" || data.type === "leave") {
    system(`${data.user} ${data.type === "join" ? "joined" : "left"}`);
  }

  if (data.type === "message") {
    add(data.user, data.text);
  }
};

input.addEventListener("input", () => {
  ws.send(JSON.stringify({ type: "typing", user }));
});

document.getElementById("send").onclick = send;
input.onkeydown = e => e.key === "Enter" && send();

function send() {
  const text = input.value.trim();
  if (!text) return;
  ws.send(JSON.stringify({ type: "message", user, text }));
  input.value = "";
}

function add(u, t) {
  const div = document.createElement("div");
  div.className = "msg" + (u === user ? " me" : "");
  div.textContent = `${u}: ${t}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function system(t) {
  const div = document.createElement("div");
  div.className = "system";
  div.textContent = t;
  messages.appendChild(div);
}
