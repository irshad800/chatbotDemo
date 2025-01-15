const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

// Add message to the chat window
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to handle the send message action
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Display user's message
    addMessage(userMessage, true);
    userInput.value = '';

    // Check if the user is asking for time
    if (userMessage.toLowerCase().includes("time") || userMessage.toLowerCase().includes("date")) {
        const currentTime = new Date().toLocaleString();
        addMessage(`Current date and time: ${currentTime}`);
        return;
    }

    // API call to ChatGPT to get the response
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAULa8yH0tbRL7blqk05ctJLr8feA3YwkM', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;
        addMessage(botReply); // Displaying bot's reply
    } catch (error) {
        console.error('Error:', error);
        addMessage("I'm sorry, I couldn't process that. Please try again.");
    }
}

// Handle enter key press for sending messages
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Initial greeting
addMessage("Hello! I'm your virtual assistant. How can I help you today?");
