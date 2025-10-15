import OSS from 'ali-oss'
import {
	apigetsts
} from '@/api/apis.js';
import {
		onMounted
	} from 'vue';
const sts=await apigetsts()
console.log(sts)
export const client = new OSS({
	accessKeyId: sts.data.STSaccessKeyId,
	accessKeySecret: sts.data.STSsecretAccessKey,
	stsToken: sts.data.security_token,
	bucket: 'cjvd',
	region: 'oss-cn-guangzhou',
})
