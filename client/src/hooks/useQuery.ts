import { SocketClient } from "../service/SocketClient";
import { useAsync } from "./useAsync";

export function useQuery<T>(payload: SocketClient.QueryPayload) {
  return useAsync<T>(() => SocketClient.instance.query<T>(payload));
}
