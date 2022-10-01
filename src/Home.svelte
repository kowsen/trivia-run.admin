<script lang="ts">
  import { Link } from "svelte-routing";
</script>

<div class="main-links">
  <h1>Elegant Admin Panel</h1>
  <Link to="/main-questions">Main Questions</Link>
  <Link to="/bonus-questions">Bonus Questions</Link>
  <Link to="/teams">Teams</Link>
</div>

<style>
  .main-links {
    display: flex;
    flex-direction: column;
    gap: 24px;
    font-size: 32px;
  }
</style>
