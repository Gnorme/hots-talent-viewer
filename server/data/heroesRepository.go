package data

import (
	"github.com/gnorme/talentviewer/models"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	//"time"
)

type HeroesRepo struct {
	C *mgo.Collection
}

func (r *HeroesRepo) Create(hero *models.Hero) error {
	//obj_id := bson.NewObjectId()
	//hero.Id = obj_id
	//task.CreatedOn = time.Now()
	//task.Status = "Created"
	err := r.C.Insert(&hero)
	return err
}

func (r *HeroesRepo) GetAll() []models.Hero {
	var heroes []models.Hero
	iter := r.C.Find(nil).Iter()
	result := models.Hero{}
	for iter.Next(&result) {
		heroes = append(heroes, result)
	}
	return heroes
}

func (r *HeroesRepo) Update(hero *models.Hero) error {
	err := r.C.Update(bson.M{"name": hero.Name},
		bson.M{"$set": bson.M{"name": hero.Name, "keys": hero.Keys, "keyholes": hero.Keyholes}})
	return err
}

func (r *HeroesRepo) Delete(hero string) error {
	err := r.C.Remove(bson.M{"name": hero})
	return err
}
