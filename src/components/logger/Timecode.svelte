<script>
  import dayjs from "dayjs";
  export let staticTime = false;
  export let clock = "00:00:00:00";

  console.log(clock);

  const displayAsDobbleDigit = (digit) => {
    return digit < 10 ? "0" + digit : digit;
  };

  if (!staticTime) {
    clock = dayjs().format("HH:mm:ss");

    const refreshTime = () => {
      let time = dayjs();
      let frames = Math.floor(time.millisecond() / 40);

      clock = time.format("HH:mm:ss:") + displayAsDobbleDigit(frames);
    };

    refreshTime();
    setInterval(() => {
      refreshTime();
    }, 150);
  } else {
  }
</script>

<div class="bg-neutral rounded-box text-neutral-content p-4 mb-4">
  <p class="text-xl">Timecode</p>
  <p class="text-4xl">{clock}</p>
</div>
