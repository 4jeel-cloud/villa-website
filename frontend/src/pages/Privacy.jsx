const s = {
  wrap:       { fontFamily: 'DM Sans, sans-serif', background: '#F7F4EF', minHeight: '100vh', paddingBottom: 64 },
  hero:       { background: '#1C3A28', padding: '40px 40px 0' },
  heroInner:  { maxWidth: 760, margin: '0 auto' },
  eye:        { fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7AB890', marginBottom: 10 },
  title:      { fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: '#fff', lineHeight: 1.2, marginBottom: 8 },
  sub:        { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300, lineHeight: 1.7, marginBottom: 28 },
  content:    { maxWidth: 760, margin: '0 auto', padding: '40px 40px 0' },
  updated:    { fontSize: 11, color: '#9A8878', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 },
  section:    { marginBottom: 32 },
  secTitle:   { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: '#1C3A28', marginBottom: 10, paddingBottom: 8, borderBottom: '0.5px solid #E2D4C8' },
  bodyText:   { fontSize: 13, color: '#5A5040', lineHeight: 1.85, fontWeight: 300, marginBottom: 10 },
  highlight:  { background: '#F0EAE2', borderLeft: '2px solid #B8935A', padding: '12px 16px', borderRadius: '0 4px 4px 0', margin: '16px 0' },
  hlText:     { fontSize: 12, color: '#7A6050', lineHeight: 1.7, margin: 0 },
  li:         { fontSize: 13, color: '#5A5040', lineHeight: 1.7, paddingLeft: 16, position: 'relative', fontWeight: 300, marginBottom: 6 },
  contactBox: { background: '#fff', border: '0.5px solid #D8D0C8', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 24 },
  contactIc:  { width: 36, height: 36, background: '#EAF3EA', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B6D11', fontSize: 18, flexShrink: 0 },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 },
  th:         { border: '1px solid #d1d5db', padding: '8px 12px', background: '#e2e8f0', textAlign: 'left', fontWeight: 600, fontSize: 11 },
  td:         { border: '1px solid #d1d5db', padding: '8px 12px', fontSize: 12, color: '#5A5040' },
};

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <div style={s.secTitle}>{title}</div>
      {children}
    </div>
  );
}

function Highlight({ children }) {
  return (
    <div style={s.highlight}>
      <p style={s.hlText}>{children}</p>
    </div>
  );
}

function List({ items }) {
  return (
    <ul style={{ margin: '8px 0 10px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
      {items.map((item, i) => (
        <li key={i} style={s.li}>
          <span style={{ position: 'absolute', left: 0, color: '#B8935A', fontSize: 11, top: 2 }}>—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ContactBox({ icon, title, detail }) {
  return (
    <div style={s.contactBox}>
      <div style={s.contactIc}><i className={`ti ti-${icon}`} aria-hidden="true" /></div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1C3A28', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#7A9A7A', lineHeight: 1.7 }}>{detail}</div>
      </div>
    </div>
  );
}

function DataTable({ rows }) {
  return (
    <table style={s.table}>
      <thead>
        <tr>{rows[0].map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.slice(1).map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j} style={s.td}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function InfoTable({ rows }) {
  return (
    <table style={s.table}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}><td style={{ ...s.td, fontWeight: 500, width: '40%' }}>{r[0]}</td><td style={s.td}>{r[1]}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Privacy() {
  return (
    <div style={s.wrap}>
      <div style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.eye}>Privacy policy</p>
          <h1 style={s.title}>Privacy <em style={{ fontStyle: 'italic', color: '#A8C8B0' }}>policy</em></h1>
          <p style={s.sub}>Creek View Villa is committed to your privacy. Please read this policy before booking.</p>
        </div>
      </div>
      <div style={s.content}>
        <p style={s.updated}><i className="ti ti-clock" aria-hidden="true" style={{ fontSize: 13, color: '#B8935A' }} /> Last updated: June 2025</p>

        <Section title="1. Who We Are">
          <p style={s.bodyText}>Creek View Villa ("we", "us", "our") is a homestay accommodation provider operating from Padinjarathara, Wayanad, Kerala, India. We operate the website villa-website-drt.pages.dev. This Privacy Policy explains what personal data we collect when you make a booking, how we use it, whom we share it with, and your rights under Indian law — including the Information Technology Act, 2000, the IT (Reasonable Security Practices) Rules, 2011, and the Digital Personal Data Protection (DPDP) Act, 2023.</p>
        </Section>

        <Section title="2. What Personal Data We Collect">
          <p style={s.bodyText}><strong>2.1 Guest Booking Data</strong> — When you make a booking, we collect:</p>
          <DataTable rows={[
            ['Field', 'Why We Collect It', 'Retention Period'],
            ['Full Name', 'To confirm your reservation and for communication', '3 years from check-out'],
            ['Email Address', 'To send booking confirmation and updates', '3 years from check-out'],
            ['Phone Number', 'For operational coordination and emergencies', '3 years from check-out'],
            ['Number of Guests', 'Room capacity planning', '3 years from check-out'],
            ['Guest Type (Family/Bachelor)', 'Compliance with property policy and local rules', '3 years from check-out'],
            ['Check-in / Check-out Dates', 'Reservation management', '3 years from check-out'],
            ['Room Selected', 'Booking fulfilment', '3 years from check-out'],
            ['Payment Amount', 'Transaction record and invoicing', '3 years from check-out'],
            ['Razorpay Payment ID & Order ID', 'Payment verification and dispute resolution', '3 years from check-out'],
          ]} />

          <p style={s.bodyText}><strong>2.2 Payment Data</strong> — All payment processing is handled by Razorpay via a secure hosted payment page/iframe. We never see, store, or process your card number, CVV, UPI PIN, or net-banking credentials. The only payment data stored on our systems are the Razorpay-generated Payment ID and Order ID, which are reference numbers only.</p>

          <p style={s.bodyText}><strong>2.3 Data We Do NOT Collect</strong> — We do not collect or store any of the following:</p>
          <List items={[
            'Your IP address',
            'Your precise or approximate geographic location',
            'Cookies from our own code (Firebase may set a short-lived session cookie for admin authentication only)',
            'Device fingerprinting data',
            'Analytics or tracking data (no Google Analytics, Meta Pixel, or similar tools are installed)',
            'Credit/debit card numbers or CVV',
          ]} />
        </Section>

        <Section title="3. Legal Basis for Processing">
          <p style={s.bodyText}>We process your personal data on the following grounds under the DPDP Act, 2023 and IT Rules:</p>
          <DataTable rows={[
            ['Legal Basis', 'How It Applies'],
            ['Contractual Necessity', 'Processing your booking request and fulfilling the accommodation contract'],
            ['Consent', 'Sending marketing emails (only if you opt in)'],
            ['Legal Obligation', 'Guest registration records required under Foreigners Act / local police regulations'],
            ['Legitimate Interest', 'Fraud prevention, dispute resolution, and security of our property'],
          ]} />
        </Section>

        <Section title="4. How We Use Your Data">
          <List items={[
            'Confirm and manage your booking',
            'Send booking confirmation, check-in instructions, and cancellation notices via email (Brevo)',
            'Process payments through Razorpay',
            'Maintain guest records as required by law (Police verification, local regulations)',
            'Prevent fraud and resolve payment disputes',
            'Respond to your queries and complaints',
          ]} />
          <Highlight>We do not use your data for profiling, automated decision-making, or targeted advertising.</Highlight>
        </Section>

        <Section title="5. Who We Share Your Data With">
          <DataTable rows={[
            ['Service Provider', 'Data Shared', 'Purpose'],
            ['Firebase / Google Cloud', 'All booking, room, and availability data', 'Database storage'],
            ['Razorpay', 'Name, email, phone, amount, room description', 'Payment processing'],
            ['Brevo (Sendinblue)', 'Name, email, booking dates, room', 'Transactional email delivery'],
            ['Google Sheets (via Apps Script)', 'All booking and room block data', 'Operational records'],
            ['Google Fonts', 'IP address, User-Agent, Referer (standard CDN log)', 'Font loading'],
            ['Tabler Icons (CDN)', 'Standard browser request data (per provider\'s own policy)', 'Icon loading'],
            ['Google Maps', 'Standard browser request data (per Google\'s own policy)', 'Map embed on website'],
          ]} />
          <Highlight>We do not sell, rent, or trade your personal data to any third party for marketing purposes.</Highlight>
        </Section>

        <Section title="6. Data Retention">
          <List items={[
            'Booking records: 3 years from the date of check-out, as required for tax and dispute purposes',
            'Payment reference IDs: 5 years (Razorpay records maintained independently)',
            'Email communication logs: 1 year',
            'Blocked dates and room settings: Until manually deleted by the property administrator',
          ]} />
          <p style={s.bodyText}>After the applicable retention period, data is deleted from Firebase and Google Sheets. Data held by third parties (Razorpay, Brevo, Google) is subject to their own retention policies.</p>
        </Section>

        <Section title="7. Data Security">
          <p style={s.bodyText}>We implement the following security measures in compliance with the IT (Reasonable Security Practices) Rules, 2011:</p>
          <List items={[
            'All data transmitted between your browser and our server uses HTTPS/TLS encryption',
            'Firebase Firestore access is protected by Firestore Security Rules limiting access to authenticated admins only',
            'Admin authentication is handled exclusively by Firebase Auth; passwords are never stored in plaintext',
            'Admin session cookies are cleared on tab close — no persistent admin sessions',
            'Payment card data never touches our servers — handled entirely within Razorpay\'s PCI-DSS-certified environment',
          ]} />
          <p style={s.bodyText}>No system is 100% secure. In the event of a data breach affecting your rights, we will notify you as required by the DPDP Act, 2023.</p>
        </Section>

        <Section title="8. Your Rights Under the DPDP Act, 2023">
          <DataTable rows={[
            ['Right', 'What It Means'],
            ['Right to Access', 'Request a copy of the personal data we hold about you'],
            ['Right to Correction', 'Ask us to correct inaccurate or incomplete data'],
            ['Right to Erasure', 'Request deletion of your data (subject to legal retention obligations)'],
            ['Right to Grievance Redressal', 'Lodge a complaint with our Grievance Officer (see Section 11)'],
            ['Right to Nominate', 'Nominate another person to exercise rights on your behalf in case of death/incapacity'],
          ]} />
          <p style={s.bodyText}>Email us at <a href="mailto:creekviewvilla@gmail.com" style={{ color: '#06402B' }}>creekviewvilla@gmail.com</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="9. Cross-Border Data Transfers">
          <p style={s.bodyText}>Your data may be transferred to and stored on servers located outside India, specifically by Google (cloud database and spreadsheet services), Brevo, and Razorpay. These transfers are made to service providers who maintain adequate data protection standards. By making a booking on our website, you consent to these transfers.</p>
        </Section>

        <Section title="10. Children's Privacy">
          <p style={s.bodyText}>Our booking services are not directed at children under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has submitted personal data to us, please contact us immediately and we will delete it.</p>
        </Section>

        <Section title="11. Grievance Officer">
          <InfoTable rows={[
            ['Name', 'Creek View Villa'],
            ['Property', 'Padinjarathara, Wayanad, Kerala'],
            ['Email', 'creekviewvilla@gmail.com'],
            ['Phone', '+91 73061 98968'],
            ['Address', 'Padinjarathara, Wayanad, Kerala, India'],
            ['Response Time', 'Within 30 days of receiving your complaint'],
          ]} />
        </Section>

        <Section title="12. Changes to This Policy">
          <p style={s.bodyText}>We may update this Privacy Policy from time to time. The latest version will always be posted on this page with the effective date. Continued use of the website after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="13. Governing Law">
          <p style={s.bodyText}>This Privacy Policy is governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kerala, India.</p>
        </Section>

        <ContactBox icon="mail" title="Privacy questions?" detail="creekviewvilla@gmail.com · +91 73061 98968 · Padinjarathara, Wayanad, Kerala" />
      </div>
    </div>
  );
}
