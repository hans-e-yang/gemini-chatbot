# Chatbot with Gemini API

A basic chatbot interface made in Sveltekit to ['Gemini API'](https://ai.google.dev/). 
A password (specified in .env) must be given before allowing access. 
Uses JWT for basic stateless sessioning.


The main purpose of this project is to easily chat with
Gemini without needing to open ['Google AI Studio'](https://ai.google.dev/aistudio).


## Running Locally
0. Have [Nodejs](https://nodejs.org/en)
1. Copy this directory
2. Run `npm install`
3. Fill in the Environment Variables
```env
API_KEY=<Your-Google-Gemini-API-KEY>
PASSWORD=<Password>
SECRET=<JWT-Secret>
TOKEN_DURATION=<JWT-ExpiresIn-Value>  (Defaults to '1hr')
```
4. Run `npm run dev`


## Hosting Serverless
1. Copy this directory
2. Host on Platforms such as ['Netlify'](https://www.netlify.com/) or 
    ['Vercel'](https://www.vercel.com/) (['See supported Environments'](https://kit.svelte.dev/docs/adapter-auto))


## Removing Password Requirement
If you want to enable access to the chatbot interface without needing to provide a password, one possible method is to change the following function in src/hooks.server.ts.
```ts
export const handle : Handle = async ({event, resolve}) => {
  event.locals.is_authenticated =  true

  return resolve(event)
}

```
