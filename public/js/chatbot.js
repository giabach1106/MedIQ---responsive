const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
import { dataToSend } from "../js/chiso.js"
let userMessage = null; // Variable to store user's message
<<<<<<< HEAD
const API_KEY = "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"; // Paste your API key here
=======
 // Paste your API key here
// const API_KEY = "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";
>>>>>>> 92ef44dd5960d824a62a0569326d9ae07d5c2d94
const inputInitHeight = chatInput.scrollHeight;
console.log(dataToSend);
const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");
    if(userMessage == "Đánh giá"){
        userMessage = "Với các chỉ số sức khoẻ sau đây, hãy nhận xét tình trạng sức khoẻ của tôi bằng Tiếng Việt một cách ngắn gọn, trả lời một cách tổng quát tối da trong 50 từ - chỉ sô SPO2= " + dataToSend.spo2 + " - thân nhiệt bằng " + dataToSend.nhietdocothe + " - nhịp tim bằng" + dataToSend.nhiptim + " huyết áp tâm trương và thu lần lượt là " + dataToSend.sbp + " và "+ dataToSend.dbp; 
    }
    else {userMessage = userMessage + " ,hãy trả lời câu hỏi của tôi bằng Tiếng Việt, càng ngắn càng tốt, ưu tiến giới hạn trong 20 đến 30 từ";}

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: userMessage}],
        })
    }

    // console.log(requestOptions)
    
    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        messageElement.textContent = data.choices[0].message.content.trim();
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Đã gặp lỗi, vui lòng f5 lại trang hoặc đợi một thời gian nữa.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Đang suy nghĩ...", "...");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
