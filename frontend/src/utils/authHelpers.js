export const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'resident') return '/resident/dashboard'
  if (role === 'guard') return '/guard/dashboard'
  return '/login'
}

export const updateStoredUser = (user) => {
  const stored = JSON.parse(localStorage.getItem('user') || '{}')
  const updated = { ...stored, ...user }
  localStorage.setItem('user', JSON.stringify(updated))
  return updated
}
