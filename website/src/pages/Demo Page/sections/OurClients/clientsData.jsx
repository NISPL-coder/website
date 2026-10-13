import React from 'react';

// Import all 16 client logos matching user reference screenshot
import deptOfFisheriesImg from '../../../../assets/clients/dept-of-fisheries.png';
import nitttrKolkataImg from '../../../../assets/clients/nitttr-kolkata.png';
import tataSteelImg from '../../../../assets/clients/tata-steel.png';
import burdwanUnivImg from '../../../../assets/clients/burdwan-university.png';
import oistImg from '../../../../assets/clients/oist.png';
import stXaviersImg from '../../../../assets/clients/st-xaviers-burdwan.png';
import ncdcImg from '../../../../assets/clients/ncdc.png';
import phidclImg from '../../../../assets/clients/phidcl.png';
import westinghouseImg from '../../../../assets/clients/westinghouse-saxby.png';
import sampurnaImg from '../../../../assets/clients/sampurna-finance.png';
import uttrayanImg from '../../../../assets/clients/uttrayan.png';
import theLindsayImg from '../../../../assets/clients/the-lindsay.png';
import infinityImg from '../../../../assets/clients/infinity.png';
import sawansukhaImg from '../../../../assets/clients/sawansukha.png';
import pannaImg from '../../../../assets/clients/panna-jewellers.png';
import wbLabourWelfareImg from '../../../../assets/clients/wb-labour-welfare.png';

const CLIENT_SHOWCASE_LOGOS = [
  // ── Row 1 ──
  {
    id: 'dept-of-fisheries',
    name: 'Department of Fisheries, Government of West Bengal',
    category: 'Government',
    image: deptOfFisheriesImg,
    render: () => (
      <div className="demo-client-card" title="Department of Fisheries, Govt. of West Bengal">
        <img 
          src={deptOfFisheriesImg} 
          alt="Department of Fisheries Government of West Bengal" 
          className="client-showcase-img img-fisheries" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'nitttr-kolkata',
    name: 'NITTTR Kolkata',
    category: 'Education',
    image: nitttrKolkataImg,
    render: () => (
      <div className="demo-client-card" title="NITTTR Kolkata">
        <img 
          src={nitttrKolkataImg} 
          alt="NITTTR Kolkata" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'tata-steel',
    name: 'TATA STEEL',
    category: 'Enterprise',
    image: tataSteelImg,
    render: () => (
      <div className="demo-client-card" title="Tata Steel">
        <img 
          src={tataSteelImg} 
          alt="Tata Steel" 
          className="client-showcase-img img-tatasteel" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'burdwan-university',
    name: 'The University of Burdwan',
    category: 'Education',
    image: burdwanUnivImg,
    render: () => (
      <div className="demo-client-card" title="The University of Burdwan">
        <img 
          src={burdwanUnivImg} 
          alt="The University of Burdwan" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'oist',
    name: 'Oriental Institute of Science and Technology',
    category: 'Education',
    image: oistImg,
    render: () => (
      <div className="demo-client-card" title="Oriental Institute of Science and Technology">
        <img 
          src={oistImg} 
          alt="Oriental Institute of Science and Technology" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'st-xaviers-burdwan',
    name: "St. Xavier's College - Burdwan",
    category: 'Education',
    image: stXaviersImg,
    render: () => (
      <div className="demo-client-card" title="St. Xavier's College - Burdwan">
        <img 
          src={stXaviersImg} 
          alt="St. Xavier's College - Burdwan" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </div>
    )
  },

  // ── Row 2 ──
  {
    id: 'ncdc',
    name: 'National Co-operative Development Corporation',
    category: 'Government',
    image: ncdcImg,
    render: () => (
      <div className="demo-client-card" title="National Co-operative Development Corporation">
        <img 
          src={ncdcImg} 
          alt="National Co-operative Development Corporation" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'phidcl',
    name: 'PHIDCL West Bengal',
    category: 'Government',
    image: phidclImg,
    render: () => (
      <div className="demo-client-card" title="PHIDCL West Bengal">
        <img 
          src={phidclImg} 
          alt="PHIDCL West Bengal" 
          className="client-showcase-img img-phidcl" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'westinghouse-saxby',
    name: 'Westinghouse Saxby Farmer Limited (Govt. of West Bengal)',
    category: 'Government',
    image: westinghouseImg,
    render: () => (
      <div className="demo-client-card" title="Westinghouse Saxby Farmer Limited">
        <img 
          src={westinghouseImg} 
          alt="Westinghouse Saxby Farmer Limited" 
          className="client-showcase-img img-westinghouse" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'sampurna-finance',
    name: 'Sampurna Finance',
    category: 'Financial Services',
    image: sampurnaImg,
    render: () => (
      <div className="demo-client-card" title="Sampurna Finance">
        <img 
          src={sampurnaImg} 
          alt="Sampurna Finance" 
          className="client-showcase-img img-sampurna" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'uttrayan',
    name: 'Uttrayan Financial Services',
    category: 'Financial Services',
    image: uttrayanImg,
    render: () => (
      <div className="demo-client-card" title="Uttrayan">
        <img 
          src={uttrayanImg} 
          alt="Uttrayan" 
          className="client-showcase-img img-uttrayan" 
          loading="lazy" 
        />
      </div>
    )
  },

  // ── Row 3 ──
  {
    id: 'the-lindsay',
    name: 'The Lindsay Kolkata',
    category: 'Hospitality',
    image: theLindsayImg,
    render: () => (
      <div className="demo-client-card" title="The Lindsay Kolkata">
        <img 
          src={theLindsayImg} 
          alt="The Lindsay Kolkata" 
          className="client-showcase-img img-lindsay" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'infinity',
    name: 'Infinity',
    category: 'Enterprise',
    image: infinityImg,
    render: () => (
      <div className="demo-client-card" title="Infinity">
        <img 
          src={infinityImg} 
          alt="Infinity" 
          className="client-showcase-img img-infinity" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'sawansukha',
    name: 'Sawansukha Jewellers',
    category: 'Retail & Luxury',
    image: sawansukhaImg,
    render: () => (
      <div className="demo-client-card" title="Sawansukha">
        <img 
          src={sawansukhaImg} 
          alt="Sawansukha" 
          className="client-showcase-img img-sawansukha" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'panna-jewellers',
    name: 'Panna Diamond World Jewellers',
    category: 'Retail & Luxury',
    image: pannaImg,
    render: () => (
      <div className="demo-client-card demo-client-card-dark" title="Panna Diamond World Jewellers">
        <img 
          src={pannaImg} 
          alt="Panna Diamond World Jewellers" 
          className="client-showcase-img img-panna" 
          loading="lazy" 
        />
      </div>
    )
  },
  {
    id: 'wb-labour-welfare',
    name: 'West Bengal Labour Welfare Board',
    category: 'Government',
    image: wbLabourWelfareImg,
    render: () => (
      <div className="demo-client-card" title="West Bengal Labour Welfare Board">
        <img 
          src={wbLabourWelfareImg} 
          alt="West Bengal Labour Welfare Board" 
          className="client-showcase-img img-wblabour" 
          loading="lazy" 
        />
      </div>
    )
  }
];

export { CLIENT_SHOWCASE_LOGOS };
