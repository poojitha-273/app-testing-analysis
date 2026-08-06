/**
 * Appium Android Test Configuration for BloodAI Native Android Mobile Application
 */
export const appiumConfig = {
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:platformVersion': '13.0',
    'appium:appPackage': 'com.bloodai.app',
    'appium:appActivity': '.MainActivity',
    'appium:app': './mobile/android/app/build/outputs/apk/debug/app-debug.apk',
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:newCommandTimeout': 180,
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true
  }
};
