import AppInfoParser from 'app-info-parser';

export const parseAPK = async (file) => {
  try {
    const parser = new AppInfoParser(file);
    const result = await parser.parse();

    let ar = 'x64'
    // let icon = null
    console.log('package信息:', result);
    if (file.name.endsWith('.apk')){
      ar = await detectApkArchitecture(file)
      // icon = await extractApkIcon(file)
    } else if (file.name.endsWith('.ipa')) {
      // 如果是IPA，使用CFBundleIdentifier等字段
      // icon = await extractIpaIcon(file); // 提取IPA图标
    }
    return {
      name: file.name,
      packageName: result.package ? result.package : result.CFBundleIdentifier,      // 包名 (com.example.app)
      versionName: result.versionName ? result.versionName : result.CFBundleShortVersionString,  // 版本名 (1.0.0)
      versionCode: result.versionCode ? result.versionCode : result. CFBundleVersion,  // 版本号 (100)
      icon: result.icon,               // Base64 图标
      // icon2: icon,
      size: file.size,                 // 文件大小
      ar: ar                           // 架构
    };
  } catch (error) {
    console.error('APK 解析失败:', error);
    throw error;
  }
};


import JSZip from 'jszip';

/**
 * 检测 APK 支持的 CPU 架构
 * @param {File} apkFile - 用户上传的 APK 文件对象
 * @returns {Promise<string>} 支持的架构，如 "arm64-v8a,armeabi-v7a"
 */
async function detectApkArchitecture(apkFile) {
  // 1. 读取文件为 ArrayBuffer
  const arrayBuffer = await apkFile.arrayBuffer();
  
  // 2. 用 JSZip 解压
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 3. 提取 lib/ 下的所有目录名
  const libDirs = new Set();
  zip.forEach((relativePath) => {
    if (relativePath.startsWith('lib/')) {
      const parts = relativePath.split('/');
      if (parts.length >= 2) {
        const arch = parts[1]; // 取 lib/ 后的第一部分
        if (arch) libDirs.add(arch);
      }
    }
  });

  // console.log('检测到的架构:', Array.from(libDirs).join(', ') || 'unknown');
  // 4. 返回检测结果
  const rst = Array.from(libDirs).join(', ') || 'unknown'
  const is32 = rst.includes('armeabi-v7a') || rst.includes('x86') ||rst.includes('armeabi');
  const is64 = rst.includes('arm64-v8a') || rst.includes('x86_64');
  if (is32 && is64)
    return "兼容包"
  else if (is32)
    return "x32"
  else if (is64)
    return "x64"
  else
    return "未知"
}

/**
 * 获取格式化日期时间
 * @param {string} format - 格式类型，可选值："d"、"h"、"m"、"s"
 * @param {Date} [date] - 可选，传入 Date 对象进行转换；不传则使用当前时间
 * @returns {string} 格式化后的日期时间字符串
 */
export function getFormattedDateTime(format = "d", date) {
  const now = date ? new Date(date) : new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  switch (format) {
    case "d":
      return `${year}-${month}-${day}`;
    case "h":
      return `${year}-${month}-${day} ${hours}`;
    case "m":
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case "s":
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return `${year}-${month}-${day} `; // 默认返回年月日
  }
}