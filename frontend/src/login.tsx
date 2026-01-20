import { useForm } from "react-hook-form";
import "./login.css";
import { login } from "./utils/api";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

export function LoginPage() {
  const LoginForm = useForm<{ email: string; password: string }>({});
  const navigate = useNavigate();

  return (
    <div className="login-form-page">
      <form
        className="login-form"
        onSubmit={LoginForm.handleSubmit(async ({ email, password }) => {
          const { success } = await login(email, password);

          if (success) {
            toast.success("Login successful. Redirected to the homepage.");
            navigate("/");
          } else {
            toast.error("Login failed, maybe the email or password is incorrect.");
          }
        })}
      >
        <h1>Location Tracker</h1>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter email"
            {...LoginForm.register("email", { required: true })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter password"
            {...LoginForm.register("password", { required: true })}
          />
        </div>

        <button type="submit">Login</button>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
