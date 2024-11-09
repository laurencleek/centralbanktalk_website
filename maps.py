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

# Loop over each year to create a separate map
for year in df_location_year['year'].unique():
    # Filter data by selected year
    year_data = df_location_year[df_location_year['year'] == year]
    
    # Calculate mean latitude and longitude to center the map
    center_lat = year_data['latitude'].mean()
    center_lon = year_data['longitude'].mean()
    
    # Create the map
    map = folium.Map(location=[center_lat, center_lon], zoom_start=4)
    
    # Create a marker cluster
    marker_cluster = MarkerCluster().add_to(map)
    
    # Add markers to the cluster based on filtered data
    for _, row in year_data.iterrows():
        color = get_marker_color(row['speech_count'])
        folium.CircleMarker(
            location=[row['latitude'], row['longitude']],
            radius=int(5 + np.log(row['speech_count'])),  # Adjust radius for visibility
            color=color,
            fill=True,
            fill_color=color,
            fill_opacity=0.7,
            popup=f"{row['location']}: {row['speech_count']} speeches"
        ).add_to(marker_cluster)

    # Save the map for the specific year
    map.save(f"locations_map_{year}.html")
    print(f"Map for year {year} has been saved as 'locations_map_{year}.html'.")



import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

# Load your data
all_speeches = pd.read_parquet(r"C:\Users\lclee\OneDrive - Istituto Universitario Europeo\PhD\two_thirds_submission\Github_replication_files_by_paper\Paper_1\data\speeches_all_country_data_except_vdem.parquet", engine='pyarrow')
all_speeches['date'] = pd.to_datetime(all_speeches['date']).dt.date
all_speeches['year'] = all_speeches['year'].astype(int)

# Remove rows with NaN values in latitude or longitude
df_clean = all_speeches.dropna(subset=['latitude', 'longitude'])

# Group by location and year to get the number of speeches at each coordinate per year
df_location_year = df_clean.groupby(['latitude', 'longitude', 'location', 'year']).size().reset_index(name='speech_count')

# Create a geometry column with Point objects from latitude and longitude
df_location_year['geometry'] = df_location_year.apply(lambda row: Point(row['longitude'], row['latitude']), axis=1)

# Convert to a GeoDataFrame
gdf = gpd.GeoDataFrame(df_location_year, geometry='geometry')

# Set the coordinate reference system (CRS) to WGS84 (used by GPS and most web maps)
gdf.set_crs("EPSG:4326", inplace=True)

# Loop over each year, filter data, and save to GeoJSON
for year in gdf['year'].unique():
    # Filter for the current year
    gdf_year = gdf[gdf['year'] == year]
    
    # Save to GeoJSON
    file_path = f"speeches_{year}.geojson"
    gdf_year.to_file(file_path, driver="GeoJSON")
    print(f"Saved GeoJSON for year {year} as {file_path}")



    # Define the HTML content as a Python string
html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Interactive Speech Map with Clustering</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
    <style>
        #map { height: 600px; width: 100%; }
        .dropdown { position: absolute; top: 10px; left: 10px; z-index: 1000; background: white; padding: 5px; }
    </style>
</head>
<body>

<div id="map"></div>
<div class="dropdown">
    <label for="yearSelect">Select Year:</label>
    <select id="yearSelect">
        <option value="2021">2021</option>
    </select>
</div>

<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
<script>
    // Initialize the map
    var map = L.map('map').setView([45, 0], 4);

    // Add the base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Layer container for each year with MarkerCluster
    var layers = {};
    var yearData = {
        "2021": "speeches_2021.geojson"
    };

    // Function to load GeoJSON data for a selected year
    function loadYearData(year) {
        if (layers[year]) {
            map.addLayer(layers[year]);
        } else {
            fetch(yearData[year])
                .then(response => response.json())
                .then(data => {
                    var markerCluster = L.markerClusterGroup();

                    // Define the marker style based on speech count
                    L.geoJSON(data, {
                        pointToLayer: function (feature, latlng) {
                            var count = feature.properties.speech_count || 0;
                            var color = count > 100 ? 'red' : count > 50 ? 'orange' : count > 10 ? 'blue' : 'green';
                            return L.circleMarker(latlng, {
                                radius: 5 + Math.log(count + 1),
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.7
                            }).bindPopup(`<strong>${feature.properties.location}</strong><br>Speeches: ${count}`);
                        }
                    }).addTo(markerCluster);

                    // Store and add the clustered layer
                    layers[year] = markerCluster;
                    map.addLayer(markerCluster);
                })
                .catch(error => console.log("Error loading GeoJSON data:", error));
        }
    }

    // Dropdown to select the year
    var yearSelect = document.getElementById('yearSelect');
    yearSelect.addEventListener('change', function () {
        for (var layer in layers) {
            map.removeLayer(layers[layer]);
        }
        loadYearData(this.value);
    });

    // Load the default year (2021) initially
    loadYearData(yearSelect.value);
</script>

</body>
</html>
"""

# Save the HTML content to a file
with open("map_with_year_selector.html", "w") as file:
    file.write(html_content)

print("HTML file saved as 'map_with_year_selector.html'")


