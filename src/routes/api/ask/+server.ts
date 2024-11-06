import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

import Together from "together-ai";

import type { Chat } from "$lib/types";
const together = new Together({apiKey: env.API_KEY})

// Accepts :
// - text: String
//      User prompt
// - history : {role: "user" | "model", text: String}
//      Conversation history
export const POST : RequestHandler = async ({request, locals}) => {
  if (!locals.is_authenticated) error(401)

  // Solve request
  const data = await request.json();

  // Get the prompt and history
  const prompt = data.text
  // Perhaps more typechecking could be done.
  if (typeof prompt !== 'string') error(422)

  // Change format of input for together ai
  const messages = data.history.map((x : Chat) => {return {
    role: (x.role == "user") ? "user" : "assistant",
    content: x.text
  }})

  messages.push({role: "user", content: prompt})

  // Call Together api
  const result = await together.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages
  })
  for (const c of result.choices) {
    console.log(c)
  }
  const text = result.choices[0].message.content

  return json({text})
}
