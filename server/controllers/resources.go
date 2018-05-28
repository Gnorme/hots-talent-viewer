package controllers

import (
	"github.com/gnorme/talentviewer/models"
)

type (
	HeroesResource struct {
		Data models.Hero `json:"Hero"`
	}
	Heroes struct {
		Data []models.Hero `json:"Heroes"`
	}
	Talents struct {
		Data []models.Talents `json:"data"`
	}
	TalentsResource struct {
		Data models.Talents `json:"data"`
	}
	TalentResource struct {
		Data models.Talent `json:"data"`
	}
	LoginResource struct {
		Data models.Login `json:"data"`
	}
	AuthUserResource struct {
		Data models.AuthUser `json:"data"`
	}
	UserResource struct {
		Data models.User `json:"data"`
	}
)
