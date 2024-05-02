<script>
  import { goto, invalidateAll } from "$app/navigation";

  export let user;

  const submitChangeProject = async (projectId) => {
    const response = await fetch("/api/user/selectProject", {
      method: "POST",
      body: JSON.stringify({ projectId }),
      credentials: "include",
    });
    goto("/", { invalidateAll: true });
  };
</script>

<select
  class="select w-full max-w-xs"
  bind:value={user.selectedProjectId}
  on:change={(e) => {
    submitChangeProject(e.target.value);
  }}
>
  {#if user.assignedProjects.length > 0}
    {#each user.assignedProjects as project}
      <option value={project.id}>{project.name}</option>
    {/each}
  {:else}
    <option disabled value="No assigned projects">No assigned projects</option>
  {/if}
</select>
