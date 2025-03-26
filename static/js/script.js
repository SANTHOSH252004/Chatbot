// Global stack to save previous quick reply states (each state is an array).
let quickReplyStack = [];

// Define the default quick replies.
const defaultQuickReplies = ["Product Details", "Treatment Plan", "Payment Detail", "Claim Info"];

/**
 * Append a new bot message to the chat box.
 */
function addBotMessage(text) {
  const chatBox = document.getElementById('chat-box');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.innerHTML = `
    <div class="avatar"><i class="fas fa-robot"></i></div>
    <div class="content">${text}</div>
  `;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Update the quick reply container with given buttons.
 * If the quickReplies array is empty, use the default quick replies.
 * Also, only push the new state onto the stack if it's different from the current top.
 */
function updateQuickReplyButtons(quickReplies = []) {
  // Fallback to default if none provided.
  if (!quickReplies || quickReplies.length === 0) {
    quickReplies = defaultQuickReplies;
  }
  
  const container = document.getElementById('quick-reply-container');
  container.innerHTML = ''; // Clear previous buttons

  // Remove unwanted options.
  quickReplies = quickReplies.filter(reply => !["Help", "Support", "Talk to an agent"].includes(reply));

  // Only push new state if the array is non-empty and not a restoration triggered by "Go Back"
  if (quickReplies.length && quickReplies[0] !== "Go Back") {
    const currentState = quickReplyStack.length 
      ? JSON.stringify(quickReplyStack[quickReplyStack.length - 1])
      : null;
    if (currentState !== JSON.stringify(quickReplies)) {
      quickReplyStack.push(quickReplies);
    }
  }
  
  quickReplies.forEach(reply => {
    const button = document.createElement('button');
    button.className = 'quick-reply';
    button.textContent = reply;
    button.addEventListener('click', () => sendQuickReply(reply));
    container.appendChild(button);
  });
}

/**
 * Called when a quick reply button is clicked.
 * - If "Go Back" is clicked, restore the previous quick reply state or default if none exists.
 * - If "Product Details" is clicked, update to the product submenu.
 * - If "Treatment Plan", "Payment Detail", or "Claim Info" is clicked, update the quick replies to just ["Go Back"].
 * - Otherwise, send the query to the backend.
 */
function sendQuickReply(text) {
  if (text === "Go Back") {
    // Restore the previous quick reply state if available.
    if (quickReplyStack.length > 1) {
      quickReplyStack.pop(); // Remove current submenu state.
      const previousReplies = quickReplyStack[quickReplyStack.length - 1];
      updateQuickReplyButtons(previousReplies);
    } else {
      // If there's no previous state, revert to the default options.
      updateQuickReplyButtons(defaultQuickReplies);
    }
    return; // Do not send a backend query.
  }
  
  // If "Product Details" is clicked, update to product submenu.
  if (text === "Product Details") {
    updateQuickReplyButtons(["Braces", "Invisalign", "Retainers", "Go Back"]);
    return; // Do not send a backend query.
  }
  
  // For Treatment Plan, Payment Detail, or Claim Info, update quick replies to only display "Go Back"
  if (["Treatment Plan", "Payment Detail", "Claim Info"].includes(text)) {
    // Append user's message
    const chatBox = document.getElementById('chat-box');
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `
      <div class="avatar"><i class="fas fa-user"></i></div>
      <div class="content">${text}</div>
    `;
    chatBox.appendChild(userMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Send the query to the backend.
    fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `user_query=${encodeURIComponent(text)}`
    })
    .then(response => response.json())
    .then(data => {
      addBotMessage(data.response);
      // Force quick replies to ["Go Back"] regardless of backend data.
      updateQuickReplyButtons(["Go Back"]);
      if (data.response.includes("transferring")) {
        addSystemMessage("Customer Care Bot left");
        addSystemMessage("Agent Alex joined");
      }
    })
    .catch(error => {
      addSystemMessage("Failed to get response from server.");
      console.error("Error:", error);
    });
    return;
  }
  
  // For submenu options (Braces, Invisalign, Retainers) or other main menu options:
  const chatBox = document.getElementById('chat-box');
  const userMessage = document.createElement('div');
  userMessage.className = 'message user';
  userMessage.innerHTML = `
    <div class="avatar"><i class="fas fa-user"></i></div>
    <div class="content">${text}</div>
  `;
  chatBox.appendChild(userMessage);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Send the query to the backend.
  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `user_query=${encodeURIComponent(text)}`
  })
  .then(response => response.json())
  .then(data => {
    addBotMessage(data.response);
    // Always update quick replies with either backend data or default if empty.
    if (!data.quick_replies || data.quick_replies.length === 0) {
      updateQuickReplyButtons(defaultQuickReplies);
    } else {
      // If the clicked option is one of the product submenu items, keep the submenu intact.
      if (["Braces", "Invisalign", "Retainers"].includes(text)) {
        updateQuickReplyButtons(["Braces", "Invisalign", "Retainers", "Go Back"]);
      } else {
        updateQuickReplyButtons(data.quick_replies);
      }
    }
    if (data.response.includes("transferring")) {
      addSystemMessage("Customer Care Bot left");
      addSystemMessage("Agent Alex joined");
    }
  })
  .catch(error => {
    addSystemMessage("Failed to get response from server.");
    console.error("Error:", error);
  });
}

/**
 * Append a system message to the chat box.
 */
function addSystemMessage(text) {
  const chatBox = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = 'system-message';
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Called when the user submits a query via the text input or Enter key.
 */
function sendQuery() {
  const userInput = document.getElementById('user-query');
  const chatBox = document.getElementById('chat-box');
  const userQuery = userInput.value;
  
  if (!userQuery.trim()) return;
  
  const userMessage = document.createElement('div');
  userMessage.className = 'message user';
  userMessage.innerHTML = `
    <div class="avatar"><i class="fas fa-user"></i></div>
    <div class="content">${userQuery}</div>
  `;
  chatBox.appendChild(userMessage);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `user_query=${encodeURIComponent(userQuery)}`
  })
  .then(response => response.json())
  .then(data => {
    addBotMessage(data.response);
    // Always keep quick replies visible.
    if (!data.quick_replies || data.quick_replies.length === 0) {
      updateQuickReplyButtons(defaultQuickReplies);
    } else {
      updateQuickReplyButtons(data.quick_replies);
    }
  })
  .catch(error => {
    addSystemMessage("Failed to get response from server.");
    console.error("Error:", error);
  });
  
  userInput.value = '';
}

/**
 * Handle Enter key press in the text input.
 */
function handleKeyPress(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendQuery();
  }
}
