<script lang="ts">
	import Chats from './chats.svelte';
  import type {Chat} from "$lib/types"

  export let data

  /** Current chat the user is texting */
  let text = ""

  /** Chats from the start of the conversation in html */
  let conversation = [] as Chat[]

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
  // Move to seperate component
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
    if (is_loading) return

    let json = {
      history: conversation.filter(({role}) => role != "app"),
      text
    }

    // Add the chat into the conversation
    is_loading = true
    conversation = [...conversation, {role: "user", text}]
    text = "";

    try {
      let res = await post("/api/ask", json)
      if (res.ok) 
        conversation = [...conversation, {role: "model", text: (await res.json()).text}]
      else if (res.status == 401) {
          conversation = [...conversation, {role: "app", text: "Not authenticated"}]
          data.is_authenticated = false;
          console.log(data.is_authenticated)
        }
      else 
        conversation = [...conversation, {role: "app", text: "Something went wrong"}]
    } catch (_) {
      conversation = [...conversation, {role: "app", text: "Something went wrong"}]
    }

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
</script>

<div class="flex flex-col h-screen bg-bg text-text">
  <header class="flex justify-center p-4 border-b border-primary 
                 shadow-md shadow-primary relative z-10">
    <h1 class="text-xl font-bold">TogetherAI Chatbot</h1>
  </header>

  {#if !data.is_authenticated}
    <div class="flex flex-col items-center border-b border-secondary p-4">
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
  <main class="bg-bg h-full grow p-4 w-full flex flex-col 
    gap-4 overflow-y-scroll">
    <Chats chats={conversation} />
    
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
        on:keypress={on_form_keydown}
      />
    <button class="btn btn-primary">Submit</button>
  </form>
</div>
