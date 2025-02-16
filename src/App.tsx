import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Todo from "./pages/Todo";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
	console.log("✅ App.tsx loaded");

	return (
		<Routes>
			<Route path="/" element={<Login />} />
			{/* Protected Route for To-Do Page */}
			<Route element={<ProtectedRoute />}>
				<Route path="/todo" element={<Todo />} />
			</Route>
		</Routes>
	);
}

export default App;
