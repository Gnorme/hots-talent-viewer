package routers

import (
	"github.com/codegangsta/negroni"
	"github.com/gnorme/talentviewer/common"
	"github.com/gnorme/talentviewer/controllers"
	"github.com/gorilla/mux"
)

func SetTalentRoutes(router *mux.Router) *mux.Router {
	//talentRouter := mux.NewRouter()
	editRouter := mux.NewRouter()
	editRouter.HandleFunc("/edit/{hero}/{lvl}", controllers.UpdateTalent).Methods("PUT")
	editRouter.HandleFunc("/edit/{hero}/{lvl}", controllers.DeleteTalent).Methods("DELETE")
	router.HandleFunc("/talents", controllers.GetAllTalents).Methods("GET")
	//talentRouter.HandleFunc("/talents", controllers.AddTalents).Methods("POST")
	router.HandleFunc("/talents/{hero}/{lvl}", controllers.GetTalents).Methods("GET")
	router.PathPrefix("/edit").Handler(negroni.New(
		negroni.HandlerFunc(common.Authorize),
		negroni.Wrap(editRouter),
	))
	return router
}
