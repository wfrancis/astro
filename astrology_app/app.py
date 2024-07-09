from flask import Flask, render_template, request, jsonify
from astro import generate_astrology_report

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/report', methods=['POST'])
def report():
    data = request.json
    print(str(data))
    birth_date = data['birth_date']
    birth_time = data['birth_time']
    location = data['location']
    report = generate_astrology_report(birth_date, birth_time, location)
    return jsonify(report)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)