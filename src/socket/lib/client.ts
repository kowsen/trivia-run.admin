import type { Action } from '@reduxjs/toolkit';
import io, { type ManagerOptions, Socket, type SocketOptions } from 'socket.io-client';
import { writable, type Readable } from 'svelte/store';
import { RPC, rpcResponseValidator } from './rpc';
import { stringField, unknownField, validate } from './validator';

const REQUEST_TIMEOUT = 5000;

const actionValidator = {
  type: stringField,
  payload: unknownField,
};

interface PromiseHandle {
  resolve: (result: unknown) => void;
  reject: (error: unknown) => void;
}

export class GameClient<TGameState> {
  private readonly client: Socket;
  private readonly pendingCalls = new Map<string, PromiseHandle>();
  private state: TGameState;
  private readonly stateListeners: Array<(state: TGameState) => void> = [];
  private _connected = writable(false);

  public get connected(): Readable<boolean> {
    return this._connected;
  }

  constructor(
    path: string,
    reducer: (prevState: TGameState | undefined, action: Action<unknown> | Action) => TGameState,
    onConnect: (client: Socket) => void,
    options: Partial<ManagerOptions & SocketOptions> = {},
  ) {
    this.state = reducer(undefined, { type: 'INITIALIZE_REDUCER_ACTION' });

    this.client = io(path, options);

    this.client.on('rpc', (value: unknown) => {
      if (validate(value, rpcResponseValidator)) {
        const pendingCall = this.pendingCalls.get(value.id);
        if (pendingCall) {
          if (value.error) {
            pendingCall.reject(value.error);
          } else if (value.result) {
            pendingCall.resolve(value.result);
          } else {
            pendingCall.reject('Invalid response');
          }
        }
      }
    });

    this.client.on('action', (action: unknown) => {
      if (!validate(action, actionValidator)) {
        throw new Error('Received invalid action message');
      }
      this.state = reducer(this.state, action);
      for (const listener of this.stateListeners) {
        listener(this.state);
      }
    });

    this.client.on('connect', () => {
      this._connected.set(true);
      onConnect(this.client);
    });

    this.client.on('disconnect', () => {
      this._connected.set(false);
    });
  }

  public async call<TParams extends object, TResult extends object>(
    rpc: RPC<TParams, TResult>,
    params: TParams,
  ): Promise<TResult> {
    const call = rpc.buildCall(params);

    const result = await new Promise<unknown>((resolve, reject) => {
      const resolveAndClear = (value: unknown) => {
        clearTimeout(timeout);
        this.pendingCalls.delete(call.id);
        resolve(value);
      };

      const rejectAndClear = (error: unknown) => {
        clearTimeout(timeout);
        this.pendingCalls.delete(call.id);
        reject(error);
      };

      const timeout = setTimeout(() => {
        rejectAndClear('timeout');
      }, REQUEST_TIMEOUT);

      this.pendingCalls.set(call.id, { resolve: resolveAndClear, reject: rejectAndClear });

      this.client.emit('rpc', call);
    });

    if (!rpc.validateResult(result)) {
      throw new Error('Result does not match RPC definition.');
    }

    return result;
  }

  public subscribe(listener: (state: TGameState) => void): () => void {
    this.stateListeners.push(listener);
    listener(this.state);
    return () => {
      const index = this.stateListeners.indexOf(listener);
      if (index !== -1) {
        this.stateListeners.splice(index, 1);
      }
    };
  }
}
