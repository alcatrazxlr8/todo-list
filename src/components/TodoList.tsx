import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useAuth } from "../context/AuthContext";

const TodoList = () => {
	const { user, loading } = useAuth();  // Get current user + loading state from AuthContext
	const [tasks, setTasks] = useState<string[]>([]);
	const [newTask, setNewTask] = useState('');
	const [error, setError] = useState("");

	// We'll only create/use a docRef if user is logged in
	const docRef = user ? doc(db, "todoLists", user.uid) : null;

	// 1. Load user-specific tasks from Firestore on mount (or when `user` changes)
	useEffect(() => {
		// If still loading or user is not logged in, do nothing
		if (loading || !user) return;

		const fetchData = async () => {
			try {
				const docSnap = await getDoc(docRef!); // docRef is never null if user is defined
				if (docSnap.exists()) {
					// If the doc exists, load tasks from Firestore
					const data = docSnap.data();
					if (data.tasks) {
						setTasks(data.tasks);
					}
				} else {
					// If no doc exists for this user, create one with your default tasks
					await setDoc(docRef!, { tasks });
				}
			} catch (error) {
				console.error("Error loading tasks from Firestore:", error);
				setError("Failed to load tasks");
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, loading]);

	// Whenever we update tasks in local state, also sync them to Firestore
	const syncTasksToFirestore = async (updatedTasks: string[]) => {
		if (!docRef) return; // If user is null, skip
		try {
			await setDoc(docRef, { tasks: updatedTasks });
		} catch (err) {
			console.error("Error updating tasks in Firestore:", err);
			setError("Failed to update tasks");
		}
	};

	function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		setNewTask(event.target.value);
	}

	function addTask() {
		if (newTask.trim() !== "") {
			const updatedTasks = [...tasks, newTask];
			setTasks(updatedTasks);
			setNewTask('');
			// Sync with Firestore
			syncTasksToFirestore(updatedTasks);
		}
	}

	function deleteTask(index: number) {
		const updatedTasks = tasks.filter((_, i) => i !== index);
		setTasks(updatedTasks);
		syncTasksToFirestore(updatedTasks);
	}

	function moveTaskUp(index: number) {
		if (index > 0) {
			const updatedTasks = [...tasks];
			[updatedTasks[index], updatedTasks[index - 1]] = [updatedTasks[index - 1], updatedTasks[index]];
			setTasks(updatedTasks);
			syncTasksToFirestore(updatedTasks);
		}
	}

	function moveTaskDown(index: number) {
		if (index < tasks.length - 1) {
			const updatedTasks = [...tasks];
			[updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
			setTasks(updatedTasks);
			syncTasksToFirestore(updatedTasks);
		}
	}

	// If we're still loading auth or user is not logged in, show a fallback
	if (loading) return <p>Loading user...</p>;
	if (!user) return <p>Please log in to view your tasks.</p>;

	return (
		<div className='todo-list'>
			<h1>Todo List</h1>
			{error && <p style={{ color: 'red' }}>{error}</p>}

			<div>
				<input
					type="text"
					placeholder='Enter Task Item'
					value={newTask}
					onChange={handleInputChange}
				/>
				<button className="add-button" onClick={addTask}>Add</button>
			</div>

			<ul className="list-group">
				{tasks.map((task, index) => (
					<li className='list-group-item' key={index}>
						<span className='text'>{task}</span>
						<button
							disabled={index === 0}
							className="btn btn-info move-button"
							onClick={() => moveTaskUp(index)}
						>
							Up
						</button>
						<button
							disabled={index === tasks.length - 1}
							className="btn btn-info move-button"
							onClick={() => moveTaskDown(index)}
						>
							Down
						</button>
						<button
							className="btn btn-warning delete-button"
							onClick={() => deleteTask(index)}
						>
							Delete
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default TodoList;
