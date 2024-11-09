#MAPS

import folium
from folium.plugins import MarkerCluster
import pandas as pd
import numpy as np

# Load data
all_speeches = pd.read_parquet(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1\data\speeches_all_country_data_except_vdem.parquet", engine='pyarrow')
all_speeches['date'] = pd.to_datetime(all_speeches['date']).dt.date
all_speeches['year'] = all_speeches['year'].astype(int)

# Remove rows with NaN values in latitude or longitude
df_clean = all_speeches.dropna(subset=['latitude', 'longitude'])

# Group by location to get the number of speeches at each coordinate
df_location_counts = df_clean.groupby(['latitude', 'longitude', 'location']).size().reset_index(name='speech_count')

if df_location_counts.empty:
    print("No valid coordinates found. Please check your data.")
else:
    # Calculate mean latitude and longitude to center the map
    center_lat = df_location_counts['latitude'].mean()
    center_lon = df_location_counts['longitude'].mean()
    
    # Create the map
    map = folium.Map(location=[center_lat, center_lon], zoom_start=4)
    
    # Create a marker cluster
    marker_cluster = MarkerCluster().add_to(map)

    # Define a function to determine marker color based on speech count
    def get_marker_color(count):
        if count > 100:
            return 'red'
        elif count > 50:
            return 'orange'
        elif count > 10:
            return 'blue'
        else:
            return 'green'

    # Add markers to the cluster with speech count in the tooltip and colored by count
    for idx, row in df_location_counts.iterrows():
        folium.CircleMarker(
            location=[row['latitude'], row['longitude']],
            radius=5 + np.log(row['speech_count']),  # Adjust radius for visibility based on count
            color=get_marker_color(row['speech_count']),
            fill=True,
            fill_opacity=0.7,
            popup=f"{row['location']}: {row['speech_count']} speeches",
            tooltip=f"{row['speech_count']} speeches"
        ).add_to(marker_cluster)

    # Save the map
    map.save("locations_map.html")
    print("Map has been saved as 'locations_map.html'. Open this file in a web browser to view the map.")



