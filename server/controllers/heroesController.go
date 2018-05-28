package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gnorme/talentviewer/common"
	"github.com/gnorme/talentviewer/data"
	//"github.com/gnorme/talentviewer/models"
	"github.com/gorilla/mux"
)

func AddHero(w http.ResponseWriter, r *http.Request) {
	var dataResource HeroesResource
	// Decode the incoming Note json
	err := json.NewDecoder(r.Body).Decode(&dataResource)
	if err != nil {
		common.DisplayAppError(w, err, "Invalid Hero data", 500)
		return
	}
	hero := &dataResource.Data
	//hero := &models.Hero{
	//	Name:     heroModel.Name,
	//	Keys:     heroModel.Keys,
	//	Keyholes: heroModel.Keyholes,
	//}
	log.Println(hero.Name)
	context := NewContext()
	defer context.Close()
	col := context.DbCollection("heroes")
	//Insert a note document
	repo := &data.HeroesRepo{C: col}
	repo.Create(hero)
	j, err := json.Marshal(hero)
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(j)
}
func GetHeroes(w http.ResponseWriter, r *http.Request) {
	context := NewContext()
	defer context.Close()
	c := context.DbCollection("heroes")
	repo := &data.HeroesRepo{c}
	heroes := repo.GetAll()
	j, err := json.Marshal(Heroes{heroes})
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(j)
}
func UpdateHero(w http.ResponseWriter, r *http.Request) {
	var dataResource HeroesResource

	err := json.NewDecoder(r.Body).Decode(&dataResource)
	if err != nil {
		common.DisplayAppError(w, err, "Invalid Hero data", 500)
		return
	}
	hero := &dataResource.Data

	context := NewContext()
	defer context.Close()

	col := context.DbCollection("heroes")
	repo := &data.HeroesRepo{col}
	repo.Update(hero)

	j, err := json.Marshal(hero)
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(j)
}
func DeleteHero(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hero := vars["hero"]
	context := NewContext()
	defer context.Close()

	col := context.DbCollection("heroes")
	repo := &data.HeroesRepo{col}
	err := repo.Delete(hero)
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
