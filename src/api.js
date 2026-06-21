import axios from 'axios'

// 后端API地址
const API_BASE = 'http://45.207.215.95:3001/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// ==================== 家族模块 ====================
export const familyApi = {
  list: () => api.get('/families'),
  get: (id) => api.get(`/families/${id}`),
  overview: (id) => api.get(`/families/${id}/overview`)
}

// ==================== 成员模块 ====================
export const memberApi = {
  list: (familyId, params) => api.get(`/families/${familyId}/members`, { params }),
  get: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`)
}

// ==================== 故事模块 ====================
export const storyApi = {
  list: (familyId) => api.get(`/families/${familyId}/stories`),
  get: (id) => api.get(`/stories/${id}`),
  create: (familyId, data) => api.post(`/families/${familyId}/stories`, data)
}

// ==================== 相册模块 ====================
export const photoApi = {
  list: (familyId) => api.get(`/families/${familyId}/photos`),
  create: (familyId, data) => api.post(`/families/${familyId}/photos`, data)
}

// ==================== 大事记模块 ====================
export const eventApi = {
  list: (familyId) => api.get(`/families/${familyId}/events`),
  get: (id) => api.get(`/events/${id}`),
  create: (familyId, data) => api.post(`/families/${familyId}/events`, data)
}

// ==================== 赞助模块 ====================
export const sponsorApi = {
  list: (familyId) => api.get(`/families/${familyId}/sponsors`),
  create: (familyId, data) => api.post(`/families/${familyId}/sponsors`, data)
}

// ==================== 投稿模块 ====================
export const submissionApi = {
  list: (params) => api.get('/submissions', { params }),
  get: (id) => api.get(`/submissions/${id}`),
  update: (id, data) => api.put(`/submissions/${id}`, data),
  delete: (id) => api.delete(`/submissions/${id}`)
}

// ==================== 组委会审核模块 ====================
export const committeeApi = {
  pendingStories: () => api.get('/committee/pending/stories'),
  reviewStory: (id, data) => api.post(`/committee/review/story/${id}`, data),
  
  pendingPhotos: () => api.get('/committee/pending/photos'),
  reviewPhoto: (id, data) => api.post(`/committee/review/photo/${id}`, data),
  
  pendingEvents: () => api.get('/committee/pending/events'),
  reviewEvent: (id, data) => api.post(`/committee/review/event/${id}`, data),
  
  pendingSponsors: () => api.get('/committee/pending/sponsors'),
  reviewSponsor: (id, data) => api.post(`/committee/review/sponsor/${id}`, data)
}

// ==================== 搜索模块 ====================
export const searchApi = {
  search: (keyword, type) => api.get('/search', { params: { keyword, type } })
}

// ==================== 图书模块 ====================
export const bookApi = {
  list: (familyId) => api.get('/books', { params: { family_id: familyId } }),
  get: (id) => api.get(`/books/${id}`),
  pages: (id) => api.get(`/books/${id}/pages`)
}

// ==================== 画布/树图模块 ====================
export const canvasApi = {
  getTree: (familyId) => api.get(`/canvas/${familyId}`),
  getNodeDetail: (familyId, memberId) => api.get(`/canvas/${familyId}/node/${memberId}`),
  exportTree: (familyId) => api.get(`/canvas/${familyId}/export`)
}

// ==================== 用户模块 ====================
export const userApi = {
  profile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data)
}

// ==================== 上传模块 ====================
export const uploadApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// ==================== 辅助函数 ====================

// 按世代分组成员
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

// 构建家庭单元
export function buildHouseholds(members, relations) {
  const households = []
  const processed = new Set()
  
  for (const member of members) {
    if (processed.has(member.id)) continue
    
    // 找配偶
    const spouse = members.find(m => 
      m.spouseId === member.id || member.spouseId === m.id
    )
    
    // 找子女
    const children = members.filter(m => 
      m.fatherId === member.id || (spouse && m.fatherId === spouse.id)
    )
    
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