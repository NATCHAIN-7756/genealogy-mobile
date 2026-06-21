import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const familyApi = {
  list: () => api.get('/families'),
  get: (id) => api.get(`/families/${id}`),
  create: (data) => api.post('/families', data),
  update: (id, data) => api.put(`/families/${id}`, data)
}

export const memberApi = {
  // 获取家族所有成员
  list: (familyId) => api.get(`/members/family/${familyId}`),
  // 获取单个成员详情
  get: (id) => api.get(`/members/${id}`),
  // 创建成员
  create: (data) => api.post('/members', data),
  // 更新成员
  update: (id, data) => api.put(`/members/${id}`, data),
  // 删除成员
  delete: (id) => api.delete(`/members/${id}`),
  // 获取成员关系
  getRelations: (memberId) => api.get(`/members/${memberId}/relations`),
  // 创建关系
  createRelation: (data) => api.post('/members/relations', data)
}

export const bookApi = {
  list: (familyId) => api.get('/books', { params: { family_id: familyId } }),
  get: (id) => api.get(`/books/${id}`),
  pages: (id) => api.get(`/books/${id}/pages`)
}

export const canvasApi = {
  getTree: (familyId) => api.get(`/canvas/${familyId}`),
  getNodeDetail: (familyId, memberId) => api.get(`/canvas/${familyId}/node/${memberId}`),
  exportTree: (familyId) => api.get(`/canvas/${familyId}/export`)
}

export const historyApi = {
  list: (familyId) => api.get(`/history/family/${familyId}`),
  create: (familyId, data) => api.post(`/history/family/${familyId}`, data),
  get: (id) => api.get(`/history/${id}`),
  restore: (id) => api.post(`/history/${id}/restore`)
}

// 辅助函数：按世代分组成员
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

// 辅助函数：构建家庭单元（通过关系）
export async function buildHouseholds(members, relationsMap) {
  const households = []
  const processed = new Set()
  
  for (const member of members) {
    if (processed.has(member.id)) continue
    
    const relations = relationsMap[member.id] || []
    const spouseRel = relations.find(r => r.relation_type === 'spouse')
    
    if (spouseRel) {
      // 找到配偶，构建家庭
      const spouse = members.find(m => m.id === spouseRel.related_member_id)
      const children = relations.filter(r => r.relation_type === 'child')
        .map(r => members.find(m => m.id === r.related_member_id))
        .filter(Boolean)
      
      households.push({
        id: member.id,
        head: member,
        spouse: spouse,
        children: children,
        generation: member.generation
      })
      
      processed.add(member.id)
      if (spouse) processed.add(spouse.id)
      children.forEach(c => processed.add(c.id))
    } else if (!processed.has(member.id)) {
      // 单独成员
      households.push({
        id: member.id,
        head: member,
        spouse: null,
        children: [],
        generation: member.generation
      })
      processed.add(member.id)
    }
  }
  
  return households
}