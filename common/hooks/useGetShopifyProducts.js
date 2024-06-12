import useSWR from "swr";
import { useEffect, useState } from "react";
import { convertObjectFieldNamesToCamelCase } from "@/common/utils/helpers";
import { getShopifyProductsUrl } from "@/common/utils/network/endpoints";
import { fetcher } from "@/common/utils/network/baseFetcher";
import { httpRequestMethods } from "@/common/utils/network/constants";

export const useGetShopifyProducts = () => {
  const { GET } = httpRequestMethods;
  const shopifyProductsFetcher = async (key) => {
    return fetcher(key, {
      arg: {
        method: GET,
      },
    });
  }
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const { data, isLoading, mutate } = useSWR(getShopifyProductsUrl, shopifyProductsFetcher);
  
  useEffect(() => {
    if(data?.data) {
      setShopifyProducts(convertObjectFieldNamesToCamelCase(data?.data ?? {}));
    }
  }, [data])


  return {
    isLoading,
    shopifyProducts,
    refetchShopifyProducts: mutate,
  }
}