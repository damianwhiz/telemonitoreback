var accountSid = "AC1b0050d6037932a1340f98283f4cbef5"; // Your Account SID from www.twilio.com/console
var authToken = "f944627703db639a43831d13d2df381e";   // Your Auth Token from www.twilio.com/console
 
const client = require('twilio')(accountSid, authToken, { 
    lazyLoading: true 
});

// Function to send message to WhatsApp
const sendMessage = async (message, senderID) => {

    try {
        await client.messages.create({
            to: senderID,
            body: message,
            from: `whatsapp:+14155238886`
        });
    } catch (error) {
        console.log(`Error at sendMessage --> ${error}`);
    }
};

module.exports = {
    sendMessage
}