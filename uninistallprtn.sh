# Stop Application
kill -2 $(ps aux | grep PivotSecurity.app | awk '{print $2}') &> /dev/null || true
sudo launchctl unload /Library/LaunchAgents/com.pivot.security.client.plist &> /dev/null || true
sudo launchctl unload /Library/LaunchDaemons/com.pivot.security.service.plist &> /dev/null || true

sudo rm -rf /Applications/PivotSecurity.app
sudo rm -f /Library/LaunchAgents/com.pivot.security.client.plist
sudo rm -f /Library/LaunchDaemons/com.pivot.security.service.plist
sudo rm -f /private/var/db/receipts/com.pivot.security.pkg.PivotSecurity.plist

# Profile Files
rm -rf ~/Library/Application Support/PivotSecurity
rm -rf ~/Library/Caches/pritunl
rm -rf ~/Library/Preferences/com.pivot.security.plist

echo "###################################################"
echo "Uninstallation Successful"
echo "###################################################"
