import http from '../http.js'

export default {
    reserve_doc(user_id,title,oss_path) {
        const data = {
          'user_id': user_id,
          'prefix': oss_path,
          'title': title
        }
        return http.post('/documents/reserve', data, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
    },

    update_doc(id,status=null,category_id=null,title=null) {
        const data = { id };
        if (status != null) data.status = status;
        if (category_id != null) data.category_id = category_id;
        if (title != null) data.title = title
        return http.put('/documents', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },

    get_doc(id){
        const params = {id}
        return http.get('/documents/detail',{ params })
    },

    get_my_docs(params){
        return http.get('/documents',{params})
    },

    delete_doc(id) {
        return http.delete(`/documents?id=${id}`)
    },
}