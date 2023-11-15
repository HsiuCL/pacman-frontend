export const handleEnter = (cb: CallableFunction, ...args: any[]) => {
    return (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            cb(...args);
        }
    }
}