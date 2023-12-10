import React, { useEffect, useState } from "react";

const withNotAuthentication = (WrappedComponent) => {
    return (props) => {
        const [isAuthenticated, setIsAuthenticated] = useState(null);

        useEffect(() => {
            const checkNotAuthentication = async () => {
                try {
                    const response = await fetch('/api/check-not-auth');
                    if (response.ok) {
                        console.log('User is not log in');
                        setIsAuthenticated(false);
                    } else {
                        console.log('User is log in');
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Error checking log in:', error);
                    setIsAuthenticated(false);
                }
            };

            checkNotAuthentication();
        }, []); // Make sure to pass an empty dependency array to useEffect

        if (isAuthenticated === null) {
            // Still checking authentication, you can render a loading indicator here
            return null;
        }

        return <WrappedComponent {...props} isAuthenticated={isAuthenticated} />;
    };
};

export default withNotAuthentication;
