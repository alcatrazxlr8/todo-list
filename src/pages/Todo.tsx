import { useAuth } from "../context/AuthContext";
import { logOut } from "../../AuthService";
import { useNavigate } from "react-router-dom";

const Todo = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logOut();
		navigate("/", { replace: true }); // Redirect to login page after logout
	};

	return (
		<div className="flex flex-col items-center mt-10">
			<h1 className="text-2xl font-bold mb-4">Your To-Do List</h1>
			{user && <p>Welcome, {user.displayName}!</p>}

			{/* Logout Button */}
			<button
				onClick={handleLogout}
				className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
			>
				Logout
			</button>

			{/* To-Do items will go here later */}
			<p>(To-Do items will go here)</p>
		</div>
	);
};

export default Todo;
