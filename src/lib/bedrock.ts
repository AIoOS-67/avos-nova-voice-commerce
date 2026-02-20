import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// Nova 2 models use cross-region inference profiles (us.* prefix)
export const NOVA_2_LITE = 'us.amazon.nova-2-lite-v1:0';
export const NOVA_2_SONIC = 'amazon.nova-2-sonic-v1:0';
export const NOVA_LITE = 'us.amazon.nova-lite-v1:0'; // fallback

export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
