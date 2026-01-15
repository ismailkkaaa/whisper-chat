// js/landing.js

document.getElementById("join").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const room = document.getElementById("room").value.trim();

  if (!username || !room) {
    alert("Please enter your name and room code");
    return;
  }

  // Store session data
  sessionStorage.setItem("whisper-user", username);
  sessionStorage.setItem("whisper-room", room);

  // ✅ IMPORTANT: use pretty URL only
  window.location.href = "/chat";
});
