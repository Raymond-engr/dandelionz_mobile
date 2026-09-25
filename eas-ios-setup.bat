@echo off
echo ==============================================
echo Dandelionz Mobile: EAS iOS Setup
echo ==============================================
echo.

:: Set App Store Connect API Key variables to bypass Apple ID login bug
set EXPO_ASC_KEY_ID=NC74DWKK9Z
set EXPO_ASC_ISSUER_ID=d55549c9-f9dd-4271-a746-eb5ffd6927e3
set EXPO_ASC_API_KEY_PATH=C:/Users/PC/Downloads/AuthKey_NC74DWKK9Z.p8
set EXPO_NO_CAPABILITY_SYNC=1

echo Step 1: Checking your current Expo login status...
call eas whoami
echo.
echo Step 2: Apple Credentials Setup
echo EAS will now use your provided API key to authenticate and set up certificates.
echo (Make sure to generate the APNs auth key for Push Notifications!)
echo ----------------------------------------------
call eas credentials
echo ----------------------------------------------
echo.
echo Step 3: Register your physical iPhone
echo EAS will provide a QR code to scan on your iPhone to register its UDID.
echo ----------------------------------------------
call eas device:create
echo ----------------------------------------------
echo.
echo Step 4: Start the iOS Preview Build
echo This will build the app and give you a QR code to install it!
echo ----------------------------------------------
call eas build --platform ios --profile preview
echo ----------------------------------------------
echo.
echo Build process complete!
pause