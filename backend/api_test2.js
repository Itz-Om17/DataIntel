const axios = require('axios');

async function testAsk() {
    try {
        // Authenticate first just in case
        const loginRes = await axios.post('http://localhost:5000/auth/login', {
            email: "user@user.com",
            password: "password"
        });
        const token = loginRes.data.token;

        const response = await axios.post('http://localhost:5000/ask', {
            datasetId: "some-id",
            question: "some question",
            sessionId: "some-session-id"
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
