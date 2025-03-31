#!/home/kastpradmin/kastpr.craggypeak.com/venv/bin/python3

import mysql.connector
import json
import sys
from random import randrange
import statistics

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
    firstKanji = dataList[0] # because javascript arrays are compatible with python lists direct assignment is fine
    secondKanji = dataList[1]
    leeway = dataList[2]
    scores = []
    # now we can compare the two kanji
    # first off, if stroke count doesn't match just return 0
    if(len(firstKanji) != len(secondKanji)): return 0

    # now we need to convert all of these coordinates, which are strings, to integers
    for stroke in firstKanji:
        for point in stroke:
            point[0] = round(float(point[0]))
            point[1] = round(float(point[1]))
    for stroke in secondKanji:
        for point in stroke:
            point[0] = round(float(point[0]))
            point[1] = round(float(point[1]))

    # and now for each stroke
    for strokeNum, stroke in enumerate(firstKanji):
        # first off, we need to check if stroke direction is correct
        direction = True
        first = firstKanji[strokeNum][0]
        last = firstKanji[strokeNum][-1]
        xExpectation = 0
        yExpectation = 0
        # for x and y, check whether these are constant, positive, or negative change
        xChange = last[0]-first[0]
        # if we expect this to be constant, we will just keep this at 0, so that's fine
        #if(xChange > leeway): # otherwise check sign
        yChange = last[1]-first[1]
        #if(yChange > leeway):
        # ok now we know what we should be expecting, so let's compare this to the user input
        uFirst = secondKanji[strokeNum][0]
        uLast = secondKanji[strokeNum][-1]
        ux = 0
        uy = 0
        uxChange = uLast[0]-uFirst[0]
        # ok now let's see if it matches
        #if(uxChange < leeway and xExpectation!=0): direction = False # we expected it to stay constant and it didn't
        if(get_sign(xChange)!=get_sign(uxChange)): direction = False # the stroke direction didn't match what we expected
        # and do the same for y
        uyChange = uLast[1]-uFirst[1]
        #if(uyChange < leeway and yExpectation!=0): direction = False
        if(get_sign(yChange)!=get_sign(uyChange)): direction = False
        # if direction is still True, we know stroke direction matched so we can go on, otherwise this stroke is wrong
        if(not direction):
            scores.append(0)
        else:
            # finally, we can actually do the comparison
            correct = 0
            incorrect = 0
            for point in stroke: # for each point in the first kanji
                match = False
                for coordinate in secondKanji[strokeNum]: # compare to all points in the second kanji in that stroke
                    if(abs(coordinate[0]-point[0]) < leeway and abs(coordinate[1]-point[1] < leeway)): match = True # if both x and y are in range of leeway this point matches
                if(match): correct+=1
                else: incorrect+=1

            # now we have number of incorrect and correct for this stroke, we can give it a score
            totalPoints = correct+incorrect
            correctness = correct/totalPoints
            scores.append(correctness*100) # append the score for each stroke

    # now we have a score for each individual stroke, find the average and return that as the overall score
    average = statistics.mean(scores)
    scores.append(average)
    return scores

def get_sign(number):
    """
    This function acts as the cmp function but against
    specifically 0, such that it will return -1, 0, or 1
    for a negative, 0, or positive number

    :param number: the number to get the sign of
    :returns: the sign
    """
    if (number>0):
        return 1
    elif (number<0):
        return -1
    else:
        return 0
                                
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