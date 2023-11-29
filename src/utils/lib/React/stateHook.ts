import { ChangeEvent, RefObject, SetStateAction, useEffect, useRef } from "react";

export const updateSingleValue = <T> (setStateHook: React.Dispatch<React.SetStateAction<T>>, name: string, value: any) => {
    setStateHook((prevData) => ({
        ...prevData,
        [name]: value
    })); 
}

export const useMount = (callback: React.EffectCallback) => {
    const executed = useRef(false);
    useEffect(() => {
        if (!executed.current) {
            callback();
        }
        executed.current = true;
    }, []);
    return executed.current;
}

type TElemWithTargetValue = {
    target: {
        value: string
    }
};

export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
export type TextAreaChangeEvent = ChangeEvent<HTMLTextAreaElement>;

/**
 * Change a state when an html element is changed. The new value would be the
 * element value. If "name" is given, then it will only change a part of the state.
 * @param setFunc 
 * @param name 
 * @returns 
 */
export const updateStateOnValChange = (setFunc: Function, name?: string) => {

    if (name) {
        return (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLSelectElement>) => {
            return setFunc((prevData: Record<string, any>) => {return {...prevData, [name]: event.target.value}});
        };
    }

    return (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLSelectElement>) => {
        return setFunc(event.target.value);
    };
}

/**
 * Get a reference and setting function to set the focus state of an HTMLElement.
 * Usage: `const [sthFocus, setSthFocus] = useFocus<HTMLInputElement>()`
 * @returns [ref, setRef]
 * - ref : The HTMLElement to set to focus (should beset as the ref attribute of
 * the element);
 * - setRef : The function used to set the focus state. Directly call `setFocus()`
 */
export const useFocus = <T extends HTMLElement = HTMLElement>() => {
    const elemRef = useRef<T>(null);
    const setFocus = () => {elemRef?.current?.focus()};
    return [elemRef, setFocus] as const;
}

type RefCurWithSelect = {
    current: {
        select: () => void
    } 
};

export const useSelectOnEffect = (ref: RefObject<HTMLInputElement> | RefObject<HTMLTextAreaElement>, deps: any[]) => {
    useEffect(() => {
        ref.current?.select();
    }, deps);
}