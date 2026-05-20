export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "",
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function isAdminRequest(request: Request) {
  const { username, password } = getAdminCredentials();

  if (!username || !password) {
    return false;
  }

  return (
    request.headers.get("x-admin-username") === username &&
    request.headers.get("x-admin-password") === password
  );
}

export function adminAuthError() {
  const { username, password } = getAdminCredentials();

  return username && password
    ? "后台账号或密码不正确。"
    : "后台账号密码未配置，请在 .env.local 设置 ADMIN_USERNAME 和 ADMIN_PASSWORD。";
}
