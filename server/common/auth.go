package common

import (
	"context"
	"crypto/rsa"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	request "github.com/dgrijalva/jwt-go/request"
)

const (
	privKeyPath = "keys/app.rsa"
	pubKeyPath  = "keys/app.rsa.pub"
)

var (
	verifyKey *rsa.PublicKey
	signKey   *rsa.PrivateKey
)

type AppClaims struct {
	UserName string `json:"username"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

func initKeys() {
	signBytes, err := ioutil.ReadFile(privKeyPath)
	if err != nil {
		log.Fatalf("[initKeys]: %s\n", err)
	}
	signKey, err = jwt.ParseRSAPrivateKeyFromPEM(signBytes)
	if err != nil {
		log.Fatalf("[initKeys]: %s\n", err)
	}
	verifyBytes, err := ioutil.ReadFile(pubKeyPath)
	if err != nil {
		log.Fatalf("[initKeys]: %s\n", err)
	}
	verifyKey, err = jwt.ParseRSAPublicKeyFromPEM(verifyBytes)
	if err != nil {
		log.Fatalf("[initKeys]: %s\n", err)
		panic(err)
	}
}

func GenerateJWT(name, role string) (string, error) {
	claims := AppClaims{
		name,
		role,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Minute * 60).Unix(),
			Issuer:    "admin",
		},
	}
	log.Println("before token")
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	log.Println("before key")
	ss, err := token.SignedString(signKey)
	if err != nil {
		return "", err
	}
	log.Println("after key")
	return ss, nil
}

func Authorize(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	//validate token
	token, err := request.ParseFromRequestWithClaims(r, request.OAuth2Extractor, &AppClaims{}, func(token *jwt.Token) (interface{}, error) {
		return verifyKey, nil
	})

	if err != nil {
		switch err.(type) {
		case *jwt.ValidationError:
			vErr := err.(*jwt.ValidationError)

			switch vErr.Errors {
			case jwt.ValidationErrorExpired:
				DisplayAppError(w, err, "Access Token is expired, get a new one", 401)
				return
			default:
				DisplayAppError(w, err, "Error while parsing access token", 500)
				return
			}
		default:
			DisplayAppError(w, err, "Error while parsing access token", 500)
			return
		}
	}
	if claims, ok := token.Claims.(*AppClaims); ok && token.Valid {
		//log.Println(claims.UserName)
		//w.Header().Add("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
		ctx := context.WithValue(r.Context(), "user", claims.UserName)
		next(w, r.WithContext(ctx))
	} else {
		DisplayAppError(w, err, "Invalid access token", 401)
	}
}
