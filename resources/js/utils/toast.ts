export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const event = new CustomEvent('show-toast', { detail: { message, type } });
    window.dispatchEvent(event);
};
