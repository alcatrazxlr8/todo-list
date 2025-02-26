import { useState, useEffect } from 'react';
import {
	collection,
	query,
	orderBy,
	getDocs,
	addDoc,
	deleteDoc,
	doc,
	// updateDoc,
	writeBatch
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useAuth } from "../context/AuthContext";

type Task = {
	id: string;
	text: string;
	index: number;
};

const TodoList = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [newTask, setNewTask] = useState('');
	const [loading, setLoading] = useState(true);
	const { user, loading: userLoading } = useAuth();
	// userLoading is the auth loading state; user is the logged-in user

	// 1. On mount (and whenever user changes), fetch tasks from sub-collection
	useEffect(() => {
		if (userLoading) return;            // Wait for auth to finish
		if (!user) {
			setTasks([]);                    // If no user, reset tasks
			setLoading(false);
			return;
		}

		const fetchTasks = async () => {
			setLoading(true);
			try {
				// Sub-collection path: /users/{uid}/tasks
				const tasksCollection = collection(db, "users", user.uid, "tasks");
				const q = query(tasksCollection, orderBy("index", "asc"));
				const querySnapshot = await getDocs(q);

				const fetched: Task[] = [];
				querySnapshot.forEach((docSnap) => {
					const data = docSnap.data();
					fetched.push({
						id: docSnap.id,
						text: data.text,
						index: data.index,
					});
				});

				setTasks(fetched);
			} catch (error) {
				console.error("Error fetching tasks:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTasks();
	}, [user, userLoading]);

	// 2. When we add a new task, create a new doc with the next available index
	const addTask = async () => {
		if (!user) return;
		if (newTask.trim() === "") return;

		// index = tasks.length (put this new item at bottom)
		const newIndex = tasks.length;

		try {
			const tasksCollection = collection(db, "users", user.uid, "tasks");
			await addDoc(tasksCollection, {
				text: newTask,
				index: newIndex,
			});

			refetchTasks();

			setNewTask("");
		} catch (error) {
			console.error("Error adding task:", error);
		}
	};

	// 3. Delete a task doc
	const deleteTask = async (taskId: string) => {
		if (!user) return;

		try {
			const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);
			await deleteDoc(taskDocRef);
			refetchTasks(); // or update local state
		} catch (error) {
			console.error("Error deleting task:", error);
		}
	};

	// 4. Move task up
	const moveTaskUp = (index: number) => {
		if (index === 0) return; // already at top
		const newIndex = index - 1;
		reorderTasks(index, newIndex);
	};

	// 5. Move task down
	const moveTaskDown = (index: number) => {
		if (index === tasks.length - 1) return; // at bottom
		const newIndex = index + 1;
		reorderTasks(index, newIndex);
	};

	// 6. Reorder tasks in local state and Firestore
	const reorderTasks = async (oldIndex: number, newIndex: number) => {
		if (!user) return;

		// 6.1 - Reorder in local state
		// - We'll update tasks array in memory
		const updated = [...tasks];
		// find the item with the oldIndex
		const item = updated.find((t) => t.index === oldIndex);
		if (!item) return; // safety

		// find the item that currently has newIndex
		const swappedItem = updated.find((t) => t.index === newIndex);
		if (!swappedItem) return;

		// swap the index fields
		const oldIndexVal = item.index;
		item.index = swappedItem.index;
		swappedItem.index = oldIndexVal;

		// reorder the array by the index after swap
		updated.sort((a, b) => a.index - b.index);
		setTasks(updated);

		// 6.2 - Update Firestore
		// We'll do a batch update of the two docs whose index changed
		try {
			const batch = writeBatch(db);

			const itemDocRef = doc(db, "users", user.uid, "tasks", item.id);
			batch.update(itemDocRef, { index: item.index });

			const swappedItemDocRef = doc(db, "users", user.uid, "tasks", swappedItem.id);
			batch.update(swappedItemDocRef, { index: swappedItem.index });

			await batch.commit();
		} catch (error) {
			console.error("Error reordering tasks in Firestore:", error);
		}
	};

	// Utility function to re-fetch tasks from Firestore
	const refetchTasks = async () => {
		if (!user) return;
		const tasksCollection = collection(db, "users", user.uid, "tasks");
		const q = query(tasksCollection, orderBy("index", "asc"));
		const querySnapshot = await getDocs(q);

		const fetched: Task[] = [];
		querySnapshot.forEach((docSnap) => {
			const data = docSnap.data();
			fetched.push({
				id: docSnap.id,
				text: data.text,
				index: data.index,
			});
		});
		setTasks(fetched);
	};

	// 7. UI
	if (userLoading || loading) {
		return <p>Loading tasks...</p>;
	}

	if (!user) {
		return <p>Please log in to see your tasks.</p>;
	}

	return (
		<div className='todo-list'>
			<h1>Todo List</h1>
			<div>
				<input
					type="text"
					placeholder='Enter Task Item'
					value={newTask}
					onChange={(e) => setNewTask(e.target.value)}
				/>
				<button className="add-button" onClick={addTask}>Add</button>
			</div>
			<ul className="list-group">
				{tasks.map((task) => (
					<li className='list-group-item' key={task.id}>
						<span className='text'>{task.text}</span>

						{/* 
              Move Up/Down buttons rely on 'task.index'. 
              For example, if task.index=0 => disable 'Up' 
              If task.index=tasks.length-1 => disable 'Down' 
            */}
						<button
							disabled={task.index === 0}
							className="btn btn-info move-button"
							onClick={() => moveTaskUp(task.index)}
						>
							Up
						</button>
						<button
							disabled={task.index === tasks.length - 1}
							className="btn btn-info move-button"
							onClick={() => moveTaskDown(task.index)}
						>
							Down
						</button>
						<button
							className="btn btn-warning delete-button"
							onClick={() => deleteTask(task.id)}
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
