import { ElMessage } from 'element-plus'

export default (msg: string) => {
  ElMessage({
    message: msg,
    customClass: 'mobile-message',
  })
}