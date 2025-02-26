import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
const TodoList = () => {
	const [tasks, setTasks] = useState(["Wake Up", "Shower", "Breakfast"]);
	const [newTask, setnewTask] = useState('');
	// let isValid = false;

	function handleInputChange(event: { target: { value: React.SetStateAction<string>; }; }) {
		setnewTask(event.target.value);
	}
	function addTask() {
		if (newTask.trim() !== "") {
			setTasks([...tasks, newTask]);
			setnewTask('');
		}
	}

	function deleteTask(index: number) {
		const updatedTasks = tasks.filter((_, i) => i !== index);
		setTasks(updatedTasks);
	}

	function moveTaskUp(index: number) {
		if (index > 0) {
			const updatedTasks = [...tasks];
			[updatedTasks[index], updatedTasks[index - 1]] = [updatedTasks[index - 1], updatedTasks[index]]
			setTasks(updatedTasks);
			// isValid = Boolean(index);
		}
	}

	function moveTaskDown(index: number) {
		if (index < tasks.length - 1) {
			const updatedTasks = [...tasks];
			[updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]]
			setTasks(updatedTasks);
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
				{tasks.map((task, index) =>
					<li className='list-group-item' key={index}>
						<span className='text'>{task}</span>
						<button
							disabled={index ? false : true}
							className="btn btn-info move-button"
							onClick={() => moveTaskUp(index)}
						>
							Up
						</button>
						<button
							disabled={tasks.length - index - 1 ? false : true}
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
				)}
			</ul>
		</div>

	)
}

export default TodoList