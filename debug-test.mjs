import { HookSniff } from "./src/index.ts";

const API_KEY = process.env.HOOKSNIFF_API_KEY;
const hs = new HookSniff(API_KEY);

async function debug() {
  console.log("Testing me()...");
  try {
    const user = await hs.me();
    console.log("User:", user);
  } catch (err) {
    console.log("Error:", err.message, err.statusCode, err.code);
  }

  console.log("\nTesting application.create()...");
  try {
    const app = await hs.application.create({ name: "Debug Test" });
    console.log("App:", app);
  } catch (err) {
    console.log("Error:", err.message, err.statusCode, err.code);
  }
}

debug();
