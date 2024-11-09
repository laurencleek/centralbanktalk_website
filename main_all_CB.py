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
    topic_info_path = os.path.join(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1\code\.py\figures", "topic_info_new.xlsx")
    topic_info.to_excel(topic_info_path, index=False)
    print(f"Topic info saved to {topic_info_path}")
    # Save model
    model.save("my_topics_model_all_CB")

### Step 4: merging with other datasets

if os.path.exists(model_path):
    print("Loading existing topic model...")
    model = BERTopic.load(model_path)
else:
        # Step 1: Process BERTopic results
    print("Processing BERTopic results...")
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

        # Step 3: Separate ECB and non-ECB data
        print("Separating ECB and non-ECB data...")
        ecb_data = all_speeches[all_speeches['central_bank'] == 'european central bank']
        non_ecb_data = all_speeches[all_speeches['central_bank'] != 'european central bank']
        del all_speeches
        gc.collect()

        # Step 4: Process additional variables
        print("Processing additional variables...")
        additional_vars = ['spread', 'ro_cbie_index', 'unemployment_rate', 'diff_unemployment', 'i_minus_g', 'gdp_nominal_growth', 'gdp_real_growth', 'diff_inflation', 'gdp_deflator', 'hicp', 'output_gap_pgdp', 'structural_balance_pgdp', 'total_expenditure_pgdp', 'government_debt_pgdp', 'primary_balance_pgdp', 'government_debt', 'gdp_real_ppp_capita', 'number_of_sentences', 'audience', 'position', 'speaker', 'type_of_text']
        numeric_vars = non_ecb_data[additional_vars].select_dtypes(include=[np.number]).columns
        mean_values = non_ecb_data.groupby('quarter')[numeric_vars].mean().reset_index()

        # Step 5: Merge ECB data with mean values
        print("Merging ECB data with mean values...")
        ecb_data_with_means = pd.merge(ecb_data, mean_values, on='quarter', suffixes=('', '_mean'))
        for var in numeric_vars:
            ecb_data_with_means[var] = ecb_data_with_means[f'{var}_mean']
            ecb_data_with_means.drop(f'{var}_mean', axis=1, inplace=True)

        # Step 6: Combine data and aggregate
        print("Combining data and aggregating...")
        final_df = pd.concat([ecb_data_with_means, non_ecb_data])
        del ecb_data_with_means, non_ecb_data, ecb_data
        gc.collect()

        topic_columns = [col for col in final_df.columns if col.startswith('Topic_')]
        columns_to_aggregate = numeric_vars.tolist() + topic_columns
        
        topic_proportions_final = pd.DataFrame()
        for chunk in process_in_chunks(final_df):
            chunk_result = chunk.groupby(['quarter', 'central_bank'])[columns_to_aggregate].mean().reset_index()
            topic_proportions_final = pd.concat([topic_proportions_final, chunk_result])
            del chunk_result
            gc.collect()
        
        topic_proportions_final['quarter'] = pd.to_datetime(topic_proportions_final['quarter'].astype(str)).dt.to_period('Q')
        del final_df
        gc.collect()

        # Step 7: Merge and rename topics NEW for topicmodel1
        print("Merging and renaming topics...")
            #Please note that the topics are re-assigned using ChatGPT 4o. The categories are obtained through an iterative process with human interaction. The assignment is manually validated.
        topic_merging = {
            'Monetary_Policy_Central_Banking': ['Topic_0', 'Topic_12', 'Topic_16', 'Topic_17', 'Topic_19', 'Topic_21', 'Topic_24'],
            'Economic_Analysis_Indicators': ['Topic_4', 'Topic_12', 'Topic_13', 'Topic_20', 'Topic_22', 'Topic_27'],
            'Financial_Markets_Integration': ['Topic_10', 'Topic_11', 'Topic_18', 'Topic_29', 'Topic_30', 'Topic_33'],
            'Banking_Regulation_Supervision': ['Topic_6', 'Topic_7', 'Topic_25', 'Topic_26', 'Topic_34', 'Topic_38'],
            'Digital_Finance_Innovation': ['Topic_2', 'Topic_28', 'Topic_36', 'Topic_40'],
            'International_Economics_Exchange_Rates': ['Topic_18', 'Topic_23', 'Topic_35'],
            'Crisis_Management_Stability': ['Topic_8', 'Topic_9', 'Topic_32', 'Topic_37', 'Topic_41'],
            'Sustainable_Finance_Climate': ['Topic_5', 'Topic_31'],
            'Payment_Systems_Cash': ['Topic_15', 'Topic_14', 'Topic_39', 'Topic_43'],
            'National_Economy': ['Topic_1', 'Topic_3', 'Topic_42', 'Topic_44']
        }

        for new_topic, old_topics in topic_merging.items():
            topic_proportions_final[new_topic] = topic_proportions_final[old_topics].sum(axis=1)

            # Calculate proportions
        sum_of_topics = topic_proportions_final[list(topic_merging.keys())].sum(axis=1)
        for topic in topic_merging.keys():
            topic_proportions_final[f'{topic}_Proportion'] = topic_proportions_final[topic] / sum_of_topics
            topic_proportions_final.drop(columns=[topic], inplace=True)

        topic_proportions_final.rename(columns={f'{topic}_Proportion': topic for topic in topic_merging.keys()}, inplace=True)
        topic_proportions_final.drop(columns=[f'Topic_{i}' for i in range(44)], inplace=True)
        gc.collect()

        # Step 8: Process Eurobarometer data
        print("Processing Eurobarometer data...")
        eurobarometer = pd.read_stata(eurobarometer_path)
        eurobarometer['year'] = pd.to_datetime(eurobarometer['year'], format='%Y').dt.year

        def generate_quarters(year):
            return [pd.Period(f"{year}-Q{q}") for q in range(1, 5)]

        quarterly_eurobarometer = pd.DataFrame()
        for _, row in eurobarometer.iterrows():
            chunk_result = pd.DataFrame({
                'year': row['year'],
                'quarter': generate_quarters(row['year']),
                'central_bank': row['central_bank'],
                **{col: row[col] for col in eurobarometer.columns if col not in ['year', 'central_bank']}
            })
            quarterly_eurobarometer = pd.concat([quarterly_eurobarometer, chunk_result])

        quarterly_eurobarometer = quarterly_eurobarometer.reset_index(drop=True)


        # Step 10: Process and merge Google Trends data
        print("Processing and merging Google Trends data...")
        google_trends = pd.read_csv(os.path.join(google_trends_path, 'ecb_trends_quarterly.csv'))
        
        print(f"Google Trends columns: {google_trends.columns}")
        print(f"Number of columns: {len(google_trends.columns)}")
        
        if 'Quarter' not in google_trends.columns:
            raise ValueError("'Quarter' column not found in Google Trends data")
        
            # Create 'central_bank' column based on existing columns
        central_banks = ['DE', 'ES', 'FR', 'IT', 'NL', 'ECB_Average']
        for bank in central_banks:
            if bank not in google_trends.columns:
                raise ValueError(f"'{bank}' column not found in Google Trends data")
        
         # Melt the dataframe to create 'central_bank' column
        google_trends_melted = pd.melt(google_trends, id_vars=['Quarter'], value_vars=central_banks, 
                                       var_name='central_bank', value_name='google_trends_value')
        
            # Map short names to full names
        bank_name_map = {
            'DE': 'deutsche bundesbank',
            'ES': 'bank of spain',
            'FR': 'bank of france',
            'IT': 'bank of italy',
            'NL': 'netherlands bank',
            'ECB_Average': 'european central bank'
        }
        google_trends_melted['central_bank'] = google_trends_melted['central_bank'].map(bank_name_map)
        
        google_trends_melted['quarter'] = pd.to_datetime(google_trends_melted['Quarter'].apply(lambda x: f"{x.split('-Q')[0]}-{int(x.split('-Q')[1])*3-2:02d}-01"))
        
            # Rename columns
        google_trends_melted.columns = ['original_quarter', 'central_bank', 'google_trends_value', 'quarter']
        
            # Ensure the number of new column names matches the number of columns
        if len(google_trends_melted.columns) != 4:
            raise ValueError(f"Column name mismatch: {len(google_trends_melted.columns)} columns")
        
        merged_df['quarter'] = pd.to_datetime(merged_df['quarter'])
        merged_df = pd.merge(merged_df, google_trends_melted, on=['quarter', 'central_bank'], how='left')
        del google_trends, google_trends_melted
        gc.collect()

        # Step 11: Save to Stata format
        print("Saving to Stata format...")
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)

        try:
            merged_df.to_stata(os.path.join(folder_name, 'topic_proportions_per_quarter.dta'), version=118)
        except ValueError:
            merged_df.to_stata(os.path.join(folder_name, 'topic_proportions_per_quarter.dta'), version=117)

        print("Dataset creation and merging process completed successfully.")
        return merged_df

    except Exception as e:
        print(f"An error occurred during the dataset creation and merging process: {str(e)}")
        return None



topic_merging = {
    'Monetary_Policy_Central_Banking': ['Topic_0', 'Topic_12', 'Topic_16', 'Topic_17', 'Topic_19', 'Topic_21', 'Topic_24'],
    'Economic_Analysis_Indicators': ['Topic_4', 'Topic_12', 'Topic_13', 'Topic_20', 'Topic_22', 'Topic_27'],
    'Financial_Markets_Integration': ['Topic_10', 'Topic_11', 'Topic_18', 'Topic_29', 'Topic_30', 'Topic_33'],
    'Banking_Regulation_Supervision': ['Topic_6', 'Topic_7', 'Topic_25', 'Topic_26', 'Topic_34', 'Topic_38'],
    'Digital_Finance_Innovation': ['Topic_2', 'Topic_28', 'Topic_36', 'Topic_40'],
    'International_Economics_Exchange_Rates': ['Topic_18', 'Topic_23', 'Topic_35'],
    'Crisis_Management_Stability': ['Topic_8', 'Topic_9', 'Topic_32', 'Topic_37', 'Topic_41'],
    'Sustainable_Finance_Climate': ['Topic_5', 'Topic_31'],
    'Payment_Systems_Cash': ['Topic_15', 'Topic_14', 'Topic_39', 'Topic_43'],
    'National_Economy': ['Topic_1', 'Topic_3', 'Topic_42', 'Topic_44']
}


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
