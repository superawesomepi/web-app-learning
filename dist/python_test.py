#!/home/kastpradmin/kastpr.craggypeak.com/venv/bin/python3

import json

#******************************************************************************

def send_response (json_object):
    print("Status: 200 OK")
    print("Content-type: application/json")
    print()
    print(json.dumps(json_object))

#******************************************************************************

send_response({"foo": "bar"})