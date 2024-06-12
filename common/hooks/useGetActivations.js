import useSWR from "swr";
import { useEffect, useState } from "react";
import { convertObjectFieldNamesToCamelCase } from "@/common/utils/helpers";
import { activationsUrl } from "@/common/utils/network/endpoints";
import { fetcher } from "@/common/utils/network/baseFetcher";
import { httpRequestMethods } from "@/common/utils/network/constants";

export const useGetActivations = () => {
  const { GET } = httpRequestMethods;
  const activationsFetcher = async (key) => {
    return fetcher(key, {
      arg: {
        method: GET,
      },
    });
  }
  const [activations, setActivations] = useState([]);
  const { data, isLoading } = useSWR(activationsUrl, activationsFetcher);
  
  useEffect(() => {
    if (data?.data?.data) {
      const allowedBookings = data?.data?.data.filter((booking) => booking?.status === 'Paid' && booking.state !== 'completed');
      const allowedBookingsTransformed = convertObjectFieldNamesToCamelCase(allowedBookings);
      setActivations(allowedBookingsTransformed);
    }
  }, [data])


  return {
    isLoading,
    activations,
  }
}