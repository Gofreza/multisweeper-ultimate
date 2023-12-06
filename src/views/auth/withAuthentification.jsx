import React, { useEffect, useState } from "react";

const withAuthentication = (WrappedComponent) => {
    return (props) => {
        const [isAuthenticated, setIsAuthenticated] = useState(null);

        useEffect(() => {
            const checkAuthentication = async () => {
                try {
                    const response = await fetch('/api/check-auth');
                    if (!response.ok) {
                        console.log('User is not authenticated');
                        setIsAuthenticated(false);
                    } else {
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Error checking authentication:', error);
                    setIsAuthenticated(false);
                }
            };

            checkAuthentication();
        }, []); // Make sure to pass an empty dependency array to useEffect

        if (isAuthenticated === null) {
            // Still checking authentication, you can render a loading indicator here
            return null;
        }

        return <WrappedComponent {...props} isAuthenticated={isAuthenticated} />;
    };
};

export default withAuthentication;
