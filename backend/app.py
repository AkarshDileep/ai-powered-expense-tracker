import os
import json
import threading
import uuid
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path

import bcrypt
import jwt
from dotenv import load_dotenv
from flask import Flask, g, jsonify, request
from flask_cors import CORS

load_dotenv(os.path.join(os.path.dirname(__file__), "config", "dev.env"))

app = Flask(__name__)
CORS(app)


class JsonCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, fields):
        for field, direction in reversed(fields):
            self.documents.sort(
                key=lambda document: document.get(field, ""),
                reverse=direction == -1,
            )
        return self

    def skip(self, count):
        self.documents = self.documents[count:]
        return self

    def limit(self, count):
        if count:
            self.documents = self.documents[:count]
        return self

    def __iter__(self):
        return iter(self.documents)


class JsonCollection:
    def __init__(self, database, name):
        self.database = database
        self.name = name

    @property
    def documents(self):
        return self.database.data.setdefault(self.name, [])

    def find_one(self, query, sort=None):
        matches = [document for document in self.documents if matches_query(document, query)]
        if sort:
            JsonCursor(matches).sort(sort)
        return matches[0] if matches else None

    def find(self, query):
        return JsonCursor([document for document in self.documents if matches_query(document, query)])

    def insert_one(self, document):
        stored = json.loads(json.dumps(document))
        stored["_id"] = str(uuid.uuid4())
        with self.database.lock:
            self.documents.append(stored)
            self.database.save()
        document["_id"] = stored["_id"]
        return type("InsertResult", (), {"inserted_id": stored["_id"]})()

    def update_one(self, query, update):
        with self.database.lock:
            document = next((item for item in self.documents if matches_query(item, query)), None)
            if not document:
                return
            for field, value in update.get("$set", {}).items():
                document[field] = value
            for field, value in update.get("$push", {}).items():
                document.setdefault(field, []).append(value)
            for field, value in update.get("$pull", {}).items():
                document[field] = [item for item in document.get(field, []) if item != value]
            self.database.save()

    def delete_one(self, query):
        with self.database.lock:
            for index, document in enumerate(self.documents):
                if matches_query(document, query):
                    self.documents.pop(index)
                    self.database.save()
                    return

    def delete_many(self, query):
        with self.database.lock:
            self.database.data[self.name] = [
                document for document in self.documents if not matches_query(document, query)
            ]
            self.database.save()


class JsonDatabase:
    def __init__(self, path):
        self.path = Path(path)
        self.lock = threading.RLock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        try:
            self.data = json.loads(self.path.read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError):
            self.data = {"users": [], "inputs": [], "expenses": []}
            self.save()

    def save(self):
        temporary_path = self.path.with_suffix(".tmp")
        temporary_path.write_text(json.dumps(self.data, indent=2), encoding="utf-8")
        temporary_path.replace(self.path)


def matches_query(document, query):
    for field, expected in query.items():
        actual = document.get(field)
        if isinstance(actual, list):
            if expected not in actual:
                return False
        elif actual != expected:
            return False
    return True


json_db_path = os.getenv("JSON_DB_PATH", os.path.join("data", "database.json"))
if not os.path.isabs(json_db_path):
    json_db_path = os.path.join(os.path.dirname(__file__), json_db_path)
database = JsonDatabase(json_db_path)
users = JsonCollection(database, "users")
inputs = JsonCollection(database, "inputs")
expenses = JsonCollection(database, "expenses")

jwt_secret = os.getenv("TOKEN")
if not jwt_secret:
    raise RuntimeError("TOKEN is not configured")


def serialize(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize(item) for key, item in value.items()}
    return value


def public_user(user):
    return serialize({
        key: value for key, value in user.items()
        if key not in {"password", "tokens"}
    })


def issue_token(user_id):
    token = jwt.encode(
        {"_id": str(user_id), "exp": datetime.now(timezone.utc) + timedelta(days=30)},
        jwt_secret,
        algorithm="HS256",
    )
    users.update_one({"_id": user_id}, {"$push": {"tokens": token}})
    return token


def auth_required(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify(error="Authentication failed: Invalid token."), 401
        token = header.removeprefix("Bearer ").strip()
        try:
            payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
            user_id = payload["_id"]
        except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
            return jsonify(error="Authentication failed: Invalid token."), 401

        user = users.find_one({"_id": user_id, "tokens": token})
        if not user:
            return jsonify(error="Authentication failed: User not found."), 401
        g.user = user
        g.token = token
        return handler(*args, **kwargs)

    return wrapped


def request_document(collection, owner_id=None):
    document = dict(request.get_json(silent=True) or {})
    document.pop("_id", None)
    if owner_id is not None:
        document["owner"] = owner_id
    document["createdAt"] = datetime.now(timezone.utc).isoformat()
    document["updatedAt"] = document["createdAt"]
    return document


def find_owned(collection, item_id):
    return collection.find_one({"_id": item_id, "owner": g.user["_id"]})


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/users")
def register_user():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if not username or not email or len(password) < 6:
        return jsonify(error="username, email, and a password of at least 6 characters are required"), 400
    if "password" in password.lower():
        return jsonify(error="The password cannot be 'password'"), 400

    now = datetime.now(timezone.utc).isoformat()
    user = {
        "username": username,
        "email": email,
        "password": bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
        "tokens": [],
        "createdAt": now,
        "updatedAt": now,
    }
    if users.find_one({"email": email}):
        return jsonify(error="Email is already registered"), 400
    result = users.insert_one(user)
    user["_id"] = result.inserted_id
    token = issue_token(result.inserted_id)
    return jsonify(user=public_user(user), token=token), 201


@app.post("/users/login")
def login_user():
    data = request.get_json(silent=True) or {}
    user = users.find_one({"username": data.get("username")})
    password = str(data.get("password", ""))
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify(error="Unable to login"), 400
    return jsonify(user=public_user(user), token=issue_token(user["_id"]))


@app.route("/users/me", methods=["GET", "POST"])
@auth_required
def get_current_user():
    return jsonify(public_user(g.user))


@app.patch("/users/me")
@auth_required
def update_current_user():
    data = request.get_json(silent=True) or {}
    allowed = {"username", "password"}
    if not set(data).issubset(allowed):
        return jsonify(error="Invalid field(s)"), 400
    updates = {"updatedAt": datetime.now(timezone.utc).isoformat()}
    if "username" in data:
        updates["username"] = data["username"]
    if "password" in data:
        password = str(data["password"])
        if len(password) < 6:
            return jsonify(error="Password must be at least 6 characters"), 400
        updates["password"] = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users.update_one({"_id": g.user["_id"]}, {"$set": updates})
    return jsonify(public_user(users.find_one({"_id": g.user["_id"]})))


@app.post("/users/logout")
@auth_required
def logout():
    users.update_one({"_id": g.user["_id"]}, {"$pull": {"tokens": g.token}})
    return jsonify(Message="Logged out successfully")


@app.post("/users/logoutall")
@auth_required
def logout_all():
    users.update_one({"_id": g.user["_id"]}, {"$set": {"tokens": []}})
    return jsonify(Message="Logged out")


@app.delete("/users/me")
@auth_required
def delete_current_user():
    user_id = g.user["_id"]
    users.delete_one({"_id": user_id})
    inputs.delete_many({"owner": user_id})
    expenses.delete_many({"owner": user_id})
    return jsonify(public_user(g.user))


@app.post("/inputs")
@auth_required
def create_input():
    document = request_document(inputs, g.user["_id"])
    result = inputs.insert_one(document)
    document["_id"] = result.inserted_id
    return jsonify(serialize(document)), 201


@app.get("/inputs")
@auth_required
def list_inputs():
    query = {"owner": g.user["_id"]}
    sort = parse_sort(request.args.get("sortby"))
    cursor = inputs.find(query).sort(sort).skip(parse_int(request.args.get("skip"))).limit(parse_int(request.args.get("limit")))
    return jsonify([serialize(item) for item in cursor])


@app.route("/inputs/<item_id>", methods=["GET", "PATCH", "DELETE"])
@auth_required
def input_item(item_id):
    item = find_owned(inputs, item_id)
    if not item:
        return jsonify(error="Invalid id or input not found"), 404
    if request.method == "GET":
        return jsonify(serialize(item))
    if request.method == "DELETE":
        inputs.delete_one({"_id": item["_id"]})
        return jsonify(serialize(item))
    data = request.get_json(silent=True) or {}
    allowed = {"Income", "Limit", "description", "completed"}
    if not set(data).issubset(allowed):
        return jsonify(error="Invalid field(s)"), 400
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    inputs.update_one({"_id": item["_id"]}, {"$set": data})
    return jsonify(serialize(inputs.find_one({"_id": item["_id"]}))), 201


def parse_sort(value):
    if not value:
        return [("createdAt", -1)]
    field, _, direction = value.partition(":")
    return [(field, -1 if direction == "desc" else 1)]


def parse_int(value):
    try:
        return max(0, int(value or 0))
    except ValueError:
        return 0


@app.post("/expense")
@auth_required
def create_expense():
    data = request_document(expenses, g.user["_id"])
    if "Item" in data:
        data["Item"] = str(data["Item"]).lower()
    try:
        data["expense"] = float(data["expense"])
    except (KeyError, TypeError, ValueError):
        return jsonify(error="expense must be a number"), 400
    result = expenses.insert_one(data)
    data["_id"] = result.inserted_id
    return jsonify(serialize(data)), 201


@app.get("/expense")
@auth_required
def list_expenses():
    cursor = expenses.find({"owner": g.user["_id"]}).sort(parse_sort(request.args.get("sortby"))).skip(parse_int(request.args.get("skip"))).limit(parse_int(request.args.get("limit")))
    return jsonify([serialize(item) for item in cursor])


@app.route("/expense/<item_id>", methods=["GET", "PATCH", "DELETE"])
@auth_required
def expense_item(item_id):
    item = find_owned(expenses, item_id)
    if not item:
        return jsonify(error="Invalid id or expense not found"), 404
    if request.method == "GET":
        return jsonify(serialize(item))
    if request.method == "DELETE":
        expenses.delete_one({"_id": item["_id"]})
        return jsonify(serialize(item))
    data = request.get_json(silent=True) or {}
    if not set(data).issubset({"Item", "expense"}):
        return jsonify(error="Invalid field(s)"), 400
    if "expense" in data:
        try:
            data["expense"] = float(data["expense"])
        except (TypeError, ValueError):
            return jsonify(error="expense must be a number"), 400
    data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    expenses.update_one({"_id": item["_id"]}, {"$set": data})
    return jsonify(serialize(expenses.find_one({"_id": item["_id"]}))), 201


def expense_summary(user_id, start=None):
    totals = {}
    overall = 0
    for expense in expenses.find({"owner": user_id}):
        created_at = parse_datetime(expense.get("createdAt"))
        if start and (created_at is None or created_at < start):
            continue
        amount = float(expense.get("expense", 0))
        category = expense.get("Item")
        totals[category] = totals.get(category, 0) + amount
        overall += amount
    return [{"_id": category, "total": total} for category, total in totals.items()], overall


def parse_datetime(value):
    if isinstance(value, datetime):
        return value
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None


@app.get("/totalexpense")
@auth_required
def total_expense():
    categories, total = expense_summary(g.user["_id"])
    return jsonify(byCategory=serialize(categories) or "No items and expenses", overallTotal=total)


@app.get("/range_expense")
@auth_required
def range_expense():
    number_of_days = max(1, parse_int(request.args.get("days")) or 6)
    today = datetime.now(timezone.utc).date()
    start_date = datetime.combine(today - timedelta(days=number_of_days - 1), datetime.min.time(), tzinfo=timezone.utc)
    categories, total = expense_summary(g.user["_id"], start_date)
    totals_by_day = {}
    for expense in expenses.find({"owner": g.user["_id"]}):
        created_at = parse_datetime(expense.get("createdAt"))
        if created_at and created_at >= start_date:
            day = created_at.date().isoformat()
            totals_by_day[day] = totals_by_day.get(day, 0) + float(expense.get("expense", 0))
    by_day = [{"_id": str(start_date.date() + timedelta(days=index)), "total": totals_by_day.get(str(start_date.date() + timedelta(days=index)), 0)} for index in range(number_of_days)]
    return jsonify(byCategory=serialize(categories), overallTotal=total, byDay=by_day)


@app.get("/balance")
@auth_required
def balance():
    _, spent = expense_summary(g.user["_id"])
    limit_document = inputs.find_one({"owner": g.user["_id"]}, sort=[("createdAt", -1)])
    if not limit_document or limit_document.get("Limit") is None:
        return jsonify(error="No spending limit set for this user."), 400
    return jsonify(balance=float(limit_document["Limit"]) - spent)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "3000")), debug=os.getenv("FLASK_DEBUG") == "1")
