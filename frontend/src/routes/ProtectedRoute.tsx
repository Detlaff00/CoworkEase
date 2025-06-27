
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
      
        fetch('http://localhost:3000/users/me', {
            method: 'GET',
            credentials: 'include',
        })
            .then((res) => {
                if (res.ok) {
                    setIsAuth(true);
                } else {
                    setIsAuth(false);
                }
            })
            .catch(() => {
                setIsAuth(false);
            });
    }, []);

    if (isAuth === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return isAuth ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace  />;
}