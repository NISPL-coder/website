import React, { useState } from 'react';
import { 
  Server, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  Cpu, 
  HardDrive, 
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export default function CloudInstancesSection({ instance, customerName }) {
  const [isRestarting, setIsRestarting] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const handleCopyIp = () => {
    if (instance?.ipAddress) {
      navigator.clipboard.writeText(`${instance.ipAddress}:${instance.rdpPort}`);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const handleRestart = () => {
    setIsRestarting(true);
    setActionMsg('Initiating safe server reboot...');
    setTimeout(() => {
      setIsRestarting(false);
      setActionMsg('Cloud node reboot completed successfully. All services online.');
      setTimeout(() => setActionMsg(''), 4000);
    }, 1800);
  };

  const handleDownloadRdp = () => {
    const rdpContent = `full address:s:${instance.ipAddress}:${instance.rdpPort}\nprompt for credentials:i:1\nadministrative session:i:1`;
    const blob = new Blob([rdpContent], { type: 'application/x-rdp' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${instance.serverName || 'nispl-cloud'}.rdp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!instance) return null;

  return (
    <div className="cust-section-card">
      <div className="cust-section-card-header">
        <div className="cust-section-card-title-group">
          <div className="cust-section-card-icon-bubble">
            <Server size={18} color="#0284c7" />
          </div>
          <div>
            <h3 className="cust-section-title">Dedicated Cloud Instances</h3>
            <span className="cust-section-desc">Manage your high-speed cloud server running Tally Prime with automated snapshots.</span>
          </div>
        </div>

        <div className="cust-section-header-actions">
          <button
            type="button"
            className="cust-btn-secondary"
            onClick={handleRestart}
            disabled={isRestarting}
          >
            <RefreshCw size={14} className={isRestarting ? 'animate-spin' : ''} />
            <span>{isRestarting ? 'Rebooting...' : 'Restart Node'}</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="cust-alert-success animate-fade-in" style={{ margin: '14px 20px 0 20px' }}>
          <CheckCircle2 size={16} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Instance Detail Box */}
      <div className="cust-instance-card">
        <div className="cust-instance-top">
          <div className="cust-instance-name-wrap">
            <div className="cust-node-status-dot" />
            <div>
              <h4 className="cust-instance-hostname">{instance.serverName}</h4>
              <span className="cust-instance-specs-text">
                Windows Server 2022 • {instance.tallyPrimeVersion}
              </span>
            </div>
          </div>

          <div className="cust-instance-ip-wrap">
            <span className="cust-ip-text">
              {instance.ipAddress}:{instance.rdpPort}
            </span>
            <button
              type="button"
              onClick={handleCopyIp}
              className="cust-ip-copy-btn"
              title="Copy RDP Host"
            >
              {copiedIp ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Specs Pill Grid */}
        <div className="cust-instance-specs-grid">
          <div className="cust-spec-pill">
            <Cpu size={14} color="#0284c7" />
            <span>{instance.cpu}</span>
          </div>
          <div className="cust-spec-pill">
            <Server size={14} color="#8b5cf6" />
            <span>{instance.ram}</span>
          </div>
          <div className="cust-spec-pill">
            <HardDrive size={14} color="#f59e0b" />
            <span>{instance.storage}</span>
          </div>
          <div className="cust-spec-pill">
            <ShieldCheck size={14} color="#10b981" />
            <span>Daily Backup Active</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="cust-instance-footer">
          <button
            type="button"
            className="cust-btn-primary"
            onClick={handleDownloadRdp}
            title="Download Remote Desktop Connection File"
          >
            <Download size={15} />
            <span>Download RDP Client</span>
          </button>

          <a
            href={`http://${instance.ipAddress}:${instance.webPort || 8443}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cust-btn-outline"
            title="Open Web Browser Access for Tally"
          >
            <ExternalLink size={15} />
            <span>Launch Web Access</span>
          </a>
        </div>
      </div>
    </div>
  );
}
