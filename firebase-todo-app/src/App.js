import { useState, useEffect } from 'react';
import './App.css';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

function App() {
  const [todo, setTodo] = useState('');
  const [todos, setTodos] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchTodos(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTodos([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (todo !== '' && user) {
      try {
        await addDoc(collection(db, 'todos'), {
          text: todo,
          completed: false,
          userId: user.uid,
          timestamp: new Date()
        });
        setTodo('');
        fetchTodos(user.uid);
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const fetchTodos = async (userId) => {
    try {
      const q = query(collection(db, 'todos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const todoList = [];
      querySnapshot.forEach((doc) => {
        todoList.push({ id: doc.id, ...doc.data() });
      });
      setTodos(todoList);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const toggleComplete = async (todoId, currentStatus) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        completed: !currentStatus
      });
      fetchTodos(user.uid);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleEdit = async (todoId) => {
    if (editText.trim() !== '') {
      try {
        const todoRef = doc(db, 'todos', todoId);
        await updateDoc(todoRef, {
          text: editText
        });
        setEditingId(null);
        setEditText('');
        fetchTodos(user.uid);
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const handleDelete = async (todoId) => {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
      fetchTodos(user.uid);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="auth-container">
          <h1 className="auth-title">Todo App</h1>
          <div className="auth-box">
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            <form onSubmit={handleAuth} className="auth-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
              <button type="submit" className="auth-button">
                {isRegistering ? 'Register' : 'Login'}
              </button>
            </form>
            <button
              className="switch-auth"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="app-container">
        <div className="header">
          <h1>Todo App</h1>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="todo-form">
          <input
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            placeholder="Add a new todo"
            className="todo-input"
          />
          <button type="submit" className="add-button">Add Todo</button>
        </form>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              {editingId === todo.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-input"
                  />
                  <div className="edit-buttons">
                    <button onClick={() => handleEdit(todo.id)} className="save-button">Save</button>
                    <button onClick={() => setEditingId(null)} className="cancel-button">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="todo-content">
                  <div className="todo-left">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id, todo.completed)}
                      className="todo-checkbox"
                    />
                    <span className="todo-text">{todo.text}</span>
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => startEditing(todo)} className="edit-button">Edit</button>
                    <button onClick={() => handleDelete(todo.id)} className="delete-button">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;