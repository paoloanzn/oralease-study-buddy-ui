
import * as dotenv from "dotenv";

dotenv.config();

const BASE_URL = `https:/paoloanzn.app.n8n.cloud/webhook${process.env.TESTING_ENDPOINTS ? "-test" : ""}`;

export const ENDPOINTS = {
  CREATE_EXAM: BASE_URL + "/create-exam",
  TRANSCRIBE: BASE_URL + "/transcribe",
  EVALUATE_EXAM: BASE_URL + "/evaluate-exam",
  PROCESS_MEDIA: BASE_URL + "/process-media"
} as const; 