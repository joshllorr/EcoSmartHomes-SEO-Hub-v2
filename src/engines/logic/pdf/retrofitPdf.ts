/**
 * logic/pdf/retrofitPdf.ts
 *
 * Phase 29 Multi-Section SEAI AI Retrofit Blueprint Printable PDF Generator
 * (Updated for March 28th 2026 SEAI Rules, €22,100 Grants & New G → A BER Scale)
 */

export function generateRetrofitPdfHtml(plan: any, user: any): string {
  const planId = plan?.plan_id || "plan_2026_08_03_1512";
  const grantId = plan?.grant_id || "grant_2026_08_03_1207";
  const name = user?.name || "Sarah O'Connor";
  const eircode = user?.eircode || "V94 X2C9";
  const generatedDate = new Date().toLocaleDateString("en-IE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SEAI AI Retrofit Blueprint 2026 — ${planId}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 20px;
      line-height: 1.5;
    }
    .header-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #ffffff;
      padding: 30px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }
    .brand-title { font-size: 24px; font-weight: 800; color: #38bdf8; margin: 0; }
    .doc-subtitle { font-size: 14px; font-weight: 600; color: #a7f3d0; margin-top: 4px; }
    .meta-box { text-align: right; font-family: monospace; font-size: 12px; color: #cbd5e1; }
    .section-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e1b4b;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 15px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th { background: #1e1b4b; color: #ffffff; text-align: left; padding: 10px; font-weight: 600; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .highlight-net { font-weight: bold; color: #047857; }
    .ber-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 15px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 20px;
      color: #065f46;
    }
    .advisor-card {
      display: flex;
      align-items: center;
      gap: 15px;
      background: #f3e8ff;
      border: 1px solid #d8b4fe;
      padding: 15px;
      border-radius: 10px;
      margin-top: 15px;
    }
    .advisor-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #9333ea; }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()" class="print-btn">🖨️ Print / Save PDF</button>

  <!-- 1. COVER PAGE / HEADER -->
  <div class="header-banner">
    <div>
      <div class="brand-title">EcoSmartHomes Ireland</div>
      <div class="doc-subtitle">SEAI AI Retrofit Execution Blueprint (2026 Compliant)</div>
    </div>
    <div class="meta-box">
      <div>Plan ID: <strong>${planId}</strong></div>
      <div>Grant ID: <strong>${grantId}</strong></div>
      <div>Homeowner: <strong>${name}</strong></div>
      <div>Eircode: <strong>${eircode}</strong></div>
      <div>Date: <strong>${generatedDate}</strong></div>
    </div>
  </div>

  <!-- 2. HOME SUMMARY -->
  <div class="section-card">
    <div class="section-title">1. Property & Baseline Energy Profile</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
      <div><strong>Home Type:</strong> Semi-Detached House</div>
      <div><strong>Year Built:</strong> 1998</div>
      <div><strong>Primary Heating:</strong> Oil / Gas Boiler</div>
      <div><strong>Insulation Baseline:</strong> Minimal Attic Insulation</div>
      <div><strong>Glazing:</strong> Double Glazed Windows</div>
      <div><strong>Homeowner Goals:</strong> Lower Energy Bills, Warmer Living Space</div>
    </div>
  </div>

  <!-- 3. GRANT ELIGIBILITY SUMMARY (March 28th 2026 SEAI Rates) -->
  <div class="section-card">
    <div class="section-title">2. SEAI 2026 Increased Grant Funding Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>SEAI Grant Measure</th>
          <th>2026 Grant Value</th>
          <th>Qualification Criteria</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Air-to-Water Heat Pump</td><td>€8,000</td><td>Fossil fuel heating replacement</td></tr>
        <tr><td>Cavity & Internal Wall Insulation</td><td>€4,000</td><td>Year built prior to 2006</td></tr>
        <tr><td>Rooftop Solar PV Array</td><td>€3,000</td><td>Unshaded roof orientation</td></tr>
        <tr><td>Attic Insulation Upgrade</td><td>€2,000</td><td>Attic insulation under 300mm</td></tr>
        <tr><td>Smart Heating Controls</td><td>€1,000</td><td>Centralized heating system</td></tr>
        <tr><td>Full Retrofit Bonus</td><td>€2,500</td><td>All recommended measures completed</td></tr>
        <tr><td>Solar Diverter Bonus</td><td>€400</td><td>Hot water diverter installed</td></tr>
        <tr><td>Heat Pump + Solar Combo Bonus</td><td>€1,200</td><td>Dual heat pump & solar installation</td></tr>
      </tbody>
    </table>
  </div>

  <!-- 4. NEW BER IMPACT (G -> A Scale) -->
  <div class="section-card">
    <div class="section-title">3. Projected BER Rating Uplift (New SEAI Scale)</div>
    <div class="ber-box">
      <span>Baseline BER: <strong>G (Low Efficiency)</strong></span>
      <span>➔</span>
      <span>Target BER: <strong>A (High Efficiency)</strong></span>
    </div>
    <p style="font-size: 12px; color: #475569; margin-top: 10px; text-align: center;">
      Projected carbon reduction: <strong>4.2 tonnes CO₂ / year</strong>
    </p>
  </div>

  <!-- 5. SAVINGS PROJECTION (2026 Energy Prices) -->
  <div class="section-card">
    <div class="section-title">4. 2026 Energy Price Savings Projection</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
      <div style="background: #e0f2fe; padding: 12px; border-radius: 8px;">
        <div style="font-size: 11px; color: #0369a1;">Standard Annual Savings</div>
        <div style="font-size: 20px; font-weight: bold; color: #0284c7;">€920 / yr</div>
      </div>
      <div style="background: #e0e7ff; padding: 12px; border-radius: 8px;">
        <div style="font-size: 11px; color: #3730a3;">Deep Retrofit Savings</div>
        <div style="font-size: 20px; font-weight: bold; color: #4338ca;">€1,450 / yr</div>
      </div>
      <div style="background: #fae8ff; padding: 12px; border-radius: 8px;">
        <div style="font-size: 11px; color: #86198f;">25-Year Lifetime</div>
        <div style="font-size: 20px; font-weight: bold; color: #a21caf;">€36,250</div>
      </div>
    </div>
  </div>

  <!-- 6. COST BREAKDOWN TABLE -->
  <div class="section-card">
    <div class="section-title">5. Investment Cost & Net Out-of-Pocket Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Retrofit Measure</th>
          <th>Gross Cost</th>
          <th>SEAI Grant Offset</th>
          <th>Net Out-of-Pocket</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Attic Insulation Upgrade</td><td>€2,700</td><td>€2,500</td><td class="highlight-net">€200</td></tr>
        <tr><td>Smart Heating Controls</td><td>€1,400</td><td>€700</td><td class="highlight-net">€700</td></tr>
        <tr><td>Air-to-Water Heat Pump System</td><td>€16,500</td><td>€12,500</td><td class="highlight-net">€4,000</td></tr>
        <tr><td>4.2kWp Solar PV Array</td><td>€4,200</td><td>€1,800</td><td class="highlight-net">€2,400</td></tr>
        <tr><td>External Wall Insulation</td><td>€12,500</td><td>€8,000</td><td class="highlight-net">€4,500</td></tr>
        <tr style="background: #e2e8f0; font-weight: bold;">
          <td>Total Retrofit Project</td>
          <td>€37,300</td>
          <td>€25,500</td>
          <td style="color: #047857; font-size: 16px;">€11,800</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 7. MATERIALS LIST -->
  <div class="section-card">
    <div class="section-title">6. SEAI 2026 Approved Equipment & Bill of Materials (BOM)</div>
    <ul style="font-size: 13px; margin: 0; padding-left: 20px;">
      <li>300mm High-Performance Mineral Wool Ceiling Roll</li>
      <li>SEAI 2026 Multi-Zone Smart Thermostat Controller Kit</li>
      <li>12kW A+++ Rated Air-to-Water Monobloc Heat Pump Unit</li>
      <li>10x 420W Monocrystalline Solar PV Panels</li>
      <li>3.6kW Hybrid Solar Inverter & Eddi Hot Water Diverter</li>
    </ul>
  </div>

  <!-- 8. CONTRACTOR REQUIREMENTS & MANDATORY SEQUENCE -->
  <div class="section-card">
    <div class="section-title">7. Required Trades & Mandatory 2026 Execution Sequence</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px;">
      <div>
        <strong>Required Trade Contractors:</strong>
        <ul style="margin: 5px 0 0 0; padding-left: 20px;">
          <li>SEAI-Registered Insulation Contractor</li>
          <li>Certified Heating Controls Technician</li>
          <li>F-Gas Heat Pump Installer</li>
          <li>RECI-Certified Solar PV Electrician</li>
        </ul>
      </div>
      <div>
        <strong>Mandatory 2026 SEAI Sequence:</strong>
        <ol style="margin: 5px 0 0 0; padding-left: 20px;">
          <li>Step 1: Attic Insulation</li>
          <li>Step 2: Smart Heating Controls</li>
          <li>Step 3: Heat Pump Upgrade</li>
          <li>Step 4: Solar PV Array</li>
        </ol>
      </div>
    </div>
  </div>

  <!-- 9. COMPLIANCE WORKFLOW & ADVISOR BLOCK -->
  <div class="section-card">
    <div class="section-title">8. Mandatory 2026 Compliance Documents & SEAI Surveyor</div>
    <ul style="font-size: 12px; color: #334155; margin: 0 0 10px 0; padding-left: 20px;">
      <li>MPRN Proof of Property Ownership</li>
      <li>Electricity Utility Bill</li>
      <li>New Format BER Assessment Certificate</li>
      <li>SEAI Registered Contractor Sign-off Sheet</li>
      <li>Heat Pump Commissioning Sheet</li>
      <li>Solar PV NC6 Grid Connection Form</li>
    </ul>

    <div class="advisor-card">
      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80" alt="John O'Donnell" class="advisor-avatar" />
      <div style="font-size: 13px;">
        <div style="font-size: 11px; color: #9333ea; font-weight: bold; text-transform: uppercase;">Assigned Local SEAI Surveyor</div>
        <div style="font-size: 15px; font-weight: bold; color: #1e1b4b;">John O'Donnell</div>
        <div>Phone: <strong>085-123-4567</strong> | Email: <strong>advisor@ecosmart.ie</strong></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
