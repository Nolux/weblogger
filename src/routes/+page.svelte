<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  export let data;

  dayjs.extend(relativeTime);

  $: user = data.user;
  $: stats = data.stats;
  $: userAgent = data.userAgent?.toLowerCase();

  $: console.log(stats);

  $: isSafari = userAgent?.indexOf("safari/") > -1;
</script>

<div class="flex flex-col gap-8">
  <h1 class="text-3xl font-bold text-center lg:text-left">
    {user ? `Welcome back ${user.firstName}!` : "Welcome to Weblogger"}
  </h1>
  {#if user}
    <div class="w-full border border-info stats">
      <div class="stat place-items-center">
        <div class="stat-title">Total Logs</div>
        <div class="stat-value text-info">{stats.projectTotalLogs}</div>
        <div class="stat-desc">
          Average {Math.floor(stats.projectTotalLogs / stats.projectTotalDays)}
          per day
        </div>
      </div>
      <div class="stat place-items-center">
        <div class="stat-title">Total Days logged</div>
        <div class="stat-value text-info">{stats.projectTotalDays}</div>
        <div class="stat-desc">
          stats updated {dayjs(stats.updatedAt).fromNow()}
        </div>
      </div>
      <div class="stat place-items-center">
        <div class="stat-title">Total Characters Written</div>
        <div class="stat-value text-info">{stats.projectTotalCharacters}</div>
        <div class="stat-desc">
          Average {Math.floor(
            stats.projectTotalCharacters / stats.projectTotalLogs
          )}
          per log
        </div>
      </div>
    </div>
    <div class="w-full border border-info stats">
      <div class="stat place-items-center">
        <div class="stat-title text-2xl">Total today logs</div>
        <div class="stat-value text-info text-6xl">{stats.todayLogs}</div>
        <div class="stat-desc">
          {stats.todayLogs >
          Math.floor(stats.projectTotalLogs / stats.projectTotalDays)
            ? "More then average"
            : "Less then average, keep logging!"}
        </div>
      </div>
      <div class="stat place-items-center">
        <div class="stat-title text-2xl">Total today characters</div>
        <div class="stat-value text-info text-6xl">{stats.todayCharacters}</div>
        <div class="stat-desc">
          {stats.todayCharacters >
          Math.floor(stats.projectTodayCharacters / stats.projectTotalDays)
            ? "More then average"
            : "Less then average, keep logging!"}
        </div>
      </div>
    </div>
    <div class="divider divider-info"></div>
    <h2 class="text-xl text-center">Select module</h2>
    <div class="flex flex-col lg:flex-row justify-around items-stretch gap-4">
      <a href="/logger" class="btn btn-outline btn-info btn-lg grow">
        <div class="text-xl font-bold">LOGGER</div>
      </a>
      <a href="/postlogger" class="btn btn-outline btn-info btn-lg grow">
        <div class="text-xl font-bold">POST LOGGER</div>
      </a>
      <a href="/viewer" class="btn btn-outline btn-info btn-lg grow">
        <div class="text-xl font-bold">VIEWER</div>
      </a>
    </div>
  {:else}
    <div class="relative">
      <div class="w-full border border-info stats">
        <div class="stat place-items-center">
          <div class="stat-title">Total logs</div>
          <div class="stat-value text-info">{stats.allTotalLogs}</div>
        </div>
        <div class="stat place-items-center">
          <div class="stat-title">Total characters written</div>
          <div class="stat-value text-info">{stats.allTotalCharacters}</div>
        </div>
        <div class="stat place-items-center">
          <div class="stat-title">Total days</div>
          <div class="stat-value text-info">{stats.allDaysLogged}</div>
        </div>
      </div>
      <a href="/login" class="">
        <video autoplay muted playsinline id="bgVideo">
          <source src={`video/bgvideo.${isSafari ? "mov" : "webm"}`} />
        </video>
      </a>
      <div
        class="absolute top-1/2 opacity-50 hover:opacity-100 w-full flex flex-col lg:flex-row justify-around items-stretch gap-4"
      ></div>
    </div>
  {/if}
</div>

<style>
  #bgVideo {
    right: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
  }
</style>
