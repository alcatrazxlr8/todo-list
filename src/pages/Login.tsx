import { useEffect, useState } from "react";
import {
	signInWithGoogle,
	// logOut,
} from "E:/Learn/React/todo-list/authService.ts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	// Redirect to `/todo` if the user is logged in
	useEffect(() => {
		if (user && !loading) {
			console.log("✅ Redirecting to /todo...");
			navigate("/todo", { replace: true }); // Avoids going back to login after redirection
		}
	}, [user, loading, navigate]);

	const handleLogin = async () => {
		setIsLoggingIn(true);
		await signInWithGoogle();
		setIsLoggingIn(false);
	};

	return (
		<div className="flex flex-col items-center mt-10">
			<h1 className="text-2xl font-bold mb-4">Login Page</h1>

			{user ? (
				<p>Redirecting...</p> // Placeholder text while redirection happens
			) : (
				<button
					onClick={handleLogin}
					className="px-4 py-2 bg-blue-500 text-white rounded"
					disabled={isLoggingIn}
				>
					{isLoggingIn ? "Signing in..." : "Sign in with Google"}
				</button>
			)}
		</div>
	);
};

export default Login;
