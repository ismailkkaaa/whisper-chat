document.getElementById("join").onclick = () => {
  const username = document.getElementById("username").value.trim();
  const room = document.getElementById("room").value.trim();

  if (!username || !room) {
    alert("Enter name and room");
    return;
  }

  sessionStorage.setItem("whisper-user", username);
  sessionStorage.setItem("whisper-room", room);

  window.location.href = "/chat.html";
};
