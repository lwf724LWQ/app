import { client } from "./alioss.js";
import {nanoid}  from 'nanoid'
const tool={
//执行上传文件操作的方法
oss:{
async upload( file,loading = true ){
//截取文件后缀名
const uuid=nanoid();
const index=file.name. lastIndexOf('.');
const suffix=file.name.substring( index+1);
let fileName ='uploads'+ uuid +'.'+suffix;
// let fileName ='uploads'+ currentDate +'/' + '.'+suffix;
// const loading =loadingtLoading.service({ lock: true}):(close:noop)
//执行上传操作
return await client.multipartUpload(fileName,file,{
	progress:function( percentage ,checkpoint ){
		console.log(percentage ,checkpoint,fileName )
},
fileName:fileName
});
}
},
}

export default tool;
		
