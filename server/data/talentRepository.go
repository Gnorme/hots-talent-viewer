package data

import (
	"github.com/gnorme/talentviewer/models"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	//"time"
	//"log"
)

type TalentsRepo struct {
	C *mgo.Collection
}

func (r *TalentsRepo) Create(talents *models.Talents) error {
	//obj_id := bson.NewObjectId()
	//talent.Id = obj_id
	err := r.C.Insert(&talents)
	return err
}
func (r *TalentsRepo) GetAll() []models.Talents {
	var talents []models.Talents
	iter := r.C.Find(nil).Iter()
	result := models.Talents{}
	for iter.Next(&result) {
		talents = append(talents, result)
	}
	return talents
}
func (r *TalentsRepo) GetTalents(hero string, level int) (talents models.Talents, err error) {
	err = r.C.Find(bson.M{"hero": hero, "level": level}).One(&talents)
	return
}
func (r *TalentsRepo) Update(hero string, level int, talent *models.Talent) error {
	err := r.C.Update(bson.M{"hero": hero, "level": level, "talents.name": talent.Name},
		bson.M{"$set": bson.M{"talents.$.description": talent.Description}})
	return err
}
func (r *TalentsRepo) Delete(hero string, level string, name string) error {
	err := r.C.Remove(bson.M{"hero": hero, "level": level, "talents.name": name})
	return err
}
