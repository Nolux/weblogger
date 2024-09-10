<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  export let data;

  $: stats = data.stats;

  let showMoreMostUsedTags = false;
  let showMoreMostUsedTagsWithoutMarkers = false;
  let showMoreBusiestDays = false;
</script>

<div class="relative flex flex-col gap-8">
  <div role="alert" class="absolute top-0 w-full flex justify-center"></div>
  <h1 class="text-3xl font-bold text-center hidden lg:block lg:text-left">
    Project Stats
  </h1>
  <div class="grid gap-4">
    <div class="w-full border border-info stats">
      <div class="stat place-items-center">
        <div class="stat-title">Total Logs:</div>
        <div class="stat-value text-info">{stats.projectTotalLogs}</div>
        <div class="stat-desc">
          Average {Math.floor(stats.projectTotalLogs / stats.projectTotalDays)} per
          day
        </div>
      </div>
      <div class="stat place-items-center">
        <div class="stat-title">Total Days logged:</div>
        <div class="stat-value text-info">{stats.projectTotalDays}</div>
        <div class="stat-desc">
          Stats updated {dayjs(stats.updatedAt).fromNow()}
        </div>
      </div>
      <div class="stat place-items-center">
        <div class="stat-title">Total Characters Written:</div>
        <div class="stat-value text-info">{stats.projectTotalCharacters}</div>
        <div class="stat-desc">
          Average {Math.floor(
            stats.projectTotalCharacters / stats.projectTotalLogs
          )} per log
        </div>
      </div>
    </div>

    <div class="border border-info rounded-xl p-4">
      <h1 class="w-full text-3xl">Top Loggers</h1>
      <table class="table lg:table-xs my-4 p-4 text-center">
        <thead class="">
          <tr>
            <th>Name</th>
            <th>Number of logs</th>
            <th>Characters Written</th>
            <th>Average per log</th>
          </tr>
        </thead>
        <tbody>
          {#each stats.sortedMostLogs as user, i}
            <tr class={i == 0 ? "text-xl text-info" : ""}>
              <td>{user.name}</td>
              <td>{user.logs}</td>
              <td>{user.totalChars}</td>
              <td>{user.avgChars}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="border border-info rounded-xl p-4">
      <h1 class="w-full text-3xl">Top Tags</h1>
      <table class="table lg:table-xs my-4 p-4 text-center">
        <thead class="">
          <tr>
            <th>Name</th>
            <th>Number of times used</th>
          </tr>
        </thead>
        <tbody>
          {#each stats.sortedMostUsedTags as tag, i}
            {#if showMoreMostUsedTagsWithoutMarkers == true}
              <tr class={i == 0 ? "text-xl text-info" : ""}>
                <td>{tag.name}</td>
                <td>{tag.timesUsed}</td>
              </tr>
            {:else if i < 10}
              <tr class={i == 0 ? "text-xl text-info" : ""}>
                <td>{tag.name}</td>
                <td>{tag.timesUsed}</td>
              </tr>
            {/if}
          {/each}
          {#if !showMoreMostUsedTagsWithoutMarkers}
            <tr><td>{stats.sortedMostUsedTags.length} more tags</td></tr>
          {/if}
        </tbody>
      </table>
      <div class="w-full flex justify-center">
        <button
          class="btn"
          on:click={() =>
            (showMoreMostUsedTagsWithoutMarkers =
              !showMoreMostUsedTagsWithoutMarkers)}
          >Show {showMoreMostUsedTagsWithoutMarkers ? "Less" : "More"}</button
        >
      </div>
    </div>
    <div class="border border-info rounded-xl p-4">
      <h1 class="w-full text-3xl">Top Tags Without Markers</h1>
      <table class="table lg:table-xs my-4 p-4 text-center">
        <thead class="">
          <tr>
            <th>Name</th>
            <th>Number of times used</th>
          </tr>
        </thead>
        <tbody>
          {#each stats.sortedMostUsedTagsWithoutMarkers as tag, i}
            {#if showMoreMostUsedTags == true}
              <tr class={i == 0 ? "text-xl text-info" : ""}>
                <td>{tag.name}</td>
                <td>{tag.timesUsed}</td>
              </tr>
            {:else if i < 10}
              <tr class={i == 0 ? "text-xl text-info" : ""}>
                <td>{tag.name}</td>
                <td>{tag.timesUsed}</td>
              </tr>
            {/if}
          {/each}
          {#if !showMoreMostUsedTags}
            <tr
              ><td>{stats.sortedMostUsedTagsWithoutMarkers.length} more tags</td
              ></tr
            >
          {/if}
        </tbody>
      </table>
      <div class="w-full flex justify-center">
        <button
          class="btn"
          on:click={() => (showMoreMostUsedTags = !showMoreMostUsedTags)}
          >Show {showMoreMostUsedTags ? "Less" : "More"}</button
        >
      </div>
    </div>

    <div class="border border-info rounded-xl p-4">
      <h1 class="w-full text-3xl">Top Days</h1>
      <table class="table lg:table-xs my-4 p-4 text-center">
        <thead class="">
          <tr>
            <th>Day</th>
            <th>Logs</th>
          </tr>
        </thead>
        <tbody>
          {#each stats.sortedBusiestDays as day, i}
            {#if showMoreBusiestDays == true}
              <tr class={i == 0 ? "text-xl text-info" : ""}>
                <td>{day.name}</td>
                <td>{day.logs}</td>
              </tr>
            {:else if i < 10}
              <tr class={i == 0 ? "text-xl text-info" : ""}>
                <td>{day.name}</td>
                <td>{day.logs}</td>
              </tr>
            {/if}
          {/each}
          {#if !showMoreBusiestDays && stats.sortedBusiestDays.length > 10}
            <tr><td>{stats.sortedBusiestDays.length} more tags</td></tr>
          {/if}
        </tbody>
      </table>
      {#if stats.sortedBusiestDays.length > 10}
        <div class="w-full flex justify-center">
          <button
            class="btn"
            on:click={() => (showMoreBusiestDays = !showMoreBusiestDays)}
            >Show {showMoreBusiestDays ? "Less" : "More"}</button
          >
        </div>
      {/if}
    </div>
  </div>
</div>
