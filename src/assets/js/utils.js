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

// /**
//  * 从 APK 中提取图标
//  * @param {File} apkFile - 用户上传的 APK 文件
//  * @returns {Promise<string>} - Base64 格式的图标
//  */
// export async function extractApkIcon(apkFile) {
//   const zip = await JSZip.loadAsync(await apkFile.arrayBuffer());
  
//   // APK 图标可能路径（需根据实际 APK 调整）
//   const possibleIconPaths = [
//     'res/drawable-hdpi/ic_launcher.png',
//     'res/mipmap-hdpi/ic_launcher.png',
//     'res/drawable/icon.png'
//   ];

//   for (const path of possibleIconPaths) {
//     const iconFile = zip.file(path);
//     if (iconFile) {
//       return `data:image/png;base64,${await iconFile.async('base64')}`;
//     }
//   }
//   return null; // 未找到图标
// }

// /**
//  * 从 IPA 中提取图标
//  * @param {File} ipaFile - 用户上传的 IPA 文件
//  * @returns {Promise<string>} - Base64 格式的图标
//  */
// export async function extractIpaIcon(ipaFile) {
//   const zip = await JSZip.loadAsync(await ipaFile.arrayBuffer());
  
//   // 查找 IPA 中的 Info.plist 获取图标名
//   const plistFile = zip.file(/Payload\/.*\.app\/Info\.plist/)[0];
//   if (!plistFile) return null;
  
//   const plistData = await plistFile.async('text');
//   const iconName = parsePlistForIconName(plistData); // 从 plist 解析图标名
  
//   // 查找图标文件
//   const iconPath = `Payload/${Object.keys(zip.files)[0]}/${iconName}`;
//   const iconFile = zip.file(iconPath);
//   return iconFile 
//     ? `data:image/png;base64,${await iconFile.async('base64')}` 
//     : null;
// }


// // 解析Info.plist获取图标名
// function parsePlistForIconName(plistText) {
//   const match = plistText.match(/<key>CFBundleIconFile<\/key>\s*<string>([^<]+)/);
//   return match ? match[1] + '.png' : 'AppIcon60x60@2x.png';
// }