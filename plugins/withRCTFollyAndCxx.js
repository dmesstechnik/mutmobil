const { withPodfileProperties } = require('@expo/config-plugins');

function withRCTFollyAndCxx(config) {
  return withPodfileProperties(config, (props) => {
    props.modifications = (podfile) => {
      // Add CocoaPods CDN if missing
      if (!podfile.includes("source 'https://cdn.cocoapods.org/'")) {
        podfile = "source 'https://cdn.cocoapods.org/'\n" + podfile;
      }

      // Force C++14 for all targets
      podfile += `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['OTHER_CPLUSPLUSFLAGS'] = '-std=c++14'
    end
  end
end
`;

      return podfile;
    };
    return props;
  });
}

module.exports = withRCTFollyAndCxx;
