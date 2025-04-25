import OSS from 'ali-oss';

/**
 * 使用STS临时凭证初始化OSS客户端
 * @param {Object} stsToken - 从后端获取的STS凭证
 * @returns {OSS} OSS客户端实例
 */
export function initOSSClient(stsToken) {
  return new OSS({
    // region: stsToken.region,
    region: 'oss-cn-beijing',
    accessKeyId: stsToken.access_key_id,
    accessKeySecret: stsToken.access_key_secret,
    stsToken: stsToken.security_token,
    bucket: stsToken.bucket,
    secure: true, // 使用HTTPS
    refreshSTSToken: null, // 不自动刷新Token（需自行处理过期）
    headers:{
      // 'Content-Disposition': 'attachment',
      'Access-Control-Allow-Origin': '*' // 开发环境临时方案
    }
  });
}

/**
 * 上传文件到OSS
 * @param {File} file - 要上传的文件对象
 * @param {string} path - 存储路径 (如 'packages/subdir/')
 * @param {Object} stsToken - STS凭证
 * @returns {Promise<{url: string, name: string}>} 上传结果
 */
export async function uploadToOSS(file, path, stsToken) {
  try {
    const client = initOSSClient(stsToken);
    const fileName = `${path}${Date.now()}_${file.name}`;

    // 打印调试信息
    console.log('开始上传，文件名:', fileName);
    console.log('OSS 配置:', client.options);
    
    const result = await client.put(fileName, file);
    console.log('OSS 上传结果：', result)
    return {
      url: result.url,
      name: file.name,
      key:fileName
    };
  } catch (error) {
    console.error('OSS上传失败:', error);
    throw error;
  }
}

/**
 * 分片上传文件到 OSS（支持进度回调）
 * @param {File} file - 要上传的文件
 * @param {string} path - 存储路径（如 'uploads/'）
 * @param {Object} stsToken - STS 临时凭证
 * @param {Object} options - 可选配置
 * @param {Function} options.progress - 进度回调 (0~1)
 * @returns {Promise<{url: string, name: string}>} 文件 URL 和原始文件名
 */
export async function ossMultipartUpload(file, path, stsToken, options = {}) {
  try {
    const client = initOSSClient(stsToken);
    const fileName = `${path}${Date.now()}_${file.name}`; // 生成唯一文件名

    console.log('开始分片上传:', fileName);

    // 分片上传（支持进度回调）
    const result = await client.multipartUpload(fileName, file, {
      progress: (p) => {
        // console.log('上传进度:', Math.round(p * 100) + '%'); // 打印进度
        if (options.progress) options.progress(p); // 触发外部回调
      },
      partSize: 5 * 1024 * 1024, // 分片大小（默认 1MB，建议 5MB）
    });

    console.log('上传成功:', result);
    return {
      url: result.url || result.res.requestUrls[0], // 文件访问 URL
      name: file.name, // 原始文件名
      key:fileName
    };
  } catch (error) {
    console.error('分片上传失败:', error);
    throw error;
  }
}

