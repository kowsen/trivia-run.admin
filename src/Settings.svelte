<script lang="ts">
  import { Button, PasswordInput, TextInput } from "carbon-components-svelte";
  import { Link, navigate } from "svelte-routing";
  import { client } from "./client";
  import Header from "./Header.svelte";
  import { setAdminPassword } from "./socket/trivia/admin_rpcs";

  let password: string = "";
  let confirmPassword: string = "";

  $: passwordInvalid = password !== confirmPassword;
  $: visiblePasswordInvalid = confirmPassword && passwordInvalid;

  async function callChangePassword() {
    await client.call(setAdminPassword, { password });
    window.localStorage.clear();
    window.location.reload();
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
  </div>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
