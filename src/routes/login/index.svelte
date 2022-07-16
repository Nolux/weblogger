<script>
  import WithEmail from "../../components/login/WithEmail.svelte";
  import WithGoogle from "../../components/login/WithGoogle.svelte";
</script>

<div class="container w-80 p-6 mx-auto form-control">
  <WithEmail />
  <div class="divider" />
  <div class="text-center pb-4">With providers:</div>
  <WithGoogle />
</div>
