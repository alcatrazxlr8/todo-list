import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const TodoList = () => {
	// Local state still used for rendering and user interactions
	const [tasks, setTasks] = useState<string[]>([]);
	const [newTask, setnewTask] = useState('');

	// Firestore doc reference (change "myTasks" to something unique if needed)
	const docRef = doc(db, "todoLists", "myTasks");

	// 1. Load tasks from Firestore on mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					// Firestore doc has { tasks: string[] }
					const data = docSnap.data();
					if (data.tasks) {
						setTasks(data.tasks);
					}
				} else {
					// If no doc exists yet, create one with our default tasks
					await setDoc(docRef, { tasks });
				}
			} catch (error) {
				console.error("Error loading tasks from Firestore:", error);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// 2. Whenever we update tasks in local state, also sync them to Firestore
	const syncTasks = async (updatedTasks: string[]) => {
		try {
			await setDoc(docRef, { tasks: updatedTasks });
		} catch (error) {
			console.error("Error updating tasks in Firestore:", error);
		}
	};

	// Original code: handle input
	function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
		setnewTask(event.target.value);
	}

	// Original code: add a task
	function addTask() {
		if (newTask.trim() !== "") {
			const updated = [...tasks, newTask];
			setTasks(updated);
			setnewTask('');
			// Sync with Firestore
			syncTasks(updated);
		}
	}

	// Original code: delete a task
	function deleteTask(index: number) {
		const updatedTasks = tasks.filter((_, i) => i !== index);
		setTasks(updatedTasks);
		syncTasks(updatedTasks);
	}

	// Original code: move task up
	function moveTaskUp(index: number) {
		if (index > 0) {
			const updatedTasks = [...tasks];
			[updatedTasks[index], updatedTasks[index - 1]] = [updatedTasks[index - 1], updatedTasks[index]];
			setTasks(updatedTasks);
			syncTasks(updatedTasks);
		}
	}

	// Original code: move task down
	function moveTaskDown(index: number) {
		if (index < tasks.length - 1) {
			const updatedTasks = [...tasks];
			[updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
			setTasks(updatedTasks);
			syncTasks(updatedTasks);
		}
	}

	return (
		<div className='todo-list'>
			<h1>Todo List</h1>
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
