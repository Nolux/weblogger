<script>
  export let user;
  $: console.log(user);

  const submitChangeProject = async (projectId) => {
    const response = await fetch("/api/user/selectProject", {
      method: "POST",
      body: JSON.stringify({ projectId }),
      credentials: "include",
    });
  };
</script>

<select
  class="select w-full max-w-xs"
  bind:value={user.selectedProjectId}
  on:change={(e) => {
    submitChangeProject(e.target.value);
  }}
>
  {#each user.assignedProjects as project}
    <option value={project.id}>{project.name}</option>
  {/each}
</select>
