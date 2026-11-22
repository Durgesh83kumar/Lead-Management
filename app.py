"""
Flask Web Application Backend
Real Estate Inbound Lead Prioritization & Management System
"""

import os
import csv
import io
import json
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import firebase_config
import ai_service
from real_estate_lead_scorer import RealEstateLeadScorer

load_dotenv()

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

scorer = RealEstateLeadScorer()

# Load properties catalog
PROPERTIES_FILE = os.path.join(os.path.dirname(__file__), "data", "properties.json")
if not os.path.exists(PROPERTIES_FILE):
    PROPERTIES_FILE = os.path.join(os.path.dirname(__file__), "properties.json")
def load_properties():
    try:
        if os.path.exists(PROPERTIES_FILE):
            with open(PROPERTIES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Error reading properties.json: {e}")
    return []

PROPERTIES_CATALOG = load_properties()

def calculate_lead_score(scorer_input):
    # Normalize keys so RealEstateLeadScorer gets location, timeline, message, etc.
    normalized = {
        "id": scorer_input.get("id", "L00"),
        "name": scorer_input.get("name") or scorer_input.get("customer_name", "Lead"),
        "phone": scorer_input.get("phone", "9876543210"),
        "location": scorer_input.get("location") or scorer_input.get("location_preference", "Bangalore"),
        "property_requirement": scorer_input.get("property_requirement", "2BHK"),
        "budget": scorer_input.get("budget", "1 Cr"),
        "timeline": scorer_input.get("timeline") or scorer_input.get("buying_timeline", "2 months"),
        "message": scorer_input.get("message") or scorer_input.get("customer_message", "")
    }
    res = scorer.score(normalized)
    return {
        "lead_score": res.get("score", 50),
        "priority_tier": res.get("tag", "Warm"),
        "breakdown": res.get("breakdown", {}),
        "reasons": res.get("signals", [])
    }


@app.route("/")
def index():
    """Serves the main single page dashboard."""
    return render_template("index.html")


@app.route("/api/leads", methods=["GET"])
def get_leads():
    """Retrieves all prioritized leads."""
    leads = firebase_config.get_all_leads()
    return jsonify({"success": True, "count": len(leads), "leads": leads})


@app.route("/api/leads", methods=["POST"])
def intake_lead():
    """Intakes a new lead, runs BANT+ scoring, calls Gemini AI, and persists to DB."""
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    location = data.get("location", "").strip()
    prop_req = data.get("property_requirement", "").strip()
    budget = data.get("budget", "").strip()
    timeline = data.get("timeline", "").strip()
    message = data.get("message", "").strip()

    if not name or not message:
        return jsonify({"success": False, "error": "Name and Customer Message are required."}), 400

    # 1. Run 100% Deterministic Mathematical BANT+ Engine
    scorer_input = {
        "customer_name": name,
        "phone": phone,
        "location_preference": location,
        "property_requirement": prop_req,
        "budget": budget,
        "buying_timeline": timeline,
        "customer_message": message
    }
    scoring_result = calculate_lead_score(scorer_input)
    score = scoring_result.get("lead_score", 50)
    tag = scoring_result.get("priority_tier", "Warm")
    bant = scoring_result.get("breakdown", {})

    # 2. Call Gemini AI for synthesis (or fallback)
    ai_intel = ai_service.generate_lead_intelligence(
        name, location, prop_req, budget, timeline, message, score, tag
    )

    # 3. Form final lead record
    existing_leads = firebase_config.get_all_leads()
    max_num = 0
    for l in existing_leads:
        lid = str(l.get("id", ""))
        if lid.startswith("L"):
            try:
                num = int(lid[1:])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    lead_id = f"L{max(max_num + 1, len(existing_leads) + 1):02d}"

    is_vip = False
    lower_b = budget.lower()
    if "cr" in lower_b:
        try:
            num = float("".join([c for c in lower_b.split("cr")[0] if c.isdigit() or c == "."]))
            if num >= 3.0:
                is_vip = True
        except Exception:
            pass

    lead_record = {
        "id": lead_id,
        "name": name,
        "phone": phone or "9876543210",
        "location": location,
        "property_requirement": prop_req,
        "budget": budget,
        "timeline": timeline,
        "message": message,
        "score": score,
        "tag": tag,
        "is_vip": is_vip,
        "bant": bant,
        "signals": ai_intel.get("signals", scoring_result.get("reasons", [])),
        "objections": ai_intel.get("objections", []),
        "next_action": ai_intel.get("next_action", "Call prospect to schedule viewing"),
        "hook": ai_intel.get("hook", f"Hi {name.split()[0]}, we reviewed your {prop_req} inquiry for {location}."),
        "suggested_reply": ai_intel.get("suggested_reply", f"Hi {name.split()[0]}! Thank you for reaching out.")
    }

    # 4. Save to Firestore / local DB
    saved_lead = firebase_config.insert_lead(lead_record)
    return jsonify({"success": True, "lead": saved_lead}), 201


@app.route("/api/properties", methods=["GET"])
def get_properties():
    """Retrieves all developer properties in the catalog."""
    catalog = load_properties() or PROPERTIES_CATALOG
    return jsonify({"success": True, "count": len(catalog), "properties": catalog})


@app.route("/api/properties/match/<lead_id>", methods=["GET"])
def match_properties_for_lead(lead_id):
    """Matches and ranks properties for a specific lead based on locality, BHK, budget, and timeline."""
    leads = firebase_config.get_all_leads()
    lead = next((l for l in leads if l.get("id") == lead_id), None)
    if not lead:
        return jsonify({"success": False, "error": "Lead not found"}), 404

    catalog = load_properties() or PROPERTIES_CATALOG
    matched = match_properties_to_lead(lead, catalog)
    return jsonify({"success": True, "lead_id": lead_id, "matches": matched})


def parse_budget_lakhs(budget_str):
    if not budget_str:
        return 0
    s = budget_str.lower().replace(",", "").strip()
    try:
        if "cr" in s:
            num = float("".join([c for c in s.split("cr")[0] if c.isdigit() or c == "."]))
            return num * 100
        if "l" in s:
            num = float("".join([c for c in s.split("l")[0] if c.isdigit() or c == "."]))
            return num
    except Exception:
        pass
    return 0


def match_properties_to_lead(lead, catalog):
    lead_loc = lead.get("location", "").lower()
    lead_prop = lead.get("property_requirement", "").lower()
    lead_budget_lakhs = parse_budget_lakhs(lead.get("budget", ""))
    lead_timeline = lead.get("timeline", "").lower()

    scored_matches = []
    for prop in catalog:
        score = 0
        reasons = []

        # 1. Location match (up to 35 pts)
        prop_loc = prop.get("location", "").lower()
        prop_area = prop.get("area_locality", "").lower()
        if prop_loc in lead_loc or lead_loc in prop_loc or prop_area in lead_loc:
            score += 35
            reasons.append(f"Direct location match in {prop.get('location')}")
        elif "bangalore" in lead_loc:
            score += 20
            reasons.append("City-wide alignment")

        # 2. BHK / Configuration match (up to 30 pts)
        prop_bhk = prop.get("bhk", "").lower()
        if prop_bhk in lead_prop:
            score += 30
            reasons.append(f"Exact {prop.get('bhk')} configuration")
        elif ("2" in lead_prop and "2bhk" in prop_bhk) or ("3" in lead_prop and "3bhk" in prop_bhk):
            score += 30
            reasons.append(f"{prop.get('bhk')} configuration match")
        elif "plot" in lead_prop and "plot" in prop.get("property_type", "").lower():
            score += 30
            reasons.append("Residential plot match")

        # 3. Budget Fit (up to 25 pts)
        prop_price = prop.get("price_lakhs", 0)
        if lead_budget_lakhs > 0 and prop_price > 0:
            diff_ratio = abs(prop_price - lead_budget_lakhs) / lead_budget_lakhs
            if diff_ratio <= 0.10:
                score += 25
                reasons.append(f"Within 10% of budget ({prop.get('price_str')})")
            elif diff_ratio <= 0.20:
                score += 18
                reasons.append(f"Within 20% budget band ({prop.get('price_str')})")
            elif prop_price <= lead_budget_lakhs:
                score += 20
                reasons.append(f"Under budget ceiling ({prop.get('price_str')})")
            else:
                score += 8
        else:
            score += 15

        # 4. Possession / OC Fit (up to 10 pts)
        possession = prop.get("possession", "").lower()
        if "ready" in lead_timeline or "immediate" in lead_timeline or "1 month" in lead_timeline:
            if "ready to move" in possession:
                score += 10
                reasons.append("Ready to move with OC received")
        else:
            score += 8

        scored_matches.append({
            "property": prop,
            "match_score": min(score, 100),
            "reasons": reasons
        })

    # Sort descending by match_score
    scored_matches.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_matches[:3]


@app.route("/api/copilot", methods=["POST"])
def copilot_chat():
    """Contextual conversational copilot grounded in a specific lead."""
    data = request.get_json() or {}
    lead_id = data.get("lead_id")
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"success": False, "error": "Question is required."}), 400

    leads = firebase_config.get_all_leads()
    target_lead = next((l for l in leads if l.get("id") == lead_id), None)
    if not target_lead and leads:
        target_lead = leads[0]

    reply = ai_service.run_copilot_chat(target_lead or {}, question)
    return jsonify({"success": True, "answer": reply})


@app.route("/api/import-csv", methods=["POST"])
def import_csv():
    """Batch imports leads from CSV, calculating BANT+ score and skipping duplicates."""
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400

    file = request.files["file"]
    try:
        content = file.stream.read().decode("utf-8-sig", errors="replace")
        stream = io.StringIO(content, newline=None)
        csv_reader = csv.DictReader(stream)
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to parse CSV: {str(e)}"}), 400

    existing_leads = firebase_config.get_all_leads()
    existing_names = {l.get("name", "").strip().lower() for l in existing_leads if l.get("name")}
    existing_phones = {l.get("phone", "").strip() for l in existing_leads if l.get("phone")}

    imported = []
    skipped = 0

    for row in csv_reader:
        if not row:
            continue
        # Support case-insensitive headers
        row_clean = {k.strip().lower(): v.strip() for k, v in row.items() if k}
        name = row_clean.get("name") or row_clean.get("customer_name", "Lead")
        phone = row_clean.get("phone") or "9876543210"
        location = row_clean.get("location") or row_clean.get("location_preference", "Bangalore")
        prop = row_clean.get("property requirement") or row_clean.get("property_requirement", "2BHK")
        budget = row_clean.get("budget", "1 Cr")
        timeline = row_clean.get("buying timeline") or row_clean.get("buying_timeline") or row_clean.get("timeline", "2 months")
        message = row_clean.get("message") or row_clean.get("customer_message", "Inquiry")

        if not name or name == "Lead" and not message:
            continue

        # De-duplicate: skip if lead name or phone already exists
        if name.lower() in existing_names or (phone and phone != "9876543210" and phone in existing_phones):
            skipped += 1
            continue

        existing_names.add(name.lower())
        if phone:
            existing_phones.add(phone)

        scorer_input = {
            "customer_name": name,
            "phone": phone,
            "location_preference": location,
            "property_requirement": prop,
            "budget": budget,
            "buying_timeline": timeline,
            "customer_message": message
        }
        res = calculate_lead_score(scorer_input)
        score = res.get("lead_score", 50)
        tag = res.get("priority_tier", "Warm")

        lead_id = f"L{len(existing_leads) + len(imported) + 1:02d}"
        
        # Check VIP status
        is_vip = False
        lower_b = budget.lower()
        if "cr" in lower_b:
            try:
                num = float("".join([c for c in lower_b.split("cr")[0] if c.isdigit() or c == "."]))
                if num >= 2.5:
                    is_vip = True
            except Exception:
                pass

        item = {
            "id": lead_id,
            "name": name,
            "phone": phone,
            "location": location,
            "property_requirement": prop,
            "budget": budget,
            "timeline": timeline,
            "message": message,
            "score": score,
            "tag": tag,
            "is_vip": is_vip,
            "bant": res.get("breakdown", {}),
            "signals": res.get("reasons", ["Imported via CSV", f"Budget {budget}"]),
            "objections": [],
            "next_action": "Contact lead via WhatsApp to confirm site visit.",
            "hook": f"Hi {name.split()[0]}, we reviewed your {prop} inquiry for {location}.",
            "suggested_reply": f"Hi {name.split()[0]}! Thank you for reaching out regarding {prop} in {location}. We have verified options matching your {budget} budget. When are you free for a quick call?"
        }
        firebase_config.insert_lead(item)
        imported.append(item)

    return jsonify({
        "success": True,
        "imported_count": len(imported),
        "skipped_count": skipped,
        "message": f"Successfully imported {len(imported)} new unique lead(s)" + (f" ({skipped} duplicate(s) skipped)." if skipped else ".")
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
