<script lang="ts">
  import {
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "carbon-components-svelte";
  import { createEventDispatcher } from "svelte";
  import { client, order } from "./client";
  import { upsertQuestion } from "./socket/trivia/admin_rpcs";

  const dispatch = createEventDispatcher();

  async function onSubmit() {
    const mainQuestions = $order.main;
    for (const questionId of mainQuestions.slice(0, -1)) {
      const question = $client.questions.entities[questionId];
      await client.call(upsertQuestion, {
        ...question,
        unlockTime: 3163474800000,
      });
    }
    onClose();
  }

  function onClose() {
    dispatch("close");
  }
</script>

<ComposedModal open={true} on:submit={onSubmit} on:close={onClose}>
  <ModalHeader title="End Game" />
  <ModalBody>
    <p>
      This will end the game for all active players by locking every main
      question. It cannot be undone without Kyle having to do a lot of work, so
      don't do this unless you really want to.
    </p>
  </ModalBody>
  <ModalFooter primaryButtonText="End Game" />
</ComposedModal>
