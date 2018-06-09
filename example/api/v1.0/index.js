import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import example from './example';
import customer from './customer';
import contact from './contact';
import service from './service';
import _package from './package';


const router = express.Router();
const multerParser = multer();

if (process.env.NODE_ENV === 'localhost') {
    router.use(cors());
}

/**
 * Các route phía dưới dùng cho truy vấn api bình thường
 */
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());
router.use(multerParser.array());

/**
 * @apiDefine LoginToken
 * @apiHeader {String} x-token-key login token của user 
 */

router.use('/example', example);
router.use('/customer', customer);
router.use('/contact', contact);
router.use('/service', service);
router.use('/package', _package);

router.use(function(req, res) {
    let error = {
        code: 404,
        message: 'api không tồn tại'
    };
    return res.status(404).set('Content-Type', 'application/json').send(JSON.stringify(error, null, 2));
});

export default router;