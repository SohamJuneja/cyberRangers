import subprocess
import json
from datetime import datetime
import os

class DefenseSelector:
    def __init__(self):
        self.log_file = r"d:\CyberProject\V2\backend\logs\defense_actions.json"
        self.firewall_blocked = set()
        self.limited_ips = {}
        
        # Ensure log directory is available
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
    
    def select_defense(self, threat_score, traffic_features):
        """Choose defense strategy based on threat intensity and traffic behavior"""
        if threat_score > 0.8:
            return self.block_ip(traffic_features)
        elif threat_score > 0.5:
            return self.apply_rate_limiting(traffic_features)
        elif threat_score > 0.3:
            return self.increase_monitoring(traffic_features)
        return "No defense action required"

    def block_ip(self, traffic_features):
        """Use Windows Firewall to deny access from hostile IP"""
        source_ip = traffic_features.get('source_ip', '')
        if source_ip and source_ip not in self.firewall_blocked:
            try:
                rule = f"DDoS_Block_{source_ip}"
                cmd = f'netsh advfirewall firewall add rule name="{rule}" dir=in action=block remoteip={source_ip}'
                subprocess.run(cmd, shell=True, check=True)
                
                self.firewall_blocked.add(source_ip)
                self._record_action("ip_block", source_ip, traffic_features)
                return f"Blocked IP: {source_ip}"
            except subprocess.CalledProcessError as err:
                return f"Error blocking IP: {str(err)}"
        return "IP is already blocked or invalid"

    def apply_rate_limiting(self, traffic_features):
        """Enable firewall-based rate limiting for the incoming IP"""
        source_ip = traffic_features.get('source_ip', '')
        if source_ip and source_ip not in self.limited_ips:
            try:
                rule = f"DDoS_RateLimit_{source_ip}"
                cmd = f'netsh advfirewall firewall add rule name="{rule}" dir=in action=allow remoteip={source_ip} enable=yes'
                subprocess.run(cmd, shell=True, check=True)
                
                self.limited_ips[source_ip] = datetime.now()
                self._record_action("rate_limit", source_ip, traffic_features)
                return f"Rate limiting applied to IP: {source_ip}"
            except subprocess.CalledProcessError as err:
                return f"Error applying rate limit: {str(err)}"
        return "IP is already limited or invalid"

    def increase_monitoring(self, traffic_features):
        """Flag the source IP for enhanced traffic observation"""
        source_ip = traffic_features.get('source_ip', '')
        self._record_action("increased_monitoring", source_ip, traffic_features)
        return f"Monitoring increased for IP: {source_ip}"

    def _record_action(self, action, ip, traffic_data):
        """Write defense activity into a JSON-based log"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "ip": ip,
            "traffic_features": traffic_data
        }

        try:
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r') as file:
                    existing_logs = json.load(file)
            else:
                existing_logs = []
            
            existing_logs.append(entry)

            with open(self.log_file, 'w') as file:
                json.dump(existing_logs, file, indent=4)
        except Exception as err:
            print(f"Logging error: {str(err)}")
