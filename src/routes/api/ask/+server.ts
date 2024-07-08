
import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import type { Chat } from "$lib/types";

const genAI = new GoogleGenerativeAI(env.API_KEY)
const safetySettings = [
  HarmCategory.HARM_CATEGORY_HARASSMENT,
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
].map(category => {return {
  category,
  threshold: HarmBlockThreshold.BLOCK_NONE
}})

const model = genAI.getGenerativeModel({model: "gemini-1.5-flash", 
  safetySettings})


export const POST : RequestHandler = async ({request, locals}) => {
  if (!locals.is_authenticated) error(401)

  // Solve request
  const data = await request.json();

  // Get the prompt and history
  const prompt = data.text
  const history : Chat[] = data.history || []
  // Perhaps more typechecking could be done.
  if (typeof prompt !== 'string') error(422)
  
  const chat = model.startChat({
    history: history.map(({role, text}) => {
      return {
        role,
        parts: [{text}]
      }
    })
  })


  // Call GEMINI API
  const result = await chat.sendMessage(prompt)
  const text = result.response.text()

  return json({text})
}
