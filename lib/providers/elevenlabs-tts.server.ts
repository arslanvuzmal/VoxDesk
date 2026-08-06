import "server-only";

export interface TTSResult {
  audioBuffer?: Buffer;
  mimeType: string;
  fallbackWebSpeech: boolean;
  characterCount: number;
}

export async function generateAgentTTS(text: string): Promise<TTSResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default Rachel / Maya voice
  const modelId = process.env.ELEVENLABS_TTS_MODEL || "eleven_flash_v2_5";

  const sanitizedText = text.slice(0, 350).trim();

  if (!apiKey) {
    return {
      fallbackWebSpeech: true,
      mimeType: "audio/mpeg",
      characterCount: sanitizedText.length,
    };
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: sanitizedText,
        model_id: modelId,
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.85,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      console.warn(
        `ElevenLabs TTS returned status ${response.status}. Using Web Speech fallback.`,
      );
      return {
        fallbackWebSpeech: true,
        mimeType: "audio/mpeg",
        characterCount: sanitizedText.length,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      audioBuffer: buffer,
      mimeType: "audio/mpeg",
      fallbackWebSpeech: false,
      characterCount: sanitizedText.length,
    };
  } catch (error) {
    console.warn(
      "ElevenLabs TTS request failed. Using browser speech fallback:",
      error,
    );
    return {
      fallbackWebSpeech: true,
      mimeType: "audio/mpeg",
      characterCount: sanitizedText.length,
    };
  }
}
