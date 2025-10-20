const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withRCTFolly(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // Ensure we have the CDN
      if (!podfile.includes("source 'https://github.com/facebook/react-native.git'")) {
        podfile = "source 'https://github.com/facebook/react-native.git'\nsource 'https://cdn.cocoapods.org/'\n" + podfile;
      }

      // Force RCT-Folly version
      if (!podfile.includes("pod 'RCT-Folly'")) {
        podfile += "\npod 'RCT-Folly', :podspec => '../node_modules/react-native/third-party-podspecs/RCT-Folly.podspec'";
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};
