"use client";
import { useState } from "react";
import { handleResponse } from "@/common/utils/network/responseHandler";
import { convertObjectFieldNamesToCamelCase } from "@/common/utils/helpers";
import { signInUrl } from "@/common/utils/network/endpoints";

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signin = async (data) => {
    setIsLoading(true);
    const res = await fetch(signInUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      const {
        code, response,
      } = await handleResponse(res);
      const user = response;
      if (code === 200 && user) {
        setIsLoading(false);
        return convertObjectFieldNamesToCamelCase(user.data);
      }
      setIsLoading(false);
      return null
  };

  return {
    signin,
    isLoading,
  }
}

export default useSignIn;