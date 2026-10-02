from flask import Flask, render_template, request, jsonify
from faq_data import FAQ_DATA

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


app = Flask(__name__)


# ---------------------------------------------------
# Prepare FAQ questions
# ---------------------------------------------------

questions = [item["question"] for item in FAQ_DATA]

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2)
)

question_vectors = vectorizer.fit_transform(questions)


# ---------------------------------------------------
# Find the best FAQ answer
# ---------------------------------------------------

def get_answer(user_question):

    if not user_question.strip():
        return {
            "answer": "Please enter a question.",
            "confidence": 0,
            "matched_question": ""
        }

    user_vector = vectorizer.transform([user_question])

    similarity_scores = cosine_similarity(
        user_vector,
        question_vectors
    )[0]

    best_index = similarity_scores.argmax()
    best_score = similarity_scores[best_index]

    # Confidence threshold
    if best_score < 0.25:

        return {
            "answer": (
                "I'm sorry, I couldn't find a suitable answer for that "
                "question. Please try asking about placements, eligibility, "
                "aptitude tests, interviews, resumes, internships, or "
                "placement registration."
            ),
            "confidence": round(float(best_score) * 100, 2),
            "matched_question": ""
        }

    return {
        "answer": FAQ_DATA[best_index]["answer"],
        "confidence": round(float(best_score) * 100, 2),
        "matched_question": FAQ_DATA[best_index]["question"]
    }


# ---------------------------------------------------
# Home page
# ---------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# ---------------------------------------------------
# Chat API
# ---------------------------------------------------

@app.route("/ask", methods=["POST"])
def ask():

    data = request.get_json()

    user_question = data.get("question", "")

    result = get_answer(user_question)

    return jsonify(result)


# ---------------------------------------------------
# Run application
# ---------------------------------------------------

if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )