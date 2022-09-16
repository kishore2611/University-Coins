const router = require('express').Router()
const { Router } = require('express')
const { verifyToken } = require('../middlewares/authentication')
const { upload } = require('../middlewares/multer')



const { register, login, verifyUser, logOut, resendCode, forgotPassword, verifyCode, resetPassword, updatePassword, socialLogin } = require('../controllers/authController')
const { getUser, editUser } = require('../controllers/userController')
const { getContent, favourite, getNotifications } = require('../controllers/commonController')
const { getEvents, currentEvents, upcommingEvents, previousEvents, getSingleEvent, getfavorites, getPoints } = require('../controllers/eventController')

//Authentication
router.post('/register', upload.single("profilePicture"), register)
router.post('/verifyUser', verifyUser)
router.post('/resendCode', resendCode)
router.post('/login', login)
router.post('/forgotPassword', forgotPassword)
router.post('/verifyCode', verifyCode)
router.post('/resetPassword', resetPassword)
router.post('/updatePassword', verifyToken, updatePassword)
router.post('/logOut', verifyToken, logOut)
router.post('/socialLogin', socialLogin)


//User
router.get('/userDetail', verifyToken, getUser)
router.put('/editUser', verifyToken, upload.single('profilePicture'), editUser)


//Events
router.get('/getevents', verifyToken, getEvents)
router.get('/currentevents', currentEvents)
router.get('/upcommingevents', upcommingEvents)
router.get('/previousevents', previousEvents)
router.get('/singleevent/:id', getSingleEvent)
router.post('/getpoints',verifyToken, getPoints)



//Favourite
router.post('/favourites', verifyToken, favourite)
router.get('/getfavourites', verifyToken, getfavorites)

//Notifications
router.get('/getnotifications', verifyToken, getNotifications)
     

//Content
router.get('/get-content/:type', getContent);


module.exports = router;