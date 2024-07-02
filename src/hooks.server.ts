import { SECRET } from '$env/static/private'
import { error, type Handle } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'

export const handle : Handle = async ({event, resolve}) => {
  let is_authenticated = false
  const token = event.cookies.get('token')
  if (token) {
    try {
      jwt.verify(token, SECRET)
      is_authenticated = true
    } catch (_) {/* Just ignore this, means token has failed */}
  }
  
  event.locals.is_authenticated =  is_authenticated

  return resolve(event)
}

