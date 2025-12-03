import http from '../http.js'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

export default {
    /**
     * 获取问题列表（支持筛选）
     * @param {Object} filters 筛选条件
     * @param {string} [filters.start_time] 起始时间 (ISO 8601格式)
     * @param {string} [filters.end_time] 结束时间 (ISO 8601格式)
     * @param {string} [filters.status] 问题状态 (unhandled/claimed/ignored/resolved)
     */
    getIssues(filters = {}) {
        return http.get('/issues', { 
            params: filters 
        })
    },

    /**
     * 获取单个问题详情
     * @param {number} id 问题ID
     */
    getIssueById(id) {
        return http.get(`/issues/${id}`)
    },

    /**
     * 更新问题状态
     * @param {number} id 问题ID
     * @param {string} status 新状态 (claimed/ignored/resolved)
     * @param {string} [gitee_url] Bug单地址 (当状态为claimed或resolved时必填)
     * @param {string} [ignore_reason] 忽略原因 (当状态为ignored时必填)
     */
    updateIssueStatus(id, status, gitee_url = null, ignore_reason = null) {
        const data = {
            status: status,
            operator_id: userStore.userInfo.id,
            operator_name: userStore.userInfo.name || userStore.userInfo.username
        }
        
        if (status === 'claimed' || status === 'resolved') {
            if (!gitee_url) throw new Error('Gitee URL is required for this status')
            data.gitee_url = gitee_url
        } else if (status === 'ignored') {
            if (!ignore_reason) throw new Error('Ignore reason is required for this status')
            data.ignore_reason = ignore_reason
        }
        
        return http.put(`/issues/${id}/status`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },

    /**
     * 主动获取问题数据
     * @param {Array} items 问题数据数组
     * @param {string} items[].description 问题描述文本
     * @param {Array} [items[].images] 图片URL数组
     * @param {string} [items[].source] 数据来源标识
     */
    fetchIssues(items) {
        const data = {
            items: items.map(item => ({
                description: item.description,
                images: item.images || [],
                source: item.source || 'external_api'
            }))
        }
        
        return http.post('/issues/fetch', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },

    /**
     * 获取状态变更历史
     * @param {number} id 问题ID
     */
    getStatusHistory(id) {
        return http.get(`/issues/${id}/history`)
    },

    /**
     * 创建新问题（主动获取渠道）
     * @param {string} content 问题内容
     * @param {Array} [images] 图片URL数组
     * @param {string} [source] 数据来源标识
     */
    createIssue(content, images = [], source = 'api') {
        const data = {
            content: content,
            images: images,
            source: source
        }
        
        return http.post('/issues', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },

    /**
     * 删除问题
     * @param {number} id 问题ID
     */
    deleteIssue(id) {
        return http.delete(`/issues?id=${id}`)
    },

    /**
     * 批量更新问题状态
     * @param {Array} updates 更新数组
     * @param {number} updates[].id 问题ID
     * @param {string} updates[].status 新状态
     * @param {string} [updates[].gitee_url] Bug单地址
     * @param {string} [updates[].ignore_reason] 忽略原因
     */
    batchUpdateStatus(updates) {
        const data = updates.map(update => {
            const payload = {
                id: update.id,
                status: update.status,
                operator_id: userStore.userInfo.id,
                operator_name: userStore.userInfo.name || userStore.userInfo.username
            }
            
            if (update.status === 'claimed' || update.status === 'resolved') {
                if (!update.gitee_url) throw new Error('Gitee URL is required for this status')
                payload.gitee_url = update.gitee_url
            } else if (update.status === 'ignored') {
                if (!update.ignore_reason) throw new Error('Ignore reason is required for this status')
                payload.ignore_reason = update.ignore_reason
            }
            
            return payload
        })
        
        return http.put('/issues/batch-status', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },

    /**
     * 搜索问题
     * @param {string} keyword 搜索关键词
     * @param {Object} [filters] 其他筛选条件
     */
    searchIssues(keyword, filters = {}) {
        const params = {
            q: keyword,
            ...filters
        }
        
        return http.get('/issues/search', { params })
    },

    /**
     * 导出问题数据为CSV
     * @param {Object} filters 筛选条件
     */
    exportIssuesToCSV(filters = {}) {
        return http.get('/issues/export/csv', { 
            params: filters,
            responseType: 'blob'
        })
    },

    /**
     * 获取问题统计信息
     * @param {Object} [filters] 筛选条件
     */
    getIssueStats(filters = {}) {
        return http.get('/issues/stats', { 
            params: filters 
        })
    }
}