const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

// Add message to the chat window
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.innerHTML = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to parse time input for reminders
function parseReminderTime(input) {
    const timePattern = /(\d+)\s*(seconds?|minutes?|hours?)/i;
    const match = input.match(timePattern);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        let milliseconds = 0;

        if (unit.startsWith('second')) milliseconds = value * 1000;
        else if (unit.startsWith('minute')) milliseconds = value * 60 * 1000;
        else if (unit.startsWith('hour')) milliseconds = value * 60 * 60 * 1000;

        return milliseconds;
    }
    return null;
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

    // Check if the user is setting a reminder
    if (userMessage.toLowerCase().includes("set a reminder")) {
        const reminderTime = parseReminderTime(userMessage);
        if (reminderTime) {
            const reminderMessage = userMessage.replace(/set a reminder to|in \d+ (seconds?|minutes?|hours?)/i, "").trim();
            addMessage(`Got it! I'll remind you: "${reminderMessage}" in ${reminderTime / 1000} seconds.`);
            setTimeout(() => {
                addMessage(`Reminder: "${reminderMessage}"`);
            }, reminderTime);
        } else {
            addMessage("I couldn't understand the time for the reminder. Please specify it in seconds, minutes, or hours.");
        }
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

        // Format the response to treat the stars as headings
        const formattedReply = formatResponse(botReply);
        addMessage(formattedReply); // Displaying formatted bot's reply
    } catch (error) {
        console.error('Error:', error);
        addMessage("I'm sorry, I couldn't process that. Please try again.");
    }
}

// Function to format the response, making **text** as headings
function formatResponse(responseText) {
    // Split the response into segments based on the presence of "**" to create headings
    const sections = responseText.split('**').map((segment, index) => {
        // If the segment is an odd index, it's a heading, otherwise it's content
        if (index % 2 !== 0) {
            return `<h3>${segment}</h3>`;
        } else {
            return `<p>${segment}</p>`;
        }
    });

    return sections.join('');
}

// Handle enter key press for sending messages
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Initial greeting
addMessage("Hello! I'm your virtual assistant. How can I help you today?");
