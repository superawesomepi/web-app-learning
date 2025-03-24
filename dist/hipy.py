#!/home/kastpradmin/kastpr.craggypeak.com/venv/bin/python3

import mysql.connector
import json
import sys
from random import randrange

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

def upload(mydb, state):
    my_cursor = mydb.cursor()
    dataList = []
    for key,value in state.items():
        dataList.append(value)
    my_sql = f"INSERT INTO kanji_strokes.inputs VALUES (\"{dataList[0]}\", \"{dataList[1]}\", \"{dataList[2]}\");"
    my_cursor.execute(my_sql)
    mydb.commit()
    return dataList

def fetch(mydb, kanjiName):
    my_cursor = mydb.cursor()
    my_sql = f"SELECT kanjiValue FROM kanji_strokes.sourceKanji WHERE kanjiName = \"{kanjiName}\";"
    my_cursor.execute(my_sql)
    return my_cursor.fetchall()

def grade(mydb, state):
    my_cursor = mydb.cursor()
    dataList = []
    for key,value in state.items():
        dataList.append(value)
    firstKanji = dataList[0]
    secondKanji = dataList[1]
    # now we can compare the two kanji

    return randrange(100)
                                
mydb = dbconnect()
#upload(mydb)
#result = fetch(mydb, "roku_4")
request = json.load(sys.stdin)
if request['action'] == "upload":
    result = upload(mydb, request['state'])
elif request['action'] == "fetch":
    result = fetch(mydb, "roku_4")
elif request['action'] == "grade":
    result = grade(mydb, request['state'])
else:    
    result = show(mydb)
#sendResponse({"foo": "bar"})
sendResponse(result)