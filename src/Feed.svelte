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

  function digits(num: number, digits: number) {
    return `${num}`.padStart(digits, '0');
  }

  function buildTimestamp(epoch: number) {
    const date = new Date(epoch);
    const year = digits(date.getFullYear(), 4);
    const month = digits(date.getMonth() + 1, 2);
    const day = digits(date.getDate(), 2);
    const hour = digits(date.getHours(), 2)
    const minute = digits(date.getMinutes(), 2);
    const second = digits(date.getSeconds(), 2);
    const millisecond = digits(date.getMilliseconds(), 3);
    return `${year}/${month}/${day} ${hour}:${minute}:${second}.${millisecond}`;
    // 2014/08/19 15:29:17.562
  }

  function stringIndexOf<T>(arr: T[], value: T): string {
    const index = arr.indexOf(value);
    if (index === -1) {
      return "";
    }
    return `${index + 1}`;
  }

  function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
  }

  function escapeCsvEntry(entry: string | number | boolean): string {
    const replacedEntry = `${entry}`.replaceAll('"', '""');
    return `"${replacedEntry}"`;
  }

  function generateCsvString() {
    const teamMap = $client.teams.entities;
    const mainQuestionOrder = $order.main;
    const bonusQuestionOrder = $order.bonus;

    const guessLines = guesses.map(guess => {
      const team = teamMap[guess.teamId];
      const fields = [buildTimestamp(guess._modified), team.name, team.isSecretTeam ?? false, stringIndexOf(mainQuestionOrder, guess.questionId), stringIndexOf(bonusQuestionOrder, guess.questionId), guess.isCorrect, guess.text];
      return fields.map(escapeCsvEntry).join(',');
    });

    const header = ['Timestamp', 'Team Name', 'Secret Team', 'Main Question', 'Bonus Question', 'Correct', 'Text'].join(',');

    return [header].concat(guessLines).join('\n');
  }

  function downloadCsv() {
    download("data.csv", generateCsvString());
  }
</script>

<div class="guesses">
  <Header>
    <div class="header-container">
      Guess Feed
      <Button kind="secondary" size="small" on:click={downloadCsv}>Download CSV</Button>
    </div>
  </Header>
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

  .header-container {
    display: flex;
    align-items: center;

    :global(button) {
      margin-left: auto;
    }
  }
</style>
