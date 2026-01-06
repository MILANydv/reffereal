// eslint-disable-next-line @typescript-eslint/no-require-imports
const axios = require('axios');

class ReferralAPI {
    constructor(apiKey, baseURL = 'https://api.your-domain.com') {
        this.apiKey = apiKey;
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL,
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    // Create a new referral
    async createReferral(campaignId, referrerId, refereeId = null) {
        try {
            const response = await this.client.post('/v1/referrals', {
                campaignId,
                referrerId,
                refereeId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating referral:', error.response?.data || error.message);
            throw error;
        }
    }

    // Track a referral click
    async trackClick(referralCode, metadata = {}) {
        try {
            const response = await this.client.post(`/v1/referrals/${referralCode}/click`, {
                metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error tracking click:', error.response?.data || error.message);
            throw error;
        }
    }

    // Record a conversion
    async recordConversion(referralCode, amount = null, metadata = {}) {
        try {
            const response = await this.client.post(`/v1/referrals/${referralCode}/convert`, {
                amount,
                metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error recording conversion:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get referral statistics
    async getStats(campaignId = null) {
        try {
            const params = campaignId ? { campaignId } : {};
            const response = await this.client.get('/v1/stats', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error.response?.data || error.message);
            throw error;
        }
    }
}

// Usage Example
async function main() {
    const api = new ReferralAPI('YOUR_API_KEY');
    
    try {
        // Create a referral
        const referral = await api.createReferral('campaign_123', 'user_456');
        console.log('Referral created:', referral);
        
        // Track a click (when someone clicks the referral link)
        const click = await api.trackClick(referral.referralCode, {
            userAgent: navigator.userAgent,
            ipAddress: '192.168.1.1'
        });
        console.log('Click tracked:', click);
        
        // Record a conversion (when the referee makes a purchase)
        const conversion = await api.recordConversion(referral.referralCode, 99.99, {
            orderId: 'order_789',
            productId: 'prod_abc'
        });
        console.log('Conversion recorded:', conversion);
        
        // Get stats
        const stats = await api.getStats();
        console.log('Stats:', stats);
        
    } catch (error) {
        console.error('API Error:', error);
    }
}

module.exports = ReferralAPI;