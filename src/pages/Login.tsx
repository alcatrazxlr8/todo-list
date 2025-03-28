import { useEffect, useState } from "react";
import { signInWithGoogle } from "../../AuthService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	// Redirect to `/todo` if the user is logged in
	useEffect(() => {
		if (user && !loading) {
			// console.log("✅ Redirecting to /todo...");
			navigate("/todo", { replace: true }); // Avoids going back to login after redirection
		}
	}, [user, loading, navigate]);

	const handleLogin = async () => {
		setIsLoggingIn(true);
		await signInWithGoogle();
		setIsLoggingIn(false);
	};

	return (
		<div className="container d-flex align-items-center justify-content-center min-vh-100">
			<div className="card shadow" style={{ maxWidth: "400px", width: "100%" }}>
				<div className="card-body text-center">
					<h1 className="card-title mb-4">To-Do Login</h1>

					{user ? (
						<p>Redirecting...</p>
					) : (
						<button
							onClick={handleLogin}
							className="btn btn-success w-100"
							disabled={isLoggingIn}
						>
							{isLoggingIn ? "Logging in..." : "Login with Google"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Login;
