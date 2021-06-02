const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();
socket.emit("joinRoom", { username, room });
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const msg = event.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  event.target.elements.msg.value = "";
});
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span> ${message.time}</span></p>
                   <p class="text">
                      ${message.text}
                    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}
function outputRoomName(room) {
  roomName.innerText = room;
}
function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
}
