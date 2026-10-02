const input = document.getElementById("questionInput");
const chatBox = document.getElementById("chatBox");
const sendButton = document.getElementById("sendButton");


// ---------------------------------------------------
// Get current time
// ---------------------------------------------------

function getTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


// ---------------------------------------------------
// Add message to chat
// ---------------------------------------------------

function addMessage(message, sender) {

    const wrapper = document.createElement("div");

    wrapper.classList.add("message");

    if (sender === "user") {

        wrapper.classList.add("user-message");

        wrapper.innerHTML = `
            <div class="message-content">

                <div class="sender">
                    You
                </div>

                <div class="bubble">
                    ${escapeHtml(message)}
                </div>

                <div class="time">
                    ${getTime()}
                </div>

            </div>

            <div class="avatar">
                You
            </div>
        `;

    } else {

        wrapper.classList.add("bot-message");

        wrapper.innerHTML = `
            <div class="avatar">
                AI
            </div>

            <div class="message-content">

                <div class="sender">
                    CampusCareer
                </div>

                <div class="bubble">
                    ${message}
                </div>

                <div class="time">
                    ${getTime()}
                </div>

            </div>
        `;
    }

    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;
}


// ---------------------------------------------------
// Escape HTML
// ---------------------------------------------------

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ---------------------------------------------------
// Ask question
// ---------------------------------------------------

async function sendQuestion() {

    const question = input.value.trim();

    if (!question) {
        return;
    }

    addMessage(question, "user");

    input.value = "";

    sendButton.disabled = true;

    sendButton.innerText = "Thinking...";


    try {

        const response = await fetch("/ask", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })

        });


        const data = await response.json();


        let answer = data.answer;


        // Show matched FAQ for demonstration
        if (data.matched_question) {

            answer += `
                <div style="
                    margin-top:10px;
                    font-size:11px;
                    color:#6b7280;
                ">
                    Matched FAQ: ${escapeHtml(data.matched_question)}
                </div>
            `;
        }


        addMessage(answer, "bot");

    }

    catch (error) {

        addMessage(
            "Unable to connect to the chatbot server. Please make sure the Flask application is running.",
            "bot"
        );

    }

    finally {

        sendButton.disabled = false;

        sendButton.innerText = "Send";

        input.focus();
    }
}


// ---------------------------------------------------
// Quick question
// ---------------------------------------------------

function sendQuickQuestion(question) {

    input.value = question;

    sendQuestion();
}


// ---------------------------------------------------
// Press Enter to send
// ---------------------------------------------------

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendQuestion();
    }

});