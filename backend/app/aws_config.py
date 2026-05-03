"""
AWS Free Tier Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

class AWSConfig:
    """AWS Free Tier Configuration"""
    
    # Lambda Configuration
    LAMBDA_MEMORY = 512  # MB (within free tier)
    LAMBDA_TIMEOUT = 30  # seconds
    
    # DynamoDB Configuration
    DYNAMODB_REGION = os.getenv('AWS_REGION', 'us-east-1')
    DYNAMODB_TABLES = {
        'users': 'krishimitraai-users',
        'sessions': 'krishimitraai-sessions',
        'market_data': 'krishimitraai-market-data',
        'weather_data': 'krishimitraai-weather-data'
    }
    
    # S3 Configuration
    S3_BUCKET = os.getenv('S3_BUCKET', 'krishimitraai-static')
    S3_REGION = os.getenv('AWS_REGION', 'us-east-1')
    
    # API Gateway Configuration
    API_GATEWAY_STAGE = 'prod'
    API_GATEWAY_THROTTLING = {
        'rateLimit': 100,  # requests per second
        'burstLimit': 200  # burst capacity
    }
    
    # CloudFront Configuration
    CLOUDFRONT_TTL = 86400  # 24 hours
    
    @classmethod
    def get_dynamodb_table(cls, table_name):
        """Get DynamoDB table name"""
        return cls.DYNAMODB_TABLES.get(table_name)
    
    @classmethod
    def is_free_tier_mode(cls):
        """Check if running in free tier mode"""
        return os.getenv('AWS_FREE_TIER', 'true').lower() == 'true'
