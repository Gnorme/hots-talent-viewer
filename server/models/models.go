package models

import (
	"gopkg.in/mgo.v2/bson"
)

type (
	Hero struct {
		Name     string  `json:"Name"`
		Keys     [][]int `json:"Keys"`
		Keyholes [][]int `json:"Keyholes"`
	}
	Talents struct {
		Hero     string   `json:"Hero"`
		Level    int      `json:"Level"`
		Talents  []Talent `json:"Talents"`
		Keyholes [][]int  `json:"Keyholes"`
	}
	Talent struct {
		Name        string  `json:"Name"`
		Keys        [][]int `json:"Keys"`
		Description string  `json:"Description"`
	}
	Login struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	AuthUser struct {
		User  User   `json:"user"`
		Token string `json:"token"`
	}
	User struct {
		Id           bson.ObjectId `bson:"_id,omitempty" json:"id"`
		FirstName    string        `json:"firstname"`
		LastName     string        `json:"lastname"`
		Email        string        `json:"email"`
		Password     string        `json:"password,omitempty"`
		HashPassword []byte        `json:"hashpassword,omitempty"`
	}
)
