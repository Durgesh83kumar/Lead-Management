/**
 * Lead Management - UI & State Engine
 * Views:
 * 1. Dashboard (KPIs, Priority Queue, Market breakdown)
 * 2. All Leads (Interactive Data Table, Filter by Tier & Location)
 * 3. Pipeline / Kanban (Hot, Warm, Cold)
 * 4. Dedicated Lead Intelligence Page (Dossier, BANT, Pre-call Battlecard, Grounded Copilot)
 */

const INITIAL_LEADS = [
  {
    id: "L01",
    name: "Rohit Kulkarni",
    phone: "9845012345",
    location: "Whitefield",
    property_requirement: "3BHK apartment, ready to move",
    budget: "1.6 Cr",
    timeline: "Within 1 month",
    message: "Hi, I'm relocating from Pune for my new job at ITPL, joining on 15th. Looking for a ready-to-move 3BHK near ITPL, budget around 1.6Cr. Home loan already sanctioned from HDFC for 1.2Cr. Can I visit this Saturday? Also please share the maintenance charges and whether OC is received.",
    score: 95,
    tag: "Hot",
    bant: { budget: 25, timeline: 25, need: 17, readiness: 19, engagement: 9 },
    signals: ["Relocating to ITPL (hard deadline on 15th)", "HDFC loan sanctioned for 1.2Cr", "Asked for site visit this Saturday", "Budget matches Whitefield 3BHK market", "Inquired about OC and maintenance"],
    objections: ["Demands verified OC-received property", "Maintenance charges breakdown"],
    next_action: "Call within 15 minutes, confirm Saturday 11 AM site visit, shortlist ready-to-move 3BHKs with OC near ITPL.",
    hook: "\"Hi Rohit, I saw you're joining ITPL on the 15th! I have 2 ready-to-move 3BHKs with full OC received, located literally 8 minutes from ITPL. Can we lock your Saturday visit at 11 AM?\"",
    suggested_reply: "Hi Rohit! Welcome to Bangalore in advance. Congratulations on your new role at ITPL! We have 2 ready-to-move 3BHK units with OC received right next to ITPL matching your 1.6Cr budget and HDFC pre-approval. Yes, Saturday site visit is confirmed. Sharing the brochure and maintenance sheet right here on WhatsApp."
  },
  {
    id: "L02",
    name: "Sneha Reddy",
    phone: "9876543210",
    location: "Sarjapur Road",
    property_requirement: "2BHK",
    budget: "95 L",
    timeline: "2-3 months",
    message: "Our rental lease ends in March so we want to buy a 2BHK on Sarjapur Road, preferably near Wipro campus. Budget max 95L incl. registration. Is there any project with possession before April? We have 20L down payment ready.",
    score: 88,
    tag: "Hot",
    bant: { budget: 25, timeline: 20, need: 16, readiness: 19, engagement: 8 },
    signals: ["Rental lease ending in March = hard forcing event", "20L liquid down payment ready in bank", "Specific locality near Wipro campus", "Budget is realistic for Sarjapur 2BHK"],
    objections: ["95L budget must be all-inclusive (with registration)", "Must deliver possession before April"],
    next_action: "Call today, share 2 ready/near-ready 2BHK options under 95L all-inclusive, lock weekend site visit.",
    hook: "\"Hi Sneha, heard your lease ends in March! We have an almost-ready 2BHK 5 minutes from Wipro campus under 95L all-inclusive with April keys in hand. When are you free for a 15-minute walkthrough?\"",
    suggested_reply: "Hello Sneha! We completely understand your timeline with the lease ending in March. We have two premium 2BHK options right near Wipro campus with possession in March that fit squarely within your 95L all-inclusive budget. Your 20L down payment works perfectly. Proposing a visit this Sunday at 3 PM!"
  },
  {
    id: "L03",
    name: "Arjun Mehta",
    phone: "9123456789",
    location: "Electronic City",
    property_requirement: "2BHK",
    budget: "70 L",
    timeline: "3-6 months",
    message: "Interested in 2BHK in Electronic City Phase 1. Budget ~70L. Will need a home loan, haven't applied yet. Please share brochure and price list.",
    score: 67,
    tag: "Warm",
    bant: { budget: 25, timeline: 14, need: 15, readiness: 7, engagement: 6 },
    signals: ["Clear configuration & phase 1 locality", "Budget fits Electronic City 2BHK band", "Recognizes financing need"],
    objections: ["Home loan uninitiated / eligibility unverified", "Only asked for brochure (passive funnel stage)"],
    next_action: "Send brochure + price sheet on WhatsApp, offer free in-house home loan pre-qualification, follow up in 2 days.",
    hook: "\"Hi Arjun, sent the Phase 1 2BHK brochure! Since you're targeting 70L, our banking team can check your pre-approved loan eligibility in 10 minutes for free so you're ready when you pick a unit.\"",
    suggested_reply: "Hi Arjun, thanks for reaching out! Electronic City Phase 1 has fantastic connectivity. I have sent over the project brochure and current pricing to your WhatsApp. Also, our partner banks (HDFC & SBI) offer complimentary instant loan pre-eligibility checks. Would you like me to connect you with our loan advisor?"
  },
  {
    id: "L04",
    name: "Priya Nair",
    phone: "9811223344",
    location: "Hebbal",
    property_requirement: "3BHK",
    budget: "2.5 Cr",
    timeline: "6 months",
    message: "Looking at 3BHK options near Hebbal flyover for my parents. Will decide after discussing with my brother who is in the US, he will co-fund. Need good ventilation, lift with power backup, close to a hospital.",
    score: 58,
    tag: "Warm",
    bant: { budget: 25, timeline: 10, need: 15, readiness: 4, engagement: 4 },
    signals: ["High-value budget (2.5 Cr)", "Clear elder-friendly criteria (lift, hospital, ventilation)", "Strong familial backing"],
    objections: ["Split authority: Decision maker & co-funder in US", "6-month extended runway"],
    next_action: "Offer a recorded 4K video walkthrough that both siblings can review asynchronously; highlight Columbia Asia / Aster hospital proximity.",
    hook: "\"Hi Priya, for your parents' peace of mind, we have an elderly-friendly 3BHK right by Aster CMI with dual stretcher lifts and 100% backup. Can I send a 3D video tour your brother in the US can view directly?\"",
    suggested_reply: "Hello Priya, that is very thoughtful of you for your parents! We have senior-friendly units near Hebbal with dedicated hospital corridors, full power backup, and quiet garden facing. I'd love to share an interactive 3D virtual tour link that you and your brother in the US can view together."
  },
  {
    id: "L05",
    name: "Karthik S",
    phone: "9789012345",
    location: "Bangalore",
    property_requirement: "Flat",
    budget: "Not specified",
    timeline: "Not decided",
    message: "price?",
    score: 13,
    tag: "Cold",
    bant: { budget: 0, timeline: 2, need: 4, readiness: 4, engagement: 3 },
    signals: ["Inbound portal ping"],
    objections: ["One-word inquiry", "No budget or BHK criteria", "No timeline"],
    next_action: "Send automated WhatsApp catalog with 2 quick qualification options (preferred locality & budget range); do not spend salesperson call time.",
    hook: "\"Hi Karthik, here is our quick project guide! Are you exploring 2BHK or 3BHK, and which part of Bangalore suits your commute best?\"",
    suggested_reply: "Hi Karthik! Thanks for reaching out. Our Bangalore apartment prices start from 55L in Electronic City up to 2.2Cr in Whitefield. Could you let us know your preferred area or bedroom count so we can share exact pricing?"
  },
  {
    id: "L06",
    name: "Vikram Joshi",
    phone: "9988776655",
    location: "Whitefield, Sarjapur, Hebbal, Yelahanka, JP Nagar",
    property_requirement: "Any 2 or 3 BHK",
    budget: "Depends",
    timeline: "Maybe next year",
    message: "Just exploring options in Bangalore. Not in a hurry. Send whatever you have.",
    score: 20,
    tag: "Cold",
    bant: { budget: 0, timeline: 2, need: 6, readiness: 4, engagement: 8 },
    signals: ["General city-wide interest"],
    objections: ["Unfocused across 5 unrelated corners of the city", "Explicitly 'just exploring'", "Timeline >12 months"],
    next_action: "Add to monthly Bangalore Real Estate Market Intelligence Newsletter; re-score upon link click activity.",
    hook: "\"Hi Vikram, sharing our Q1 Bangalore Infrastructure & Price Trends report across Whitefield and Hebbal to help your long-term research.\"",
    suggested_reply: "Hi Vikram, pleasure connecting! Since you're keeping an eye out for next year, I have subscribed you to our monthly Bangalore Market Outlook showing appreciation trends across tech corridors. Feel free to ping whenever you want a shortlist."
  },
  {
    id: "L07",
    name: "Ananya Iyer",
    phone: "9833445566",
    location: "Whitefield",
    property_requirement: "3BHK villa",
    budget: "60 L",
    timeline: "Immediately",
    message: "Need a 3BHK independent villa in Whitefield urgently, max 60 lakhs. Can pay full amount in cash, want to register this month.",
    score: 54,
    tag: "Warm",
    bant: { budget: 0, timeline: 22, need: 16, readiness: 11, engagement: 5 },
    signals: ["Urgent registration timeline", "Full liquid funds ready in cash", "High stated conviction"],
    objections: ["Budget severely disconnected from reality (Whitefield villa starts at 2Cr+)", "Cash expectation"],
    next_action: "Call to reset expectations gently: explain Whitefield villa pricing, pivot to premium 2BHK apartments in Whitefield or gated villa plots in Hoskote/Devanahalli.",
    hook: "\"Hi Ananya, I see your ready cash and urgency! In Whitefield, villas start at 2Cr+, but with 60L cash we can either secure a high-rental 2BHK or an immediate-registration villa plot near Hoskote. Let's discuss which suits your goal best.\"",
    suggested_reply: "Hello Ananya, thank you for reaching out. We love how prepared you are with ready funds! A quick reality check on Whitefield: independent 3BHK villas currently trade above 2.2Cr. However, with your 60L budget, we have beautiful 2BHK options in Whitefield or BMRDA villa plots 20 minutes away where you can build your custom villa. Can we discuss on a brief call?"
  },
  {
    id: "L08",
    name: "Rahul Verma",
    phone: "9820011223",
    location: "Sarjapur Road",
    property_requirement: "Luxury 4BHK",
    budget: "4 Cr",
    timeline: "Not mentioned",
    message: "Send details",
    score: 46,
    tag: "Warm",
    is_vip: true,
    bant: { budget: 25, timeline: 2, need: 14, readiness: 4, engagement: 1 },
    signals: ["Ultra high-ticket deal value (4 Cr)", "Clear luxury 4BHK intent"],
    objections: ["Low engagement message effort", "No timeline specified"],
    next_action: "Senior Luxury Agent personal outreach; high ticket size justifies immediate white-glove relationship building despite low initial effort.",
    hook: "\"Good afternoon Mr. Verma. Our Senior Director curated our signature 4BHK penthouse portfolio on Sarjapur Road for you. May we WhatsApp the private lookbook?\"",
    suggested_reply: "Dear Mr. Verma, thank you for your inquiry. For our premier 4 Cr+ 4BHK residences on Sarjapur Road featuring private deck elevators and clubhouse amenities, I have dispatched our private lookbook to your WhatsApp. Our Senior Portfolio Lead will be glad to offer a private preview at your convenience."
  },
  {
    id: "L09",
    name: "Mohammed Faizal",
    phone: "9845198765",
    location: "Bannerghatta Road",
    property_requirement: "2BHK",
    budget: "85 L",
    timeline: "1-2 mahine",
    message: "Bhai mujhe Bannerghatta Road pe 2BHK chahiye, budget 85L tak. Bachho ka school wahi pe hai to next academic year se pehle shift hona hai. Loan ka process chalu hai SBI se. Weekend pe site dikha sakte ho?",
    score: 90,
    tag: "Hot",
    bant: { budget: 25, timeline: 25, need: 16, readiness: 15, engagement: 9 },
    signals: ["School admission forcing deadline", "SBI home loan actively in process", "Requested weekend site visit", "Budget fits Bannerghatta 2BHK perfectly"],
    objections: ["Final loan sanction letter pending"],
    next_action: "Reply in friendly Hinglish, book Saturday morning site visit, help expedite SBI loan approval with builder tie-up.",
    hook: "\"Faizal bhai, bachhon ke school ke paas bilkul ready 2BHK ready hai 82L mein! Saturday ko 11 baje site dekhne aa rahe ho? SBI loan hum fast-track kara denge.\"",
    suggested_reply: "Haan Faizal bhai, bilkul! Bannerghatta Road pe schools ke close hamare paas 2 ready 2BHK options hain jo aapke 85L budget mein bilkul fit aate hain. Aapka SBI loan hamara bank desk 3 din mein expedite karwa dega. Is Saturday subah 11 baje site visit confirm karein?"
  },
  {
    id: "L10",
    name: "Deepa Krishnan",
    phone: "9844055667",
    location: "Electronic City",
    property_requirement: "2BHK",
    budget: "65 L",
    timeline: "3 months",
    message: "[10:02] Deepa: Hi saw your ad on FB for Green Meadows E-City\n[10:03] Agent: Hello ma'am, yes 2BHK starting 62L\n[10:05] Deepa: Is it RERA approved? Last builder I booked with delayed possession by 2 years, lost a lot\n[10:06] Agent: Yes RERA registered\n[10:08] Deepa: ok what is the possession date and can I see the RERA number. Also is there a 9:1 payment plan?\n[10:15] Deepa: ??",
    score: 69,
    tag: "Warm",
    bant: { budget: 25, timeline: 15, need: 16, readiness: 6, engagement: 7 },
    signals: ["FB ad engaged transcript", "Specific project identified (Green Meadows)", "Followed up with '??' (wants immediate answers)", "Budget matches 62-65L band"],
    objections: ["Severe trust friction due to past builder 2-year delay trauma", "Wants RERA registration proof immediately", "Requires 9:1 payment plan"],
    next_action: "Send RERA certificate PDF + confirmed delivery date + builder track record immediately on WhatsApp; explain payment plan.",
    hook: "\"Hi Deepa, so sorry about your past builder experience! Green Meadows is RERA approved (PRM/KA/RERA/1251) with structural work 100% complete. Here is the certificate and our on-time delivery guarantee.\"",
    suggested_reply: "Hello Deepa, apologies for the slight delay! We completely understand your caution given past builder experiences. Green Meadows is fully RERA approved (RERA No: PRM/KA/RERA/1251/308/PR/200123). Possession is guaranteed for October 2026. Yes, we have an attractive 10:90 builder scheme. Sharing the RERA certificate and floor plans right now!"
  },
  {
    id: "L11",
    name: "Sanjay Patil",
    phone: "9821098765",
    location: "Andheri, Mumbai",
    property_requirement: "2BHK",
    budget: "1.5 Cr",
    timeline: "2 months",
    message: "Do you have any 2BHK projects in Andheri West? Need it in 2 months.",
    score: 5,
    tag: "Disqualified",
    bant: { budget: 0, timeline: 0, need: 0, readiness: 0, engagement: 0 },
    signals: ["Strong budget (1.5 Cr)", "Quick timeline (2 months)"],
    objections: ["GEOGRAPHIC HARD GATE: Project portfolio operates strictly in Bangalore"],
    next_action: "Politely inform prospect that projects are in Bangalore; refer lead to Mumbai partner broker.",
    hook: "\"Hi Sanjay, thank you for reaching out. Our development portfolio is currently exclusive to Bangalore. Would you like an introduction to our trusted channel partner in Andheri West?\"",
    suggested_reply: "Hello Sanjay, thank you for your interest. Please note that our current portfolio operates strictly in Bangalore. We do not have projects in Mumbai, but we can happily refer you to our certified channel partner in Andheri West. Best regards!"
  },
  {
    id: "L12",
    name: "TechGrow Solutions",
    phone: "9800000010",
    location: "N/A",
    property_requirement: "N/A",
    budget: "N/A",
    timeline: "N/A",
    message: "Hello sir, we provide digital marketing and lead generation services for real estate builders. Get 500 leads/month guaranteed. Call 98XXXXXX10.",
    score: 0,
    tag: "Disqualified",
    bant: { budget: 0, timeline: 0, need: 0, readiness: 0, engagement: 0 },
    signals: [],
    objections: ["SPAM HARD GATE: B2B agency vendor pitch"],
    next_action: "Mark as vendor spam; block from salesperson inbound pipeline.",
    hook: "N/A (Spam lead)",
    suggested_reply: "Spam message detected. No customer outreach required."
  },
  {
    id: "L13",
    name: "Neha Gupta",
    phone: "9715012345",
    location: "Sarjapur Road",
    property_requirement: "2BHK for investment / rental",
    budget: "90 L",
    timeline: "Within 3 months",
    message: "I'm an NRI based in Dubai, looking to invest in a 2BHK near Sarjapur tech parks for rental income. What rental yield can I expect? Need someone to handle paperwork since I can't travel often. Can do video call.",
    score: 79,
    tag: "Hot",
    bant: { budget: 25, timeline: 20, need: 16, readiness: 11, engagement: 7 },
    signals: ["NRI investor with clear rental ROI goal", "Budget matches 90L Sarjapur band", "Requested video call", "Ready to transact within 3 months"],
    objections: ["Remote buyer: cannot physically visit", "Requires end-to-end Power of Attorney (POA) and NRI paperwork support"],
    next_action: "Schedule Zoom/Google Meet video walkthrough, provide rental yield calculator (5-6% gross) and NRI legal workflow.",
    hook: "\"Hi Neha, greetings in Dubai! Sarjapur tech corridor yields 5.2% rental return right now. Our dedicated NRI desk handles your full POA and registry remotely. Can we do a 15-min Zoom walkthrough this Friday?\"",
    suggested_reply: "Hello Neha, greetings from Bangalore! Sarjapur Road tech corridor is experiencing huge rental demand from surrounding tech parks, offering 5.2% - 5.8% gross yields. Our in-house NRI desk manages everything from NRE/NRO accounts, Power of Attorney to tenant placement. Let's schedule a 20-minute Zoom walkthrough this Friday at 4 PM Dubai time!"
  },
  {
    id: "L14",
    name: "Amit Shah",
    phone: "9845543210",
    location: "Whitefield",
    property_requirement: "3BHK",
    budget: "1.8 Cr",
    timeline: "3 months",
    message: "Visited your Whitefield project last week with Ramesh. Liked the 3BHK east facing on 12th floor. But Prestige next door is offering 5% lower and free car parking. If you can match I'm ready to book.",
    score: 87,
    tag: "Hot",
    bant: { budget: 25, timeline: 15, need: 18, readiness: 19, engagement: 10 },
    signals: ["Already completed physical site visit", "Selected exact unit (3BHK East 12th floor)", "Explicit 'ready to book' commitment", "Closing stage buyer"],
    objections: ["Competitor price comparison (Prestige 5% lower)", "Free car parking concession demand"],
    next_action: "Escalate to Sales Director immediately for price-match approval; urgent closing opportunity before he signs with competitor.",
    hook: "\"Hi Amit, Ramesh briefed me on your 12th floor East-facing choice! Our Director approved matching the car parking and offering a special festive pricing concession. Can we finalize the booking token today?\"",
    suggested_reply: "Hello Amit! Ramesh and I discussed your preference for Unit 1204 East-facing. We value having you in our community. I spoke to our Sales Director, and we are ready to offer you complimentary covered car parking and a special closing price to beat Prestige. Are you available for a 5-minute call today to lock the unit?"
  },
  {
    id: "L15",
    name: "Lakshmi Rao",
    phone: "9845234567",
    location: "Devanahalli",
    property_requirement: "Residential plot 1200 sqft",
    budget: "50 L",
    timeline: "6-12 months",
    message: "Interested in BMRDA approved plots near Devanahalli airport. Want to build a house after retirement in 2 years. Is the layout A-Khata? Clear title?",
    score: 60,
    tag: "Warm",
    bant: { budget: 25, timeline: 6, need: 16, readiness: 5, engagement: 8 },
    signals: ["Budget fits 40-75L Devanahalli plot band", "Thoughtful legal diligence (A-Khata, title, BMRDA)", "Clear retirement retirement home plan"],
    objections: ["Long 1-2 year runway", "Demands documentary proof of A-Khata & legal title"],
    next_action: "Share BMRDA approval letter + A-Khata copy on WhatsApp, invite for weekend airport corridor plot visit.",
    hook: "\"Namaste Lakshmi ma'am, our Devanahalli layout has 100% clear A-Khata with BMRDA sanctioned masterplan. May I WhatsApp the legal title deed for your legal advisor to review?\"",
    suggested_reply: "Namaste Lakshmi ma'am, congratulations on planning your retirement sanctuary near Devanahalli! Our airport corridor layout is 100% BMRDA approved with individual A-Khata and clear legal title vetted by nationalized banks. I have sent the title deed copy and master layout to your WhatsApp for your review."
  },
  {
    id: "L16",
    name: "Rakesh",
    phone: "9880011223",
    location: "Hebbal",
    property_requirement: "3BHK",
    budget: "2 Cr",
    timeline: "ASAP",
    message: "Whats the price for 3bhk",
    score: 54,
    tag: "Warm",
    bant: { budget: 25, timeline: 10, need: 13, readiness: 4, engagement: 2 },
    signals: ["Form fields state 2Cr budget & ASAP timeline in Hebbal"],
    objections: ["Minimal 5-word message inquiry", "Form vs message effort contradiction"],
    next_action: "Quick 2-minute qualifying phone call to confirm whether urgency in form is genuine.",
    hook: "\"Hi Rakesh, saw your ASAP request for Hebbal 3BHK! Our 3BHKs in Hebbal range from 1.8Cr to 2.3Cr. What is your preferred move-in month?\"",
    suggested_reply: "Hi Rakesh, thanks for inquiring! In our Hebbal project, 3BHK residences start from 1.85 Cr with luxury balconies. Since you marked ASAP move-in, we have ready units available. Can I give you a quick 2-minute call to share floor plans?"
  },
  {
    id: "L17",
    name: "Pooja & Nikhil Sharma",
    phone: "9845332211",
    location: "Sarjapur Road",
    property_requirement: "3BHK, gated community, near good schools",
    budget: "1.4 - 1.6 Cr",
    timeline: "4 months",
    message: "We're a working couple with a 4-year-old. Want a gated society with a clubhouse and an international school within 3 km. We've shortlisted 2 other projects but yours looked good. Possession should be by June. Both of us have loan pre-approval. Can we get a callback after 7 PM on weekdays?",
    score: 85,
    tag: "Hot",
    bant: { budget: 25, timeline: 15, need: 18, readiness: 19, engagement: 8 },
    signals: ["Both buyers have pre-approved home loans", "Aligned joint decision makers", "Actively comparing 3 shortlisted projects", "Provided exact callback window after 7 PM"],
    objections: ["Hard possession requirement by June", "Strict school proximity constraint (<3 km)", "Shortlisted competing projects"],
    next_action: "Call strictly between 7:00 PM - 7:30 PM today; lead with international school distance and clubhouse amenities.",
    hook: "\"Hi Pooja and Nikhil, respecting your 7 PM callback request! Our community has Greenwood High just 1.8 km away and June handover is guaranteed. Can we organize a family clubhouse tour this Saturday?\"",
    suggested_reply: "Hi Pooja & Nikhil, wonderful connecting with you! We have noted your preferred callback window and our senior community manager will dial you right at 7:15 PM today. Our project is located 2.1 km from DPS and Greenwood High with guaranteed June possession, matching your pre-approved loan perfectly!"
  },
  {
    id: "L18",
    name: "Suresh Babu",
    phone: "9845667788",
    location: "Electronic City",
    property_requirement: "1BHK",
    budget: "35 L",
    timeline: "1 month",
    message: "Anything 1BHK under 35L in E City? Ready to move only. Bank approved for 30L.",
    score: 62,
    tag: "Warm",
    bant: { budget: 12, timeline: 20, need: 12, readiness: 14, engagement: 4 },
    signals: ["Bank loan pre-approved for 30L", "Urgent 1-month timeline", "Clear ready-to-move requirement"],
    objections: ["35L budget is tight for primary developer inventory in Electronic City (developer base is 55L)", "5L down payment margin constraint"],
    next_action: "Check resale/1BHK inventory; if none, be transparent and suggest adjacent Chandapura/Anekal corridor.",
    hook: "\"Hi Suresh, we have bank-approved ready 1BHK options nearby. With your 30L bank sanction, let's explore how we can fit within your 35L cap!\"",
    suggested_reply: "Hello Suresh, thanks for your message. With your 30L bank approval, you are in a great position! In Electronic City core, most builder projects start at 55L for 2BHK, but we have select resale 1BHK units and options in Chandapura at 35L all-inclusive. Let's connect on a quick call to check inventory."
  }
];

// App State
let leadsData = [...INITIAL_LEADS];
let currentView = "dashboard";
let currentActiveLeadId = "L01";
let leadsTableFilter = "all";
let leadsLocalityFilter = "all";
let globalSearchQuery = "";
let currentIntakeMode = "manual";

// Properties Inventory State
let propertiesCatalogData = [];

// Fallback catalog if offline or initial load
const DEFAULT_PROPERTIES = [
  {
    "id": "P01",
    "name": "Prestige Lakeside Habitat",
    "builder": "Prestige Group",
    "location": "Whitefield",
    "area_locality": "Varthur / Whitefield",
    "bhk": "3BHK",
    "property_type": "Apartment",
    "price_lakhs": 158.0,
    "price_str": "\u20b91.58 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1655,
    "highlights": [
      "5 mins to ITPL",
      "Lake view decks",
      "Ready clubhouse",
      "BBMP A-Khata verified"
    ],
    "rera": "PRM/KA/RERA/1251/310/PR/170915"
  },
  {
    "id": "P02",
    "name": "Sobha Windsor",
    "builder": "Sobha Limited",
    "location": "Whitefield",
    "area_locality": "ECC Road, Whitefield",
    "bhk": "3BHK",
    "property_type": "Apartment",
    "price_lakhs": 168.0,
    "price_str": "\u20b91.68 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1817,
    "highlights": [
      "English architecture",
      "Walkable to metro",
      "100% power backup",
      "Zero wall-sharing"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/210219"
  },
  {
    "id": "P03",
    "name": "Godrej Splendour",
    "builder": "Godrej Properties",
    "location": "Whitefield",
    "area_locality": "Belathur, Whitefield",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 88.0,
    "price_str": "\u20b988 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 980,
    "highlights": [
      "Eco-luxury design",
      "Near Hope Farm junction",
      "650+ trees inside campus"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/220616"
  },
  {
    "id": "P04",
    "name": "Total Environment Pursuit of a Radical Rhapsody",
    "builder": "Total Environment",
    "location": "Whitefield",
    "area_locality": "ITPL Main Road",
    "bhk": "3BHK",
    "property_type": "Luxury Villa / Terrace Apartment",
    "price_lakhs": 380.0,
    "price_str": "\u20b93.8 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 3200,
    "highlights": [
      "Private terrace gardens",
      "Lakefront living",
      "Heated indoor pool",
      "Earth-sheltered roofs"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/171014"
  },
  {
    "id": "P05",
    "name": "Assetz Marq 3.0",
    "builder": "Assetz Property Group",
    "location": "Whitefield",
    "area_locality": "Kannamangala, Whitefield",
    "bhk": "3BHK",
    "property_type": "Apartment",
    "price_lakhs": 142.0,
    "price_str": "\u20b91.42 Cr",
    "possession": "Within 3 months",
    "oc_status": "OC in Progress",
    "sqft": 1580,
    "highlights": [
      "80% open green space",
      "Central park boulevard",
      "Top ICSE school tie-up"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/171130"
  },
  {
    "id": "P06",
    "name": "Brigade Cornerstone Utopia",
    "builder": "Brigade Group",
    "location": "Sarjapur Road",
    "area_locality": "Varthur - Sarjapur Road",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 94.0,
    "price_str": "\u20b994 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1097,
    "highlights": [
      "47-acre integrated smart township",
      "High rental yield corridor",
      "Near Wipro Corporate"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/181122"
  },
  {
    "id": "P07",
    "name": "Sobha Royal Pavilion",
    "builder": "Sobha Limited",
    "location": "Sarjapur Road",
    "area_locality": "Sarjapur Road, Hadosiddapura",
    "bhk": "3BHK",
    "property_type": "Apartment",
    "price_lakhs": 155.0,
    "price_str": "\u20b91.55 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1884,
    "highlights": [
      "Rajasthani palace theme",
      "Near RGA Tech Park",
      "Pre-approved SBI & HDFC loans"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/190204"
  },
  {
    "id": "P08",
    "name": "Mana Capitol",
    "builder": "Mana Projects",
    "location": "Sarjapur Road",
    "area_locality": "Carmelaram, Sarjapur",
    "bhk": "3BHK",
    "property_type": "Apartment",
    "price_lakhs": 138.0,
    "price_str": "\u20b91.38 Cr",
    "possession": "Within 2 months",
    "oc_status": "OC Received",
    "sqft": 1560,
    "highlights": [
      "Walk to Carmelaram rail station",
      "Live-Work-Play lifestyle",
      "Sky gardens"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/190809"
  },
  {
    "id": "P09",
    "name": "Rohan Ikigai",
    "builder": "Rohan Builders",
    "location": "Sarjapur Road",
    "area_locality": "Off Sarjapur Road",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 89.0,
    "price_str": "\u20b989 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1020,
    "highlights": [
      "Japanese minimalist architecture",
      "High natural cross-ventilation",
      "Low maintenance charges"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/200114"
  },
  {
    "id": "P10",
    "name": "Salarpuria Sattva Signature Tower",
    "builder": "Salarpuria Sattva",
    "location": "Sarjapur Road",
    "area_locality": "Sarjapur Tech Corridor",
    "bhk": "4BHK",
    "property_type": "Signature Penthouse",
    "price_lakhs": 420.0,
    "price_str": "\u20b94.2 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 3800,
    "highlights": [
      "Private elevator foyer",
      "Panoramic skyline views",
      "Concierge desk & private spa"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/171201"
  },
  {
    "id": "P11",
    "name": "Godrej Nurture",
    "builder": "Godrej Properties",
    "location": "Electronic City",
    "area_locality": "Electronic City Phase 1",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 68.0,
    "price_str": "\u20b968 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 991,
    "highlights": [
      "Child development amenities",
      "Walk to Infosys gate",
      "Elevated expressway access"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/190913"
  },
  {
    "id": "P12",
    "name": "Green Meadows E-City",
    "builder": "Greenfield Infra",
    "location": "Electronic City",
    "area_locality": "Electronic City Phase 2",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 64.0,
    "price_str": "\u20b964 L",
    "possession": "Within 2 months",
    "oc_status": "OC Received",
    "sqft": 940,
    "highlights": [
      "10:90 builder subvention scheme",
      "RERA verified PRM/KA/RERA/1251",
      "100% Vaastu compliant"
    ],
    "rera": "PRM/KA/RERA/1251/308/PR/200123"
  },
  {
    "id": "P13",
    "name": "GM Infinite Global Techies Town",
    "builder": "GM Infinite",
    "location": "Electronic City",
    "area_locality": "Neotown, Electronic City",
    "bhk": "1BHK",
    "property_type": "Apartment",
    "price_lakhs": 36.0,
    "price_str": "\u20b936 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 650,
    "highlights": [
      "Ideal rental investment",
      "Close to metro yellow line",
      "Low initial capital entry"
    ],
    "rera": "PRM/KA/RERA/1251/308/PR/181215"
  },
  {
    "id": "P14",
    "name": "Prestige Falcon City",
    "builder": "Prestige Group",
    "location": "Bannerghatta Road",
    "area_locality": "Kanakapura / Bannerghatta Link",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 84.0,
    "price_str": "\u20b984 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1204,
    "highlights": [
      "Opposite metro station",
      "Forum Mall inside premises",
      "Top schools within 3km"
    ],
    "rera": "PRM/KA/RERA/1251/310/PR/170918"
  },
  {
    "id": "P15",
    "name": "Mahaveer Ranches",
    "builder": "Mahaveer Group",
    "location": "Bannerghatta Road",
    "area_locality": "Hulimavu, Bannerghatta",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 82.0,
    "price_str": "\u20b982 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1150,
    "highlights": [
      "Near Ryan International School",
      "Fast-track SBI loan desk",
      "Zero water shortage"
    ],
    "rera": "PRM/KA/RERA/1251/308/PR/171015"
  },
  {
    "id": "P16",
    "name": "SNN Clermont",
    "builder": "SNN Estates",
    "location": "Hebbal",
    "area_locality": "Outer Ring Road, Hebbal",
    "bhk": "3BHK",
    "property_type": "Luxury Residence",
    "price_lakhs": 245.0,
    "price_str": "\u20b92.45 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 2620,
    "highlights": [
      "Nagavara lake facing",
      "Equestrian themed luxury",
      "Airport connectivity in 25 mins"
    ],
    "rera": "PRM/KA/RERA/1251/309/PR/170919"
  },
  {
    "id": "P17",
    "name": "Godrej Platinum",
    "builder": "Godrej Properties",
    "location": "Hebbal",
    "area_locality": "Hebbal Flyover Junction",
    "bhk": "3BHK",
    "property_type": "Luxury Apartment",
    "price_lakhs": 255.0,
    "price_str": "\u20b92.55 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 2900,
    "highlights": [
      "IGBC Platinum rated building",
      "Double-height living rooms",
      "Private club & infinity pool"
    ],
    "rera": "PRM/KA/RERA/1251/309/PR/171112"
  },
  {
    "id": "P18",
    "name": "Brigade Orchards",
    "builder": "Brigade Group",
    "location": "Devanahalli",
    "area_locality": "Devanahalli, Airport Corridor",
    "bhk": "Plot / Villa",
    "property_type": "Residential Plot 1200 sqft",
    "price_lakhs": 52.0,
    "price_str": "\u20b952 L",
    "possession": "Ready for Registration",
    "oc_status": "BIAAPA Approved",
    "sqft": 1200,
    "highlights": [
      "135-acre smart township",
      "Clear title deeds",
      "High capital appreciation zone near KIADB"
    ],
    "rera": "PRM/KA/RERA/1250/303/PR/170916"
  },
  {
    "id": "P19",
    "name": "Ozone Urbana",
    "builder": "Ozone Group",
    "location": "Devanahalli",
    "area_locality": "NH-44 Airport Road",
    "bhk": "2BHK",
    "property_type": "Apartment",
    "price_lakhs": 62.0,
    "price_str": "\u20b962 L",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 1120,
    "highlights": [
      "National Public School within township",
      "Direct airport shuttle access",
      "Wide internal roads"
    ],
    "rera": "PRM/KA/RERA/1250/303/PR/171018"
  },
  {
    "id": "P20",
    "name": "Chaithanya Smaran",
    "builder": "Chaithanya Projects",
    "location": "Whitefield",
    "area_locality": "Kadugodi, Whitefield",
    "bhk": "3BHK",
    "property_type": "Gated Villa",
    "price_lakhs": 195.0,
    "price_str": "\u20b91.95 Cr",
    "possession": "Ready to Move",
    "oc_status": "OC Received",
    "sqft": 2400,
    "highlights": [
      "Private landscaped backyard",
      "A-Khata registry ready",
      "Ultra-low density community"
    ],
    "rera": "PRM/KA/RERA/1251/446/PR/180210"
  }
];

// Global Modal Functions
// Floating Copilot Widget Toggle
// Global Search Handler
window.handleGlobalSearch = function (value) {
  globalSearchQuery = (value || "").trim();
  if (currentView !== "leads") {
    switchView("leads");
  } else {
    renderLeadsTable();
  }
};

window.toggleCopilotWidget = function (forcedState = null) {
  const panel = document.getElementById("copilot-widget-panel");
  const fab = document.getElementById("copilot-fab-btn");
  if (!panel || !fab) return;

  const chatIcon = fab.querySelector(".fab-icon-chat");
  const closeIcon = fab.querySelector(".fab-icon-close");
  const fabLabel = fab.querySelector(".fab-label");

  const isCurrentlyOpen = panel.style.display !== "none";
  const shouldOpen = forcedState !== null ? forcedState : !isCurrentlyOpen;

  if (shouldOpen) {
    panel.style.display = "flex";
    if (chatIcon) chatIcon.style.display = "none";
    if (closeIcon) closeIcon.style.display = "inline-block";
    if (fabLabel) fabLabel.innerText = "Close";
    const input = document.getElementById("detail-chat-input");
    if (input) setTimeout(() => input.focus(), 100);
  } else {
    panel.style.display = "none";
    if (chatIcon) chatIcon.style.display = "inline-block";
    if (closeIcon) closeIcon.style.display = "none";
    if (fabLabel) fabLabel.innerText = "Lead Copilot";
  }
};

// Sample lead pool for dynamic smart suggestions
const DYNAMIC_SUGGESTION_LEADS = [
  {
    name: "Rohit Kulkarni",
    phone: "9845012345",
    location: "Whitefield",
    property_requirement: "3BHK apartment, ready to move",
    budget: "1.6 Cr",
    timeline: "Within 1 month",
    message: "Hi, I'm relocating from Pune for my new job at ITPL, joining on 15th. Looking for a ready-to-move 3BHK near ITPL, budget around 1.6Cr. Home loan already sanctioned from HDFC for 1.2Cr. Can I visit this Saturday?"
  },
  {
    name: "Sneha Reddy",
    phone: "9886098765",
    location: "Sarjapur Road",
    property_requirement: "2BHK",
    budget: "95 L",
    timeline: "2-3 months",
    message: "Our rental lease ends in March so we want to buy a 2BHK on Sarjapur Road, preferably near Wipro campus. Budget max 95L incl registration. Is there any project with OC received?"
  },
  {
    name: "Mohammed Faizal",
    phone: "9845198765",
    location: "Bannerghatta Road",
    property_requirement: "2BHK",
    budget: "85 L",
    timeline: "1-2 months",
    message: "Looking for 2BHK on Bannerghatta Road near schools for my kids before next academic year. Budget 85L. SBI loan in progress. Can you arrange site visit this weekend?"
  },
  {
    name: "Amit Shah",
    phone: "9845543210",
    location: "Whitefield",
    property_requirement: "3BHK villa",
    budget: "1.8 Cr",
    timeline: "1 month",
    message: "Need a 3BHK villa or ground floor apartment with garden in Whitefield. Budget 1.8 Cr ready in bank. Ready to register this month if property has clear A-khata."
  },
  {
    name: "Pooja Sharma",
    phone: "9810054321",
    location: "Sarjapur Road",
    property_requirement: "3BHK apartment",
    budget: "1.5 Cr",
    timeline: "Ready to book this month",
    message: "Looking for 3BHK on Sarjapur Road. Both IT professionals, pre-approved loan of 1.2 Cr from ICICI. Want clubhouse amenities and possession within 6 months."
  },
  {
    name: "Deepak Choudhury",
    phone: "9871122334",
    location: "Hebbal",
    property_requirement: "3BHK luxury",
    budget: "2.2 Cr",
    timeline: "Within 45 days",
    message: "Looking for 3BHK luxury flat near Hebbal lake with airport connectivity. Self-funding 50L cash down payment, rest Axis Bank pre-approved."
  }
];

let lastSuggestedIndex = -1;

window.suggestSmartLead = function () {
  const nameInput = document.getElementById("input-name");
  // Only suggest if form is currently blank or untouched
  if (nameInput && nameInput.value.trim() !== "") return;

  // Pick a new, rotating lead each time
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * DYNAMIC_SUGGESTION_LEADS.length);
  } while (nextIndex === lastSuggestedIndex && DYNAMIC_SUGGESTION_LEADS.length > 1);
  
  lastSuggestedIndex = nextIndex;
  const lead = DYNAMIC_SUGGESTION_LEADS[nextIndex];

  document.getElementById("input-name").value = lead.name;
  document.getElementById("input-phone").value = lead.phone;
  document.getElementById("input-location").value = lead.location;
  document.getElementById("input-budget").value = lead.budget;
  document.getElementById("input-prop").value = lead.property_requirement;
  document.getElementById("input-timeline").value = lead.timeline;
  document.getElementById("input-message").value = lead.message;

  showToast(`Auto-suggested inquiry: ${lead.name}`);
};

window.openIntakeModal = function () {
  const modal = document.getElementById("intake-modal");
  if (modal) {
    modal.style.display = "flex";
    switchIntakeMode("manual");
  }
};

window.closeIntakeModal = function () {
  const modal = document.getElementById("intake-modal");
  if (modal) modal.style.display = "none";
};

window.switchIntakeMode = function (mode) {
  currentIntakeMode = mode;
  const tabManual = document.getElementById("tab-mode-manual");
  const tabCsv = document.getElementById("tab-mode-csv");
  const manualForm = document.getElementById("intake-form");
  const csvPane = document.getElementById("csv-import-pane");

  if (mode === "manual") {
    tabManual.classList.add("active");
    tabCsv.classList.remove("active");
    manualForm.style.display = "flex";
    csvPane.style.display = "none";
  } else {
    tabCsv.classList.add("active");
    tabManual.classList.remove("active");
    manualForm.style.display = "none";
    csvPane.style.display = "flex";
  }
};

window.fillRandomSampleData = function () {
  const sampleLeads = INITIAL_LEADS.filter(l => l.tag === "Hot" || l.tag === "Warm");
  const randomLead = sampleLeads[Math.floor(Math.random() * sampleLeads.length)];
  
  document.getElementById("input-name").value = randomLead.name;
  document.getElementById("input-phone").value = randomLead.phone || "9876543210";
  document.getElementById("input-location").value = randomLead.location;
  document.getElementById("input-budget").value = randomLead.budget;
  document.getElementById("input-prop").value = randomLead.property_requirement;
  document.getElementById("input-timeline").value = randomLead.timeline;
  document.getElementById("input-message").value = randomLead.message;
  
  showToast(`Autofilled with ${randomLead.name} (${randomLead.id})`);
};

window.handleCsvUpload = function () {
  const fileInput = document.getElementById("csv-file-input");
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showToast("Please select a .csv file first or click Browse Files.");
    return;
  }
  const file = fileInput.files[0];
  showToast(`Parsing and importing "${file.name}"...`);

  const reader = new FileReader();
  reader.onerror = function () {
    showToast("Error reading the selected CSV file.");
  };

  reader.onload = function (e) {
    try {
      const text = e.target.result || "";
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        showToast("CSV file is empty or missing data rows.");
        return;
      }

      // Parse header row
      const headerRow = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
      const getIdx = (candidates) => {
        for (const c of candidates) {
          const idx = headerRow.findIndex(h => h.includes(c));
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const nameIdx = getIdx(["name"]);
      const phoneIdx = getIdx(["phone", "mobile", "contact"]);
      const locIdx = getIdx(["location", "area", "city"]);
      const propIdx = getIdx(["property", "requirement", "bhk", "config"]);
      const budgetIdx = getIdx(["budget", "price"]);
      const timelineIdx = getIdx(["timeline", "buying", "period"]);
      const msgIdx = getIdx(["message", "transcript", "inquiry", "remark"]);

      const existingNames = new Set(leadsData.map(l => (l.name || "").trim().toLowerCase()));
      let importedCount = 0;
      let skippedCount = 0;
      let firstImportedId = null;

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (!cols || cols.length === 0) continue;

        const name = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx].trim() : (cols[0] || "").trim();
        if (!name || name.toLowerCase() === "name") continue;

        // Skip duplicates
        if (existingNames.has(name.toLowerCase())) {
          skippedCount++;
          continue;
        }
        existingNames.add(name.toLowerCase());

        const phone = (phoneIdx !== -1 && cols[phoneIdx]) ? cols[phoneIdx].trim() : "9876543210";
        const location = (locIdx !== -1 && cols[locIdx]) ? cols[locIdx].trim() : "Bangalore";
        const prop = (propIdx !== -1 && cols[propIdx]) ? cols[propIdx].trim() : "2BHK";
        const budget = (budgetIdx !== -1 && cols[budgetIdx]) ? cols[budgetIdx].trim() : "1 Cr";
        const timeline = (timelineIdx !== -1 && cols[timelineIdx]) ? cols[timelineIdx].trim() : "2 months";
        const message = (msgIdx !== -1 && cols[msgIdx]) ? cols[msgIdx].trim() : `Inquiry for ${prop} in ${location}.`;

        const newId = `L${String(leadsData.length + 1).padStart(2, "0")}`;
        const isVip = budget.toLowerCase().includes("cr") && parseFloat(budget) >= 2.5;

        // Quick heuristic scoring for instant client display
        let score = 75;
        let tag = "Warm";
        const lowerMsg = (message + " " + timeline).toLowerCase();
        if (lowerMsg.includes("ready to") || lowerMsg.includes("immediate") || lowerMsg.includes("15 days") || lowerMsg.includes("1 month") || lowerMsg.includes("sanctioned") || lowerMsg.includes("approved")) {
          score = 88;
          tag = "Hot";
        } else if (lowerMsg.includes("next year") || lowerMsg.includes("just browsing")) {
          score = 35;
          tag = "Cold";
        }

        const leadObj = {
          id: newId,
          name: name,
          phone: phone,
          location: location,
          property_requirement: prop,
          budget: budget,
          timeline: timeline,
          message: message,
          score: score,
          tag: tag,
          is_vip: isVip,
          bant: { budget: 25, timeline: tag === "Hot" ? 22 : 15, need: 16, readiness: 15, engagement: 8 },
          signals: ["Imported via CSV", `${location} market match`, `${budget} verified`],
          objections: [],
          next_action: "Schedule site visit and send brochure on WhatsApp.",
          hook: `"Hi ${name.split(" ")[0]}, we reviewed your ${prop} inquiry for ${location}. Let's discuss verified options!"`,
          suggested_reply: `Hi ${name.split(" ")[0]}! Thanks for reaching out regarding ${prop} in ${location}. We have verified options matching your ${budget} budget. When are you free for a quick call?`
        };

        // Insert at the front of the list
        leadsData.unshift(leadObj);
        importedCount++;
        if (!firstImportedId) firstImportedId = newId;

        // Also asynchronously notify backend if running
        try {
          fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name,
              phone: phone,
              location: location,
              property_requirement: prop,
              budget: budget,
              timeline: timeline,
              message: message
            })
          }).catch(() => {});
        } catch (_) {}
      }

      closeIntakeModal();
      fileInput.value = "";

      let resultMsg = `Imported ${importedCount} lead(s) successfully!`;
      if (skippedCount > 0) resultMsg += ` (${skippedCount} duplicate(s) skipped)`;
      showToast(resultMsg);

      // Re-render all views immediately
      renderDashboard();
      renderLeadsTable();
      renderKanbanPipeline();
      updatePropertiesNavCount();

      // Switch to All Leads table view so user immediately sees the imported leads
      switchView("leads");

    } catch (parseErr) {
      console.error("CSV Import Error:", parseErr);
      showToast("Error parsing CSV: " + parseErr.message);
    }
  };

  reader.readAsText(file);
};

// Helper: parse a single CSV line respecting quotes
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

// DOM Elements
const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
const pageBreadcrumb = document.getElementById("bc-current-page");
const globalSearchInput = document.getElementById("global-search-input");

// Views
const viewDashboard = document.getElementById("view-dashboard");
const viewLeads = document.getElementById("view-leads");
const viewPipeline = document.getElementById("view-pipeline");
const viewProperties = document.getElementById("view-properties");
const viewLeadDetail = document.getElementById("view-lead-detail");

// Detail Page Elements
const btnBackToLeads = document.getElementById("btn-back-to-leads");
const btnPrevLead = document.getElementById("btn-prev-lead");
const btnNextLead = document.getElementById("btn-next-lead");
const detailId = document.getElementById("detail-id");
const detailTag = document.getElementById("detail-tag");
const detailVip = document.getElementById("detail-vip");
const detailName = document.getElementById("detail-name");
const detailPhone = document.getElementById("detail-phone");
const detailLoc = document.getElementById("detail-loc");
const detailProp = document.getElementById("detail-prop");
const detailBudget = document.getElementById("detail-budget");
const detailTimeline = document.getElementById("detail-timeline");
const detailScore = document.getElementById("detail-score");
const detailMessage = document.getElementById("detail-message");
const detailSignals = document.getElementById("detail-signals");
const detailObjections = document.getElementById("detail-objections");
const detailHook = document.getElementById("detail-hook");
const detailNextAction = document.getElementById("detail-next-action");
const detailReply = document.getElementById("detail-reply");
const detailCopilotContext = document.getElementById("detail-copilot-context");
const detailChatStream = document.getElementById("detail-chat-stream");
const detailChatForm = document.getElementById("detail-chat-form");
const detailChatInput = document.getElementById("detail-chat-input");

// BANT Bars on Detail Page (Safely checked if present)
const dbantBudget = document.getElementById("dbant-budget");
const dbantBudgetFill = document.getElementById("dbant-budget-fill");
const dbantTimeline = document.getElementById("dbant-timeline");
const dbantTimelineFill = document.getElementById("dbant-timeline-fill");
const dbantNeed = document.getElementById("dbant-need");
const dbantNeedFill = document.getElementById("dbant-need-fill");
const dbantReadiness = document.getElementById("dbant-readiness");
const dbantReadinessFill = document.getElementById("dbant-readiness-fill");

document.addEventListener("DOMContentLoaded", () => {
  loadLeadsFromBackend();
  loadPropertiesFromBackend();
  setupEventListeners();
});

// Load leads from Flask API with fallback to local seed data
function loadLeadsFromBackend() {
  fetch("/api/leads")
    .then(res => res.json())
    .then(data => {
      if (data.success && data.leads && data.leads.length > 0) {
        // Enforce uniqueness by lead id (or unique name+phone)
        const seen = new Set();
        leadsData = data.leads.filter(l => {
          const key = l.id || `${(l.name || "").trim().toLowerCase()}_${(l.phone || "").trim()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      renderDashboard();
      renderLeadsTable();
      renderKanbanPipeline();
    })
    .catch(err => {
      console.warn("Could not connect to Flask API (/api/leads), using client seed data:", err);
      // Enforce uniqueness on client seed data as well
      const seen = new Set();
      leadsData = leadsData.filter(l => {
        const key = l.id || `${(l.name || "").trim().toLowerCase()}_${(l.phone || "").trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      renderDashboard();
      renderLeadsTable();
      renderKanbanPipeline();
    });
}

// Load properties catalog from Flask API with fallback
function loadPropertiesFromBackend() {
  fetch("/api/properties")
    .then(res => {
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        return res.json();
      }
      return null;
    })
    .then(data => {
      if (data && data.success && data.properties && data.properties.length > 0) {
        propertiesCatalogData = data.properties;
      } else {
        propertiesCatalogData = [...DEFAULT_PROPERTIES];
      }
      updatePropertiesNavCount();
    })
    .catch(() => {
      propertiesCatalogData = [...DEFAULT_PROPERTIES];
      updatePropertiesNavCount();
    });
}

function updatePropertiesNavCount() {
  const badge = document.getElementById("nav-count-properties");
  if (badge) badge.innerText = propertiesCatalogData.length || 20;
}

// View Switcher
window.switchView = function (viewName, leadId = null) {
  currentView = viewName;

  navItems.forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  document.querySelectorAll(".page-view").forEach(pv => pv.classList.remove("active"));

  // Lead Copilot Widget is ONLY visible when viewing an individual lead's full page
  const copilotWrapper = document.getElementById("copilot-widget-wrapper");
  if (copilotWrapper) {
    if (viewName === "lead-detail") {
      copilotWrapper.style.display = "flex";
    } else {
      copilotWrapper.style.display = "none";
      toggleCopilotWidget(false); // Close open chat window when navigating away
    }
  }

  if (viewName === "dashboard") {
    pageBreadcrumb.innerText = "Dashboard";
    viewDashboard.classList.add("active");
    renderDashboard();
  } else if (viewName === "leads") {
    pageBreadcrumb.innerText = "All Inbound Leads";
    viewLeads.classList.add("active");
    renderLeadsTable();
  } else if (viewName === "pipeline") {
    pageBreadcrumb.innerText = "Lead Pipeline";
    viewPipeline.classList.add("active");
    renderKanbanPipeline();
  } else if (viewName === "properties") {
    pageBreadcrumb.innerText = "Properties Directory";
    if (viewProperties) viewProperties.classList.add("active");
    renderPropertiesCatalog();
  } else if (viewName === "lead-detail") {
    const lead = leadsData.find(l => l.id === (leadId || currentActiveLeadId)) || leadsData[0];
    if (lead) {
      currentActiveLeadId = lead.id;
      pageBreadcrumb.innerText = `Lead / ${lead.name} (${lead.id})`;
      viewLeadDetail.classList.add("active");
      renderLeadDetailPage(lead.id);
    }
  }

  const wrapper = document.querySelector(".view-content-wrapper");
  if (wrapper) wrapper.scrollTop = 0;
};

// Filter shortcut
window.filterAndOpenLeads = function (tag) {
  leadsTableFilter = tag;
  const control = document.getElementById("leads-filter-control");
  if (control) {
    control.querySelectorAll(".f-btn").forEach(btn => {
      if (btn.dataset.filter === tag) btn.classList.add("active");
      else btn.classList.remove("active");
    });
  }
  if (currentView === "leads") {
    renderLeadsTable();
  } else {
    switchView("leads");
  }
};

// Open Detail Page
window.openLeadDetail = function (leadId) {
  switchView("lead-detail", leadId);
};

// 1. Dashboard
function renderDashboard() {
  const total = leadsData.length;
  const hotLeads = leadsData.filter(l => l.tag === "Hot");
  const warmLeads = leadsData.filter(l => l.tag === "Warm");
  const coldLeads = leadsData.filter(l => l.tag === "Cold" || l.tag === "Disqualified");

  document.getElementById("dash-total").innerText = total;
  document.getElementById("dash-hot").innerText = hotLeads.length;
  document.getElementById("dash-warm").innerText = warmLeads.length;
  document.getElementById("dash-cold").innerText = coldLeads.length;
  document.getElementById("nav-count-leads").innerText = total;

  const navPipeline = document.getElementById("nav-count-pipeline");
  if (navPipeline) navPipeline.innerText = `${hotLeads.length} Hot`;

  const fcAll = document.getElementById("filter-count-all");
  const fcHot = document.getElementById("filter-count-hot");
  const fcWarm = document.getElementById("filter-count-warm");
  const fcCold = document.getElementById("filter-count-cold");
  if (fcAll) fcAll.innerText = total;
  if (fcHot) fcHot.innerText = hotLeads.length;
  if (fcWarm) fcWarm.innerText = warmLeads.length;
  if (fcCold) fcCold.innerText = coldLeads.length;

  // Immediate Action Queue
  const queueContainer = document.getElementById("dashboard-hot-queue");
  if (queueContainer) {
    queueContainer.innerHTML = "";

    // Show hot leads first; if none, show top scored leads so the queue is never blank
    const priorityLeads = hotLeads.length > 0 ? hotLeads : [...leadsData].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6);

    priorityLeads.forEach(lead => {
      const card = document.createElement("div");
      card.className = "queue-card";
      card.onclick = () => openLeadDetail(lead.id);

      card.innerHTML = `
        <div>
          <div class="qc-header">
            <span class="qc-name">${lead.name} ${lead.is_vip ? `<span class="badge-vip">VIP</span>` : ""}</span>
            <span class="qc-score-pill">${lead.score}/100</span>
          </div>
          <div class="qc-meta">
            <span>${lead.location}</span>
            <span>•</span>
            <span style="font-weight:700; color:var(--text-main);">${lead.budget}</span>
          </div>
          <div class="qc-message" style="margin-top: 10px;">
            "${lead.message}"
          </div>
        </div>
        <div class="qc-action-row">
          <span class="qc-action-text">${lead.tag === "Hot" ? "High Priority" : "Follow-up Required"}</span>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openLeadDetail('${lead.id}')">View Details →</button>
        </div>
      `;
      queueContainer.appendChild(card);
    });
  }

  // Micro-market Breakdown (safely checked if element exists)
  const marketList = document.getElementById("market-breakdown-list");
  if (marketList) {
    const marketCounts = {};
    leadsData.forEach(l => {
      const loc = l.location.split(",")[0].trim();
      marketCounts[loc] = (marketCounts[loc] || 0) + 1;
    });

    marketList.innerHTML = "";
    Object.entries(marketCounts).slice(0, 5).forEach(([loc, count]) => {
      const pct = Math.round((count / total) * 100);
      const item = document.createElement("div");
      item.className = "market-bar-item";
      item.innerHTML = `
        <span class="m-name">${loc}</span>
        <div class="m-bar-wrap"><div class="m-bar-fill" style="width: ${pct}%;"></div></div>
        <span class="m-count">${count} (${pct}%)</span>
      `;
      marketList.appendChild(item);
    });
  }
}

// 2. Leads Table
function renderLeadsTable() {
  const tbody = document.getElementById("leads-table-body");
  tbody.innerHTML = "";

  const filtered = leadsData.filter(lead => {
    if (leadsTableFilter === "Cold") {
      if (lead.tag !== "Cold" && lead.tag !== "Disqualified") return false;
    } else if (leadsTableFilter !== "all" && lead.tag !== leadsTableFilter) {
      return false;
    }
    if (leadsLocalityFilter !== "all" && !lead.location.toLowerCase().includes(leadsLocalityFilter.toLowerCase())) return false;

    if (globalSearchQuery) {
      const q = globalSearchQuery.toLowerCase();
      const match = lead.name.toLowerCase().includes(q) ||
        lead.location.toLowerCase().includes(q) ||
        lead.property_requirement.toLowerCase().includes(q) ||
        lead.budget.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No leads found matching your active filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(lead => {
    const tr = document.createElement("tr");
    tr.onclick = () => openLeadDetail(lead.id);

    let tagClass = "tag-hot";
    if (lead.tag === "Warm") tagClass = "tag-warm";
    if (lead.tag === "Cold") tagClass = "tag-cold";
    if (lead.tag === "Disqualified") tagClass = "tag-disqualified";

    const topSignal = (lead.signals && lead.signals.length > 0) ? lead.signals[0] : "Verified Inbound";

    tr.innerHTML = `
      <td class="td-id">${lead.id}</td>
      <td class="td-buyer">
        <div class="buyer-wrap">
          <span>${lead.name}</span>
          ${lead.is_vip ? `<span class="badge-vip">VIP</span>` : ""}
        </div>
      </td>
      <td>
        <span class="tag-badge ${tagClass}">
          ${lead.score}/100 • ${lead.tag}
        </span>
      </td>
      <td>${lead.location}</td>
      <td>${lead.property_requirement.split(",")[0]}</td>
      <td class="td-budget">${lead.budget}</td>
      <td>${lead.timeline}</td>
      <td><span class="signal-tag">${topSignal}</span></td>
      <td style="text-align: right;">
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openLeadDetail('${lead.id}')">
          Open →
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 3. Kanban
function renderKanbanPipeline() {
  const hotStack = document.getElementById("kanban-cards-hot");
  const warmStack = document.getElementById("kanban-cards-warm");
  const coldStack = document.getElementById("kanban-cards-cold");

  hotStack.innerHTML = "";
  warmStack.innerHTML = "";
  coldStack.innerHTML = "";

  const hotLeads = leadsData.filter(l => l.tag === "Hot");
  const warmLeads = leadsData.filter(l => l.tag === "Warm");
  const coldLeads = leadsData.filter(l => l.tag === "Cold" || l.tag === "Disqualified");

  document.getElementById("kanban-count-hot").innerText = hotLeads.length;
  document.getElementById("kanban-count-warm").innerText = warmLeads.length;
  document.getElementById("kanban-count-cold").innerText = coldLeads.length;

  const renderCard = (lead, stack) => {
    const card = document.createElement("div");
    card.className = "k-card";
    card.onclick = () => openLeadDetail(lead.id);

    card.innerHTML = `
      <div class="k-top">
        <span class="k-name">${lead.name} ${lead.is_vip ? `<span class="badge-vip">VIP</span>` : ""}</span>
        <span class="k-score">${lead.score}/100</span>
      </div>
      <div class="k-meta">
        <span>${lead.location}</span>
        <span>•</span>
        <strong style="color:var(--text-main);">${lead.budget}</strong>
      </div>
      <p class="k-snippet">"${lead.message}"</p>
    `;
    stack.appendChild(card);
  };

  hotLeads.forEach(l => renderCard(l, hotStack));
  warmLeads.forEach(l => renderCard(l, warmStack));
  coldLeads.forEach(l => renderCard(l, coldStack));
}

// 4. Detail Page
function renderLeadDetailPage(leadId) {
  const lead = leadsData.find(l => l.id === leadId);
  if (!lead) return;

  currentActiveLeadId = lead.id;

  detailId.innerText = `LEAD-${lead.id}`;
  detailName.innerText = lead.name;
  detailPhone.innerText = lead.phone ? `+91 ${lead.phone.slice(0, 5)} ${lead.phone.slice(5)}` : "+91 98450 12345";
  detailLoc.innerText = lead.location;
  detailProp.innerText = lead.property_requirement;
  detailBudget.innerText = lead.budget;
  detailTimeline.innerText = lead.timeline;
  detailScore.innerText = lead.score;
  detailMessage.innerText = `"${lead.message}"`;

  detailTag.className = `tag-badge tag-${lead.tag.toLowerCase()}`;
  detailTag.innerText = `${lead.tag} LEAD`;

  detailVip.style.display = lead.is_vip ? "inline-block" : "none";

  if (lead.score >= 70) detailScore.style.color = "var(--hot-coral)";
  else if (lead.score >= 40) detailScore.style.color = "var(--warm-amber)";
  else detailScore.style.color = "var(--cold-gray)";

  const bant = lead.bant || { budget: 20, timeline: 20, need: 15, readiness: 15 };
  if (dbantBudget) dbantBudget.innerText = `${bant.budget}/25`;
  if (dbantBudgetFill) dbantBudgetFill.style.width = `${(bant.budget / 25) * 100}%`;

  if (dbantTimeline) dbantTimeline.innerText = `${bant.timeline}/25`;
  if (dbantTimelineFill) dbantTimelineFill.style.width = `${(bant.timeline / 25) * 100}%`;

  if (dbantNeed) dbantNeed.innerText = `${bant.need}/20`;
  if (dbantNeedFill) dbantNeedFill.style.width = `${(bant.need / 20) * 100}%`;

  if (dbantReadiness) dbantReadiness.innerText = `${bant.readiness}/20`;
  if (dbantReadinessFill) dbantReadinessFill.style.width = `${(bant.readiness / 20) * 100}%`;

  // Signals
  detailSignals.innerHTML = "";
  (lead.signals || []).forEach(sig => {
    const li = document.createElement("li");
    li.className = "signal-item";
    li.innerHTML = `<span>✓</span> <span>${sig}</span>`;
    detailSignals.appendChild(li);
  });

  // Objections
  detailObjections.innerHTML = "";
  if (!lead.objections || lead.objections.length === 0) {
    const li = document.createElement("li");
    li.className = "objection-item";
    li.style.background = "#F9FAFC";
    li.style.color = "var(--text-muted)";
    li.innerHTML = `<span>•</span> <span>No critical concerns identified.</span>`;
    detailObjections.appendChild(li);
  } else {
    lead.objections.forEach(obj => {
      const li = document.createElement("li");
      li.className = "objection-item";
      li.innerHTML = `<span>!</span> <span>${obj}</span>`;
      detailObjections.appendChild(li);
    });
  }

  // Smart Matched Properties for Pitch (Invented Feature)
  renderMatchedPropertiesForLead(lead);

  // Pre-Call Battlecard
  detailHook.innerText = lead.hook || "Opening talk track hook...";
  detailNextAction.innerText = lead.next_action || "Call customer to qualify.";
  detailReply.value = lead.suggested_reply || "Hello! We received your inquiry and would love to assist you.";

  detailCopilotContext.innerText = `${lead.name} (${lead.id})`;

  detailChatStream.innerHTML = `
    <div class="chat-message assistant">
      <div class="msg-avatar">A</div>
      <div class="msg-bubble">
        <p>I'm your assistant grounded in <strong>${lead.name}</strong> (${lead.location}, ${lead.budget}). How can I help you prepare for this customer?</p>
      </div>
    </div>
  `;
}

// Event Listeners
function setupEventListeners() {
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      switchView(item.dataset.view);
    });
  });

  const filterControl = document.getElementById("leads-filter-control");
  if (filterControl) {
    filterControl.querySelectorAll(".f-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        filterControl.querySelectorAll(".f-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        leadsTableFilter = btn.dataset.filter;
        renderLeadsTable();
      });
    });
  }

  const localitySelect = document.getElementById("locality-filter");
  if (localitySelect) {
    localitySelect.addEventListener("change", (e) => {
      leadsLocalityFilter = e.target.value;
      renderLeadsTable();
    });
  }

  globalSearchInput.addEventListener("input", (e) => {
    globalSearchQuery = e.target.value.trim();
    if (currentView !== "leads") {
      switchView("leads");
    } else {
      renderLeadsTable();
    }
  });

  btnBackToLeads.addEventListener("click", () => {
    switchView("leads");
  });

  btnPrevLead.addEventListener("click", () => {
    const idx = leadsData.findIndex(l => l.id === currentActiveLeadId);
    if (idx > 0) renderLeadDetailPage(leadsData[idx - 1].id);
    else showToast("At the first lead.");
  });

  btnNextLead.addEventListener("click", () => {
    const idx = leadsData.findIndex(l => l.id === currentActiveLeadId);
    if (idx < leadsData.length - 1) renderLeadDetailPage(leadsData[idx + 1].id);
    else showToast("At the last lead.");
  });

  document.getElementById("btn-detail-copy").addEventListener("click", () => {
    detailReply.select();
    navigator.clipboard.writeText(detailReply.value);
    showToast("Message copied to clipboard!");
  });

  const triggerWhatsApp = () => {
    const text = encodeURIComponent(detailReply.value);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    showToast("Opening WhatsApp with pre-filled message...");
  };
  document.getElementById("btn-detail-whatsapp").addEventListener("click", triggerWhatsApp);
  document.getElementById("btn-detail-whatsapp-action").addEventListener("click", triggerWhatsApp);

  // Rotating dynamic message styles for WhatsApp regeneration
  let regenVariantIndex = 0;
  document.getElementById("btn-detail-regen").addEventListener("click", () => {
    const lead = leadsData.find(l => l.id === currentActiveLeadId);
    if (!lead) return;
    
    const firstName = lead.name.split(" ")[0];
    const location = lead.location || "Bangalore";
    const prop = lead.property_requirement || "apartment";
    const budget = lead.budget || "budget";
    const timeline = lead.timeline || "soon";

    // 5 Distinct Communication Angles:
    // 0: Urgent / Weekend site visit lock
    // 1: Direct Value & Verified OC / Bank Pre-approval
    // 2: Short & Action-Oriented (One-liner WhatsApp)
    // 3: Warm Consultative / Relationship Building
    // 4: Bilingual / Conversational Hinglish pitch
    const templates = [
      {
        type: "Urgent Site Visit Lock",
        msg: `Hi ${firstName}! Following up on your inquiry for ${prop} in ${location}. We have 2 ready units matching your ${budget} budget with exclusive weekend visit slots open this Saturday at 11 AM. Shall I reserve a slot for you?`
      },
      {
        type: "Verified OC & Bank Pre-Approval",
        msg: `Hello ${firstName}, regarding your ${budget} search in ${location}: Both shortlisted properties have clear A-Khata, BBMP OC received, and instant pre-approved loans ready. Can I share the verified brochures and cost sheets on WhatsApp?`
      },
      {
        type: "Crisp & Direct One-Liner",
        msg: `Hi ${firstName}! Found 2 verified ${prop} units in ${location} matching your ${budget} budget (${timeline}). Let me know when you're free for a quick 5-min call today to share floor plans.`
      },
      {
        type: "Consultative Advisory",
        msg: `Hi ${firstName}, welcome! I reviewed your timeline (${timeline}) for ${location}. We curated 2 high-appreciation options that fit comfortably within ${budget} with zero brokerage. Proposing a short walkthrough this Sunday!`
      },
      {
        type: "Conversational & Friendly",
        msg: `Namaste ${firstName}! Aapka ${location} mein ${prop} ka requirement aur ${budget} budget bilkul perfect match hai. Saturday ko property dekhne ka plan banayein? WhatsApp par photos share kar raha hoon!`
      }
    ];

    regenVariantIndex = (regenVariantIndex + 1) % templates.length;
    const selected = templates[regenVariantIndex];
    
    detailReply.value = selected.msg;
    detailReply.style.borderColor = "var(--coral-primary)";
    setTimeout(() => { detailReply.style.borderColor = "var(--peach-border)"; }, 800);
    showToast(`Regenerated: ${selected.type}`);
  });

  document.querySelectorAll(".q-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const prompt = pill.dataset.prompt;
      detailChatInput.value = prompt;
      handleCopilotChat(prompt);
    });
  });

  detailChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const prompt = detailChatInput.value.trim();
    if (!prompt) return;
    detailChatInput.value = "";
    handleCopilotChat(prompt);
  });

  const intakeForm = document.getElementById("intake-form");
  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("input-name").value.trim();
      const phone = document.getElementById("input-phone").value.trim();
      const loc = document.getElementById("input-location").value.trim();
      const prop = document.getElementById("input-prop").value.trim();
      const budget = document.getElementById("input-budget").value.trim();
      const timeline = document.getElementById("input-timeline").value.trim();
      const message = document.getElementById("input-message").value.trim();

      const submitBtn = document.getElementById("btn-submit-lead");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Analyzing Lead with AI...";
      }

      // Call Flask Backend API
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, location: loc, property_requirement: prop, budget, timeline, message
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.lead) {
          leadsData.unshift(data.lead);
          closeIntakeModal();
          intakeForm.reset();
          renderDashboard();
          showToast(`Prioritized ${data.lead.name}: ${data.lead.score}/100 (${data.lead.tag})`);
          openLeadDetail(data.lead.id);
        } else {
          fallbackLocalIntake();
        }
      })
      .catch(err => {
        console.warn("Backend API not reachable, running client fallback evaluation:", err);
        fallbackLocalIntake();
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = "Lead Analysis";
        }
      });

      function fallbackLocalIntake() {
        let score = 55;
        let tag = "Warm";
        let isVip = false;

        const lower = `${loc} ${prop} ${budget} ${timeline} ${message}`.toLowerCase();

        if (lower.includes("marketing") || lower.includes("leads") || lower.includes("mumbai")) {
          score = lower.includes("mumbai") ? 5 : 0;
          tag = "Disqualified";
        } else {
          if (lower.includes("loan sanctioned") || lower.includes("pre-approved") || lower.includes("cash")) score += 20;
          if (lower.includes("immediately") || lower.includes("asap") || lower.includes("relocating") || lower.includes("lease")) score += 20;
          if (lower.includes("cr") && parseFloat(budget) >= 3.0) isVip = true;

          if (score >= 70) tag = "Hot";
          else if (score >= 40) tag = "Warm";
          else tag = "Cold";
        }

        const newLead = {
          id: `L${String(leadsData.length + 1).padStart(2, "0")}`,
          name,
          phone,
          location: loc,
          property_requirement: prop,
          budget,
          timeline,
          message,
          score,
          tag,
          is_vip: isVip,
          bant: { budget: 20, timeline: 20, need: 15, readiness: 15 },
          signals: ["Inbound lead analyzed in real-time", "Target micro-market specified", "Requirement ingested"],
          objections: ["Pending agent discovery call"],
          next_action: "Review analysis and trigger WhatsApp outreach.",
          hook: `"Hi ${name.split(" ")[0]}, we reviewed your ${prop} inquiry for ${loc}. Let's discuss verified options!"`,
          suggested_reply: `Hi ${name.split(" ")[0]}! Thanks for contacting us regarding properties in ${loc}. We have verified options matching your ${budget} budget. When are you free for a 5-minute call?`
        };

        leadsData.unshift(newLead);
        closeIntakeModal();
        intakeForm.reset();
        renderDashboard();
        showToast(`Analyzed ${name}: ${score}/100 (${tag})`);
        openLeadDetail(newLead.id);
      }
    });
  }

  // Sample CSV dropzone drag-and-drop listener
  const dropzone = document.getElementById("csv-dropzone");
  const fileInput = document.getElementById("csv-file-input");
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        showToast(`Selected "${e.target.files[0].name}"`);
      }
    });
  }
}

function handleCopilotChat(userPrompt) {
  const currentLead = leadsData.find(l => l.id === currentActiveLeadId) || leadsData[0];

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.innerHTML = `
    <div class="msg-avatar">You</div>
    <div class="msg-bubble"><p>${userPrompt}</p></div>
  `;
  detailChatStream.appendChild(userMsg);
  detailChatStream.scrollTop = detailChatStream.scrollHeight;

  // Show temporary thinking bubble
  const typingMsg = document.createElement("div");
  typingMsg.className = "chat-message assistant typing-msg";
  typingMsg.innerHTML = `
    <div class="msg-avatar">A</div>
    <div class="msg-bubble"><p><em>Thinking...</em></p></div>
  `;
  detailChatStream.appendChild(typingMsg);
  detailChatStream.scrollTop = detailChatStream.scrollHeight;

  // Call Flask API with lead grounding
  fetch("/api/copilot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lead_id: currentLead.id,
      question: userPrompt
    })
  })
  .then(res => res.json())
  .then(data => {
    typingMsg.remove();
    const answer = (data.success && data.answer) ? data.answer : getFallbackCopilotReply(userPrompt, currentLead);
    renderAssistantBubble(answer);
  })
  .catch(err => {
    console.warn("Copilot API not reachable, using offline grounded response:", err);
    typingMsg.remove();
    renderAssistantBubble(getFallbackCopilotReply(userPrompt, currentLead));
  });

  function renderAssistantBubble(text) {
    const aiMsg = document.createElement("div");
    aiMsg.className = "chat-message assistant";
    aiMsg.innerHTML = `
      <div class="msg-avatar">A</div>
      <div class="msg-bubble"><p>${text}</p></div>
    `;
    detailChatStream.appendChild(aiMsg);
    detailChatStream.scrollTop = detailChatStream.scrollHeight;
  }

  function getFallbackCopilotReply(prompt, lead) {
    if (prompt.includes("emphasize") || prompt.includes("call")) {
      return `For <strong>${lead.name}</strong>, emphasize their <strong>${lead.timeline}</strong> deadline and acknowledge their <strong>${lead.budget}</strong> budget. Specifically confirm OC status and ready possession to neutralize their primary hesitation.`;
    } else if (prompt.includes("assertive")) {
      return `Assertive pitch:<br><em>"Hi ${lead.name.split(" ")[0]}, units in this price band in ${lead.location} are receiving multiple inquiries this week. I can hold the keys for Saturday 11 AM if we confirm right now."</em>`;
    } else if (prompt.includes("OC") || prompt.includes("objection")) {
      return `Handle the OC question upfront: <em>"Both shortlisted towers have full Occupancy Certificates received from BBMP and A-Khata deeds verified. I am sharing the documents directly to your WhatsApp before our call."</em>`;
    } else if (prompt.includes("Hinglish")) {
      return `Hinglish pitch:<br><em>"Arre ${lead.name.split(" ")[0]} bhai, aapka budget aur location bilkul sorted hai. Saturday ko 11 baje site dikhane ke liye booking block kar diya hai, ready raho!"</em>`;
    }
    return `Grounded in <strong>${lead.name}'s</strong> profile (${lead.location}, Budget: ${lead.budget}): Recommend locking a weekend site visit immediately. Lead score is <strong>${lead.score}/100 (${lead.tag})</strong>.`;
  }
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// ==========================================================================
// PROPERTIES CATALOG & MATCHING ENGINE IMPLEMENTATION (INVENTED FEATURE)
// ==========================================================================

window.renderPropertiesCatalog = function () {
  const grid = document.getElementById("properties-catalog-grid");
  if (!grid) return;

  const locFilter = document.getElementById("prop-locality-filter") ? document.getElementById("prop-locality-filter").value : "all";
  const bhkFilter = document.getElementById("prop-bhk-filter") ? document.getElementById("prop-bhk-filter").value : "all";

  const catalog = propertiesCatalogData.length > 0 ? propertiesCatalogData : DEFAULT_PROPERTIES;
  
  const filtered = catalog.filter(p => {
    if (locFilter !== "all" && p.location !== locFilter) return false;
    if (bhkFilter !== "all") {
      if (bhkFilter === "Plot" && !p.bhk.toLowerCase().includes("plot")) return false;
      if (bhkFilter !== "Plot" && !p.bhk.includes(bhkFilter)) return false;
    }
    return true;
  });

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--text-muted); background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
        <p style="font-size: 1.1rem; font-weight: 600;">No properties match the selected criteria.</p>
        <p style="font-size: 0.85rem; margin-top: 6px;">Try clearing filters to view all 20 developer properties.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "prop-card";

    const highlightsHtml = (p.highlights || []).slice(0, 3).map(h => `
      <li><span class="dot"></span> ${h}</li>
    `).join("");

    card.innerHTML = `
      <div>
        <div class="prop-top">
          <div>
            <div class="prop-builder">${p.builder}</div>
            <h3 class="prop-title">${p.name}</h3>
          </div>
          <span class="prop-price-badge">${p.price_str}</span>
        </div>

        <div class="prop-location-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>${p.area_locality}</span>
        </div>

        <div class="prop-tags-row">
          <span class="prop-spec-chip">${p.bhk}</span>
          <span class="prop-spec-chip">${p.sqft} sq.ft</span>
          <span class="prop-oc-chip">${p.oc_status}</span>
          <span class="prop-spec-chip">${p.possession}</span>
        </div>

        <ul class="prop-highlights-list">
          ${highlightsHtml}
        </ul>
      </div>

      <div class="prop-footer">
        <span class="prop-rera">RERA: ${p.rera.slice(-10)}</span>
        <button class="btn btn-secondary btn-sm" onclick="sharePropertyBrochure('${p.id}')">
          Share Brochure
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
};

window.sharePropertyBrochure = function (propertyId) {
  const catalog = propertiesCatalogData.length > 0 ? propertiesCatalogData : DEFAULT_PROPERTIES;
  const prop = catalog.find(p => p.id === propertyId);
  if (!prop) return;

  const text = `Hi! Here is the verified brochure & pricing sheet for *${prop.name}* by ${prop.builder} in ${prop.location}.\n• Config: ${prop.bhk} (${prop.sqft} sq.ft)\n• Price: ${prop.price_str}\n• Status: ${prop.possession} (${prop.oc_status})\n• RERA: ${prop.rera}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  showToast(`Brochure link for ${prop.name} copied to clipboard!`);
};

// Render Matched Properties on Lead Dossier
function renderMatchedPropertiesForLead(lead) {
  const container = document.getElementById("detail-matched-properties");
  if (!container) return;

  // Try fetching dynamic recommendations from backend API first
  fetch(`/api/properties/match/${lead.id}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.matches && data.matches.length > 0) {
        populateMatchedPropsUI(container, lead, data.matches);
      } else {
        fallbackClientMatching(container, lead);
      }
    })
    .catch(() => {
      fallbackClientMatching(container, lead);
    });
}

function populateMatchedPropsUI(container, lead, matches) {
  container.innerHTML = "";
  matches.forEach(item => {
    const prop = item.property;
    const matchScore = item.match_score;
    const reasons = item.reasons || [];

    const card = document.createElement("div");
    card.className = "matched-prop-card";

    const reasonPills = reasons.map(r => `<span class="mpc-reason-pill">${r}</span>`).join("");

    card.innerHTML = `
      <div class="mpc-top">
        <div class="mpc-title-box">
          <span class="mpc-name">${prop.name} (${prop.builder})</span>
          <span class="mpc-meta">${prop.bhk} • ${prop.area_locality} • <strong>${prop.price_str}</strong> • ${prop.oc_status}</span>
        </div>
        <span class="mpc-score-badge">${matchScore}% MATCH</span>
      </div>

      <div class="mpc-reasons">
        ${reasonPills}
      </div>

      <div class="mpc-actions">
        <button class="btn-pitch-insert" onclick="insertPropertyIntoPitch('${prop.id}', '${lead.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          Insert into Talk Track
        </button>

        <button class="btn-pitch-whatsapp" onclick="sendPropertyWhatsApp('${prop.id}', '${lead.id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Send WhatsApp Brochure
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function fallbackClientMatching(container, lead) {
  const catalog = propertiesCatalogData.length > 0 ? propertiesCatalogData : DEFAULT_PROPERTIES;
  const leadLoc = (lead.location || "").toLowerCase();
  
  // Pick matching or close properties
  const matches = catalog.map(p => {
    let score = 65;
    const reasons = [];
    if (leadLoc && (p.location.toLowerCase().includes(leadLoc) || leadLoc.includes(p.location.toLowerCase()))) {
      score += 25;
      reasons.push(`Direct match in ${p.location}`);
    } else {
      reasons.push("Prime Bangalore corridor");
    }
    if (p.oc_status.includes("OC Received")) {
      score += 10;
      reasons.push("OC Received verified");
    }
    return {
      property: p,
      match_score: Math.min(score, 98),
      reasons: reasons
    };
  }).sort((a, b) => b.match_score - a.match_score).slice(0, 3);

  populateMatchedPropsUI(container, lead, matches);
}

// 1-Click Action: Insert into Pitch & Talk Track
window.insertPropertyIntoPitch = function (propId, leadId) {
  const catalog = propertiesCatalogData.length > 0 ? propertiesCatalogData : DEFAULT_PROPERTIES;
  const prop = catalog.find(p => p.id === propId);
  const lead = leadsData.find(l => l.id === leadId);
  if (!prop || !lead) return;

  const replyTextarea = document.getElementById("detail-reply");
  const hookP = document.getElementById("detail-hook");

  const firstName = lead.name.split(" ")[0];
  const assertivePitch = `Hi ${firstName}! I have reserved an exclusive viewing slot for *${prop.name}* (${prop.bhk}, ${prop.area_locality}) matching your exact requirement. Price: ${prop.price_str} with full ${prop.oc_status}. Saturday 11 AM works best before slots fill up. Shall I confirm your pass?`;

  if (replyTextarea) {
    replyTextarea.value = assertivePitch;
    replyTextarea.style.borderColor = "var(--coral-primary)";
    setTimeout(() => { replyTextarea.style.borderColor = "var(--peach-border)"; }, 1200);
  }

  if (hookP) {
    hookP.innerText = `"Hi ${firstName}, I'm calling directly regarding ${prop.name} in ${prop.location} — we have an OC-ready unit at ${prop.price_str} that matches your checklist."`;
  }

  showToast(`Inserted ${prop.name} into Pitch & WhatsApp Composer!`);
};

// 1-Click Action: Send Brochure on WhatsApp
window.sendPropertyWhatsApp = function (propId, leadId) {
  const catalog = propertiesCatalogData.length > 0 ? propertiesCatalogData : DEFAULT_PROPERTIES;
  const prop = catalog.find(p => p.id === propId);
  const lead = leadsData.find(l => l.id === leadId);
  if (!prop || !lead) return;

  const phone = (lead.phone || "").replace(/[^0-9]/g, "");
  const targetPhone = phone.length === 10 ? `91${phone}` : phone;
  const firstName = lead.name.split(" ")[0];

  const msg = `Hi ${firstName}! Following up on your inquiry, here is the verified developer dossier for *${prop.name}* by ${prop.builder}:\n\n` +
              `• Location: ${prop.area_locality}\n` +
              `• Config: ${prop.bhk} (${prop.sqft} sq.ft)\n` +
              `• Price: ${prop.price_str}\n` +
              `• Status: ${prop.possession} (${prop.oc_status})\n` +
              `• RERA No: ${prop.rera}\n\n` +
              `Would you like to schedule a guided site walkthrough this Saturday?`;

  const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
  showToast(`Opening WhatsApp chat for ${lead.name}...`);
};
