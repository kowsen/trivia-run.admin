<script>
  import Spinner from "./Spinner.svelte";
</script>

<div class="loading-banner-curtain">
  <div class="loading-banner">
    <Spinner />
  </div>
</div>

<style>
  .loading-banner-curtain {
    position: fixed;
    display: flex;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .loading-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
    width: 100%;
    height: 64px;
    background-color: #666;
  }
</style>
