import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Notes from './components/Notes';

const App = () => {
    const [user, setUser] = useState(null);

    if (user) {
        return <Notes />;
    }

    return (
        <div>
            <h1>Note App</h1>
            <Login setUser={setUser} />
            <Register setUser={setUser} />
        </div>
    );
};

export default App;
