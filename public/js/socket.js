const socket = io();

// Join rooms
const myId = document.getElementById('myId').value;
const receiverId = document.getElementById('receiverId').value;
socket.emit('join-room', myId);
socket.emit('join-room', receiverId);

// Typing event
const messageInput = document.getElementById('messageInput');
messageInput.addEventListener('input', () => {
  socket.emit('typing', { receiver: receiverId });
});

// Send message
const form = document.getElementById('chatForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit('send-message', { sender: myId, receiver: receiverId, text });
  appendMessage('me', text);
  messageInput.value = "";
});

// Receive message
socket.on('receive-message', data => {
  appendMessage('them', data.text);
});

// Typing indicator
socket.on('typing', () => {
  const typingDiv = document.getElementById('typing');
  typingDiv.innerText = "Typing...";
  setTimeout(() => typingDiv.innerText = "", 1200);
});

// Append message to chat box
function appendMessage(who, text) {
  const msg = document.createElement('div');
  msg.className = who === 'me' ? 'msg-me' : 'msg-them';
  msg.innerHTML = `<p>${text}</p>`;
  document.querySelector('.chat-box').appendChild(msg);
  document.querySelector('.chat-box').scrollTop = document.querySelector('.chat-box').scrollHeight;
}
