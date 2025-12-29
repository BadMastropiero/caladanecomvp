const authController = require("../controllers/auth.controller");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth.controller.me", () => {
  test("returns success response with id and address", async () => {
    const req = { user_id: 42, address: "0xabc" };
    const res = createRes();
    const next = jest.fn();

    await authController.me(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Success",
      data: {
        id: 42,
        address: "0xabc",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
