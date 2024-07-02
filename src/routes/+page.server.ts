import jwt from 'jsonwebtoken'

import { API_KEY, SECRET, PASSWORD } from "$env/static/private";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { error } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from '@sveltejs/kit';

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})

export const load : PageServerLoad = ({locals}) => {
  return {
    is_authenticated: locals.is_authenticated
  }
}



export const actions = {
  // Checks password. 
  // Request should be a FormData containing 'password'
  login: async ({request, cookies}: RequestEvent) => {
    // Check if password is correct
    const data = await request.formData()
    if (data.get('password') !== PASSWORD) 
      error(401)
    
    // Send credentials
    const token = jwt.sign({}, SECRET, {expiresIn: '1h'})
    cookies.set("token", token, {path: '/'})
  },

  // Ask GEMINI
  // There should be a valid JWT 
  // Request should be a FormData containing 'prompt' and 'conversation' as strings
  ask: async ({request, locals}: RequestEvent) => {
    if (!locals.is_authenticated) error(401)

    // Solve request
    const data = await request.formData();

    // Get the prompt and history
    const prompt = data.get('prompt')
    const conversation = data.get('conversation')
    if (typeof prompt !== 'string' || typeof conversation !== 'string')
      error(422)

    // Call GEMINI API
    const result = await model.generateContent(conversation + prompt)
    const text = result.response.text()

    return { success: true, text }
  }
}

