package data

import (
	"errors"
	"github.com/gnorme/talentviewer/models"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type UserRepo struct {
	C *mgo.Collection
}

func (r *UserRepo) CreateUser(user *models.User) error {
	obj_id := bson.NewObjectId()
	user.Id = obj_id
	hpass, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	user.HashPassword = hpass
	//Clear text password
	user.Password = ""
	err = r.C.Insert(&user)
	return err
}
func (r *UserRepo) Login(user models.User) (u models.User, err error) {
	if len(user.Email) < 3 || len(user.Password) < 3 {
		return models.User{}, errors.New("Too short")
	}
	err = r.C.Find(bson.M{"email": user.Email}).One(&u)
	if err != nil {
		return
	}
	//validate password
	err = bcrypt.CompareHashAndPassword(u.HashPassword, []byte(user.Password))
	if err != nil {
		u = models.User{}
	}
	return
}
