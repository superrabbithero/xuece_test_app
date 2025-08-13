import http from '../http.js'

export default {
    reserve_doc(user_id,oss_path) {
        const data = {
          'user_id': user_id,
          'prefix': oss_path
        }
        return http.post('/documents/reserve', data, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
    },

    update_doc(id,status=null,category_id=null) {
        const data = { id };
        if (status != null) data.status = status;
        if (category_id != null) data.category_id = category_id;
        return http.put('/documents', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },

    get_doc(id){
      const params = {id}
      return http.get('/documents/detail',{ params })
    }
}