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
import folium
from folium.plugins import MarkerCluster, TimestampedGeoJson
import pandas as pd
import numpy as np
import json

# Load data
all_speeches = pd.read_parquet(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1\data\speeches_all_country_data_except_vdem.parquet", engine='pyarrow')
all_speeches['date'] = pd.to_datetime(all_speeches['date']).dt.date
all_speeches['year'] = all_speeches['year'].astype(int)

# Remove rows with NaN values in latitude or longitude
df_clean = all_speeches.dropna(subset=['latitude', 'longitude'])

# Group by location and year to get the number of speeches at each coordinate per year
df_location_year = df_clean.groupby(['latitude', 'longitude', 'location', 'year']).size().reset_index(name='speech_count')

# Check for empty data
if df_location_year.empty:
    print("No valid coordinates found. Please check your data.")
else:
    # Calculate mean latitude and longitude to center the map
    center_lat = df_location_year['latitude'].mean()
    center_lon = df_location_year['longitude'].mean()
    
    # Create the map
    map = folium.Map(location=[center_lat, center_lon], zoom_start=4)
    
    # Function to determine marker color based on speech count
    def get_marker_color(count):
        if count > 100:
            return 'red'
        elif count > 50:
            return 'orange'
        elif count > 10:
            return 'blue'
        else:
            return 'green'

    # Prepare the features for TimestampedGeoJson
    features = []
    for year in sorted(df_location_year['year'].unique()):
        year_data = df_location_year[df_location_year['year'] == year]
        for _, row in year_data.iterrows():
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [row['longitude'], row['latitude']],
                },
                'properties': {
                    'time': str(year),
                    'style': {
                        'color': get_marker_color(row['speech_count']),
                        'fillColor': get_marker_color(row['speech_count']),
                        'fillOpacity': 0.7,
                        'radius': 5 + np.log(row['speech_count'])
                    },
                    'popup': f"{row['location']}: {row['speech_count']} speeches",
                    'tooltip': f"{row['speech_count']} speeches"
                }
            }
            features.append(feature)
    
    # Create a GeoJSON for TimestampedGeoJson
    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }

    # Add the TimestampedGeoJson to the map
    TimestampedGeoJson(
        data=geojson,
        period='P1Y',  # Yearly period
        add_last_point=True,
        loop=True,
        max_speed=1,
        auto_play=False,
        loop_button=True,
        date_options='YYYY',
        time_slider_drag_update=True
    ).add_to(map)

    # Save the map
    map.save("locations_map_with_time_slider.html")
    print("Map has been saved as 'locations_map_with_time_slider.html'. Open this file in a web browser to view the map.")


import pandas as pd
import numpy as np
from ipyleaflet import Map, MarkerCluster, CircleMarker, WidgetControl
from ipywidgets import IntSlider, VBox

# Load data
all_speeches = pd.read_parquet(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1\data\speeches_all_country_data_except_vdem.parquet", engine='pyarrow')
all_speeches['date'] = pd.to_datetime(all_speeches['date']).dt.date
all_speeches['year'] = all_speeches['year'].astype(int)

# Remove rows with NaN values in latitude or longitude
df_clean = all_speeches.dropna(subset=['latitude', 'longitude'])

# Group by location and year to get the number of speeches at each coordinate per year
df_location_year = df_clean.groupby(['latitude', 'longitude', 'location', 'year']).size().reset_index(name='speech_count')

# Function to determine marker color based on speech count
def get_marker_color(count):
    if count > 100:
        return 'red'
    elif count > 50:
        return 'orange'
    elif count > 10:
        return 'blue'
    else:
        return 'green'

# Define center of the map based on mean coordinates
center_lat = df_location_year['latitude'].mean()
center_lon = df_location_year['longitude'].mean()

# Create the map
m = Map(center=(center_lat, center_lon), zoom=4)

# Create a slider for filtering by year
year_slider = IntSlider(value=df_location_year['year'].min(),
                        min=df_location_year['year'].min(),
                        max=df_location_year['year'].max(),
                        description='Year')

# Function to update markers based on slider
def update_markers(year):
    # Clear existing layers except base map
    m.clear_layers()
    
    # Filter data by selected year
    year_data = df_location_year[df_location_year['year'] == year]
    
    # Create a new marker cluster
    marker_cluster = MarkerCluster()
    
    # Add markers to the cluster based on filtered data
    for _, row in year_data.iterrows():
        color = get_marker_color(row['speech_count'])
        marker = CircleMarker(
            location=(row['latitude'], row['longitude']),
            radius=int(5 + np.log(row['speech_count'])),  # Convert to int for compatibility
            color=color,
            fill_color=color,
            fill_opacity=0.7,
            popup=f"{row['location']}: {row['speech_count']} speeches"
        )
        marker_cluster.add(marker)

    # Add the marker cluster to the map
    m.add(marker_cluster)

# Update markers initially
update_markers(year_slider.value)

# Update markers on slider change
year_slider.observe(lambda change: update_markers(change['new']), names='value')

# Add the slider to the map
widget_control = WidgetControl(widget=VBox([year_slider]), position='topright')
m.add(widget_control)

m
