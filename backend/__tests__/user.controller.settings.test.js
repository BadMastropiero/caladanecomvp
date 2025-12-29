jest.mock("../models/user.model", () => ({
  getUserSettings: jest.fn(),
  updateUserSettings: jest.fn(),
  getUsersAddress: jest.fn(),
}));

const userController = require("../controllers/user.controller");
const UserModel = require("../models/user.model");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe("user.controller settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getSettings returns settings payload", async () => {
    const req = { user_id: 2 };
    const res = createRes();
    const next = jest.fn();

    UserModel.getUserSettings.mockResolvedValue({ theme: "dark" });

    await userController.getSettings(req, res, next);

    expect(UserModel.getUserSettings).toHaveBeenCalledWith({ user_id: 2 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Settings retrieved successfully",
      data: { theme: "dark" },
    });
  });

  test("updateSettings rejects unknown keys", async () => {
    const req = { user_id: 2, body: { foo: true } };
    const res = createRes();
    const next = jest.fn();

    await userController.updateSettings(req, res, next);

    expect(UserModel.updateUserSettings).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unknown settings: foo",
    });
  });

  test("updateSettings updates allowed settings", async () => {
    const req = { user_id: 2, body: { theme: "light", emailNotifications: false } };
    const res = createRes();
    const next = jest.fn();

    UserModel.updateUserSettings.mockResolvedValue({ theme: "light", emailNotifications: false });

    await userController.updateSettings(req, res, next);

    expect(UserModel.updateUserSettings).toHaveBeenCalledWith({
      user_id: 2,
      settings: { theme: "light", emailNotifications: false },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Settings updated successfully",
      data: { theme: "light", emailNotifications: false },
    });
  });
});
