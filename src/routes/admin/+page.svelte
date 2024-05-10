<script>
  import { enhance } from "$app/forms";

  import { AlertsStore } from "$lib/stores/alertsStore.js";

  export let data;

  $: projects = data.projects;

  $: console.log(projects);
  export let form;

  $: {
    if (form?.error) {
      AlertsStore.addAlert(form?.error, "error");
    }
    if (form?.success) {
      AlertsStore.addAlert(form?.success, "success");
    }
  }

  let copied = false;
  let confirm = false;
</script>

<div class="relative flex flex-col gap-8">
  <div role="alert" class="absolute top-0 w-full flex justify-center">
    {#if form?.error}<div class="alert alert-error">{form?.errorMsg}</div>{/if}
  </div>
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Admin
  </h1>
  <div class="grid gap-4">
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" checked="checked" />
      <h1 class="collapse-title text-xl font-medium">Add Project</h1>
      <form
        method="POST"
        action="?/addProject"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance
      >
        <label class="flex items-center justify-between">
          Project Name:
          <input name="name" class="input input-bordered" type="text" />
        </label>
        <h1 class="text-xl">Contact</h1>
        <label class="flex items-center justify-between">
          Name:
          <input name="contactName" class="input input-bordered" type="text" />
        </label>
        <label class="flex items-center justify-between">
          email:
          <input
            name="contactEmail"
            class="input input-bordered"
            type="email"
          />
        </label>
        <label class="flex items-center justify-between">
          Telephone:
          <input
            name="contactTelephone"
            class="input input-bordered"
            type="text"
          />
        </label>
        <button type="submit" class="btn w-1/2 btn-info max-w-xs m-auto"
          >Add</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" checked="checked" />
      <h1 class="collapse-title text-xl font-medium">Delete Project</h1>
      <form
        method="POST"
        action="?/deleteProject"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance
      >
        <label class="flex items-center justify-between">
          Project Name:
          <select class="select select-bordered" name="projectId">
            {#each projects as project}
              <option value={project.id}>{project.name}</option>
            {/each}
          </select>
        </label>
        <button
          type={"submit"}
          on:click|preventDefault={(e) => {
            if (confirm) {
              confirm = false;
              e.currentTarget.form.submit();
            } else {
              confirm = !confirm;
            }
          }}
          class={`btn w-1/2 ${confirm ? "btn-error" : "btn-info"} max-w-xs m-auto`}
          >Remove</button
        >
      </form>
    </div>
    <div class="collapse collapse-arrow border border-info rounded-none">
      <input type="radio" name="controller-accordion" />
      <h1 class="collapse-title text-xl font-medium">Add User to Project</h1>
      <form
        method="POST"
        action="?/assignUserToProject"
        class="flex flex-col gap-4 collapse-content md:w-1/2 xl:w-1/4 lg:m-auto"
        use:enhance
      >
        <label class="flex items-center justify-between">
          User Email:
          <input name="email" class="input input-bordered" type="text" />
        </label>
        <label class="flex items-center justify-between">
          Project Name:
          <select class="select select-bordered" name="projectId">
            {#each projects as project}
              <option value={project.id}>{project.name}</option>
            {/each}
          </select>
        </label>
        <button type="submit" class="btn w-1/2 btn-info max-w-xs m-auto"
          >Add</button
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
        use:enhance
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
        {/if}
        <label class="flex items-center justify-between">
          Project Name:
          <select class="select select-bordered" name="projectId">
            {#each projects as project}
              <option value={project.id}>{project.name}</option>
            {/each}
          </select>
        </label>
        <button type="submit" class="btn w-1/2 btn-info max-w-xs m-auto"
          >Make registration link</button
        >
      </form>
    </div>
  </div>
</div>
