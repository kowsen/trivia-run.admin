import type { ActionReducerMapBuilder, EntityState, EntityAdapter } from '@reduxjs/toolkit';
import * as toolkitRaw from '@reduxjs/toolkit';
import type { GameState } from './admin_rpcs';
const { combineReducers, createAction, createEntityAdapter, createReducer } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;

import type { BaseQuestion, Doc } from './base';
import type { GameGuess, GameSettings, GameTeam } from './game_state';

export interface AdminQuestion extends BaseQuestion {
  name?: string;
  answer: string;
}

export interface AdminTeam extends GameTeam {}

export interface AdminGuess extends GameGuess {
  teamId: string;
}

export interface AdminQuestionOrder extends Doc {
  main: string[];
  bonus: string[];
}


export interface AdminGameSetings extends GameSettings {
}

export interface AdminStateUpdate {
  questions?: AdminQuestion[];
  teams?: AdminTeam[];
  guesses?: AdminGuess[];
  order?: AdminQuestionOrder;
  gameSettings?: AdminGameSetings[];
}

export function checkGuess(guess: string, answer: string): boolean {
  if (!answer) {
    return false;
  }
  guess = guess.replace(/\s+/g, '');
  const answerRegex = new RegExp(answer, 'i');
  return !!guess.match(answerRegex) || !!guess.replace(/[^a-z0-9]/gi, '').match(answerRegex);
}

export const updateAdminState = createAction('admin/update', (payload: AdminStateUpdate) => ({ payload }));

function handleUpdateAdminState<TDoc extends Doc>(
  builder: ActionReducerMapBuilder<EntityState<TDoc>>,
  adapter: EntityAdapter<TDoc>,
  getDocs: (update: AdminStateUpdate) => TDoc[] | undefined,
) {
  builder.addCase(updateAdminState, (state, action) => {
    const docsToUpsert = getDocs(action.payload)?.filter(doc => {
      const existing = state.entities[doc._id];
      return !existing || existing._modified < doc._modified;
    });
    if (docsToUpsert?.length) {
      adapter.setMany(state as EntityState<TDoc>, docsToUpsert);
    }
  });
}

const questionsAdapter = createEntityAdapter<AdminQuestion>({
  selectId: model => model._id,
});

const questionsSlice = createReducer(questionsAdapter.getInitialState(), builder => {
  handleUpdateAdminState(builder, questionsAdapter, ({ questions }) => questions);
});

const teamAdapter = createEntityAdapter<AdminTeam>({
  selectId: model => model._id,
});

const teamSlice = createReducer(teamAdapter.getInitialState(), builder => {
  handleUpdateAdminState(builder, teamAdapter, ({ teams }) => teams);
});

const guessAdapter = createEntityAdapter<AdminGuess>({
  selectId: model => model._id,
});

const guessSlice = createReducer(guessAdapter.getInitialState(), builder => {
  handleUpdateAdminState(builder, guessAdapter, ({ guesses }) => guesses);
});

const orderAdapter = createEntityAdapter<AdminQuestionOrder>({
  selectId: model => model._id,
});

const orderSlice = createReducer(orderAdapter.getInitialState(), builder => {
  handleUpdateAdminState(builder, orderAdapter, (update) => (update.order ? [update.order] : undefined));
});

const gameSetingsAdapter = createEntityAdapter<AdminGameSetings>({
  selectId: model => model._id,
});

const gameSetingsSlice = createReducer(gameSetingsAdapter.getInitialState(), builder => {
  handleUpdateAdminState(builder, gameSetingsAdapter, ({gameSettings}) => gameSettings);
});


export const adminReducer = combineReducers({
  questions: questionsSlice,
  teams: teamSlice,
  guesses: guessSlice,
  order: orderSlice,
  gameSettings: gameSetingsSlice,
});
