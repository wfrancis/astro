#!/bin/bash

# Create the directory structure
mkdir -p astrology_app/templates
mkdir -p astrology_app/static/css
mkdir -p astrology_app/static/js

# Create app.py
cat <<EOF > astrology_app/app.py
from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/report', methods=['POST'])
def report():
    data = request.json
    birth_date = data['birth_date']
    birth_time = data['birth_time']
    location = data['location']
    # Additional logic to generate astrological report
    # This is a placeholder for the actual astrological calculation
    report = generate_report(birth_date, birth_time, location)
    return jsonify(report)

def generate_report(birth_date, birth_time, location):
    # Placeholder function for generating astrological report
    # In reality, you would use an astrology library or API here
    report = {
        "Sun Sign": "Aquarius",
        "Moon Sign": "Sagittarius",
        "Ascendant": "Pisces",
        "Venus Dasha": "Current period focusing on love and relationships",
        "Career": "Favorable for innovation and leadership",
        "Relationships": "Strong potential for meaningful connections",
        "Weekly Forecast": "Blend of introspection and social engagement"
    }
    return report

if __name__ == '__main__':
    app.run(debug=True)
EOF

# Create index.html
cat <<EOF > astrology_app/templates/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Astrology Report</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <link href="{{ url_for('static', filename='css/styles.css') }}" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1 class="mt-5">Astrological Report</h1>
        <form id="astroForm">
            <div class="form-group">
                <label for="birthDate">Birth Date:</label>
                <input type="date" class="form-control" id="birthDate" required>
            </div>
            <div class="form-group">
                <label for="birthTime">Birth Time:</label>
                <input type="time" class="form-control" id="birthTime" required>
            </div>
            <div class="form-group">
                <label for="location">Location:</label>
                <input type="text" class="form-control" id="location" placeholder="City, Country" required>
            </div>
            <button type="submit" class="btn btn-primary">Generate Report</button>
        </form>
        <div id="reportSection" class="mt-5" style="display: none;">
            <h2>Your Astrological Report</h2>
            <div id="astroReport"></div>
            <button id="openChat" class="btn btn-secondary mt-3">Ask Questions</button>
        </div>
    </div>

    <div id="chatModal" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Chat with Astrology Bot</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="chatBox"></div>
                    <input type="text" id="userMessage" class="form-control" placeholder="Ask a question...">
                </div>
                <div class="modal-footer">
                    <button id="sendMessage" class="btn btn-primary">Send</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script src="{{ url_for('static', filename='js/scripts.js') }}"></script>
</body>
</html>
EOF

# Create scripts.js
cat <<EOF > astrology_app/static/js/scripts.js
$(document).ready(function() {
    $('#astroForm').on('submit', function(e) {
        e.preventDefault();
        const birthDate = $('#birthDate').val();
        const birthTime = $('#birthTime').val();
        const location = $('#location').val();

        $.ajax({
            url: '/report',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ birth_date: birthDate, birth_time: birthTime, location: location }),
            success: function(data) {
                let reportHtml = '<ul>';
                for (let key in data) {
                    reportHtml += `<li><strong>${key}:</strong> ${data[key]}</li>`;
                }
                reportHtml += '</ul>';
                $('#astroReport').html(reportHtml);
                $('#reportSection').show();
            }
        });
    });

    $('#openChat').on('click', function() {
        $('#chatModal').modal('show');
    });

    $('#sendMessage').on('click', function() {
        const userMessage = $('#userMessage').val();
        $('#chatBox').append(`<div class="user-message">${userMessage}</div>`);
        $('#userMessage').val('');

        $.ajax({
            url: 'https://api.openai.com/v1/engines/davinci-codex/completions',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
                'Content-Type': 'application/json'
            }),
            data: JSON.stringify({
                prompt: `The user asked: ${userMessage}. Provide an astrological interpretation based on the given report.`,
                max_tokens: 150
            }),
            success: function(response) {
                const botMessage = response.choices[0].text.trim();
                $('#chatBox').append(`<div class="bot-message">${botMessage}</div>`);
            }
        });
    });
});
EOF

# Create styles.css
cat <<EOF > astrology_app/static/css/styles.css
body {
    background-color: #f8f9fa;
}
#astroForm {
    margin-top: 50px;
}
#reportSection {
    margin-top: 50px;
}
.modal-body {
    max-height: 400px;
    overflow-y: auto;
}
.user-message {
    text-align: right;
    margin: 10px 0;
}
.bot-message {
    text-align: left;
    margin: 10px 0;
}
EOF

# Create requirements.txt
cat <<EOF > astrology_app/requirements.txt
Flask
EOF

echo "Setup complete. Navigate to the 'astrology_app' directory and run 'python app.py' to start the application."pwd