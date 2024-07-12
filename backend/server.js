const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 3001;

mongoose.connect('mongodb://localhost:27017/notesApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const noteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        req.session.userId = newUser._id;
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid username or password');
        }
        req.session.userId = user._id;
        res.status(200).send('User logged in successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in user');
    }
});

app.post('/notes', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    const { note } = req.body;
    try {
        const newNote = new Note({
            content: note,
            userId: req.session.userId,
        });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding note');
    }
});

app.get('/notes', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const notes = await Note.find({ userId: req.session.userId });
        res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching notes');
    }
});

app.delete('/notes/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (note) {
            res.status(200).send('Note deleted successfully');
        } else {
            res.status(404).send('Note not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting note');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
