<script lang="ts">
  import "carbon-components-svelte/css/g80.css";

  import "./styles/global.scss";
  // import './styles/scale.scss';
  // import './styles/scroll.scss';

  import { Router, Route } from "svelte-routing";

  import Login from "./Login.svelte";
  import Home from "./Home.svelte";
  import MainQuestions from "./MainQuestions.svelte";
  import BonusQuestions from "./BonusQuestions.svelte";
  import { client, upgrade } from "./client";
  import EditQuestion from "./EditQuestion.svelte";
  import Teams from "./Teams.svelte";
  import EditTeam from "./EditTeam.svelte";
  import Settings from "./Settings.svelte";

  export let url;

  // new ResizeObserver(([event]) => {
  //   document.documentElement.style.setProperty('--page-width', `${event.contentRect.width}`);
  // }).observe(document.documentElement);

  $: connected = client.connected;
</script>

{#if $connected}
  <div class="content">
    <Router {url}>
      <main>
        <Route path="/login" component={Login} />
        <Route path="/" component={Home} />

        <Route path="/main-questions" component={MainQuestions} />
        <Route path="/bonus-questions" component={BonusQuestions} />

        <Route path="/teams" component={Teams} />

        <Route path="/question/edit/:id" let:params>
          <EditQuestion questionId={params.id} />
        </Route>

        <Route path="/team/edit/:id" let:params>
          <EditTeam teamId={params.id} />
        </Route>

        <Route path="/settings" component={Settings} />

        <Route>
          <p>PAGE NOT FOUND</p>
        </Route>
      </main>
    </Router>
  </div>
{:else}
  <p>Connecting...</p>
{/if}

<style>
  .content {
    padding: 24px;
  }
</style>
