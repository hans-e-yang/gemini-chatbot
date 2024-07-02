// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
    interface Locals {
      is_authenticated: boolean
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
