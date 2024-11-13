import {useEffect, useState} from "react";

export function useLocalStorageState(initialState, key) {
    const [value, setValue] = useState(() => {
        // initial value set only on the first render
        return JSON.parse(localStorage.getItem(key)) ?? initialState;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [value, key]);

    return [value, setValue];
}