
import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.API_KEY)
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})


export const POST : RequestHandler = async ({request, locals}) => {
  if (!locals.is_authenticated) error(401)

  // Solve request
  const data = await request.json();

  // Get the prompt and history
  const prompt = data.text
  const conversation : string[] = data.conversation
  if (typeof prompt !== 'string') error(422)
  
  const chat = model.startChat({
    history: (conversation || [] as string[]).map((text, index) => {
      return {
        role: index%2==0 ? "user" : "model",
        parts: [{text}]
      }
    })
  })


  // Call GEMINI API
  const result = await chat.sendMessage(prompt)
  const text = result.response.text()

  return json({text})
}
