const fs = require('fs');
const path = require('path');

const iosDir = path.join(__dirname, '..', 'ios');
const podfilePath = path.join(iosDir, 'Podfile');

// Wait a bit to ensure ios folder exists
setTimeout(() => {
  if (fs.existsSync(podfilePath)) {
    let podfileContent = fs.readFileSync(podfilePath, 'utf8');
    
    // Add RCT-Folly podspec if not already present
    if (!podfileContent.includes('RCT-Folly')) {
      const follyPodspec = "\npod 'RCT-Folly', :podspec => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'\n";
      
      // Insert after platform declaration
      podfileContent = podfileContent.replace(
        /(platform :ios, ['"][0-9.]+['"])/,
        `$1${follyPodspec}`
      );
      
      fs.writeFileSync(podfilePath, podfileContent, 'utf8');
      console.log('✅ Successfully added RCT-Folly to Podfile');
    }
  } else {
    console.log('⚠️ Podfile not found yet - it will be generated during prebuild');
  }
}, 1000);