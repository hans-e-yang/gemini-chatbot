# Chatbot with Together AI API

A basic chatbot interface made in Sveltekit to [Together AI](https://www.together.ai/) since Gemini is blocked in Hong Kong. 
A password (specified in .env) must be given before allowing access. 
Uses JWT for basic stateless sessioning.


The main purpose of this project is just for educational purposes, learning to use Together AI's APIs to build your own chat apps.


## Running Locally
0. Have [Nodejs](https://nodejs.org/en)
1. Clone this repository
2. Run `npm install`
3. Fill in the Environment Variables
```env
API_KEY=<Your-Together-AI-API-KEY>
PASSWORD=<Password>
SECRET=<JWT-Secret>
TOKEN_DURATION=<JWT-ExpiresIn-Value>  (Defaults to '1hr')
```
4. Run `npm run dev`


## Hosting Online
1. Clone this repository
2. Host on Platforms such as [Netlify](https://www.netlify.com/) or 
    [Vercel](https://www.vercel.com/) ([See supported Environments](https://kit.svelte.dev/docs/adapter-auto))
3. Set Environment Variables

## Removing Password Requirement
If you want to enable access to the chatbot interface without needing to provide a password, one possible method is to change the following function in src/hooks.server.ts.
```ts
export const handle : Handle = async ({event, resolve}) => {
  event.locals.is_authenticated =  true

  return resolve(event)
}

```
