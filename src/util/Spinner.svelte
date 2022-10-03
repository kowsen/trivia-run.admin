<script lang="ts">
  import { setSafeInterval } from "./safe-patch";

  export let seed: string = "...";
  export let stepLength: number = 200;
  export let fontSize: number = 30;

  $: style = `font-size: ${fontSize}px;`;

  let counter: number = 0;
  $: loadStr = seed.slice(0, counter % (seed.length + 1));

  setSafeInterval(() => {
    counter += 1;
  }, stepLength);
</script>

<span {style}>{loadStr}</span>
