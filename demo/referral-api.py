import requests
import json

class ReferralAPI:
    def __init__(self, api_key, base_url='https://api.your-domain.com'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })
    
    def create_referral(self, campaign_id, referrer_id, referee_id=None):
        """Create a new referral"""
        try:
            response = self.session.post(
                f'{self.base_url}/v1/referrals',
                json={
                    'campaignId': campaign_id,
                    'referrerId': referrer_id,
                    'refereeId': referee_id
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error creating referral: {error}')
            raise error
    
    def track_click(self, referral_code, metadata=None):
        """Track a referral click"""
        try:
            response = self.session.post(
                f'{self.base_url}/v1/referrals/{referral_code}/click',
                json={'metadata': metadata or {}}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error tracking click: {error}')
            raise error
    
    def record_conversion(self, referral_code, amount=None, metadata=None):
        """Record a conversion"""
        try:
            response = self.session.post(
                f'{self.base_url}/v1/referrals/{referral_code}/convert',
                json={
                    'amount': amount,
                    'metadata': metadata or {}
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error recording conversion: {error}')
            raise error
    
    def get_stats(self, campaign_id=None):
        """Get referral statistics"""
        try:
            params = {'campaignId': campaign_id} if campaign_id else {}
            response = self.session.get(f'{self.base_url}/v1/stats', params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error fetching stats: {error}')
            raise error

# Usage Example
def main():
    api = ReferralAPI('YOUR_API_KEY')
    
    try:
        # Create a referral
        referral = api.create_referral('campaign_123', 'user_456')
        print('Referral created:', referral)
        
        # Track a click
        click = api.track_click(referral['referralCode'], {
            'userAgent': 'Mozilla/5.0...',
            'ipAddress': '192.168.1.1'
        })
        print('Click tracked:', click)
        
        # Record a conversion
        conversion = api.record_conversion(referral['referralCode'], 99.99, {
            'orderId': 'order_789',
            'productId': 'prod_abc'
        })
        print('Conversion recorded:', conversion)
        
        # Get stats
        stats = api.get_stats()
        print('Stats:', stats)
        
    except Exception as error:
        print('API Error:', error)

if __name__ == '__main__':
    main()