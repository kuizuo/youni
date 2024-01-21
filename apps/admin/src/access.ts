import { Role } from '@model'

function isAdmin(roles: Role[]) {
  return roles.some(role => role.value === 'admin')
}

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && isAdmin(currentUser!.roles as Role[]),
  };
}
