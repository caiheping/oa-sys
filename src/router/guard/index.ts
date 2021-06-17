import router from "@/router";

import { createPermissionGuard } from "./permissionGuard"; // 权限导航

export async function setupRouterGuard() {
  await createPermissionGuard(router);
}
