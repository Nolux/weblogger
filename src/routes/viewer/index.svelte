<script>
  import { functions } from "$lib/store/firebase";
  import { httpsCallable } from "firebase/functions";

  const exportPDF = httpsCallable(functions, "exportPdf");

  let loading = false;

  let dates = [
    {
      localDate: { day: "3", month: "5", year: "2022" },
      logs: [
        {
          body: "Dette her er en lengre logg",
          createdAt: new Date(),
          createdBy: { id: "123456", name: "Atle Selbek" },
          project: { id: "123456", name: "random project name" },
          timecode: { frames: "09", hours: "23", minutes: "39", seconds: "49" },
        },
        {
          body: "Dette her er en lengre logg",
          createdAt: new Date(),
          createdBy: { id: "123456", name: "Atle Selbek" },
          project: { id: "123456", name: "random project name" },
          timecode: { frames: "09", hours: "23", minutes: "39", seconds: "49" },
        },
      ],
    },
    {
      localDate: { day: "2", month: "5", year: "2022" },
      logs: [
        {
          body: "Dette her er en lengre logg",
          createdAt: new Date(),
          createdBy: { id: "123456", name: "Atle Selbek" },
          project: { id: "123456", name: "random project name" },
          timecode: { frames: "09", hours: "23", minutes: "39", seconds: "49" },
        },
        {
          body: "Dette her er en lengre logg",
          createdAt: new Date(),
          createdBy: { id: "123456", name: "Atle Selbek" },
          project: { id: "123456", name: "random project name" },
          timecode: { frames: "09", hours: "23", minutes: "39", seconds: "49" },
        },
      ],
    },
  ];

  let test = () => {
    loading = true;
    exportPDF({ projectId: "12345", date: "20220322" })
      .then((res) => {
        window.open(res.data.url[0]);
        loading = false;
      })
      .catch((e) => console.log(e));
  };
</script>

<button
  class="hidden btn disabled"
  disabled
  on:click={() => (!loading ? test() : "")}>Print PDF</button
>

<div class="p-2 ">
  {#each dates as { localDate, logs }}
    <div class="flex flex-row pb-4">
      <div
        class="flex flex-col justify-around text-center leading-normal rounded p-2 bg-primary transition-all hover:w-40"
      >
        <div class="">{localDate.year}</div>
        <div class="">{localDate.month}</div>
        <div class="">{localDate.day}</div>
      </div>
      <div class="flex-1">
        {#each logs as { body, timecode, createdAt, createdBy }}
          <div class="gap-4 bg-base-200 rounded p-4 m-6">
            <div class="flex flex-row">
              <div class="flex-auto">{body}</div>
              <div class="divider divider-horizontal" />
              <div>
                <div class="flex flex-col text-center">
                  <div>createdAT</div>
                  <div>
                    {timecode.hours}:{timecode.minutes}:{timecode.seconds}:{timecode.frames}
                  </div>
                  <div>
                    {createdBy.name}
                  </div>
                  <button class="btn btn-xs btn-ghost">edit</button>
                  <button class="btn btn-xs btn-ghost">del</button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<div class="relative">
  <div class="fixed rounded left-0 p-2 bg-primary transition-all  hover:w-40">
    2020.06.22
  </div>

  <div class="flex gap-4 bg-base-200 rounded h-20 p-2 m-6">
    <div class="">DATES</div>
    <div class="flex-1">logger?</div>
  </div>
</div>
