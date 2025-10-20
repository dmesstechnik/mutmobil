const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withPodfileFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');
        
        // Only add if not already present
        if (!podfileContent.includes("pod 'RCT-Folly'")) {
          const targetMatch = podfileContent.match(/target ['"].*?['"] do/);
          
          if (targetMatch) {
            // Add all the React Native core dependencies that RNN needs
            const requiredPods = `# Fix for React Native Navigation dependencies
pod 'RCT-Folly', :podspec => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'

`;
            
            podfileContent = podfileContent.replace(
              targetMatch[0],
              requiredPods + targetMatch[0]
            );
            
            fs.writeFileSync(podfilePath, podfileContent, 'utf8');
            console.log('✅ Added RCT-Folly to Podfile');
          }
        }
      }
      
      return config;
    },
  ]);
};