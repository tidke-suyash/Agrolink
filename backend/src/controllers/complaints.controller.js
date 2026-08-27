const supabase = require('../config/supabase');

// Official Maharashtra Agricultural & Electricity Helplines & Authorities
const MAHARASHTRA_HELPLINES = [
  {
    id: 'msedcl-power',
    name: 'MSEDCL (Mahavitaran) 24x7 Power Outage & Feeder Toll-Free',
    department: 'Maharashtra State Electricity Distribution Co. Ltd.',
    phone: '1912',
    alternatePhone: '1800-212-3435',
    email: 'customercare@mahadiscom.in',
    category: 'Electricity / Load Shedding / Power Outage',
    description: 'Report power cut during irrigation, load shedding, transformer burn, low voltage, burnt cable, or agricultural feeder trip.',
    emergency: true,
  },
  {
    id: 'kisan-call-center',
    name: 'Kisan Call Center (KCC) Maharashtra',
    department: 'Ministry of Agriculture & Farmers Welfare',
    phone: '1800-180-1551',
    alternatePhone: '1551',
    email: 'kisan-callcenter@gov.in',
    category: 'Crop Advisory & Emergency',
    description: 'Expert advice on crop disease, pest emergency, unseasonal rain damage, and expert scientist consultation.',
    emergency: false,
  },
  {
    id: 'agri-comm-pune',
    name: 'Commissioner of Agriculture Maharashtra (Pune)',
    department: 'Department of Agriculture, Govt. of Maharashtra',
    phone: '020-25537038',
    alternatePhone: '020-25537039',
    email: 'agri.comm@maharashtra.gov.in',
    category: 'Fertilizer / Seed Quality & Subsidy Grievance',
    description: 'Complaints regarding duplicate seeds, bogus fertilizers, subsidy hold-up, and nursery fraud.',
    emergency: false,
  },
  {
    id: 'pmfby-insurance',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) Maharashtra',
    department: 'Crop Insurance & Calamity Cell',
    phone: '14447',
    alternatePhone: '1800-209-5959',
    email: 'support-pmfby@gov.in',
    category: 'Crop Loss & Insurance Claim',
    description: 'Report localized crop loss within 72 hours due to unseasonal rain, hailstorm, drought, or flood.',
    emergency: true,
  },
  {
    id: 'wrd-canal-water',
    name: 'Maharashtra Water Resources & Canal Irrigation Helpline',
    department: 'Water Resources Dept (WRD), Govt. of Maharashtra',
    phone: '022-22025219',
    alternatePhone: '020-26127170',
    email: 'sec.wrd@maharashtra.gov.in',
    category: 'Canal Water / Dam Rotation / Irrigation',
    description: 'Grievance regarding irregular canal water rotation, lift irrigation pump tripping, or canal breakage.',
    emergency: false,
  },
  {
    id: 'disaster-mgmt-cell',
    name: 'Maharashtra State Disaster Management Control Room',
    department: 'Revenue & Forest Dept, Mantralaya',
    phone: '1077',
    alternatePhone: '022-22027990',
    email: 'disaster.mh@gov.in',
    category: 'Disaster / Flood / Hailstorm Relief',
    description: 'Immediate emergency reporting of severe flood, cloudburst, lightning strikes on cattle/fields.',
    emergency: true,
  },
];

// Initial seeded complaints for live demo & tracking
let memoryComplaints = [
  {
    id: 'CMP-MH-2026-8821',
    user_id: 'usr-farmer-1',
    farmer_name: 'Rajesh Patil',
    phone: '9822019283',
    district: 'Nashik',
    taluka: 'Dindori',
    village: 'Vani Khurd',
    category: 'Electricity / Load Shedding / Power Outage',
    consumer_no: '049120038192',
    feeder_name: 'Vani 11kV Agri Feeder',
    substation: 'Dindori 33/11kV Substation',
    severity: 'Emergency',
    title: 'Complete 18-hour continuous power cut — Grapes drip irrigation halted',
    description: 'Power cut occurred yesterday 4:00 PM and has not returned. Grape crop is at critical berry development stage and drip pumps cannot run. Transformer oil leakage observed at pole near survey no. 142.',
    status: 'Escalated to MSEDCL',
    escalated_to: 'Executive Engineer, MSEDCL Dindori Division',
    escalated_email: 'customercare@mahadiscom.in',
    escalated_at: '2026-08-27T10:15:00.000Z',
    resolution_notes: 'Escalation ticket #MSEDCL-NSK-9912 generated. Line inspection squad dispatched.',
    created_at: '2026-08-27T08:30:00.000Z',
    updated_at: '2026-08-27T10:15:00.000Z',
  },
  {
    id: 'CMP-MH-2026-8819',
    user_id: 'usr-farmer-2',
    farmer_name: 'Anil Kadam',
    phone: '9423187261',
    district: 'Nashik',
    taluka: 'Niphad',
    village: 'Lasalgaon',
    category: 'Electricity / Load Shedding / Power Outage',
    consumer_no: '049182309112',
    feeder_name: 'Lasalgaon Rural Feeder 2',
    substation: 'Pimpalgaon Substation',
    severity: 'High',
    title: 'Frequent 2-phase supply instead of 3-phase — motor burn risk',
    description: 'Only 2 phases working for last 3 days. 7.5 HP submersible pump cannot operate and single phasing burnt neighbor motor.',
    status: 'Under Review',
    escalated_to: null,
    escalated_email: null,
    resolution_notes: null,
    created_at: '2026-08-26T14:20:00.000Z',
    updated_at: '2026-08-26T14:20:00.000Z',
  },
  {
    id: 'CMP-MH-2026-8812',
    user_id: 'usr-farmer-3',
    farmer_name: 'Suresh Verma',
    phone: '9890123456',
    district: 'Ahmednagar',
    taluka: 'Sangamner',
    village: 'Ashwi',
    category: 'Canal Water / Dam Rotation / Irrigation',
    consumer_no: 'N/A',
    feeder_name: 'Bhandardara Left Bank Canal Km 42',
    substation: 'WRD Sangamner Sub-division',
    severity: 'High',
    title: 'Canal water rotation delayed by 12 days for sugarcane crop',
    description: 'Water rotation schedule promised on 15th August has not reached tail-end farmers in Ashwi village. Sugarcane crop is drying.',
    status: 'Escalated to Dept',
    escalated_to: 'Sub-Divisional Engineer, WRD Sangamner',
    escalated_email: 'sec.wrd@maharashtra.gov.in',
    escalated_at: '2026-08-25T11:00:00.000Z',
    resolution_notes: 'Tail-end gate opened on 26th Aug. Water expected to reach by evening.',
    created_at: '2026-08-24T09:00:00.000Z',
    updated_at: '2026-08-25T11:00:00.000Z',
  },
  {
    id: 'CMP-MH-2026-8798',
    user_id: 'usr-farmer-4',
    farmer_name: 'Ganesh Sawant',
    phone: '9158098765',
    district: 'Kolhapur',
    taluka: 'Karveer',
    village: 'Shiroli',
    category: 'Electricity / Load Shedding / Power Outage',
    consumer_no: '038192837461',
    feeder_name: 'Shiroli Agri Feeder',
    substation: 'Karveer Substation',
    severity: 'Medium',
    title: 'Agri Transformer tripped due to heavy monsoon rain',
    description: 'Heavy lightning struck pole DT-4. Fuse blown and transformer off for 14 hours.',
    status: 'Resolved',
    escalated_to: 'Junior Engineer, MSEDCL Karveer',
    escalated_email: 'customercare@mahadiscom.in',
    escalated_at: '2026-08-23T08:00:00.000Z',
    resolution_notes: 'Fuse replaced and transformer test charged successfully by lineman.',
    created_at: '2026-08-22T20:00:00.000Z',
    updated_at: '2026-08-23T15:30:00.000Z',
  },
];

/**
 * Get Maharashtra Helplines Directory
 * GET /api/complaints/helplines
 */
async function getHelplines(req, res, next) {
  try {
    res.json({ helplines: MAHARASHTRA_HELPLINES });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all complaints (Admin gets all, regular user gets their own)
 * GET /api/complaints
 */
async function getComplaints(req, res, next) {
  try {
    const userRole = req.user?.role || 'customer';
    const userId = req.user?.id;
    const { status, category, district, search } = req.query;

    // Try Supabase first
    let complaints = [];
    const { data: dbComplaints, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbComplaints && dbComplaints.length > 0) {
      complaints = dbComplaints;
    } else {
      complaints = [...memoryComplaints];
    }

    // Filter by user if not admin
    if (userRole !== 'admin') {
      complaints = complaints.filter((c) => c.user_id === userId || c.user_id?.startsWith('usr-farmer'));
    }

    // Query filters
    if (status && status !== 'all') {
      complaints = complaints.filter((c) => c.status?.toLowerCase() === status.toLowerCase());
    }
    if (category && category !== 'all') {
      complaints = complaints.filter((c) => c.category?.toLowerCase() === category.toLowerCase());
    }
    if (district && district !== 'all') {
      complaints = complaints.filter((c) => c.district?.toLowerCase() === district.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      complaints = complaints.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.farmer_name?.toLowerCase().includes(q) ||
          c.village?.toLowerCase().includes(q) ||
          c.consumer_no?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q)
      );
    }

    res.json({
      complaints,
      stats: {
        total: memoryComplaints.length,
        outages: memoryComplaints.filter((c) => c.category.includes('Electricity')).length,
        escalated: memoryComplaints.filter((c) => c.status.includes('Escalated')).length,
        resolved: memoryComplaints.filter((c) => c.status === 'Resolved').length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * File a new grievance / power outage complaint
 * POST /api/complaints
 */
async function createComplaint(req, res, next) {
  try {
    const {
      category = 'Electricity / Load Shedding / Power Outage',
      title,
      description,
      district = 'Nashik',
      taluka = '',
      village = '',
      consumer_no = '',
      feeder_name = '',
      substation = '',
      severity = 'High',
      phone = '',
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const complaintId = `CMP-MH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint = {
      id: complaintId,
      user_id: req.user?.id || 'usr-farmer-anon',
      farmer_name: req.user?.name || req.user?.email?.split('@')[0] || 'Farmer',
      phone: phone || req.user?.phone || '9822000000',
      district,
      taluka,
      village,
      category,
      consumer_no: consumer_no || 'N/A',
      feeder_name: feeder_name || 'Agri Feeder',
      substation: substation || 'Local Substation',
      severity,
      title,
      description,
      status: 'Reported',
      escalated_to: null,
      escalated_email: null,
      escalated_at: null,
      resolution_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to memory store
    memoryComplaints.unshift(newComplaint);

    // Try saving to Supabase if table exists
    await supabase.from('complaints').insert([newComplaint]).catch(() => {});

    res.status(201).json({
      message: 'Grievance submitted successfully. Tracking ticket generated.',
      complaint: newComplaint,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update complaint status (Admin only)
 * PATCH /api/complaints/:id/status
 */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, escalated_to, escalated_email, resolution_notes } = req.body;

    const complaint = memoryComplaints.find((c) => c.id === id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    complaint.status = status || complaint.status;
    if (escalated_to) complaint.escalated_to = escalated_to;
    if (escalated_email) complaint.escalated_email = escalated_email;
    if (resolution_notes !== undefined) complaint.resolution_notes = resolution_notes;
    if (status?.includes('Escalated')) {
      complaint.escalated_at = new Date().toISOString();
    }
    complaint.updated_at = new Date().toISOString();

    // Try Supabase update
    await supabase
      .from('complaints')
      .update({
        status: complaint.status,
        escalated_to: complaint.escalated_to,
        escalated_email: complaint.escalated_email,
        resolution_notes: complaint.resolution_notes,
        updated_at: complaint.updated_at,
      })
      .eq('id', id)
      .catch(() => {});

    res.json({
      message: 'Status updated successfully',
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate formal Official Escalation Email Draft
 * POST /api/complaints/:id/escalation-draft
 */
async function generateEscalationDraft(req, res, next) {
  try {
    const { id } = req.params;
    const complaint = memoryComplaints.find((c) => c.id === id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const defaultAuthority =
      complaint.category.includes('Electricity')
        ? { name: 'MSEDCL (Mahavitaran) Superintending Engineer', email: 'customercare@mahadiscom.in' }
        : { name: 'District Agriculture Officer (Maharashtra)', email: 'agri.comm@maharashtra.gov.in' };

    const emailSubject = `[URGENT AGRO-ESCALATION] ${complaint.category} — Ticket #${complaint.id} | Village ${complaint.village}, ${complaint.district}`;

    const emailBody = `Respected Officer,

We are escalating an urgent agricultural grievance filed on the AgroLink Maharashtra Grievance Portal:

--------------------------------------------------
TICKET NUMBER   : ${complaint.id}
CATEGORY        : ${complaint.category}
URGENCY LEVEL   : ${complaint.severity}
FARMER NAME     : ${complaint.farmer_name}
CONTACT PHONE   : ${complaint.phone}
LOCATION        : Village ${complaint.village || 'N/A'}, Taluka ${complaint.taluka || 'N/A'}, District ${complaint.district}, Maharashtra
CONSUMER NO.    : ${complaint.consumer_no || 'N/A'}
FEEDER / LINE   : ${complaint.feeder_name || 'N/A'}
SUBSTATION      : ${complaint.substation || 'N/A'}
DATE REPORTED   : ${new Date(complaint.created_at).toLocaleString('en-IN')}
--------------------------------------------------

GRIEVANCE SUMMARY:
${complaint.title}

DETAILED DESCRIPTION & CROP IMPACT:
${complaint.description}

REQUESTED ACTION:
Immediate on-ground inspection, power/water restoration, or technical squad dispatch is requested to prevent severe standing crop loss for local cultivators.

Sincerely,
AgroLink Agriculture Grievance Redressal Cell
State Operations (Maharashtra)
Support Portal: http://localhost:5173/complaints`;

    res.json({
      to: complaint.escalated_email || defaultAuthority.email,
      authorityName: defaultAuthority.name,
      subject: emailSubject,
      body: emailBody,
      mailtoUrl: `mailto:${complaint.escalated_email || defaultAuthority.email}?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHelplines,
  getComplaints,
  createComplaint,
  updateStatus,
  generateEscalationDraft,
};
