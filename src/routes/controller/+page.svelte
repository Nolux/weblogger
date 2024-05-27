<script>
  import { enhance, applyAction } from "$app/forms";
  import { writable } from "svelte/store";

  import { editColors } from "$lib/helpers/editColors.js";
  import { AlertsStore } from "$lib/stores/alertsStore.js";

  export let data;

  const markerColorsStore = writable(data.currentProject.markerColors);

  $: currentProject = data.currentProject;
  $: user = data.user;
  $: assignedUsers = data.assignedUsers;

  export let form;
  let loading = false;

  $: {
    if (form?.error) {
      AlertsStore.addAlert(form?.errorMsg, "error");
    }
    if (form?.success) {
      AlertsStore.addAlert(form?.success, "success");
    }
  }

  let copied = false;
</script>

<div class="relative flex flex-col gap-8">
  <div role="alert" class="absolute top-0 w-full flex justify-center"></div>
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Project Controller
  </h1>
  <div class="grid gap-4">
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" checked="checked" />
      <h1 class="collapse-title text-xl font-medium">Edit Project</h1>
      <form
        method="POST"
        action="?/editProject"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance={() => {
          loading = true;
          return async ({ result, update }) => {
            if (result.type === "redirect") {
              AlertsStore.addAlert("User created please login", "success");
            }
            await applyAction(result);

            loading = false;
          };
        }}
      >
        <label class="flex items-center justify-between">
          Project Name:
          <input
            name="name"
            class="input input-bordered"
            type="text"
            bind:value={currentProject.name}
          />
        </label>
        <h1 class="text-xl">Contact information</h1>
        <label class="flex items-center justify-between">
          Name:
          <input
            name="contactName"
            class="input input-bordered"
            type="text"
            bind:value={currentProject.contact.name}
          />
        </label>
        <label class="flex items-center justify-between">
          Email:
          <input
            name="contactEmail"
            class="input input-bordered"
            type="email"
            bind:value={currentProject.contact.email}
          />
        </label>
        <label class="flex items-center justify-between">
          Phonenumber:
          <input
            name="contactTelephone"
            class="input input-bordered right-0"
            type="phone"
            bind:value={currentProject.contact.telephone}
          />
        </label>
        <button
          type="submit"
          class="btn w-1/2 btn-info max-w-xs m-auto"
          disabled={loading}
          >{#if loading}<span class="loading loading-spinner loading-md"
            ></span>{:else}
            Save
          {/if}</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" />
      <h1 class="collapse-title text-xl font-medium">Edit Markers</h1>
      <form
        method="POST"
        action="?/editMarkers"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance={() => {
          loading = true;
          return async ({ result, update }) => {
            if (result.type === "redirect") {
              AlertsStore.addAlert("User created please login", "success");
            }
            await applyAction(result);

            loading = false;
          };
        }}
      >
        {#each $markerColorsStore as markerColor, i}
          <div class="flex flex-col gap-2">
            <span class="text-xl">Marker {i + 1}</span>
            <label class="flex items-center justify-between">
              Marker Text: <input
                name={"markerText"}
                class="input input-bordered"
                type="text"
                bind:value={markerColor.text}
              /></label
            >
            <label class="flex items-center justify-between"
              >Marker Color: <select
                name={"markerColor"}
                class="select select-bordered"
                type="text"
                bind:value={markerColor.color}
              >
                {#each Object.keys(editColors) as colorChoice}
                  <option value={colorChoice}>{colorChoice}</option>
                {/each}
              </select></label
            >
          </div>
        {/each}
        <button
          on:click|preventDefault={() => {
            if ($markerColorsStore.length < 8) {
              markerColorsStore.update((store) => {
                store.push({
                  text: `K${$markerColorsStore.length + 1}:`,
                  color: Object.keys(editColors)[$markerColorsStore.length],
                });
                return store;
              });
            }
          }}
          class="btn w-1/2 max-w-xs m-auto">Add</button
        >
        <button
          type="submit"
          class="btn w-1/2 btn-info max-w-xs m-auto"
          disabled={loading}
          >{#if loading}<span class="loading loading-spinner loading-md"
            ></span>{:else}
            Save
          {/if}</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" />
      <h1 class="collapse-title text-xl font-medium">Make registration link</h1>
      <form
        method="POST"
        action="?/makeRegisterLink"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance={() => {
          loading = true;
          return async ({ result, update }) => {
            if (result.type === "redirect") {
              AlertsStore.addAlert("User created please login", "success");
            }
            await applyAction(result);

            loading = false;
          };
        }}
      >
        {#if form?.registerLink}
          <h1 class="text-lg">Link:</h1>
          <div
            class="tooltip"
            data-tip={copied ? "Copied" : "Click to copy"}
            on:click={() => {
              copied = true;
              navigator.clipboard.writeText(form.registerLink);
              setTimeout(() => {
                copied = false;
              }, 5000);
            }}
          >
            <input
              class="input input-bordered"
              type="text"
              bind:value={form.registerLink}
            />
          </div>
        {:else}
          <div>
            Make a registration link, to add user to your project. Each link is
            valid for 1 day.
          </div>
        {/if}
        <button
          type="submit"
          class="btn w-1/2 btn-info max-w-xs m-auto"
          disabled={loading}
          >{#if loading}<span class="loading loading-spinner loading-md"
            ></span>{:else}
            Make registration link
          {/if}</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" />
      <h1 class="collapse-title text-xl font-medium">Assign existing users</h1>
      <form
        method="POST"
        action="?/assignUser"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance={() => {
          loading = true;
          return async ({ result, update }) => {
            if (result.type === "redirect") {
              AlertsStore.addAlert("User created please login", "success");
            }
            await applyAction(result);

            loading = false;
          };
        }}
      >
        <label class="flex items-center justify-between">
          User email: <input
            name="email"
            class="input input-bordered"
            type="text"
          /></label
        >
        <button
          type="submit"
          class="btn w-1/2 btn-info max-w-xs m-auto"
          disabled={loading}
          >{#if loading}<span class="loading loading-spinner loading-md"
            ></span>{:else}
            Add
          {/if}</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" />
      <h1 class="collapse-title text-xl font-medium">Unassign Users</h1>
      <form
        method="POST"
        action="?/unassignUser"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance={() => {
          loading = true;
          return async ({ result, update }) => {
            if (result.type === "redirect") {
              AlertsStore.addAlert("User created please login", "success");
            }
            await applyAction(result);

            loading = false;
          };
        }}
      >
        <label class="flex items-center justify-between">
          User: <select class="select select-bordered" name="email">
            {#each assignedUsers as user}
              <option value={user.email}>{user.email}</option>
            {/each}
          </select></label
        >
        <button
          type="submit"
          class="btn w-1/2 btn-info max-w-xs m-auto"
          disabled={loading}
          >{#if loading}<span class="loading loading-spinner loading-md"
            ></span>{:else}
            Remove
          {/if}</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" />
      <h1 class="collapse-title text-xl font-medium">Delete Project</h1>
      <form
        method="POST"
        action="?/deleteProject"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance={() => {
          loading = true;
          return async ({ result, update }) => {
            if (result.type === "redirect") {
              AlertsStore.addAlert("User created please login", "success");
            }
            await applyAction(result);

            loading = false;
          };
        }}
      >
        <button disabled class="btn w-1/2 btn-error max-w-xs m-auto"
          >{#if loading}<span class="loading loading-spinner loading-md"
            ></span>{:else}
            DELETE PROJECT
          {/if}</button
        >
      </form>
    </div>
  </div>
</div>
