/**
 * Handle sending alert notifications via email
 */
document.addEventListener("DOMContentLoaded", function () {
    // Set up event listener for send alert button
    const sendAlertBtn = document.getElementById("send-alert-btn");
    if (sendAlertBtn) {
      sendAlertBtn.addEventListener("click", sendAlertEmail);
    }
  });
  
  function sendAlertEmail() {
    // Show loading state with modified animation
    const sendBtn = document.getElementById("send-alert-btn");
    const btnText = sendBtn.querySelector(".btn-text");
    const originalText = btnText.innerHTML;
  
    // Changed visual feedback style
    sendBtn.disabled = true;
    sendBtn.classList.add("sending"); // Added class for styling
    btnText.innerHTML =
      '<span class="spinner-grow spinner-grow-sm"></span> Processing...'; // Changed spinner and text
  
    // Get recipient email if there's an input field
    let recipient = "";
    const recipientInput = document.getElementById("alert-recipient");
    if (recipientInput) {
      recipient = recipientInput.value;
    }
  
    // Changed success and error handling
    fetch("/send-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        alert_type: "Security Breach Alert", // Changed alert type
        message: "Unusual network activity detected on your system", // Changed message
        recipient: recipient,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Changed result display style
        const resultEl = document.getElementById("alert-result");
        if (resultEl) {
          if (data.success) {
            resultEl.innerHTML = `
              <div class="alert alert-success fade-in">
                <div class="alert-icon"><i class="fas fa-shield-check"></i></div>
                <div class="alert-message">${data.message}</div>
              </div>`;
          } else {
            resultEl.innerHTML = `
              <div class="alert alert-danger fade-in">
                <div class="alert-icon"><i class="fas fa-shield-exclamation"></i></div>
                <div class="alert-message">${data.message}</div>
              </div>`;
          }
        }
  
        // Changed reset button animation
        sendBtn.classList.add("sent"); // Add sent class
        setTimeout(() => {
          sendBtn.disabled = false;
          btnText.innerHTML = originalText;
          sendBtn.classList.remove("sending", "sent");
        }, 1200); // Changed timeout
      })
      .catch((error) => {
        console.error("Error:", error);
        
        // Changed error display
        const resultEl = document.getElementById("alert-result");
        if (resultEl) {
          resultEl.innerHTML = `
            <div class="alert alert-danger shake">
              <div class="alert-icon"><i class="fas fa-times-circle"></i></div>
              <div class="alert-message">Failed to send notification: ${error}</div>
            </div>`;
            
          // Add shake animation CSS if not exists
          if (!document.getElementById('notification-animations')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-animations';
            styleSheet.textContent = `
              .shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
              }
              @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
                40%, 60% { transform: translate3d(3px, 0, 0); }
              }
            `;
            document.head.appendChild(styleSheet);
          }
        }
  
        // Reset button
        sendBtn.disabled = false;
        btnText.innerHTML = originalText;
        sendBtn.classList.remove("sending");
      });
  }