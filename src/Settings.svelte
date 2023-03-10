<script lang="ts">
  import { Button, Dropdown, PasswordInput, TextInput } from "carbon-components-svelte";
  import { Link, navigate } from "svelte-routing";
    import { derived } from "svelte/store";
  import { client, order } from "./client";
  import EndGameModal from "./EndGameModal.svelte";
  import Header from "./Header.svelte";
  import { setAdminPassword, setGameState, startForceRefresh } from "./socket/trivia/admin_rpcs";

  let password: string = "";
  let confirmPassword: string = "";
  
  let isEndGame = false;

  $: passwordInvalid = password !== confirmPassword;
  $: visiblePasswordInvalid = confirmPassword && passwordInvalid;

  export const DEFAULT_GAME_SETTINGS = { _id: 'MAIN', state: 'notActive' };
  const gameSettings = derived([client, order], ([{ gameSettings }, order]) => {
    return gameSettings?.entities[DEFAULT_GAME_SETTINGS._id] || DEFAULT_GAME_SETTINGS;
  });
  
  $: originalGameState = $gameSettings.state;
  let gameState = "";
  $: {
    gameState = originalGameState;
  }

  async function callChangePassword() {
    await client.call(setAdminPassword, { adminPassword: password });
    window.localStorage.clear();
    window.location.reload();
  }
  async function callSetState() {
    await client.call(setGameState, { state: gameState });
  }

  async function callForceRefresh() {
    await client.call(startForceRefresh, { state: gameState });
  }

  async function endGame() {
    isEndGame = true;
  }
</script>

<div>
  <Header>Settings</Header>
  
  <div class="settings">
    <div class="Spacing"/>
    <Dropdown 
      titleText="Game State"
      items={[
        { id: "notActive", text: "Not Active" },
        { id: "active", text: "Active" },
        { id: "completed", text: "Completed" },
      ]}
      bind:selectedId={gameState}
    />
    <Button
      kind="secondary"
      on:click={callSetState}>Update State</Button
    >

    <div class="Spacing"/>
    <Button
      kind="secondary"
      on:click={callForceRefresh}>Force Refresh</Button
    >

    <div class="Spacing"/>
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
  .Spacing {
    height: 20px;
  }
</style>
