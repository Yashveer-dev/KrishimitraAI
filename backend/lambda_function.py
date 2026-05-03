import json
import os
from fastapi import FastAPI
from mangum import Mangum
from app.main import app

# Wrap FastAPI app for Lambda
handler = Mangum(app)

def lambda_handler(event, context):
    """
    AWS Lambda handler for FastAPI application
    """
    return handler(event, context)
