import dotenv from "dotenv";
dotenv.config();

export const generateAudio = async (text) => {
  try {
    const chunks = splitTextIntoChunks(text, 200);
    const audioBuffers = [];

    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;

      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!response.ok) {
        throw new Error(`Google TTS failed: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    // combine all audio chunks into one buffer
    const finalBuffer = Buffer.concat(audioBuffers);
    return finalBuffer.toString("base64");
  } catch (error) {
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
};

export const streamAudio = async (text, res) => {
  try {
    const chunks = splitTextIntoChunks(text, 200);
    const audioBuffers = [];

    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;

      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!response.ok) continue;

      const arrayBuffer = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    const finalBuffer = Buffer.concat(audioBuffers);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(finalBuffer);
  } catch (error) {
    if (!res.headersSent) {
      throw new Error(`Failed to stream audio: ${error.message}`);
    }
  }
};

// helper — splits long text into smaller chunks
// Google TTS breaks on very long text
const splitTextIntoChunks = (text, maxLength) => {
  const words = text.split(" ");
  const chunks = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).length > maxLength) {
      chunks.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
};
