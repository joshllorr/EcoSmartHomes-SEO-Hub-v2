/**
 * src/data/irishCountiesData.ts
 *
 * Comprehensive Regional SEO Dataset covering all 26 Republic of Ireland Counties.
 * Maps official Eircode routing keys, provinces, Irish language names,
 * typical housing stock profiles, BER priorities, climate attributes,
 * and high-intent local SEO search keys.
 */

export interface IrishCountyInfo {
  slug: string;
  county: string;
  irishName: string;
  province: 'Munster' | 'Leinster' | 'Connacht' | 'Ulster';
  eircode: string; // Primary routing key (e.g. V94, T12, D01-D24)
  secondaryEircodes?: string[];
  majorTowns: string[];
  housingStock: string;
  climateProfile: string;
  avgBer: string;
  targetBer: string;
  seaiGrantAllocation: string;
  registeredContractors: number;
  monthlySearches: number;
  avgRank: number;
  grantDemand: 'Very High' | 'High' | 'Moderate';
  topKeywords: string[];
  sampleFaqs: { question: string; answer: string }[];
  coordinates: { lat: number; lng: number };
}

export const IRISH_COUNTIES_DATA: IrishCountyInfo[] = [
  // ===================== MUNSTER (6 COUNTIES) =====================
  {
    slug: 'limerick',
    county: 'Limerick',
    irishName: 'Luimneach',
    province: 'Munster',
    eircode: 'V94',
    secondaryEircodes: ['V94'],
    majorTowns: [
      'Limerick City',
      'Castletroy',
      'Raheen',
      'Dooradoyle',
      'Newcastle West',
      'Annacotty',
    ],
    housingStock:
      'Suburban 1970s–1990s cavity estates, Victorian redbrick city center, and rural detached oil-heated bungalows.',
    climateProfile:
      'Shannon estuary oceanic climate, high humidity, wind-driven rain from Atlantic depressions.',
    avgBer: 'D1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€28.4M',
    registeredContractors: 38,
    monthlySearches: 4600,
    avgRank: 2.1,
    grantDemand: 'Very High',
    topKeywords: [
      'seai grants limerick v94',
      'heat pump cost limerick',
      'ber assessor limerick',
      'attic insulation grants limerick',
      'one stop shop retrofit limerick',
    ],
    sampleFaqs: [
      {
        question: 'What SEAI grants are available for homes in Limerick V94?',
        answer:
          'Limerick homeowners can access up to €12,500 for heat pump installations, €50,000 for One Stop Shop deep retrofits, €4,000 for standalone window replacements, and up to €2,500 for attic insulation under Budget 2026 guidelines.',
      },
      {
        question: 'How many SEAI registered contractors operate in Limerick?',
        answer:
          'Over 38 registered contractors serve the Limerick City and county area, including Castletroy, Raheen, and Newcastle West.',
      },
      {
        question:
          'Can I get a grant for an older home in Limerick City center?',
        answer:
          'Yes. Homes built before 2011 qualify for insulation, heat pump, and deep retrofit grants, provided an initial BER technical assessment is conducted.',
      },
    ],
    coordinates: { lat: 52.6638, lng: -8.6267 },
  },
  {
    slug: 'clare',
    county: 'Clare',
    irishName: 'An Clár',
    province: 'Munster',
    eircode: 'V95',
    secondaryEircodes: ['V95'],
    majorTowns: [
      'Ennis',
      'Shannon',
      'Kilrush',
      'Ennistymon',
      'Killaloe',
      'Sixmilebridge',
    ],
    housingStock:
      'Coastal stone cottages, 1980s ribbon development bungalows, and suburban housing in Ennis/Shannon.',
    climateProfile:
      'Rugged Atlantic coastal exposure, heavy sea spray winds, severe damp infiltration risk.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€16.8M',
    registeredContractors: 24,
    monthlySearches: 2800,
    avgRank: 3.4,
    grantDemand: 'High',
    topKeywords: [
      'seai grants clare v95',
      'heat pump cost clare',
      'ber assessment ennis clare',
      'wall insulation contractors clare',
    ],
    sampleFaqs: [
      {
        question:
          'Are coastal homes in West Clare eligible for external wall insulation grants?',
        answer:
          'Yes, SEAI provides up to €8,000 for external wall insulation in County Clare, highly recommended for Atlantic-facing coastal homes to combat wind-driven rain.',
      },
      {
        question:
          'How do I find a registered BER assessor in Ennis or Shannon?',
        answer:
          'EcoSmartHomes connects Clare homeowners directly with verified SEAI-registered technical assessors across the V95 Eircode network.',
      },
      {
        question: 'What is the maximum heat pump grant in County Clare?',
        answer:
          'Eligible detached and semi-detached homes in Clare qualify for up to €12,500 for air-to-water heat pump systems when upgrading radiator and heating controls.',
      },
    ],
    coordinates: { lat: 52.8463, lng: -8.9814 },
  },
  {
    slug: 'cork',
    county: 'Cork',
    irishName: 'Corcaigh',
    province: 'Munster',
    eircode: 'T12',
    secondaryEircodes: ['T12', 'T23', 'P31', 'P43', 'P51', 'P61', 'P72', 'P85'],
    majorTowns: [
      'Cork City',
      'Ballincollig',
      'Carrigaline',
      'Cobh',
      'Midleton',
      'Mallow',
      'Kinsale',
      'Bandon',
    ],
    housingStock:
      'Diverse mix of Victorian city terraces, extensive suburban 1980s estates, and coastal/rural farmhouses.',
    climateProfile:
      'Mild maritime, high average rainfall, damp winters requiring airtight fabric-first retrofitting.',
    avgBer: 'D1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€52.1M',
    registeredContractors: 72,
    monthlySearches: 7400,
    avgRank: 1.9,
    grantDemand: 'Very High',
    topKeywords: [
      'seai grants cork t12',
      'solar pv installation cork',
      'heat pump cost cork',
      'one stop shop retrofit cork',
      'ber assessor cork city',
    ],
    sampleFaqs: [
      {
        question:
          'How much can Cork homeowners save with SEAI One Stop Shop retrofits?',
        answer:
          'Cork homeowners can receive up to 50% funding capped at €50,000 for a whole-house One Stop Shop deep retrofit, bringing homes from BER G or D to an A-rating.',
      },
      {
        question: 'What is the solar panel grant in Cork for 2026?',
        answer:
          'The SEAI Solar PV grant provides up to €1,800 direct support for domestic solar installations across Cork City and County.',
      },
      {
        question: 'Which areas in Cork have the highest grant uptake?',
        answer:
          'Suburban zones like Ballincollig, Carrigaline, and Douglas have high retrofit uptake, alongside rural transitions from oil boilers to heat pumps in West Cork.',
      },
    ],
    coordinates: { lat: 51.8985, lng: -8.4756 },
  },
  {
    slug: 'kerry',
    county: 'Kerry',
    irishName: 'Ciarraí',
    province: 'Munster',
    eircode: 'V93',
    secondaryEircodes: ['V92', 'V93'],
    majorTowns: [
      'Tralee',
      'Killarney',
      'Listowel',
      'Kenmare',
      'Dingle',
      'Killorglin',
    ],
    housingStock:
      'Rural one-off detached houses, holiday homes, traditional stone buildings, and suburban estates in Tralee/Killarney.',
    climateProfile:
      'High rainfall, Atlantic gales, mild temperate winters requiring heavy roof and wall thermal wrapping.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€18.2M',
    registeredContractors: 26,
    monthlySearches: 2400,
    avgRank: 3.1,
    grantDemand: 'Moderate',
    topKeywords: [
      'seai grants kerry v93',
      'heat pump installation tralee',
      'attic insulation killarney kerry',
      'ber rating cost kerry',
    ],
    sampleFaqs: [
      {
        question: 'Are grants available for holiday homes in County Kerry?',
        answer:
          'SEAI grants apply to all primary residences built before 2011. Non-principal private residences may qualify under certain One Stop Shop contractor frameworks.',
      },
      {
        question: 'How much is the attic insulation grant in Kerry?',
        answer:
          'Homeowners in Kerry receive €2,000 standard (€2,500 for fuel allowance recipients and first-time buyers) for attic insulation upgrades.',
      },
      {
        question: 'Can I replace my old oil boiler in Kerry with a heat pump?',
        answer:
          'Yes, you can receive up to €12,500 in total SEAI funding when replacing an oil boiler with an air-to-water heat pump system.',
      },
    ],
    coordinates: { lat: 52.1545, lng: -9.5669 },
  },
  {
    slug: 'tipperary',
    county: 'Tipperary',
    irishName: 'Tiobraid Árann',
    province: 'Munster',
    eircode: 'E41',
    secondaryEircodes: ['E21', 'E25', 'E32', 'E34', 'E41', 'E45', 'E53', 'E91'],
    majorTowns: [
      'Clonmel',
      'Nenagh',
      'Thurles',
      'Carrick-on-Suir',
      'Tipperary Town',
      'Roscrea',
      'Cashel',
    ],
    housingStock:
      'Inland agricultural farmhouses, 1960s–1980s town bungalows, and terraced market-town housing.',
    climateProfile:
      'Inland continental microclimates, cold frosty winter nights, moderate rainfall.',
    avgBer: 'E1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€21.5M',
    registeredContractors: 31,
    monthlySearches: 2900,
    avgRank: 2.8,
    grantDemand: 'High',
    topKeywords: [
      'seai grants tipperary',
      'heat pump upgrade clonmel nenagh',
      'insulation grants thurles e41',
      'ber assessor tipperary',
    ],
    sampleFaqs: [
      {
        question: 'Why are Tipperary homes high priority for retrofits?',
        answer:
          'Tipperary has a high proportion of pre-1980 detached homes with solid fuel or oil heating, making them prime candidates for up to €50,000 One Stop Shop upgrades.',
      },
      {
        question: 'What is the external door grant in Tipperary?',
        answer:
          'SEAI provides up to €1,600 (€800 per door, maximum 2 doors) for high-efficiency external door upgrades.',
      },
      {
        question:
          'Where can I find registered contractors in Clonmel and Nenagh?',
        answer:
          'EcoSmartHomes tracks registered contractors servicing North and South Tipperary under the Eircode zones E41, E91, and E45.',
      },
    ],
    coordinates: { lat: 52.4738, lng: -7.8532 },
  },
  {
    slug: 'waterford',
    county: 'Waterford',
    irishName: 'Port Láirge',
    province: 'Munster',
    eircode: 'X91',
    secondaryEircodes: ['X91', 'X35', 'X42'],
    majorTowns: [
      'Waterford City',
      'Dungarvan',
      'Tramore',
      'Dunmore East',
      'Portlaw',
      'Lismore',
    ],
    housingStock:
      'Coastal residential properties in Tramore, historic Georgian city homes, and rural Waterford bungalows.',
    climateProfile:
      'Sunny South-East microclimate, higher solar irradiance than west coast, coastal breeze exposure.',
    avgBer: 'D1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€17.3M',
    registeredContractors: 25,
    monthlySearches: 3100,
    avgRank: 2.5,
    grantDemand: 'High',
    topKeywords: [
      'seai grants waterford x91',
      'solar panels waterford dungarvan',
      'heat pump grants waterford city',
      'ber assessment tramore',
    ],
    sampleFaqs: [
      {
        question: 'Why is Waterford ideal for Solar PV grants?',
        answer:
          'As part of the Sunny South East, Waterford receives optimal solar radiation, allowing a €1,800 SEAI solar grant to pay back in under 5.5 years.',
      },
      {
        question: 'What grants exist for window upgrades in Waterford?',
        answer:
          'Standalone high-performance triple-glazed window grants provide up to €4,000 for homes built before 2011.',
      },
      {
        question:
          'How fast can a BER technical assessment be completed in Waterford?',
        answer:
          'Certified assessors across X91 usually complete on-site surveys within 3–5 working days.',
      },
    ],
    coordinates: { lat: 52.2593, lng: -7.1101 },
  },

  // ===================== LEINSTER (12 COUNTIES) =====================
  {
    slug: 'dublin',
    county: 'Dublin',
    irishName: 'Áth Cliath',
    province: 'Leinster',
    eircode: 'D01-D24',
    secondaryEircodes: [
      'D01',
      'D02',
      'D04',
      'D06',
      'D14',
      'D15',
      'D16',
      'D18',
      'K32',
      'K36',
      'K67',
    ],
    majorTowns: [
      'Dublin City',
      'Swords',
      'Dún Laoghaire',
      'Tallaght',
      'Blanchardstown',
      'Blackrock',
      'Malahide',
      'Dundrum',
    ],
    housingStock:
      'Victorian/Edwardian redbrick, 1930s–1950s hollow-block suburban semi-detached, and high-density modern apartments.',
    climateProfile:
      'Eastern coastal microclimate, lower rainfall than west, urban heat island effect.',
    avgBer: 'C3',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€145.0M',
    registeredContractors: 140,
    monthlySearches: 18500,
    avgRank: 2.2,
    grantDemand: 'Very High',
    topKeywords: [
      'seai grants dublin',
      'heat pump installation dublin',
      'home energy upgrade dublin d01-d24',
      'ber rating assessor dublin',
      'attic insulation cost dublin',
    ],
    sampleFaqs: [
      {
        question:
          'How do Dublin homeowners insulate 1930s-1950s hollow block walls?',
        answer:
          'External wall insulation (up to €8,000 grant) or internal dry lining (up to €4,500 grant) are ideal solutions for Dublin hollow-block homes.',
      },
      {
        question: 'What is the maximum heat pump subsidy in Dublin?',
        answer:
          'Dublin houses qualify for up to €12,500, while apartments qualify for up to €9,500 under Budget 2026 SEAI allocations.',
      },
      {
        question:
          'Is planning permission required for external insulation in Dublin?',
        answer:
          'In most standard cases, external wall insulation is exempted development unless the property is a protected structure or in an Architectural Conservation Area (ACA).',
      },
    ],
    coordinates: { lat: 53.3498, lng: -6.2603 },
  },
  {
    slug: 'kildare',
    county: 'Kildare',
    irishName: 'Cill Dara',
    province: 'Leinster',
    eircode: 'W91',
    secondaryEircodes: ['W91', 'W23'],
    majorTowns: [
      'Naas',
      'Newbridge',
      'Maynooth',
      'Leixlip',
      'Celbridge',
      'Athy',
      'Kildare Town',
    ],
    housingStock:
      'Commuter belt 1990s–2000s estates, stud farms, and historic townhouses along the Grand Canal corridor.',
    climateProfile: 'Inland plains, colder winter snaps, moderate rainfall.',
    avgBer: 'C2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€32.0M',
    registeredContractors: 46,
    monthlySearches: 4100,
    avgRank: 2.4,
    grantDemand: 'Very High',
    topKeywords: [
      'seai grants kildare w91',
      'solar pv naas newbridge',
      'heat pump cost kildare',
      'one stop shop retrofit kildare',
    ],
    sampleFaqs: [
      {
        question:
          'What grants exist for commuter belt homes in Naas and Maynooth?',
        answer:
          'Homes built before 2011 qualify for solar PV (€1,800), heat pumps (€12,500), and comprehensive One Stop Shop deep retrofits (€50,000 cap).',
      },
      {
        question:
          'Can I combine attic insulation with solar panels in Kildare?',
        answer:
          'Yes, combining attic insulation (€2,000) with solar PV (€1,800) is one of the most cost-effective retrofit bundles in Kildare.',
      },
      {
        question: 'How fast do Kildare homeowners see energy bill reductions?',
        answer:
          'A fabric-first upgrade typically reduces annual heating bills by 40%–60% within the first heating season.',
      },
    ],
    coordinates: { lat: 53.1589, lng: -6.9096 },
  },
  {
    slug: 'meath',
    county: 'Meath',
    irishName: 'An Mhí',
    province: 'Leinster',
    eircode: 'C15',
    secondaryEircodes: ['C15', 'A85'],
    majorTowns: [
      'Navan',
      'Trim',
      'Dunboyne',
      'Kells',
      'Ashbourne',
      'Ratoath',
      'Laytown',
    ],
    housingStock:
      'Modern commuter suburbs, rural agricultural dormer bungalows, and heritage town dwellings.',
    climateProfile:
      'Gentle inland rolling plains, sheltered valleys, moderate winter chills.',
    avgBer: 'C3',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€29.8M',
    registeredContractors: 42,
    monthlySearches: 3800,
    avgRank: 2.6,
    grantDemand: 'High',
    topKeywords: [
      'seai grants meath c15',
      'heat pump installers navan',
      'ashbourne retrofit grants meath',
      'ber rating trim',
    ],
    sampleFaqs: [
      {
        question:
          'How do Meath homeowners transition from oil/gas to heat pumps?',
        answer:
          'Through a Home Energy Assessment by an SEAI registered advisor who confirms Heat Loss Indicator (HLI) compliance before installation.',
      },
      {
        question:
          'What is the grant for window upgrades in Navan and Ashbourne?',
        answer:
          'Up to €4,000 for standalone high-performance window replacements under the 2026 scheme.',
      },
      {
        question:
          'Are Meath dormer bungalows eligible for roof insulation grants?',
        answer:
          'Yes, dormer roof and slope insulation grants are available up to €3,000 depending on construction details.',
      },
    ],
    coordinates: { lat: 53.6055, lng: -6.6564 },
  },
  {
    slug: 'wicklow',
    county: 'Wicklow',
    irishName: 'Cill Mhantáin',
    province: 'Leinster',
    eircode: 'A67',
    secondaryEircodes: ['A67', 'A98'],
    majorTowns: [
      'Bray',
      'Greystones',
      'Wicklow Town',
      'Arklow',
      'Blessington',
      'Baltinglass',
    ],
    housingStock:
      'Mountainous elevated bungalows, coastal Victorian residences in Bray, and commuter developments.',
    climateProfile:
      'High wind exposure in Wicklow Mountains, higher precipitation at elevation, coastal damp.',
    avgBer: 'D1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€24.6M',
    registeredContractors: 35,
    monthlySearches: 3500,
    avgRank: 2.7,
    grantDemand: 'High',
    topKeywords: [
      'seai grants wicklow a67',
      'heat pump cost bray greystones',
      'wall insulation wicklow',
      'ber assessor arklow',
    ],
    sampleFaqs: [
      {
        question: 'Why do elevated homes in Wicklow need high-spec heat pumps?',
        answer:
          'Mountainous elevations require properly sized heat pumps with low ambient temperature COP ratings and airtight thermal envelopes.',
      },
      {
        question: 'What grants apply to Bray Victorian homes?',
        answer:
          'Internal wall dry lining (up to €4,500), attic insulation (€2,000), and window upgrades (€4,000) are commonly utilized in heritage zones.',
      },
      {
        question: 'Can Greystones homeowners get One Stop Shop grants?',
        answer:
          'Yes, whole-home One Stop Shop grants up to €50,000 are available throughout County Wicklow.',
      },
    ],
    coordinates: { lat: 52.9808, lng: -6.0446 },
  },
  {
    slug: 'louth',
    county: 'Louth',
    irishName: 'Lú',
    province: 'Leinster',
    eircode: 'A91',
    secondaryEircodes: ['A91', 'A92'],
    majorTowns: [
      'Dundalk',
      'Drogheda',
      'Ardee',
      'Blackrock',
      'Dunleer',
      'Carlingford',
    ],
    housingStock:
      'Industrial coastal port dwellings, 1960s local authority estates, and modern commuter ribbon builds.',
    climateProfile:
      'East coast Irish Sea exposure, brisk easterly winds, moderate rainfall.',
    avgBer: 'D1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€22.1M',
    registeredContractors: 30,
    monthlySearches: 3200,
    avgRank: 2.9,
    grantDemand: 'High',
    topKeywords: [
      'seai grants louth a91',
      'heat pump cost dundalk drogheda',
      'attic insulation ardee louth',
      'ber rating dundalk',
    ],
    sampleFaqs: [
      {
        question: 'What grants are most popular in Dundalk and Drogheda?',
        answer:
          'Attic insulation (€2,000) and cavity wall insulation (€1,800) offer fast turnarounds, while solar PV (€1,800) is expanding rapidly.',
      },
      {
        question:
          'How do I know if my Drogheda home is suitable for a heat pump?',
        answer:
          'A technical assessment determines whether your home meets the Heat Loss Indicator (HLI) requirement of 2.0 W/m²K or lower.',
      },
      {
        question: 'Is the Warmer Homes Scheme active in County Louth?',
        answer:
          'Yes, fully funded 100% free upgrades are available for qualifying homeowners on fuel allowance and working family payments.',
      },
    ],
    coordinates: { lat: 53.8833, lng: -6.4667 },
  },
  {
    slug: 'wexford',
    county: 'Wexford',
    irishName: 'Loch Garman',
    province: 'Leinster',
    eircode: 'Y35',
    secondaryEircodes: ['Y35', 'Y21', 'Y25'],
    majorTowns: [
      'Wexford Town',
      'Enniscorthy',
      'Gorey',
      'New Ross',
      'Rosslare',
      'Bunclody',
    ],
    housingStock:
      'Coastal holiday bungalows, rural agricultural homesteads, and suburban developments in Gorey/Wexford.',
    climateProfile:
      'Sunniest county in Ireland, excellent solar generation potential, mild maritime climate.',
    avgBer: 'D1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€23.9M',
    registeredContractors: 34,
    monthlySearches: 3400,
    avgRank: 2.6,
    grantDemand: 'High',
    topKeywords: [
      'seai grants wexford y35',
      'solar panel installers gorey wexford',
      'heat pump grants enniscorthy',
      'ber assessor new ross',
    ],
    sampleFaqs: [
      {
        question: 'Why does Wexford lead in Solar PV grant installations?',
        answer:
          'Wexford receives the highest annual sunlight hours in Ireland, providing exceptional solar panel yield alongside the €1,800 SEAI grant.',
      },
      {
        question: 'What is the grant for attic insulation in Wexford?',
        answer:
          '€2,000 standard (€2,500 for qualifying welfare payments and first-time buyers).',
      },
      {
        question: 'Can Gorey commuter homes get fast-track retrofits?',
        answer:
          'Yes, registered One Stop Shop contractors provide end-to-end management within 4–6 weeks in North Wexford.',
      },
    ],
    coordinates: { lat: 52.3369, lng: -6.4633 },
  },
  {
    slug: 'kilkenny',
    county: 'Kilkenny',
    irishName: 'Cill Chainnigh',
    province: 'Leinster',
    eircode: 'R95',
    secondaryEircodes: ['R95'],
    majorTowns: [
      'Kilkenny City',
      'Thomastown',
      'Callan',
      'Castlecomer',
      'Graiguenamanagh',
      'Gowran',
    ],
    housingStock:
      'Medieval stone heritage buildings in Kilkenny City, 1970s rural bungalows, and modern estates.',
    climateProfile:
      'Sheltered inland river valleys (Nore/Suir), warm summers, crisp cold winters.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€16.4M',
    registeredContractors: 25,
    monthlySearches: 2600,
    avgRank: 2.8,
    grantDemand: 'High',
    topKeywords: [
      'seai grants kilkenny r95',
      'heat pump installation kilkenny city',
      'ber assessor thomastown',
      'insulation contractors callan kilkenny',
    ],
    sampleFaqs: [
      {
        question:
          'Can historic buildings in Kilkenny City receive SEAI grants?',
        answer:
          'Yes, specialized internal dry lining and heat pump grants apply, subject to local conservation guidelines.',
      },
      {
        question: 'What is the maximum heat pump grant in Kilkenny?',
        answer:
          'Up to €12,500 for domestic houses switching to air-to-water heat pump systems.',
      },
      {
        question: 'How do I find an SEAI registered assessor in Kilkenny?',
        answer:
          'EcoSmartHomes connects you directly with certified assessors in the R95 Eircode network.',
      },
    ],
    coordinates: { lat: 52.6541, lng: -7.2448 },
  },
  {
    slug: 'carlow',
    county: 'Carlow',
    irishName: 'Ceatharlach',
    province: 'Leinster',
    eircode: 'R93',
    secondaryEircodes: ['R93'],
    majorTowns: [
      'Carlow Town',
      'Tullow',
      'Bagenalstown',
      'Borris',
      'Hacketstown',
    ],
    housingStock:
      'Compact urban estates, agricultural dwellings in the Barrow valley, and rural detached homes.',
    climateProfile:
      'Inland valley, low wind speeds, moderate rainfall, warm summer averages.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€11.2M',
    registeredContractors: 18,
    monthlySearches: 1800,
    avgRank: 3.2,
    grantDemand: 'Moderate',
    topKeywords: [
      'seai grants carlow r93',
      'heat pump cost carlow tullow',
      'attic insulation bagenalstown',
      'ber assessor carlow town',
    ],
    sampleFaqs: [
      {
        question:
          'How much does attic insulation cost after the SEAI grant in Carlow?',
        answer:
          'With the €2,000 grant, standard attic insulation often costs the homeowner only €300–€600 out-of-pocket.',
      },
      {
        question: 'What is the One Stop Shop deep retrofit grant in Carlow?',
        answer:
          'Up to 50% funding capped at €50,000 for full envelope upgrades.',
      },
      {
        question: 'Are heat pumps suitable for older homes in Carlow?',
        answer:
          'Yes, once the home has undergone fabric insulation upgrades to reduce heat loss below 2.0 HLI.',
      },
    ],
    coordinates: { lat: 52.8365, lng: -6.9341 },
  },
  {
    slug: 'laois',
    county: 'Laois',
    irishName: 'Laois',
    province: 'Leinster',
    eircode: 'R32',
    secondaryEircodes: ['R32'],
    majorTowns: [
      'Portlaoise',
      'Portarlington',
      'Mountmellick',
      'Abbeyleix',
      'Stradbally',
      'Mountrath',
    ],
    housingStock:
      'Rapidly expanded commuter estates in Portlaoise, historic estate cottages, and rural farmhouses.',
    climateProfile:
      'Central midlands inland climate, cold frosty winter mornings, low coastal influence.',
    avgBer: 'D1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€15.8M',
    registeredContractors: 24,
    monthlySearches: 2300,
    avgRank: 3.0,
    grantDemand: 'High',
    topKeywords: [
      'seai grants laois r32',
      'heat pump installation portlaoise',
      'solar panels portarlington laois',
      'ber rating abbeyleix',
    ],
    sampleFaqs: [
      {
        question:
          'Why are Portlaoise homes transitioning to heat pumps so quickly?',
        answer:
          'Portlaoise has many 1990s and 2000s homes with cavity walls that require minimal extra insulation to reach heat pump readiness.',
      },
      {
        question: 'What is the grant for solar PV in County Laois?',
        answer:
          'Up to €1,800 direct support under the SEAI domestic solar grant.',
      },
      {
        question: 'Can Abbeyleix heritage properties get insulation grants?',
        answer:
          'Yes, internal wall insulation grants of up to €4,500 apply without altering external historic facades.',
      },
    ],
    coordinates: { lat: 53.0327, lng: -7.3001 },
  },
  {
    slug: 'offaly',
    county: 'Offaly',
    irishName: 'Uíbh Fhailí',
    province: 'Leinster',
    eircode: 'R35',
    secondaryEircodes: ['R35', 'R42'],
    majorTowns: [
      'Tullamore',
      'Edenderry',
      'Birr',
      'Clara',
      'Banagher',
      'Ferbane',
    ],
    housingStock:
      'Bord na Móna worker cottages, rural peat-heated bungalows, and Tullamore suburban estates.',
    climateProfile:
      'Midlands peatland basin, sharp winter frosts, foggy inland river valleys.',
    avgBer: 'E1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€17.5M',
    registeredContractors: 22,
    monthlySearches: 2100,
    avgRank: 3.1,
    grantDemand: 'High',
    topKeywords: [
      'seai grants offaly r35',
      'heat pump cost tullamore edenderry',
      'just transition retrofit birr offaly',
      'ber assessor tullamore',
    ],
    sampleFaqs: [
      {
        question:
          'Are there Just Transition retrofitting funds for Offaly homes?',
        answer:
          'Yes, the Midlands Just Transition fund works in tandem with SEAI grants to assist homeowners moving away from peat heating.',
      },
      {
        question:
          'What is the grant amount for replacing a peat burner in Offaly?',
        answer:
          'Up to €12,500 for heat pump installations including central heating system upgrades.',
      },
      {
        question: 'How much is the attic insulation grant in Tullamore?',
        answer:
          '€2,000 standard (€2,500 for fuel allowance recipients and first-time buyers).',
      },
    ],
    coordinates: { lat: 53.2739, lng: -7.4947 },
  },
  {
    slug: 'westmeath',
    county: 'Westmeath',
    irishName: 'An Iarmhí',
    province: 'Leinster',
    eircode: 'N91',
    secondaryEircodes: ['N91', 'N37'],
    majorTowns: [
      'Mullingar',
      'Athlone',
      'Moate',
      'Kinnegad',
      'Kilbeggan',
      'Castlepollard',
    ],
    housingStock:
      'Lakeside rural dwellings, Athlone suburban estates, and traditional midlands market-town homes.',
    climateProfile:
      'Shannon basin inland climate, elevated humidity, chill winter winds across midland lakes.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€18.0M',
    registeredContractors: 26,
    monthlySearches: 2500,
    avgRank: 2.9,
    grantDemand: 'High',
    topKeywords: [
      'seai grants westmeath n91',
      'heat pump athlone mullingar',
      'solar pv kinnegad westmeath',
      'ber rating athlone n37',
    ],
    sampleFaqs: [
      {
        question:
          'Are Athlone lakeside properties eligible for deep retrofit grants?',
        answer:
          'Yes, homes built before 2011 qualify for up to €50,000 under the One Stop Shop deep retrofit scheme.',
      },
      {
        question: 'What is the heat pump grant in Mullingar?',
        answer:
          'Up to €12,500 for air-to-water heat pump systems when upgrading from oil or gas.',
      },
      {
        question: 'Who conducts BER assessments in Westmeath?',
        answer:
          'SEAI registered BER assessors covering the N91 and N37 Eircode areas.',
      },
    ],
    coordinates: { lat: 53.5255, lng: -7.3468 },
  },
  {
    slug: 'longford',
    county: 'Longford',
    irishName: 'An Longfort',
    province: 'Leinster',
    eircode: 'N39',
    secondaryEircodes: ['N39'],
    majorTowns: [
      'Longford Town',
      'Edgeworthstown',
      'Ballymahon',
      'Granard',
      'Lanesborough',
    ],
    housingStock:
      'Rural one-off agricultural bungalows, town housing, and Center Parcs-adjacent modern developments.',
    climateProfile:
      'Inland low-lying basin, damp winters, heavy frosts, high heating degree days.',
    avgBer: 'E1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€9.8M',
    registeredContractors: 14,
    monthlySearches: 1400,
    avgRank: 3.5,
    grantDemand: 'Moderate',
    topKeywords: [
      'seai grants longford n39',
      'heat pump installers ballymahon',
      'attic insulation longford town',
      'ber assessor granard',
    ],
    sampleFaqs: [
      {
        question: 'Why is insulation critical for County Longford homes?',
        answer:
          'Longford has high winter heating degree days, meaning attic (€2,000 grant) and wall insulation (€1,800–€8,000) offer immediate heating savings.',
      },
      {
        question: 'What is the grant for external doors in Longford?',
        answer: 'Up to €1,600 (€800 per door, maximum 2 doors).',
      },
      {
        question: 'Can Longford homeowners apply for free SEAI upgrades?',
        answer:
          'Yes, the Warmer Homes scheme covers 100% of retrofit costs for eligible welfare recipients.',
      },
    ],
    coordinates: { lat: 53.7275, lng: -7.7932 },
  },

  // ===================== CONNACHT (5 COUNTIES) =====================
  {
    slug: 'galway',
    county: 'Galway',
    irishName: 'Gaillimh',
    province: 'Connacht',
    eircode: 'H91',
    secondaryEircodes: ['H91', 'H53', 'H54', 'H62', 'H65', 'H71'],
    majorTowns: [
      'Galway City',
      'Salthill',
      'Tuam',
      'Ballinasloe',
      'Loughrea',
      'Athenry',
      'Clifden',
      'Gort',
    ],
    housingStock:
      'Gaeltacht traditional cottages, coastal Connemara stone homes, and dense suburban Galway City estates.',
    climateProfile:
      'Exposed Atlantic coastal environment, high winds, heavy rain, damp atmosphere requiring superior airtightness.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€44.2M',
    registeredContractors: 58,
    monthlySearches: 5200,
    avgRank: 2.3,
    grantDemand: 'Very High',
    topKeywords: [
      'seai grants galway h91',
      'heat pump cost galway salthill',
      'one stop shop retrofit galway',
      'ber assessor tuam loughrea',
      'attic insulation galway city',
    ],
    sampleFaqs: [
      {
        question:
          'How do Connemara and coastal Galway homes protect against wind-driven rain?',
        answer:
          'SEAI approved external wall insulation (up to €8,000 grant) with weather-resistant silicone render prevents damp penetration while cutting heat loss by up to 40%.',
      },
      {
        question:
          'What is the maximum heat pump grant in Galway City and County?',
        answer:
          'Detached and semi-detached homes qualify for up to €12,500 under 2026 Budget guidelines.',
      },
      {
        question:
          'Are bilingual / Irish-speaking assessors available in Galway Gaeltacht?',
        answer:
          'Yes, several registered SEAI assessors and installers serve Gaeltacht regions in Connemara and the Aran Islands.',
      },
    ],
    coordinates: { lat: 53.2707, lng: -9.0568 },
  },
  {
    slug: 'mayo',
    county: 'Mayo',
    irishName: 'Maigh Eo',
    province: 'Connacht',
    eircode: 'F23',
    secondaryEircodes: ['F23', 'F26', 'F28'],
    majorTowns: [
      'Castlebar',
      'Westport',
      'Ballina',
      'Claremorris',
      'Swinford',
      'Belmullet',
      'Ballinrobe',
    ],
    housingStock:
      'Exposed coastal dwellings on Achill/Belmullet, 1970s hollow block bungalows, and Westport heritage homes.',
    climateProfile:
      'Severe Atlantic maritime exposure, highest wind gust speeds in Ireland, frequent driving rain.',
    avgBer: 'E1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€26.5M',
    registeredContractors: 32,
    monthlySearches: 3100,
    avgRank: 2.8,
    grantDemand: 'High',
    topKeywords: [
      'seai grants mayo f23',
      'heat pump westport castlebar',
      'insulation grants ballina mayo',
      'ber assessor mayo',
    ],
    sampleFaqs: [
      {
        question:
          'What grant support is available for hollow-block homes in Mayo?',
        answer:
          'Up to €8,000 for external insulation or €4,500 for internal dry lining under the SEAI national upgrade scheme.',
      },
      {
        question: 'Can Westport coastal homes install air-to-water heat pumps?',
        answer:
          'Yes, modern heat pumps operate effectively even during Atlantic gales, supported by up to €12,500 in grants.',
      },
      {
        question: 'How much can Mayo homeowners receive for window upgrades?',
        answer: 'Up to €4,000 for standalone triple-glazed window retrofits.',
      },
    ],
    coordinates: { lat: 53.8565, lng: -9.2989 },
  },
  {
    slug: 'sligo',
    county: 'Sligo',
    irishName: 'Sligeach',
    province: 'Connacht',
    eircode: 'F91',
    secondaryEircodes: ['F91'],
    majorTowns: [
      'Sligo Town',
      'Strandhill',
      'Tubbercurry',
      'Ballymote',
      'Enniscrone',
      'Collooney',
    ],
    housingStock:
      'Coastal surf village bungalows in Strandhill/Enniscrone, Victorian townhouses, and Benbulben rural dwellings.',
    climateProfile:
      'North-west Atlantic exposure, brisk sea breezes, high humidity, frequent rain showers.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€14.1M',
    registeredContractors: 21,
    monthlySearches: 2200,
    avgRank: 3.0,
    grantDemand: 'High',
    topKeywords: [
      'seai grants sligo f91',
      'heat pump cost sligo town',
      'solar panels strandhill sligo',
      'ber assessor ballymote',
    ],
    sampleFaqs: [
      {
        question:
          'Are Strandhill and Enniscrone coastal homes eligible for insulation grants?',
        answer:
          'Yes, full grants apply for attic, cavity, and external insulation, critical for mitigating coastal moisture.',
      },
      {
        question: 'What is the solar PV grant in Sligo?',
        answer:
          'Up to €1,800 direct support under the SEAI microgeneration scheme.',
      },
      {
        question: 'How do I book an SEAI assessment in Sligo Town?',
        answer:
          'EcoSmartHomes matches your property with verified assessors across the F91 Eircode zone.',
      },
    ],
    coordinates: { lat: 54.2766, lng: -8.4761 },
  },
  {
    slug: 'roscommon',
    county: 'Roscommon',
    irishName: 'Ros Comáin',
    province: 'Connacht',
    eircode: 'F42',
    secondaryEircodes: ['F42', 'F45'],
    majorTowns: [
      'Roscommon Town',
      'Boyle',
      'Castlerea',
      'Ballaghaderreen',
      'Strokestown',
    ],
    housingStock:
      'Pastoral farmland bungalows, stone farmhouses, and compact county town dwellings.',
    climateProfile:
      'Inland river basins (Shannon/Suck), heavy winter mists, freezing temperatures.',
    avgBer: 'E2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€12.3M',
    registeredContractors: 16,
    monthlySearches: 1700,
    avgRank: 3.3,
    grantDemand: 'Moderate',
    topKeywords: [
      'seai grants roscommon f42',
      'heat pump installers boyle roscommon',
      'attic insulation castlerea',
      'ber rating roscommon town',
    ],
    sampleFaqs: [
      {
        question: 'Why do Roscommon homes have lower average BER ratings?',
        answer:
          'Many rural Roscommon homes rely on oil or solid fuel with uninsulated solid walls, making them prime candidates for up to €50,000 One Stop Shop grants.',
      },
      {
        question: 'What is the attic insulation grant in Roscommon?',
        answer:
          '€2,000 standard (€2,500 for qualifying fuel allowance recipients).',
      },
      {
        question:
          'Can I replace my old oil range cooker with a heat pump in Roscommon?',
        answer:
          'Yes, replacing oil ranges with heat pumps and radiator upgrades unlocks up to €12,500 in SEAI support.',
      },
    ],
    coordinates: { lat: 53.6325, lng: -8.1883 },
  },
  {
    slug: 'leitrim',
    county: 'Leitrim',
    irishName: 'Liatroim',
    province: 'Connacht',
    eircode: 'N41',
    secondaryEircodes: ['N41'],
    majorTowns: [
      'Carrick-on-Shannon',
      'Manorhamilton',
      'Kinlough',
      'Mohill',
      'Ballinamore',
      'Drumshanbo',
    ],
    housingStock:
      'Lakeside houses, hilly rural drumlin stone cottages, and modern riverfront developments.',
    climateProfile:
      'High annual rainfall, inland drumlin valley microclimates, damp winters.',
    avgBer: 'E1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€8.5M',
    registeredContractors: 12,
    monthlySearches: 1300,
    avgRank: 3.4,
    grantDemand: 'Moderate',
    topKeywords: [
      'seai grants leitrim n41',
      'heat pump carrick on shannon',
      'insulation grants manorhamilton',
      'ber assessor leitrim',
    ],
    sampleFaqs: [
      {
        question: 'What grants exist for rural Leitrim homes with heavy damp?',
        answer:
          'External insulation (€8,000), demand-controlled ventilation (€1,500), and attic insulation (€2,000) permanently eliminate damp and mould.',
      },
      {
        question:
          'Is Carrick-on-Shannon eligible for One Stop Shop deep retrofits?',
        answer:
          'Yes, homes built before 2011 qualify for up to €50,000 in grant assistance.',
      },
      {
        question: 'What is the grant for high-efficiency windows in Leitrim?',
        answer:
          'Up to €4,000 for standalone window upgrades under Budget 2026 guidelines.',
      },
    ],
    coordinates: { lat: 54.1258, lng: -8.0039 },
  },

  // ===================== ULSTER (3 ROI COUNTIES) =====================
  {
    slug: 'donegal',
    county: 'Donegal',
    irishName: 'Dún na nGall',
    province: 'Ulster',
    eircode: 'F92',
    secondaryEircodes: ['F92', 'F93', 'F94'],
    majorTowns: [
      'Letterkenny',
      'Buncrana',
      'Donegal Town',
      'Ballybofey',
      'Killybegs',
      'Bundoran',
      'Dungloe',
    ],
    housingStock:
      'Coastal Atlantic bungalows, mica-remediated rebuilds, Gaeltacht stone cottages, and Letterkenny suburban homes.',
    climateProfile:
      'Rugged northwestern Atlantic storms, high winds, heavy driving rain, low winter temperatures.',
    avgBer: 'E1',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€31.4M',
    registeredContractors: 36,
    monthlySearches: 3900,
    avgRank: 2.7,
    grantDemand: 'Very High',
    topKeywords: [
      'seai grants donegal f92',
      'heat pump letterkenny buncrana',
      'external wall insulation donegal',
      'solar pv donegal town',
      'ber assessor letterkenny',
    ],
    sampleFaqs: [
      {
        question:
          'Can homes in Donegal affected by mica combine redress with SEAI grants?',
        answer:
          'Yes, homeowners rebuilding or remediating properties can integrate SEAI energy upgrade grants for heat pumps (€12,500) and solar PV (€1,800) alongside redress frameworks.',
      },
      {
        question:
          'Why is external insulation so vital for Donegal Atlantic homes?',
        answer:
          'With severe wind-driven rain, external wall insulation with waterproof acrylic render seals the building envelope while cutting heating bills by up to 50%.',
      },
      {
        question:
          'Who conducts SEAI BER assessments in Inishowen and Letterkenny?',
        answer:
          'Certified assessors registered across F92, F93, and F94 Eircode regions.',
      },
    ],
    coordinates: { lat: 54.95, lng: -7.7333 },
  },
  {
    slug: 'cavan',
    county: 'Cavan',
    irishName: 'An Cabhán',
    province: 'Ulster',
    eircode: 'H12',
    secondaryEircodes: ['H12', 'H14'],
    majorTowns: [
      'Cavan Town',
      'Bailieborough',
      'Virginia',
      'Kingscourt',
      'Cootehill',
      'Belturbet',
    ],
    housingStock:
      'Lakeside drumlin dwellings, commuter belt housing in Virginia, and rural detached properties.',
    climateProfile:
      'Hilly drumlin terrain, cold damp winters, sheltered lake basins.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€14.7M',
    registeredContractors: 22,
    monthlySearches: 2100,
    avgRank: 3.1,
    grantDemand: 'High',
    topKeywords: [
      'seai grants cavan h12',
      'heat pump virginia cavan town',
      'attic insulation bailieborough',
      'ber rating cavan',
    ],
    sampleFaqs: [
      {
        question:
          'What grants are available for homes in Virginia and Cavan Town?',
        answer:
          'Up to €12,500 for heat pumps, €50,000 for One Stop Shop retrofits, and €1,800 for solar PV.',
      },
      {
        question: 'How much does cavity wall insulation cost in County Cavan?',
        answer:
          'With an SEAI grant of €1,800, cavity wall insulation for a typical semi-detached home is often fully covered or under €400 net.',
      },
      {
        question:
          'Are registered contractors available in Kingscourt and Cootehill?',
        answer:
          'Yes, over 22 SEAI-registered contractors service County Cavan and surrounding border regions.',
      },
    ],
    coordinates: { lat: 53.9908, lng: -7.3606 },
  },
  {
    slug: 'monaghan',
    county: 'Monaghan',
    irishName: 'Muineachán',
    province: 'Ulster',
    eircode: 'H18',
    secondaryEircodes: ['H18'],
    majorTowns: [
      'Monaghan Town',
      'Carrickmacross',
      'Castleblayney',
      'Clones',
      'Ballybay',
    ],
    housingStock:
      'Drumlin agricultural holdings, poultry and mushroom farm dwellings, and market-town terraces.',
    climateProfile:
      'Inland border hills, high winter frosts, damp drumlin valleys.',
    avgBer: 'D2',
    targetBer: 'B2 / A0',
    seaiGrantAllocation: '€13.2M',
    registeredContractors: 19,
    monthlySearches: 1900,
    avgRank: 3.2,
    grantDemand: 'High',
    topKeywords: [
      'seai grants monaghan h18',
      'heat pump carrickmacross',
      'insulation grants castleblayney monaghan',
      'ber assessor monaghan town',
    ],
    sampleFaqs: [
      {
        question:
          'How do Monaghan homeowners switch from oil heating to heat pumps?',
        answer:
          'By scheduling an initial SEAI BER Technical Assessment to confirm the home’s Heat Loss Indicator (HLI) is compliant, then claiming up to €12,500 in grants.',
      },
      {
        question: 'What is the window replacement grant in Monaghan?',
        answer: 'Up to €4,000 for standalone high-performance window upgrades.',
      },
      {
        question:
          'Are there free upgrades for eligible homeowners in Monaghan?',
        answer:
          'Yes, through the fully-funded Warmer Homes Scheme for households receiving Fuel Allowance or Working Family Payment.',
      },
    ],
    coordinates: { lat: 54.2492, lng: -6.9683 },
  },
];

/**
 * Quick helper functions
 */
export function getCountyBySlug(slug: string): IrishCountyInfo | undefined {
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return IRISH_COUNTIES_DATA.find((c) => c.slug === clean);
}

export function getCountiesByProvince(
  province: 'Munster' | 'Leinster' | 'Connacht' | 'Ulster',
): IrishCountyInfo[] {
  return IRISH_COUNTIES_DATA.filter((c) => c.province === province);
}

export function searchCountiesByEircodeOrName(
  query: string,
): IrishCountyInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return IRISH_COUNTIES_DATA;
  return IRISH_COUNTIES_DATA.filter(
    (c) =>
      c.county.toLowerCase().includes(q) ||
      c.irishName.toLowerCase().includes(q) ||
      c.eircode.toLowerCase().includes(q) ||
      (c.secondaryEircodes &&
        c.secondaryEircodes.some((sec) => sec.toLowerCase().includes(q))) ||
      c.majorTowns.some((t) => t.toLowerCase().includes(q)),
  );
}
