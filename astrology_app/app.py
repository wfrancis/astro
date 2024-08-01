import uuid
from flask import Flask, render_template, request, jsonify
from astro import generate_astrology_report
import boto3
from boto3.dynamodb.conditions import Attr

app = Flask(__name__)

# Configure AWS SDK
dynamodb = boto3.resource(
    'dynamodb',
    region_name='us-east-2',
    aws_access_key_id='AKIAQ3EGTEIZLWIGNUGA',
    aws_secret_access_key=''
)

users_table = dynamodb.Table('Users')
visitors_table = dynamodb.Table('Visitors')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/report', methods=['POST'])
def report():
    data = request.json
    print(f"Received data: {data}")
    first_name = data['first_name']
    last_name = data['last_name']
    birth_date = data['birth_date']
    birth_time = data['birth_time']
    location = data['location']
    timezone = data['timezone']

    # Generate the astrology report
    report = generate_astrology_report(first_name, last_name, birth_date, birth_time, location, timezone)
    print(f"Generated report: {report}")

    # Return the report as JSON
    return jsonify(report)


@app.route('/save_user', methods=['POST'])
def save_user():
    data = request.json

    # Check if user already exists
    response = users_table.scan(
        FilterExpression=Attr('first_name').eq(data['first_name']) &
                         Attr('last_name').eq(data['last_name']) &
                         Attr('birth_date').eq(data['birth_date']) &
                         Attr('location').eq(data['location'])
    )

    if response['Items']:
        # If the user exists, get the user_id
        user_id = response['Items'][0]['user_id']
    else:
        # If the user does not exist, create a new user_id
        user_id = str(uuid.uuid4())

    # Generate the astrology report
    report = generate_astrology_report(
        data['first_name'], data['last_name'],
        data['birth_date'], data['birth_time'],
        data['location'], data['timezone']
    )

    # Save or overwrite the user data and the report
    users_table.put_item(
        Item={
            'user_id': user_id,
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'birth_date': data['birth_date'],
            'location': data['location'],
            'report': report  # Save the report in the user data
        }
    )

    return jsonify({'message': 'User data and report saved successfully!'})


# Endpoint to track visitors
@app.route('/track_visitor', methods=['POST'])
def track_visitor():
    ip_address = request.remote_addr
    visitors_table.update_item(
        Key={'ip_address': ip_address},
        UpdateExpression="ADD visit_count :inc",
        ExpressionAttributeValues={':inc': 1},
        ReturnValues="UPDATED_NEW"
    )
    return jsonify({'message': 'Visitor tracked successfully!'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)