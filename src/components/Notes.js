import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notes = () => {
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.get('http://localhost:3001/notes', { withCredentials: true });
                setNotes(response.data);
            } catch (error) {
                console.error('Error fetching notes', error);
            }
        };

        fetchNotes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/notes', { note }, { withCredentials: true });
            setNotes([...notes, response.data]);
            setNote('');
        } catch (error) {
            console.error('Error adding note', error);
        }
    };

    const handleDelete = async (noteId) => {
        console.log('Deleting note with ID:', noteId); // Log the note ID
        try {
            await axios.delete(`http://localhost:3001/notes/${noteId}`, { withCredentials: true });
            setNotes(notes.filter(n => n._id !== noteId));
        } catch (error) {
            console.error('Error deleting note', error);
        }
    };
    

    return (
        <div className="container">
            <h2>Notes</h2>
            <form onSubmit={handleSubmit}>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write your note here" required />
                <button type="submit">Add Note</button>
            </form>
            <div>
                {notes.map((n, index) => (
                    <div className="note" key={n._id}>
                        {n.content}
                        <button className="delete-button" onClick={() => handleDelete(n._id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notes;
