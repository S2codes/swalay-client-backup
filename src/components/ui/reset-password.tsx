import React, { useState } from "react";
import { useRouter } from "next/router";
import { apiPost } from "@/helpers/axiosRequest";
import toast from "react-hot-toast";


const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { token } = router.query;

  const onSubmit = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await apiPost('/api/user/reset-password', { token, password });

      if (response.success) {
        toast.success("Password reset successfully");
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error("Something went wrong, please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div>
        <h2>Reset Your Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={onSubmit}>Reset Password</button>
      </div>
    </div>
  );
};

export default ResetPassword;
