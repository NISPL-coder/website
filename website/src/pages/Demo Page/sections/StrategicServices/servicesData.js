import { Network, Cloud, Radio, ShieldCheck, Layers, FileCheck2 } from 'lucide-react';
import imageCopy2 from '../../../../assets/image copy 2.png';
import imageCopy3 from '../../../../assets/image copy 3.png';
import imageCopy4 from '../../../../assets/image copy 4.png';
import imageCopy5 from '../../../../assets/image copy 5.png';
import imageCopy6 from '../../../../assets/image copy 6.png';
import imageCopy7 from '../../../../assets/image copy 7.png';

const SERVICES_ACCORDION = [
  {
    id: 'it-infrastructure',
    tabTitle: 'IT Infrastructure Management',
    icon: Network,
    tag: 'IT Infrastructure',
    mainHeading: 'IT Infrastructure Management',
    headline: 'High-Performance Enterprise Servers, Storage & Network Fabrics',
    description: 'Empowering mission-critical enterprise workloads with scalable, robust IT infrastructure built for maximum performance. We architect, deploy, and manage high-availability rack servers, carrier-neutral low-latency switching fabrics, secure high-density storage arrays, and enterprise-grade business Wi-Fi to support high-throughput operations across all your offices.',
    focus: 'Servers, Network, Storage, Enterprise Wi-Fi',
    badge: 'Redundant Core Architecture • Low-Latency Switching • High Data Availability',
    image: imageCopy3,
    bgImage: imageCopy3,
    showcaseBg: '#050a14',
    imgFit: 'cover',
    ctaText: 'Explore Infrastructure Solutions'
  },
  {
    id: 'cloud-server-hosting',
    tabTitle: 'Cloud Server & Hosting',
    icon: Cloud,
    tag: 'Cloud & Datacenter',
    mainHeading: 'Cloud Server & Hosting',
    headline: 'Scalable Enterprise VPS, Dedicated Cloud & Storage Infrastructure',
    description: 'Deploy high-performance virtual private servers, dedicated cloud instances, and automated offsite data storage with 99.95% uptime guarantees, enterprise DDoS defense, and seamless elastic scalability. Built to handle heavy database workloads and multi-branch enterprise applications with zero lag.',
    focus: 'Cloud VPS, Dedicated Compute, Encrypted Data Storage',
    badge: 'Tier-4 Datacenter • 99.95% SLA Uptime • Automated Daily Snapshots',
    image: imageCopy2,
    bgImage: imageCopy2,
    showcaseBg: '#050a14',
    imgFit: 'cover',
    ctaText: 'Deploy Cloud Server'
  },
  {
    id: 'managed-it-services',
    tabTitle: 'Managed IT Services',
    icon: Radio,
    tag: 'Managed IT & NOC',
    mainHeading: 'Managed IT Services',
    headline: '24/7 Proactive Network Operations Center & Enterprise AMC',
    description: 'Offload day-to-day IT complexities to our certified Network Operations Center (NOC). We monitor your servers, firewalls, workstations, and network switches around the clock with rapid emergency SLA dispatch, scheduled preventive maintenance, automated patching, and executive monthly uptime reports.',
    focus: '24/7 Monitoring, IT AMC, Remote Helpdesk, Preventive Audits',
    badge: 'Central NOC in Kolkata • < 15 Min Triage • SLA Hardware Replacement',
    image: imageCopy4,
    bgImage: imageCopy4,
    showcaseBg: '#050a14',
    imgFit: 'cover',
    ctaText: 'Consult Managed IT Specialist'
  },
  {
    id: 'cyber-security-solutions',
    tabTitle: 'Cyber Security Solutions',
    icon: ShieldCheck,
    tag: 'Zero-Trust Defense',
    mainHeading: 'Cyber Security Solutions',
    headline: 'Multi-Layered UTM Firewalls, Endpoint Defense & Threat Intelligence',
    description: 'Defend your enterprise perimeter against advanced malware, ransomware, phishing, and unauthorized intrusions with certified hardware UTM firewalls, encrypted VPN gateways, and centralized endpoint governance. Complete visibility and instant isolation of compromised devices before infections spread.',
    focus: 'UTM Firewalls, Endpoint Antivirus, Phishing Defense, Encryption',
    badge: 'Zero-Trust Architecture • Bank-Grade 256-Bit SSL • Real-Time Threat Isolation',
    image: imageCopy5,
    bgImage: imageCopy5,
    showcaseBg: '#050a14',
    imgFit: 'cover',
    ctaText: 'Schedule Security Assessment'
  },
  {
    id: 'microsoft-licensing',
    tabTitle: 'Microsoft Licensing',
    icon: Layers,
    tag: 'Cloud Workplace',
    mainHeading: 'Microsoft Licensing Solutions',
    headline: 'Genuine Microsoft 365, Windows Server & Modern Endpoint Governance',
    description: 'Maximize corporate collaboration and ensure enterprise compliance with genuine Microsoft cloud and licensing solutions. As an authorized partner, we provide turnkey deployment and migration for Microsoft 365 productivity suites, genuine Windows Server environments, Microsoft Entra ID identity governance, and Microsoft Intune device fleet management.',
    focus: 'Microsoft 365, Teams, OneDrive, Exchange, Entra ID, Intune',
    badge: 'Official Microsoft Solutions Partner • Volume Licensing Discounts • Turnkey Migration',
    image: imageCopy6,
    bgImage: imageCopy6,
    showcaseBg: '#0f172a',
    imgFit: 'cover',
    ctaText: 'Consult Microsoft Licensing Advisor'
  },
  {
    id: 'tallyprime-cloud',
    tabTitle: 'TallyPrime & Tally On Cloud',
    icon: FileCheck2,
    tag: 'Accounting & ERP',
    mainHeading: 'TallyPrime & Tally On Cloud',
    headline: 'Anywhere Connected Accounting, GST Compliance & High-Speed Cloud VPS',
    description: 'Run your complete TallyPrime accounting, inventory, and GST compliance software securely over the cloud from any Windows, Mac, or mobile device with zero latency. Features automated hourly encrypted backups, direct connected banking, instant e-Invoice generation, and multi-branch data synchronization.',
    focus: 'Tally on Cloud, Anywhere Access, Auto Backups, GST Invoicing',
    badge: 'Certified 3-Star Tally Partner • 256-Bit SSL Encryption • 99.9% Cloud Uptime',
    image: imageCopy7,
    bgImage: imageCopy7,
    showcaseBg: '#ffffff',
    imgFit: 'contain',
    ctaText: 'Request Tally Consultation'
  }
];

export { SERVICES_ACCORDION };
