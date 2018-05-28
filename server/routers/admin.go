package routers

import (
	"github.com/codegangsta/negroni"
	"github.com/gnorme/talentviewer/common"
	"github.com/gnorme/talentviewer/controllers"
	"github.com/gorilla/mux"
)

func SetAdminRoutes(router *mux.Router) *mux.Router {
	adminRouter := mux.NewRouter()
	adminRouter.HandleFunc("/admin", controllers.AdminPanel).Methods("GET")
	router.HandleFunc("/login", controllers.Login).Methods("POST")
	router.HandleFunc("/register", controllers.Register).Methods("POST")
	router.PathPrefix("/admin").Handler(negroni.New(
		negroni.HandlerFunc(common.Authorize),
		negroni.Wrap(adminRouter),
	))
	return router
}
