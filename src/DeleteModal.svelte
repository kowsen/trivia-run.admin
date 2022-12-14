<script lang="ts">
  import {
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Checkbox,
    NumberInput,
  } from "carbon-components-svelte";
  import { derived } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  import { client, order } from "./client";
  import type { AdminQuestionOrder } from "./socket/trivia/admin_state";
  import type { RequestDoc } from "./socket/trivia/base";
  import {
    setQuestionOrder,
    upsertGuess,
    upsertQuestion,
    upsertTeam,
  } from "./socket/trivia/admin_rpcs";

  const dispatch = createEventDispatcher();

  export let documentId: string | undefined;
  export let kind: "question" | "team" | "guess";

  async function onSubmit() {
    if (kind === "question") {
      const newOrder = {
        main: $order.main.filter((id) => id !== documentId),
        bonus: $order.bonus.filter((id) => id !== documentId),
      };
      await client.call(setQuestionOrder, newOrder);
      const newQuestion = {
        ...$client.questions.entities[documentId],
        _deleted: true,
      };
      await client.call(upsertQuestion, newQuestion);
    } else if (kind === "team") {
      const team = $client.teams.entities[documentId];
      await client.call(upsertTeam, { ...team, _deleted: true });
    } else if (kind === "guess") {
      const guess = $client.guesses.entities[documentId];
      await client.call(upsertGuess, { ...guess, _deleted: true });
    }
    onClose();
  }

  function onClose() {
    dispatch("close");
  }
</script>

<ComposedModal open={!!documentId} on:submit={onSubmit} on:close={onClose}>
  <ModalHeader title="Delete Item" />
  <ModalBody>
    <p>This will permanently delete this item and remove it from the game.</p>
    {#if kind === "question"}
      <p>
        If you delete a question that a team is currently working on, their
        game's gonna go pretty wonky. Only do this either before the game has
        started or with Kyle's help. It's much safer to edit questions than it
        is to move or delete them.
      </p>
    {/if}
    {#if kind === "team"}
      <p>
        The team will not get any notification that it's been deleted, the game
        will just stop working for them. I wouldn't use this during the game
        unless this person's been abusing the system.
      </p>
    {/if}
    {#if kind === "guess"}
      <p>
        This'll just blank out the guess for everyone, it won't change any
        team's standing. If you want to bump a team back, you'll need to edit
        the team directly.
      </p>
    {/if}
  </ModalBody>
  <ModalFooter primaryButtonText="Delete" />
</ComposedModal>
