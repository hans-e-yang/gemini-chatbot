<script lang="ts">
	import DOMPurify from "dompurify";
  import { marked } from "marked";
  import type {Chat} from "$lib/types"


  export let chats : Chat[]

  let last_user_chat : HTMLElement

  function scroll(node: HTMLElement) {
    if (chats.at(-1)!.role == "user") {
      last_user_chat = node
    }
    last_user_chat?.scrollIntoView({behavior: "smooth"})
  }
</script>

{#each chats as {role, text}}
  {@const user_styles = "text-right self-end border-primary shadow-primary"}
  {@const ai_styles = "text-left self-start border-secondary shadow-secondary"}
  {@const app_styles = "text-center self-center border-text shadow-text"} 
  {@const style = role == "model" ? ai_styles : role == "user" ? user_styles : app_styles}
  <div class="prose prose-invert rounded-sm px-2 py-1 max-w-[80vw] 
        border shadow 
        scroll-m-2 {style}
        "
    use:scroll
  >
    {@html DOMPurify.sanitize(marked.parse(
        text.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,"")
      )
    )}
  </div>
{/each}
