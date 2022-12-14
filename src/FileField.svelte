<script lang="ts">
  import { Button, FileUploader } from "carbon-components-svelte";
  import { uploadFile } from "./socket/trivia/admin_rpcs";
  import { client } from "./client";

  const STATIC_URL = import.meta.env.VITE_STATIC;

  export let kind: "image" | "bundle";
  export let value: string;

  let files: File[];

  let isUploading = false;

  function onClear() {
    value = "";
  }

  $: buttonLabel = isUploading ? "Uploading..." : "Add file...";

  $: {
    if (files && files[0]) {
      isUploading = true;
      const reader = new FileReader();
      reader.addEventListener("load", async () => {
        const result = await client.call(uploadFile, { base64: reader.result });
        value = result.path;
        isUploading = false;
      });
      reader.readAsDataURL(files[0]);
      files = [];
    }
  }

  $: labelTitle = kind === "image" ? "Image" : "Frame";
  $: labelDescription =
    kind === "image"
      ? "Accepts jpg, jpeg, and png"
      : "Accepts zip files with index.html in the root";
  $: accept = kind === "image" ? ["jpg", "jpeg", "png"] : ["zip"];
</script>

<div class="file-field">
  <FileUploader
    {labelTitle}
    {buttonLabel}
    {labelDescription}
    {accept}
    kind="secondary"
    disabled={isUploading}
    bind:files
  />
  {#if value}
    <p class="accent">Preview:</p>
    {#if kind === "image"}
      <img class="preview" src={`${STATIC_URL}/${value}`} alt="preview" />
    {:else}
      <iframe
        class="preview"
        src={`${STATIC_URL}/${value}/index.html`}
        title="preview"
      />
    {/if}
    <Button kind="danger" on:click={onClear}>Remove</Button>
  {/if}
</div>

<style lang="scss">
  .file-field {
    display: flex;
    flex-direction: column;
  }

  .preview {
    max-width: 100%;
  }

  iframe {
    width: 100%;
    height: 600px;
  }
</style>
