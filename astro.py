import swisseph as swe
import datetime
from geopy.geocoders import Nominatim

def get_julian_day(year, month, day, hour=0, minute=0):
    return swe.julday(year, month, day, hour + minute / 60.0)

def get_planet_position(julian_day, planet):
    position, ret = swe.calc_ut(julian_day, planet)
    return position[0]

def get_rasi(position):
    signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
             'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    return signs[int(position // 30)]

def get_house_positions(julian_day, latitude, longitude):
    houses, ascmc = swe.houses(julian_day, latitude, longitude, b'P')
    return houses, ascmc[0]

def get_aspects(planet_positions):
    aspects = []
    planets = list(planet_positions.keys())
    for i, planet1 in enumerate(planets):
        for planet2 in planets[i + 1:]:
            angle = abs(planet_positions[planet1] - planet_positions[planet2])
            if angle > 180:
                angle = 360 - angle
            if angle in (0, 30, 45, 60, 90, 120, 135, 180):
                aspects.append((planet1, planet2, angle))
    return aspects

def identify_yogas(planet_positions, house_positions):
    yogas = []
    if 'Jupiter' in planet_positions and 'Moon' in planet_positions:
        jupiter_pos = planet_positions['Jupiter']
        moon_pos = planet_positions['Moon']
        if any(abs(jupiter_pos - moon_pos) % 90 <= 10 for i in range(4)):
            yogas.append("Gaja Kesari Yoga: Jupiter and Moon are in a Kendra (quadrant) from each other.")
    return yogas

def calculate_vimshottari_dasha(julian_day, birth_julian_day):
    dasha_periods = {
        'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7,
        'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17
    }
    start_points = {
        'Ketu': 0, 'Venus': 7, 'Sun': 27, 'Moon': 33, 'Mars': 43,
        'Rahu': 50, 'Jupiter': 68, 'Saturn': 84, 'Mercury': 103
    }
    total_days = sum(dasha_periods.values()) * 365.25
    elapsed_days = julian_day - birth_julian_day
    elapsed_percentage = (elapsed_days % total_days) / total_days * 120
    for planet, start in start_points.items():
        end = start + dasha_periods[planet]
        if start <= elapsed_percentage < end:
            current_dasha = planet
            break
    return current_dasha

def get_lat_lon(location):
    geolocator = Nominatim(user_agent="astro_report")
    location = geolocator.geocode(location)
    return location.latitude, location.longitude

def generate_astrology_report(birth_date, birth_time, location):
    year, month, day = map(int, birth_date.split('-'))
    hour, minute = map(int, birth_time.split(':'))

    latitude, longitude = get_lat_lon(location)

    birth_julian_day = get_julian_day(year, month, day, hour, minute)
    julian_day = get_julian_day(datetime.datetime.now().year, datetime.datetime.now().month,
                                datetime.datetime.now().day)

    planets = {
        'Sun': swe.SUN,
        'Moon': swe.MOON,
        'Mercury': swe.MERCURY,
        'Venus': swe.VENUS,
        'Mars': swe.MARS,
        'Jupiter': swe.JUPITER,
        'Saturn': swe.SATURN,
        'Rahu': swe.MEAN_NODE,
        'Ketu': swe.TRUE_NODE,
    }

    planet_positions = {planet: get_planet_position(birth_julian_day, swe_planet) for planet, swe_planet in
                        planets.items()}
    planet_rasis = {planet: get_rasi(position) for planet, position in planet_positions.items()}

    house_positions, ascendant = get_house_positions(birth_julian_day, latitude, longitude)
    house_rasis = [get_rasi(house_position) for house_position in house_positions]

    aspects = get_aspects(planet_positions)

    yogas = identify_yogas(planet_positions, house_positions)

    current_dasha = calculate_vimshottari_dasha(julian_day, birth_julian_day)

    report = {
        'Planetary Positions': planet_rasis,
        'House Positions': house_rasis,
        'Ascendant': get_rasi(ascendant),
        'Aspects': aspects,
        'Yogas': yogas,
        'Current Vimshottari Dasha': current_dasha
    }

    return report

if __name__ == '__main__':
    # Generate the report with provided details
    birth_date = "1982-02-22"
    birth_time = "03:00"
    location = "Voorhees, New Jersey"

    report = generate_astrology_report(birth_date, birth_time, location)
    report_str = "\n".join([f"{key}: {value}" for key, value in report.items()])

    print("Generated Astrology Report:")
    print(report_str)