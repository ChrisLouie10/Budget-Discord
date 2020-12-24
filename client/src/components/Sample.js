// example component for all pages requiring/showing authorization or login

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Sample() {
    const { currentUser } = useAuth();

    return (
        <div>
            
        </div>
    );
}
