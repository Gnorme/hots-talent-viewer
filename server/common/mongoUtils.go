package common

import (
	"gopkg.in/mgo.v2"
	"log"
	"time"
)

var session *mgo.Session

func GetSession() *mgo.Session {
	if session == nil {
		var err error
		session, err = mgo.DialWithInfo(&mgo.DialInfo{
			Addrs:    []string{AppConfig.MongoDBHost},
			Username: AppConfig.DBUser,
			Password: AppConfig.DBPwd,
			Timeout:  60 * time.Second,
		})
		if err != nil {
			log.Fatalf("[GetSession]: %s\n", err)
		}
	}
	return session
}
func createDBSession() {
	var err error
	session, err = mgo.DialWithInfo(&mgo.DialInfo{
		Addrs:    []string{AppConfig.MongoDBHost},
		Username: AppConfig.DBUser,
		Password: AppConfig.DBPwd,
		Timeout:  60 * time.Second,
	})
	if err != nil {
		log.Fatalf("[createDBSession]: %s\n", err)
	}
}
func addIndexes() {
	var err error
	heroIndex := mgo.Index{
		Key:        []string{"name"},
		Unique:     false,
		Background: true,
		Sparse:     true,
	}

	//Add indexes to DB
	session := GetSession().Copy()
	defer session.Close()
	heroCol := session.DB(AppConfig.Database).C("heroes")
	err = heroCol.EnsureIndex(heroIndex)
	if err != nil {
		log.Fatalf("[addIndexes]: %s\n", err)
	}

}
