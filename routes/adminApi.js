const router = require('express').Router()
const { Router } = require('express')
const { verifyToken } = require('../middlewares/authentication')
const { upload } = require('../middlewares/multer')
const {verifyAdminToken} = require('../middlewares/adminAuthentication')

const { adminRegister, adminLogin, postEvent } = require('../controllers/adminController')

//Authentication
router.post('/adminregister', upload.single("profilePicture"), adminRegister)
router.post('/adminlogin', adminLogin)



//Events
router.post('/postevent', verifyAdminToken, upload.array('eventPicture', 12), postEvent)



module.exports = router;