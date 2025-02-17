import mysql.connector
import json
import sys

def dbconnect():
    mydb = mysql.connector.connect(
        host = "mysql.craggypeak.com",
        user = "kanjiuser  ",
        passwd = "hiraganakatakana",
        database = "kanji_strokes"
    )   
    return mydb

def sendResponse (json_object):
    print("Status: 200 OK")
    print("Content-type: application/json")
    print()
    print(json.dumps(json_object))

def purge(mydb):
    my_cursor = mydb.cursor()
    my_cursor.execute("DELETE FROM kanji_strokes.allKanjiStrokes;")

def insert(mydb):
    my_cursor = mydb.cursor()
    my_sql = f"INSERT INTO `kanji_strokes`.`allKanjiStrokes` (`KanjiName`, `Filename`, `KanjiFile`) VALUES ('1', '2', '3');"
    my_cursor.execute(my_sql)

def show(mydb):
    my_cursor = mydb.cursor()
    my_cursor.execute("SELECT * FROM kanji_strokes.allKanjiStrokes;")
    records = my_cursor.fetchall()
    result = {}
    for record in records:
        result[record[0]] = record[1]
    return result

def upload(mydb):
    my_cursor = mydb.cursor()
    my_sql = f"INSERT INTO kanji_strokes.inputs (userInputs) VALUES ('1');"
    my_cursor.execute(my_sql)
    mydb.commit()
    #return value
                                
mydb = dbconnect()
upload(mydb)
request = json.load(sys.stdin)
if request['action'] == "upload":
    result = upload(mydb, request['state'])
else:    
    result = show(mydb)
sendResponse(result)