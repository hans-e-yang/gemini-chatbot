<script lang="ts">
  import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
  import DOMPurify from 'dompurify'
  import {marked} from 'marked'

  export let data

  /** Current chat the user is texting */
  let text = ""
  /** History to be sent to backend */
  let history = [] as string[]

  /** Chats from the start of the conversation in html */
  let conversation = [] as string[]

  /** Adds a sanitized and parsed text to conversation */
  async function add_conversation(text: string) {
    history.push(text)
    text = await marked.parse(text.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,""))
    conversation.push(DOMPurify.sanitize(text))
    conversation = conversation
  }

  function post(route: string, json: any) {
    return fetch(route, {
      method: "POST",
      headers: {
        'content-type': "application/json"
      },
      body: JSON.stringify(json)
    })
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

  async function on_form_submit_ask(ev: SubmitEvent) {
    if (text == "") return

    let json = {
      history: history.slice(-20),
      text
    }

    // Add the chat into the conversation
    add_conversation(text)
    text = "";
    is_loading = true

    let res = await post("/api/ask", json)
    if (res.ok) 
      add_conversation( (await res.json()).text )
    else if (res.status == 401) 
      add_conversation("Not authenticated")
    else 
      add_conversation("Something went wrong")

    is_loading = false
  }

  async function on_form_submit_login(ev: SubmitEvent) {
    let form_data = new FormData(ev.currentTarget as HTMLFormElement)
    if (!form_data.get('password')) return

    let res = await post("/api/login", 
      {password: form_data.get("password")})
    data.is_authenticated = res.ok
  }

  let is_loading = false

  // Auto scroll when chat and response
  let main : HTMLElement
  $: if (conversation && main?.children.length > 0) {
    setTimeout(() => {
      main.children[main.children.length-2].scrollIntoView({behavior: "smooth"})
    }, 0)
  }
</script>

<div class="flex flex-col h-screen bg-bg text-text">
  <header class="flex justify-center p-4 border-b border-primary 
                 shadow-md shadow-primary relative z-10">
    <h1 class="text-xl font-bold">Google Gemini Chatbot</h1>
  </header>

  {#if !data.is_authenticated}
    <div class="flex flex-col items-center border-b border-secondary py-4">
      <p>This website uses cookies to store authentication.</p>
      <form method="post" on:submit|preventDefault={on_form_submit_login}
        class="flex w-full items-center space-between p-4 gap-2">
        <label>
          <span>Password: </span>
          <input type="password" name="password">
        </label>
        <button class="btn btn-primary">Submit</button>
      </form>
    </div>
  {/if}

  <!-- Chat logs in this session -->
  <main bind:this={main} class="bg-bg h-full grow p-4 w-full flex flex-col 
    gap-4 overflow-y-scroll">
    {#each conversation as c, idx}
      {@const is_user = idx % 2 == 0}
      {@const user_styles = "text-right self-end border-primary shadow-primary"}
      {@const ai_styles = "text-left self-start border-secondary shadow-secondary"}
      <div class="prose prose-invert rounded-sm px-2 py-1 max-w-[80vw] 
        border shadow 
        scroll-m-2
        {is_user ? user_styles : ai_styles}">
        {@html c}
      </div>
    {/each}
    
    {#if is_loading}
      <div class="rounded-sm px-2 max-w-[80vw] self-start text-left 
        flex gap-2 border border-secondary shadow shadow-secondary">
        <p>Loading Response...</p>
        <p class="animate-spin ">0</p>
      </div>
    {/if}
  </main>

  <!-- Chat interface -->
  <form method="post" bind:this={form_element}
    on:submit|preventDefault={on_form_submit_ask}
    class="flex justify-between p-4 border-t border-primary"
  > 
    <label class='flex w-full items-center gap-2 pr-4'>
      <span>Prompt: </span>
      <textarea class="grow p-1 resize-none" rows="3" name="prompt" bind:value={text}
        on:keypress={on_form_keydown} disabled={is_loading}
      />
    <button class="btn btn-primary">Submit</button>
  </form>
</div>
