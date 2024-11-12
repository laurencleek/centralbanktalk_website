import os
import numpy as np
import torch
import pandas as pd
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from umap import UMAP
import os
import umap as UMAP
from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS
from scipy.cluster import hierarchy as sch
import torch
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
        if len(timestamps.shape) == 1:
            timestamps = timestamps.unsqueeze(1)  # Ensure shape (N, 1)
        linear_part = self.linear(timestamps)
        periodic_part = torch.sin(timestamps * self.freqs.unsqueeze(0))
        return torch.cat([linear_part, periodic_part], dim=1)
    
sample_fraction = 0.3  # Use 30% of the data as a sample
all_speeches = all_speeches.sample(frac=sample_fraction, random_state=42).reset_index(drop=True)

def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep meaningful punctuation
    text = re.sub(r'[^\w\s.,!?]', '', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

# Load or create topic model with time-sensitive embeddings
if os.path.exists(model_path):
    print("Loading existing topic model...")
    model = BERTopic.load(model_path)
else:
    print("Running topic modeling (this may take up to 11 hours depending on your computer)...")

    # Prepare documents
    docs = all_speeches.speech_text.to_list()

    # Remove stop words from each document

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
    docs = [preprocess_text(doc) for doc in all_speeches['speech_text']]
    docs = [' '.join([word for word in doc.split() if word.lower() not in extended_stop_words]) for doc in all_speeches['speech_text']]

    
    # Set up sentence transformer and compute text embeddings
    embedding_model = SentenceTransformer("all-mpnet-base-v2")
    text_embeddings = embedding_model.encode(
        docs, 
        show_progress_bar=True,
        batch_size=32,  # Adjust based on your available memory
        device="cuda" if torch.cuda.is_available() else "cpu",  # Use GPU if available
        convert_to_numpy=True,  # For faster processing if you don't need torch tensors
        normalize_embeddings=True  # Normalize the embeddings to unit length
    )
    # Prepare Time2Vec embeddings
    # Ensure 'date' column is in datetime64 format
    all_speeches['date'] = pd.to_datetime(all_speeches['date'])

    # Convert to Unix timestamp in seconds as a NumPy array
    timestamps = all_speeches['date'].astype('int64') // 10**9
    timestamps = timestamps.values.astype(np.float32)  # Now a NumPy array of dtype float32

    # Convert to tensor and apply Time2Vec
    time_embedder = Time2Vec(hidden_dim=8)  # Adjust hidden_dim if needed

    # Convert to tensor and apply Time2Vec
    timestamps_tensor = torch.tensor(timestamps, dtype=torch.float32).unsqueeze(1)
    time_embeddings = time_embedder(timestamps_tensor).detach().numpy()
    # Combine text and time embeddings
    combined_embeddings = np.hstack((text_embeddings, time_embeddings))
    
    vectorizer_model = CountVectorizer(
        min_df=5,
        max_df=0.7,
        ngram_range=(1,3),
        stop_words=extended_stop_words,
        max_features=5000
    )

    umap_model = UMAP(
        n_neighbors=15,
        n_components=5,  # Increased for finer topic distinctions
        min_dist=0.1,    # Allows clusters to spread apart
        metric='cosine',
        low_memory=False,
        random_state=1337
)

    # Set up BERTopic with new settings
    model = BERTopic(
        embedding_model=combined_embeddings,
        vectorizer_model=vectorizer_model,
        language="multilingual",
        calculate_probabilities=True,
        verbose=True,
        umap_model=umap_model,
        low_memory=False,
        min_topic_size=20,
        nr_topics='auto',
        diversity=0.5 
    )
    docs = [' '.join([word for word in doc.split() if word not in extended_stop_words]) for doc in docs]
    # Fit BERTopic with combined embeddings
    topics, probs = model.fit_transform(docs, embeddings=combined_embeddings)
    
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


# Convert topic probabilities to a DataFrame
probs_df = pd.DataFrame(probs, columns=[f"Topic_{i}" for i in range(probs.shape[1])])

# Add the topic probabilities to the main DataFrame
all_speeches = all_speeches.reset_index(drop=True)  # Reset index to match probs_df
all_speeches = pd.concat([all_speeches, probs_df], axis=1)

# Resample to get yearly sums for each topic
all_speeches['year'] = all_speeches['date'].dt.year
topic_trends = all_speeches.groupby('year')[probs_df.columns].sum()

# Plot each topic's trend over time
plt.figure(figsize=(12, 8))
for topic_col in probs_df.columns:
    plt.plot(topic_trends.index, topic_trends[topic_col], label=topic_col)

# Customize plot
plt.title("Trends of Topic Categories Over Time")
plt.xlabel("Year")
plt.ylabel("Aggregated Topic Probability")
plt.legend(loc="upper left", bbox_to_anchor=(1, 1))
plt.tight_layout()

# Show the plot
plt.show()


import matplotlib.pyplot as plt

# Step 1: Ensure 'date' column is in datetime format if not already
all_speeches['date'] = pd.to_datetime(all_speeches['date'])

# Step 2: Aggregate topic probabilities by year
all_speeches['year'] = all_speeches['date'].dt.year
topic_trends = all_speeches.groupby('year')[probs_df.columns].sum()

# Step 3: Plot stacked area chart
plt.figure(figsize=(12, 8))
plt.stackplot(
    topic_trends.index, topic_trends.T,  # Transpose to align each topic as a separate layer
    labels=probs_df.columns
)

# Customize plot
plt.title("Trends of Topic Categories Over Time (Stacked)")
plt.xlabel("Year")
plt.ylabel("Aggregated Topic Probability")
plt.legend(loc="upper left", bbox_to_anchor=(1, 1))
plt.tight_layout()

# Show the plot
plt.show()

import matplotlib.pyplot as plt

# Step 1: Ensure 'date' column is in datetime format if not already
all_speeches['date'] = pd.to_datetime(all_speeches['date'])

# Step 2: Aggregate topic probabilities by year
all_speeches['year'] = all_speeches['date'].dt.year
topic_trends = all_speeches.groupby('year')[probs_df.columns].sum()

# Step 3: Normalize the data to make each row sum to 100%
topic_trends_proportion = topic_trends.div(topic_trends.sum(axis=1), axis=0) * 100

# Step 4: Plot stacked area chart as a proportional graph
plt.figure(figsize=(12, 8))
plt.stackplot(
    topic_trends_proportion.index, topic_trends_proportion.T,  # Transpose to align each topic as a separate layer
    labels=probs_df.columns
)

# Customize plot
plt.title("Proportional Trends of Topic Categories Over Time")
plt.xlabel("Year")
plt.ylabel("Percentage of Total Topic Probability")
plt.legend(loc="upper left", bbox_to_anchor=(1, 1))
plt.tight_layout()

# Show the plot
plt.show()


import matplotlib.pyplot as plt

# Step 1: Ensure 'date' column is in datetime format if not already
all_speeches['date'] = pd.to_datetime(all_speeches['date'])

# Step 2: Aggregate topic probabilities by year
all_speeches['year'] = all_speeches['date'].dt.year
topic_trends = all_speeches.groupby('year')[probs_df.columns].sum()

# Step 3: Calculate the proportion of Topic_23 relative to all topics each year
topic_23_proportion = (topic_trends['Topic_23'] / topic_trends.sum(axis=1)) * 100

# Step 4: Plot Topic 23's proportion over time
plt.figure(figsize=(12, 6))
plt.plot(topic_23_proportion.index, topic_23_proportion, label="Topic 23", color="b", marker="o")

# Customize plot
plt.title("Proportional Trend of Topic 23 Over Time")
plt.xlabel("Year")
plt.ylabel("Percentage of Total Topic Probability")
plt.legend(loc="upper left")
plt.tight_layout()

# Show the plot
plt.show()


topic_23_words = model.get_topic(23)
print("Top words for Topic 23:", topic_23_words)

