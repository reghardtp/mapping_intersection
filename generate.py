import csv
import random

# Coordinates for South Africa
MIN_LAT = -34.83333
MAX_LAT = -22.125030
MIN_LNG = 16.344976
MAX_LNG = 32.830120

def generate_sites(filename, num_sites):
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['lat', 'lng'])

        for _ in range(num_sites):
            lat = random.uniform(MIN_LAT, MAX_LAT)
            lng = random.uniform(MIN_LNG, MAX_LNG)
            writer.writerow([lat, lng])


def generate_traces(filename, num_traces):
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['lat', 'lng'])

        for _ in range(num_traces):
            # Generate some traces close to the sites
            if random.random() < 0.2:
                lat = random.uniform(MIN_LAT, MAX_LAT)
                lng = random.uniform(MIN_LNG, MAX_LNG)
            else:
                # Generate random traces
                lat = random.uniform(MIN_LAT, MAX_LAT)
                lng = random.uniform(MIN_LNG, MAX_LNG)

            writer.writerow([lat, lng])


generate_sites('sites.csv', 50)
generate_traces('traces.csv', 100)
