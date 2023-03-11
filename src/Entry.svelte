<script lang="ts" context="module">
  export interface EntryMenuItem {
    text: string;
    action: () => void;
  }
</script>

<script lang="ts">
  import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";
  import SvelteMarkdown from "svelte-markdown";
  import formatDistanceToNow from "date-fns/formatDistanceToNow";
  import format from "date-fns/format";

  export let handle: string;
  export let time: number | undefined;
  export let content: string;
  export let options: EntryMenuItem[];
  export let isSecret = false;
  export let isSpecial = false;
</script>

<div class="entry" class:secret={isSecret} class:special={isSpecial}>
  <span class="handle header accent">{handle}</span>
  <span class="content">
    <div class="answer">
      <SvelteMarkdown source={content} />
    </div>
    {#if time != null}
      <div class="time">
        <div>{format(time, "hh:mm:ssaaa dd/MM/yy")}</div>
        <div class="fromNow">{formatDistanceToNow(time)} ago</div>
      </div>
    {/if}
  </span>

  <div class="menu-container">
    <OverflowMenu size="sm" flipped={true}>
      {#each options as option}
        <OverflowMenuItem text={option.text} on:click={option.action} />
      {/each}
    </OverflowMenu>
  </div>
</div>

<style lang="scss">
  .content {
    display: grid;
    width: 100%;
  }

  .answer {
    display: flex;
    align-items: center;
  }

  .time {
    font-size: 0.5em;
    display: flex;
    flex-direction: column;
    align-content: center;
    .fromNow {
      font-size: 0.9em;
    }
  }

  .entry {
    display: flex;
    padding: 12px 24px;
    background-color: #5e5e5e;
    gap: 12px;
    align-items: center;
    font-size: 20px;

    &.secret {
      background-color: #4a4a4a;
      span {
        opacity: 0.7;
      }
    }

    &.special {
      background-color: #155d3d;
    }
  }

  .handle {
    min-width: 32px;
  }

  .menu-container {
    margin-left: auto;
  }
</style>
