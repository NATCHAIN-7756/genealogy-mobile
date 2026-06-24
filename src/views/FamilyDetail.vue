<template>
  <div class="family-detail">
    <van-nav-bar title="家庭信息" left-arrow @click-left="back" />
    <van-cell-group inset style="margin: 12px" v-if="family">
      <van-cell center>
        <template #icon><van-icon name="home-o" size="24" style="margin-right: 12px; color: #1989fa" /></template>
        <template #title><div class="family-name">{{ family.name }}</div></template>
        <template #label><div class="family-info">{{ family.surname }}氏 · {{ allMembers.length }}人</div></template>
      </van-cell>
      <van-cell title="家庭住址" :value="displayAddress" icon="location-o" is-link @click="showAddressPicker = true" />
    </van-cell-group>
    <van-cell-group inset style="margin: 12px" title="家庭成员">
      <van-cell is-link @click="editSelf">
        <template #icon><van-icon name="user-o" size="20" style="margin-right: 8px; color: #1989fa" /></template>
        <template #title><span>{{ user.name || '未设置姓名' }}</span><van-tag type="primary" size="small" style="margin-left: 4px">本人</van-tag></template>
        <template #label><div class="member-info"><span>{{ user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '未设置' }}</span><span v-if="user.birth_date"> · {{ user.birth_date }}</span></div></template>
      </van-cell>
      <van-cell v-for="member in members" :key="member.id" is-link @click="goMember(member)">
        <template #icon><van-icon name="user-o" size="20" :style="memberStyle(member)" /></template>
        <template #title><span>{{ member.name }}</span><van-tag v-if="member.generation" type="primary" size="small" style="margin-left: 4px">{{ member.generation }}</van-tag></template>
        <template #label><div class="member-info"><span>{{ member.gender === 'MALE' ? '男' : member.gender === 'FEMALE' ? '女' : '未知' }}</span><span v-if="member.birth_date"> · {{ member.birth_date }}</span><span v-if="member.birth_place"> · {{ member.birth_place }}</span></div></template>
      </van-cell>
      <div style="padding: 12px"><van-button type="primary" size="small" icon="plus" @click="showAddMember = true">添加成员</van-button></div>
    </van-cell-group>
    <van-popup v-model:show="showAddressPicker" position="bottom" round style="height: 80%">
      <div class="address-picker">
        <van-nav-bar title="选择地址" right-text="关闭" @click-right="showAddressPicker = false" />
        <van-tabs v-model:active="activeTab">
          <van-tab title="省份"><van-search v-model="provinceSearch" placeholder="搜索省份" /><van-cell-group><van-cell v-for="p in filteredProvinces" :key="p.code" :title="p.name" clickable @click="selectProvince(p)"><template #right-icon><van-icon v-if="selectedProvince && selectedProvince.code === p.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></van-tab>
          <van-tab title="城市" :disabled="!selectedProvince"><van-loading v-if="loadingCities" style="padding: 20px; text-align: center">加载中...</van-loading><template v-else><van-search v-model="citySearch" placeholder="搜索城市" /><van-cell-group><van-cell v-for="c in filteredCities" :key="c.code" :title="c.name" clickable @click="selectCity(c)"><template #right-icon><van-icon v-if="selectedCity && selectedCity.code === c.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></template></van-tab>
          <van-tab title="区县" :disabled="!selectedCity"><van-loading v-if="loadingDistricts" style="padding: 20px; text-align: center">加载中...</van-loading><template v-else><van-search v-model="districtSearch" placeholder="搜索区县" /><van-cell-group><van-cell v-for="d in filteredDistricts" :key="d.code" :title="d.name" clickable @click="selectDistrict(d)"><template #right-icon><van-icon v-if="selectedDistrict && selectedDistrict.code === d.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></template></van-tab>
          <van-tab title="乡镇/街道" :disabled="!selectedDistrict"><van-loading v-if="loadingTowns" style="padding: 20px; text-align: center">加载中...</van-loading><template v-else><van-search v-model="townSearch" placeholder="搜索乡镇/街道" /><van-cell-group><van-cell v-for="t in filteredTowns" :key="t.code" :title="t.name" clickable @click="selectTown(t)"><template #right-icon><van-icon v-if="selectedTown && selectedTown.code === t.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></template></van-tab>
        </van-tabs>
        <div style="padding: 16px"><van-button type="primary" block @click="confirmAddress">确认</van-button></div>
      </div>
    </van-popup>
    <van-popup v-model:show="showAddMember" position="bottom" round style="height: 70%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="添加家庭成员" />
        <van-field v-model="newMemberName" label="姓名" placeholder="请输入姓名" required />
        <van-cell title="性别"><van-radio-group v-model="newMemberGender"><van-radio name="MALE">男</van-radio><van-radio name="FEMALE">女</van-radio></van-radio-group></van-cell>
        <van-field v-model="newMemberBirth" label="出生日期" placeholder="如：1990-01-01" />
        <van-cell title="出生地" is-link @click="showMemberAddressPicker = true"><span>{{ newMemberBirthPlace || '请选择' }}</span></van-cell>
        <van-field v-model="newMemberGeneration" label="辈分" placeholder="如：第1代" />
        <van-field v-model="newMemberRelation" label="关系" placeholder="如：配偶、子女、父母" />
        <div style="padding: 16px"><van-button type="primary" block @click="addMember">确认添加</van-button></div>
      </van-cell-group>
    </van-popup>
    <van-popup v-model:show="showMemberAddressPicker" position="bottom" round style="height: 80%">
      <div class="address-picker">
        <van-nav-bar title="选择出生地" right-text="关闭" @click-right="showMemberAddressPicker = false" />
        <van-tabs v-model:active="memberAddressTab">
          <van-tab title="省份"><van-search v-model="mProvinceSearch" placeholder="搜索省份" /><van-cell-group><van-cell v-for="p in mFilteredProvinces" :key="p.code" :title="p.name" clickable @click="memberSelectProvince(p)"><template #right-icon><van-icon v-if="memberProvince && memberProvince.code === p.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></van-tab>
          <van-tab title="城市" :disabled="!memberProvince"><van-loading v-if="mLoadingCities" style="padding: 20px; text-align: center">加载中...</van-loading><template v-else><van-search v-model="mCitySearch" placeholder="搜索城市" /><van-cell-group><van-cell v-for="c in mFilteredCities" :key="c.code" :title="c.name" clickable @click="memberSelectCity(c)"><template #right-icon><van-icon v-if="memberCity && memberCity.code === c.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></template></van-tab>
          <van-tab title="区县" :disabled="!memberCity"><van-loading v-if="mLoadingDistricts" style="padding: 20px; text-align: center">加载中...</van-loading><template v-else><van-search v-model="mDistrictSearch" placeholder="搜索区县" /><van-cell-group><van-cell v-for="d in mFilteredDistricts" :key="d.code" :title="d.name" clickable @click="memberSelectDistrict(d)"><template #right-icon><van-icon v-if="memberDistrict && memberDistrict.code === d.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></template></van-tab>
          <van-tab title="乡镇/街道" :disabled="!memberDistrict"><van-loading v-if="mLoadingTowns" style="padding: 20px; text-align: center">加载中...</van-loading><template v-else><van-search v-model="mTownSearch" placeholder="搜索乡镇/街道" /><van-cell-group><van-cell v-for="t in mFilteredTowns" :key="t.code" :title="t.name" clickable @click="memberSelectTown(t)"><template #right-icon><van-icon v-if="memberTown && memberTown.code === t.code" name="success" color="#07c160" /></template></van-cell></van-cell-group></template></van-tab>
        </van-tabs>
        <div style="padding: 16px"><van-button type="primary" block @click="confirmMemberAddress">确认</van-button></div>
      </div>
    </van-popup>
    <van-empty v-if="!family" description="家庭不存在" />
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const family = ref(null)
const members = ref([])
const user = ref({})
const token = localStorage.getItem('token')

// 省级数据（初始加载）
const allProvinces = ref([])
const showAddressPicker = ref(false)
const activeTab = ref(0)
const selectedProvince = ref(null)
const selectedCity = ref(null)
const selectedDistrict = ref(null)
const selectedTown = ref(null)
const provinceSearch = ref('')
const citySearch = ref('')
const districtSearch = ref('')
const townSearch = ref('')

// 按需加载的数据
const cities = ref([])
const districts = ref([])
const towns = ref([])
const loadingCities = ref(false)
const loadingDistricts = ref(false)
const loadingTowns = ref(false)

const filteredProvinces = computed(() => provinceSearch.value ? allProvinces.value.filter(p => p.name.includes(provinceSearch.value)) : allProvinces.value)
const filteredCities = computed(() => citySearch.value ? cities.value.filter(c => c.name.includes(citySearch.value)) : cities.value)
const filteredDistricts = computed(() => districtSearch.value ? districts.value.filter(d => d.name.includes(districtSearch.value)) : districts.value)
const filteredTowns = computed(() => townSearch.value ? towns.value.filter(t => t.name.includes(townSearch.value)) : towns.value)

const fullAddress = computed(() => [selectedProvince.value?.name, selectedCity.value?.name, selectedDistrict.value?.name, selectedTown.value?.name].filter(Boolean).join(' '))
const displayAddress = computed(() => fullAddress.value || '未设置')

// 成员地址选择器
const showMemberAddressPicker = ref(false)
const memberAddressTab = ref(0)
const memberProvince = ref(null)
const memberCity = ref(null)
const memberDistrict = ref(null)
const memberTown = ref(null)
const newMemberBirthPlace = ref('')
const mProvinceSearch = ref('')
const mCitySearch = ref('')
const mDistrictSearch = ref('')
const mTownSearch = ref('')
const mCities = ref([])
const mDistricts = ref([])
const mTowns = ref([])
const mLoadingCities = ref(false)
const mLoadingDistricts = ref(false)
const mLoadingTowns = ref(false)

const mFilteredProvinces = computed(() => mProvinceSearch.value ? allProvinces.value.filter(p => p.name.includes(mProvinceSearch.value)) : allProvinces.value)
const mFilteredCities = computed(() => mCitySearch.value ? mCities.value.filter(c => c.name.includes(mCitySearch.value)) : mCities.value)
const mFilteredDistricts = computed(() => mDistrictSearch.value ? mDistricts.value.filter(d => d.name.includes(mDistrictSearch.value)) : mDistricts.value)
const mFilteredTowns = computed(() => mTownSearch.value ? mTowns.value.filter(t => t.name.includes(mTownSearch.value)) : mTowns.value)

const allMembers = computed(() => { const r = [{ id: 'self', name: user.value.name || '未设置', gender: user.value.gender?.toUpperCase(), birth_date: user.value.birth_date, is_self: true }]; members.value.forEach(m => r.push(m)); return r })

const showAddMember = ref(false)
const newMemberName = ref('')
const newMemberGender = ref('MALE')
const newMemberBirth = ref('')
const newMemberGeneration = ref('')
const newMemberRelation = ref('')
const newMemberBiography = ref('')

function memberStyle(member) { return { marginRight: '8px', color: member.gender === 'MALE' ? '#1989fa' : '#ee0a24' } }
function back() { router.back() }
function goMember(m) { router.push('/member/' + m.id) }
function editSelf() { router.push('/infocard') }

// 加载省份
async function loadProvinces() {
  try {
    const res = await fetch('/regions/provinces.json')
    const data = await res.json()
    allProvinces.value = data.data
  } catch (e) { showToast('加载省份失败') }
}

// 选择省份后加载城市
async function selectProvince(p) {
  selectedProvince.value = p
  selectedCity.value = null
  selectedDistrict.value = null
  selectedTown.value = null
  cities.value = []
  districts.value = []
  towns.value = []
  activeTab.value = 1
  
  loadingCities.value = true
  try {
    const res = await fetch(`/regions/cities_${p.code}.json`)
    const data = await res.json()
    cities.value = data.data
  } catch (e) { showToast('加载城市失败') }
  loadingCities.value = false
}

// 选择城市后加载区县
async function selectCity(c) {
  selectedCity.value = c
  selectedDistrict.value = null
  selectedTown.value = null
  districts.value = []
  towns.value = []
  activeTab.value = 2
  
  loadingDistricts.value = true
  try {
    const res = await fetch(`/regions/districts_${c.code}.json`)
    const data = await res.json()
    districts.value = data.data
  } catch (e) { showToast('加载区县失败') }
  loadingDistricts.value = false
}

// 选择区县后加载乡镇
async function selectDistrict(d) {
  selectedDistrict.value = d
  selectedTown.value = null
  towns.value = []
  activeTab.value = 3
  
  loadingTowns.value = true
  try {
    const res = await fetch(`/regions/towns_${d.code}.json`)
    const data = await res.json()
    towns.value = data.data
  } catch (e) { showToast('加载乡镇失败') }
  loadingTowns.value = false
}

function selectTown(t) { selectedTown.value = t }

// 成员地址选择器
async function memberSelectProvince(p) {
  memberProvince.value = p
  memberCity.value = null
  memberDistrict.value = null
  memberTown.value = null
  mCities.value = []
  mDistricts.value = []
  mTowns.value = []
  memberAddressTab.value = 1
  
  mLoadingCities.value = true
  try {
    const res = await fetch(`/regions/cities_${p.code}.json`)
    const data = await res.json()
    mCities.value = data.data
  } catch (e) { showToast('加载城市失败') }
  mLoadingCities.value = false
}

async function memberSelectCity(c) {
  memberCity.value = c
  memberDistrict.value = null
  memberTown.value = null
  mDistricts.value = []
  mTowns.value = []
  memberAddressTab.value = 2
  
  mLoadingDistricts.value = true
  try {
    const res = await fetch(`/regions/districts_${c.code}.json`)
    const data = await res.json()
    mDistricts.value = data.data
  } catch (e) { showToast('加载区县失败') }
  mLoadingDistricts.value = false
}

async function memberSelectDistrict(d) {
  memberDistrict.value = d
  memberTown.value = null
  mTowns.value = []
  memberAddressTab.value = 3
  
  mLoadingTowns.value = true
  try {
    const res = await fetch(`/regions/towns_${d.code}.json`)
    const data = await res.json()
    mTowns.value = data.data
  } catch (e) { showToast('加载乡镇失败') }
  mLoadingTowns.value = false
}

function memberSelectTown(t) { memberTown.value = t }

async function confirmAddress() {
  try {
    await api.put('/auth/info', { address: fullAddress.value })
    user.value.address = fullAddress.value
    localStorage.setItem('user', JSON.stringify(user.value))
    showToast('保存成功')
    showAddressPicker.value = false
  } catch (e) { showToast('保存失败') }
}

function confirmMemberAddress() {
  newMemberBirthPlace.value = [memberProvince.value?.name, memberCity.value?.name, memberDistrict.value?.name, memberTown.value?.name].filter(Boolean).join(' ')
  showMemberAddressPicker.value = false
}

async function loadUser() {
  try {
    const res = await api.get('/auth/me')
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
  } catch (e) { console.error(e) }
}

async function loadFamily() {
  try {
    const res = await api.get('/families/' + familyId)
    family.value = res.data
    await loadMembers()
  } catch (e) { showToast('加载失败') }
}

async function loadMembers() {
  try {
    const res = await api.get('/members?family_id=' + familyId)
    members.value = res.data || []
  } catch (e) { members.value = [] }
}

async function addMember() {
  if (!newMemberName.value.trim()) { showToast('请输入姓名'); return }
  try {
    await api.post('/members', {
      family_id: familyId, name: newMemberName.value, gender: newMemberGender.value,
      birth_date: newMemberBirth.value || null, birth_place: newMemberBirthPlace.value || null,
      generation: newMemberGeneration.value || null, biography: newMemberBiography.value || null, is_alive: true
    })
    showToast('添加成功')
    showAddMember.value = false
    newMemberName.value = ''; newMemberBirth.value = ''; newMemberBirthPlace.value = ''; newMemberGeneration.value = ''; newMemberBiography.value = ''; newMemberRelation.value = ''
    await loadMembers()
  } catch (e) { showToast('添加失败') }
}

onMounted(async () => { await loadProvinces(); await loadUser(); await loadFamily() })
</script>

<style scoped>
.family-detail { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh }
.family-name { font-size: 18px; font-weight: 500 }
.family-info { font-size: 12px; color: #999; margin-top: 4px }
.member-info { font-size: 12px; color: #666 }
.address-picker { max-height: 80vh; overflow-y: auto }
</style>
