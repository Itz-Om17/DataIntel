const axios = require('axios');

async function loginAndQuery() {
    try {
        const loginRes = await axios.post('http://localhost:5000/auth/login', {
            email: "user@user.com", // Assuming test user or similar
            password: "password"
        });
        const token = loginRes.data.token;

        const response = await axios.post('http://localhost:5000/ask', {
            datasetId: "some-id",
            question: "how many customers use electronic check?",
            sessionId: "some-session"
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        console.log("Success:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Backend Error Status:", error.response.status);
            console.error("Backend Error Data:", error.response.data);
            if (typeof error.response.data === 'string' && error.response.data.includes('<html')) {
                console.log("Received HTML error, probably an unhandled exception.");
            }
        } else {
            console.error("Request Error:", error.message);
        }
    }
}

loginAndQuery();
