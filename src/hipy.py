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
    results = my_cursor.fetchall()
    print(results)
                                
mydb = dbconnect()
purge(mydb)
insert(mydb)
mydb.commit()
show(mydb)