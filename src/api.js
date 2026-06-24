import axios from 'axios'

const API_BASE = 'http://45.207.215.95/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// 请求拦截器 - 自动携带token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

// 响应拦截器 - 处理401错误自动跳转登录
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/m/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== 认证模块 ====================
export const authApi = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); }
}

// ==================== 家族模块 ====================
export const familyApi = {
  list: () => api.get('/families'),
  get: (id) => api.get(`/families/${id}`),
  create: (data) => api.post('/families', data),
  update: (id, data) => api.put(`/families/${id}`, data),
  join: (code) => api.post(`/families/join/${code}`)
}

// ==================== 成员模块 ====================
export const memberApi = {
  list: (familyId, params) => api.get(`/members/family/${familyId}`, { params }),
  get: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  addRelation: (data) => api.post('/members/relations', data),
  getRelations: (memberId) => api.get(`/members/${memberId}/relations`)
}

// ==================== 故事模块 ====================
export const storyApi = {
  list: (familyId, status) => api.get(`/stories/family/${familyId}`, { params: { status } }),
  get: (id) => api.get(`/stories/${id}`),
  create: (familyId, data) => api.post(`/stories/family/${familyId}`, data),
  update: (id, data) => api.put(`/stories/${id}`, data),
  delete: (id) => api.delete(`/stories/${id}`),
  like: (id) => api.post(`/stories/${id}/like`),
  collect: (id) => api.post(`/stories/${id}/collect`),
  getComments: (id) => api.get(`/stories/${id}/comments`),
  addComment: (id, data) => api.post(`/stories/${id}/comments`, data),
  getStatus: (id) => api.get(`/stories/${id}/status`)
}

// ==================== 大事记模块 ====================
export const eventApi = {
  list: (familyId, status) => api.get(`/events/family/${familyId}`, { params: { status } }),
  get: (id) => api.get(`/events/${id}`),
  create: (familyId, data) => api.post(`/events/family/${familyId}`, data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`)
}

// ==================== 赞助模块 ====================
export const sponsorApi = {
  list: (familyId, status) => api.get(`/sponsors/family/${familyId}`, { params: { status } }),
  get: (id) => api.get(`/sponsors/${id}`),
  create: (familyId, data) => api.post(`/sponsors/family/${familyId}`, data),
  update: (id, data) => api.put(`/sponsors/${id}`, data),
  delete: (id) => api.delete(`/sponsors/${id}`)
}

// ==================== 族委会模块 ====================
export const committeeApi = {
  pendingStories: () => api.get('/committee/pending/stories'),
  pendingEvents: () => api.get('/committee/pending/events'),
  pendingSponsors: () => api.get('/committee/pending/sponsors'),
  reviewStory: (id, action, note) => api.post(`/committee/review/story/${id}`, { action, note }),
  reviewEvent: (id, action, note) => api.post(`/committee/review/event/${id}`, { action, note }),
  reviewSponsor: (id, action, note) => api.post(`/committee/review/sponsor/${id}`, { action, note })
}

// ==================== 搜索模块 ====================
export const searchApi = {
  search: (keyword, type) => api.get('/search', { params: { keyword, type } })
}

// ==================== 族谱书模块 ====================
export const bookApi = {
  list: (familyId) => api.get('/books', { params: { family_id: familyId } }),
  get: (id) => api.get(`/books/${id}`),
  pages: (id) => api.get(`/books/${id}/pages`),
  create: (data) => api.post('/books', data)
}

// ==================== Canvas模块 ====================
export const canvasApi = {
  getTree: (familyId) => api.get(`/canvas/${familyId}`),
  getNodeDetail: (familyId, memberId) => api.get(`/canvas/${familyId}/node/${memberId}`),
  exportTree: (familyId) => api.get(`/canvas/${familyId}/export`)
}

// ==================== 历史版本模块 ====================
export const historyApi = {
  list: (familyId) => api.get(`/history/family/${familyId}`),
  create: (familyId, name, desc) => api.post(`/history/family/${familyId}`, { version_name: name, description: desc }),
  restore: (snapshotId) => api.post(`/history/${snapshotId}/restore`),
  delete: (snapshotId) => api.delete(`/history/${snapshotId}`)
}

// ==================== 用户模块 ====================
export const userApi = {
  profile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data)
}

// ==================== 上传模块 ====================
export const uploadApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// ==================== 辅助函数 ====================
export function groupMembersByGeneration(members) {
  const groups = {}
  members.forEach(m => {
    const gen = m.generation || '未知'
    if (!groups[gen]) groups[gen] = []
    groups[gen].push(m)
  })
  return Object.entries(groups).sort((a, b) => {
    if (a[0] === '未知') return 1
    if (b[0] === '未知') return -1
    return parseInt(a[0]) - parseInt(b[0])
  })
}

export function buildHouseholds(members, relations) {
  const households = []
  const processed = new Set()
  for (const member of members) {
    if (processed.has(member.id)) continue
    const spouseRelation = relations?.find(r =>
      (r.member_id === member.id || r.related_member_id === member.id) &&
      r.relation_type === 'spouse'
    )
    const spouseId = spouseRelation?.member_id === member.id
      ? spouseRelation?.related_member_id
      : spouseRelation?.member_id
    const spouse = members.find(m => m.id === spouseId)
    const children = members.filter(m => {
      const childRelation = relations?.find(r =>
        r.relation_type === 'child' &&
        r.related_member_id === m.id &&
        (r.member_id === member.id || r.member_id === spouseId)
      )
      return childRelation
    })
    households.push({
      head: member,
      spouse: spouse,
      children: children,
      generation: member.generation
    })
    processed.add(member.id)
    if (spouse) processed.add(spouse.id)
    children.forEach(c => processed.add(c.id))
  }
  return households
}

export default api