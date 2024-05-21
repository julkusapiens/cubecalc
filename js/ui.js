import {ROTATION_TOGGLE} from "./domElements.js";

export const toggleAnimation = () => {
    ROTATION_TOGGLE.setAttribute('disabled', '');

    const oldSymbol = ROTATION_TOGGLE.innerText;
    ROTATION_TOGGLE.innerText = oldSymbol === '⏸' ? '▶' : '⏸';

    ROTATION_TOGGLE.removeAttribute('disabled');
}