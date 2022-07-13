<script>
  import { auth } from "$lib/store/firebase";
  import WithEmail from "../../components/login/WithEmail.svelte";
  import WithGoogle from "../../components/login/WithGoogle.svelte";
</script>

<div class="form-control">
  <WithEmail />
  <WithGoogle />
  <button on:click={() => auth.signOut()} class="btn">Sign Out</button>
</div>
