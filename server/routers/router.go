package routers

import (
	"github.com/gorilla/mux"
)

func InitRoutes() *mux.Router {
	router := mux.NewRouter().StrictSlash(false)
	router = SetHeroRoutes(router)
	router = SetTalentRoutes(router)
	router = SetAdminRoutes(router)
	return router
}
