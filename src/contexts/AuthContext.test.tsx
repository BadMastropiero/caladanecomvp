import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AuthContextProvider, { ActionTypes, AuthContext } from "./AuthContext";

jest.mock("../services/axios.service", () => {
  return {
    getApi: () => Promise.resolve({ success: true, data: {} }),
    postApi: () => Promise.resolve({ success: true, data: {} }),
    putApi: () => Promise.resolve({ success: true, data: {} }),
  };
});

jest.mock("../components/auth/Login", () => {
  const Component = () => <div>Login</div>;
  return Component;
});

jest.mock("../components/auth/Register", () => {
  const Component = () => <div>Register</div>;
  return Component;
});

jest.mock("../components/auth/ForgotPassword", () => {
  const Component = () => <div>ForgotPassword</div>;
  return Component;
});

jest.mock("../components/auth/Change Password", () => {
  const Component = () => <div>ChangePassword</div>;
  return Component;
});

const Trigger = () => {
  const { updateAuthAction } = React.useContext(AuthContext as any) as any;

  return (
    <button type="button" onClick={() => updateAuthAction(ActionTypes.Login)}>
      Open Login
    </button>
  );
};

describe("AuthContextProvider modal behavior", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("re-opens login modal after being closed", async () => {
    const user = userEvent.setup();

    render(
      <AuthContextProvider>
        <Trigger />
      </AuthContextProvider>
    );

    await user.click(screen.getByRole("button", { name: /open login/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/close/i));
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: /open login/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
