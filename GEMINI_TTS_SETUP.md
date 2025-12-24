# Gemini-TTS Setup Guide

This guide will help you set up Google Cloud Text-to-Speech API (Gemini-TTS) for natural, expressive voice generation.

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account with billing enabled
2. **Google Cloud Project**: Create a new project or use an existing one
3. **API Key**: Generate an API key for the Text-to-Speech API

## Setup Steps

### 1. Enable Text-to-Speech API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Search for "Cloud Text-to-Speech API"
5. Click on it and press "Enable"

### 2. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to only Text-to-Speech API for security

### 3. Set Environment Variables

Add these environment variables to your backend `.env` file:

```bash
# Google Cloud Text-to-Speech API
GOOGLE_CLOUD_API_KEY=your_api_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_CLOUD_REGION=us-central1
```

### 4. Alternative: Service Account (Recommended for Production)

For production, use a service account instead of an API key:

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name and description
4. Grant it "Cloud Text-to-Speech API User" role
5. Create and download the JSON key file
6. Set the environment variable:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

## Available Voices

The integration supports all 30 Gemini-TTS voices:

### Male Voices
- **Puck** - Upbeat, cheerful, energetic
- **Zephyr** - Bright, lively, enthusiastic  
- **Charon** - Informative, clear, professional
- **Fenrir** - Excitable, dynamic, passionate
- **Orus** - Firm, strong, dependable
- **Enceladus** - Breathy, soft, gentle
- **Iapetus** - Clear, distinct, articulate
- **Umbriel** - Easy-going, mellow, smooth
- **Algieba** - Smooth, polished, refined
- **Algenib** - Gravelly, rough, textured
- **Rasalgethi** - Informative, educational, helpful
- **Alnilam** - Firm, solid, reliable
- **Schedar** - Even, balanced, steady
- **Achird** - Friendly, warm, approachable
- **Zubenelgenubi** - Casual, informal, relaxed
- **Sadachbia** - Lively, animated, spirited
- **Sadaltager** - Knowledgeable, informative, educational

### Female Voices
- **Kore** - Firm, confident, authoritative
- **Leda** - Youthful, fresh, vibrant
- **Aoede** - Breezy, light, airy
- **Callirrhoe** - Easy-going, relaxed, calm
- **Autonoe** - Bright, vibrant, energetic
- **Despina** - Smooth, elegant, sophisticated
- **Erinome** - Clear, crisp, precise
- **Laomedeia** - Upbeat, positive, optimistic
- **Achernar** - Soft, gentle, tender
- **Gacrux** - Mature, experienced, wise
- **Pulcherrima** - Forward, direct, assertive
- **Vindemiatrix** - Gentle, kind, nurturing
- **Sulafat** - Warm, cozy, comforting

## Features

### Natural Speech Generation
- **Style Control**: Use natural language prompts to control tone, emotion, and delivery
- **Markup Tags**: Automatic enhancement with natural pauses, emphasis, and reactions
- **Voice Characteristics**: Each voice has unique personality traits
- **High Quality**: Professional-grade audio output

### Style Prompts
The system automatically applies appropriate style prompts based on the selected voice:

- **Puck**: "You are having a friendly conversation. Speak in a cheerful, upbeat, and enthusiastic way."
- **Charon**: "You are providing helpful information. Speak in a clear, informative, and professional way."
- **Kore**: "You are confident about your knowledge. Speak in a firm, assured, and authoritative way."

### Markup Enhancement
Text is automatically enhanced with natural speech patterns:

- **Pauses**: `[short pause]`, `[medium pause]`, `[long pause]`
- **Emphasis**: `[emphasized]` for important words
- **Hesitations**: `[uhm]` for natural conversational flow
- **Reactions**: `[laughing]` for natural responses
- **Breathing**: `[breath]` for natural speech rhythm

## Testing

1. Start the backend server:
   ```bash
   cd saintapp-backend
   npm start
   ```

2. Test the TTS service:
   ```bash
   node test-gemini-tts.js
   ```

3. Check the API status:
   ```bash
   curl https://saintsal-backend-0mv8.onrender.com/api/gemini-tts/status
   ```

## Usage in Frontend

The voice assistant will automatically use Gemini-TTS when:
- `useGeminiTTS: true` is set in the configuration
- A valid voice name is provided
- Google Cloud credentials are properly configured

The system will fall back to browser TTS if Gemini-TTS is not available.

## Troubleshooting

### Common Issues

1. **"Service not available"**: Check your Google Cloud credentials
2. **"API key invalid"**: Verify your API key is correct and has Text-to-Speech permissions
3. **"Project not found"**: Ensure your project ID is correct
4. **CORS errors**: The backend handles API calls to avoid CORS issues

### Debug Steps

1. Check backend logs for detailed error messages
2. Verify environment variables are set correctly
3. Test the API key with Google Cloud Console
4. Check billing is enabled for your Google Cloud project

## Cost Considerations

- **Free Tier**: 1 million characters per month
- **Pricing**: $4.00 per 1 million characters after free tier
- **Voice Selection**: All voices have the same pricing
- **Quality**: High-quality audio output

## Security

- **API Key**: Store securely in environment variables
- **Service Account**: Use for production deployments
- **Restrictions**: Limit API key to specific APIs and IPs
- **Monitoring**: Enable Cloud Logging for usage tracking

For more information, visit the [Google Cloud Text-to-Speech documentation](https://cloud.google.com/text-to-speech/docs/gemini-tts).
