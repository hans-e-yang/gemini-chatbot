# Chatbot with Gemini API

A basic chatbot interface made in Sveltekit to ['Gemini API'](https://ai.google.dev/). A password (specified in .env) must be given before allowing access. Uses JWT for basic stateless authentication.


## Deploying
1. Copy this directory
2. Run `npm install`
3. Fill in the Environment Variables
API_KEY=<Your-Google-Gemini-API-KEY>
PASSWORD=<Password>
SECRET=<JWT-Secret>

## Removing Password Requirement
If you want to enable access to the chatbot interface without needing to provide a password, one possible method is to change the following function in src/hooks.server.ts.
```ts
export const handle : Handle = async ({event, resolve}) => {
  event.locals.is_authenticated =  true

  return resolve(event)
}

```
