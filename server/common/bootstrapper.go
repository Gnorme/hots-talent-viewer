package common

func StartUp() {
	//Init AppConfig
	initConfig()
	// Init private/public keys for JWT authentication
	initKeys()
	//Start DB session
	createDBSession()
	//Add indexes to DB
	addIndexes()
}
