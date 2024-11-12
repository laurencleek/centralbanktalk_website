import os
import numpy as np
import torch
import pandas as pd
from bertopic import BERTopic
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer
import umap as UMAP
from umap import UMAP
from scipy.cluster import hierarchy as sch
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from pathlib import Path

    # Define the main directory using Path for cross-platform compatibility
main_dir = Path(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1b")

    # Create the output directory if it doesn't exist
output_dir = main_dir / 'output'
output_dir.mkdir(parents=True, exist_ok=True)

### Step 2: loading and processing speeches
    # Load the speeches data
speeches_file = main_dir / 'data' / 'speeches_all_country_data_except_vdem.parquet'
all_speeches = pd.read_parquet(speeches_file)

    # change date format 
all_speeches['date'] = pd.to_datetime(all_speeches['date']).dt.date
all_speeches['year'] = all_speeches['year'].astype(int)

# Define paths
model_path = r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\website\my_topics_model_all_CB"
topic_info_path = os.path.join(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\website\cb_speeches_website", "topic_info_new.xlsx")

# Define custom Time2Vec class
class Time2Vec(torch.nn.Module):
    def __init__(self, hidden_dim):
        super(Time2Vec, self).__init__()
        self.hidden_dim = hidden_dim
        self.linear = torch.nn.Linear(1, hidden_dim)
        self.freqs = torch.nn.Parameter(torch.randn(hidden_dim))

    def forward(self, timestamps):
        timestamps = timestamps.unsqueeze(1)  # Add extra dimension for linear layer
        linear_part = self.linear(timestamps)
        periodic_part = torch.sin(timestamps * self.freqs)
        return torch.cat([linear_part, periodic_part], dim=1)



# Load or create topic model with time-sensitive embeddings
if os.path.exists(model_path):
    print("Loading existing topic model...")
    model = BERTopic.load(model_path)
else:
    print("Running topic modeling (this may take up to 11 hours depending on your computer)...")

    # Prepare documents
    docs = all_speeches.speech_text.to_list()
    
    # Set up sentence transformer and compute text embeddings
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    text_embeddings = embedding_model.encode(
        docs, 
        show_progress_bar=True,
        batch_size=32,  # Adjust based on your available memory
        device="cuda" if torch.cuda.is_available() else "cpu",  # Use GPU if available
        convert_to_numpy=True,  # For faster processing if you don't need torch tensors
        normalize_embeddings=True  # Normalize the embeddings to unit length
    )
    np.save(os.path.join(output_dir, "text_embeddings.npy"), text_embeddings)
    
    # Prepare Time2Vec embeddings
    # Ensure 'date' column is in datetime64 format
    all_speeches['date'] = pd.to_datetime(all_speeches['date'])

    # Convert to Unix timestamp
    timestamps = all_speeches['date'].view(np.int64) // 10**9  # Convert dates to Unix timestamp (seconds)    time_embedder = Time2Vec(hidden_dim=16)  # Adjust hidden_dim if needed
    time_embedder = Time2Vec(hidden_dim=16)  # Adjust hidden_dim if needed
    time_embeddings = time_embedder(torch.tensor(timestamps).float()).detach().numpy()
    np.save(os.path.join(output_dir, "time_embeddings.npy"), time_embeddings)

    
    # Combine text and time embeddings
    combined_embeddings = np.hstack((text_embeddings, time_embeddings))
    
    # Set up extended stop words and vectorizer model
    extended_stop_words = [
        "the", "of", "to", "and", "a", "in", "is", "it", "you", "that", "he", "was", "for", "on", "are", "with", "as", "I", "his", "they",
        "be", "at", "one", "have", "this", "from", "or", "had", "by", "not", "word", "but", "what", "some", "we", "can", "out", "other", "were", "all",
        "there", "when", "up", "use", "your", "how", "said", "an", "each", "she", "which", "do", "their", "time", "if", "will", "way", "about", "many", "then",
        "them", "write", "would", "like", "so", "these", "her", "long", "make", "thing", "see", "him", "two", "has", "look", "more", "day", "could", "go", "come",
        "did", "number", "sound", "no", "most", "people", "my", "over", "know", "water", "than", "call", "first", "who", "may", "down", "side", "been", "now", "find",
        "any", "new", "work", "part", "take", "get", "place", "made", "live", "where", "after", "back", "little", "only", "round", "man", "year", "came", "show", "every",
        "good", "me", "give", "our", "under", "name", "very", "through", "just", "form", "sentence", "great", "think", "say", "help", "low", "line", "differ", "turn", "cause",
        "much", "mean", "before", "move", "right", "de", "old", "too", "same", "tell", "does", "set", "three", "want", "air", "well", "also", "play", "small", "end",
        "put", "home", "read", "hand", "port", "large", "spell", "add", "even", "land", "here", "must", "big", "high", "such", "follow", "act", "why", "ask", "men",
        "change", "went", "light", "kind", "off", "need", "house", "picture", "try", "us", "again", "animal", "point", "mother", "world", "near", "build", "self", "earth", "father",
        "therefore", "however", "nevertheless", "nonetheless", "although", "consequently", "furthermore", "moreover", "meanwhile", "whereas", "hereby", "thereby", "whereby", "therein", "thereupon",
        "whereupon", "la", "et", "hereto", "hereof", "les", "hereafter", "heretofore", "hereunder", "hereinafter", "hereinabove", "hereinbefore", "hereinbelow"
    ]
        # Calculate document count
    # Calculate the number of documents
    n_docs = len(docs)

    # Set min_df to ensure a minimum number of documents (at least 5 or 1% of n_docs)
    # Calculate min_df based on document count, ensuring a minimum threshold of 5 documents
    min_df = max(5, int(0.01 * n_docs))

    # Dynamically adjust max_df relative to min_df, aiming for a sensible proportion of total docs
    # This avoids conflicts by setting a minimum gap between min_df and max_df.
    if n_docs > 100:  # For larger datasets, use a high proportion (e.g., up to 85%)
        max_df = min(0.85, max(min_df / n_docs + 0.1, 0.5))
    else:  # For smaller datasets, lower max_df to avoid excessive filtering
        max_df = min(0.5, max(min_df / n_docs + 0.2, 0.3))

    # Initialize CountVectorizer with dynamic min_df and max_df
    vectorizer_model = CountVectorizer(
        min_df=min_df, 
        max_df=max_df,
        ngram_range=(2, 4), 
        stop_words=extended_stop_words,
        max_features=5000
    )


    # Set up UMAP for dimensionality reduction
    umap_model = UMAP(
        n_neighbors=15,
        n_components=5,
        min_dist=0.01,
        metric='cosine',
        low_memory=True,
        random_state=1337
    )

    # Set up BERTopic with defined settings
    model = BERTopic(
        embedding_model=embedding_model,
        vectorizer_model=vectorizer_model,
        language="multilingual",
        calculate_probabilities=True,
        verbose=True,
        umap_model=umap_model,
        low_memory=False,
        min_topic_size=16
    )
    
    # Fit BERTopic with combined embeddings
    topics, probs = model.fit_transform(docs, embeddings=text_embeddings)
    
    # Reduce outliers
    new_topics = model.reduce_outliers(docs, topics, strategy="c-tf-idf", threshold=0.2)
    new_topics = model.reduce_outliers(docs, new_topics, probabilities=probs, threshold=0.05, strategy="probabilities")
    model.update_topics(docs, topics=new_topics)
    
    # Save topic information to Excel
    topic_info = model.get_topic_info()
    topic_info.to_excel(topic_info_path, index=False)
    print(f"Topic info saved to {topic_info_path}")

    # Save the model for future use
    model.save(model_path)
    print(f"Model saved to {model_path}")



import os
import numpy as np
import torch
import pandas as pd
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer
from umap import UMAP
from pathlib import Path

# Define the main directory using Path for cross-platform compatibility
main_dir = Path(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1b")

# Create the output directory if it doesn't exist
output_dir = main_dir / 'output'
output_dir.mkdir(parents=True, exist_ok=True)

# Step 2: Load and process speeches data
speeches_file = main_dir / 'data' / 'speeches_all_country_data_except_vdem.parquet'
all_speeches = pd.read_parquet(speeches_file)

# Change date format
all_speeches['date'] = pd.to_datetime(all_speeches['date']).dt.date
all_speeches['year'] = all_speeches['year'].astype(int)

# Define paths
model_path = r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\website\my_topics_model_all_CB"
topic_info_path = os.path.join(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\website\cb_speeches_website", "topic_info_new.xlsx")

# Custom Time2Vec class
class Time2Vec(torch.nn.Module):
    def __init__(self, hidden_dim):
        super(Time2Vec, self).__init__()
        self.hidden_dim = hidden_dim
        self.linear = torch.nn.Linear(1, hidden_dim)
        self.freqs = torch.nn.Parameter(torch.randn(hidden_dim))

    def forward(self, timestamps):
        timestamps = timestamps.unsqueeze(1)
        linear_part = self.linear(timestamps)
        periodic_part = torch.sin(timestamps * self.freqs)
        return torch.cat([linear_part, periodic_part], dim=1)

# Load or create topic model with improved settings
if os.path.exists(model_path):
    print("Loading existing topic model...")
    model = BERTopic.load(model_path)
else:
    print("Running topic modeling...")

    # Prepare documents
    docs = all_speeches.speech_text.to_list()
    
    # Set up sentence transformer and compute text embeddings
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    text_embeddings = embedding_model.encode(
        docs, 
        show_progress_bar=True,
        batch_size=32,
        device="cuda" if torch.cuda.is_available() else "cpu",
        convert_to_numpy=True,
        normalize_embeddings=True
    )
    
    # Prepare Time2Vec embeddings
    all_speeches['date'] = pd.to_datetime(all_speeches['date'])
    timestamps = all_speeches['date'].view(np.int64) // 10**9
    time_embedder = Time2Vec(hidden_dim=16)
    time_embeddings = time_embedder(torch.tensor(timestamps).float()).detach().numpy()
    
    # Combine text and time embeddings (optional: try only text embeddings first)
    combined_embeddings = np.hstack((text_embeddings, time_embeddings))

    # Enhanced stop words and vectorizer model
    extended_stop_words = [
            "the", "of", "to", "and", "a", "in", "is", "it", "you", "that", "he", "was", "for", "on", "are", "with", "as", "I", "his", "they",
            "be", "at", "one", "have", "this", "from", "or", "had", "by", "not", "word", "but", "what", "some", "we", "can", "out", "other", "were", "all",
            "there", "when", "up", "use", "your", "how", "said", "an", "each", "she", "which", "do", "their", "time", "if", "will", "way", "about", "many", "then",
            "them", "write", "would", "like", "so", "these", "her", "long", "make", "thing", "see", "him", "two", "has", "look", "more", "day", "could", "go", "come",
            "did", "number", "sound", "no", "most", "people", "my", "over", "know", "water", "than", "call", "first", "who", "may", "down", "side", "been", "now", "find",
            "any", "new", "work", "part", "take", "get", "place", "made", "live", "where", "after", "back", "little", "only", "round", "man", "year", "came", "show", "every",
            "good", "me", "give", "our", "under", "name", "very", "through", "just", "form", "sentence", "great", "think", "say", "help", "low", "line", "differ", "turn", "cause",
            "much", "mean", "before", "move", "right", "de", "old", "too", "same", "tell", "does", "set", "three", "want", "air", "well", "also", "play", "small", "end",
            "put", "home", "read", "hand", "port", "large", "spell", "add", "even", "land", "here", "must", "big", "high", "such", "follow", "act", "why", "ask", "men",
            "change", "went", "light", "kind", "off", "need", "house", "picture", "try", "us", "again", "animal", "point", "mother", "world", "near", "build", "self", "earth", "father",
            "therefore", "however", "nevertheless", "nonetheless", "although", "consequently", "furthermore", "moreover", "meanwhile", "whereas", "hereby", "thereby", "whereby", "therein", "thereupon",
            "whereupon", "la", "et", "hereto", "hereof", "les", "hereafter", "heretofore", "hereunder", "hereinafter", "hereinabove", "hereinbefore", "hereinbelow"
        ]
    
    vectorizer_model = CountVectorizer(
        min_df=5,        # Lower min_df to avoid conflict with max_df
        max_df=0.85,       # Increase max_df to include more common terms
        ngram_range=(2, 4), 
        stop_words=extended_stop_words,
        max_features=5000
    )


    # Adjusted UMAP settings
    umap_model = UMAP(
        n_neighbors=10,       # Reduce neighbors for tighter clusters
        n_components=3,       # Use fewer dimensions for simplicity
        min_dist=0.05,        # Slightly higher min_dist for more distinct topics
        metric='cosine',
        random_state=42
    )

    # Set up BERTopic with revised settings
    model = BERTopic(
        embedding_model=embedding_model,
        vectorizer_model=vectorizer_model,
        language="multilingual",
        calculate_probabilities=True,
        verbose=True,
        umap_model=umap_model,
        low_memory=True,           # Enable low memory for larger datasets
        min_topic_size=30          # Increased to filter out less coherent topics
    )
    
    # Fit BERTopic with combined embeddings (or try only text_embeddings for testing)
    topics, probs = model.fit_transform(docs, embeddings=combined_embeddings)
    
    # Update topics with refined outlier strategy
    new_topics = model.reduce_outliers(docs, topics, strategy="c-tf-idf", threshold=0.25)
    model.update_topics(docs, topics=new_topics)
    
    # Save topic information to Excel
    topic_info = model.get_topic_info()
    topic_info.to_excel(topic_info_path, index=False)
    print(f"Topic info saved to {topic_info_path}")

    # Save the model for future use
    model.save(model_path)
    print(f"Model saved to {model_path}")
