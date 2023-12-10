import React, { useEffect, useState } from "react";

const withAuthentication = (WrappedComponent) => {
    return (props) => {
        const [isAuthenticated, setIsAuthenticated] = useState(null);
        const [role, setRole] = useState(null);

        useEffect(() => {
            const checkAuthentication = async () => {
                try {
                    const response = await fetch('/api/check-auth');
                    const responseJson = await response.json();
                    if (!response.ok) {
                        console.log('User is not authenticated');
                        setIsAuthenticated(false);
                    } else {
                        console.log('User is authenticated');
                        setIsAuthenticated(true);
                        setRole(responseJson.role);
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

        if (role === 'admin') {
            return <WrappedComponent {...props} isAuthenticated={isAuthenticated} isAdmin={true} />;
        } else {
            return <WrappedComponent {...props} isAuthenticated={isAuthenticated} isAdmin={false} />;
        }
    };
};

export default withAuthentication;
