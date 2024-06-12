import useSWRMutation from "swr/mutation";
import { updateProductUrl } from "@/common/utils/network/endpoints";
import { fetcher } from "@/common/utils/network/baseFetcher";
import {
  httpRequestMethods,
} from "@/common/utils/network/constants";
import { convertObjectFieldNamesFromCamelCaseToSnakeCase } from "../utils/helpers";

const { POST } = httpRequestMethods;


const updateProductFetcher = async (key, { arg }) => {
  return fetcher(key, {
    arg: {
      method: POST,
      body: convertObjectFieldNamesFromCamelCaseToSnakeCase(arg.body),
    },
  });
}

export const useUpdateProduct = () => {

  const { 
    trigger, isMutating: isUpdatingProduct,
  } = useSWRMutation(updateProductUrl, updateProductFetcher);
    
  const updateProduct = async (data) => {
    try {
      const result = await trigger({ body: data });
      return result;
    } catch (error) {
     console.error(error, "Failed to store product");
    }
  };
    
  return {
    isUpdatingProduct,
    updateProduct,
  }
}