console.log('astro.js loaded');

$(document).ready(function () {
    console.log('Document ready');

    // Initialize Flatpickr for birth date
    $('#birthDate').flatpickr({
        dateFormat: "Y-m-d",
        maxDate: "today"
    });

    // Disable the button initially
    $('#generateReportButton').prop('disabled', true);

    // Handle location autocomplete
    $('#location').on('input', function () {
        console.log('Location input detected');
        let query = $(this).val();
        if (query.length < 3) {
            $('#locationSuggestions').hide();
            $('#generateReportButton').prop('disabled', true); // Disable button
            return;
        }

        $.getJSON(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${query}`, function (data) {
            let suggestions = data.filter(place => place.address.country_code === 'us').map(place => {
                let city = place.address.city || place.address.town || place.address.village || place.address.hamlet || "";
                let state = place.address.state || place.address.region || place.address.county || "";
                return city && state ? `
                    <li class="list-group-item list-group-item-action" data-lat="${place.lat}" data-lon="${place.lon}">
                        ${city}, ${state}
                    </li>
                ` : "";
            }).join('');
            $('#locationSuggestions').html(suggestions).show();
        });
    });

    // Handle location suggestion click
    $('#locationSuggestions').on('click', 'li', function () {
        $('#location').val($(this).text());
        $('#location').data('lat', $(this).data('lat'));
        $('#location').data('lon', $(this).data('lon'));
        $('#locationSuggestions').hide();
        $('#generateReportButton').prop('disabled', false); // Enable button
    });

    // Hide suggestions on click outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#location, #locationSuggestions').length) {
            $('#locationSuggestions').hide();
        }
    });

    // Handle form submission
    $('#astroForm').on('submit', function (event) {
        event.preventDefault();
        console.log('Form submitted');

        let firstName = $('#firstName').val();
        let lastName = $('#lastName').val();
        let birthDate = $('#birthDate').val();
        let birthTime = $('#birthTime').val();
        let location = $('#location').val();

        if ($('#unknownBirthTime').is(':checked')) {
            birthTime = "12:00"; // Default to 12 PM if birth time is unknown
        }

        let lat = $('#location').data('lat');
        let lon = $('#location').data('lon');

        if (!lat || !lon) {
            alert('Please select a location from the suggestions.');
            return;
        }

        // Get timezone using latitude and longitude
        $.getJSON(`https://worldtimeapi.org/api/timezone/Etc/GMT`, function (timezoneData) {
            var timezone = timezoneData.timezone;

            // Format the data as required
            let formattedData = {
                first_name: firstName,
                last_name: lastName,
                birth_date: birthDate,
                birth_time: birthTime,
                location: location,
                timezone: timezone
            };

            $.ajax({
                type: 'POST',
                url: '/report',
                contentType: 'application/json',
                data: JSON.stringify(formattedData),
                success: function (data) {
                    console.log('Data received:', data); // Debugging statement
                    $('#astroReport').html(formatReport(data));
                    $('#reportSection').show();
                    $('[data-toggle="tooltip"]').tooltip(); // Initialize tooltips

                    // Scroll to the report section
                    document.getElementById('reportSection').scrollIntoView({ behavior: 'smooth' });

                    // Clear the form fields
                    $('#astroForm')[0].reset();

                    // Disable the "Generate Report" button
                    $('#generateReportButton').prop('disabled', true);

                    // Clear the location data attributes
                    $('#location').removeData('lat').removeData('lon');
                },
                error: function (error) {
                    console.log('Error:', error);
                }
            });
        });
    });

    function formatReport(report) {
        console.log('Formatting report:', report); // Debugging statement

        function getOrdinalSuffix(n) {
            const s = ["th", "st", "nd", "rd"],
                  v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        }

        function getSignDescription(sign) {
            const descriptions = {
                'Aries': 'Aries is the first sign of the zodiac, symbolizing the beginning. People born under this sign are known for their energy and courage.',
                'Taurus': 'Taurus is the second sign of the zodiac, symbolizing stability and reliability. People born under this sign are known for their practicality and determination.',
                'Gemini': 'Gemini is the third sign of the zodiac, symbolizing communication and intellect. People born under this sign are known for their adaptability and curiosity.',
                'Cancer': 'Cancer is the fourth sign of the zodiac, symbolizing home and family. People born under this sign are known for their sensitivity and nurturing nature.',
                'Leo': 'Leo is the fifth sign of the zodiac, symbolizing leadership and creativity. People born under this sign are known for their confidence and generosity.',
                'Virgo': 'Virgo is the sixth sign of the zodiac, symbolizing service and perfection. People born under this sign are known for their analytical and meticulous nature.',
                'Libra': 'Libra is the seventh sign of the zodiac, symbolizing balance and harmony. People born under this sign are known for their diplomacy and fairness.',
                'Scorpio': 'Scorpio is the eighth sign of the zodiac, symbolizing transformation and power. People born under this sign are known for their intensity and passion.',
                            'Sagittarius': 'Sagittarius is the ninth sign of the zodiac, symbolizing adventure and freedom. People born under this sign are known for their optimism and love of travel.',
            'Capricorn': 'Capricorn is the tenth sign of the zodiac, symbolizing ambition and discipline. People born under this sign are known for their determination and practicality.',
            'Aquarius': 'Aquarius is the eleventh sign of the zodiac, symbolizing innovation and humanitarianism. People born under this sign are known for their originality and progressive thinking.',
            'Pisces': 'Pisces is the twelfth sign of the zodiac, symbolizing compassion and spirituality. People born under this sign are known for their empathy and artistic nature.'
        };
        return descriptions[sign] || '';
    }

    function getPlanetDescription(planet) {
        const descriptions = {
            'Sun': 'The Sun represents your core self, ego, and individuality. It signifies your main identity and purpose in life.',
            'Moon': 'The Moon represents your emotions, instincts, and subconscious. It signifies how you feel and respond emotionally.',
            'Mercury': 'Mercury represents communication, intellect, and reasoning. It signifies how you think, learn, and express yourself.',
            'Venus': 'Venus represents love, beauty, and harmony. It signifies your relationships, values, and artistic inclinations.',
            'Mars': 'Mars represents energy, action, and desire. It signifies how you assert yourself and pursue your goals.',
            'Jupiter': 'Jupiter represents growth, expansion, and wisdom. It signifies your philosophy, beliefs, and luck.',
            'Saturn': 'Saturn represents discipline, structure, and responsibility. It signifies your work ethic, limitations, and long-term goals.',
            'Rahu': 'Rahu represents obsession, materialism, and unconventional behavior. It signifies the areas of life where you strive for growth.',
            'Ketu': 'Ketu represents detachment, spirituality, and past life karma. It signifies the areas of life where you seek liberation and higher understanding.'
        };
        return descriptions[planet] || '';
    }

    function getDashaDescription(dasha) {
        const descriptions = {
            'Ketu': 'Ketu Dasha can bring spiritual growth, detachment from material pursuits, and unexpected changes. It often leads to introspection and a deeper understanding of life.',
            'Venus': 'Venus Dasha is characterized by a focus on love, relationships, beauty, and luxury. It often brings harmony, creativity, and artistic expression.',
            'Sun': 'Sun Dasha emphasizes self-confidence, leadership, and personal power. It can bring recognition, success, and a strong sense of purpose.',
            'Moon': 'Moon Dasha highlights emotions, family, and nurturing. It often brings changes in personal life, increased sensitivity, and a focus on home and family.',
            'Mars': 'Mars Dasha is marked by energy, action, and ambition. It can bring challenges, competition, and the drive to achieve goals.',
            'Rahu': 'Rahu Dasha brings unconventional paths, material desires, and sudden changes. It often leads to intense experiences and a quest for success.',
            'Jupiter': 'Jupiter Dasha emphasizes growth, wisdom, and spirituality. It brings opportunities for expansion, learning, and a positive outlook on life.',
            'Saturn': 'Saturn Dasha focuses on discipline, responsibility, and long-term goals. It can bring challenges, hard work, and the rewards of perseverance.',
            'Mercury': 'Mercury Dasha highlights communication, intellect, and adaptability. It often brings learning opportunities, travel, and a focus on mental pursuits.'
        };
        return descriptions[dasha] || '';
    }

    let reportHtml = `<h2>Astrological Report for ${report['First Name']} ${report['Last Name']}</h2>`;

    reportHtml += `<p><strong>Ascendant:</strong> ${report.Ascendant} <span class="info-icon" data-toggle="tooltip" title="The Ascendant is the sign rising on the eastern horizon at the time of birth. It represents your outward personality and how others perceive you. ${getSignDescription(report.Ascendant)}">&#9432;</span></p>`;

    if (report.Aspects.length) {
        reportHtml += `<p><strong>Aspects:</strong> ${report.Aspects.join(', ')} <span class="info-icon" data-toggle="tooltip" title="Aspects are angles between planets that influence how they interact with each other. They can indicate harmony or tension.">&#9432;</span></p>`;
    }

    reportHtml += `<p><strong>Current Vimshottari Dasha:</strong> ${report['Current Vimshottari Dasha']} <span class="info-icon" data-toggle="tooltip" title="${getDashaDescription(report['Current Vimshottari Dasha'])}">&#9432;</span></p>`;

    reportHtml += `<p><strong>House Positions:</strong> <span class="info-icon" data-toggle="tooltip" title="House positions indicate where planets are located in your horoscope. Each house represents different areas of life.">&#9432;</span></p><ul>`;
    reportHtml += report['House Positions'].map((position, index) => `<li>${getOrdinalSuffix(index + 1)} House: ${position} <span class="info-icon" data-toggle="tooltip" title="${getSignDescription(position)}">&#9432;</span></li>`).join('');
    reportHtml += `</ul>`;

    reportHtml += `<p><strong>Planetary Positions:</strong> <span class="info-icon" data-toggle="tooltip" title="Planetary positions indicate where the planets were located at the time of your birth. Each planet represents different aspects of your personality and life.">&#9432;</span></p><ul>`;
    reportHtml += Object.entries(report['Planetary Positions']).map(([planet, position]) => `<li>${planet}: ${position} <span class="info-icon" data-toggle="tooltip" title="${getPlanetDescription(planet)}">&#9432;</span></li>`).join('');
    reportHtml += `</ul>`;

    if (report.Yogas.length) {
        reportHtml += `<p><strong>Yogas:</strong> ${report.Yogas.join(', ')} <span class="info-icon" data-toggle="tooltip" title="Yogas are special combinations of planets that produce specific results. They can indicate strengths, opportunities, and challenges.">&#9432;</span></p>`;
    }

    return reportHtml;
}
});