import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../FirebaseConfig";

// Fetch todos for the logged-in user
export const fetchTodos = async (userId: string) => {
	const q = query(collection(db, "todos"), where("userId", "==", userId));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add a new todo
export const addTodo = async (userId: string, text: string) => {
	await addDoc(collection(db, "todos"), { userId, text, completed: false });
};

// Toggle a todo's completion status
export const toggleTodo = async (todoId: string, completed: boolean) => {
	await updateDoc(doc(db, "todos", todoId), { completed });
};

// Delete a todo
export const deleteTodo = async (todoId: string) => {
	await deleteDoc(doc(db, "todos", todoId));
};
