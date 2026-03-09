import { useState, useCallback } from 'react';

/**
 * Hook to manage unsaved changes confirmation when closing modals.
 * 
 * Usage:
 *   const { handleClose, showConfirm, confirmClose, cancelClose } = useUnsavedChanges(onClose, isDirty);
 *   
 *   - Use `handleClose` as your close handler (X button, backdrop click, Cancel button)
 *   - Render ConfirmationModal with `showConfirm`, `confirmClose`, `cancelClose`
 */
export function useUnsavedChanges(onClose: () => void, isDirty: boolean) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClose = useCallback(() => {
        if (isDirty) {
            setShowConfirm(true);
        } else {
            onClose();
        }
    }, [isDirty, onClose]);

    const confirmClose = useCallback(() => {
        setShowConfirm(false);
        onClose();
    }, [onClose]);

    const cancelClose = useCallback(() => {
        setShowConfirm(false);
    }, []);

    return { handleClose, showConfirm, confirmClose, cancelClose };
}
