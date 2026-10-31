import React from 'react';

// Import all 16 client logos matching user reference screenshot
import deptOfFisheriesImg from '../../../../assets/clients/dept-of-fisheries.png';
import nitttrKolkataImg from '../../../../assets/clients/nitttr-kolkata.png';
import tataSteelImg from '../../../../assets/clients/tata-steel.png';
import burdwanUnivImg from '../../../../assets/clients/burdwan-university.png';
import oistImg from '../../../../assets/clients/oist.png';
import stXaviersImg from '../../../../assets/clients/st-xaviers-burdwan.png';
import ncdcImg from '../../../../assets/clients/ncdc.webp';
import phidclImg from '../../../../assets/clients/phidcl.png';
import westinghouseImg from '../../../../assets/clients/westinghouse-saxby.png';
import sampurnaImg from '../../../../assets/clients/sampurna-finance.jpg';
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
    website: 'https://wbsfdcltd.com/',
    image: deptOfFisheriesImg,
    render: () => (
      <a 
        href="https://wbsfdcltd.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Department of Fisheries, Govt. of West Bengal - Official Website"
      >
        <img 
          src={deptOfFisheriesImg} 
          alt="Department of Fisheries Government of West Bengal" 
          className="client-showcase-img img-fisheries" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'nitttr-kolkata',
    name: 'NITTTR Kolkata',
    category: 'Education',
    website: 'https://www.nitttrkol.ac.in/',
    image: nitttrKolkataImg,
    render: () => (
      <a 
        href="https://www.nitttrkol.ac.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="NITTTR Kolkata - Official Website"
      >
        <img 
          src={nitttrKolkataImg} 
          alt="NITTTR Kolkata" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'tata-steel',
    name: 'TATA STEEL',
    category: 'Enterprise',
    website: 'https://www.tatasteel.com/',
    image: tataSteelImg,
    render: () => (
      <a 
        href="https://www.tatasteel.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Tata Steel - Official Website"
      >
        <img 
          src={tataSteelImg} 
          alt="Tata Steel" 
          className="client-showcase-img img-tatasteel" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'burdwan-university',
    name: 'The University of Burdwan',
    category: 'Education',
    website: 'https://www.buruniv.ac.in/',
    image: burdwanUnivImg,
    render: () => (
      <a 
        href="https://www.buruniv.ac.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="The University of Burdwan - Official Website"
      >
        <img 
          src={burdwanUnivImg} 
          alt="The University of Burdwan" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'oist',
    name: 'Oriental Institute of Science and Technology',
    category: 'Education',
    website: 'https://oistbpl.com/',
    image: oistImg,
    render: () => (
      <a 
        href="https://oistbpl.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Oriental Institute of Science and Technology - Official Website"
      >
        <img 
          src={oistImg} 
          alt="Oriental Institute of Science and Technology" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'st-xaviers-burdwan',
    name: "St. Xavier's College - Burdwan",
    category: 'Education',
    website: 'https://sxcb.edu.in/',
    image: stXaviersImg,
    render: () => (
      <a 
        href="https://sxcb.edu.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="St. Xavier's College - Burdwan - Official Website"
      >
        <img 
          src={stXaviersImg} 
          alt="St. Xavier's College - Burdwan" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </a>
    )
  },

  // ── Row 2 ──
  {
    id: 'ncdc',
    name: 'National Co-operative Development Corporation',
    category: 'Government',
    website: 'https://www.ncdc.in/',
    image: ncdcImg,
    render: () => (
      <a 
        href="https://www.ncdc.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="National Co-operative Development Corporation - Official Website"
      >
        <img 
          src={ncdcImg} 
          alt="National Co-operative Development Corporation" 
          className="client-showcase-img img-circular" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'phidcl',
    name: 'PHIDCL West Bengal',
    category: 'Government',
    website: 'https://www.wbphidcl.com/',
    image: phidclImg,
    render: () => (
      <a 
        href="https://www.wbphidcl.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="PHIDCL West Bengal - Official Website"
      >
        <img 
          src={phidclImg} 
          alt="PHIDCL West Bengal" 
          className="client-showcase-img img-phidcl" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'westinghouse-saxby',
    name: 'Westinghouse Saxby Farmer Limited (Govt. of West Bengal)',
    category: 'Government',
    website: 'https://www.wsf-ltd.co.in/',
    image: westinghouseImg,
    render: () => (
      <a 
        href="https://www.wsf-ltd.co.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Westinghouse Saxby Farmer Limited - Official Website"
      >
        <img 
          src={westinghouseImg} 
          alt="Westinghouse Saxby Farmer Limited" 
          className="client-showcase-img img-westinghouse" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'sampurna-finance',
    name: 'Sampurna Finance',
    category: 'Financial Services',
    website: 'https://sampurnafinance.com/',
    image: sampurnaImg,
    render: () => (
      <a 
        href="https://sampurnafinance.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Sampurna Finance - Official Website"
      >
        <img 
          src={sampurnaImg} 
          alt="Sampurna Finance" 
          className="client-showcase-img img-sampurna" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'uttrayan',
    name: 'Uttrayan Financial Services',
    category: 'Financial Services',
    website: 'https://uttrayan-mfi.com',
    image: uttrayanImg,
    render: () => (
      <a 
        href="https://uttrayan-mfi.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Uttrayan Financial Services - Official Website"
      >
        <img 
          src={uttrayanImg} 
          alt="Uttrayan" 
          className="client-showcase-img img-uttrayan" 
          loading="lazy" 
        />
      </a>
    )
  },

  // ── Row 3 ──
  {
    id: 'the-lindsay',
    name: 'The Lindsay Kolkata',
    category: 'Hospitality',
    website: 'https://www.thelindsay.in/',
    image: theLindsayImg,
    render: () => (
      <a 
        href="https://www.thelindsay.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="The Lindsay Kolkata - Official Website"
      >
        <img 
          src={theLindsayImg} 
          alt="The Lindsay Kolkata" 
          className="client-showcase-img img-lindsay" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'infinity',
    name: 'Infinity',
    category: 'Enterprise',
    website: 'https://www.infinityitpark.com/',
    image: infinityImg,
    render: () => (
      <a 
        href="https://www.infinityitpark.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Infinity Infotech Parks - Official Website"
      >
        <img 
          src={infinityImg} 
          alt="Infinity" 
          className="client-showcase-img img-infinity" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'sawansukha',
    name: 'Sawansukha Jewellers',
    category: 'Retail & Luxury',
    website: 'https://www.sawansukha.com/',
    image: sawansukhaImg,
    render: () => (
      <a 
        href="https://www.sawansukha.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="Sawansukha Jewellers - Official Website"
      >
        <img 
          src={sawansukhaImg} 
          alt="Sawansukha" 
          className="client-showcase-img img-sawansukha" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'panna-jewellers',
    name: 'Panna Diamond World Jewellers',
    category: 'Retail & Luxury',
    website: 'https://www.pannadiamonds.com/',
    image: pannaImg,
    render: () => (
      <a 
        href="https://www.pannadiamonds.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card demo-client-card-dark" 
        title="Panna Diamond World Jewellers - Official Website"
      >
        <img 
          src={pannaImg} 
          alt="Panna Diamond World Jewellers" 
          className="client-showcase-img img-panna" 
          loading="lazy" 
        />
      </a>
    )
  },
  {
    id: 'wb-labour-welfare',
    name: 'West Bengal Labour Welfare Board',
    category: 'Government',
    website: 'https://wblwb.org/',
    image: wbLabourWelfareImg,
    render: () => (
      <a 
        href="https://wblwb.org/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="demo-client-card" 
        title="West Bengal Labour Welfare Board - Official Website"
      >
        <img 
          src={wbLabourWelfareImg} 
          alt="West Bengal Labour Welfare Board" 
          className="client-showcase-img img-wblabour" 
          loading="lazy" 
        />
      </a>
    )
  }
];

export { CLIENT_SHOWCASE_LOGOS };
