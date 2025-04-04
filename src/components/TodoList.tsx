import { useState, useEffect } from "react";
import {
	collection,
	query,
	orderBy,
	getDocs,
	addDoc,
	deleteDoc,
	doc,
	// updateDoc,
	writeBatch,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "./TodoList.css";

type Task = {
	id: string;
	text: string;
	index: number;
};

const SortableItem = ({
	id,
	children,
	onDelete,
}: {
	id: string;
	children: React.ReactNode;
	onDelete: (id: string) => void;
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: "grab",
		listStyle: "none",
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="list-group-item d-flex justify-content-between align-items-center"
		>
			<div className="d-flex align-items-center gap-2">
				<div className="drag-handle pe-2" style={{ color: "#6c757d" }}>
					⠿
				</div>
				<span>{children}</span>
			</div>

			<button
				onClick={(e) => {
					e.stopPropagation(); // Prevents click and drag propagation
					onDelete(id);
				}}
				onPointerDown={(e) => e.preventDefault()}
				className="btn btn-danger btn-sm"
				data-no-dnd="true" // Excludes delete button from dragging behaviour
			>
				Delete
			</button>
		</li>
	);
};

const TodoList = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [newTask, setNewTask] = useState("");
	const [loading, setLoading] = useState(true);
	const { user, loading: userLoading } = useAuth();
	// userLoading is the auth loading state; user is the logged-in user

	// 1. On mount (and whenever user changes), fetch tasks from sub-collection
	useEffect(() => {
		if (userLoading) return; // Wait for auth to finish
		if (!user) {
			setTasks([]); // If no user, reset tasks
			setLoading(false);
			return;
		}

		const fetchTasks = async () => {
			setLoading(true);
			try {
				// Sub-collection path: /users/{uid}/tasks
				const tasksCollection = collection(
					db,
					"users",
					user.uid,
					"tasks"
				);
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

	// Replace moveTaskUp/moveTaskDown with drag handler
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = tasks.findIndex((t) => t.id === active.id);
		const newIndex = tasks.findIndex((t) => t.id === over.id);

		// Update local state
		const newTasks = arrayMove(tasks, oldIndex, newIndex);
		setTasks(newTasks);

		// Update Firestore indices
		try {
			const batch = writeBatch(db);
			newTasks.forEach((task, index) => {
				if (task.index !== index) {
					const taskRef = doc(
						db,
						"users",
						user!.uid,
						"tasks",
						task.id
					);
					batch.update(taskRef, { index });
				}
			});
			await batch.commit();
		} catch (error) {
			console.error("Error updating indices:", error);
		}
	};

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 100,
				tolerance: 5,
				distance: 2,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

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
		<div className="container mt-5">
			<div className="card shadow">
				<div className="card-header text-center">
					<h1 className="card-title">Tasks</h1>
				</div>
				<div className="card-body">
					<div className="input-group mb-3">
						<input
							type="text"
							placeholder="Enter Task"
							value={newTask}
							onChange={(e) => setNewTask(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addTask();
								}
							}}
							className="form-control"
						/>
						<button
							onClick={addTask}
							className="btn btn-primary add-button"
							style={{ maxWidth: "100px", width: "100%" }}
						>
							Add
						</button>
					</div>

					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={tasks.map((t) => t.id)}
							strategy={verticalListSortingStrategy}
						>
							<ul
								className="list-group"
								style={{ paddingLeft: 0 }}
							>
								{tasks.map((task) => (
									<SortableItem
										key={task.id}
										id={task.id}
										onDelete={deleteTask}
									>
										{task.text}
									</SortableItem>
								))}
							</ul>
						</SortableContext>
					</DndContext>
				</div>
			</div>
		</div>
	);
};

export default TodoList;
