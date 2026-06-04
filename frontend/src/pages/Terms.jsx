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

export default function Terms() {
  return (
    <div style={s.wrap}>
      <div style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.eye}>Terms &amp; conditions</p>
          <h1 style={s.title}>Terms &amp; <em style={{ fontStyle: 'italic', color: '#A8C8B0' }}>conditions</em></h1>
          <p style={s.sub}>Please read these terms carefully before booking with Creek View Villa.</p>
        </div>
      </div>
      <div style={s.content}>
        <p style={s.updated}><i className="ti ti-clock" aria-hidden="true" style={{ fontSize: 13, color: '#B8935A' }} /> Last updated: June 2025</p>

        <Section title="1. Acceptance of Terms">
          <p style={s.bodyText}>By accessing villa-website-drt.pages.dev or completing a booking with Creek View Villa, you agree to be legally bound by these Terms & Conditions ("Terms"). If you do not agree, you must not make a booking or use this website. These Terms constitute a legally binding contract under the Indian Contract Act, 1872.</p>
        </Section>

        <Section title="2. About Us">
          <p style={s.bodyText}>Creek View Villa is a privately owned homestay accommodation property located in Padinjarathara, Wayanad, Kerala, India. Contact: <a href="mailto:creekviewvilla@gmail.com" style={{ color: '#06402B' }}>creekviewvilla@gmail.com</a> | <a href="tel:+917306198968" style={{ color: '#06402B' }}>+91 73061 98968</a></p>
        </Section>

        <Section title="3. Booking Process">
          <p style={s.bodyText}><strong>3.1 How a Booking is Made</strong></p>
          <ol style={{ paddingLeft: 20, fontSize: 13, color: '#5A5040', lineHeight: 1.85, fontWeight: 300 }}>
            <li style={{ marginBottom: 6 }}>Select your room, check-in/check-out dates, and number of guests on our website.</li>
            <li style={{ marginBottom: 6 }}>Complete the booking form with accurate personal details.</li>
            <li style={{ marginBottom: 6 }}>Proceed to payment via our secure Razorpay payment gateway.</li>
            <li style={{ marginBottom: 6 }}>Upon successful payment, you will receive a booking confirmation via email.</li>
          </ol>
          <p style={s.bodyText}>A booking is only confirmed after successful payment and issuance of a confirmation email. Selecting a room and filling the form without completing payment does not constitute a confirmed reservation.</p>

          <p style={s.bodyText}><strong>3.2 Accuracy of Information</strong> — You are responsible for providing accurate information at the time of booking — including the correct number of guests, check-in/check-out dates, and guest type. Providing false or misleading information may result in cancellation without refund.</p>

          <p style={s.bodyText}><strong>3.3 Room Allocation</strong> — Room availability is confirmed at the time of booking. We reserve the right to offer an equivalent or superior room if the originally booked room becomes unavailable due to unforeseen circumstances (e.g., maintenance). We will notify you immediately if this occurs.</p>
        </Section>

        <Section title="4. Pricing & Payment">
          <p style={s.bodyText}><strong>4.1 Prices</strong> — All prices displayed on the website are in Indian Rupees (INR) and include applicable taxes unless otherwise stated. Prices may change without notice — the price confirmed at the time of successful payment is the price you will be charged.</p>

          <p style={s.bodyText}><strong>4.2 Payment Gateway — Razorpay</strong> — All payments are processed by Razorpay Payments Private Limited (a RBI-authorised payment aggregator). By proceeding with payment, you also agree to Razorpay's terms of service at razorpay.com/terms. We do not store any card, UPI, or net-banking credentials on our servers.</p>

          <p style={s.bodyText}><strong>4.3 Payment Failure</strong> — If your payment fails, your booking will not be confirmed. In case of a payment failure where money was debited from your account, Razorpay's automated process will initiate a refund within 5–7 business days. Contact us if you experience issues.</p>

          <p style={s.bodyText}><strong>4.4 GST & Taxes</strong> — Applicable GST on accommodation services will be charged as per prevailing Government of India rates. A GST invoice will be provided upon request.</p>
        </Section>

        <Section title="5. Cancellation & Refund Policy">
          <p style={s.bodyText}><strong>5.1 Guest-Initiated Cancellations</strong></p>
          <DataTable rows={[
            ['Cancellation Notice Period', 'Refund Entitlement'],
            ['Any cancellation after booking', 'Advance amount (20% of total booking) is non-refundable'],
          ]} />
          <p style={s.bodyText}>Note: We collect only an advance payment of 20% of the total booking amount to confirm your reservation. This advance amount is strictly non-refundable regardless of when the cancellation is made. The remaining balance is payable at check-in.</p>

          <p style={s.bodyText}><strong>5.2 Property-Initiated Cancellations</strong> — If we cancel your booking due to circumstances within our control (e.g., double booking, property damage), you will receive a full refund within 5–7 business days. We will notify you immediately by email and phone.</p>

          <p style={s.bodyText}><strong>5.3 Cancellations Due to Force Majeure</strong> — Cancellations caused by events beyond either party's control — including natural disasters, floods, government-declared emergencies, epidemics/pandemics, or civil unrest — will be handled on a case-by-case basis. We will offer a credit note or reschedule option where possible.</p>

          <p style={s.bodyText}><strong>5.4 How to Cancel</strong> — Email <a href="mailto:creekviewvilla@gmail.com" style={{ color: '#06402B' }}>creekviewvilla@gmail.com</a> with your booking reference (Razorpay Order ID), full name, and reason for cancellation. The cancellation date is the date we receive your written cancellation request.</p>
        </Section>

        <Section title="6. Check-in & Check-out Rules">
          <List items={[
            'Standard check-in time: 2:00 PM (14:00 IST)',
            'Standard check-out time: 11:00 AM (11:00 IST)',
            'Early check-in / Late check-out: Subject to availability; may attract additional charges at our discretion',
            'Valid ID required: All guests must present a valid government-issued photo ID (Aadhaar, PAN, Passport, Voter ID, or Driving Licence) at check-in. This is a legal requirement under local police regulations.',
            'Guest registration: We maintain a guest register as required by applicable law. Information may be shared with local police authorities on official request.',
          ]} />
        </Section>

        <Section title="7. Guest Conduct & House Rules">
          <p style={s.bodyText}><strong>7.1 General Conduct</strong></p>
          <List items={[
            'Maintain peace and quiet, especially between 10:00 PM and 7:00 AM',
            'Treat all property, fixtures, furniture, and equipment with care',
            'Do not smoke inside the premises (designated smoking areas may be available outside)',
            'Pets are not permitted unless explicitly agreed in writing before check-in',
            'Any damage caused to property will be charged to the responsible guest at replacement cost',
          ]} />

          <p style={s.bodyText}><strong>7.2 Guest Type Policy</strong> — Bachelor groups: We accommodate verified bachelor group bookings only when the guest type is declared as 'Bachelor' at the time of booking and verified at check-in. Misrepresenting group composition may result in immediate cancellation without refund and eviction from the property.</p>
          <p style={s.bodyText}>Family groups: Family bookings are welcome. At least one adult family member must be present throughout the stay.</p>

          <p style={s.bodyText}><strong>7.3 Prohibited Activities</strong></p>
          <List items={[
            'Illegal activities of any nature',
            'Subletting or re-renting the accommodation to third parties',
            'Commercial photography or video shoots without prior written permission',
            'Events, parties, or gatherings beyond the declared number of guests',
          ]} />
        </Section>

        <Section title="8. Liability & Disclaimers">
          <p style={s.bodyText}><strong>8.1 Our Liability</strong> — Creek View Villa shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of our website or accommodation, including but not limited to loss of property, personal injury caused by guest negligence, or disruption to your travel plans due to force majeure events. Our maximum liability in any circumstance shall not exceed the total booking amount paid by you for the relevant stay.</p>

          <p style={s.bodyText}><strong>8.2 Your Valuables</strong> — We are not responsible for loss or theft of personal belongings, cash, jewellery, or electronic devices. We strongly recommend keeping valuables secure at all times.</p>

          <p style={s.bodyText}><strong>8.3 Website Accuracy</strong> — We take reasonable care to ensure the information on our website (room descriptions, photos, prices, amenities) is accurate and up to date. However, we do not warrant that all information is error-free. In case of a material discrepancy, we will contact you before confirming your booking.</p>
        </Section>

        <Section title="9. Intellectual Property">
          <p style={s.bodyText}>All content on villa-website-drt.pages.dev — including text, photographs, room descriptions, logos, and design — is the property of Creek View Villa and protected under the Copyright Act, 1957. You may not reproduce, republish, or distribute any content without our prior written consent.</p>
        </Section>

        <Section title="10. Third-Party Services">
          <p style={s.bodyText}>Our website integrates third-party services including Razorpay (payments), Firebase/Google (database), Brevo (email), and Google Maps (location). Your use of these embedded services is also subject to their respective terms of service and privacy policies.</p>
        </Section>

        <Section title="11. Governing Law & Dispute Resolution">
          <p style={s.bodyText}><strong>11.1 Governing Law</strong> — These Terms are governed by the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Kerala, India.</p>

          <p style={s.bodyText}><strong>11.2 Consumer Complaints</strong> — If you are not satisfied with our response, you may lodge a complaint with the National Consumer Helpline (NCH) at 1800-11-4000 or online at consumerhelpline.gov.in under the Consumer Protection Act, 2019.</p>

          <p style={s.bodyText}><strong>11.3 Grievance Officer</strong></p>
          <InfoTable rows={[
            ['Name', 'Creek View Villa'],
            ['Email', 'creekviewvilla@gmail.com'],
            ['Phone', '+91 73061 98968'],
            ['Response Time', 'Within 30 days'],
          ]} />
        </Section>

        <Section title="12. Changes to These Terms">
          <p style={s.bodyText}>We reserve the right to update these Terms at any time. The latest version will be posted on this page with the effective date. Continued use of the website or making a new booking after changes constitutes your acceptance of the updated Terms.</p>
        </Section>

        <ContactBox icon="file-text" title="Questions about these terms?" detail="creekviewvilla@gmail.com · +91 73061 98968 · Padinjarathara, Wayanad, Kerala" />
      </div>
    </div>
  );
}
