import { type RequestHandler } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { error, json } from "@sveltejs/kit"
import jwt from "jsonwebtoken"

export const POST : RequestHandler = async ({request, cookies}) => {
  // Check if password is correct
  const data = await request.json()
  if (data.password !== env.PASSWORD) 
    error(401)

  // Send credentials
  // These will be checked in hook.ts
  // The tokens only act as sessionless sessioning, so no db will be 
  // needed
  const token = jwt.sign({}, 
                env.SECRET, 
                {expiresIn: env.TOKEN_DURATION || '1h'})
  cookies.set("token", token, {path: '/'})

  return new Response()
}
