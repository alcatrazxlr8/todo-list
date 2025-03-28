import { useAuth } from "../context/AuthContext";
import { logOut } from "../../AuthService";
import { useNavigate } from "react-router-dom";
import TodoList from "../components/TodoList";
// import Todos from "../components/Todos";

const Todo = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logOut();
		navigate("/", { replace: true }); // Redirect to login page after logout
	};

	return (
		<div className="container mt-5 d-flex flex-column align-items-center">
			{/* Optional title */}
			{/* <h1 className="h4 mb-4">Your To-Do List</h1> */}

			{/* Show welcome message if user is defined */}
			{user && <h2 className="mb-2">Welcome, {user.displayName}!</h2>}

			{/* Bootstrap logout button */}
			<button
				onClick={handleLogout}
				className="btn btn-outline-danger btn-lg mb-4"
				style={{ maxWidth: "200px", width: "100%" }}
			>
				<b>Log Out</b>
			</button>

			{/* To-Do List component */}
			<TodoList />
		</div>
	);
};

export default Todo;
