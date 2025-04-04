import os
import faiss
import numpy as np
import pandas as pd
import torch
import pickle
from transformers import AutoModel, AutoTokenizer

# ✅ File Paths
csv_path = "anomalous_emails.csv"  # Change if needed
faiss_index_path = "faiss_index.bin"
embeddings_path = "email_embeddings.npy"
email_texts_path = "email_texts.pkl"

# ✅ Load Email Data
df = pd.read_csv(csv_path)
email_texts = df["cleaned_content_x"].dropna().tolist()  # Remove NaNs

# ✅ Initialize BERT model and tokenizer
MODEL_NAME = "bert-base-uncased"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
bert_model = AutoModel.from_pretrained(MODEL_NAME).to(device)
bert_model.eval()

# ✅ Function to compute BERT embedding
def get_bert_embedding(text):
    """Tokenizes input text and extracts BERT embeddings with mean pooling."""
    tokenized = tokenizer(text, padding="max_length", truncation=True, max_length=154, return_tensors="pt").to(device)
    with torch.no_grad():
        embedding = bert_model(**tokenized).last_hidden_state.mean(dim=1).cpu().numpy()  # Mean pooling
    return embedding

# ✅ Compute and Save Embeddings (If Not Already Saved)
try:
    email_embeddings = np.load(embeddings_path)
    with open(email_texts_path, "rb") as f:
        email_texts = pickle.load(f)
    print("🔄 Loaded existing email embeddings and texts.")

except FileNotFoundError:
    print("🚀 Computing embeddings for the first time...")
    email_embeddings = np.vstack([get_bert_embedding(email) for email in email_texts])
    
    # ✅ Save embeddings & texts
    np.save(embeddings_path, email_embeddings)
    with open(email_texts_path, "wb") as f:
        pickle.dump(email_texts, f)
    print("✅ Saved email embeddings & texts.")

# ✅ Normalize and Store in FAISS
faiss.normalize_L2(email_embeddings)
dimension = email_embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)

# ✅ Load FAISS index (if exists) or create a new one
try:
    faiss.read_index(faiss_index_path)
    print("🔄 Loaded existing FAISS index.")
except:
    index.add(email_embeddings)
    faiss.write_index(index, faiss_index_path)
    print("✅ Created and saved FAISS index.")




# ✅ Function to Find Similar Emails
def find_similar_emails(new_email_text, top_k=5):
    """Finds top K similar emails using FAISS and cosine similarity. Handles empty index errors."""
    
    
    # ✅ File Paths
    csv_path = "../data/anomalous_emails.csv"  # Change if needed
    faiss_index_path = "../storage/faiss_index.bin"
    embeddings_path = "../storage/email_embeddings.npy"
    email_texts_path = "../storage/email_texts.pkl"
    
    if os.path.exists(faiss_index_path):
            os.remove(faiss_index_path)
    
    # ✅ Load Email Data
    df = pd.read_csv(csv_path)
    email_texts = df["cleaned_content_x"].dropna().tolist()  # Remove NaNs

# ✅ Initialize BERT model and tokenizer
    MODEL_NAME = "bert-base-uncased"
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    bert_model = AutoModel.from_pretrained(MODEL_NAME).to(device)
    bert_model.eval()
    
    try:
     email_embeddings = np.load(embeddings_path)
     with open(email_texts_path, "rb") as f:
        email_texts = pickle.load(f)
     print("🔄 Loaded existing email embeddings and texts.")

    except FileNotFoundError:
     print("🚀 Computing embeddings for the first time...")
     email_embeddings = np.vstack([get_bert_embedding(email) for email in email_texts])
    
    # ✅ Save embeddings & texts
     np.save(embeddings_path, email_embeddings)
     with open(email_texts_path, "wb") as f:
        pickle.dump(email_texts, f)
     print("✅ Saved email embeddings & texts.")

# ✅ Normalize and Store in FAISS
    faiss.normalize_L2(email_embeddings)
    dimension = email_embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)

# ✅ Load FAISS index (if exists) or create a new one
    try:
     faiss.read_index(faiss_index_path)
     print("🔄 Loaded existing FAISS index.")
    except:
     index.add(email_embeddings)
     faiss.write_index(index, faiss_index_path)
     print("✅ Created and saved FAISS index.")
    
      
    if index.ntotal == 0:
        print("⚠️ FAISS index is empty! No data to search.")
        return []
    
    # Compute BERT embedding for new email
    new_embedding = get_bert_embedding(new_email_text)
    faiss.normalize_L2(new_embedding)

    # Search in FAISS index
    distances, indices = index.search(new_embedding, min(top_k, index.ntotal))  # Avoid out-of-bounds error

    # Handle case where FAISS returns fewer results
    results = []
    for i, idx in enumerate(indices[0]):
        if idx < len(email_texts):  # Ensure index is valid
            results.append((email_texts[idx], distances[0][i]))

    if not results:
        print("⚠️ No similar emails found.")
    
    return results

# # ✅ Example Usage
# new_email = "letter outraged outraged bad things fault exacerbated outraged exacerbated irreplaceable take seriously irreplaceable fault exacerbated take seriously leave outraged bad things leave bad things outraged outraged outraged fault outraged angry bad things leave angry angry fault notice resignation resignation letter notice position position week letter letter position interview position interview exit thanks resign resign tender interview notice resign"
# similar_emails = find_similar_emails(new_email, top_k=5)

# print("\n🔍 **Top Similar Emails:**")
# for i, (email, score) in enumerate(similar_emails):
#     print(f"\nRank {i+1} | Similarity Score: {score:.4f}\n{email}")