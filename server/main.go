package main

import (
	"log"
	"net/http"

	"github.com/codegangsta/negroni"
	//"github.com/gorilla/handlers"
	"github.com/gnorme/talentviewer/common"
	"github.com/gnorme/talentviewer/routers"
	"github.com/rs/cors"
)

func main() {
	//Startup logic
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	common.StartUp()
	router := routers.InitRoutes()
	n := negroni.Classic()
	n.UseHandler(router)
	server := &http.Server{
		Addr:    common.AppConfig.Server,
		Handler: c.Handler(n),
	}
	log.Println("Listening...")
	server.ListenAndServe()
}
