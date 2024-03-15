// @ts-ignore
import { Plugin, ref } from "vue";
import { Options } from "./options";
import { connect } from "sync-client";

let idbxConnectionManager: Awaited<ReturnType<typeof connect>> | null = null;
let connectionPromise: Promise<any> | null = null;

const SYNC_COUNT = ref(0);
const NETWORK_STATE = ref(navigator.onLine ? "online" : "offline");

export const vueSyncClientPlugin: Plugin<Options> = {
  async install(app, options) {
    connectionPromise = connect(options.dbVersion, options.schema);

    idbxConnectionManager = await connectionPromise;

    if (options.onSync) {
      idbxConnectionManager.onSync(options.onSync);
    }

    idbxConnectionManager.onSyncState((state, syncCount) => {
      SYNC_COUNT.value = syncCount;
      NETWORK_STATE.value = state;

      if (options.onSyncState) options.onSyncState(state, syncCount);
    });

    app.provide("idbxConnectionManager", idbxConnectionManager);
  },
};

export async function useIdbxConnectionManager() {
  await connectionPromise;
  return idbxConnectionManager!;
}

export function useSyncState() {
  return { syncCount: SYNC_COUNT, networkState: NETWORK_STATE };
}
