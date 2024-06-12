import useAuth from "@/common/hooks/useAuth";
import { handleResponse, handleResponseError, handleFetcherError } from "./responseHandler";
import {
    httpResponseStatuses,
} from "@/common/utils/network/constants";

const baseHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

const {
  UNAUTHORIZED, BAD_REQUEST,
} = httpResponseStatuses;

const getTokenFromSession = () => {
    const { clubhouseUser, setClubhouseUser } = useAuth();
    return clubhouseUser?.token ?? '';
}
export async function fetcher (
    key,
    options,
  ) {
    const { setClubhouseUser } = useAuth();
    try {
      const token = await getTokenFromSession();
      const authHeader = { Authorization: `Bearer ${token}` };
      const requestHeaders = {
        ...baseHeaders,
        ...authHeader,
        ...options?.arg.headers,
      };
  
      const response = await fetch(key, {
        ...options?.arg,
        ...(options?.arg?.body ? { body: JSON.stringify(options.arg.body) } : {}),
        headers: requestHeaders,
      });
  
      if (response.status === UNAUTHORIZED) {
        setClubhouseUser('{}');
      }
  
      if (response.status >= BAD_REQUEST) {
        await handleResponseError(response);
      }
  
      const responseJson = await response.json();
      return {
        ...responseJson,
        code: response.status,
      };
    } catch (error) {
      console.error({ error });
      return handleFetcherError(error)
    }
  }