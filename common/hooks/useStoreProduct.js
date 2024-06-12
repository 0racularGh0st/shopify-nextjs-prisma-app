import useSWRMutation from "swr/mutation";
import { storeProductUrl } from "@/common/utils/network/endpoints";
import { fetcher } from "@/common/utils/network/baseFetcher";
import {
  httpRequestMethods,
} from "@/common/utils/network/constants";

const { POST } = httpRequestMethods;


const storeProductFetcher = async (key, { arg }) => {
  return fetcher(key, {
    arg: {
      method: POST,
      body: arg.body,
    },
  });
}

export const useStoreProduct = () => {

  const { 
    trigger, isMutating: isStoringProduct,
  } = useSWRMutation(storeProductUrl, storeProductFetcher);
    
  const storeProduct = async (data) => {
    try {
      const result = await trigger({ body: data });
      return result;
    } catch (error) {
     console.error(error, "Failed to store product");
    }
  };
    
  return {
    isStoringProduct,
    storeProduct,
  }
}