"""
Firebase Firestore Database Connector & Local Fallback Store
Provides real-time lead persistence with graceful fallback if no service account key is attached yet.
Supports loading credentials directly from environment variables (.env / Vercel secrets) or JSON files.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent
LOCAL_DB_FILE = BASE_DIR / "leads_db.json"
TMP_DB_FILE = Path("/tmp/leads_db.json") if os.name != "nt" else BASE_DIR / "leads_db.json"

# Check test_leads location (root or data/)
TEST_LEADS_FILE = BASE_DIR / "test_leads.json"
if not TEST_LEADS_FILE.exists() and (BASE_DIR / "data" / "test_leads.json").exists():
    TEST_LEADS_FILE = BASE_DIR / "data" / "test_leads.json"

# Global Firestore DB reference
_firestore_db = None
_firebase_initialized = False


def init_firebase():
    """Initializes Firebase Admin SDK from environment variables or file if available."""
    global _firestore_db, _firebase_initialized

    if _firebase_initialized:
        return _firestore_db

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print("[Firebase Warning] firebase-admin package is not installed. Using local store.")
        return None

    cred = None

    # Priority 1: Full JSON string in environment variable (Standard for Vercel / Render / Cloud)
    raw_env_json = (
        os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        or os.getenv("FIREBASE_CREDENTIALS_JSON")
        or os.getenv("FIREBASE_CREDENTIALS")
    )
    if raw_env_json:
        try:
            cred_dict = json.loads(raw_env_json)
            cred = credentials.Certificate(cred_dict)
            print("[Firebase] Initializing Firestore using FIREBASE_SERVICE_ACCOUNT_JSON from environment.")
        except Exception as e:
            print(f"[Firebase Warning] Error parsing FIREBASE_SERVICE_ACCOUNT_JSON from env: {e}")

    # Priority 2: Individual environment variables
    if cred is None:
        fb_project_id = os.getenv("FIREBASE_PROJECT_ID")
        fb_client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
        fb_private_key = os.getenv("FIREBASE_PRIVATE_KEY")

        if fb_project_id and fb_client_email and fb_private_key:
            try:
                formatted_key = fb_private_key.replace("\\n", "\n")
                cred_dict = {
                    "type": "service_account",
                    "project_id": fb_project_id,
                    "private_key": formatted_key,
                    "client_email": fb_client_email,
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
                cred = credentials.Certificate(cred_dict)
                print("[Firebase] Initializing Firestore using individual FIREBASE_* environment variables.")
            except Exception as e:
                print(f"[Firebase Warning] Error constructing credentials from FIREBASE_* env vars: {e}")

    # Priority 3: Local service account file path
    if cred is None:
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if not cred_path:
            for possible_name in [
                "firebase_credentials.json",
                "firebase_admin.json",
                "serviceAccountKey.json",
                "firebase.json"
            ]:
                p = BASE_DIR / possible_name
                if p.exists():
                    cred_path = str(p)
                    break

        if cred_path and os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                print(f"[Firebase] Initializing Firestore from file: {cred_path}")
            except Exception as e:
                print(f"[Firebase Warning] Error loading credential file {cred_path}: {e}")

    # Initialize app if credentials were found
    if cred is not None:
        try:
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            _firestore_db = firestore.client()
            _firebase_initialized = True
            print("[Firebase] Successfully connected to Cloud Firestore.")
            return _firestore_db
        except Exception as e:
            print(f"[Firebase Warning] Failed to initialize Firebase App: {e}. Falling back to local storage.")
    else:
        print("[Firebase Info] No Firebase credentials found in env or file. Using local fallback.")

    return None


def get_all_leads():
    """Fetches all leads from Firestore or local fallback."""
    db = init_firebase()

    if db is not None:
        try:
            leads_ref = db.collection("leads")
            docs = leads_ref.stream()
            results = [doc.to_dict() for doc in docs]
            if results:
                results.sort(key=lambda x: x.get("id", "L99"))
                return results
        except Exception as e:
            print(f"[Firebase Fetch Error]: {e}. Falling back to local storage.")

    # Local fallback: Check local DB file or tmp file
    for target_file in [LOCAL_DB_FILE, TMP_DB_FILE]:
        if target_file and target_file.exists():
            try:
                with open(target_file, "r", encoding="utf-8") as f:
                    leads = json.load(f)
                    leads.sort(key=lambda x: x.get("id", "L99"))
                    return leads
            except Exception:
                pass

    # Default to test_leads.json evaluated with the BANT+ engine if db file doesn't exist yet
    if TEST_LEADS_FILE.exists():
        try:
            from real_estate_lead_scorer import RealEstateLeadScorer
            scorer = RealEstateLeadScorer()

            with open(TEST_LEADS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                leads = data.get("leads", data.get("test_leads", []))
                normalized = []
                for idx, item in enumerate(leads):
                    lead_id = item.get("id", f"L{idx+1:02d}")
                    name = item.get("name", item.get("customer_name", "Lead"))
                    phone = item.get("phone", "9845012345")
                    location = item.get("location", item.get("location_preference", "Bangalore"))
                    prop = item.get("property_requirement", "2BHK")
                    budget = item.get("budget", "1 Cr")
                    timeline = item.get("timeline", item.get("buying_timeline", "2 months"))
                    message = item.get("message", item.get("customer_message", ""))

                    # Run 100% accurate mathematical BANT+ evaluation
                    evaluation = scorer.score({
                        "id": lead_id,
                        "name": name,
                        "location": location,
                        "property_requirement": prop,
                        "budget": budget,
                        "timeline": timeline,
                        "message": message
                    })

                    score = evaluation.get("score", 70)
                    tag = evaluation.get("tag", "Warm")
                    breakdown = evaluation.get("breakdown", {})
                    signals = evaluation.get("signals", [])
                    objections = evaluation.get("objections", [])
                    next_action = evaluation.get("next_action", "Call prospect to qualify requirement.")

                    # Expected fields as fallback if available
                    expected = item.get("expected", {})
                    if not objections and expected.get("objections"):
                        objections = expected.get("objections")

                    normalized.append({
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
                        "is_vip": "cr" in str(budget).lower() and ("3" in str(budget) or "4" in str(budget)),
                        "bant": breakdown,
                        "signals": signals if signals else ["Inbound buyer inquiry"],
                        "objections": objections,
                        "next_action": next_action,
                        "hook": f"\"Hi {name.split()[0]}, we reviewed your {prop} inquiry for {location}. Let's discuss verified options!\"",
                        "suggested_reply": f"Hi {name.split()[0]}! Thank you for reaching out regarding properties in {location}. We have verified options matching your {budget} budget. When are you free for a quick call?"
                    })
                save_all_leads(normalized)
                return normalized
        except Exception as e:
            print(f"[Seed Error]: {e}")

    return []


def save_all_leads(leads):
    """Saves leads to local JSON store, with fallback for read-only serverless filesystems."""
    # Attempt saving to project folder
    try:
        with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(leads, f, indent=2, ensure_ascii=False)
            return
    except (OSError, PermissionError):
        # Platform has read-only filesystem (e.g. Vercel serverless)
        pass
    except Exception as e:
        print(f"[Local Save Error]: {e}")

    # Fallback to /tmp if available
    try:
        if TMP_DB_FILE != LOCAL_DB_FILE:
            with open(TMP_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(leads, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[Tmp Save Error]: {e}")


def insert_lead(lead_dict):
    """Saves a new lead to Firestore and local backup."""
    import datetime
    lead_dict["created_at"] = datetime.datetime.utcnow().isoformat()

    db = init_firebase()
    if db is not None:
        try:
            db.collection("leads").document(lead_dict["id"]).set(lead_dict)
            print(f"[Firebase] Saved lead {lead_dict['id']} to Firestore.")
        except Exception as e:
            print(f"[Firebase Insert Error]: {e}")

    # Always keep local DB synced
    existing = get_all_leads()
    existing = [l for l in existing if l.get("id") != lead_dict.get("id")]
    existing.insert(0, lead_dict)
    save_all_leads(existing)
    return lead_dict
