<script>
  import { enhance } from "$app/forms";
  import { editColors } from "$lib/helpers/editColors.js";
  import { writable } from "svelte/store";
  export let data;

  const markerColorsStore = writable(data.currentProject.markerColors);

  $: currentProject = data.currentProject;
  $: user = data.user;
  $: assignedUsers = data.assignedUsers;

  export let form;
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Project Controller
  </h1>
  <div class="grid gap-2">
    <div class="collapse collapse-arrow border border-info">
      <input type="radio" name="my-accordion-2" />
      <h1 class="collapse-title text-xl font-medium">Edit Project</h1>
      <form
        method="POST"
        action="?/editProject"
        class="flex flex-col gap-4 collapse-content"
        use:enhance
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
        <button type="submit" class="btn w-1/2 btn-info max-w-xs m-auto"
          >Save</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info">
      <input type="radio" name="my-accordion-2" />
      <h1 class="collapse-title text-xl font-medium">Edit Markers</h1>
      <form
        method="POST"
        action="?/editMarkers"
        class="flex flex-col gap-4 collapse-content"
        use:enhance
      >
        {#each $markerColorsStore as markerColor, i}
          <div class="flex flex-col gap-2">
            <span class="text-xl">Marker {i}</span>
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
                  text: `K${$markerColorsStore.length + 1}: `,
                  color: Object.keys(editColors)[$markerColorsStore.length],
                });
                return store;
              });
            }
          }}
          class="btn w-1/2 max-w-xs m-auto">Add</button
        >
        <button type="submit" class="btn w-1/2 btn-info max-w-xs m-auto"
          >Save</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info">
      <input type="radio" name="my-accordion-2" />
      <h1 class="collapse-title text-xl font-medium">Assign Users</h1>
      <form
        method="POST"
        action="?/assignUser"
        class="flex flex-col gap-4 collapse-content"
        use:enhance
      >
        <label class="flex items-center justify-between">
          Marker Text: <input
            name="email"
            class="input input-bordered"
            type="text"
          /></label
        >
        <button type="submit" class="btn w-1/2 btn-info max-w-xs m-auto"
          >Add</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info">
      <input type="radio" name="my-accordion-2" />
      <h1 class="collapse-title text-xl font-medium">Unassign Users</h1>
      <form
        method="POST"
        action="?/unassignUser"
        class="flex flex-col gap-4 collapse-content"
        use:enhance
      >
        <label class="flex items-center justify-between">
          User: <select class="select select-bordered" name="email">
            {#each assignedUsers as user}
              <option value={user.email}>{user.email}</option>
            {/each}
          </select></label
        >
        <button type="submit" class="btn w-1/2 btn-info max-w-xs m-auto"
          >Remove</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info">
      <input type="radio" name="my-accordion-2" />
      <h1 class="collapse-title text-xl font-medium">Delete Project</h1>
      <form
        method="POST"
        action="?/deleteProject"
        class="flex flex-col gap-4 collapse-content"
        use:enhance
      >
        <button class="btn w-1/2 btn-error max-w-xs m-auto"
          >DELETE PROJECT</button
        >
      </form>
    </div>
  </div>
</div>
