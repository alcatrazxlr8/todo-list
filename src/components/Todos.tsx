import { useState } from "react";

type Todo = {
	id: string;
	text: string;
	completed: boolean;
};

const Todos = () => {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [newTodo, setNewTodo] = useState("");

	const addTodo = () => {
		if (newTodo.trim() === "") return;
		setTodos([...todos, { id: Date.now().toString(), text: newTodo, completed: false }]);
		setNewTodo("");
	};

	const toggleTodo = (id: string) => {
		setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
	};

	const deleteTodo = (id: string) => {
		setTodos(todos.filter(todo => todo.id !== id));
	};

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold mb-4">To-Do List</h2>
			<input
				value={newTodo}
				onChange={(e) => setNewTodo(e.target.value)}
				placeholder="Add a new task"
				className="border p-2"
			/>
			<button onClick={addTodo} className="ml-2 px-4 py-2 bg-green-500 text-white">Add</button>

			<ul className="mt-4">
				{todos.map(todo => (
					<li key={todo.id} className="flex items-center space-x-2">
						<input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
						<span className={todo.completed ? "line-through" : ""}>{todo.text}</span>
						<button onClick={() => deleteTodo(todo.id)} className="ml-2 text-red-500">Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Todos;
