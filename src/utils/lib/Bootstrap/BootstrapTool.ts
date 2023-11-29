import { Popover } from "bootstrap";

export const triggerPopover = () => {
    let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    let popoverList = popoverTriggerList.map((popoverTriggerEl) => {
        return new Popover(popoverTriggerEl,{
            html: true
        })
    });
}