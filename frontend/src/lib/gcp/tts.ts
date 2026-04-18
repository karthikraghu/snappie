import { TextToSpeechClient } from '@google-cloud/text-to-speech';

let _ttsClient: TextToSpeechClient | null = null;

const getTTSClient = () => {
    if (!_ttsClient) _ttsClient = new TextToSpeechClient();
    return _ttsClient;
};

export const GCPTTS = {
  
  generateNarration: async (lore: string): Promise<Buffer> => {
    const client = getTTSClient();
    
    const voiceName = 'en-US-Journey-D'; // High fidelity voice (no pitch support)
    // Or you can use 'en-US-Neural2-D' if you want heavy pitch modifications

    const audioConfig: any = { 
        audioEncoding: 'MP3',
        speakingRate: 0.9 // Slower, dramatic speaking tempo
    };

    // Only apply pitch if the voice supports SSML modification
    const supportsPitch = !voiceName.includes("Journey") && !voiceName.includes("Chirp");

    if (supportsPitch) {
      audioConfig.pitch = -5.0; // Deeper, more epic resonance
    }

    // Construct the API request
    const request = {
      input: { text: lore },
      voice: { languageCode: 'en-US', name: voiceName },
      audioConfig, 
    };

    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
        throw new Error("Text-to-Speech failed to produce audio content");
    }

    // Google returns Uint8Array/Buffer representation
    return Buffer.from(response.audioContent);
  }
};
