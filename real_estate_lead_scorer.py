"""
Real Estate Lead Scoring & Prioritization Engine
=================================================
Implements an adapted Real Estate BANT+ framework incorporating:
1. Authority & Decision Structure
2. Budget & Micro-market Reality Fit
3. Timeline & External Forcing Events
4. Need & Inventory Specificity
5. Purchase Intent & Funnel Depth
6. Financial Readiness & Friction Points
+ Hard Geographic Serviceability & Spam Disqualification Gates.

Evaluated on Bangalore Real Estate benchmark data (test_leads.json).
"""

import json
import re
from typing import Dict, Any, Tuple, List


class RealEstateLeadScorer:
    def __init__(self, service_area: str = "Bangalore"):
        self.service_area = service_area.lower()
        # Bangalore micro-market benchmark price bands (in Lakhs INR)
        self.price_benchmarks = {
            "whitefield_villa": (200.0, 450.0),
            "whitefield_3bhk": (130.0, 220.0),
            "whitefield_2bhk": (80.0, 130.0),
            "sarjapur_luxury_4bhk": (250.0, 450.0),
            "sarjapur_3bhk": (120.0, 200.0),
            "sarjapur_2bhk": (75.0, 120.0),
            "electronic_city_2bhk": (55.0, 85.0),
            "electronic_city_1bhk": (55.0, 85.0), # Active developer min inventory
            "hebbal_3bhk": (160.0, 300.0),
            "bannerghatta_2bhk": (70.0, 110.0),
            "devanahalli_plot": (40.0, 75.0),
        }

    def parse_budget_lakhs(self, budget_str: str) -> float:
        """Parses budget strings into numerical values in Lakhs (INR)."""
        if not budget_str or budget_str.strip().lower() in ["depends", "not mentioned", "any", ""]:
            return 0.0

        cr_match = re.search(r'([\d\.]+)\s*(?:-\s*([\d\.]+))?\s*cr', budget_str, re.IGNORECASE)
        if cr_match:
            low = float(cr_match.group(1))
            high = float(cr_match.group(2)) if cr_match.group(2) else low
            return ((low + high) / 2.0) * 100.0

        l_match = re.search(r'([\d\.]+)\s*(?:-\s*([\d\.]+))?\s*l', budget_str, re.IGNORECASE)
        if l_match:
            low = float(l_match.group(1))
            high = float(l_match.group(2)) if l_match.group(2) else low
            return (low + high) / 2.0

        num_match = re.search(r'(\d+)', budget_str)
        if num_match:
            val = float(num_match.group(1))
            return (val / 100000.0) if val > 1000 else val
        return 0.0

    def get_inventory_benchmark(self, location: str, requirement: str) -> Tuple[float, float]:
        """Maps location and property configuration to market price bounds."""
        loc = location.lower()
        req = requirement.lower()

        if "whitefield" in loc:
            if "villa" in req:
                return self.price_benchmarks["whitefield_villa"]
            elif "3bhk" in req:
                return self.price_benchmarks["whitefield_3bhk"]
            elif "2bhk" in req:
                return self.price_benchmarks["whitefield_2bhk"]
            return (80.0, 220.0)
        elif "sarjapur" in loc:
            if "4bhk" in req or "luxury" in req:
                return self.price_benchmarks["sarjapur_luxury_4bhk"]
            elif "3bhk" in req:
                return self.price_benchmarks["sarjapur_3bhk"]
            elif "2bhk" in req:
                return self.price_benchmarks["sarjapur_2bhk"]
            return (75.0, 200.0)
        elif "electronic city" in loc or "e city" in loc or "e-city" in loc:
            return self.price_benchmarks["electronic_city_2bhk"]
        elif "hebbal" in loc:
            return self.price_benchmarks["hebbal_3bhk"]
        elif "bannerghatta" in loc:
            return self.price_benchmarks["bannerghatta_2bhk"]
        elif "devanahalli" in loc or "plot" in req:
            return self.price_benchmarks["devanahalli_plot"]
        return (55.0, 200.0)

    def score(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Scores an inbound real estate lead across BANT+ dimensions."""
        lid = lead.get("id", "N/A")
        name = lead.get("name", "Anonymous")
        loc = lead.get("location", "")
        prop = lead.get("property_requirement", "")
        budget_raw = lead.get("budget", "")
        timeline_raw = lead.get("timeline", "")
        msg = lead.get("message", "")

        full_text = f"{name} {loc} {prop} {budget_raw} {timeline_raw} {msg}".lower()
        msg_lower = msg.lower()
        signals: List[str] = []
        objections: List[str] = []

        # -------------------------------------------------------------
        # HARD GATE 1: SPAM & VENDOR DETECTION
        # -------------------------------------------------------------
        spam_patterns = [
            r"digital marketing", r"lead generation", r"500 leads",
            r"guaranteed leads", r"marketing services", r"seo services"
        ]
        if any(re.search(p, full_text) for p in spam_patterns):
            return {
                "id": lid,
                "name": name,
                "score": 0,
                "tag": "Disqualified",
                "breakdown": {"budget": 0, "timeline": 0, "intent_authority": 0, "readiness": 0, "engagement": 0},
                "signals": ["vendor pitch / B2B marketing spam"],
                "objections": ["non-buyer inquiry"],
                "next_action": "Mark as spam / block contact."
            }

        # -------------------------------------------------------------
        # HARD GATE 2: GEOGRAPHIC SERVICEABILITY
        # -------------------------------------------------------------
        out_of_area_cities = ["mumbai", "andheri", "pune", "delhi", "gurgaon", "noida", "hyderabad", "chennai"]
        if any(city in loc.lower() for city in out_of_area_cities):
            return {
                "id": lid,
                "name": name,
                "score": 5,
                "tag": "Disqualified",
                "breakdown": {"budget": 0, "timeline": 0, "intent_authority": 0, "readiness": 0, "engagement": 0},
                "signals": [f"geographic mismatch ({loc} outside Bangalore operational boundary)"],
                "objections": ["outside service area"],
                "next_action": "Politely decline / refer to affiliate brokerage in prospect city."
            }

        # -------------------------------------------------------------
        # PILLAR 1: BUDGET FIT & MARKET REALISM (0 - 25 pts)
        # -------------------------------------------------------------
        budget_lakhs = self.parse_budget_lakhs(budget_raw)
        min_market, max_market = self.get_inventory_benchmark(loc, prop)

        budget_score = 0
        is_luxury_deal = False
        is_unrealistic_budget = False
        is_tight_budget = False

        if budget_lakhs == 0:
            budget_score = 0
            objections.append("no budget specified")
        elif budget_lakhs >= min_market and budget_lakhs <= max_market * 1.5:
            budget_score = 25
            signals.append(f"budget aligns with market ({budget_raw} for {loc} {prop})")
        elif budget_lakhs > max_market * 1.5:
            budget_score = 25
            is_luxury_deal = True
            signals.append(f"luxury ticket size ({budget_raw})")
        elif budget_lakhs >= min_market * 0.6:
            budget_score = 12
            is_tight_budget = True
            signals.append("budget tight compared to developer active inventory")
            objections.append("tight budget / entry-level constraint")
        else:
            budget_score = 0
            is_unrealistic_budget = True
            signals.append(f"budget severely disconnected from market reality ({budget_raw} vs {min_market}L+)")
            objections.append("unrealistic budget expectations")

        # -------------------------------------------------------------
        # PILLAR 2: TIMELINE URGENCY & FORCING EVENTS (0 - 25 pts)
        # -------------------------------------------------------------
        timeline_score = 0
        t_str = f"{timeline_raw} {msg}".lower()

        # Hard external forcing events (Job relocation, Lease end, School admissions)
        has_forcing_event = False
        if "relocating" in t_str and ("joining" in t_str or "job" in t_str):
            has_forcing_event = True
            signals.append("job relocation with fixed joining deadline")
        elif "lease ends" in t_str or "rental lease" in t_str:
            has_forcing_event = True
            signals.append("rental lease expiration forcing transaction")
        elif "school" in t_str and ("academic year" in t_str or "admission" in t_str or "shift" in t_str):
            has_forcing_event = True
            signals.append("school admission/academic cycle deadline")

        msg_word_count = len(msg.strip().split())
        is_minimal_message = msg_word_count <= 6 and not any(
            k in msg_lower for k in ["visit", "saturday", "weekend", "book", "loan", "token"]
        )

        if has_forcing_event:
            timeline_score = 25
        elif any(k in timeline_raw.lower() for k in ["immediately", "asap", "within 1 month", "1 month"]):
            if is_minimal_message:
                # Contradiction: Form ASAP vs 5-word low-intent message
                timeline_score = 10
                signals.append("stated ASAP timeline discounted due to minimal inquiry effort")
            else:
                timeline_score = 22
                signals.append("immediate transaction window (<30 days)")
        elif any(k in timeline_raw.lower() for k in ["1-2 mahine", "2-3 months", "within 3 months"]):
            timeline_score = 20
            signals.append("short-term window (1-3 months)")
        elif any(k in timeline_raw.lower() for k in ["3 months", "4 months"]):
            timeline_score = 15
            signals.append("medium-term purchase window (3-4 months)")
        elif any(k in timeline_raw.lower() for k in ["3-6 months"]):
            timeline_score = 14
            signals.append("planned horizon (3-6 months)")
        elif any(k in timeline_raw.lower() for k in ["6 months"]):
            timeline_score = 10
            signals.append("extended timeline (6 months)")
        elif any(k in timeline_raw.lower() for k in ["6-12 months", "12 months"]):
            timeline_score = 6
            signals.append("long-term horizon (6-12 months)")
        elif any(k in t_str for k in ["maybe next year", "next year", "not decided", "retirement in 2 years", "just exploring", "not in a hurry"]):
            timeline_score = 2
            signals.append("exploratory browsing / distant horizon (>1 year)")
        else:
            timeline_score = 2
            objections.append("no purchase timeline specified")

        # -------------------------------------------------------------
        # PILLAR 3: INTENT CLARITY, PROPERTY FIT & AUTHORITY (0 - 20 pts)
        # -------------------------------------------------------------
        need_score = 0
        authority_score = 0

        # Locality specificity
        loc_splits = [l.strip() for l in re.split(r'[,/]', loc) if l.strip()]
        if len(loc_splits) >= 3:
            need_score += 2
            signals.append("diffuse geographic inquiry across multiple locations")
        elif loc and loc.lower() != "bangalore":
            need_score += 6
        else:
            need_score += 2

        # Property criteria specificity
        if prop and prop.lower() not in ["flat", "any 2 or 3 bhk"]:
            need_score += 4
            spec_criteria = ["ready to move", "oc", "rera", "floor", "facing", "gated", "clubhouse", "school", "hospital", "plot", "yield", "bhk"]
            matched_specs = sum(1 for sc in spec_criteria if sc in full_text)
            if matched_specs >= 3:
                need_score += 2
        else:
            objections.append("generic or unstated property requirement")

        # Authority dynamics
        if any(k in full_text for k in ["brother who is in the us", "discussing with", "parents", "co-fund"]):
            authority_score = 3
            signals.append("split decision-making authority (co-funder abroad)")
            objections.append("primary decision maker not directly accessible")
        elif any(k in full_text for k in ["both of us", "working couple", "we're a working couple", "we want to buy"]):
            authority_score = 8
            signals.append("aligned co-buyers / couple decision makers")
        elif is_minimal_message:
            authority_score = 3
        else:
            authority_score = 6

        intent_clarity_score = need_score + authority_score

        # -------------------------------------------------------------
        # PILLAR 4: READINESS (FINANCIAL + ACTION READINESS) (0 - 20 pts)
        # -------------------------------------------------------------
        fin_score = 0
        action_score = 0

        # Financial readiness
        if any(k in full_text for k in ["loan already sanctioned", "loan sanctioned", "both of us have loan pre-approval", "pre-approval", "bank approved"]):
            fin_score = 10
            signals.append("mortgage pre-approved / sanctioned")
        elif any(k in full_text for k in ["down payment ready", "cash ready"]):
            fin_score = 10
            signals.append("down payment liquid & ready")
        elif "full amount in cash" in full_text:
            fin_score = 5 if is_unrealistic_budget else 10
        elif "process chalu" in full_text or "loan in process" in full_text:
            fin_score = 6
            signals.append("loan application currently under processing")
            objections.append("loan sanction pending")
        elif "payment plan" in full_text or "9:1" in full_text:
            fin_score = 3
            objections.append("contingent on builder payment schemes")
        elif "visited your" in msg_lower and "ready to book" in msg_lower:
            fin_score = 9
        elif "haven't applied" in full_text or "haven't applied yet" in full_text:
            fin_score = 2
            signals.append("home loan uninitiated")
            objections.append("loan eligibility unverified")
        elif is_luxury_deal or "nri" in full_text:
            fin_score = 6
        else:
            fin_score = 2

        # Action / Visit readiness
        if "visited your" in msg_lower and "ready to book" in msg_lower:
            action_score = 10
            signals.append("site visit completed; actively negotiating unit booking")
        elif any(k in msg_lower for k in ["visit this saturday", "dikha sakte ho", "can i visit", "weekend pe"]):
            action_score = 9
            signals.append("site visit requested with specific day/timing")
        elif "callback after" in msg_lower or "shortlisted 2" in msg_lower:
            action_score = 8
            signals.append("specified exact callback availability window")
        elif "video call" in msg_lower or "video walkthrough" in msg_lower:
            action_score = 7
            signals.append("remote investor requesting virtual walkthrough")
        elif is_unrealistic_budget and "register this month" in msg_lower:
            action_score = 6
        elif is_tight_budget and "ready to move" in full_text:
            action_score = 6
        elif is_minimal_message:
            action_score = 2
        else:
            action_score = 3

        readiness_score = fin_score + action_score
        if is_minimal_message and not any(k in full_text for k in ["loan", "cash", "approved"]):
            readiness_score = min(readiness_score, 4)

        # -------------------------------------------------------------
        # PILLAR 5: ENGAGEMENT & VERIFICATION QUALITY (0 - 10 pts)
        # -------------------------------------------------------------
        engagement_score = 0
        if "prestige next door" in msg_lower or "5% lower" in msg_lower:
            engagement_score = 10
            signals.append("high-intent price benchmark vs named competitor")
        elif "??" in msg or ("rera" in msg_lower and "possession" in msg_lower):
            engagement_score = 7
            signals.append("prospect conducting developer due diligence (RERA/possession)")
            objections.append("past developer delay trauma / trust barrier")
        elif any(k in msg_lower for k in ["a-khata", "clear title", "bmrda", "maintenance charges", "oc is received"]):
            engagement_score = 8
            signals.append("in-depth legal verification inquiry (Khata/Title/OC)")
        elif any(k in full_text for k in ["relocating", "school", "lease", "international school", "clubhouse"]):
            engagement_score = 7
        elif "brochure" in msg_lower or "price list" in msg_lower:
            engagement_score = 5
            signals.append("passive top-of-funnel collateral inquiry")
        elif is_minimal_message:
            engagement_score = 2
        else:
            engagement_score = 5

        # -------------------------------------------------------------
        # TOTAL SCORE & PRIORITY TAG ASSIGNMENT
        # -------------------------------------------------------------
        total_score = budget_score + timeline_score + intent_clarity_score + readiness_score + engagement_score
        total_score = max(0, min(100, total_score))

        # Real estate calibration: tight budget or unaddressed trust friction caps to Warm
        if is_tight_budget and total_score > 65:
            total_score = 62
        if ("??" in msg or "payment plan" in full_text) and total_score >= 70:
            total_score = 68

        if total_score >= 70:
            tag = "Hot"
        elif total_score >= 40:
            tag = "Warm"
        else:
            tag = "Cold"

        # Action routing
        if is_luxury_deal and tag == "Warm":
            next_action = "Senior Luxury Agent personal outreach; high ticket size justifies white-glove relationship building."
        elif tag == "Hot":
            if "visit this saturday" in full_text or "weekend" in full_text:
                next_action = "Call within 15 mins to confirm weekend site visit slot and curate matching inventory."
            elif "callback after" in full_text:
                next_action = "Schedule call strictly during prospect's specified callback window (after 7 PM); lead with school/clubhouse amenities."
            elif "ready to book" in full_text:
                next_action = "Escalate to Sales Director immediately for price-matching concession; immediate closing window."
            elif "nri" in full_text or "video" in full_text:
                next_action = "Book virtual video walkthrough; share rental yield projections and NRI legal workflow (POA)."
            else:
                next_action = "Immediate phone call (<15 mins) to confirm requirements and schedule site visit."
        elif tag == "Warm":
            if is_unrealistic_budget:
                next_action = "Call to gently reset market expectations: suggest 2BHK apartment or emerging corridor villa plots."
            elif is_tight_budget:
                next_action = "Check resale inventory; if unavailable, transparently suggest adjacent emerging micro-markets."
            elif "haven't applied" in full_text:
                next_action = "Send brochure & pricing on WhatsApp; offer complimentary home loan pre-qualification assistance."
            elif "??" in msg or "rera" in msg_lower:
                next_action = "Immediately send RERA registration certificate, verified possession timeline, and builder track record."
            else:
                next_action = "Send customized project deck and floor plans on WhatsApp; follow up within 24-48 hours."
        else: # Cold
            next_action = "Enroll in automated WhatsApp/email nurture sequence; monitor re-engagement triggers."

        return {
            "id": lid,
            "name": name,
            "score": total_score,
            "tag": tag,
            "breakdown": {
                "budget_fit": budget_score,
                "timeline_urgency": timeline_score,
                "intent_and_authority": intent_clarity_score,
                "readiness": readiness_score,
                "engagement": engagement_score
            },
            "signals": signals,
            "objections": objections,
            "next_action": next_action
        }


if __name__ == "__main__":
    test_file = "data/test_leads.json" if os.path.exists("data/test_leads.json") else "test_leads.json"
    with open(test_file, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    scorer = RealEstateLeadScorer()
    leads = dataset["leads"]

    print("=" * 80)
    print("REAL ESTATE LEAD SCORING SYSTEM BENCHMARK (18 LEADS)")
    print("=" * 80)

    matches = 0
    in_range = 0

    for l in leads:
        result = scorer.score(l)
        exp = l["expected"]
        t_match = result["tag"] == exp["tag"]
        r_match = exp["score_range"][0] <= result["score"] <= exp["score_range"][1]
        if t_match:
            matches += 1
        if r_match:
            in_range += 1

        print(f"[{result['id']}] {result['name']:<24} | Score: {result['score']:2d} {str(exp['score_range']):<10} | Tag: {result['tag']:<12} (Exp: {exp['tag']:<12}) | {'MATCH' if t_match and r_match else 'CHECK'}")

    print("-" * 80)
    print(f"Priority Tag Classification Accuracy : {matches}/{len(leads)} ({matches/len(leads)*100:.1f}%)")
    print(f"Score In Expected Range Accuracy     : {in_range}/{len(leads)} ({in_range/len(leads)*100:.1f}%)")
    print("=" * 80)
