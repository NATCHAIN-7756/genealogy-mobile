import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('./views/Login.vue'), meta: { public: true } },
  { path: '/', name: 'Home', component: () => import('./views/Home.vue') },
  { path: '/family', name: 'Family', component: () => import('./views/FamilySelect.vue') },
  { path: '/family/:id', name: 'Genealogy', component: () => import('./views/Genealogy.vue') },
  { path: '/family/:id/book', component: () => import('./views/GenealogyBook.vue') },
  { path: '/family/:id/preface', component: () => import('./views/Preface.vue') },
  { path: '/family/:id/legend', component: () => import('./views/Legend.vue') },
  { path: '/family/:id/overview', component: () => import('./views/Overview.vue') },
  { path: '/family/:id/generation-table', component: () => import('./views/GenerationTable.vue') },
  { path: '/family/:id/tree-print', component: () => import('./views/TreePrint.vue') },
  { path: '/family/:id/sponsors', component: () => import('./views/Sponsors.vue') },
  { path: '/family/:id/generations', component: () => import('./views/Generations.vue') },
  { path: '/family/:id/generation/:order', component: () => import('./views/GenerationDetail.vue') },
  { path: '/family/:id/contemporary', component: () => import('./views/ContemporaryList.vue') },
  { path: '/family/:id/contemporary/:householdId', component: () => import('./views/FamilyDetail.vue') },
  { path: '/family/:id/stories', component: () => import('./views/Stories.vue') },
  { path: '/family/:id/story/:storyId', component: () => import('./views/StoryDetail.vue') },
  { path: '/family/:id/photos', component: () => import('./views/Photos.vue') },
  { path: '/family/:id/album/:albumId', component: () => import('./views/AlbumDetail.vue') },
  { path: '/family/:id/events', component: () => import('./views/Events.vue') },
  { path: '/family/:id/event/:eventId', component: () => import('./views/EventDetail.vue') },
  { path: '/family/:id/about', component: () => import('./views/AboutGenealogy.vue') },
  { path: '/family/:id/postscript', component: () => import('./views/Postscript.vue') },
  { path: '/family/:id/export', component: () => import('./views/ExportCenter.vue') },
  { path: '/family/:id/member/:memberId/card', component: () => import('./views/MemberCard.vue') },
  { path: '/family/:id/members', component: () => import('./views/FamilyMembers.vue') },
  { path: '/member/:id', component: () => import('./views/MemberDetail.vue') },
  { path: '/tree/:id', component: () => import('./views/Tree.vue') },
  { path: '/books', component: () => import('./views/Books.vue') },
  { path: '/books/:id', component: () => import('./views/BookReader.vue') },
  { path: '/profile', name: 'Profile', component: () => import('./views/Profile.vue') },
  { path: '/userinfo', name: 'UserInfo', component: () => import('./views/UserInfo.vue') },
  { path: '/infocard', component: () => import('./views/InfoCard.vue') },
  { path: '/my-submissions', component: () => import('./views/MySubmissions.vue') },
  { path: '/my-submissions/:chapterId/new', component: () => import('./views/SubmissionEdit.vue') },
  { path: '/my-submissions/:chapterId/:itemId', component: () => import('./views/SubmissionDetail.vue') },
  { path: '/my-submissions/:chapterId/:itemId/edit', component: () => import('./views/SubmissionEdit.vue') },
  { path: '/committee', component: () => import('./views/Committee.vue'), meta: { requiresRole: 'committee' } },
  { path: '/committee/members', component: () => import('./views/CommitteeMembers.vue'), meta: { requiresRole: 'committee' } },
  { path: '/committee/members/pending', component: () => import('./views/CommitteePending.vue'), meta: { requiresRole: 'committee' } },
  { path: '/committee/stories', component: () => import('./views/CommitteeStories.vue'), meta: { requiresRole: 'committee' } },
  { path: '/committee/photos', component: () => import('./views/CommitteePhotos.vue'), meta: { requiresRole: 'committee' } },
  { path: '/committee/events', component: () => import('./views/CommitteeEvents.vue'), meta: { requiresRole: 'committee' } },
  { path: '/committee/sponsors', component: () => import('./views/CommitteeSponsors.vue'), meta: { requiresRole: 'committee' } }
]

const router = createRouter({
  history: createWebHistory('/m/'),
  routes
})

// 权限守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // 公开页面直接放行
  if (to.meta.public) {
    next()
    return
  }
  
  // 未登录跳转登录页
  if (!token) {
    next('/login')
    return
  }
  
  // 需要特定角色的页面
  if (to.meta.requiresRole === 'committee' && user.role !== 'committee' && user.role !== 'admin') {
    next('/')
    return
  }
  
  next()
})

export default router