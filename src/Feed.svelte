<script lang="ts">
  import { derived } from "svelte/store";
  import { client, order } from "./client";
  import { Button } from "carbon-components-svelte";
  import { upsertTeam } from "./socket/trivia/admin_rpcs";
  import Header from "./Header.svelte";
  import { generateToken } from "./socket/trivia/base";
  import {
    uniqueNamesGenerator,
    adjectives,
    animals,
  } from "unique-names-generator";
  import TeamPreview from "./TeamPreview.svelte";
  import GuessPreview from "./GuessPreview.svelte";

  export let teamId: string = "";
  export let questionId: string = "";

  const PAGE_SIZE = 100;
  let page = 0;

  const allGuesses = derived(client, ({ guesses }) =>
    guesses.ids.map((id) => guesses.entities[id])
  );

  $: guesses = $allGuesses
    .filter(
      (guess) =>
        (!teamId || guess.teamId === teamId) &&
        (!questionId || guess.questionId === questionId)
    )
    .sort((a, b) => b._modified - a._modified);

  $: guessPage = guesses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  $: maxPage = Math.ceil(guesses.length / PAGE_SIZE) - 1;
</script>

<div class="guesses">
  <Header>Guess Feed</Header>
  <div class="guess-list">
    {#each guessPage as guess}
      <GuessPreview {guess} />
    {/each}
    <div class="controls">
      <Button
        kind="secondary"
        on:click={() => {
          page -= 1;
        }}
        disabled={page === 0}>&lt;</Button
      >
      <span>Page {page + 1} of {maxPage + 1}</span>
      <Button
        kind="secondary"
        on:click={() => {
          page += 1;
        }}
        disabled={page === maxPage}>&gt;</Button
      >
    </div>
  </div>
</div>

<style lang="scss">
  .guess-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 24px 0;
  }

  .controls {
    display: flex;

    span {
      margin: auto;
      font-size: 20px;
    }
  }
</style>
