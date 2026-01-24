<!--
  @component
  The home page of the application.
  Serves as a landing page with links to the main features (Authentication, Localization).
-->
<div class="space-y-12">
	<div class="text-center">
		<h1
			class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white"
		>
			<span class="block">Welcome to the</span>
			<span class="block text-blue-600 dark:text-blue-400">SvelteKit Demo Application</span>
		</h1>
		<p
			class="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl dark:text-gray-400"
		>
			Explore various features and integrations implemented in SvelteKit, including Authentication
			with Lucia and Localization with Paraglide.
		</p>
	</div>

	<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		<a
			href="/demo/lucia"
			class="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
		>
			<div class="p-6">
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white">
					Authentication
				</h3>
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Secure login and registration system using Lucia Auth.
				</p>
			</div>
			<div
				class="mt-auto border-t border-gray-100 bg-gray-50 px-6 py-3 text-sm font-medium text-blue-600 group-hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-blue-400 dark:group-hover:bg-gray-800"
			>
				View Demo &rarr;
			</div>
		</a>

		<a
			href="/demo/paraglide"
			class="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
		>
			<div class="p-6">
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white">
					Localization
				</h3>
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Internationalization (i18n) using Paraglide JS.
				</p>
			</div>
			<div
				class="mt-auto border-t border-gray-100 bg-gray-50 px-6 py-3 text-sm font-medium text-blue-600 group-hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900/50 dark:text-blue-400 dark:group-hover:bg-gray-800"
			>
				View Demo &rarr;
			</div>
		</a>
	</div>
</div>
