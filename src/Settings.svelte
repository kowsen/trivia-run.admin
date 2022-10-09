<script lang="ts">
  import { Button, PasswordInput, TextInput } from "carbon-components-svelte";
  import { Link, navigate } from "svelte-routing";
  import { client } from "./client";
  import EndGameModal from "./EndGameModal.svelte";
  import Header from "./Header.svelte";
  import { setAdminPassword } from "./socket/trivia/admin_rpcs";

  let password: string = "";
  let confirmPassword: string = "";

  let isEndGame = false;

  $: passwordInvalid = password !== confirmPassword;
  $: visiblePasswordInvalid = confirmPassword && passwordInvalid;

  async function callChangePassword() {
    await client.call(setAdminPassword, { adminPassword: password });
    window.localStorage.clear();
    window.location.reload();
  }

  async function endGame() {
    isEndGame = true;
  }
</script>

<div>
  <Header>Settings</Header>
  <div class="settings">
    <PasswordInput
      labelText="Password"
      placeholder="Enter new password..."
      invalid={visiblePasswordInvalid}
      invalidText="Passwords do not match"
      bind:value={password}
    />
    <PasswordInput
      labelText="Confirm"
      placeholder="Enter new password..."
      invalid={visiblePasswordInvalid}
      invalidText="Passwords do not match"
      bind:value={confirmPassword}
    />
    <Button
      disabled={passwordInvalid}
      kind="secondary"
      on:click={callChangePassword}>Change Password</Button
    >
    <br />
    {#if isEndGame}
      <EndGameModal
        on:close={() => {
          isEndGame = false;
        }}
      />
    {/if}
    <Button kind="danger" on:click={endGame}>END GAME</Button>
  </div>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
