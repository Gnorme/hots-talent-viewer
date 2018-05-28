package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gnorme/talentviewer/common"
	"github.com/gnorme/talentviewer/data"
	//"github.com/gnorme/talentviewer/models"
	"github.com/gorilla/mux"
)

func AddTalents(w http.ResponseWriter, r *http.Request) {
	var dataResource TalentsResource

	err := json.NewDecoder(r.Body).Decode(&dataResource)
	if err != nil {
		common.DisplayAppError(w, err, "Invalid talent data", 500)
		return
	}
	talentModel := &dataResource.Data
	context := NewContext()
	defer context.Close()
	col := context.DbCollection("talents")
	repo := &data.TalentsRepo{col}
	repo.Create(talentModel)
	j, err := json.Marshal(talentModel)
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(j)
}
func GetTalents(w http.ResponseWriter, r *http.Request) {
	//get id from url
	vars := mux.Vars(r)
	hero := vars["hero"]
	level, _ := strconv.Atoi(vars["lvl"])
	//get db session
	context := NewContext()
	defer context.Close()
	col := context.DbCollection("talents")
	repo := &data.TalentsRepo{col}
	talents, _ := repo.GetTalents(hero, level)
	j, err := json.Marshal(TalentsResource{Data: talents})
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	w.Write(j)
}
func GetAllTalents(w http.ResponseWriter, r *http.Request) {
	context := NewContext()
	defer context.Close()
	col := context.DbCollection("talents")
	repo := &data.TalentsRepo{col}
	talents := repo.GetAll()
	j, err := json.Marshal(Talents{Data: talents})
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(j)
}
func UpdateTalent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hero := vars["hero"]
	level, _ := strconv.Atoi(vars["lvl"])
	//name := vars["name"]
	var dataResource TalentResource
	err := json.NewDecoder(r.Body).Decode(&dataResource)
	if err != nil {
		common.DisplayAppError(w, err, "Invalid task data", 500)
		return
	}
	talent := &dataResource.Data
	context := NewContext()
	defer context.Close()
	col := context.DbCollection("talents")
	repo := &data.TalentsRepo{col}
	if err := repo.Update(hero, level, talent); err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func DeleteTalent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hero := vars["hero"]
	level := vars["lvl"]
	name := vars["name"]

	context := NewContext()
	defer context.Close()

	col := context.DbCollection("talents")
	repo := &data.TalentsRepo{col}
	err := repo.Delete(hero, level, name)
	if err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
