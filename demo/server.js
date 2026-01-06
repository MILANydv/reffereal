// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ReferralAPI } = require('./referral-api');

const app = express();
app.use(express.json());

const referralAPI = new ReferralAPI('YOUR_API_KEY');

// Middleware to extract user info
app.use((req, res, next) => {
    // Extract user ID from your auth system
    req.userId = req.headers['x-user-id'];
    next();
});

// Create referral endpoint
app.post('/api/referrals', async (req, res) => {
    try {
        const { campaignId, refereeId } = req.body;
        const referral = await referralAPI.createReferral(campaignId, req.userId, refereeId);
        res.json(referral);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Track referral link click
app.get('/r/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const metadata = {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            referrer: req.headers.referer
        };
        
        await referralAPI.trackClick(code, metadata);
        
        // Redirect to your application
        res.redirect(`https://your-app.com/signup?ref=${code}`);
    } catch (error) {
        res.status(400).send('Invalid referral code');
    }
});

// Handle conversions (webhook endpoint)
app.post('/webhooks/conversion', async (req, res) => {
    try {
        const { referralCode, amount, metadata } = req.body;
        await referralAPI.recordConversion(referralCode, amount, metadata);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});