package routers

import (
	//"github.com/codegangsta/negroni"
	//"github.com/gnorme/talentviewer/common"
	"github.com/gnorme/talentviewer/controllers"
	"github.com/gorilla/mux"
)

func SetHeroRoutes(router *mux.Router) *mux.Router {
	//heroRouter := mux.NewRouter()
	router.HandleFunc("/heroes", controllers.GetHeroes).Methods("GET")
	//heroRouter.HandleFunc("/heroes", controllers.AddHero).Methods("POST")
	//heroRouter.HandleFunc("/heroes", controllers.UpdateHero).Methods("PUT")
	//heroRouter.HandleFunc("/heroes/{hero}", controllers.DeleteHero).Methods("DELETE")
	//router.PathPrefix("/heroes").Handler(negroni.New(
	//	negroni.Wrap(heroRouter),
	//))
	return router
}
