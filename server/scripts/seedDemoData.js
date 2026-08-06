export const DEMO_SCANS = [
  {
    message_source: 'sms',
    original_text: 'URGENT: Your Netflix subscription has expired. Payment failed on 05/08/2026. Update your billing info immediately at http://netflix-verify-acc-9812.com or your account will be deleted in 24 hours!',
    is_scam: true,
    risk_score: 95,
    risk_level: 'high',
    scam_type: 'phishing',
    red_flags: [
      'Artificial urgency (24-hour deadline)',
      'Suspicious non-official domain (netflix-verify-acc-9812.com)',
      'Direct request for payment card update via link',
      'Generic greeting and pressure tactics'
    ],
    explanation: 'This SMS impersonates Netflix using artificial panic and a fraudulent URL designed to steal credit card details. Netflix never sends SMS alerts demanding immediate payment via unverified third-party domains.',
    recommended_action: 'Do not click the link. Block the sender number and check your Netflix account directly on netflix.com.'
  },
  {
    message_source: 'email',
    original_text: 'Dear Customer, your Bank of America account #****4912 has been temporarily suspended due to 3 unauthorized login attempts. Click here to verify your SSN and restore access: https://boa-secure-login-portal.net',
    is_scam: true,
    risk_score: 98,
    risk_level: 'high',
    scam_type: 'impersonation_bank_or_government',
    red_flags: [
      'Bank impersonation via unverified sender',
      'Request for sensitive SSN verification',
      'Spoofed domain name (boa-secure-login-portal.net)',
      'Threat of account suspension'
    ],
    explanation: 'Classic banking phishing attempt. Banks will never ask for your Social Security Number via a link in an unprompted email.',
    recommended_action: 'Never enter personal details or passwords. Report this message to your bank immediately.'
  },
  {
    message_source: 'whatsapp',
    original_text: 'CONGRATULATIONS! You have won $500,000 in the 2026 Global International WhatsApp Lottery! To claim your cash prize, contact agent Mr. David Mark via Telegram @claim_agent_david with your full name and bank account details.',
    is_scam: true,
    risk_score: 92,
    risk_level: 'high',
    scam_type: 'lottery_prize_scam',
    red_flags: [
      'Unsolicited lottery win for a contest you never entered',
      'Large sum money offer ($500,000)',
      'Redirecting communication to Telegram',
      'Request for bank account details upfront'
    ],
    explanation: 'Legitimate lotteries do not select random WhatsApp numbers or award prizes for unentered drawings.',
    recommended_action: 'Do not reply or share banking details. Block and report the WhatsApp contact.'
  },
  {
    message_source: 'email',
    original_text: 'Hi Team, please find attached the updated project roadmap and Q3 deliverables schedule for our upcoming client meeting on Thursday. Let me know if you have any questions.',
    is_scam: false,
    risk_score: 5,
    risk_level: 'low',
    scam_type: 'not_a_scam',
    red_flags: [],
    explanation: 'Standard workplace communication. Contains no malicious links, unexpected attachments, financial requests, or pressure tactics.',
    recommended_action: 'Safe to open and review normally.'
  },
  {
    message_source: 'sms',
    original_text: 'USPS: Your package tracking #9400111899564121289110 has a delivery address issue. Please update your home address here to complete delivery: https://usps-delivery-status-update.info',
    is_scam: true,
    risk_score: 88,
    risk_level: 'high',
    scam_type: 'fake_delivery',
    red_flags: [
      'Impersonation of postal service (USPS)',
      'Fake delivery delay pretext',
      'Unverified domain extension (.info instead of usps.com)',
      'Phishing link collecting home address and personal data'
    ],
    explanation: 'This is a Smishing (SMS phishing) scam targeting package tracking. USPS uses usps.com for all official tracking.',
    recommended_action: 'Do not click the link. Track package directly at usps.com using the tracking number.'
  }
];

console.log(`Demo seed dataset ready with ${DEMO_SCANS.length} sample scans.`);
