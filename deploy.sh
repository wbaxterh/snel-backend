#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo ".env file not found!"
  exit 1
fi

# Load environment variables from .env file
export $(cat .env | xargs)
echo "AWS_REGION=$AWS_REGION, BLOCKFROST_API_KEY=$BLOCKFROST_API_KEY"

# Run SAM build
echo "Running SAM Build..."
sam build --use-container

# Run SAM deploy
echo "Running SAM Deploy..."
sam deploy \
  --stack-name snel-api-stack \
  --s3-bucket $S3_BUCKET \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ParameterKey=BlockfrostApiKey,ParameterValue=$BLOCKFROST_API_KEY \
  --region $AWS_REGION \
  --confirm-changeset

echo "Deployment complete!"
