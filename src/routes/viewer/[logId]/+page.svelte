<script>
  import Icon from "@iconify/svelte";
  import dayjs from "dayjs";

  export let data;

  $: log = data.log;
  $: console.log(log);
</script>

<h1
  class="text-3xl font-bold font-bold text-center hidden lg:block lg:text-left mb-4"
>
  Viewer
</h1>
<div class="flex justify-between">
  <button
    class="btn btn-lg btn-ghost mb-4"
    on:click={() => window.history.back()}
    ><Icon icon="mdi:arrow-back" /></button
  >
  <div>
    <button
      class="btn transition-all {log.confirmDelete ? 'btn-error' : ''}"
      on:click={async () => {
        if (!log.confirmDelete) {
          log.confirmDelete = true;
          setTimeout(() => {
            log.confirmDelete = false;
          }, 4000);
        } else {
          await fetch("/api/log/delete", {
            method: "DELETE",
            body: JSON.stringify({ logId: log.id }),
          });
          window.history.back();
        }
      }}
      ><Icon icon="mdi:trash"></Icon>{log.confirmDelete
        ? "Are you sure?"
        : ""}</button
    >
  </div>
</div>
{#if log}
  <div class="grid grid-cols-4 gap-8 border border-accent rounded p-2">
    <div class="col-span-3">{log.body}</div>
    <div class="col-span-1 flex flex-col justify-start">
      <div>{dayjs(log.createdAt).format("YYYY.MM.DD HH:MM")}</div>
      <div>{log.createdByFullName}</div>
      <div>{log.timecodeString}</div>
      <div class="w-20 mt-1 text-center">
        {#if log.tags.length > 0}
          {#each log.tags as tag}
            <div
              class="badge w-full {tag.includes(':')
                ? `bg-${log.markerColor}`
                : 'badge-accent'} hover:brightness-50 cursor-pointer mb-2"
            >
              <span
                class={tag.includes(":")
                  ? "mix-blend-difference font-bold"
                  : ""}>{tag}</span
              >
            </div>
          {/each}
        {:else}
          <div class="badge badge-ghost">n/a</div>
        {/if}
      </div>
    </div>
  </div>
{/if}
