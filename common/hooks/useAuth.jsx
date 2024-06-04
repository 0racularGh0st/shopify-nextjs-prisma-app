"use client";
export const useAuth = () => {

    const setClubhouseUser = (user) => {
       if (typeof window !== "undefined") {
         window.sessionStorage.setItem("clubhouseUser", JSON.stringify(user ?? '{}'));
        }
    }
    return {
        clubhouseUser: typeof window !== "undefined" ? JSON.parse(window.sessionStorage.getItem('clubhouseUser') ?? '{}') : null,
        setClubhouseUser,
    }
};

export default useAuth;

