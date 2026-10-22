import React, { useState } from 'react';
import { 
  Server, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Network, 
  Leaf, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import victoriaMemorialImg from '../../../../assets/ctrls_kolkata_datacenter.jpg';
import './CtrlSKolkataSection.css';

const METRIC_CARDS = [
  {
    id: 'rated-4',
    icon: Zap,
    badge: 'Certified Architecture',
    value: 'Rated-4',
    title: 'Fault-Tolerant Infrastructure',
    description: 'Guarantees 99.995% uptime SLA with active dual power feeds (N+N redundancy) and concurrently maintainable design with zero single point of failure.',
    highlight: '99.995% Uptime SLA'
  },
  {
    id: 'capacity',
    icon: Server,
    badge: 'Bengal Silicon Valley',
    value: '16 MW',
    title: 'Initial Scalable IT Load',
    description: 'Phase 1 delivers 16 MW capacity with 1,137 high-density racks across 0.44 Lakh Sq. Ft., with a roadmap scaling to a 60 MW mega enterprise campus.',
    highlight: 'Roadmap to 60 MW'
  },
  {
    id: 'ai-ready',
    icon: Cpu,
    badge: 'Next-Gen Compute',
    value: 'AI & GPU',
    title: 'Liquid-Cooled Workloads',
    description: 'Engineered for dense generative AI and hyperscale workloads with specialized high-wattage rack footprints and advanced liquid cooling readiness.',
    highlight: 'High-Density Racks'
  },
  {
    id: 'security',
    icon: ShieldCheck,
    badge: 'Military Grade',
    value: '9-Zone',
    title: 'Layered Security Perimeter',
    description: 'Robust defense comprising biometric authentication, vehicle traps, infrared beam barriers, and 24/7/365 command center NOC/SOC monitoring.',
    highlight: 'Zero-Trust Physical Shield'
  },
  {
    id: 'connectivity',
    icon: Network,
    badge: 'Carrier Neutral',
    value: '<2 ms',
    title: 'Ultra-Low Latency Mesh',
    description: 'Redundant fiber ring interconnects with multiple Tier-1 telecom carriers, NIXI internet exchange, and low-latency cloud direct connects.',
    highlight: 'Multi-ISP Redundancy'
  },
  {
    id: 'sustainability',
    icon: Leaf,
    badge: 'Eco Engineering',
    value: 'LEED',
    title: 'Platinum Green Facility',
    description: 'Designed for seismic Zone-3 compliance with ultra-efficient PUE metrics, rainwater harvesting, and solar-supplemented renewable energy feeds.',
    highlight: 'Platinum Compliant PUE'
  }
];

const SOLUTION_TABS = [
  {
    id: 'colocation',
    label: 'Enterprise Colocation',
    heading: 'High-Density Dedicated Cabinets & Secure Private Suites',
    text: 'Purpose-built for financial institutions, government departments, and multinational corporations requiring dedicated caged suites, custom pod power densities, and private access corridors.',
    points: [
      'Tailored power densities from 5 kW up to 30+ kW per rack',
      'Dual active power paths with autonomous diesel backup generators',
      'Hot/cold aisle containment for maximum thermal efficiency',
      'Direct hands-on Remote Smart Hands support 24/7/365'
    ]
  },
  {
    id: 'ai-hyperscale',
    label: 'AI & GPU Compute',
    heading: 'Engineered for Heavy AI Model Training & Inference',
    text: 'Built to host modern GPU clusters (NVIDIA HGX / H100 / A100) with hybrid air-to-liquid cooling architecture, preventing thermal throttling for large language models and compute tasks.',
    points: [
      'Liquid-to-chip & rear-door heat exchanger infrastructure',
      'High-bandwidth, low-jitter RDMA InfiniBand network fabric',
      'Continuous uninterrupted peak wattage delivery without degradation',
      'Optimal floor load distribution rated for heavy dense clusters'
    ]
  },
  {
    id: 'dr-bcp',
    label: 'Disaster Recovery Hub',
    heading: 'Strategic Geo-Resilient Disaster Recovery for Eastern India',
    text: 'Position Kolkata as your secondary or primary disaster recovery site. Shield mission-critical databases and ERPs with low replication latency to Mumbai, Delhi, and Bangalore hubs.',
    points: [
      'Near-zero RPO (Recovery Point) & sub-minute RTO capability',
      'Geographically independent power grid feeds and telecom rings',
      'Dedicated warm & hot seat enterprise disaster recovery work areas',
      'Comprehensive compliance with RBI, SEBI, and IRDAI DR directives'
    ]
  },
  {
    id: 'cloud-interconnect',
    label: 'Direct Cloud On-Ramp',
    heading: 'Private Express Routes to Global Hyperscalers',
    text: 'Bypass the public internet. Connect private enterprise infrastructure directly to AWS Direct Connect, Microsoft Azure ExpressRoute, and Google Cloud Interconnect.',
    points: [
      'Sub-5 millisecond private interconnect to major cloud regions',
      'Eliminates internet egress jitter and packet loss',
      'Enterprise-grade end-to-end encrypted interconnect links',
      'Bandwidth burstability on-demand up to 100 Gbps'
    ]
  }
];

export default function CtrlSKolkataSection({ onOpenConsultation }) {
  const [activeTab, setActiveTab] = useState(SOLUTION_TABS[0].id);
  const currentTab = SOLUTION_TABS.find((t) => t.id === activeTab) || SOLUTION_TABS[0];

  return (
    <section className="ctrls-kolkata-showcase" id="ctrls-kolkata-datacenter">
      {/* Background Cyber Ambient Lights */}
      <div className="ctrls-ambient-glow ctrls-glow-left" aria-hidden="true" />
      <div className="ctrls-ambient-glow ctrls-glow-right" aria-hidden="true" />

      <div className="ctrls-container">
        
        {/* =====================================================================
            1. TOP HERO BANNER (RECREATING THE REFERENCE IMAGE EXACTLY)
            ===================================================================== */}
        <div className="ctrls-hero-card">
          {/* Top Brand & Partnership Header */}
          <div className="ctrls-brand-row">
            <div className="ctrls-brand-badge-wrap">
              <a 
                href="https://www.ctrls.com/datacenter-kolkata/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ctrls-brand-lockup"
                title="CtrlS Datacenters - Asia's Largest Rated 4 Datacenter"
              >
                <div className="ctrls-brand-wordmark">
                  <span className="ctrls-word-ctrl">Ctrl</span>
                  <span className="ctrls-word-s">S</span>
                  <span className="ctrls-word-tm">™</span>
                </div>
                <div className="ctrls-brand-subtext">
                  <span>Asia's Largest</span>
                  <span>Rated 4 Datacenter</span>
                </div>
              </a>
            </div>
          </div>

          {/* Banner Main Grid: Headline Left + Victoria Memorial Right */}
          <div className="ctrls-hero-grid">
            <div className="ctrls-hero-text-col">
              <h2 className="ctrls-main-headline">
                Kolkata Data Center
              </h2>

              <p className="ctrls-main-subtitle">
                Kolkata, a key digital hub in eastern India, hosts a world-class Rated-4 Datacenter to serve enterprise and hyperscale needs.
              </p>

              <div className="ctrls-hero-quick-specs">
                <div className="ctrls-quick-pill">
                  <span className="ctrls-qp-num">16 MW</span>
                  <span className="ctrls-qp-label">Initial Capacity</span>
                </div>
                <div className="ctrls-quick-divider" />
                <div className="ctrls-quick-pill">
                  <span className="ctrls-qp-num">99.995%</span>
                  <span className="ctrls-qp-label">Uptime SLA</span>
                </div>
                <div className="ctrls-quick-divider" />
                <div className="ctrls-quick-pill">
                  <span className="ctrls-qp-num">Rated-4</span>
                  <span className="ctrls-qp-label">Fault Tolerant</span>
                </div>
              </div>

              <div className="ctrls-hero-actions">
                <button 
                  type="button" 
                  className="ctrls-primary-btn"
                  onClick={onOpenConsultation}
                >
                  <span>Book Datacenter Tour / Consultation</span>
                  <ArrowRight size={15} />
                </button>
                <a 
                  href="https://www.ctrls.com/datacenter-kolkata/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="ctrls-outline-link"
                >
                  <span>Official CtrlS Portal</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Right: Victoria Memorial Monochrome Architectural Graphic with Tech Accents */}
            <div className="ctrls-hero-image-col">
              <div className="ctrls-image-frame">
                <img 
                  src={victoriaMemorialImg} 
                  alt="Victoria Memorial Kolkata with Modern Cyber Tech Datacenter Overlay" 
                  className="ctrls-monochrome-monument"
                  loading="lazy"
                  decoding="async"
                />
                
                <div className="ctrls-hud-badge bottom-left">
                  <Layers size={12} className="text-cyan-400" />
                  <span>1,137 High-Density Racks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
