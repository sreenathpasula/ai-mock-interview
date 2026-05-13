import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export const transcribeAudio = async (audioBuffer, originalName) => {
  let tempFilePath = null;

  try {
    const extension = path.extname(originalName) || ".webm";
    tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}${extension}`);

    fs.writeFileSync(tempFilePath, audioBuffer);

    const uploadUrl = await client.files.upload(tempFilePath);

    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      speech_models: ["universal-2"],
    });

    if (transcript.status === "error") {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    return transcript.text;
  } catch (error) {
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};
