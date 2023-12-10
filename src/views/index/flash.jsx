// FlashMessage.js
import React, { useState, useEffect } from 'react';

const FlashMessage = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 3000); // Adjust the timeout duration as needed

        return () => clearTimeout(timer);
    }, [onClose]);

    return visible ? (
        <div className={`flash-message ${type}`}>
            <p>{message}</p>
        </div>
    ) : null;
};

export default FlashMessage;
