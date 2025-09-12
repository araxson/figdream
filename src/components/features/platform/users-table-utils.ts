export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'destructive'
    case 'salon_owner':
      return 'default'
    case 'staff':
      return 'secondary'
    default:
      return 'outline'
  }
}

export const getRoleLabel = (role: string) => {
  return role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}