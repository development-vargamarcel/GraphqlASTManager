<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Login/Register</h1>
<form method="post" action="?/login" use:enhance>
	<label>
		Username
		<input
			name="username"
			required
			minlength="3"
			maxlength="31"
			pattern="[a-z0-9_-]+"
			title="Username must be 3-31 characters long and can only contain lowercase letters, numbers, underscores, and hyphens."
			class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		/>
	</label>
	<label>
		Password
		<input
			type="password"
			name="password"
			required
			minlength="6"
			maxlength="255"
			class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		/>
	</label>
	<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
		>Login</button>
	<button
		formaction="?/register"
		class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
		>Register</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>
