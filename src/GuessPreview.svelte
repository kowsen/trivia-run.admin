<script lang="ts">
  import type { AdminGuess, AdminQuestion } from "./socket/trivia/admin_state";
  import { navigate } from "svelte-routing";
  import DeleteModal from "./DeleteModal.svelte";
  import Entry, { type EntryMenuItem } from "./Entry.svelte";
  import MoveModal from "./MoveModal.svelte";
  import { client, order } from "./client";

  export let guess: AdminGuess;

  let isDeleting = false;

  function indexOf<T>(arr: T[], value: T): number | undefined {
    const index = arr.indexOf(value);
    if (index === -1) {
      return undefined;
    }
    return index;
  }

  $: question = $client.questions.entities[guess.questionId];
  $: mainIndex = indexOf($order.main, question._id);
  $: bonusIndex = indexOf($order.bonus, question._id);
  $: handle =
    mainIndex !== undefined
      ? `Q${mainIndex + 1}`
      : bonusIndex !== undefined
      ? `B${bonusIndex + 1}`
      : "?";

  $: team = $client.teams.entities[guess.teamId];
  $: content = `${guess.text} (${team.name})`;

  $: options = [
    {
      text: "Question Feed",
      action: () => {
        navigate(`/question/feed/${guess.questionId}`);
      },
    },
    {
      text: "Team Feed",
      action: () => {
        navigate(`/team/feed/${guess.teamId}`);
      },
    },
    {
      text: "Delete",
      action: () => {
        isDeleting = true;
      },
    },
  ] as EntryMenuItem[];
</script>

<div>
  <Entry {handle} {content} {options} isSpecial={guess.isCorrect} />
  {#if isDeleting}
    <DeleteModal
      documentId={guess._id}
      kind="guess"
      on:close={() => {
        isDeleting = false;
      }}
    />
  {/if}
</div>
