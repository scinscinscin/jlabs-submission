import { useForm } from "react-hook-form";
import "./login.css";
import { Link, useNavigate } from "react-router";
import { register } from "./utils/api";
import { toast } from "react-toastify";

export function RegisterPage() {
  const RegisterForm = useForm<{ email: string; password: string }>({});
  const navigate = useNavigate();

  return (
    <div className="login-form-page">
      <form
        className="login-form"
        onSubmit={RegisterForm.handleSubmit(async ({ email, password }) => {
          const { success } = await register(email, password);
          if (success) {
            toast.success("Account created successfully");
            navigate("/");
          } else {
            toast.error("Account creation failed, maybe the account already exists.");
          }
        })}
      >
        <h1>Register</h1>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter email"
            {...RegisterForm.register("email", { required: true })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter password"
            {...RegisterForm.register("password", { required: true })}
          />
        </div>

        <button type="submit">Create Account</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
