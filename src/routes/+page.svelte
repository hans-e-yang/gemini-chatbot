<script lang="ts">
  import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
  import DOMPurify from 'dompurify'
  import {marked} from 'marked'

  export let data

  /** Current chat the user is texting */
  let text = ""

  /** Chats from the start of the conversation */
  let conversation = [] as string[]

  /** Adds a sanitized and parsed text to conversation */
  async function add_conversation(text: string) {
    text = await marked.parse(text.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,""))
    conversation.push(DOMPurify.sanitize(text))
    conversation = conversation
  }

  // Similar behaviour to poe.com
  // CTRL+Enter = newline
  // Enter = submit
  let form_element : HTMLFormElement
  function on_form_keydown(ev: KeyboardEvent) {
    // CTRL + Enter
    if (ev.code == "Enter") {
      ev.preventDefault()
      if (ev.ctrlKey) 
        text += '\n'
      else
        form_element.requestSubmit()
    }
  }

  const on_form_submit_ask : SubmitFunction = ({cancel, formData})=> {
    if (text == "") {
      cancel()
      return
    }

    // Add the chat into the conversation
    add_conversation(text)
    text = "";
    is_loading = true

    // Also send conversations to add history
    formData.append("conversation", conversation.slice(-20).join('.'))

    return async ({result}) => {
      // Remove loading screen
      is_loading = false
      // Add conversation based on results
      if (result.type == "success"){
        //@ts-ignore
        add_conversation(result.data.text)
      } else {
        add_conversation("Not Authenticated")
      }
    }
  }

  const on_form_submit_login : SubmitFunction = ({cancel, formData}) => {
    if (!formData.get('password')) {
      cancel()
      return
    }

    return ({result}) => {
      if (result.type == "success")
        data.is_authenticated = true
    }

  }

  let is_loading = false
</script>

<div class="flex flex-col h-screen">
  <header class="flex justify-center p-4 bg-cyan-400">
    <h1 class="text-xl font-bold">Google Gemini Chatbot</h1>
  </header>

  {#if !data.is_authenticated}
    <div class="flex flex-col items-center bg-cyan-400">
      <p>This website uses cookies to store authentication.</p>
      <form method="post" action="?/login" use:enhance={on_form_submit_login} class="flex w-full items-center space-between p-4 gap-2">
        <label>
          <span>Password: </span>
          <input type="password" name="password">
        </label>
        <button class="btn">Submit</button>
      </form>
    </div>
  {/if}

  <!-- Chat logs in this session -->
  <main class="h-full grow p-4 w-full flex flex-col gap-4 overflow-y-scroll">
    {#each conversation as c, idx}
      <div class="prose rounded-sm px-2 max-w-[80vw] {idx%2==0?'text-right bg-cyan-400 self-end':'text-left bg-slate-300 self-start'}">
        {@html c}
      </div>
    {/each}
    
    {#if is_loading}
      <div class="rounded-sm px-2 max-w-[80vw] self-start text-left bg-slate-300 flex gap-2">
        <p>Loading Response...</p>
        <p class="animate-spin ">0</p>
      </div>
    {/if}
  </main>

  <!-- Chat interface -->
  <form method="post" action="?/ask" bind:this={form_element}
    use:enhance={on_form_submit_ask}
    class="flex justify-between p-4 bg-cyan-400"
  > 
    <label class='flex w-full items-center gap-2 pr-4'>
      <span>Prompt: </span>
      <textarea class="grow p-1 resize-none focus:outline-none focus:ring focus:ring-rose-500" rows="3" name="prompt" bind:value={text}
        on:keypress={on_form_keydown}
      />
    <button class="btn">Submit</button>
  </form>
</div>

