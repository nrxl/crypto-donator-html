// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

// Create an instance of the Express app
const app = express();

// Set the port for the server
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Replace this with your actual Coinbase Commerce API key
const coinbaseApiKey = 'YOUR_COINBASE_COMMERCE_API_KEY';

// Define the Coinbase Commerce API URL
const coinbaseApiUrl = 'https://api.commerce.coinbase.com/charges';

// Route to handle donation requests from the frontend
app.post('/createCharge', async (req, res) => {
  try {
    // Extract currency and amount from the request body
    const { currency, amount, donorName, message } = req.body;

    // Create a new charge using the Coinbase Commerce API
    const chargeResponse = await axios.post(
      `${coinbaseApiUrl}/charges`,
      {
        name: 'Donation',
        description: 'Support Our Cause',
        local_price: {
          amount,
          currency,
        },
        metadata: {
          donor_name: donorName,
          donation_message: message,
        },
        pricing_type: 'fixed_price',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': coinbaseApiKey,
        },
      }
    );

    // Extract the charge ID and hosted URL from the API response
    const { id, hosted_url } = chargeResponse.data.data;

    // Send the charge ID and hosted URL back to the frontend
    res.json({
      chargeId: id,
      checkoutUrl: hosted_url,
    });
  } catch (error) {
    // Handle errors by sending a 500 response
    console.error('Error creating charge:', error.message);
    res.status(500).json({ error: 'Error creating charge' });
  }
});

// Route to handle webhook events from Coinbase Commerce
app.post('/webhook', (req, res) => {
  try {
    const event = req.body;

    // Process the event (e.g., update donation status in a database)
    console.log('Webhook Event Received:', event);

    res.status(200).end();
  } catch (error) {
    // Handle errors by sending a 500 response
    console.error('Error processing webhook event:', error.message);
    res.status(500).json({ error: 'Error processing webhook event' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
