const axios = require('axios');

async function testAsk() {
    try {
        const token = "mock-token"; // Bypass in backend anyway

        const response = await axios.post('http://localhost:5000/ask', {
            datasetId: "120001",
            question: "how many customers use electronic check?",
            sessionId: "69add74de8fafbe6650024b7"
        }, {
            headers: {
                "x-auth-token": token
            }
        });
        console.log("Success:", Object.keys(response.data));
    } catch (error) {
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            if (typeof error.response.data === 'string' && error.response.data.includes('<html')) {
                console.log("Received HTML error");
            }
        } else {
            console.error("Error:", error.message);
        }
    }
}

testAsk();
