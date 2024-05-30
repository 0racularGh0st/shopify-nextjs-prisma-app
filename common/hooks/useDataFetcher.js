import { useState } from "react";
  
export const useDataFetcher = (initialState, url) => {
    const [data, setData] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = async (options) => {
      setIsLoading(true);
      const result = await (await fetch(url, options)).json();
      setData(result);
      setIsLoading(false);
      return result;
    };
  
    return [data, fetchData, isLoading];
  };

export default useDataFetcher;

  