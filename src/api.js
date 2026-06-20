import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const familyApi = {
  list: () => api.get('/families'),
  get: (id) => api.get(`/families/${id}`),
  create: (data) => api.post('/families', data)
}

export const memberApi = {
  list: (familyId) => api.get('/members', { params: { family_id: familyId } }),
  get: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`)
}

export const bookApi = {
  list: (familyId) => api.get('/books', { params: { family_id: familyId } }),
  get: (id) => api.get(`/books/${id}`)
}

export const canvasApi = {
  getTree: (familyId) => api.get(`/canvas/${familyId}/tree`)
}