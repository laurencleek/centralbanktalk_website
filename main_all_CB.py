#############################################################
#Who drives who? Examining agenda-setting in central banking#
######################Replication Code#######################
###################Lauren Leek, 26/09/2024###################
#############################################################

#############################################################
################This file consists of 7 steps################
#step 1: loading packages and set-up working space
#step 2: loading and processing speeches
#step 3: topic model
#step 4: merging with other datasets
#step 5: creating figures
#step 6: data analysis (main)
#step 7: data analysis (appendix)
#############################################################
#############################################################

### Step 1: loading packages and set-up working space
import os
import pandas as pd
from bertopic import BERTopic
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
import umap as UMAP
from scipy.cluster import hierarchy as sch
import torch
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from sentence_transformers import SentenceTransformer
import gc
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

###step 3: topic model

model_path = r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1b\output\my_topics_model_all_CB"
    
if os.path.exists(model_path):
    print("Loading existing topic model...")
    model = BERTopic.load(model_path)
else:
    print("Running topic modeling (this may take up to 11 hours depending on your computer)...")
    docs = all_speeches.speech_text.to_list()
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = embedding_model.encode(
        docs, 
        show_progress_bar=True,
        batch_size=32,  # Adjust based on your available memory
        device="cuda" if torch.cuda.is_available() else "cpu",  # Use GPU if available
        convert_to_numpy=True,  # For faster processing if you don't need torch tensors
        normalize_embeddings=True)  # Normalize the embeddings to unit length
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
    # Add this to remove stopwords
    vectorizer_model = CountVectorizer(
        min_df=10, 
        max_df=0.5,  
        ngram_range=(2, 4), 
        stop_words=extended_stop_words,
        max_features=5000  
    )
    # Add this to set seed (reduce dimensionality)
    umap_models = UMAP.UMAP(
        n_neighbors=15,
        n_components=5,
        min_dist=0.01,
        metric='cosine',
        low_memory=False,
        random_state=1337
    )
    # Run BERTopic model, auto topics limit
    model = BERTopic(
        embedding_model=embedding_model,
        vectorizer_model=vectorizer_model,
        language="multilingual",
        calculate_probabilities=True,
        verbose=True,
        umap_model=umap_models,
        #nr_topics="auto",
        low_memory=False,
        min_topic_size=16
    )
    topics, probs = model.fit_transform(docs, embeddings)
    initial_topic_info = model.get_topic_info()
    # Reduce outliers
    new_topics = model.reduce_outliers(docs, topics, strategy="c-tf-idf", threshold=0.2)
    new_topics = model.reduce_outliers(docs, new_topics, probabilities=probs, 
                             threshold=0.05, strategy="probabilities")
    # Update the model with new topics
    model.update_topics(docs, topics=new_topics)
    model.update_topics(docs, vectorizer_model=vectorizer_model)
    # add timestamp for to examine over time change
    timestamps = all_speeches.date.to_list()
    timestamps = pd.to_datetime(timestamps)
    # Extract just the year
    years = [ts.year for ts in timestamps]
    years_series = pd.Series(years)
    years_list = years_series.to_list()
    # Save topic info
    topic_info = model.get_topic_info()
    topic_info_path = os.path.join(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\website\cb_speeches_website", "topic_info_new.xlsx")
    topic_info.to_excel(topic_info_path, index=False)
    print(f"Topic info saved to {topic_info_path}")
    # Save model
    model.save("my_topics_model_all_CB")

### Step 4: merging with other datasets

timestamps = all_speeches.date.to_list()
topics_over_time = model.topics_over_time(all_speeches.speech_text, timestamps, nr_bins=20)

model.visualize_topics_over_time(topics_over_time, topics=[9, 10])



# Visualize the hierarchy using BERTopic's function
model.visualize_hierarchy(hierarchical_topics=hierarchical_topics)


import scipy.cluster.hierarchy as sch
import numpy as np

# Generate hierarchical topics
linkage_function = lambda x: sch.linkage(x, 'single', optimal_ordering=True)
hierarchical_topics = model.hierarchical_topics(all_speeches.speech_text, linkage_function=linkage_function)

# Set target for grouping into approximately 20-25 clusters
desired_clusters = 25

# Determine the distance threshold
if isinstance(hierarchical_topics, np.ndarray):
    distance_threshold = hierarchical_topics[:, 2].max() / desired_clusters
else:
    distance_threshold = hierarchical_topics['Distance'].max() / desired_clusters

# Generate clusters based on the threshold
topic_groups = sch.fcluster(linkage_function(model.topic_embeddings_), t=distance_threshold, criterion='maxclust')

# Create mapping using speech identifiers if they are unique for topics
topic_mapping = {identifier: group for identifier, group in zip(all_speeches['speech_identifier'], topic_groups)}

# Map `grouped_topic` back to `speech_identifier`
all_speeches['grouped_topic'] = all_speeches['speech_identifier'].map(topic_mapping)

# Count missing values in 'grouped_topic' and count unique values
missing_values_count = all_speeches['grouped_topic'].isna().sum()
unique_values_count = all_speeches['grouped_topic'].nunique()

missing_values_count, unique_values_count




topics = model.topics_
probabilities = model.probabilities_

# Assign topics to the existing all_speeches DataFrame
all_speeches['topic'] = [topics[i] for i in all_speeches.index if i < len(topics)]

# Create the DataFrame for topic probabilities
prob_df = pd.DataFrame(probabilities, columns=[f'Topic_{i}' for i in range(probabilities.shape[1])])

# Ensure that all_speeches and prob_df have matching indices
prob_df.index = all_speeches.index

# Concatenate the probability columns to all_speeches without overwriting it
all_speeches = pd.concat([all_speeches, prob_df], axis=1)

all_speeches['year'] = all_speeches['year'].astype(int)
all_speeches['date'] = pd.to_datetime(all_speeches['date'])
all_speeches['quarter'] = all_speeches['date'].dt.to_period('Q')

# Initialize a dictionary to start grouping topics
topic_merging = {
    'Monetary_Policy_Central_Banking': [],
    'Economic_Analysis_Indicators': [],
    'Financial_Markets_Integration': [],
    'Banking_Regulation_Supervision': [],
    'Digital_Finance_Innovation': [],
    'International_Economics_Exchange_Rates': [],
    'Crisis_Management_Stability': [],
    'Sustainable_Finance_Climate': [],
    'Payment_Systems_Cash': [],
    'National_Economy': [],
    'Labor_Markets_Employment': [],
    'Fiscal_Policy_Public_Spending': [],
    'Global_Economic_Outlook': [],
    'Trade_Policy_Commodities': [],
    'Regional_Economies': [],
    'Interest_Rates_Inflation': [],
    'Government_Debt_Sovereign_Risk': [],
    'Economic_Growth_Productivity': [],
    'Financial_Stability_Cybersecurity': [],
    'Housing_Markets_Real_Estate': []
}

# Define categorization criteria based on keywords in 'Name' column
for index, row in topic_info.iterrows():
    topic_id = f"Topic_{row['Topic']}"
    name = row['Name'].lower()
    
    if 'monetary policy' in name or 'central bank' in name or 'interest rate' in name:
        topic_merging['Monetary_Policy_Central_Banking'].append(topic_id)
    elif 'economic indicator' in name or 'gdp' in name or 'cpi' in name:
        topic_merging['Economic_Analysis_Indicators'].append(topic_id)
    elif 'financial market' in name or 'integration' in name or 'stock market' in name:
        topic_merging['Financial_Markets_Integration'].append(topic_id)
    elif 'bank regulation' in name or 'supervision' in name or 'compliance' in name:
        topic_merging['Banking_Regulation_Supervision'].append(topic_id)
    elif 'digital' in name or 'fintech' in name or 'blockchain' in name:
        topic_merging['Digital_Finance_Innovation'].append(topic_id)
    elif 'international' in name or 'exchange rate' in name or 'currency' in name:
        topic_merging['International_Economics_Exchange_Rates'].append(topic_id)
    elif 'crisis management' in name or 'stability' in name or 'risk' in name:
        topic_merging['Crisis_Management_Stability'].append(topic_id)
    elif 'sustainable' in name or 'climate' in name or 'environment' in name:
        topic_merging['Sustainable_Finance_Climate'].append(topic_id)
    elif 'payment' in name or 'cash' in name or 'transaction' in name:
        topic_merging['Payment_Systems_Cash'].append(topic_id)
    elif 'national economy' in name or 'growth' in name:
        topic_merging['National_Economy'].append(topic_id)
    elif 'labor' in name or 'employment' in name or 'job' in name:
        topic_merging['Labor_Markets_Employment'].append(topic_id)
    elif 'fiscal policy' in name or 'spending' in name or 'budget' in name:
        topic_merging['Fiscal_Policy_Public_Spending'].append(topic_id)
    elif 'global' in name or 'world economy' in name or 'outlook' in name:
        topic_merging['Global_Economic_Outlook'].append(topic_id)
    elif 'trade' in name or 'commodity' in name or 'exports' in name:
        topic_merging['Trade_Policy_Commodities'].append(topic_id)
    elif 'regional economy' in name or 'state' in name:
        topic_merging['Regional_Economies'].append(topic_id)
    elif 'inflation' in name or 'price stability' in name or 'interest' in name:
        topic_merging['Interest_Rates_Inflation'].append(topic_id)
    elif 'government debt' in name or 'sovereign risk' in name:
        topic_merging['Government_Debt_Sovereign_Risk'].append(topic_id)
    elif 'productivity' in name or 'innovation' in name or 'economic growth' in name:
        topic_merging['Economic_Growth_Productivity'].append(topic_id)
    elif 'cybersecurity' in name or 'financial stability' in name:
        topic_merging['Financial_Stability_Cybersecurity'].append(topic_id)
    elif 'housing' in name or 'real estate' in name:
        topic_merging['Housing_Markets_Real_Estate'].append(topic_id)
    else:
        # Add uncategorized topics based on category size for balance
        if len(topic_merging['Monetary_Policy_Central_Banking']) < 10:
            topic_merging['Monetary_Policy_Central_Banking'].append(topic_id)
        elif len(topic_merging['Economic_Analysis_Indicators']) < 10:
            topic_merging['Economic_Analysis_Indicators'].append(topic_id)
        elif len(topic_merging['Financial_Markets_Integration']) < 10:
            topic_merging['Financial_Markets_Integration'].append(topic_id)
        elif len(topic_merging['Banking_Regulation_Supervision']) < 10:
            topic_merging['Banking_Regulation_Supervision'].append(topic_id)
        elif len(topic_merging['Digital_Finance_Innovation']) < 10:
            topic_merging['Digital_Finance_Innovation'].append(topic_id)
        elif len(topic_merging['International_Economics_Exchange_Rates']) < 10:
            topic_merging['International_Economics_Exchange_Rates'].append(topic_id)
        elif len(topic_merging['Crisis_Management_Stability']) < 10:
            topic_merging['Crisis_Management_Stability'].append(topic_id)
        elif len(topic_merging['Sustainable_Finance_Climate']) < 10:
            topic_merging['Sustainable_Finance_Climate'].append(topic_id)
        elif len(topic_merging['Payment_Systems_Cash']) < 10:
            topic_merging['Payment_Systems_Cash'].append(topic_id)
        elif len(topic_merging['National_Economy']) < 10:
            topic_merging['National_Economy'].append(topic_id)
        elif len(topic_merging['Labor_Markets_Employment']) < 10:
            topic_merging['Labor_Markets_Employment'].append(topic_id)
        elif len(topic_merging['Fiscal_Policy_Public_Spending']) < 10:
            topic_merging['Fiscal_Policy_Public_Spending'].append(topic_id)
        elif len(topic_merging['Global_Economic_Outlook']) < 10:
            topic_merging['Global_Economic_Outlook'].append(topic_id)
        elif len(topic_merging['Trade_Policy_Commodities']) < 10:
            topic_merging['Trade_Policy_Commodities'].append(topic_id)
        elif len(topic_merging['Regional_Economies']) < 10:
            topic_merging['Regional_Economies'].append(topic_id)
        elif len(topic_merging['Interest_Rates_Inflation']) < 10:
            topic_merging['Interest_Rates_Inflation'].append(topic_id)
        elif len(topic_merging['Government_Debt_Sovereign_Risk']) < 10:
            topic_merging['Government_Debt_Sovereign_Risk'].append(topic_id)
        elif len(topic_merging['Economic_Growth_Productivity']) < 10:
            topic_merging['Economic_Growth_Productivity'].append(topic_id)
        elif len(topic_merging['Financial_Stability_Cybersecurity']) < 10:
            topic_merging['Financial_Stability_Cybersecurity'].append(topic_id)
        elif len(topic_merging['Housing_Markets_Real_Estate']) < 10:
            topic_merging['Housing_Markets_Real_Estate'].append(topic_id)

# Function to redistribute topics to ensure no category is empty
def rebalance_topics(topic_merging):
    empty_categories = [cat for cat, topics in topic_merging.items() if not topics]
    for empty_category in empty_categories:
        for category, topics in topic_merging.items():
            if len(topics) > 5:
                topic_to_move = topics.pop()
                topic_merging[empty_category].append(topic_to_move)
                break
    return topic_merging

# Perform rebalancing
topic_merging = rebalance_topics(topic_merging)

# Display final structured categorization
topic_merging


# Each category represents a broad theme:
# - 'Monetary_Policy_Central_Banking': Topics on central bank policies, interest rates, monetary control.
# - 'Economic_Analysis_Indicators': Economic measures, indicators like GDP, inflation, unemployment.
# - 'Financial_Markets_Integration': Topics on market integration, stock markets, financial networks.
# - 'Banking_Regulation_Supervision': Regulation and oversight of banks, compliance standards.
# - 'Digital_Finance_Innovation': Innovation in finance, including fintech, blockchain, and digital currency.
# - 'International_Economics_Exchange_Rates': Exchange rates, currency stability, international trade impacts.
# - 'Crisis_Management_Stability': Crisis policies, financial stability measures, risk management.
# - 'Sustainable_Finance_Climate': Green finance, climate impact on financial policies, sustainable finance.
# - 'Payment_Systems_Cash': Cash handling, electronic payments, transaction systems.
# - 'National_Economy': Broader economic trends within a country, including growth and policy impacts.
# - 'Labor_Markets_Employment': Employment trends, labor markets, and related economic implications.
# - 'Fiscal_Policy_Public_Spending': Public spending, budgeting, and fiscal policy at government levels.
# - 'Global_Economic_Outlook': Global trends and predictions, world economy, and major international shifts.
# - 'Trade_Policy_Commodities': Trade policies, commodity prices, and market regulations.
# - 'Regional_Economies': Specific regions' economic performance, local policies, and fiscal health.
# - 'Interest_Rates_Inflation': Inflation rates, interest policies, and price stability.
# - 'Government_Debt_Sovereign_Risk': Sovereign debt, national financial health, and risk management.
# - 'Economic_Growth_Productivity': Factors affecting productivity, innovation, and economic growth.
# - 'Financial_Stability_Cybersecurity': Stability and security within financial systems, including cybersecurity.
# - 'Housing_Markets_Real_Estate': Real estate markets, housing prices, and related economic factors.

# Final topic dictionary
filled_topic_merging

# Step 1: Create a dictionary to store summed probabilities per category
# Step 1: Initialize empty columns in all_speeches for each category
for category in topic_merging.keys():
    all_speeches[category] = 0

# Step 2: Sum the probabilities for each category across rows
for category, topics in topic_merging.items():
    # Check if all the topics in the category exist as columns in all_speeches
    relevant_topics = [topic for topic in topics if topic in all_speeches.columns]
    
    # Sum probabilities across relevant topics for each row and assign to the category column
    if relevant_topics:
        all_speeches[category] = all_speeches[relevant_topics].sum(axis=1)

# Step 3: Drop individual topic columns
all_speeches = all_speeches.drop(columns=[col for col in all_speeches.columns if col.startswith('Topic_')])

# Verify the result
print(all_speeches.head())

import matplotlib.pyplot as plt

# Step 1: Ensure 'date' column is in datetime format if not already
all_speeches['date'] = pd.to_datetime(all_speeches['date'])

# Step 2: Resample to get yearly/quarterly sums (e.g., by 'year' or 'quarter')
# For example, yearly resampling:
all_speeches['year'] = all_speeches['date'].dt.year
topic_columns = list(topic_merging.keys())  # Convert dict_keys to list
topic_trends = all_speeches.groupby('year')[topic_columns].sum()

# Step 3: Plot each category over time
plt.figure(figsize=(12, 8))
for category in topic_trends.columns:
    plt.plot(topic_trends.index, topic_trends[category], label=category)

# Customize plot
plt.title("Trends of Topic Categories Over Time")
plt.xlabel("Year")
plt.ylabel("Aggregated Topic Probability")
plt.legend(loc="upper left", bbox_to_anchor=(1, 1))
plt.tight_layout()

# Show the plot
plt.show()

# Convert 'date' to datetime and extract 'year' for yearly aggregation
all_speeches['year'] = all_speeches['date'].dt.year

# Aggregate yearly sums of topic probabilities
topic_columns = list(topic_merging.keys())
topic_trends = all_speeches.groupby('year')[topic_columns].sum()

# Plot each category in a stacked area plot
plt.figure(figsize=(12, 8))
plt.stackplot(topic_trends.index, topic_trends.T, labels=topic_columns)

# Customize plot
plt.title("Trends of Topic Categories Over Time")
plt.xlabel("Year")
plt.ylabel("Aggregated Topic Probability")
plt.legend(loc="upper left", bbox_to_anchor=(1, 1))
plt.tight_layout()

# Show the plot
plt.show()

# Filter the data to start from 1998
topic_trends_normalized_1998 = topic_trends_normalized[topic_trends_normalized.index >= 1998]

# Plot each category as a stacked area plot with proportions, starting from 1998
plt.figure(figsize=(12, 8))
plt.stackplot(topic_trends_normalized_1998.index, topic_trends_normalized_1998.T, labels=topic_columns)

# Customize plot
plt.title("Proportional Trends of Topic Categories Over Time (Starting from 1998)")
plt.xlabel("Year")
plt.ylabel("Proportion of Topic Probability")
plt.legend(loc="upper left", bbox_to_anchor=(1, 1))
plt.tight_layout()

# Show the plot
plt.show()



#ideas: audiences targeted. locations given. topics spread. 
#take one topic and see who initiated it and how it spread.




# Calculate the total sum for each topic category across all rows
topic_totals = all_speeches[topic_columns].sum().sort_values(ascending=False)

# Get the top 5 topics
top_5_topics = topic_totals.head(5)
print("Top 5 Topics:")
print(top_5_topics)


#step 5: creating figures

def create_wordclouds(model, folder_name, num_topics=40):
    def create_wordcloud(model, topic):
        words_weights = model.get_topic(topic)
        print(f"Words and weights for Topic {topic}: {words_weights}")  # Debug statement
        
        if not words_weights or isinstance(words_weights, bool):
            print(f"No valid data for Topic {topic}")  # Debug statement
            return None
        
        word_dict = dict(words_weights)
        
        try:
            wordcloud = WordCloud(width=800, height=400, background_color='white').generate_from_frequencies(word_dict)
            return wordcloud
        except ValueError as e:
            print(f"Error creating wordcloud for Topic {topic}: {e}")  # Debug statement
            return None

    os.makedirs(folder_name, exist_ok=True)

    # Calculate the number of rows and columns needed
    num_cols = 5
    num_rows = (num_topics + num_cols - 1) // num_cols

    # Create subplots with the calculated number of rows and 5 columns
    fig, axes = plt.subplots(num_rows, num_cols, figsize=(num_cols * 10, num_rows * 8))

    # Flatten the axes array for easier indexing
    axes = axes.flatten()

    # Loop to create word clouds for topics
    for i in range(num_topics):
        wordcloud = create_wordcloud(model, i)
        if wordcloud:
            axes[i].imshow(wordcloud, interpolation='bilinear')
        else:
            axes[i].text(0.5, 0.5, f'No data for Topic {i}',
                         horizontalalignment='center',
                         verticalalignment='center',
                         fontsize=12)
        axes[i].axis('off')
        axes[i].set_title(f'Topic {i}')

    # Hide any unused subplots
    for i in range(num_topics, len(axes)):
        axes[i].axis('off')
        axes[i].set_visible(False)

    # Adjust layout and save the figure
    plt.tight_layout()

    file_path = os.path.join(folder_name, 'wordclouds.png')
    plt.savefig(file_path)
    print(f"Figure saved at {file_path}")
    plt.close()




    # Dynamic topic model
    #timestamps = filtered_df['date'].dt.date.to_list()
    #topics_over_time = model.topics_over_time(docs, timestamps)

    # Visualize this
   # model.visualize_topics_over_time(topics_over_time, topics=[4, 5, 9])

    # Examine the topics
print(model.get_topic_freq().head(100))

    # Visualize topics
model.visualize_topics()

    # Visualize topics bar chart
new_topics.visualize_barchart(width=580, height=630, top_n_topics=74, n_words=10)
    # folder_name = 'figures'
    # file_path = os.path.join(folder_name, 'Topics_all.png')
    # plt.savefig(file_path)
    # print(f"Figure saved at {file_path}")
    # plt.show()



    #list of newspapers: FT
