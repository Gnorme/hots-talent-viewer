package controllers

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"

	"github.com/gnorme/talentviewer/common"
	"github.com/gnorme/talentviewer/data"
	"github.com/gnorme/talentviewer/models"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var dataResource LoginResource
	var token string
	// Decode the incoming Login json
	err := json.NewDecoder(r.Body).Decode(&dataResource)
	if err != nil {
		common.DisplayAppError(w, err, "Invalid Login data", 500)
		return
	}
	//email + pass
	loginModel := dataResource.Data
	loginUser := models.User{
		Email:    loginModel.Email,
		Password: loginModel.Password,
	}
	//Get db session
	context := NewContext()
	defer context.Close()
	c := context.DbCollection("users")
	repo := &data.UserRepo{c}
	//Authenticate login
	if user, err := repo.Login(loginUser); err != nil {
		common.DisplayAppError(w, err, "Invalid login credentials", 401)
		return
	} else { //if successful
		//Generate JWT Token

		token, err = common.GenerateJWT(user.Email, "member")
		if err != nil {
			common.DisplayAppError(w, err, "Error while generating the access token", 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		user.HashPassword = nil
		authUser := models.AuthUser{
			User:  user,
			Token: token,
		}
		j, err := json.Marshal(AuthUserResource{Data: authUser})
		if err != nil {
			common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
			return
		}
		//w.Header().Add("Access-Control-Allow-Origin", "*")
		//w.Header().Set("Access-Control-Allow-Origin", "*")
		w.WriteHeader(http.StatusOK)
		w.Write(j)
	}
}

//Add a new User document
func Register(w http.ResponseWriter, r *http.Request) {
	var dataResource UserResource
	//Decode incoming User json
	err := json.NewDecoder(r.Body).Decode(&dataResource)
	if err != nil {
		common.DisplayAppError(w, err, "Invalid User data", 500)
		return
	}
	user := &dataResource.Data

	//Validate email
	if EmailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`); !EmailRegex.MatchString(user.Email) {
		common.DisplayAppError(w, errors.New("Invalid Email"), "Invalid Email", 401)
		return
	}

	//Validate password restrictions
	if len(user.Password) < 8 {
		common.DisplayAppError(w, errors.New("Invalid Password"), "Password is too short", 401)
		return
	} else if DigRegex := regexp.MustCompile(`\d+`); !DigRegex.MatchString(user.Password) {
		common.DisplayAppError(w, errors.New("Invalid Password"), "Password needs at least 1 number", 401)
		return
	} else if CharRegex := regexp.MustCompile(`[A-Za-z]+`); !CharRegex.MatchString(user.Password) {
		common.DisplayAppError(w, errors.New("Invalid Password"), "Password needs at least 1 letter", 401)
		return
	}

	if len(user.FirstName) < 1 || len(user.LastName) < 1 {
		common.DisplayAppError(w, errors.New("Too short"), "Invalid User data", 401)
		return
	}
	//Get DB session
	context := NewContext()
	defer context.Close()
	//creates collection object
	c := context.DbCollection("users")
	repo := &data.UserRepo{c}
	repo.CreateUser(user)
	//eliminate hashpassword from response
	user.HashPassword = nil
	if j, err := json.Marshal(UserResource{Data: *user}); err != nil {
		common.DisplayAppError(w, err, "An unexpected error has occurred", 500)
		return
	} else {
		w.Header().Set("Content-Type", "application/json")
		//w.Header().Add("Access-Control-Allow-Origin", "*")
		//w.Header().Set("Access-Control-Allow-Origin", "*")
		w.WriteHeader(http.StatusCreated)
		w.Write(j)
	}
}
func AdminPanel(w http.ResponseWriter, r *http.Request) {

}
